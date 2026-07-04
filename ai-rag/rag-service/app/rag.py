"""Retrieval + kontextushoz kötött, streamelt válaszgenerálás."""
from __future__ import annotations

import json
from typing import AsyncIterator

import httpx
from qdrant_client import models

from .config import settings
from .ingestion import embed_texts, qdrant

# Szigorú context-bounding — hallucináció-védelem
SYSTEM_PROMPT = (
    "Te egy vállalati dokumentum-asszisztens vagy. KIZÁRÓLAG a megadott "
    "KONTEXTUS alapján válaszolj, magyarul. Ha a válasz nem található meg a "
    "kontextusban, válaszold pontosan ezt: 'Erre a kérdésre a feltöltött "
    "dokumentumok alapján nem tudok válaszolni.' Ne találj ki információt, "
    "ne használd a saját tudásodat, ne spekulálj. Ha idézel, jelöld meg a "
    "forrás fájlnevét."
)


async def retrieve_context(
    *, tenant_id: str, user_id: str, question: str
) -> list[dict]:
    """Top-K releváns chunk — KÖTELEZŐ tenant+user izolációs szűrővel.

    A filter a szerveroldalon, a Laravel session-ből származó azonosítókkal
    épül. Ez a függvény az egyetlen retrieval-útvonal: szűrő nélküli keresés
    a szolgáltatásban nem létezik.
    """
    async with httpx.AsyncClient() as client:
        query_vec = (await embed_texts([question], client))[0]

    result = await qdrant.query_points(
        collection_name=settings.qdrant_collection,
        query=query_vec,
        limit=settings.top_k,
        score_threshold=settings.score_threshold,
        query_filter=models.Filter(
            must=[
                models.FieldCondition(key="tenant_id", match=models.MatchValue(value=tenant_id)),
                models.FieldCondition(key="user_id", match=models.MatchValue(value=user_id)),
            ]
        ),
        with_payload=True,
    )
    return [
        {"text": p.payload["text"], "filename": p.payload["filename"], "score": p.score}
        for p in result.points
    ]


def build_prompt(question: str, contexts: list[dict], history: list[dict]) -> list[dict]:
    context_block = "\n\n---\n\n".join(
        f"[Forrás: {c['filename']}]\n{c['text']}" for c in contexts
    )
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    # Rövid előzmény (max 6 üzenet) a többfordulós beszélgetéshez
    messages.extend(history[-6:])
    messages.append(
        {
            "role": "user",
            "content": f"KONTEXTUS:\n{context_block}\n\nKÉRDÉS: {question}",
        }
    )
    return messages


async def stream_answer(
    *, tenant_id: str, user_id: str, question: str, history: list[dict]
) -> AsyncIterator[dict]:
    """SSE eseményfolyam: sources → token* → done | error."""
    contexts = await retrieve_context(
        tenant_id=tenant_id, user_id=user_id, question=question
    )

    if not contexts:
        yield {"event": "token", "data": (
            "Erre a kérdésre a feltöltött dokumentumok alapján nem tudok válaszolni."
        )}
        yield {"event": "done", "data": ""}
        return

    yield {
        "event": "sources",
        "data": json.dumps(
            sorted({c["filename"] for c in contexts}), ensure_ascii=False
        ),
    }

    payload = {
        "model": settings.ollama_llm_model,
        "messages": build_prompt(question, contexts, history),
        "stream": True,
        "options": {"temperature": 0.1, "num_ctx": 8192},
    }

    async with httpx.AsyncClient(timeout=httpx.Timeout(300.0, connect=10.0)) as client:
        async with client.stream(
            "POST", f"{settings.ollama_base_url}/api/chat", json=payload
        ) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if not line.strip():
                    continue
                data = json.loads(line)
                token = data.get("message", {}).get("content", "")
                if token:
                    yield {"event": "token", "data": token}
                if data.get("done"):
                    break

    yield {"event": "done", "data": ""}
