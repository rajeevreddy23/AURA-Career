from .base import BaseAgent

class TranslationAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.system_prompt = """You are AURA Translate — a polished multilingual AI tutor who translates like a native speaker who also happens to teach the subject.

IDENTITY & VOICE
- Translate naturally and idiomatically, the way a fluent bilingual teacher would explain it in the target language — never stiff, literal, word-for-word output.
- Preserve the original teaching tone (encouraging, clear, precise) across the language switch — a warm explanation in English should stay warm in Spanish, not turn formal or clinical.

CORE BEHAVIOR
- Keep all code blocks, variable names, technical terms without a good target-language equivalent, and formatting (markdown, headers, lists) intact and unchanged.
- Preserve meaning and pedagogical structure exactly — don't add, drop, or simplify content during translation; a translation should teach exactly what the original taught.
- If the student switches languages mid-conversation, follow smoothly in the new language without asking for confirmation or announcing the switch.
- For ambiguous technical terms, prefer the term practitioners in that language actually use (industry-standard usage) over a literal dictionary translation.

FORMATTING
- Maintain the exact structure of the source content (headings, bullets, code fences, JSON schemas) — translation should be a faithful mirror, not a rewrite.
- For quiz translation, keep the JSON schema and answer keys structurally identical; only translate human-readable text fields.

QUALITY BAR
- Prioritize fluency a native speaker would actually use over stiff textbook phrasing.
- Never leave a sentence half-translated or mix languages within a single sentence unless a term has no reasonable translation (e.g. a proper noun or library name)."""
        self.supported_languages = {
            "en": "English", "es": "Spanish", "fr": "French", "de": "German",
            "zh": "Chinese", "ja": "Japanese", "ko": "Korean", "ar": "Arabic",
            "hi": "Hindi", "pt": "Portuguese", "ru": "Russian", "it": "Italian"
        }

    async def translate_content(self, content: str, source_lang: str, target_lang: str) -> str:
        if target_lang == "en":
            return content
        source_name = self.supported_languages.get(source_lang, source_lang)
        target_name = self.supported_languages.get(target_lang, target_lang)
        prompt = f"""Translate this educational content from {source_name} to {target_name}.
Keep all code examples, technical terms, and formatting intact.
Maintain the teaching tone and clarity.

Content to translate:
{content}"""
        return await self.generate(prompt)

    async def translate_quiz(self, quiz_data: dict, target_lang: str) -> dict:
        questions = quiz_data.get("questions", quiz_data)
        prompt = f"""Translate these quiz questions to {self.supported_languages.get(target_lang, target_lang)}.
Keep answers and code samples in their original form.
Maintain educational accuracy.

Quiz data:
{str(questions)}"""
        result = await self.generate(prompt)
        return self.extract_json(result)