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
    "KONTEXTUS alapján válaszolj, magyarul. Ne találj ki információt, "
    "ne használd a saját tudásodat, ne spekulálj. Ha idézel, jelöld meg a "
    "forrás fájlnevét.\n"
    "- Ha a felhasználó egy dokumentum tartalmáról vagy összefoglalásáról "
    "kérdez, foglald össze a kontextusban szereplő szöveget a saját "
    "szavaiddal — ez megengedett, mert a kontextusból dolgozol.\n"
    "- Ha a felhasználó arról kérdez, milyen dokumentumok érhetők el vagy "
    "miről kérdezhet, sorold fel az 'Elérhető dokumentumok' listát és "
    "röviden a kontextusban látható tartalmukat.\n"
    "- KIZÁRÓLAG akkor, ha a kérdésre tényleg semmilyen válasz nem "
    "adható a kontextus alapján, válaszold pontosan ezt: 'Erre a kérdésre "
    "a feltöltött dokumentumok alapján nem tudok válaszolni.'"
)


def _mentioned_filenames(texts: list[str], filenames: list[str]) -> list[str]:
    """Mely feltöltött fájlokat említi a kérdés (vagy a friss előzmény)?

    Kiterjesztés nélküli törzsre is illesztünk ("licensz" ↔ licensz.txt).
    """
    haystack = " ".join(texts).lower()
    hits = []
    for fn in filenames:
        stem = fn.rsplit(".", 1)[0].lower()
        if fn.lower() in haystack or (len(stem) >= 4 and stem in haystack):
            hits.append(fn)
    return hits


async def retrieve_context(
    *, tenant_id: str, user_id: str, question: str,
    history: list[dict], filenames: list[str],
) -> list[dict]:
    """Top-K releváns chunk — KÖTELEZŐ tenant+user izolációs szűrővel.

    A filter a szerveroldalon, a Laravel session-ből származó azonosítókkal
    épül. Ez a függvény az egyetlen retrieval-útvonal: szűrő nélküli keresés
    a szolgáltatásban nem létezik.
    """
    # Követő kérdések ("mikor kelt ez a dokumentum?") — az utolsó user-üzenet
    # bevonása a lekérdezésbe és a fájlnév-felismerésbe
    last_user = [m["content"] for m in history if m.get("role") == "user"][-1:]
    query_text = question if not last_user else f"{last_user[0]}\n{question}"

    must = [
        models.FieldCondition(key="tenant_id", match=models.MatchValue(value=tenant_id)),
        models.FieldCondition(key="user_id", match=models.MatchValue(value=user_id)),
    ]

    # Ha a kérdés konkrét fájlt említ, arra szűkítünk — megengedőbb küszöbbel
    mentioned = _mentioned_filenames([question] + last_user, filenames)
    threshold = settings.score_threshold
    if mentioned:
        must.append(
            models.FieldCondition(
                key="filename", match=models.MatchAny(any=mentioned)
            )
        )
        threshold = settings.filename_score_threshold

    async with httpx.AsyncClient() as client:
        query_vec = (await embed_texts([query_text], client))[0]

    result = await qdrant.query_points(
        collection_name=settings.qdrant_collection,
        query=query_vec,
        limit=settings.top_k,
        score_threshold=threshold,
        query_filter=models.Filter(must=must),
        with_payload=True,
    )
    return [
        {"text": p.payload["text"], "filename": p.payload["filename"], "score": p.score}
        for p in result.points
    ]


def build_prompt(
    question: str, contexts: list[dict], history: list[dict], filenames: list[str]
) -> list[dict]:
    context_block = "\n\n---\n\n".join(
        f"[Forrás: {c['filename']}]\n{c['text']}" for c in contexts
    )
    doc_list = "\n".join(f"- {fn}" for fn in filenames) or "- (nincs)"
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    # Rövid előzmény (max 6 üzenet) a többfordulós beszélgetéshez
    messages.extend(history[-6:])
    messages.append(
        {
            "role": "user",
            "content": (
                f"Elérhető dokumentumok:\n{doc_list}\n\n"
                f"KONTEXTUS:\n{context_block}\n\nKÉRDÉS: {question}"
            ),
        }
    )
    return messages


async def stream_answer(
    *, tenant_id: str, user_id: str, question: str,
    history: list[dict], filenames: list[str],
) -> AsyncIterator[dict]:
    """SSE eseményfolyam: sources → token* → done | error."""
    contexts = await retrieve_context(
        tenant_id=tenant_id, user_id=user_id, question=question,
        history=history, filenames=filenames,
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
        "messages": build_prompt(question, contexts, history, filenames),
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
