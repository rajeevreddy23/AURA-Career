"""
Unit tests for TeacherAgent.

All LLM calls are mocked; we verify that the agent:
- Calls generate() and extract_json() correctly
- Returns dicts with expected top-level keys
- Handles the mock fallback path
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch


def make_teacher_agent():
    with patch("google.generativeai.configure"), \
         patch("google.generativeai.GenerativeModel") as MockModel:
        MockModel.return_value = MagicMock()
        from backend.app.agents.teacher_agent import TeacherAgent
        agent = TeacherAgent()
        agent.nvidia_client = None
        agent.groq_client = None
        return agent


class TestTeacherAgentInit:
    def test_system_prompt_is_set(self):
        agent = make_teacher_agent()
        assert "AURA" in agent.system_prompt
        assert "professor" in agent.system_prompt.lower() or "teacher" in agent.system_prompt.lower()

    def test_system_prompt_contains_slide_format(self):
        agent = make_teacher_agent()
        assert "##TITLE##" in agent.system_prompt


class TestGenerateLesson:
    @pytest.mark.asyncio
    async def test_generate_lesson_returns_dict(self):
        agent = make_teacher_agent()
        result = await agent.generate_lesson("Python", "beginner")
        assert isinstance(result, dict)

    @pytest.mark.asyncio
    async def test_generate_lesson_with_different_levels(self):
        agent = make_teacher_agent()
        for level in ("beginner", "intermediate", "advanced"):
            result = await agent.generate_lesson("Sorting Algorithms", level)
            assert isinstance(result, dict)

    @pytest.mark.asyncio
    async def test_generate_lesson_mocked_response(self):
        agent = make_teacher_agent()
        fake_json = '{"title": "Python Basics", "objectives": ["learn vars"], "sections": []}'
        agent.generate = AsyncMock(return_value=fake_json)
        result = await agent.generate_lesson("Python", "beginner")
        assert result["title"] == "Python Basics"
        assert "objectives" in result

    @pytest.mark.asyncio
    async def test_generate_lesson_handles_invalid_json_gracefully(self):
        agent = make_teacher_agent()
        agent.generate = AsyncMock(return_value="not json at all")
        result = await agent.generate_lesson("Recursion", "advanced")
        # Should return a dict (fallback: {"text": "not json at all"})
        assert isinstance(result, dict)


class TestAnswerDoubt:
    @pytest.mark.asyncio
    async def test_answer_doubt_returns_dict(self):
        agent = make_teacher_agent()
        result = await agent.answer_doubt("What is a pointer?", "We are studying C++")
        assert isinstance(result, dict)

    @pytest.mark.asyncio
    async def test_answer_doubt_with_mocked_explanation(self):
        agent = make_teacher_agent()
        fake = '{"explanation": "A pointer holds a memory address.", "codeExample": "int* p;", "relatedConcepts": ["memory", "references"]}'
        agent.generate = AsyncMock(return_value=fake)
        result = await agent.answer_doubt("What is a pointer?", "C++ lesson")
        assert result["explanation"] == "A pointer holds a memory address."
        assert "relatedConcepts" in result

    @pytest.mark.asyncio
    async def test_answer_doubt_with_empty_question(self):
        agent = make_teacher_agent()
        result = await agent.answer_doubt("", "context")
        assert isinstance(result, dict)


class TestGenerateWhiteboardContent:
    @pytest.mark.asyncio
    async def test_returns_string(self):
        agent = make_teacher_agent()
        result = await agent.generate_whiteboard_content("Binary Trees", "traversal methods")
        assert isinstance(result, str)
        assert len(result) > 0

    @pytest.mark.asyncio
    async def test_mocked_whiteboard_content(self):
        agent = make_teacher_agent()
        agent.generate = AsyncMock(return_value="# Binary Trees\n- Inorder\n- Preorder")
        result = await agent.generate_whiteboard_content("Binary Trees", "traversal")
        assert "Binary Trees" in result
