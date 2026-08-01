"""
Unit tests for MemoryAgent.

Covers:
- analyze_progress()
- generate_personalized_path()
- generate_review_notes()
"""

import pytest
import json
from unittest.mock import AsyncMock, MagicMock, patch


def make_memory_agent():
    with patch("google.generativeai.configure"), \
         patch("google.generativeai.GenerativeModel") as MockModel:
        MockModel.return_value = MagicMock()
        from backend.app.agents.memory_agent import MemoryAgent
        agent = MemoryAgent()
        agent.nvidia_client = None
        agent.groq_client = None
        return agent


STUDENT_DATA = {
    "name": "Alice",
    "courses": ["Python 101", "Data Structures"],
    "quiz_scores": {"Python 101": 85, "Data Structures": 62},
    "study_hours_per_week": 6,
    "preferred_style": "visual",
    "weak_topics": ["Recursion", "Trees"],
    "strong_topics": ["Variables", "Loops", "Functions"],
}


class TestMemoryAgentInit:
    def test_system_prompt_contains_companion(self):
        agent = make_memory_agent()
        assert "companion" in agent.system_prompt.lower() or "memory" in agent.system_prompt.lower()

    def test_system_prompt_mentions_history(self):
        agent = make_memory_agent()
        assert "history" in agent.system_prompt.lower()


class TestAnalyzeProgress:
    @pytest.mark.asyncio
    async def test_returns_dict(self):
        agent = make_memory_agent()
        result = await agent.analyze_progress(STUDENT_DATA)
        assert isinstance(result, dict)

    @pytest.mark.asyncio
    async def test_mocked_progress_analysis(self):
        agent = make_memory_agent()
        fake = json.dumps({
            "strengths": ["Variables", "Loops", "Functions"],
            "areasForImprovement": ["Recursion", "Trees"],
            "nextTopics": ["Graphs", "Dynamic Programming"],
            "proficiencyLevel": "intermediate",
            "studyTips": ["Use visual diagrams for trees", "Practice recursion daily"]
        })
        agent.generate = AsyncMock(return_value=fake)
        result = await agent.analyze_progress(STUDENT_DATA)
        assert "strengths" in result
        assert "proficiencyLevel" in result

    @pytest.mark.asyncio
    async def test_serializes_student_data_as_json(self):
        """Ensures json.dumps is called on student_data (no TypeError)."""
        agent = make_memory_agent()
        complex_data = {
            "nested": {"key": "value"},
            "list_field": [1, 2, 3],
            "score": 95.5
        }
        result = await agent.analyze_progress(complex_data)
        assert isinstance(result, dict)

    @pytest.mark.asyncio
    async def test_empty_student_data(self):
        agent = make_memory_agent()
        result = await agent.analyze_progress({})
        assert isinstance(result, dict)


class TestGeneratePersonalizedPath:
    @pytest.mark.asyncio
    async def test_returns_dict(self):
        agent = make_memory_agent()
        result = await agent.generate_personalized_path(STUDENT_DATA, "Machine Learning")
        assert isinstance(result, dict)

    @pytest.mark.asyncio
    async def test_mocked_personalized_path(self):
        agent = make_memory_agent()
        fake = json.dumps({
            "topic": "Machine Learning",
            "customCurriculum": [
                {"week": 1, "topic": "Linear Algebra Review"},
                {"week": 2, "topic": "Intro to Numpy"},
                {"week": 3, "topic": "Linear Regression"},
            ],
            "milestones": ["Complete Week 1", "Build first model"],
            "estimatedDuration": "8 weeks"
        })
        agent.generate = AsyncMock(return_value=fake)
        result = await agent.generate_personalized_path(STUDENT_DATA, "Machine Learning")
        assert result["topic"] == "Machine Learning"
        assert "customCurriculum" in result

    @pytest.mark.asyncio
    async def test_different_topics(self):
        agent = make_memory_agent()
        for topic in ("JavaScript", "System Design", "Database Design"):
            result = await agent.generate_personalized_path(STUDENT_DATA, topic)
            assert isinstance(result, dict)


class TestGenerateReviewNotes:
    @pytest.mark.asyncio
    async def test_returns_string(self):
        agent = make_memory_agent()
        result = await agent.generate_review_notes(STUDENT_DATA, "Recursion")
        assert isinstance(result, str)
        assert len(result) > 0

    @pytest.mark.asyncio
    async def test_mocked_review_notes(self):
        agent = make_memory_agent()
        expected = "# Recursion Review\n\nYou struggled with base cases. Remember: every recursive function needs a base case to stop!"
        agent.generate = AsyncMock(return_value=expected)
        result = await agent.generate_review_notes(STUDENT_DATA, "Recursion")
        assert result == expected

    @pytest.mark.asyncio
    async def test_different_review_topics(self):
        agent = make_memory_agent()
        for topic in ("Binary Trees", "Dynamic Programming", "Graph Traversal"):
            result = await agent.generate_review_notes(STUDENT_DATA, topic)
            assert isinstance(result, str)
