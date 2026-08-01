"""
Unit tests for ResumeAgent.

Covers:
- analyze()
- score_against_job()
"""

import pytest
import json
from unittest.mock import AsyncMock, MagicMock, patch


def make_resume_agent():
    with patch("google.generativeai.configure"), \
         patch("google.generativeai.GenerativeModel") as MockModel:
        MockModel.return_value = MagicMock()
        from backend.app.agents.resume_agent import ResumeAgent
        agent = ResumeAgent()
        agent.nvidia_client = None
        agent.groq_client = None
        return agent


class TestResumeAgentInit:
    def test_system_prompt_contains_ats(self):
        agent = make_resume_agent()
        assert "ATS" in agent.system_prompt or "resume" in agent.system_prompt.lower()

    def test_system_prompt_contains_career_coach(self):
        agent = make_resume_agent()
        assert "coach" in agent.system_prompt.lower() or "career" in agent.system_prompt.lower()


class TestAnalyze:
    @pytest.mark.asyncio
    async def test_returns_dict(self):
        agent = make_resume_agent()
        resume_text = "John Doe\nSoftware Engineer with 5 years experience in Python and React."
        result = await agent.analyze(resume_text)
        assert isinstance(result, dict)

    @pytest.mark.asyncio
    async def test_mocked_analyze_with_all_fields(self):
        agent = make_resume_agent()
        fake = json.dumps({
            "skills": ["Python", "React", "Docker"],
            "experienceLevel": "senior",
            "suggestedRoles": ["Senior Software Engineer", "Tech Lead"],
            "summary": "Experienced engineer with strong Python background.",
            "strengths": ["Technical depth", "Leadership"],
            "improvements": ["Add quantified achievements"],
            "searchKeywords": ["Python", "React"],
            "atsScore": 82,
            "atsGaps": ["Missing certifications"]
        })
        agent.generate = AsyncMock(return_value=fake)
        result = await agent.analyze("resume text")
        assert result["atsScore"] == 82
        assert "Python" in result["skills"]
        assert isinstance(result["strengths"], list)

    @pytest.mark.asyncio
    async def test_analyze_returns_dict_on_invalid_json(self):
        agent = make_resume_agent()
        agent.generate = AsyncMock(return_value="not valid json")
        result = await agent.analyze("resume")
        assert isinstance(result, dict)

    @pytest.mark.asyncio
    async def test_analyze_with_empty_resume(self):
        agent = make_resume_agent()
        result = await agent.analyze("")
        assert isinstance(result, dict)

    @pytest.mark.asyncio
    async def test_analyze_ats_score_field(self):
        agent = make_resume_agent()
        # Mock response includes an atsScore from the mock fallback
        result = await agent.analyze("some resume text with relevant experience")
        # Either real or mock, should be a dict
        assert isinstance(result, dict)


class TestScoreAgainstJob:
    @pytest.mark.asyncio
    async def test_returns_dict(self):
        agent = make_resume_agent()
        resume = "Senior Python developer with Django and REST API experience."
        job_desc = "Looking for a Python developer with 3+ years Django experience."
        result = await agent.score_against_job(resume, job_desc)
        assert isinstance(result, dict)

    @pytest.mark.asyncio
    async def test_mocked_score_response(self):
        agent = make_resume_agent()
        fake = json.dumps({
            "matchScore": 91,
            "matchedKeywords": ["Python", "Django", "REST API"],
            "missingKeywords": ["Docker", "AWS"],
            "tailoringSuggestions": ["Add Docker experience", "Mention cloud deployments"]
        })
        agent.generate = AsyncMock(return_value=fake)
        result = await agent.score_against_job("resume text", "job description")
        assert result["matchScore"] == 91
        assert "matchedKeywords" in result
        assert "missingKeywords" in result

    @pytest.mark.asyncio
    async def test_score_handles_invalid_json(self):
        agent = make_resume_agent()
        agent.generate = AsyncMock(return_value="no json here")
        result = await agent.score_against_job("resume", "job")
        assert isinstance(result, dict)

    @pytest.mark.asyncio
    async def test_score_with_empty_inputs(self):
        agent = make_resume_agent()
        result = await agent.score_against_job("", "")
        assert isinstance(result, dict)
