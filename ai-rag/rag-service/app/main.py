from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager

import httpx
from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field
from sse_starlette.sse import EventSourceResponse

from .config import settings
from .ingestion import delete_document, ensure_collection, ingest_document
from .rag import stream_answer
from .security import verify_internal_token

logger = logging.getLogger("rag")


async def _warmup_models() -> None:
    """Embedding + LLM betöltése a VRAM-ba induláskor, hogy az első kérdés
    ne fizesse meg a 20-40 mp-es modellbetöltést."""
    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{settings.ollama_base_url}/api/embed",
                json={
                    "model": settings.ollama_embed_model,
                    "input": ["bemelegítés"],
                    "keep_alive": settings.ollama_keep_alive,
                },
                timeout=600.0,
            )
            await client.post(
                f"{settings.ollama_base_url}/api/chat",
                json={
                    "model": settings.ollama_llm_model,
                    "messages": [{"role": "user", "content": "Szia"}],
                    "stream": False,
                    "keep_alive": settings.ollama_keep_alive,
                    # Ugyanaz a num_ctx, mint az éles kéréseknél — különben az
                    # első kérdésnél az eltérő kontextusméret újratöltést okoz
                    "options": {"num_predict": 1, "num_ctx": 16384},
                },
                timeout=600.0,
            )
        logger.info("Modell-bemelegítés kész (embed + LLM a VRAM-ban)")
    except Exception:
        logger.warning("Modell-bemelegítés sikertelen — az első kérdés lassabb lesz")

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".xlsx", ".txt"}
MAX_UPLOAD_BYTES = 20 * 1024 * 1024  # 20 MB — Laravel oldalon is érvényesítve


@asynccontextmanager
async def lifespan(app: FastAPI):
    await ensure_collection()
    warmup = asyncio.create_task(_warmup_models())
    yield
    warmup.cancel()


app = FastAPI(title="RAG Service", docs_url=None, redoc_url=None, lifespan=lifespan)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/ingest", dependencies=[Depends(verify_internal_token)])
async def ingest(
    file: UploadFile = File(...),
    tenant_id: str = Form(...),
    user_id: str = Form(...),
    document_id: str = Form(...),
) -> dict:
    ext = "." + (file.filename or "").rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(422, f"Nem támogatott fájltípus: {ext}")

    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "A fájl túl nagy (max 20 MB).")

    try:
        chunks = await ingest_document(
            tenant_id=tenant_id,
            user_id=user_id,
            document_id=document_id,
            filename=file.filename or "unknown",
            data=data,
        )
    except ValueError as e:
        raise HTTPException(422, str(e))
    except Exception:
        logger.exception("Ingest hiba: doc=%s tenant=%s", document_id, tenant_id)
        raise HTTPException(500, "Feldolgozási hiba")

    return {"status": "ok", "chunks": chunks}


class ChatRequest(BaseModel):
    tenant_id: str = Field(min_length=1, max_length=64)
    user_id: str = Field(min_length=1, max_length=64)  # naplózáshoz; a szűrés tenant-szintű
    question: str = Field(min_length=1, max_length=4000)
    history: list[dict] = Field(default_factory=list, max_length=20)
    filenames: list[str] = Field(default_factory=list, max_length=500)
    with_sources: bool = True  # False: dolgozói nézet, fájlnevek rejtve


@app.post("/chat/stream", dependencies=[Depends(verify_internal_token)])
async def chat_stream(req: ChatRequest) -> EventSourceResponse:
    async def generator():
        try:
            async for event in stream_answer(
                tenant_id=req.tenant_id,
                question=req.question,
                history=req.history,
                filenames=req.filenames,
                with_sources=req.with_sources,
            ):
                yield event
        except Exception:
            logger.exception("Chat stream hiba: tenant=%s", req.tenant_id)
            yield {"event": "error", "data": "Belső hiba történt."}

    return EventSourceResponse(generator())


@app.delete("/documents/{document_id}", dependencies=[Depends(verify_internal_token)])
async def remove_document(document_id: str, tenant_id: str) -> dict:
    await delete_document(tenant_id=tenant_id, document_id=document_id)
    return {"status": "deleted"}
