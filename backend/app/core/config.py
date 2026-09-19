import os
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings

_ROOT_DIR = Path(__file__).resolve().parents[3]
_ENV_PATHS = [
    _ROOT_DIR / ".env.local",
    _ROOT_DIR / ".env",
    Path(".env.local").resolve(),
    Path(".env").resolve(),
]

class Settings(BaseSettings):
    app_name: str = "AuraCareer API"
    debug: bool = False

    firebase_project_id: str = "aura-70a87"
    firebase_client_email: Optional[str] = None
    firebase_private_key: Optional[str] = None

    gemini_api_key: Optional[str] = None
    google_tts_api_key: Optional[str] = None
    fish_audio_api_key: Optional[str] = None
    openrouter_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    nvidia_api_key: Optional[str] = None
    nvidia_base_url: str = "https://openrouter.ai/api/v1"
    nvidia_model: str = "nvidia/nemotron-3-super-120b-a12b:free"
    llm_provider: str = "nvidia"

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/auracareer"
    redis_url: str = "redis://localhost:6379"

    backend_cors_origins: list[str] = ["http://localhost:3000", "https://auracareer.com", "https://www.auracareer.com", "https://auralearn.com"]

    class Config:
        env_file = [str(p) for p in _ENV_PATHS if p.exists()] or ".env.local"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "allow"

settings = Settings()
