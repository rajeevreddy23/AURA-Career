import base64
import logging
import re
from typing import Any, Dict, List, Optional
import httpx

from .base import BaseAgent
from ..core.config import settings

logger = logging.getLogger(__name__)

SUPPORTED_VOICES = [
    {"id": "en-US-Neural2-D", "name": "AURA US Male (Neural)", "gender": "male", "language": "en-US"},
    {"id": "en-US-Neural2-F", "name": "AURA US Female (Neural)", "gender": "female", "language": "en-US"},
    {"id": "en-US-Standard-D", "name": "AURA US Male (Standard)", "gender": "male", "language": "en-US"},
    {"id": "en-US-Standard-C", "name": "AURA US Female (Standard)", "gender": "female", "language": "en-US"},
    {"id": "en-GB-Neural2-B", "name": "AURA UK Male (Neural)", "gender": "male", "language": "en-GB"},
    {"id": "en-GB-Neural2-A", "name": "AURA UK Female (Neural)", "gender": "female", "language": "en-GB"},
    {"id": "es-ES-Neural2-B", "name": "AURA Spanish Male", "gender": "male", "language": "es-ES"},
    {"id": "es-ES-Neural2-A", "name": "AURA Spanish Female", "gender": "female", "language": "es-ES"},
    {"id": "fr-FR-Neural2-B", "name": "AURA French Male", "gender": "male", "language": "fr-FR"},
    {"id": "fr-FR-Neural2-A", "name": "AURA French Female", "gender": "female", "language": "fr-FR"},
    {"id": "de-DE-Neural2-B", "name": "AURA German Male", "gender": "male", "language": "de-DE"},
    {"id": "hi-IN-Neural2-B", "name": "AURA Hindi Male", "gender": "male", "language": "hi-IN"},
    {"id": "hi-IN-Neural2-A", "name": "AURA Hindi Female", "gender": "female", "language": "hi-IN"},
]


class VoiceAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.api_key = settings.google_tts_api_key or settings.gemini_api_key
        self.system_prompt = """You are AURA Voice — the premier conversational AI tutor and master educator whose explanations are crafted specifically to be HEARD, not read.

ROLE & PERSONA
- You speak with warmth, clarity, intellectual energy, and encouraging authority — like a world-class professor having an engaging 1-on-1 discussion with a curious student.
- You make complex technical concepts instantly understandable through vivid analogies, intuitive mental models, and clear verbal roadmaps.

SPOKEN STYLE & PACING
- Write in true spoken conversational English: use natural contractions ("we'll", "it's", "you're"), active verbs, and natural pauses.
- Use verbal signposts to guide the listener's mental focus:
  * "Let's break this down step-by-step..."
  * "Here's the key intuition to keep in mind..."
  * "Think of it like this..."
  * "Now, what happens if we look a little closer?"
- Keep sentence lengths varied: mix punchy short statements with smooth explanatory sentences.

PEDAGOGICAL EXCELLENCE
- Explain the "WHY" before the "HOW": give students an immediate reason to care.
- When explaining code or technical algorithms, translate abstract syntax into vivid physical analogies (e.g. pointers as sticky notes, queues as a line at a coffee shop).
- Never read out raw code syntax or brackets. Describe the logic and data flow in words a listener can easily picture without looking at a screen.

CRITICAL FORMATTING RULES FOR SPEECH ENGINES
- Strictly NEVER output markdown formatting: NO asterisks (**bold**), NO hashes (# headers), NO underscores, NO backticks (`code`), and NO bullet points (- or *).
- Form all ideas into smooth, flowing spoken paragraphs with standard punctuation (periods, commas, dashes, question marks).
- Read every sentence back mentally: if a sentence feels awkward, robotic, or dense when spoken aloud, rewrite it with simpler, punchier phrasing."""

    @staticmethod
    def clean_text_for_speech(text: str) -> str:
        """Strip markdown markers, code blocks, and symbols that disrupt speech flow."""
        if not text:
            return ""
        # Remove code blocks ```...```
        cleaned = re.sub(r"```[\s\S]*?```", "", text)
        # Convert links [text](url) -> text
        cleaned = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", cleaned)
        # Remove headers, bullets, bold, italics, backticks
        cleaned = re.sub(r"[#*_~`]", "", cleaned)
        # Remove bullet lists like "- " or "* " or "1. "
        cleaned = re.sub(r"^\s*[-*•]\s+", "", cleaned, flags=re.MULTILINE)
        cleaned = re.sub(r"^\s*\d+\.\s+", "", cleaned, flags=re.MULTILINE)
        # Normalize newlines into sentence pauses
        cleaned = re.sub(r"\n+", ". ", cleaned)
        # Collapse multiple spaces
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        return cleaned

    @staticmethod
    def get_available_voices() -> List[Dict[str, str]]:
        """Return list of supported voice models."""
        return SUPPORTED_VOICES

    def _extract_language_code(self, voice: str, language_code: Optional[str] = None) -> str:
        """Extract or infer BCP-47 language code from voice name or parameter."""
        if language_code:
            return language_code
        if voice and "-" in voice:
            parts = voice.split("-")
            if len(parts) >= 2:
                return f"{parts[0]}-{parts[1]}"
        return "en-US"

    async def text_to_speech(
        self,
        text: str,
        voice: str = "en-US-Standard-D",
        speed: float = 1.0,
        language_code: Optional[str] = None,
    ) -> bytes:
        """Convert text into synthesized MP3 audio bytes using Fish Audio (Tier 1) or Google TTS (Tier 2)."""
        clean_text = self.clean_text_for_speech(text)
        if not clean_text:
            logger.warning("[VoiceAgent] Empty text provided for TTS.")
            return b""

        # 1. Tier 1: Fish Audio Neural TTS Engine
        fish_key = settings.fish_audio_api_key
        if fish_key:
            try:
                headers = {
                    "Authorization": f"Bearer {fish_key}",
                    "Content-Type": "application/json",
                }
                payload = {
                    "text": clean_text[:4000],
                    "format": "mp3",
                    "latency": "normal",
                }
                async with httpx.AsyncClient(timeout=12.0) as client:
                    resp = await client.post("https://api.fish.audio/v1/tts", json=payload, headers=headers)
                    if resp.status_code == 200 and resp.content and len(resp.content) > 100:
                        logger.info(f"[VoiceAgent] Successfully synthesized {len(resp.content)} bytes via Fish Audio.")
                        return resp.content
                    else:
                        logger.warning(f"[VoiceAgent] Fish Audio API status {resp.status_code}: {resp.text[:200]}")
            except Exception as e:
                logger.warning(f"[VoiceAgent] Fish Audio call failed, falling back: {e}")

        # 2. Tier 2: Google Cloud TTS
        lang = self._extract_language_code(voice, language_code)
        if self.api_key:
            url = "https://texttospeech.googleapis.com/v1/text:synthesize"
            payload = {
                "input": {"text": clean_text[:5000]},
                "voice": {
                    "languageCode": lang,
                    "name": voice,
                },
                "audioConfig": {
                    "audioEncoding": "MP3",
                    "speakingRate": max(0.25, min(4.0, speed)),
                },
            }
            params = {"key": self.api_key}

            try:
                async with httpx.AsyncClient(timeout=12.0) as client:
                    resp = await client.post(url, json=payload, params=params)
                    if resp.status_code == 200:
                        data = resp.json()
                        if "audioContent" in data:
                            return base64.b64decode(data["audioContent"])
                    else:
                        logger.warning(
                            f"[VoiceAgent] Google TTS API returned status {resp.status_code}: {resp.text[:200]}"
                        )
            except Exception as e:
                logger.error(f"[VoiceAgent] Exception during Google TTS call: {e}")

        logger.info("[VoiceAgent] Server TTS audio fallback recommended.")
        return b""

    async def text_to_speech_base64(
        self,
        text: str,
        voice: str = "en-US-Standard-D",
        speed: float = 1.0,
        language_code: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Convert text to speech and return base64 audio payload with metadata."""
        audio_bytes = await self.text_to_speech(text, voice=voice, speed=speed, language_code=language_code)
        if not audio_bytes:
            return {
                "success": False,
                "audio_base64": None,
                "format": "mp3",
                "voice": voice,
                "message": "TTS audio synthesis unavailable or returned empty result. Client speech fallback recommended.",
            }
        return {
            "success": True,
            "audio_base64": base64.b64encode(audio_bytes).decode("utf-8"),
            "format": "mp3",
            "voice": voice,
            "byte_length": len(audio_bytes),
        }

    async def generate_lesson_script(self, topic: str, duration_minutes: int = 5, level: str = "Beginner") -> str:
        word_count = max(150, min(1200, duration_minutes * 140))
        prompt = f"""Create an immersive, conversational audio lesson script on the topic "{topic}" at a {level} level.
Target speaking duration: approximately {duration_minutes} minutes ({word_count} words).

STRUCTURE:
1. The Hook & Big Picture: Start immediately with a compelling real-world scenario or thought experiment that illustrates WHY this concept matters.
2. The Core Concept & Analogy: Explain the fundamental mechanism using a memorable everyday analogy.
3. Step-by-Step Breakdown: Walk through the flow of execution or thought process in plain, spoken terms without reading raw code syntax.
4. The "Aha!" Moment & Summary: Conclude with the single most important takeaway and an encouraging wrap-up.

STRICT RULES:
- Write strictly for spoken listening.
- NO markdown formatting (no asterisks, no hashes, no bullet points, no backticks).
- Use natural spoken transitions ("Here is why this is important...", "Let's see what happens next...").
- Output only the spoken script paragraphs."""
        return await self.generate(prompt)

    async def generate_slide_narration(self, slide_title: str, topic: str, example_title: str = "", key_points: Optional[List[str]] = None) -> str:
        points_text = ", ".join(key_points) if key_points else "core concepts"
        prompt = f"""Write a concise, engaging spoken narration (20 to 45 seconds) for a visual teaching slide.
Topic: {topic}
Slide Title: {slide_title}
Context: {example_title}
Key Ideas to Cover: {points_text}

GUIDELINES:
- Speak directly to the student as their live tutor.
- Explain the key intuition behind the slide in smooth spoken sentences.
- Strictly NO markdown formatting or bullet characters.
- Output only the spoken text."""
        return await self.generate(prompt)

    async def translate_speech(self, text: str, target_language: str) -> str:
        prompt = f"""Translate this spoken educational lesson into {target_language}.

CRITICAL INSTRUCTIONS:
- Translate for the EAR, not the eye: preserve natural spoken rhythm, warm conversational tone, and pedagogical clarity.
- Retain universal technical terms in their commonly recognized form where appropriate.
- Strictly NO markdown formatting, asterisks, bullet points, or code fences in the output.
- Output only the translated spoken text.

Original Script:
{text}"""
        return await self.generate(prompt)