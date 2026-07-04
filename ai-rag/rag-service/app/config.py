from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    rag_internal_token: str
    ollama_base_url: str = "http://ollama:11434"
    qdrant_url: str = "http://qdrant:6333"
    qdrant_collection: str = "enterprise_docs"
    ollama_llm_model: str = "llama3.1:8b-instruct-q5_K_M"
    ollama_embed_model: str = "bge-m3"
    # A modellek maradjanak a VRAM-ban — enélkül 5 perc tétlenség után
    # kiürülnek, és a következő kérdés 20-40 mp modellbetöltéssel indul
    ollama_keep_alive: str = "24h"

    # Helyi neurális TTS (Piper) — magyar női hang
    piper_model_path: str = "/srv/tts/hu_HU-anna-medium.onnx"
    tts_max_chars: int = 4000

    # Chunking — kisebb chunk = témafókuszáltabb embedding, pontosabb rangsor
    chunk_size: int = 600
    chunk_overlap: int = 100
    embed_batch_size: int = 32

    # Retrieval
    top_k: int = 8
    score_threshold: float = 0.3
    # Fájlnévre szűrt keresésnél megengedőbb küszöb — a doksi már azonosított
    filename_score_threshold: float = 0.1

    # Memória-védelem parseolásnál
    max_cell_chars: int = 2000           # xlsx cellánkénti plafon
    max_document_chars: int = 2_000_000  # ~2 MB tiszta szöveg / dokumentum


settings = Settings()
