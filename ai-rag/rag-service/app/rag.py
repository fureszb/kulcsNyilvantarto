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
    "KONTEXTUS alapján válaszolj. Ne találj ki információt, "
    "ne használd a saját tudásodat, ne spekulálj. Ha idézel, jelöld meg a "
    "forrás fájlnevét.\n"
    "- Válaszolj természetes, nyelvtanilag helyes magyarsággal, közérthetően.\n"
    "- Formázd a választ Markdownnal, ha az segíti az áttekinthetőséget: "
    "a kulcsinformációkat (számok, határidők, nevek, tiltások) **félkövérrel** "
    "emeld ki, felsorolásokhoz használj listát, több tételnél táblázatot. "
    "Rövid, egymondatos válasznál nem kell formázás.\n"
    "- A kérdést jóhiszeműen értelmezd: az elírásokat, köznyelvi "
    "megfogalmazásokat és rokon értelmű szavakat ismerd fel (pl. a "
    "'vagyonőr', 'őr', 'biztonsági őr', 'portás' ugyanarra utalhat; a "
    "'mennyit keres' a fizetésre kérdez rá).\n"
    "- Ha a felhasználó egy dokumentum tartalmáról vagy összefoglalásáról "
    "kérdez, foglald össze a kontextusban szereplő szöveget a saját "
    "szavaiddal — ez megengedett, mert a kontextusból dolgozol.\n"
    "- Ha a felhasználó arról kérdez, milyen dokumentumok érhetők el vagy "
    "miről kérdezhet, sorold fel az 'Elérhető dokumentumok' listát és "
    "röviden a kontextusban látható tartalmukat.\n"
    "- Ha több forrásrészlet is releváns, mindet olvasd végig, és a "
    "kérdéshez legpontosabban illeszkedő részből válaszolj. Időpontokat, "
    "számokat, neveket szó szerint vegyél át a forrásból.\n"
    "- Számításnál kizárólag a kérdésben és a kontextusban szereplő "
    "adatokat használd. Hiányzó adatot (pl. műszakbeosztás, ledolgozott "
    "órák) SOHA ne feltételezz — ilyenkor közöld a rendelkezésre álló "
    "tényeket, és jelezd, milyen adat hiányzik a pontos számításhoz.\n"
    "- KIZÁRÓLAG akkor, ha a kérdésre tényleg semmilyen válasz nem "
    "adható a kontextus alapján, válaszold pontosan ezt: 'Erre a kérdésre "
    "a feltöltött dokumentumok alapján nem tudok válaszolni.'"
)

