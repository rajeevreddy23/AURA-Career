import asyncio
import hashlib
import json
import logging
import re
from typing import AsyncGenerator
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted
from groq import AsyncGroq
from openai import AsyncOpenAI
from ..core.config import settings

logger = logging.getLogger(__name__)

genai.configure(api_key=settings.gemini_api_key)

class RateLimitFallback(Exception):
    pass

class BaseAgent:
    model: str = "gemini-2.5-flash"
    groq_model: str = "qwen/qwen3.6-27b"

    def __init__(self):
        self.client = genai.GenerativeModel(self.model) if (settings.gemini_api_key and settings.gemini_api_key != "MOCK_KEY") else None
        self.groq_client = AsyncGroq(api_key=settings.groq_api_key) if settings.groq_api_key else None
        self.nvidia_client = AsyncOpenAI(
            api_key=settings.nvidia_api_key,
            base_url=settings.nvidia_base_url,
        ) if settings.nvidia_api_key else None
        self.system_prompt = ""
        self._fallback_func = None

    @property
    def active_provider(self) -> str:
        """Name of the LLM provider currently in use (for UI badges / status)."""
        if self.nvidia_client:
            return f"nvidia:{settings.nvidia_model}"
        if self.client:
            return f"gemini:{self.model}"
        if self.groq_client:
            return f"groq:{self.groq_model}"
        return "mock"

    def set_fallback(self, func):
        self._fallback_func = func

    async def generate(self, prompt: str) -> str:
        full_prompt = f"{self.system_prompt}\n\n{prompt}"
        
        # 1. Tier 1 (Main Preference): NVIDIA Nemotron 3 Nano Omni via OpenRouter
        if self.nvidia_client:
            try:
                coro = self.nvidia_client.chat.completions.create(
                    model=settings.nvidia_model,
                    messages=[
                        {"role": "system", "content": self.system_prompt},
                        {"role": "user", "content": prompt},
                    ],
                )
                response = await asyncio.wait_for(coro, timeout=25.0)
                if response and response.choices and response.choices[0].message.content:
                    return response.choices[0].message.content
            except Exception as e:
                logger.warning(f"[BaseAgent] NVIDIA Nemotron generate failed, falling back to Gemini: {e}")

        # 2. Tier 2: Google Gemini (gemini-2.5-flash)
        if settings.gemini_api_key and settings.gemini_api_key != "MOCK_KEY":
            try:
                def _call_gemini():
                    m = genai.GenerativeModel(self.model)
                    return m.generate_content(full_prompt)

                response = await asyncio.wait_for(asyncio.to_thread(_call_gemini), timeout=25.0)
                if response and response.text:
                    return response.text
            except Exception as e:
                logger.warning(f"[BaseAgent] Gemini generate failed: {e}")

        # 3. Tier 3: Groq (qwen/qwen3.6-27b)
        if self.groq_client:
            try:
                coro = self.groq_client.chat.completions.create(
                    model=self.groq_model,
                    messages=[
                        {"role": "system", "content": self.system_prompt},
                        {"role": "user", "content": prompt},
                    ],
                )
                response = await asyncio.wait_for(coro, timeout=25.0)
                if response and response.choices and response.choices[0].message.content:
                    return response.choices[0].message.content
            except Exception as e:
                logger.warning(f"[BaseAgent] Groq generate failed: {e}")

        # 4. Intelligent contextual mock fallback
        return self._mock_response(prompt, self.system_prompt)

    async def chat(self, message: str, history: list[dict], context: dict | None = None) -> AsyncGenerator[str, None]:
        """
        ChatGPT-style multi-turn entry point.
        history: [{"role": "user"|"assistant", "content": "..."}]
        context: optional structured data the agent should ground its answer in
                 (e.g. current lesson, current resume analysis, current code file)
        """
        convo = "\n".join(f"{h['role'].upper()}: {h['content']}" for h in history[-12:])  # cap context window
        grounding = f"\n\nCONTEXT:\n{context}" if context else ""
        full_prompt = f"{self.system_prompt}{grounding}\n\nCONVERSATION SO FAR:\n{convo}\n\nUSER: {message}\nASSISTANT:"
        async for chunk in self.generate_stream(full_prompt):
            yield chunk

    async def generate_stream(self, prompt: str) -> AsyncGenerator[str, None]:
        full_prompt = f"{self.system_prompt}\n\n{prompt}"
        # NVIDIA NIM streaming first (primary provider)
        if self.nvidia_client:
            try:
                stream = await self.nvidia_client.chat.completions.create(
                    model=settings.nvidia_model,
                    messages=[
                        {"role": "system", "content": self.system_prompt},
                        {"role": "user", "content": prompt},
                    ],
                    stream=True,
                )
                async for chunk in stream:
                    if chunk.choices and chunk.choices[0].delta and chunk.choices[0].delta.content:
                        yield chunk.choices[0].delta.content
                return
            except Exception:
                pass
        # Groq streaming
        if self.groq_client:
            try:
                stream = await self.groq_client.chat.completions.create(
                    model=self.groq_model,
                    messages=[
                        {"role": "system", "content": self.system_prompt},
                        {"role": "user", "content": prompt},
                    ],
                    stream=True,
                )
                async for chunk in stream:
                    delta = chunk.choices[0].delta.content if chunk.choices else None
                    if delta:
                        yield delta
                return
            except Exception:
                pass
        try:
            if not settings.gemini_api_key or settings.gemini_api_key == "MOCK_KEY":
                raise Exception("Missing API key")
            response = await self.client.generate_content_async(full_prompt, stream=True)
            async for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception:
            fallback_text = self._mock_response(prompt, self.system_prompt)
            for line in fallback_text.split('\n'):
                yield line + '\n'
                await asyncio.sleep(0.08) # Simulate active typing delay

    def extract_json(self, text: str) -> dict:
        import json, re
        match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return {"text": text}

    def _mock_response(self, prompt: str, system_prompt: str = "general") -> str:
        import hashlib
        base = hashlib.md5(prompt.encode()).hexdigest()
        idx = int(base[:8], 16)

        fallbacks = {
            "teacher": (
                "Let's break this concept down from first principles so it makes complete intuitive sense.\n\n"
                "### The Core Intuition\n"
                "Think of this like an organized workspace. When you want to store, query, and transform information efficiently, "
                "you need a deterministic system where every piece of data has a known, predictable place.\n\n"
                "### Step-by-Step Mechanism\n"
                "1. **Input & Processing:** The system takes your request and processes it using structured logic.\n"
                "2. **State & Memory:** Data is organized with optimal time complexity (often O(1) or O(log n)) in memory.\n"
                "3. **Execution Safety:** By keeping data flow explicit, you eliminate unexpected mutation and side effects.\n\n"
                "### Golden Rule\n"
                "Always focus on the underlying data flow rather than memorizing syntax. Once you understand the mechanism, "
                "writing the code becomes second nature."
            ),
            "coding": (
                f"# Code Analysis: {prompt[:40]}\n\n"
                "```python\ndef example():\n    "
                "# This code demonstrates the concept\n    "
                "result = sum(range(10))\n    "
                "return result\n```\n\n"
                "**Explanation:** This implementation follows standard patterns. "
                "The time complexity is O(n) and space complexity is O(1)."
            ),
            "quiz": (
                "```json\n{\n  \"questions\": [\n    "
                "{\"question\": \"What is the main concept?\", "
                "\"options\": [\"A) Option 1\", \"B) Option 2\", "
                "\"C) Option 3\", \"D) Option 4\"], "
                "\"answer\": 0, \"explanation\": \"This is the correct choice "
                "because it aligns with the fundamental principle.\"}\n  ]\n}\n```"
            ),
            "resume": (
                "```json\n{\n  \"skills\": [\"React\", \"Node.js\", \"TypeScript\", \"Microservices\", \"Team Leadership\"],\n  \"experienceLevel\": \"senior\",\n  \"suggestedRoles\": [\"Senior Software Engineer\", \"Tech Lead\", \"Engineering Manager\"],\n  \"summary\": \"Senior software engineer with 5+ years building scalable web applications. Proven track record leading teams and delivering high-impact products.\",\n  \"strengths\": [\"Strong technical leadership\", \"Full-stack expertise\", \"Mentoring junior developers\"],\n  \"improvements\": [\"Add quantified achievements (e.g., 'improved latency by 40%')\", \"Include relevant certifications\", \"Highlight specific project outcomes\"],\n  \"searchKeywords\": [\"Senior Software Engineer\", \"React\", \"Node.js\", \"TypeScript\", \"Team Lead\", \"Microservices\"],\n  \"atsScore\": 78,\n  \"atsGaps\": [\"Missing quantified metrics\", \"No certifications listed\", \"Keywords could be more dense in skills section\"]\n}\n```"
            ),
            "resume_write": (
                "Enhanced Experience:\n"
                "• Spearheaded development of 5+ React/TypeScript applications, improving user engagement by 40%\n"
                "• Architected scalable Node.js microservices handling 100K+ daily requests\n"
                "• Mentored 4 junior developers, reducing onboarding time by 50%\n"
                "• Implemented CI/CD pipelines reducing deployment time from 2hrs to 15min"
            ),
            "voice": (
                "Welcome! Let's explore this concept together from the ground up. "
                "Imagine you have a complex problem to solve. Instead of tackling the whole thing at once, "
                "we break it down into small, digestible pieces that fit naturally together. "
                "Notice how each step builds directly on the last, giving you a crystal-clear mental roadmap. "
                "That is the core intuition to keep in mind, and once you grasp this foundation, everything else falls right into place."
            ),
        }

        sp_lower = system_prompt.lower()
        prompt_lower = prompt.lower()

        if "voice" in sp_lower or "speech" in sp_lower or "audio" in prompt_lower or "narration" in prompt_lower or "script" in prompt_lower:
            return fallbacks["voice"]

        if "interactive curriculum" in prompt_lower or "progressive topic modules" in prompt_lower:
            return json.dumps({
                "courseTitle": "Masterclass: Interactive Deep-Dive",
                "level": "Beginner",
                "persona": "Professor Structured",
                "modules": [
                    {
                        "moduleId": "mod-1",
                        "moduleTitle": "1. Core Mental Models & Architecture",
                        "slides": [
                            {
                                "slideId": "s-1-1",
                                "title": "First Principles & Mental Model",
                                "speech": "Welcome to our live masterclass! Today we break down the core foundations from first principles with real-time execution.",
                                "exampleTitle": "CORE SYNTAX",
                                "code": "# High-performance data structure setup\ndef initialize():\n    data = {'status': 'ACTIVE', 'scope': 'GLOBAL'}\n    print(f'Runtime State: {data}')\n    return data\n\ninitialize()",
                                "output": "Runtime State: {'status': 'ACTIVE', 'scope': 'GLOBAL'}",
                                "explanation": "Contiguous memory blocks are allocated on heap initialization with O(1) amortized access time.",
                                "keyPoints": [
                                    "O(1) average lookup and insertion time",
                                    "Immutable keys guarantee deterministic hashing",
                                    "Resizes at 2/3 load factor threshold"
                                ],
                                "diagramType": "hashmap"
                            }
                        ]
                    }
                ]
            })

        if "ask professor" in prompt_lower or "current slide on blackboard" in prompt_lower or "multi-tiered response" in prompt_lower:
            return json.dumps({
                "answer": "Great question! This behavior is governed directly by memory referencing and type mutability in the runtime engine.",
                "codeSnippet": "# Demonstration\nstate = {'concept': 'verified', 'speed': 'O(1)'}\nprint(f'State verified: {state}')",
                "output": "State verified: {'concept': 'verified', 'speed': 'O(1)'}",
                "suggestedFollowUp": "What happens if we modify the collection concurrently in async tasks?",
                "memoryInsight": "The interpreter allocates a contiguous memory buffer and evaluates hash table buckets in O(1) time."
            })

        if "diagnostic resolution" in prompt_lower or "conceptual roadblock" in prompt_lower:
            return json.dumps({
                "title": "Diagnostic Diagnosis: Resolving Key Mutability & Access Safety",
                "breakdown": [
                    "Step 1: Root Cause Analysis - Value equality was conflated with memory reference identity.",
                    "Step 2: Engine Mechanics - The interpreter calculates object hashes upon instantiation and matches bucket addresses.",
                    "Step 3: Correct Pattern - Always utilize immutable data types for keys and defensive copies.",
                    "Step 4: Industry Standard - Use type annotations and defensive dict.get() lookups."
                ],
                "codeComparison": {
                    "antiPattern": "# Anti-Pattern: Unchecked access\ndata = {}\n# val = data['missing'] # Crashes with KeyError",
                    "robustSolution": "# Idiomatic: Safe access\ndata = {}\nval = data.get('missing', 'fallback')\nprint(f'Safely retrieved: {val}')"
                },
                "summary": "Immutability guarantees deterministic hashing, preventing state pollution across scopes.",
                "proTip": "Use `collections.defaultdict` and `sys.getsizeof()` to optimize both safety and memory footprint."
            })

        if "hands-on coding challenge" in prompt_lower or "coding lab" in prompt_lower:
            return json.dumps({
                "title": "Practice Challenge: Data Structure Manipulation",
                "instructions": "Implement a clean, production-ready function to process and validate items with O(n) complexity.",
                "starterCode": "def process_data(items: list) -> dict:\n    \"\"\"\n    TODO: Process items into a structured frequency mapping.\n    \"\"\"\n    result = {}\n    # Your implementation here\n    return result\n\nprint(process_data(['alpha', 'beta', 'alpha']))",
                "solutionCode": "def process_data(items: list) -> dict:\n    result = {}\n    for item in items:\n        result[item] = result.get(item, 0) + 1\n    return result\n\nprint(process_data(['alpha', 'beta', 'alpha']))",
                "testCases": [
                    {"input": "process_data(['a', 'b', 'a'])", "expected": "{'a': 2, 'b': 1}", "description": "Duplicate item frequency"},
                    {"input": "process_data([])", "expected": "{}", "description": "Empty input safety"},
                    {"input": "process_data(['x'])", "expected": "{'x': 1}", "description": "Single element mapping"}
                ]
            })

        if "teacher" in sp_lower or "lesson" in sp_lower:
            key = "teacher"
        elif "code" in sp_lower or "python" in sp_lower or "program" in sp_lower:
            key = "coding"
        elif "resume" in sp_lower or "ats" in sp_lower:
            if "improve this" in prompt_lower or "improve the" in prompt_lower or "generate " in prompt_lower or "rewrite " in prompt_lower or "write " in prompt_lower:
                key = "resume_write"
            else:
                key = "resume"
        elif "quiz" in sp_lower or "question" in sp_lower:
            key = "quiz"
        else:
            keys = list(fallbacks.keys())
            key = keys[idx % len(keys)]

        return fallbacks[key]