"""
Unit tests for security utilities (backend/app/core/security.py).

Covers:
- init_firebase() — idempotent initialization
- rate_limit() — Redis None bypass, counter logic, over-limit check
- verify_firebase_token() — missing credentials raises 401
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch


class TestInitFirebase:
    def test_init_firebase_is_idempotent(self):
        """Calling init_firebase twice should not raise."""
        with patch("firebase_admin.initialize_app", return_value=None) as mock_init, \
             patch("firebase_admin.get_app", side_effect=ValueError("No app")):
            from backend.app.core import security
            # Reset the init flag for testing
            security._firebase_initialized = False
            security.init_firebase()
            # Call again — should skip
            security.init_firebase()
            # initialize_app should only have been called once
            assert mock_init.call_count == 1

    def test_init_firebase_with_credentials(self):
        """Verify credential-based path doesn't error."""
        with patch("firebase_admin.initialize_app", return_value=None), \
             patch("firebase_admin.credentials.Certificate", return_value=MagicMock()):
            from backend.app.core import security
            security._firebase_initialized = False
            with patch.object(security.settings, "firebase_client_email", "test@project.iam.gserviceaccount.com"), \
                 patch.object(security.settings, "firebase_private_key", "-----BEGIN RSA PRIVATE KEY-----\nfakekey\n-----END RSA PRIVATE KEY-----"):
                security.init_firebase()  # should not raise

    def test_init_firebase_handles_exception(self):
        """If firebase_admin.initialize_app raises, init_firebase catches it and logs."""
        with patch("firebase_admin.initialize_app", side_effect=Exception("Firebase error")), \
             patch("firebase_admin.get_app", side_effect=ValueError):
            from backend.app.core import security
            security._firebase_initialized = False
            # Should not raise — error is caught internally
            security.init_firebase()


class TestRateLimit:
    @pytest.mark.asyncio
    async def test_returns_true_when_redis_unavailable(self):
        """If Redis client is None, rate_limit always returns True (allow)."""
        with patch("backend.app.core.redis.get_redis", return_value=AsyncMock(return_value=None)):
            from backend.app.core.security import rate_limit
            result = await rate_limit("test_key", limit=5, window=60)
            assert result is True

    @pytest.mark.asyncio
    async def test_returns_false_when_count_exceeds_limit(self):
        """If Redis counter is at or above limit, returns False (deny)."""
        mock_redis = AsyncMock()
        mock_redis.get = AsyncMock(return_value=b"10")  # already at 10 hits

        with patch("backend.app.core.redis.get_redis", return_value=AsyncMock(return_value=mock_redis)):
            from backend.app.core.security import rate_limit
            result = await rate_limit("ip:1.2.3.4", limit=5, window=60)
            assert result is False

    @pytest.mark.asyncio
    async def test_returns_true_when_count_is_below_limit(self):
        """If Redis counter is below limit, increments and returns True."""
        mock_pipeline = AsyncMock()
        mock_pipeline.__aenter__ = AsyncMock(return_value=mock_pipeline)
        mock_pipeline.__aexit__ = AsyncMock(return_value=False)
        mock_pipeline.incr = AsyncMock()
        mock_pipeline.expire = AsyncMock()
        mock_pipeline.execute = AsyncMock(return_value=[1, True])

        mock_redis = AsyncMock()
        mock_redis.get = AsyncMock(return_value=b"3")  # 3 < limit of 5
        mock_redis.pipeline = MagicMock(return_value=mock_pipeline)

        with patch("backend.app.core.redis.get_redis", return_value=AsyncMock(return_value=mock_redis)):
            from backend.app.core.security import rate_limit
            result = await rate_limit("ip:1.2.3.4", limit=5, window=60)
            assert result is True

    @pytest.mark.asyncio
    async def test_returns_true_on_redis_exception(self):
        """If Redis raises an exception, rate_limit should return True (fail open)."""
        with patch("backend.app.core.redis.get_redis", side_effect=Exception("Connection refused")):
            from backend.app.core.security import rate_limit
            result = await rate_limit("any_key", limit=10, window=60)
            assert result is True

    @pytest.mark.asyncio
    async def test_new_key_sets_expire(self):
        """First hit on a key (get returns None) should set expire."""
        mock_pipeline = AsyncMock()
        mock_pipeline.__aenter__ = AsyncMock(return_value=mock_pipeline)
        mock_pipeline.__aexit__ = AsyncMock(return_value=False)
        mock_pipeline.incr = AsyncMock()
        mock_pipeline.expire = AsyncMock()
        mock_pipeline.execute = AsyncMock(return_value=[1, True])

        mock_redis = AsyncMock()
        mock_redis.get = AsyncMock(return_value=None)  # first hit
        mock_redis.pipeline = MagicMock(return_value=mock_pipeline)

        with patch("backend.app.core.redis.get_redis", return_value=AsyncMock(return_value=mock_redis)):
            from backend.app.core.security import rate_limit
            result = await rate_limit("new_key", limit=10, window=60)
            assert result is True
            mock_pipeline.expire.assert_called_once()


class TestVerifyFirebaseToken:
    @pytest.mark.asyncio
    async def test_raises_401_when_no_credentials(self):
        """Missing credentials should raise 401 HTTPException."""
        from fastapi import HTTPException
        from backend.app.core.security import verify_firebase_token
        with pytest.raises(HTTPException) as exc_info:
            await verify_firebase_token(None)
        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_raises_401_on_invalid_token(self):
        """Invalid Firebase token should raise 401 HTTPException."""
        from fastapi import HTTPException
        from fastapi.security import HTTPAuthorizationCredentials
        from backend.app.core.security import verify_firebase_token
        with patch("firebase_admin.auth.verify_id_token", side_effect=Exception("Invalid token")):
            fake_creds = MagicMock(spec=HTTPAuthorizationCredentials)
            fake_creds.credentials = "invalid.token.string"
            with pytest.raises(HTTPException) as exc_info:
                await verify_firebase_token(fake_creds)
            assert exc_info.value.status_code == 401
