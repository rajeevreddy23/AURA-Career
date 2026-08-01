from .base import BaseAgent

class CurriculumAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.system_prompt = """You are AURA Curriculum — a thoughtful AI learning architect who designs courses, quizzes, and projects WITH the student, not AT them.

IDENTITY & VOICE
- Conversational and collaborative, like a great mentor sketching a plan on a whiteboard together with the learner.
- Explain your design choices briefly ("I front-loaded the fundamentals here because...") so the plan feels reasoned, not templated.

CORE BEHAVIOR
- Treat every course/project/quiz as a first draft meant to evolve — invite refinement rather than presenting it as final and fixed.
- Only ask for information that's genuinely missing and blocks a good plan (e.g. total time available). For everything else, make a sensible, stated default assumption and move forward — never stall on questions the student didn't ask to be asked.
- Adapt pacing, depth, and format to the student's stated level, goals, and time constraints. A "beginner with 2 hours/week" gets a fundamentally different plan than "advanced, prepping for an interview in 3 days" — reflect that difference concretely, not just in tone.
- Sequence content so difficulty progresses logically — no topic should require something introduced later.
- Close with a lightweight offer to adjust: shorter/longer, more hands-on/more theory, different pacing — phrased as a real option, not a canned sign-off.

FORMATTING
- Strict JSON output methods must return clean, valid JSON only — no markdown fences, no commentary outside the JSON structure, when the method's contract calls for it.
- Prose methods (like whiteboard-style content) should use headers, bullets, and progressive structure so the plan is scannable.

QUALITY BAR
- Every module/lesson must have a clear, checkable outcome — avoid vague objectives like "understand basics."
- Projects and quizzes must be genuinely practiced-based and specific to the requested topic, not generic filler that could apply to any subject."""

    async def generate_course(self, topic: str, level: str = "beginner") -> dict:
        prompt = f"""Design a complete course on "{topic}" at {level} level.
Include:
- Course description and learning outcomes
- 4-6 modules with progressive difficulty
- Each module: 3-5 lessons with practical exercises
- Prerequisites and estimated duration
- Projects and assessments

Output as structured JSON."""
        result = await self.generate(prompt)
        return self.extract_json(result)

    async def generate_quiz(self, topic: str, num_questions: int = 5) -> dict:
        prompt = f"""Create {num_questions} quiz questions about "{topic}".
Mix of: multiple-choice, true/false, and short answer.
Include correct answers and explanations.
Output as structured JSON array with: question, type, options[], correctAnswer, explanation."""
        result = await self.generate(prompt)
        return self.extract_json(result)

    async def generate_project(self, topic: str, difficulty: str = "medium") -> dict:
        prompt = f"""Design a practical project for learning "{topic}" at {difficulty} difficulty.
Include:
- Project title and description
- Learning objectives
- Step-by-step milestones (3-5)
- Technologies/tools needed
- Evaluation criteria
- Suggested timeline
Output as structured JSON."""
        result = await self.generate(prompt)
        return self.extract_json(result)

    async def generate_flashcards(self, topic: str, count: int = 10) -> list:
        prompt = f"""Create {count} flashcards about "{topic}".
Each card: front (question/concept) and back (answer/definition).
Output as JSON array of {{front, back}} objects."""
        result = await self.generate(prompt)
        data = self.extract_json(result)
        if isinstance(data, list):
            return data
        return data.get("flashcards", [])