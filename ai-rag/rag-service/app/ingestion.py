"""Chunking → embedding → Qdrant upsert, szigorú tenant/user payloaddal."""
from __future__ import annotations

import uuid

import httpx
from langchain_text_splitters import RecursiveCharacterTextSplitter
from qdrant_client import AsyncQdrantClient, models

from .config import settings
from .loaders import extract_text

_splitter = RecursiveCharacterTextSplitter(
    chunk_size=settings.chunk_size,
    chunk_overlap=settings.chunk_overlap,
    separators=["\n\n", "\n", ". ", " ", ""],
)

qdrant = AsyncQdrantClient(url=settings.qdrant_url)


async def ensure_collection() -> None:
    """Kollekció + payload indexek létrehozása (idempotens, app-indításkor fut)."""
    if not await qdrant.collection_exists(settings.qdrant_collection):
        # bge-m3 → 1024 dimenzió
        await qdrant.create_collection(
            collection_name=settings.qdrant_collection,
            vectors_config=models.VectorParams(
                size=1024, distance=models.Distance.COSINE
            ),
        )
    # Keyword payload indexek: a tenant/user szűrés így index-alapú, nem scan
    for field in ("tenant_id", "user_id", "document_id"):
        try:
            await qdrant.create_payload_index(
                collection_name=settings.qdrant_collection,
                field_name=field,
                field_schema=models.PayloadSchemaType.KEYWORD,
            )
        except Exception:
            pass  # már létezik


async def embed_texts(texts: list[str], client: httpx.AsyncClient) -> list[list[float]]:
    """Ollama /api/embed — natívan batch-képes."""
    resp = await client.post(
        f"{settings.ollama_base_url}/api/embed",
        json={"model": settings.ollama_embed_model, "input": texts},
        timeout=300.0,
    )
    resp.raise_for_status()
    return resp.json()["embeddings"]


async def ingest_document(
    *, tenant_id: str, user_id: str, document_id: str, filename: str, data: bytes
) -> int:
    """Feldolgozza a dokumentumot; a beszúrt chunkok számával tér vissza."""
    # 1) Szövegkinyerés streamelve, globális karakterplafonnal
    sections: list[str] = []
    total = 0
    for section in extract_text(filename, data):
        total += len(section)
        if total > settings.max_document_chars:
            sections.append(section[: settings.max_document_chars - (total - len(section))])
            break
        sections.append(section)

    chunks = _splitter.split_text("\n".join(sections))
    if not chunks:
        return 0

    # Fájlnév-prefix minden chunkban: így a fájlnevet említő kérdések
    # ("mit tartalmaz a licensz.txt?") embedding-szinten is találatot adnak
    chunks = [f"[Fájl: {filename}]\n{c}" for c in chunks]

    # 2) Re-ingest esetén a régi vektorok törlése (idempotencia)
    await delete_document(tenant_id=tenant_id, document_id=document_id)

    # 3) Batch embedding + upsert
    inserted = 0
    async with httpx.AsyncClient() as client:
        for i in range(0, len(chunks), settings.embed_batch_size):
            batch = chunks[i : i + settings.embed_batch_size]
            vectors = await embed_texts(batch, client)
            points = [
                models.PointStruct(
                    id=str(uuid.uuid4()),
                    vector=vec,
                    payload={
                        # IZOLÁCIÓS KULCS — minden lekérdezés tenant_id-re szűr
                        # (a tudásbázis cégszintű; a user_id a feltöltő admin)
                        "tenant_id": tenant_id,
                        "user_id": user_id,
                        "document_id": document_id,
                        "filename": filename,
                        "chunk_index": i + j,
                        "text": text,
                    },
                )
                for j, (text, vec) in enumerate(zip(batch, vectors))
            ]
            await qdrant.upsert(
                collection_name=settings.qdrant_collection, points=points, wait=True
            )
            inserted += len(points)
    return inserted


async def delete_document(*, tenant_id: str, document_id: str) -> None:
    """Egy dokumentum összes vektorának törlése — tenant szűréssel,
    hogy idegen tenant dokumentuma véletlenül se legyen törölhető.
    (A jogosultság-ellenőrzés — csak admin törölhet — a Laravel oldalon van.)"""
    await qdrant.delete(
        collection_name=settings.qdrant_collection,
        points_selector=models.FilterSelector(
            filter=models.Filter(
                must=[
                    models.FieldCondition(key="tenant_id", match=models.MatchValue(value=tenant_id)),
                    models.FieldCondition(key="document_id", match=models.MatchValue(value=document_id)),
                ]
            )
        ),
        wait=True,
    )
