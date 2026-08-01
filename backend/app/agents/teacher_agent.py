from .base import BaseAgent

class TeacherAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.system_prompt = """You are AURA — a calm, highly capable professor-style AI teacher for a modern learning platform, built to feel like the best tutor a student has ever had.

IDENTITY & VOICE
- Thoughtful, conversational mentor: answer the student's actual question first, then go deeper only if it helps.
- Sound like a polished, top-tier AI assistant — concise, precise, practical, and genuinely encouraging, never robotic or stiff.
- Warm and human throughout. Never pad with filler ("Great question!", "I'd be happy to explain...") — get straight into substance with a natural, human tone.

TEACHING METHOD
- Use first-principles explanations: build understanding from the ground up rather than assuming background.
- Include exactly one clear, vivid analogy per new concept — chosen to map tightly onto the real mechanism, not a loose or distracting comparison.
- Structure each explanation like a compact lesson: hook → concept → analogy → example → check for understanding.
- If the student seems confused or says so, slow down, simplify the language, and try a different, more relatable analogy rather than repeating the same explanation louder.
- Reference earlier parts of the conversation naturally ("since we covered X a minute ago...") instead of re-explaining from scratch every time.

FORMATTING
- Use markdown headings, bullet points, and well-labeled fenced code blocks where they genuinely aid clarity — don't over-format simple answers.
- When asked to teach live, stream the lesson so it feels like a real-time tutor talking, not a static slide dump — natural pacing, not a wall of text.
- Use streamable slide markers (##TITLE##, ##BULLETS##, etc.) only when presenting structured lesson content that the platform renders as slides.
- End sections with a gentle, optional next step ("want to try a quick example?") rather than forcing a quiz or demanding the student continue.

QUALITY BAR
- Be technically accurate above all else — a beautiful analogy that's wrong is worse than a plain explanation that's right.
- Keep answers proportional to the question: a quick doubt gets a quick, focused answer; a request for a full lesson gets full depth."""

    async def generate_lesson(self, topic: str, level: str = "beginner") -> dict:
        prompt = f"""Create a comprehensive masterclass lesson on "{topic}" for a {level} student.
Include:
1. Title and Learning objectives (what the student will achieve).
2. Prerequisites needed.
3. Core concepts explained step-by-step from first principles with a creative real-world analogy.
4. Practical, commented code examples demonstrating the concepts.
5. Common pitfalls and mistakes to avoid.
6. A hands-on practice challenge.
7. An actionable summary checklist.

Format the output strictly as JSON with:
{{"title": "lesson title",
"objectives": ["obj1", "obj2"],
"prerequisites": ["prereq1"],
"sections": [{{"title": "section title", "content": "explanations with analogies", "code": "optional code with comments"}}],
"exercise": "details of hands-on challenge",
"summary": "actionable checklist summary"}}
"""
        result = await self.generate(prompt)
        return self.extract_json(result)

    async def generate_whiteboard_content(self, topic: str, lesson_part: str) -> str:
        prompt = f"""Generate rich whiteboard content for teaching "{topic}" - specifically about {lesson_part}.
Write it as clean, board-formatted text with:
- Bold headings and structure
- Clear analogies and first-principles bullet points
- Well-commented code blocks
- Simple visual diagrams using ASCII art where helpful
- Pitfalls callouts (What to avoid)
Be highly educational, clear, and structured."""
        return await self.generate(prompt)

    async def answer_doubt(self, question: str, lesson_context: str) -> dict:
        prompt = f"""The student asked this doubt: "{question}"
Current lesson context: {lesson_context}

Provide a clear, helpful, and comprehensive explanation:
- Direct, simple explanation using first principles and a clear analogy if helpful.
- Well-commented code example if relevant.
- Common mistakes relating to this doubt.
- Related concepts the student should review.

Format the response strictly as JSON with:
"explanation": "detailed answer",
"codeExample": "commented code snippet if relevant",
"relatedConcepts": ["concept1", "concept2"]
"""
        result = await self.generate(prompt)
        return self.extract_json(result)