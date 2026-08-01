"""
Unit tests for CodingAgent.

Covers:
- explain_code()
- generate_code()
- debug_code()
- suggest_optimizations()
- supported_languages attribute
"""

import pytest
import json
from unittest.mock import AsyncMock, MagicMock, patch


def make_coding_agent():
    with patch("google.generativeai.configure"), \
         patch("google.generativeai.GenerativeModel") as MockModel:
        MockModel.return_value = MagicMock()
        from backend.app.agents.coding_agent import CodingAgent
        agent = CodingAgent()
        agent.nvidia_client = None
        agent.groq_client = None
        return agent


class TestCodingAgentInit:
    def test_system_prompt_set(self):
        agent = make_coding_agent()
        assert "pair-programmer" in agent.system_prompt or "coding" in agent.system_prompt.lower()

    def test_supported_languages(self):
        agent = make_coding_agent()
        assert "python" in agent.supported_languages
        assert "javascript" in agent.supported_languages
        assert "typescript" in agent.supported_languages


class TestExplainCode:
    @pytest.mark.asyncio
    async def test_returns_dict(self):
        agent = make_coding_agent()
        result = await agent.explain_code("print('hello')", "python")
        assert isinstance(result, dict)

    @pytest.mark.asyncio
    async def test_mocked_explanation(self):
        agent = make_coding_agent()
        fake = json.dumps([
            {"line": "print('hello')", "explanation": "Outputs 'hello' to the console."}
        ])
        agent.generate = AsyncMock(return_value=fake)
        result = await agent.explain_code("print('hello')", "python")
        # extract_json may return list or dict depending on wrapping
        assert result is not None

    @pytest.mark.asyncio
    async def test_handles_multi_line_code(self):
        agent = make_coding_agent()
        code = "def add(a, b):\n    return a + b\n\nresult = add(3, 4)"
        result = await agent.explain_code(code, "python")
        assert isinstance(result, dict)


class TestGenerateCode:
    @pytest.mark.asyncio
    async def test_returns_dict(self):
        agent = make_coding_agent()
        result = await agent.generate_code("binary search algorithm", "python")
        assert isinstance(result, dict)

    @pytest.mark.asyncio
    async def test_mocked_code_generation(self):
        agent = make_coding_agent()
        fake = json.dumps({
            "code": "def binary_search(arr, target):\n    left, right = 0, len(arr)-1\n    ...",
            "explanation": "Implements binary search.",
            "example_output": "Index: 4",
            "complexity": "O(log n)"
        })
        agent.generate = AsyncMock(return_value=fake)
        result = await agent.generate_code("binary search", "python")
        assert "code" in result
        assert result["complexity"] == "O(log n)"

    @pytest.mark.asyncio
    async def test_defaults_to_python(self):
        agent = make_coding_agent()
        # Should not raise even without explicit language
        result = await agent.generate_code("fibonacci sequence")
        assert isinstance(result, dict)

    @pytest.mark.asyncio
    async def test_different_languages(self):
        agent = make_coding_agent()
        for lang in ("javascript", "typescript", "java"):
            result = await agent.generate_code("hello world", lang)
            assert isinstance(result, dict)


class TestDebugCode:
    @pytest.mark.asyncio
    async def test_returns_dict(self):
        agent = make_coding_agent()
        code = "def divide(a, b):\n    return a/b"
        result = await agent.debug_code(code, "ZeroDivisionError", "python")
        assert isinstance(result, dict)

    @pytest.mark.asyncio
    async def test_mocked_debug_response(self):
        agent = make_coding_agent()
        fake = json.dumps({
            "bug": "Division by zero when b=0",
            "fixed_code": "def divide(a, b):\n    if b == 0: return None\n    return a/b",
            "prevention": "Always validate divisor before dividing"
        })
        agent.generate = AsyncMock(return_value=fake)
        result = await agent.debug_code("def divide(a, b): return a/b", "ZeroDivisionError", "python")
        assert "bug" in result
        assert "fixed_code" in result

    @pytest.mark.asyncio
    async def test_debug_with_empty_error(self):
        agent = make_coding_agent()
        result = await agent.debug_code("x = 1", "", "python")
        assert isinstance(result, dict)


class TestSuggestOptimizations:
    @pytest.mark.asyncio
    async def test_returns_dict(self):
        agent = make_coding_agent()
        code = "for i in range(len(lst)):\n    print(lst[i])"
        result = await agent.suggest_optimizations(code, "python")
        assert isinstance(result, dict)

    @pytest.mark.asyncio
    async def test_mocked_optimizations(self):
        agent = make_coding_agent()
        fake = json.dumps({
            "suggestions": ["Use enumerate() instead of range(len())", "Use list comprehension"],
            "optimized_code": "for i, item in enumerate(lst):\n    print(item)",
            "explanation": "enumerate() is more Pythonic and efficient."
        })
        agent.generate = AsyncMock(return_value=fake)
        result = await agent.suggest_optimizations("for i in range(len(lst)): print(lst[i])", "python")
        assert "suggestions" in result
        assert len(result["suggestions"]) == 2
