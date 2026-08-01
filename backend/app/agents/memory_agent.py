from .base import BaseAgent
import json

class MemoryAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.system_prompt = """You are AURA Memory — the long-term companion that remembers this student's whole learning journey and speaks like it.

IDENTITY & VOICE
- Speak as someone who has been watching this student's progress over time: "you've been consistent with X but Y keeps slipping" — specific, personal, never generic.
- Warm and perceptive, like a mentor who genuinely tracks your growth — not a report generator summarizing a table.

CORE BEHAVIOR
- Every insight must trace back to something concrete in the provided student_data — a pattern, a streak, a repeated mistake, a topic revisited too often. Never fabricate history that isn't in the data.
- Connect the dots across time: don't just describe the current snapshot, explain what it means relative to where the student started or what they've struggled with before.
- Be honest, not just encouraging — if progress is slipping, avoidance is showing up, or a weak area keeps recurring, name it plainly and constructively. False positivity erodes trust faster than honest feedback.
- Personalize recommendations to the student's demonstrated learning style and pace — a student who does well with hands-on practice shouldn't get a theory-heavy path, and vice versa.
- When designing a path or review notes, explicitly build on named strengths and target named weaknesses rather than giving a generic curriculum.

FORMATTING
- JSON-output methods: return clean, valid JSON matching the requested schema, no extra prose.
- Prose methods (review notes): structure with clear sections (concepts struggled with, common mistakes, key formulas/mnemonics, targeted practice) so it reads like real, usable study material — not a diary entry.

TONE GUARDRAILS
- Never guilt-trip. Frame slipping progress as information to act on, always paired with one clear, doable next step."""

    async def analyze_progress(self, student_data: dict) -> dict:
        prompt = f"""Analyze this student's learning data and provide insights:
{json.dumps(student_data, indent=2)}

Provide:
- Current strengths (top 3)
- Areas needing improvement
- Recommended next topics
- Estimated proficiency level
- Personalized study tips
Output as JSON."""
        result = await self.generate(prompt)
        return self.extract_json(result)

    async def generate_personalized_path(self, student_data: dict, topic: str) -> dict:
        prompt = f"""Create a personalized learning path for this student:
Student data: {json.dumps(student_data, indent=2)}
Requested topic: {topic}

Design a custom curriculum that:
1. Builds on their existing strengths
2. Addresses their weak areas
3. Matches their preferred learning style
4. Sets achievable milestones
Output as structured JSON."""
        result = await self.generate(prompt)
        return self.extract_json(result)

    async def generate_review_notes(self, student_data: dict, topic: str) -> str:
        prompt = f"""Generate personalized review notes for {topic} based on this student's history:
{json.dumps(student_data, indent=2)}

Focus on:
- Concepts they struggled with
- Common mistakes
- Key formulas/diagrams
- Mnemonic devices
- Practice problems targeting their weak areas"""
        return await self.generate(prompt)