import hmac

from fastapi import Header, HTTPException

from .config import settings


def verify_internal_token(x_internal_token: str = Header(default="")) -> None:
    """Csak a Laravel backend hívhatja a szolgáltatást (megosztott titok).

    hmac.compare_digest: timing-attack-biztos összehasonlítás.
    """
    if not x_internal_token or not hmac.compare_digest(
        x_internal_token, settings.rag_internal_token
    ):
        raise HTTPException(status_code=401, detail="Invalid internal token")
