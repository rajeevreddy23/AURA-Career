from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .core.config import settings
from .core.security import init_firebase
from .core.redis import get_redis, close_redis
from .api import router as api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_firebase()
    try:
        await get_redis()
    except Exception as e:
        print(f"[WARN] Redis unavailable: {e}")
    yield
    await close_redis()

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health():
    return {"status": "ok", "service": "AURA Learn API"}
