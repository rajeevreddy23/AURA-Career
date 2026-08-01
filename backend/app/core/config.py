from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    app_name: str = "AURA Learn API"
    debug: bool = False

    firebase_project_id: str = "aura-70a87"
    firebase_client_email: Optional[str] = None
    firebase_private_key: Optional[str] = None

    gemini_api_key: Optional[str] = None
    google_tts_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    nvidia_api_key: Optional[str] = None
    nvidia_base_url: str = "https://openrouter.ai/api/v1"
    nvidia_model: str = "nvidia/nemotron-3-super-120b-a12b:free"
    llm_provider: str = "nvidia"

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/auralearn"
    redis_url: str = "redis://localhost:6379"

    backend_cors_origins: list[str] = ["http://localhost:3000", "https://auralearn.com", "https://www.auralearn.com"]

    class Config:
        # Try .env.local first (dev), then fall back to environment variables
        env_file = "../.env.local"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "allow"

settings = Settings()