# Dolgozói nézet: a tudásbázis fájljai nem láthatók — sem fájlnevet, sem
# dokumentumlistát nem közlünk, a válasz forrásmegjelölés nélkül készül
SYSTEM_PROMPT_NO_SOURCES = (
    "Te egy vállalati tudásbázis-asszisztens vagy. KIZÁRÓLAG a megadott "
    "KONTEXTUS alapján válaszolj. Ne találj ki információt, ne használd a "
    "saját tudásodat, ne spekulálj.\n"
    "- Válaszolj természetes, nyelvtanilag helyes magyarsággal, közérthetően.\n"
    "- Formázd a választ Markdownnal, ha az segíti az áttekinthetőséget: "
    "a kulcsinformációkat (számok, határidők, nevek, tiltások) **félkövérrel** "
    "emeld ki, felsorolásokhoz használj listát, több tételnél táblázatot. "
    "Rövid, egymondatos válasznál nem kell formázás.\n"
    "- SOHA ne említs fájlneveket, dokumentumneveket vagy forrásmegjelölést "
    "a válaszban — a tudásbázis fájljai a felhasználó számára nem láthatók. "
    "Fogalmazz így: 'a vállalati szabályzat szerint...'.\n"
    "- A kérdést jóhiszeműen értelmezd: az elírásokat, köznyelvi "
    "megfogalmazásokat és rokon értelmű szavakat ismerd fel (pl. a "
    "'vagyonőr', 'őr', 'biztonsági őr', 'portás' ugyanarra utalhat; a "
    "'mennyit keres' a fizetésre kérdez rá).\n"
    "- Ha több forrásrészlet is releváns, mindet olvasd végig, és a "
    "kérdéshez legpontosabban illeszkedő részből válaszolj. Időpontokat, "
    "számokat, neveket szó szerint vegyél át a forrásból.\n"
    "- Számításnál kizárólag a kérdésben és a kontextusban szereplő "
    "adatokat használd. Hiányzó adatot SOHA ne feltételezz — ilyenkor "
    "közöld a rendelkezésre álló tényeket, és jelezd, milyen adat hiányzik.\n"
    "- KIZÁRÓLAG akkor, ha a kérdésre tényleg semmilyen válasz nem "
    "adható a kontextus alapján, válaszold pontosan ezt: 'Erre a kérdésre "
    "a vállalati tudásbázis alapján nem tudok válaszolni.'"
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


async def embed_query(
    *, question: str, history: list[dict],
) -> list[float]:
    """1. fázis: a kérdés (+ friss előzmény) beágyazása.

    Követő kérdések ("mikor kelt ez a dokumentum?") — az utolsó user-üzenet
    bevonása a lekérdezésbe.
    """
    last_user = [m["content"] for m in history if m.get("role") == "user"][-1:]
    query_text = question if not last_user else f"{last_user[0]}\n{question}"
    async with httpx.AsyncClient() as client:
        return (await embed_texts([query_text], client))[0]


async def search_chunks(
    *, tenant_id: str, question: str, query_vec: list[float],
    history: list[dict], filenames: list[str],
) -> list[dict]:
    """2. fázis: top-K releváns chunk — KÖTELEZŐ tenant-izolációs szűrővel.

    A tudásbázis cégszintű (tenantonként központi, az admin tölti fel);
    a tenant_id a szerveroldalon, a Laravel tenant-kontextusából származik.
    Ez a függvény az egyetlen retrieval-útvonal: tenant-szűrő nélküli
    keresés a szolgáltatásban nem létezik.
    """
    last_user = [m["content"] for m in history if m.get("role") == "user"][-1:]

    must = [
        models.FieldCondition(key="tenant_id", match=models.MatchValue(value=tenant_id)),
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
    question: str, contexts: list[dict], history: list[dict],
    filenames: list[str], with_sources: bool,
) -> list[dict]:
    context_block = "\n\n---\n\n".join(
        f"[Forrás: {c['filename']}]\n{c['text']}" for c in contexts
    )
    doc_list = "\n".join(f"- {fn}" for fn in filenames) or "- (nincs)"
    system = SYSTEM_PROMPT if with_sources else (
        SYSTEM_PROMPT_NO_SOURCES
    )
    messages = [{"role": "system", "content": system}]
    # Rövid előzmény (max 6 üzenet) a többfordulós beszélgetéshez
    messages.extend(history[-6:])
    # A dokumentumlista csak forrás-jogosultsággal (admin) kerül a promptba
    doc_block = f"Elérhető dokumentumok:\n{doc_list}\n\n" if with_sources else ""
    messages.append(
        {
            "role": "user",
            "content": (
                f"{doc_block}"
                f"KONTEXTUS:\n{context_block}\n\nKÉRDÉS: {question}"
            ),
        }
    )
    return messages


async def stream_answer(
    *, tenant_id: str, question: str,
    history: list[dict], filenames: list[str], with_sources: bool,
) -> AsyncIterator[dict]:
    """SSE eseményfolyam: phase* → [sources] → token* → done | error.

    A phase események a tényleges feldolgozási lépéseket jelzik:
    1 = kérdés feldolgozása (embedding), 2 = keresés a dokumentumokban,
    3 = válasz megfogalmazása (LLM).

    with_sources=False (dolgozói nézet): sem sources esemény, sem
    fájlnév-említés a válaszban — a tudásbázis fájljai rejtettek.
    """
    yield {"event": "phase", "data": "1"}
    query_vec = await embed_query(question=question, history=history)

    yield {"event": "phase", "data": "2"}
    contexts = await search_chunks(
        tenant_id=tenant_id, question=question, query_vec=query_vec,
        history=history, filenames=filenames,
    )

    if not contexts:
        yield {"event": "token", "data": (
            "Erre a kérdésre a vállalati tudásbázis alapján nem tudok válaszolni."
        )}
        yield {"event": "done", "data": ""}
        return

    if with_sources:
        yield {
            "event": "sources",
            "data": json.dumps(
                sorted({c["filename"] for c in contexts}), ensure_ascii=False
            ),
        }

    yield {"event": "phase", "data": "3"}

    payload = {
        "model": settings.ollama_llm_model,
        "messages": build_prompt(question, contexts, history, filenames, with_sources),
        "stream": True,
        "keep_alive": settings.ollama_keep_alive,
        "options": {"temperature": 0.1, "num_ctx": 16384},
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
