# 3.11: a piper-phonemize wheel-ek miatt (3.12-höz nincs bináris csomag)
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /srv

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Piper magyar hangok — build-time letöltés, env-ből választható (PIPER_MODEL_PATH)
# Lehallgatható minták: https://rhasspy.github.io/piper-samples/ (hu_HU szekció)
# anna (nő, medium) | imre (férfi, medium) | berta (nő, x_low — gyengébb minőség)
ADD https://huggingface.co/rhasspy/piper-voices/resolve/main/hu/hu_HU/anna/medium/hu_HU-anna-medium.onnx /srv/tts/hu_HU-anna-medium.onnx
ADD https://huggingface.co/rhasspy/piper-voices/resolve/main/hu/hu_HU/anna/medium/hu_HU-anna-medium.onnx.json /srv/tts/hu_HU-anna-medium.onnx.json
ADD https://huggingface.co/rhasspy/piper-voices/resolve/main/hu/hu_HU/imre/medium/hu_HU-imre-medium.onnx /srv/tts/hu_HU-imre-medium.onnx
ADD https://huggingface.co/rhasspy/piper-voices/resolve/main/hu/hu_HU/imre/medium/hu_HU-imre-medium.onnx.json /srv/tts/hu_HU-imre-medium.onnx.json
RUN chmod 644 /srv/tts/*

COPY app ./app

# Nem-root futtatás
RUN useradd --create-home appuser
USER appuser

EXPOSE 8100

# 4 worker: az I/O-kötött SSE proxy + async végpontok miatt bőven elég 100 userre
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8100", "--workers", "4"]
