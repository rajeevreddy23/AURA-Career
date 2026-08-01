"""
Shared pytest fixtures for AuraLearn backend tests.

All external services (Firebase, Redis, Gemini, Groq, NVIDIA) are mocked
so the tests can run fully offline without real API keys.
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient


# ---------------------------------------------------------------------------
# Event-loop fixture for pytest-asyncio
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def event_loop():
    """Use a single event loop for the entire test session."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


# ---------------------------------------------------------------------------
# Patch settings so no real env vars are required
# ---------------------------------------------------------------------------

@pytest.fixture(autouse=True)
def mock_settings(monkeypatch):
    """
    Patch settings to use mock values everywhere.
    autouse=True means every test gets this for free.
    """
    monkeypatch.setenv("GEMINI_API_KEY", "MOCK_KEY")
    monkeypatch.setenv("GROQ_API_KEY", "")
    monkeypatch.setenv("NVIDIA_API_KEY", "")
    monkeypatch.setenv("FIREBASE_PROJECT_ID", "test-project")
    monkeypatch.setenv("FIREBASE_CLIENT_EMAIL", "")
    monkeypatch.setenv("FIREBASE_PRIVATE_KEY", "")
    monkeypatch.setenv("REDIS_URL", "redis://localhost:6379")
    monkeypatch.setenv("DATABASE_URL", "sqlite+aiosqlite:///:memory:")


# ---------------------------------------------------------------------------
# Mock firebase_admin so init_firebase never hits real Firebase
# ---------------------------------------------------------------------------

@pytest.fixture(autouse=True)
def mock_firebase_admin():
    with patch("firebase_admin.initialize_app", return_value=None), \
         patch("firebase_admin.get_app", side_effect=ValueError("No app")), \
         patch("firebase_admin.credentials.Certificate", return_value=MagicMock()):
        yield


# ---------------------------------------------------------------------------
# Mock google.generativeai at import time
# ---------------------------------------------------------------------------

@pytest.fixture(autouse=True)
def mock_genai():
    mock_model = MagicMock()
    mock_model.generate_content_async = AsyncMock(
        side_effect=Exception("Mock key — no real call")
    )
    with patch("google.generativeai.configure"), \
         patch("google.generativeai.GenerativeModel", return_value=mock_model):
        yield mock_model


# ---------------------------------------------------------------------------
# Redis mock
# ---------------------------------------------------------------------------

@pytest.fixture
def mock_redis():
    redis = AsyncMock()
    redis.get = AsyncMock(return_value=None)
    redis.pipeline = MagicMock(return_value=AsyncMock(
        __aenter__=AsyncMock(return_value=AsyncMock(
            incr=AsyncMock(),
            expire=AsyncMock(),
            execute=AsyncMock(return_value=[1, True]),
        )),
        __aexit__=AsyncMock(return_value=False),
    ))
    return redis


# ---------------------------------------------------------------------------
# FastAPI TestClient with all heavy services mocked
# ---------------------------------------------------------------------------

@pytest.fixture
def api_client():
    """Return a FastAPI TestClient with startup/shutdown mocked."""
    with patch("backend.app.core.security.init_firebase"), \
         patch("backend.app.core.redis.get_redis", return_value=AsyncMock(return_value=None)), \
         patch("backend.app.core.redis.close_redis", return_value=AsyncMock()):
        from backend.app.main import app
        with TestClient(app, raise_server_exceptions=False) as client:
            yield client
