"""
Unit tests for CurriculumAgent.

Covers:
- generate_course()
- generate_quiz()
- generate_project()
- generate_flashcards()
"""

import pytest
import json
from unittest.mock import AsyncMock, MagicMock, patch


def make_curriculum_agent():
    with patch("google.generativeai.configure"), \
         patch("google.generativeai.GenerativeModel") as MockModel:
        MockModel.return_value = MagicMock()
        from backend.app.agents.curriculum_agent import CurriculumAgent
        agent = CurriculumAgent()
        agent.nvidia_client = None
        agent.groq_client = None
        return agent


class TestCurriculumAgentInit:
    def test_system_prompt_set(self):
        agent = make_curriculum_agent()
        assert "curriculum" in agent.system_prompt.lower()


class TestGenerateCourse:
    @pytest.mark.asyncio
    async def test_returns_dict(self):
        agent = make_curriculum_agent()
        result = await agent.generate_course("Machine Learning", "intermediate")
        assert isinstance(result, dict)

    @pytest.mark.asyncio
    async def test_mocked_course_data(self):
        agent = make_curriculum_agent()
        fake = json.dumps({
            "title": "Machine Learning Fundamentals",
            "description": "Learn ML from scratch",
            "modules": [{"title": "Intro", "lessons": [{"title": "What is ML?"}]}],
            "learning_outcomes": ["Understand supervised learning"]
        })
        agent.generate = AsyncMock(return_value=fake)
        result = await agent.generate_course("Machine Learning", "intermediate")
        assert result["title"] == "Machine Learning Fundamentals"
        assert "modules" in result

    @pytest.mark.asyncio
    async def test_different_levels(self):
        agent = make_curriculum_agent()
        for level in ("beginner", "intermediate", "advanced"):
            result = await agent.generate_course("Data Structures", level)
            assert isinstance(result, dict)


class TestGenerateQuiz:
    @pytest.mark.asyncio
    async def test_returns_dict(self):
        agent = make_curriculum_agent()
        result = await agent.generate_quiz("Sorting Algorithms", 5)
        assert isinstance(result, dict)

    @pytest.mark.asyncio
    async def test_mocked_quiz_data(self):
        agent = make_curriculum_agent()
        fake = json.dumps({
            "questions": [
                {
                    "question": "What is Bubble Sort's complexity?",
                    "type": "multiple-choice",
                    "options": ["O(n)", "O(n^2)", "O(log n)", "O(n log n)"],
                    "correctAnswer": "O(n^2)",
                    "explanation": "Bubble sort does n^2 comparisons in the worst case."
                }
            ]
        })
        agent.generate = AsyncMock(return_value=fake)
        result = await agent.generate_quiz("Sorting", 1)
        assert "questions" in result
        assert len(result["questions"]) == 1

    @pytest.mark.asyncio
    async def test_custom_num_questions(self):
        agent = make_curriculum_agent()
        agent.generate = AsyncMock(return_value=json.dumps({"questions": [{}] * 10}))
        result = await agent.generate_quiz("Python", 10)
        assert isinstance(result, dict)


class TestGenerateProject:
    @pytest.mark.asyncio
    async def test_returns_dict(self):
        agent = make_curriculum_agent()
        result = await agent.generate_project("Web Development", "medium")
        assert isinstance(result, dict)

    @pytest.mark.asyncio
    async def test_mocked_project_data(self):
        agent = make_curriculum_agent()
        fake = json.dumps({
            "title": "Todo App",
            "description": "Build a full-stack todo application",
            "milestones": ["Setup", "Backend API", "Frontend UI", "Deploy"],
            "technologies": ["React", "Node.js"],
            "timeline": "2 weeks"
        })
        agent.generate = AsyncMock(return_value=fake)
        result = await agent.generate_project("Web Development", "medium")
        assert result["title"] == "Todo App"
        assert "milestones" in result


class TestGenerateFlashcards:
    @pytest.mark.asyncio
    async def test_returns_list_when_response_is_list(self):
        agent = make_curriculum_agent()
        fake = json.dumps([
            {"front": "What is Python?", "back": "A high-level programming language."},
            {"front": "What is a list?", "back": "An ordered collection of items."}
        ])
        agent.generate = AsyncMock(return_value=fake)
        result = await agent.generate_flashcards("Python", 2)
        assert isinstance(result, list)
        assert len(result) == 2

    @pytest.mark.asyncio
    async def test_returns_list_when_response_is_dict_with_key(self):
        agent = make_curriculum_agent()
        fake = json.dumps({
            "flashcards": [
                {"front": "Q1", "back": "A1"},
                {"front": "Q2", "back": "A2"}
            ]
        })
        agent.generate = AsyncMock(return_value=fake)
        result = await agent.generate_flashcards("Python", 2)
        assert isinstance(result, list)
        assert result[0]["front"] == "Q1"

    @pytest.mark.asyncio
    async def test_fallback_when_no_flashcards_key(self):
        agent = make_curriculum_agent()
        fake = json.dumps({"other_key": "value"})
        agent.generate = AsyncMock(return_value=fake)
        result = await agent.generate_flashcards("Topic", 5)
        assert isinstance(result, list)
        assert result == []
