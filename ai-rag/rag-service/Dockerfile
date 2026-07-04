FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /srv

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Nem-root futtatás
RUN useradd --create-home appuser
USER appuser

EXPOSE 8100

# 4 worker: az I/O-kötött SSE proxy + async végpontok miatt bőven elég 100 userre
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8100", "--workers", "4"]
