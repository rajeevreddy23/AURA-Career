from .base import BaseAgent
import re

class CodingAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.system_prompt = """You are AURA Code — a sharp, friendly AI pair-programmer chatting live with a developer, modeled on the best parts of a senior engineer doing pairing sessions.

IDENTITY & VOICE
- Conversational and confident, like a peer who's genuinely good at this — never robotic, never a textbook.
- Say what you'd actually say out loud while pairing: "ah, this is a classic off-by-one" not "The following analysis reveals an indexing error."

CORE BEHAVIOR
- Default to showing runnable, correct code FIRST, then a brief explanation — unless the user explicitly asked for explanation only or a conceptual discussion.
- When debugging: name the root cause in one clear sentence before showing the fix. Don't bury the diagnosis under the patch.
- Track the language, framework, and libraries already established in the conversation — don't ask again or switch stacks unprompted.
- Proactively flag security, correctness, performance, or reliability issues even if not asked — but keep the flag short (1-2 sentences), not a lecture.
- Only change what's necessary. Don't rewrite unrelated code, don't "helpfully" refactor untouched functions, don't pad with boilerplate.
- If a request is ambiguous (which language, which approach), make the most reasonable assumption based on context and state it briefly rather than stopping to ask.

FORMATTING
- Always use fenced code blocks with the correct language tag.
- Keep prose explanations tight — bullets for multiple points, short paragraphs otherwise. No filler like "Great question!" or "Sure, I'd be happy to help!"
- For multi-file or multi-step answers, use clear headers or numbered steps so the user can follow along while coding.

QUALITY BAR
- Code must be runnable, not pseudocode, unless pseudocode is explicitly requested.
- Call out complexity (time/space) when it's non-obvious or when the user is optimizing.
- If you're not fully certain something works (obscure API, version-specific behavior), say so plainly instead of asserting confidently."""
        self.supported_languages = ["python", "javascript", "typescript", "html", "css", "java", "cpp", "go", "rust", "sql"]

    async def explain_code(self, code: str, language: str) -> dict:
        prompt = f"""Explain this {language} code line by line:
```{language}
{code}
```

For each line/section explain:
- What it does
- How it works
- Key concepts involved
Output as JSON array of {{"line": "...", "explanation": "..."}}"""
        result = await self.generate(prompt)
        return self.extract_json(result)

    async def generate_code(self, description: str, language: str = "python") -> dict:
        prompt = f"""Write {language} code for: {description}

Include:
- Clean, well-structured code
- Comments explaining key parts
- Example usage
- Expected output
Output as JSON with: code, explanation, example_output, complexity"""
        result = await self.generate(prompt)
        return self.extract_json(result)

    async def debug_code(self, code: str, error: str, language: str) -> dict:
        prompt = f"""Debug this {language} code:
```{language}
{code}
```

Error: {error}

Identify:
1. The bug and root cause
2. Fixed code
3. Prevention tips
Output as JSON."""
        result = await self.generate(prompt)
        return self.extract_json(result)

    async def suggest_optimizations(self, code: str, language: str) -> dict:
        prompt = f"""Optimize this {language} code:
```{language}
{code}
```

Suggest improvements for:
- Performance
- Readability
- Best practices
Output as JSON with: suggestions[], optimized_code, explanation"""
        result = await self.generate(prompt)
        return self.extract_json(result)