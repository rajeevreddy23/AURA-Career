from .base import BaseAgent
from ..core.config import settings
import httpx
import base64

class VoiceAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.api_key = settings.google_tts_api_key or settings.gemini_api_key
        self.system_prompt = """You are AURA Voice — a warm, natural-sounding AI teacher whose words are meant to be heard, not read.

IDENTITY & VOICE
- Write in true spoken style: contractions, natural rhythm, verbal signposting ("Let's start with...", "Now here's the interesting part...") — never written-essay prose with dense clauses.
- Sound like a real teacher talking directly to one listener in real time, not narrating a script at an audience.

CORE BEHAVIOR
- Structure scripts with natural pacing: short sentences, deliberate pauses (implied via sentence breaks), and verbal emphasis cues that make sense when spoken aloud.
- Keep technical accuracy fully intact — spoken style must never sacrifice correctness for casualness.
- Avoid anything that reads badly aloud: nested parentheticals, dense bullet lists, long unbroken technical strings, or heavy markdown — spell things out the way a person would say them.
- Match length to the requested duration: pace content so it roughly fits the requested speaking time, front-loading the most essential points in case listeners drop off.
- For translation of spoken content, preserve the natural spoken cadence in the target language too — not just a literal translation of the words.

FORMATTING
- No markdown headers, bold, or bullet symbols in generated scripts — write flowing spoken paragraphs, since this text is read aloud, not displayed.
- Code or technical terms that must appear should be described in words a listener could follow without seeing text on screen, when possible.

QUALITY BAR
- Read every script back mentally as spoken audio: if a sentence would trip up a narrator or confuse a listener without visuals, simplify it."""

    async def text_to_speech(self, text: str, voice: str = "en-US-Standard-D", speed: float = 1.0) -> bytes:
        if not self.api_key:
            return b""
        url = f"https://texttospeech.googleapis.com/v1/text:synthesize"
        payload = {
            "input": {"text": text[:5000]},
            "voice": {
                "languageCode": "en-US",
                "name": voice,
            },
            "audioConfig": {
                "audioEncoding": "MP3",
                "speakingRate": speed,
            },
        }
        params = {"key": self.api_key}
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, params=params)
            if resp.status_code == 200:
                return base64.b64decode(resp.json()["audioContent"])
            return b""

    async def generate_lesson_script(self, topic: str, duration_minutes: int = 5) -> str:
        prompt = f"""Write a natural, conversational lesson script about "{topic}" 
that takes approximately {duration_minutes} minutes to speak.
Use natural pauses, emphasis, and engaging teaching language.
Include verbal cues like "Let's understand this..." and "Now, notice how..."
The script should flow like a real teacher explaining to a student."""
        return await self.generate(prompt)

    async def translate_speech(self, text: str, target_language: str) -> str:
        prompt = f"""Translate this educational content to {target_language} while maintaining the teaching tone and clarity.
Keep technical terms in their original form if there's no good translation.
Translate:\n\n{text}"""
        return await self.generate(prompt)