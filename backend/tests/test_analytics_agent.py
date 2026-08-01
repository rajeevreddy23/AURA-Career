"""
Unit tests for AnalyticsAgent.

Covers:
- analyze_engagement()
- generate_report()
- predict_performance()
"""

import pytest
import json
from unittest.mock import AsyncMock, MagicMock, patch


def make_analytics_agent():
    with patch("google.generativeai.configure"), \
         patch("google.generativeai.GenerativeModel") as MockModel:
        MockModel.return_value = MagicMock()
        from backend.app.agents.analytics_agent import AnalyticsAgent
        agent = AnalyticsAgent()
        agent.nvidia_client = None
        agent.groq_client = None
        return agent


SAMPLE_STUDENT_DATA = {
    "user_id": "student123",
    "courses_enrolled": 3,
    "lessons_completed": 12,
    "total_lessons": 30,
    "avg_quiz_score": 72.5,
    "study_sessions": [
        {"date": "2024-01-15", "duration_minutes": 45},
        {"date": "2024-01-16", "duration_minutes": 20},
    ],
    "last_active": "2024-01-16",
}


class TestAnalyticsAgentInit:
    def test_system_prompt_set(self):
        agent = make_analytics_agent()
        assert "analytics" in agent.system_prompt.lower() or "data" in agent.system_prompt.lower()

    def test_system_prompt_discourages_raw_numbers(self):
        agent = make_analytics_agent()
        assert "numbers" in agent.system_prompt.lower() or "means" in agent.system_prompt.lower()


class TestAnalyzeEngagement:
    @pytest.mark.asyncio
    async def test_returns_dict(self):
        agent = make_analytics_agent()
        result = await agent.analyze_engagement(SAMPLE_STUDENT_DATA)
        assert isinstance(result, dict)

    @pytest.mark.asyncio
    async def test_mocked_engagement_data(self):
        agent = make_analytics_agent()
        fake = json.dumps({
            "engagementScore": 68,
            "dropoutRisk": "medium",
            "optimalStudyTimes": ["evening", "morning"],
            "interventions": ["Send reminder emails", "Offer study buddy"],
            "motivationalStrategies": ["Set small milestones"]
        })
        agent.generate = AsyncMock(return_value=fake)
        result = await agent.analyze_engagement(SAMPLE_STUDENT_DATA)
        assert result["engagementScore"] == 68
        assert result["dropoutRisk"] == "medium"

    @pytest.mark.asyncio
    async def test_handles_empty_student_data(self):
        agent = make_analytics_agent()
        result = await agent.analyze_engagement({})
        assert isinstance(result, dict)


class TestGenerateReport:
    @pytest.mark.asyncio
    async def test_returns_string(self):
        agent = make_analytics_agent()
        result = await agent.generate_report(SAMPLE_STUDENT_DATA, "weekly")
        assert isinstance(result, str)
        assert len(result) > 0

    @pytest.mark.asyncio
    async def test_mocked_weekly_report(self):
        agent = make_analytics_agent()
        expected_report = "Great week! You completed 5 lessons and scored 80% on quizzes."
        agent.generate = AsyncMock(return_value=expected_report)
        result = await agent.generate_report(SAMPLE_STUDENT_DATA, "weekly")
        assert result == expected_report

    @pytest.mark.asyncio
    async def test_different_timeframes(self):
        agent = make_analytics_agent()
        for timeframe in ("daily", "weekly", "monthly"):
            result = await agent.generate_report(SAMPLE_STUDENT_DATA, timeframe)
            assert isinstance(result, str)

    @pytest.mark.asyncio
    async def test_default_timeframe_is_weekly(self):
        agent = make_analytics_agent()
        # generate_report has default timeframe="weekly"
        result = await agent.generate_report(SAMPLE_STUDENT_DATA)
        assert isinstance(result, str)


class TestPredictPerformance:
    @pytest.mark.asyncio
    async def test_returns_dict(self):
        agent = make_analytics_agent()
        result = await agent.predict_performance(SAMPLE_STUDENT_DATA)
        assert isinstance(result, dict)

    @pytest.mark.asyncio
    async def test_mocked_performance_prediction(self):
        agent = make_analytics_agent()
        fake = json.dumps({
            "expectedCompletionDate": "2024-02-15",
            "estimatedFinalGrade": "B+",
            "conceptsForReview": ["Recursion", "Dynamic Programming"],
            "studyAdjustments": ["Increase daily study time to 1 hour"]
        })
        agent.generate = AsyncMock(return_value=fake)
        result = await agent.predict_performance(SAMPLE_STUDENT_DATA)
        assert "expectedCompletionDate" in result
        assert "estimatedFinalGrade" in result

    @pytest.mark.asyncio
    async def test_handles_sparse_data(self):
        agent = make_analytics_agent()
        sparse_data = {"user_id": "new_student", "lessons_completed": 0}
        result = await agent.predict_performance(sparse_data)
        assert isinstance(result, dict)
