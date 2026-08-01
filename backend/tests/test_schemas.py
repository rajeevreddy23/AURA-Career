"""
Unit tests for Pydantic schemas (agent_schemas.py).

Covers validation for:
- AgentRequest
- AgentResponse
- LessonRequest
- DoubtRequest
- CodeRequest
- QuizRequest
- ProjectRequest
- TranslateRequest
- VoiceRequest
- GenerateRequest
"""

import pytest
from pydantic import ValidationError


def import_schemas():
    from backend.app.schemas.agent_schemas import (
        AgentRequest, AgentResponse, LessonRequest, DoubtRequest,
        CodeRequest, QuizRequest, ProjectRequest, TranslateRequest,
        VoiceRequest, GenerateRequest
    )
    return (AgentRequest, AgentResponse, LessonRequest, DoubtRequest,
            CodeRequest, QuizRequest, ProjectRequest, TranslateRequest,
            VoiceRequest, GenerateRequest)


class TestAgentRequest:
    def test_valid_agent_request(self):
        AgentRequest, *_ = import_schemas()
        req = AgentRequest(agent_type="teacher", action="lesson", payload={"topic": "Python"})
        assert req.agent_type == "teacher"
        assert req.action == "lesson"
        assert req.payload == {"topic": "Python"}

    def test_missing_required_fields_raises(self):
        AgentRequest, *_ = import_schemas()
        with pytest.raises(ValidationError):
            AgentRequest(agent_type="teacher")  # missing action and payload


class TestAgentResponse:
    def test_success_response(self):
        _, AgentResponse, *_ = import_schemas()
        resp = AgentResponse(success=True, data={"result": "ok"})
        assert resp.success is True
        assert resp.data == {"result": "ok"}
        assert resp.error is None

    def test_error_response(self):
        _, AgentResponse, *_ = import_schemas()
        resp = AgentResponse(success=False, error="Something failed")
        assert resp.success is False
        assert resp.error == "Something failed"
        assert resp.data is None

    def test_minimal_response(self):
        _, AgentResponse, *_ = import_schemas()
        resp = AgentResponse(success=True)
        assert resp.success is True


class TestLessonRequest:
    def test_valid_with_defaults(self):
        _, _, LessonRequest, *_ = import_schemas()
        req = LessonRequest(topic="Python")
        assert req.topic == "Python"
        assert req.level == "beginner"
        assert req.language == "en"
        assert req.student_context is None

    def test_custom_level_and_language(self):
        _, _, LessonRequest, *_ = import_schemas()
        req = LessonRequest(topic="Django", level="intermediate", language="es")
        assert req.level == "intermediate"
        assert req.language == "es"

    def test_with_student_context(self):
        _, _, LessonRequest, *_ = import_schemas()
        req = LessonRequest(topic="React", student_context={"prev_lessons": ["JS"]})
        assert req.student_context == {"prev_lessons": ["JS"]}

    def test_missing_topic_raises(self):
        _, _, LessonRequest, *_ = import_schemas()
        with pytest.raises(ValidationError):
            LessonRequest()  # topic is required


class TestDoubtRequest:
    def test_valid_doubt_request(self):
        _, _, _, DoubtRequest, *_ = import_schemas()
        req = DoubtRequest(
            question="What is a closure?",
            lesson_id="lesson-123",
            lesson_context="We are studying JavaScript scope"
        )
        assert req.question == "What is a closure?"
        assert req.lesson_id == "lesson-123"
        assert req.language == "en"

    def test_missing_fields_raises(self):
        _, _, _, DoubtRequest, *_ = import_schemas()
        with pytest.raises(ValidationError):
            DoubtRequest(question="Q?")  # missing lesson_id and lesson_context


class TestCodeRequest:
    def test_valid_with_defaults(self):
        schemas = import_schemas()
        CodeRequest = schemas[4]
        req = CodeRequest(code="print('hello')")
        assert req.code == "print('hello')"
        assert req.language == "python"
        assert req.action == "explain"
        assert req.error is None

    def test_with_error_field(self):
        schemas = import_schemas()
        CodeRequest = schemas[4]
        req = CodeRequest(code="x = 1/0", language="python", error="ZeroDivisionError")
        assert req.error == "ZeroDivisionError"

    def test_missing_code_raises(self):
        schemas = import_schemas()
        CodeRequest = schemas[4]
        with pytest.raises(ValidationError):
            CodeRequest()  # code is required


class TestQuizRequest:
    def test_valid_with_defaults(self):
        schemas = import_schemas()
        QuizRequest = schemas[5]
        req = QuizRequest(topic="Sorting")
        assert req.topic == "Sorting"
        assert req.num_questions == 5
        assert req.difficulty == "medium"
        assert req.language == "en"

    def test_custom_quiz_request(self):
        schemas = import_schemas()
        QuizRequest = schemas[5]
        req = QuizRequest(topic="Algorithms", num_questions=10, difficulty="hard", language="fr")
        assert req.num_questions == 10
        assert req.difficulty == "hard"


class TestProjectRequest:
    def test_valid_project_request(self):
        schemas = import_schemas()
        ProjectRequest = schemas[6]
        req = ProjectRequest(topic="REST API")
        assert req.topic == "REST API"
        assert req.difficulty == "medium"

    def test_custom_difficulty(self):
        schemas = import_schemas()
        ProjectRequest = schemas[6]
        req = ProjectRequest(topic="AI Chatbot", difficulty="hard")
        assert req.difficulty == "hard"


class TestTranslateRequest:
    def test_valid_translate_request(self):
        schemas = import_schemas()
        TranslateRequest = schemas[7]
        req = TranslateRequest(content="Hello world", target_language="es")
        assert req.content == "Hello world"
        assert req.target_language == "es"
        assert req.source_language == "en"

    def test_custom_source_language(self):
        schemas = import_schemas()
        TranslateRequest = schemas[7]
        req = TranslateRequest(content="Bonjour", target_language="de", source_language="fr")
        assert req.source_language == "fr"


class TestVoiceRequest:
    def test_valid_voice_request(self):
        schemas = import_schemas()
        VoiceRequest = schemas[8]
        req = VoiceRequest(text="Hello students")
        assert req.text == "Hello students"
        assert req.voice == "en-US-Standard-D"
        assert req.speed == 1.0

    def test_custom_voice_settings(self):
        schemas = import_schemas()
        VoiceRequest = schemas[8]
        req = VoiceRequest(text="Welcome!", voice="en-US-Wavenet-A", speed=1.25)
        assert req.speed == 1.25


class TestGenerateRequest:
    def test_valid_generate_request(self):
        schemas = import_schemas()
        GenerateRequest = schemas[9]
        req = GenerateRequest(prompt="Explain recursion")
        assert req.prompt == "Explain recursion"
        assert req.model == "gemini-2.0-flash"
        assert req.stream is False

    def test_with_system_prompt(self):
        schemas = import_schemas()
        GenerateRequest = schemas[9]
        req = GenerateRequest(prompt="Hello", system_prompt="You are a teacher")
        assert req.system_prompt == "You are a teacher"

    def test_missing_prompt_raises(self):
        schemas = import_schemas()
        GenerateRequest = schemas[9]
        with pytest.raises(ValidationError):
            GenerateRequest()  # prompt is required
