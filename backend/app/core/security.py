import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .config import settings
import os

security_scheme = HTTPBearer(auto_error=False)

_firebase_initialized = False

def init_firebase():
    global _firebase_initialized
    if _firebase_initialized:
        return
    try:
        if settings.firebase_client_email and settings.firebase_private_key:
            cred_dict = {
                "type": "service_account",
                "project_id": settings.firebase_project_id,
                "private_key_id": "unused",
                "private_key": settings.firebase_private_key.replace("\\n", "\n"),
                "client_email": settings.firebase_client_email,
                "client_id": "unused",
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
        else:
            firebase_admin.initialize_app()
        _firebase_initialized = True
    except Exception as e:
        print(f"[WARN] Firebase init skipped: {e}")

async def verify_firebase_token(
    credentials: HTTPAuthorizationCredentials = Security(security_scheme),
) -> dict:
    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        decoded_token = firebase_auth.verify_id_token(credentials.credentials)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

async def optional_firebase_token(
    credentials: HTTPAuthorizationCredentials = Security(security_scheme),
) -> dict | None:
    """
    Like verify_firebase_token but returns None instead of raising 401.
    Use this for endpoints that work both authenticated and anonymous.
    """
    if not credentials or not credentials.credentials:
        return None
    try:
        return firebase_auth.verify_id_token(credentials.credentials)
    except Exception:
        return None

async def rate_limit(key: str, limit: int, window: int) -> bool:
    """
    Check if a key (e.g. IP or UID) is within the rate limit.
    Returns True if allowed, False if rate limited.
    """
    try:
        from .redis import get_redis
        redis_client = await get_redis()
        if redis_client is None:
            return True
        
        current = await redis_client.get(key)
        if current is not None and int(current) >= limit:
            return False
            
        # Safely increment and set expiry in a pipeline
        async with redis_client.pipeline(transaction=True) as pipe:
            await pipe.incr(key)
            if current is None:
                await pipe.expire(key, window)
            await pipe.execute()
        return True
    except Exception as e:
        print(f"[WARN] Redis rate limiter error: {e}")
        return True
