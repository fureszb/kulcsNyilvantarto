"""Helyi neurális szövegfelolvasás (Piper) — magyar női hang.

A modell egyszer töltődik be (lazy), a szintézis CPU-n fut, valós idejűnél
gyorsabban. A blokkoló szintézist thread-poolban futtatjuk, hogy ne fogja
meg az async event loopot.
"""
from __future__ import annotations

import asyncio
import io
import threading
import wave

from .config import settings

_voice = None
_voice_lock = threading.Lock()


def _get_voice():
    global _voice
    if _voice is None:
        with _voice_lock:
            if _voice is None:
                from piper import PiperVoice

                _voice = PiperVoice.load(settings.piper_model_path)
    return _voice


def _synthesize_blocking(text: str) -> bytes:
    voice = _get_voice()
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wav_file:
        voice.synthesize(text, wav_file, sentence_silence=0.25)
    return buf.getvalue()


async def synthesize(text: str) -> bytes:
    """Szöveg → WAV bytes (async wrapper)."""
    return await asyncio.to_thread(_synthesize_blocking, text)
