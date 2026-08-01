"""
Unit tests for BaseAgent — the foundation of all AuraLearn AI agents.

These tests cover:
- active_provider property (nvidia / groq / gemini / mock branches)
- extract_json (markdown block, raw JSON, fallback)
- _mock_response (all 5 branches)
- generate() method fallback path
- set_fallback helper
"""

import pytest
import json
from unittest.mock import AsyncMock, MagicMock, patch


# ---------------------------------------------------------------------------
# Helper: build a BaseAgent with all LLM clients patched out
# ---------------------------------------------------------------------------

def make_base_agent():
    """Return a BaseAgent whose LLM clients are all replaced with MagicMocks."""
    with patch("google.generativeai.configure"), \
         patch("google.generativeai.GenerativeModel") as MockModel:
        MockModel.return_value = MagicMock()
        from backend.app.agents.base import BaseAgent
        agent = BaseAgent()
        agent.nvidia_client = None
        agent.groq_client = None
        return agent


# ---------------------------------------------------------------------------
# active_provider
# ---------------------------------------------------------------------------

class TestActiveProvider:
    def test_returns_mock_when_no_clients_and_mock_key(self):
        agent = make_base_agent()
        agent.nvidia_client = None
        agent.groq_client = None
        # Gemini key is MOCK_KEY (from conftest mock_settings)
        assert agent.active_provider == "mock"

    def test_returns_nvidia_when_nvidia_client_set(self):
        agent = make_base_agent()
        agent.nvidia_client = MagicMock()
        result = agent.active_provider
        assert result.startswith("nvidia:")

    def test_returns_groq_when_groq_client_set(self):
        agent = make_base_agent()
        agent.nvidia_client = None
        agent.groq_client = MagicMock()
        result = agent.active_provider
        assert result.startswith("groq:")

    def test_returns_gemini_when_real_key(self):
        agent = make_base_agent()
        agent.nvidia_client = None
        agent.groq_client = None
        with patch("backend.app.agents.base.settings") as mock_settings:
            mock_settings.nvidia_api_key = None
            mock_settings.groq_api_key = None
            mock_settings.gemini_api_key = "real-key-123"
            mock_settings.nvidia_model = "some-model"
            result = agent.active_provider
        assert result.startswith("gemini:")


# ---------------------------------------------------------------------------
# extract_json
# ---------------------------------------------------------------------------

class TestExtractJson:
    def setup_method(self):
        self.agent = make_base_agent()

    def test_extracts_from_markdown_json_block(self):
        text = '```json\n{"key": "value"}\n```'
        result = self.agent.extract_json(text)
        assert result == {"key": "value"}

    def test_extracts_from_plain_markdown_block(self):
        text = '```\n{"answer": 42}\n```'
        result = self.agent.extract_json(text)
        assert result == {"answer": 42}

    def test_parses_raw_json_string(self):
        text = '{"name": "Alice", "score": 99}'
        result = self.agent.extract_json(text)
        assert result["name"] == "Alice"
        assert result["score"] == 99

    def test_falls_back_to_text_dict_on_invalid_json(self):
        text = "This is not JSON at all."
        result = self.agent.extract_json(text)
        assert "text" in result
        assert result["text"] == text

    def test_extracts_nested_json(self):
        data = {"modules": [{"title": "Intro", "lessons": []}], "count": 3}
        text = f"```json\n{json.dumps(data)}\n```"
        result = self.agent.extract_json(text)
        assert result["count"] == 3
        assert len(result["modules"]) == 1

    def test_handles_malformed_json_in_block(self):
        text = "```json\n{broken: json}\n```"
        result = self.agent.extract_json(text)
        # Should fall back to returning {"text": ...}
        assert isinstance(result, dict)


# ---------------------------------------------------------------------------
# _mock_response
# ---------------------------------------------------------------------------

