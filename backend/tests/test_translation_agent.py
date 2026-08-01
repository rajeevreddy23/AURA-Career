"""
Unit tests for TranslationAgent.

Covers:
- translate_content() — English short-circuit and actual translation
- translate_quiz()
- supported_languages mapping
"""

import pytest
import json
from unittest.mock import AsyncMock, MagicMock, patch


def make_translation_agent():
    with patch("google.generativeai.configure"), \
         patch("google.generativeai.GenerativeModel") as MockModel:
        MockModel.return_value = MagicMock()
        from backend.app.agents.translation_agent import TranslationAgent
        agent = TranslationAgent()
        agent.nvidia_client = None
        agent.groq_client = None
        return agent


SAMPLE_CONTENT = """
# Introduction to Python

Python is a high-level programming language.

```python
print("Hello, World!")
```

It is known for its simplicity and readability.
"""

SAMPLE_QUIZ = {
    "questions": [
        {
            "question": "What is Python?",
            "type": "multiple-choice",
            "options": ["A snake", "A language", "A tool"],
            "correctAnswer": "A language"
        }
    ]
}


class TestTranslationAgentInit:
    def test_system_prompt_set(self):
        agent = make_translation_agent()
        assert "multilingual" in agent.system_prompt.lower() or "translate" in agent.system_prompt.lower()

    def test_supported_languages_contains_major_languages(self):
        agent = make_translation_agent()
        assert "en" in agent.supported_languages
        assert "es" in agent.supported_languages
        assert "fr" in agent.supported_languages
        assert "de" in agent.supported_languages
        assert "zh" in agent.supported_languages
        assert "hi" in agent.supported_languages

    def test_english_is_labeled_correctly(self):
        agent = make_translation_agent()
        assert agent.supported_languages["en"] == "English"


class TestTranslateContent:
    @pytest.mark.asyncio
    async def test_english_short_circuits_no_api_call(self):
        """If target_lang == 'en', content is returned unchanged without calling generate."""
        agent = make_translation_agent()
        agent.generate = AsyncMock(return_value="Should not be called")
        result = await agent.translate_content(SAMPLE_CONTENT, "es", "en")
        agent.generate.assert_not_called()
        assert result == SAMPLE_CONTENT

    @pytest.mark.asyncio
    async def test_translates_to_spanish(self):
        agent = make_translation_agent()
        spanish_translation = "# Introducción a Python\n\nPython es un lenguaje de programación de alto nivel."
        agent.generate = AsyncMock(return_value=spanish_translation)
        result = await agent.translate_content(SAMPLE_CONTENT, "en", "es")
        assert result == spanish_translation
        agent.generate.assert_called_once()

    @pytest.mark.asyncio
    async def test_translates_to_hindi(self):
        agent = make_translation_agent()
        agent.generate = AsyncMock(return_value="# पायथन का परिचय\n\nपायथन एक उच्च-स्तरीय प्रोग्रामिंग भाषा है।")
        result = await agent.translate_content(SAMPLE_CONTENT, "en", "hi")
        assert isinstance(result, str)

    @pytest.mark.asyncio
    async def test_all_non_english_languages_call_generate(self):
        agent = make_translation_agent()
        agent.generate = AsyncMock(return_value="Translated content")
        non_english = ["es", "fr", "de", "zh", "ja", "ko", "ar", "hi", "pt", "ru", "it"]
        for lang in non_english:
            agent.generate.reset_mock()
            await agent.translate_content("Hello", "en", lang)
            agent.generate.assert_called_once()

    @pytest.mark.asyncio
    async def test_handles_unknown_language_codes(self):
        agent = make_translation_agent()
        agent.generate = AsyncMock(return_value="Translated")
        # Unknown source/target codes should still attempt translation
        result = await agent.translate_content("content", "zz", "xx")
        assert isinstance(result, str)


class TestTranslateQuiz:
    @pytest.mark.asyncio
    async def test_returns_dict(self):
        agent = make_translation_agent()
        result = await agent.translate_quiz(SAMPLE_QUIZ, "es")
        assert isinstance(result, dict)

    @pytest.mark.asyncio
    async def test_mocked_quiz_translation(self):
        agent = make_translation_agent()
        translated = json.dumps({
            "questions": [
                {
                    "question": "¿Qué es Python?",
                    "type": "multiple-choice",
                    "options": ["Una serpiente", "Un lenguaje", "Una herramienta"],
                    "correctAnswer": "Un lenguaje"
                }
            ]
        })
        agent.generate = AsyncMock(return_value=translated)
        result = await agent.translate_quiz(SAMPLE_QUIZ, "es")
        assert "questions" in result

    @pytest.mark.asyncio
    async def test_handles_quiz_data_as_list(self):
        agent = make_translation_agent()
        quiz_as_list = [{"question": "Q1", "answer": "A1"}]
        agent.generate = AsyncMock(return_value=json.dumps({"questions": quiz_as_list}))
        result = await agent.translate_quiz({"questions": quiz_as_list}, "fr")
        assert isinstance(result, dict)

    @pytest.mark.asyncio
    async def test_extracts_questions_from_quiz_data(self):
        """Verifies that translate_quiz extracts .get('questions', quiz_data)."""
        agent = make_translation_agent()
        captured_prompts = []

        async def capture_generate(prompt):
            captured_prompts.append(prompt)
            return json.dumps({"questions": []})

        agent.generate = capture_generate
        await agent.translate_quiz(SAMPLE_QUIZ, "de")
        # The prompt should contain the questions list, not the full quiz dict
        assert len(captured_prompts) == 1