class TestMockResponse:
    def setup_method(self):
        self.agent = make_base_agent()

    def test_teacher_branch_triggered_by_system_prompt(self):
        response = self.agent._mock_response("explain loops", "you are a teacher")
        assert "##TITLE##" in response or "##HEADING##" in response

    def test_teacher_branch_triggered_by_lesson_keyword(self):
        response = self.agent._mock_response("give me a lesson on variables", "lesson designer")
        assert "##" in response  # teacher markdown format

    def test_coding_branch_triggered_by_code_keyword(self):
        response = self.agent._mock_response("fix my code", "you help with code")
        assert "```python" in response or "Code Analysis" in response

    def test_resume_branch_triggered_by_resume_keyword(self):
        response = self.agent._mock_response("analyze resume", "you are an ATS analyst")
        assert "atsScore" in response or "skills" in response

    def test_resume_write_branch_on_improve_prompt(self):
        response = self.agent._mock_response("improve this bullet point", "you are an ats analyst")
        assert "•" in response or "Enhanced" in response or "improved" in response.lower()

    def test_quiz_branch_triggered_by_quiz_keyword(self):
        response = self.agent._mock_response("make a quiz", "create a question for students")
        assert "question" in response.lower()

    def test_returns_string(self):
        response = self.agent._mock_response("hello", "general")
        assert isinstance(response, str)
        assert len(response) > 0

    def test_deterministic_output_for_same_prompt(self):
        r1 = self.agent._mock_response("test input", "general")
        r2 = self.agent._mock_response("test input", "general")
        assert r1 == r2


# ---------------------------------------------------------------------------
# set_fallback
# ---------------------------------------------------------------------------

class TestSetFallback:
    def test_fallback_func_is_stored(self):
        agent = make_base_agent()
        async def my_fallback(p): return "fallback"
        agent.set_fallback(my_fallback)
        assert agent._fallback_func is my_fallback


# ---------------------------------------------------------------------------
# generate() — fallback path (no real API keys)
# ---------------------------------------------------------------------------

class TestGenerate:
    @pytest.mark.asyncio
    async def test_generate_returns_mock_string_when_no_api_keys(self):
        agent = make_base_agent()
        result = await agent.generate("What is recursion?")
        assert isinstance(result, str)
        assert len(result) > 0

    @pytest.mark.asyncio
    async def test_generate_uses_nvidia_client_first(self):
        agent = make_base_agent()
        mock_response = MagicMock()
        mock_response.choices = [MagicMock(message=MagicMock(content="NVIDIA answer"))]
        agent.nvidia_client = MagicMock()
        agent.nvidia_client.chat = MagicMock()
        agent.nvidia_client.chat.completions = MagicMock()
        agent.nvidia_client.chat.completions.create = AsyncMock(return_value=mock_response)

        with patch("backend.app.agents.base.settings") as s:
            s.nvidia_api_key = "key"
            s.nvidia_model = "nvidia/model"
            s.groq_api_key = None
            s.gemini_api_key = "MOCK_KEY"
            result = await agent.generate("test prompt")

        assert result == "NVIDIA answer"

    @pytest.mark.asyncio
    async def test_generate_falls_through_to_groq_on_nvidia_error(self):
        agent = make_base_agent()
        agent.nvidia_client = MagicMock()
        agent.nvidia_client.chat = MagicMock()
        agent.nvidia_client.chat.completions = MagicMock()
        agent.nvidia_client.chat.completions.create = AsyncMock(side_effect=Exception("NVIDIA error"))

        mock_response = MagicMock()
        mock_response.choices = [MagicMock(message=MagicMock(content="Groq answer"))]
        agent.groq_client = MagicMock()
        agent.groq_client.chat = MagicMock()
        agent.groq_client.chat.completions = MagicMock()
        agent.groq_client.chat.completions.create = AsyncMock(return_value=mock_response)

        with patch("backend.app.agents.base.settings") as s:
            s.nvidia_api_key = "key"
            s.nvidia_model = "model"
            s.groq_api_key = "groq_key"
            s.gemini_api_key = "MOCK_KEY"
            result = await agent.generate("test prompt")

        assert result == "Groq answer"

    @pytest.mark.asyncio
    async def test_generate_falls_back_to_mock_on_all_failures(self):
        agent = make_base_agent()
        # nvidia and groq are None, gemini raises → should return mock string
        agent.nvidia_client = None
        agent.groq_client = None
        result = await agent.generate("What is OOP?")
        assert isinstance(result, str)
        assert len(result) > 10
