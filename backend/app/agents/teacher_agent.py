import logging
import re
from typing import Any, Dict, List, Optional
from .base import BaseAgent

logger = logging.getLogger(__name__)

ALLOWED_DIAGRAMS = {"hashmap", "array", "tree", "flowchart", "none"}


class TeacherAgent(BaseAgent):
    def __init__(self):
        super().__init__()

        # -----------------------------------------------------------------
        # GEMINI-STYLE CONVERSATIONAL TUTOR PERSONA
        # Teaches progressively concept-by-concept like Google Gemini in a live app.
        # Direct answer -> Under-the-hood mechanism -> Topic code & output ->
        # Parallel robot speech -> Next concept roadmap at the end.
        # -----------------------------------------------------------------
        self.system_prompt = """You are AURA — an elite, conversational AI tutor and master computer science educator for AuraLearn, powered by advanced AI.
You interact like a real AI chatbot (such as Google Gemini) having an engaging, interactive, 1-on-1 tutoring session with a student.

CORE IDENTITY & PEDAGOGICAL FLOW
- You teach progressively from first principles with crystal clarity, intellectual warmth, and zero boilerplate filler.
- Your responses follow a clear, natural pedagogical progression:
  1. Concept 1 (Direct Understanding & The 'Why'): Address the student's exact question immediately with an intuitive explanation and a memorable real-world analogy.
  2. Concept 2 (Under-the-Hood Mechanism): Walk through how the runtime, compiler, memory, or data flow behaves step-by-step.
  3. Dedicated Code & Output: Where relevant, provide clean, idiomatic code snippets with exact terminal execution outputs.
  4. Parallel Robot Avatar Speech: Provide clear spoken summaries designed for text-to-speech audio that the floating robot avatar speaks aloud in parallel.
  5. Next Concept Roadmap: At the very end of your explanation, always introduce the logical NEXT concept in the learning path to guide the student forward naturally.

TEACHING PERSONAS & ADAPTABILITY
- "Professor Structured": Clear, methodical, first-principles architectural rigor.
- "Socrates Socratic Inquiry": Guided questioning, thought experiments, discovering the answer through reasoning.
- "Dr. Maya Deep Visuals": Physical analogies, memory diagrams, spatial mental models.
- "Coach Alex Fast & Fun": High-energy, punchy, real-world engineering hacks and interview shortcuts.

STRICT FORMATTING RULES
- Format conversational text using clean Markdown: bold keywords, concise bullet points, and fenced code blocks (`language).
- Strictly NEVER output raw slide markers (such as ##TITLE##, ##BULLETS##, ##SLIDE##, or ##HEADING##).
- Ensure every explanation is rich, detailed, and directly answers what the student asked before smoothly transitioning to the next concept."""

    # -----------------------------------------------------------------
    # IN-CLASS LIVE Q&A ("Ask Professor" - Gemini Style)
    # -----------------------------------------------------------------
    async def ask_professor(
        self,
        persona: str,
        course_title: str,
        current_topic: str,
        current_slide: dict,
        question: str,
        chat_history: Optional[List[dict]] = None,
    ) -> Dict[str, Any]:
        """Answer student questions conversationally with progressive concept flow and next-concept roadmap."""
        slide_title = current_slide.get("title", "Current Slide")
        slide_speech = current_slide.get("speech", "")
        slide_code = current_slide.get("code", "")

        history_block = ""
        if chat_history:
            recent = chat_history[-6:]
            history_block = "\n".join(
                f"{turn.get('sender', turn.get('role', 'student'))}: {turn.get('text', turn.get('content', ''))}"
                for turn in recent
            )

        prompt = f"""You are AURA, the live AI professor teaching "{course_title}".
Teaching Persona: "{persona}".
Current Topic Context: "{current_topic}".
Current Screen Slide: "{slide_title}"
Current Slide Context: "{slide_speech}"
Active Code on Blackboard:
{slide_code}

Recent Conversation History:
{history_block if history_block else "(first question in this session)"}

The student just asked: "{question}"

Respond like an elite AI tutor (like Google Gemini) delivering a progressive, concept-by-concept masterclass:
1. Concept 1 (Direct Answer & Intuition): Answer the student's question immediately with deep clarity and a memorable physical analogy.
2. Concept 2 (Under-the-Hood Mechanics): Explain step-by-step what happens internally in memory/execution.
3. Code Demonstration & Output: If code helps explain, provide a clean, commented code snippet in the relevant language with its exact terminal stdout output.
4. Robot Speech (`speech`): A natural spoken script (2-3 sentences) for the floating robot avatar to speak via TTS in parallel.
5. Next Concept Roadmap (`nextConcept`): Explicitly introduce the logical NEXT concept in this topic area to guide their continuous learning path.

Format strictly as JSON with this schema:
{{
  "answer": "Detailed conversational Markdown response covering Concept 1 and Concept 2, ending with a clear Next Concept Roadmap...",
  "speech": "Natural spoken explanation for the robot avatar to speak aloud via TTS...",
  "codeSnippet": "# Demonstrative code snippet in relevant language\\n...",
  "output": "Exact execution output...",
  "suggestedFollowUp": "Natural inquiry about the next concept or practical edge case...",
  "memoryInsight": "1-sentence insight about runtime memory layout or complexity...",
  "nextConcept": {{"title": "Next Concept Title", "teaser": "1-sentence preview of what comes next in this topic..."}},
  "robotState": "answering"
}}
"""
        try:
            result = await self.generate(prompt)
            parsed = self.extract_json(result)
            if isinstance(parsed, dict) and parsed.get("answer"):
                parsed.setdefault("robotState", "answering")
                if not parsed.get("speech"):
                    parsed["speech"] = self._generate_fallback_speech(parsed["answer"])
                return parsed
        except Exception as e:
            logger.warning(f"[TeacherAgent] ask_professor error: {e}")

        # Intelligent progressive fallback
        answer_text = (
            f"Regarding **{question}** in **{current_topic}**:\n\n"
            f"1. **Core Principle**: In {current_topic}, execution is governed by clean state boundaries and predictable runtime mechanics. "
            f"Rather than mutating global state, data is passed deterministically through functions and references.\n\n"
            f"2. **Under the Hood**: The runtime resolves memory allocations in O(1) average time and maintains cache coherence.\n\n"
            f"3. **Next Concept**: Building on this foundation, we next explore concurrent execution and resilient data structures."
        )

        return {
            "answer": answer_text,
            "speech": f"Regarding your question on {question}, the core idea in {current_topic} is clean data flow and deterministic memory management.",
            "codeSnippet": f"# Example demonstrating {question[:30]}\ndef execute_example(data):\n    # Process data deterministically\n    result = {{'topic': '{current_topic}', 'data': data}}\n    return result\n\nprint(execute_example('Valid Input'))",
            "output": f"{{'topic': '{current_topic}', 'data': 'Valid Input'}}",
            "suggestedFollowUp": f"How do we optimize memory allocations when scaling {current_topic}?",
            "memoryInsight": "Deterministic memory referencing maximizes CPU L1/L2 cache hits.",
            "nextConcept": {
                "title": f"Advanced Patterns in {current_topic}",
                "teaser": "Exploring high-throughput pipelines and concurrency patterns."
            },
            "robotState": "answering",
        }

    # -----------------------------------------------------------------
    # IN-CLASS LIVE CONCEPT SEARCH ("Ask AURA")
    # -----------------------------------------------------------------
    async def live_class_search(
        self,
        course_title: str,
        level: str,
        query: str,
        course_syllabus: Optional[str] = None,
        chat_history: Optional[List[dict]] = None,
    ) -> Dict[str, Any]:
        """Perform a rapid, progressive concept search across the course and related topics."""
        history_block = ""
        if chat_history:
            recent = chat_history[-6:]
            history_block = "\n".join(
                f"{turn.get('role', 'student')}: {turn.get('text', turn.get('content', ''))}" for turn in recent
            )

        syllabus_block = course_syllabus or f"Masterclass curriculum for {course_title}"

        prompt = f"""You are AURA, an in-classroom AI research assistant for "{course_title}" ({level} level).
Syllabus Context:
{syllabus_block}

Recent Chat History:
{history_block if history_block else "(first search query)"}

Student Search Query: "{query}"

Provide a progressive Gemini-style concept explanation:
1. "answer": Clear, rich Markdown explanation covering the primary concept, its real-world intuition, and practical application, concluding with a Next Concept Roadmap.
2. "speech": Spoken summary for the robot avatar to speak via TTS.
3. "relatedModule": The relevant module or topic name.
4. "codeSnippet": Practical code example demonstrating the query.
5. "nextConcept": Object with {{"title": "...", "teaser": "..."}}.
6. "followUpSuggestions": 2 to 3 natural follow-up questions.
7. "robotState": "answering"

Format strictly as JSON:
{{
  "answer": "...",
  "speech": "...",
  "relatedModule": "...",
  "codeSnippet": "...",
  "nextConcept": {{"title": "...", "teaser": "..."}},
  "followUpSuggestions": ["...", "..."],
  "robotState": "answering"
}}
"""
        try:
            result = await self.generate(prompt)
            parsed = self.extract_json(result)
            if isinstance(parsed, dict) and parsed.get("answer"):
                parsed.setdefault("robotState", "answering")
                parsed.setdefault("relatedModule", course_title)
                parsed.setdefault("followUpSuggestions", [f"How is {query} optimized in production?", f"What are common edge cases with {query}?"])
                return parsed
        except Exception as e:
            logger.warning(f"[TeacherAgent] live_class_search error: {e}")

        return {
            "answer": (
                f"### Core Concept: {query}\n"
                f"In **{course_title}**, **{query}** is a foundational architectural pattern. "
                f"It ensures that operations execute with optimal computational complexity while isolating state mutations.\n\n"
                f"### Practical Application\n"
                f"Engineers use this pattern to decouple business logic, improve testability, and minimize runtime memory pressure.\n\n"
                f"### 🧭 Next Logical Concept\n"
                f"**Next Up:** *Production Scaling & Edge-Case Hardening for {query}*."
            ),
            "speech": f"On the topic of {query}, this concept ensures optimal algorithmic complexity and clean architectural separation.",
            "relatedModule": course_title,
            "codeSnippet": f"# Implementation pattern for {query}\ndef execute_pattern():\n    return {{'concept': '{query}', 'status': 'OPTIMAL'}}\n\nprint(execute_pattern())",
            "nextConcept": {
                "title": f"Production Optimization for {query}",
                "teaser": "Explore performance benchmarks and defensive error boundaries."
            },
            "followUpSuggestions": [
                f"How is {query} benchmarked in high-throughput systems?",
                f"What are the most common pitfalls when implementing {query}?",
            ],
            "robotState": "answering",
        }

    # -----------------------------------------------------------------
    # DEEP DOUBT RESOLUTION
    # -----------------------------------------------------------------
    async def resolve_doubt_deep(self, topic: str, level: str, doubt: str) -> Dict[str, Any]:
        """Diagnostic root-cause breakdown of a student's conceptual roadblock with next-concept guidance."""
        prompt = f"""A student has encountered a conceptual roadblock in "{topic}" ({level} level).
Student's Doubt: "{doubt}"

Provide a diagnostic resolution formatted strictly as JSON:
1. "title": Crisp diagnosis title (e.g. "Resolving Reference Mutation & Memory State Pollution").
2. "breakdown": 4 detailed, sequential steps:
   - Step 1: Root cause of the confusion
   - Step 2: How the runtime/compiler processes it internally
   - Step 3: The architectural solution pattern
   - Step 4: Industry best practices and testing safeguards
3. "codeComparison": An object with:
   - "antiPattern": Common buggy/problematic code snippet with comments.
   - "robustSolution": Clean, idiomatic, robust solution code.
4. "summary": Golden rule (1-2 sentences) to memorize for technical interviews.
5. "proTip": Advanced performance tip or debugging technique.
6. "nextConcept": Object with {{"title": "...", "teaser": "..."}} indicating the next topic to study after clearing this doubt.
7. "robotState": "answering"

Format strictly as JSON:
{{
  "title": "...",
  "breakdown": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ...",
    "Step 4: ..."
  ],
  "codeComparison": {{
    "antiPattern": "# Anti-Pattern\\n...",
    "robustSolution": "# Robust Solution\\n..."
  }},
  "summary": "...",
  "proTip": "...",
  "nextConcept": {{"title": "...", "teaser": "..."}},
  "robotState": "answering"
}}
"""
        try:
            result = await self.generate(prompt)
            parsed = self.extract_json(result)
            if isinstance(parsed, dict) and "title" in parsed and "breakdown" in parsed and isinstance(parsed["breakdown"], list):
                parsed.setdefault("robotState", "answering")
                return parsed
        except Exception as e:
            logger.warning(f"[TeacherAgent] resolve_doubt_deep error: {e}")

        return {
            "title": f"Diagnostic Analysis: {doubt[:50]}",
            "breakdown": [
                f"Step 1: Root Cause - Confusion around '{doubt}' typically arises from conflating memory reference identity with value equality.",
                f"Step 2: Engine Mechanics - The runtime calculates object hashes upon creation and points to distinct memory allocations.",
                f"Step 3: Correct Pattern - Always utilize immutable data types for keys and defensive copies when sharing state.",
                f"Step 4: Best Practice - Add type annotations and automated assertions to catch mutations before deployment."
            ],
            "codeComparison": {
                "antiPattern": f"# Anti-Pattern: Unchecked access in {topic}\ndata = {{}}\n# val = data['missing']  # Raises KeyError at runtime",
                "robustSolution": f"# Robust Pattern: Safe lookup with fallback\ndata = {{}}\nval = data.get('missing', 'safe_default')\nprint(f'Retrieved: {{val}}')"
            },
            "summary": f"In {topic}, explicit data flow and defensive state handling prevent subtle runtime crashes.",
            "proTip": "Use built-in profiling and static analysis tools to verify memory consumption and edge-case coverage.",
            "nextConcept": {
                "title": f"Defensive Patterns & Error Handling in {topic}",
                "teaser": "Master comprehensive boundary checks and fail-fast architectures."
            },
            "robotState": "answering",
        }

    # -----------------------------------------------------------------
    # PROGRESSIVE MULTI-SLIDE CURRICULUM GENERATION
    # -----------------------------------------------------------------
    async def generate_multi_slide_course(
        self,
        topic: str,
        level: str = "Beginner",
        persona: str = "Professor Structured",
    ) -> Dict[str, Any]:
        """Generate a complete interactive multi-module progressive course curriculum."""
        prompt = f"""You are designing a structured interactive curriculum for the topic "{topic}".
Target Learner Level: {level}
Teacher Persona: {persona}

Generate a 3-module masterclass with progressive concept-by-concept flow:
- Module 1: Core Fundamentals, Architecture & Mental Models (3 slides)
- Module 2: Deep Implementation, Practical Lab & Benchmarking (2 slides)
- Module 3: Real-World Architecture, Edge Cases & Capstone Best Practices (2 slides)

For each slide, provide:
1. "title": Crisp, descriptive concept title.
2. "speech": Conversational spoken script (3-5 sentences) written as natural live teacher narration.
3. "exampleTitle": Semantic badge (e.g. "CORE SYNTAX", "PRACTICAL LAB", "MEMORY MAP", "EDGE CASES").
4. "code": Fully runnable, idiomatic code snippet (8-20 lines) with inline comments.
5. "output": Realistic terminal execution output.
6. "explanation": Deep conceptual breakdown explaining time complexity (e.g. O(1), O(n)), memory layout, and runtime mechanics.
7. "keyPoints": Array of 3 to 4 actionable bullet points and exam rules.
8. "diagramType": Strictly one of "hashmap" | "array" | "tree" | "flowchart" | "none".
9. "robotState": "teaching" | "speaking"

Format strictly as JSON:
{{
  "courseTitle": "Mastering {topic}",
  "level": "{level}",
  "persona": "{persona}",
  "modules": [
    {{
      "moduleId": "mod-1",
      "moduleTitle": "1. Core Mental Models & Architecture",
      "slides": [
        {{
          "slideId": "s-1-1",
          "title": "First Principles & Fundamental Analogy",
          "speech": "Welcome to our live masterclass! Today we break down the core foundations...",
          "exampleTitle": "CORE SYNTAX",
          "code": "# Demonstration code\\n...",
          "output": "Expected output...",
          "explanation": "Under the hood, this structure operates by...",
          "keyPoints": ["Core rule 1", "Core rule 2", "Time complexity note"],
          "diagramType": "hashmap",
          "robotState": "teaching"
        }}
      ]
    }}
  ]
}}
"""
        try:
            result = await self.generate(prompt)
            parsed = self.extract_json(result)
            if isinstance(parsed, dict) and "modules" in parsed and isinstance(parsed["modules"], list) and len(parsed["modules"]) > 0:
                return self._sanitize_course(parsed, topic, level, persona)
        except Exception as e:
            logger.warning(f"[TeacherAgent] generate_multi_slide_course failed for topic '{topic}': {e}")

        logger.info(f"[TeacherAgent] Using dynamic fallback course for '{topic}' ({level}).")
        return self._generate_dynamic_fallback_course(topic, level, persona)

    def _sanitize_course(self, data: Dict[str, Any], topic: str, level: str, persona: str) -> Dict[str, Any]:
        """Normalize diagram types, enforce unique IDs, and fill missing attributes."""
        course_title = data.get("courseTitle") or f"Mastering {topic}"
        modules = data.get("modules", [])
        sanitized_modules = []

        for m_idx, mod in enumerate(modules, start=1):
            mod_id = f"mod-{m_idx}"
            mod_title = mod.get("moduleTitle") or f"Module {m_idx}: Core Concepts in {topic}"
            raw_slides = mod.get("slides", [])
            sanitized_slides = []

            for s_idx, slide in enumerate(raw_slides, start=1):
                slide_id = f"s-{m_idx}-{s_idx}"
                diag = str(slide.get("diagramType", "none")).lower().strip()
                if diag not in ALLOWED_DIAGRAMS:
                    diag = "flowchart" if "flow" in diag or "step" in diag else ("hashmap" if "hash" in diag or "map" in diag else ("tree" if "tree" in diag or "node" in diag else ("array" if "array" in diag or "list" in diag else "none")))

                sanitized_slides.append({
                    "slideId": slide_id,
                    "title": slide.get("title") or f"Concept {s_idx}: {topic}",
                    "speech": slide.get("speech") or f"Let's dive into this key concept in {topic}.",
                    "exampleTitle": slide.get("exampleTitle") or "PRACTICAL LAB",
                    "code": slide.get("code") or f"# Code example for {topic}\nprint('Demonstrating {topic}')",
                    "output": slide.get("output") or f"Demonstrating {topic}",
                    "explanation": slide.get("explanation") or f"Detailed internal mechanics and logic of {topic}.",
                    "keyPoints": slide.get("keyPoints") if isinstance(slide.get("keyPoints"), list) and slide.get("keyPoints") else [f"Master the core rules of {topic}", "Maintain deterministic state", "Consider runtime complexity"],
                    "diagramType": diag,
                    "robotState": slide.get("robotState") or "teaching",
                })

            if sanitized_slides:
                sanitized_modules.append({
                    "moduleId": mod_id,
                    "moduleTitle": mod_title,
                    "slides": sanitized_slides,
                })

        if not sanitized_modules:
            return self._generate_dynamic_fallback_course(topic, level, persona)

        return {
            "courseTitle": course_title,
            "level": level,
            "persona": persona,
            "modules": sanitized_modules,
        }

    # -----------------------------------------------------------------
    # COMPATIBILITY METHODS
    # -----------------------------------------------------------------
    async def generate_lesson(self, topic: str, level: str = "beginner") -> Dict[str, Any]:
        """Generate a complete text masterclass lesson with progressive conversational sections."""
        prompt = f"""Create a progressive masterclass lesson on "{topic}" for a {level} student.
Explain the concepts from first principles with clear analogies, runnable code examples, common pitfalls, and a Next Concept roadmap.
Strictly NO slide markers in the output.

Format strictly as JSON:
{{
  "title": "Masterclass: {topic}",
  "objectives": ["Understand core mechanisms of {topic}", "Implement production-ready patterns"],
  "prerequisites": ["Basic programming knowledge"],
  "sections": [
    {{
      "title": "1. Core Mental Model & Intuition",
      "content": "Deep explanation of the concept with real-world analogies...",
      "code": "# Clean demonstration\\n..."
    }},
    {{
      "title": "2. Practical Implementation & Optimization",
      "content": "Step-by-step implementation walkthrough...",
      "code": "# Advanced usage\\n..."
    }}
  ],
  "exercise": "Hands-on challenge description",
  "summary": "Key takeaway checklist and next concept preview"
}}
"""
        try:
            result = await self.generate(prompt)
            parsed = self.extract_json(result)
            if isinstance(parsed, dict) and "title" in parsed and "sections" in parsed:
                return parsed
        except Exception as e:
            logger.warning(f"[TeacherAgent] generate_lesson error: {e}")

        return {
            "title": f"Masterclass: {topic}",
            "objectives": [f"Understand fundamental architecture of {topic}", f"Build scalable solutions using {topic}"],
            "prerequisites": ["Foundational software engineering principles"],
            "sections": [
                {
                    "title": f"1. Core Intuition & Architecture",
                    "content": f"To master {topic}, let us break it down from first principles. Think of {topic} as a deterministic system designed to process inputs with minimal overhead.",
                    "code": f"# Foundational pattern for {topic}\ndef run_example():\n    print('Executing {topic}')\n\nrun_example()",
                },
                {
                    "title": f"2. Production Hardening & Optimization",
                    "content": f"When scaling {topic}, always consider memory footprint, edge-case validation, and algorithmic time complexity.",
                    "code": f"# Defensive implementation\nclass SystemService:\n    def execute(self):\n        return True",
                }
            ],
            "exercise": f"Implement a complete module demonstrating {topic} with unit assertions.",
            "summary": f"Focus on first-principles understanding, immutable state, and defensive error handling.",
        }

    async def answer_doubt(self, question: str, lesson_context: str = "") -> Dict[str, Any]:
        """Provide a conversational answer to a student doubt."""
        prompt = f"""Student Question: "{question}"
Lesson Context: {lesson_context}

Provide a conversational, high-clarity explanation:
- Direct first-principles answer with a memorable analogy.
- Commented code snippet demonstrating the correct approach.
- Common mistakes relating to this concept.
- Next Concept to explore.
Strictly NO slide markers in the output.

Format strictly as JSON:
{{
  "explanation": "Clear, detailed conversational explanation...",
  "codeExample": "# Code snippet\\n...",
  "relatedConcepts": ["Concept 1", "Concept 2"],
  "commonPitfalls": "What to avoid...",
  "nextConcept": {{"title": "...", "teaser": "..."}},
  "proTip": "Insider advice..."
}}
"""
        try:
            result = await self.generate(prompt)
            parsed = self.extract_json(result)
            if isinstance(parsed, dict) and "explanation" in parsed:
                return parsed
        except Exception as e:
            logger.warning(f"[TeacherAgent] answer_doubt error: {e}")

        return {
            "explanation": f"When dealing with '{question}', the key principle is maintaining clear data flow and understanding how the runtime manages state. Rather than treating this as abstract syntax, observe how data is allocated and accessed.",
            "codeExample": f"# Safe implementation for: {question[:30]}\ndef solve():\n    return 'Success'\n\nprint(solve())",
            "relatedConcepts": ["State Management", "Memory Lifecycle", "Algorithmic Efficiency"],
            "commonPitfalls": "Failing to handle null/undefined edge cases or mutating shared state concurrently.",
            "nextConcept": {
                "title": "State Flow & Concurrency Control",
                "teaser": "Explore thread-safe data structures and immutable memory snapshots."
            },
            "proTip": "Write unit tests for edge cases before deploying to production.",
        }

    async def generate_coding_challenge(self, current_topic: str) -> Dict[str, Any]:
        """Generate a hands-on coding lab challenge."""
        prompt = f"""Generate an interactive coding challenge for "{current_topic}".
Include:
1. "title": Descriptive challenge title.
2. "instructions": Clear task requirements and complexity constraints (e.g. O(n) time).
3. "starterCode": Boilerplate starter function with TODO docstrings.
4. "solutionCode": Complete working solution.
5. "testCases": 3 sample test cases with input and expected output.
6. "hints": 2 progressive hints.

Format strictly as JSON:
{{
  "title": "Practice Lab: {current_topic}",
  "instructions": "...",
  "starterCode": "def solve():\\n    # TODO: Implement\\n    pass",
  "solutionCode": "def solve():\\n    return True",
  "testCases": [
    {{"input": "solve()", "expected": "True", "description": "Basic test"}}
  ],
  "hints": ["Hint 1", "Hint 2"]
}}
"""
        try:
            result = await self.generate(prompt)
            parsed = self.extract_json(result)
            if isinstance(parsed, dict) and "starterCode" in parsed and parsed.get("starterCode"):
                return parsed
        except Exception as e:
            logger.warning(f"[TeacherAgent] generate_coding_challenge error: {e}")

        return {
            "title": f"Practice Lab: {current_topic}",
            "instructions": f"Implement a clean, production-ready function to process and validate data structures in {current_topic} with O(n) time complexity.",
            "starterCode": f"def process_data(items: list) -> dict:\n    \"\"\"\n    TODO: Process items into a structured result for {current_topic}.\n    \"\"\"\n    result = {{}}\n    # Your code here\n    return result\n\nprint(process_data(['alpha', 'beta', 'alpha']))",
            "solutionCode": f"def process_data(items: list) -> dict:\n    result = {{}}\n    for item in items:\n        result[item] = result.get(item, 0) + 1\n    return result\n\nprint(process_data(['alpha', 'beta', 'alpha']))",
            "testCases": [
                {"input": "process_data(['a', 'b', 'a'])", "expected": "{'a': 2, 'b': 1}", "description": "Frequency calculation"},
                {"input": "process_data([])", "expected": "{}", "description": "Empty input boundary check"},
                {"input": "process_data(['x'])", "expected": "{'x': 1}", "description": "Single element test"}
            ],
            "hints": [
                "Consider using a frequency mapping to achieve O(n) linear scanning.",
                "Ensure edge cases like empty inputs are handled cleanly."
            ]
        }

    async def generate_whiteboard_content(self, topic: str, lesson_part: str = "") -> str:
        prompt = f"""Generate clean, structured whiteboard notes for teaching "{topic}" - {lesson_part}.
Include:
- Clear architectural headings
- First-principles conceptual breakdown
- Clean, commented code snippets
- Memory / layout ASCII visual diagrams where helpful
- Pitfalls & Best Practices callouts
Strictly format for clarity."""
        try:
            return await self.generate(prompt)
        except Exception:
            return f"# Whiteboard Notes: {topic}\n\n### Core Intuition: {lesson_part}\n- First principles architecture\n- O(1) to O(n) computational complexity\n- Deterministic state transformations\n\n```python\n# Clean implementation\nresult = 'Verified'\n```\n\n### Golden Rule\nAlways isolate side-effects and test boundary conditions."

    def _generate_fallback_speech(self, text: str) -> str:
        """Extract a punchy spoken opening from full markdown text for robot avatar speech."""
        cleaned = re.sub(r"[#*_~`]", "", text)
        cleaned = re.sub(r"```[\s\S]*?```", "", cleaned)
        sentences = [s.strip() for s in cleaned.split(".") if len(s.strip()) > 10]
        if sentences:
            return ". ".join(sentences[:2]) + "."
        return "Let's examine this concept step by step to build deep understanding."

    # -----------------------------------------------------------------
    # DYNAMIC TOPIC-AWARE FALLBACK GENERATOR
    # -----------------------------------------------------------------
    def _generate_dynamic_fallback_course(self, topic: str, level: str, persona: str) -> Dict[str, Any]:
        """Generate a progressive topic-adaptive fallback course if live generation is offline."""
        clean_topic = topic.strip() or "Computer Science"
        diag_1 = "hashmap" if "hash" in clean_topic.lower() or "dict" in clean_topic.lower() or "map" in clean_topic.lower() else ("tree" if "tree" in clean_topic.lower() or "graph" in clean_topic.lower() else ("array" if "array" in clean_topic.lower() or "list" in clean_topic.lower() or "sort" in clean_topic.lower() else "flowchart"))

        return {
            "courseTitle": f"Masterclass: {clean_topic}",
            "level": level,
            "persona": persona,
            "modules": [
                {
                    "moduleId": "mod-1",
                    "moduleTitle": f"1. Core Architecture & Mental Models in {clean_topic}",
                    "slides": [
                        {
                            "slideId": "s-1-1",
                            "title": f"First Principles of {clean_topic}",
                            "speech": f"Welcome to our live masterclass! Today we break down {clean_topic} from first principles so you build deep theoretical and practical mastery.",
                            "exampleTitle": "CORE SYNTAX",
                            "code": f"# Fundamental implementation of {clean_topic}\ndef initialize_service():\n    state = {{'topic': '{clean_topic}', 'status': 'ACTIVE'}}\n    print(f'Runtime State Initialized: {{state}}')\n    return state\n\ninitialize_service()",
                            "output": f"Runtime State Initialized: {{'topic': '{clean_topic}', 'status': 'ACTIVE'}}",
                            "explanation": f"When executing {clean_topic}, the runtime organizes memory buffers and executes operations with predictable algorithmic complexity.",
                            "keyPoints": [
                                f"First-principles understanding of {clean_topic}",
                                "Memory footprint scales deterministically",
                                "Maintain pure state isolation"
                            ],
                            "diagramType": diag_1,
                            "robotState": "teaching"
                        },
                        {
                            "slideId": "s-1-2",
                            "title": "Practical Implementation & Data Flow",
                            "speech": "Now let us examine how data flows through our pipeline. Notice how clean variable naming and deterministic transformations prevent subtle bugs.",
                            "exampleTitle": "PRACTICAL LAB",
                            "code": f"# Data processing pipeline for {clean_topic}\ndef process_stream(data_items: list[int]) -> dict[int, int]:\n    # Efficient transformation\n    return {{item: item * 2 for item in data_items if item >= 0}}\n\nresult = process_stream([10, 20, 30, 40])\nprint(f'Transformed Stream: {{result}}')",
                            "output": "Transformed Stream: {10: 20, 20: 40, 30: 60, 40: 80}",
                            "explanation": "Structured transformations minimize memory reallocations by executing within optimized runtime routines.",
                            "keyPoints": [
                                "Linear O(n) processing efficiency",
                                "Zero state pollution across outer scopes",
                                "Defensive validation on input streams"
                            ],
                            "diagramType": "array",
                            "robotState": "teaching"
                        }
                    ]
                },
                {
                    "moduleId": "mod-2",
                    "moduleTitle": f"2. Optimization, Concurrency & State Management",
                    "slides": [
                        {
                            "slideId": "s-2-1",
                            "title": "Performance Optimization & Benchmarks",
                            "speech": f"Moving into Module 2! Let's analyze execution benchmarks and explore optimization strategies for {clean_topic}.",
                            "exampleTitle": "BENCHMARKING",
                            "code": f"import time\n\n# Measuring execution efficiency in {clean_topic}\nstart_time = time.perf_counter()\nprocessed = sum(i * 2 for i in range(10_000))\nelapsed_us = (time.perf_counter() - start_time) * 1_000_000\nprint(f'Processed result: {{processed}} in {{elapsed_us:.2f}} microseconds')",
                            "output": "Processed result: 99990000 in 0.92 microseconds",
                            "explanation": "Profiling hot execution paths ensures high throughput before applying low-level optimizations.",
                            "keyPoints": [
                                "Always benchmark before optimizing",
                                "Profile CPU and memory allocation",
                                "Target O(1) or O(log n) hot paths"
                            ],
                            "diagramType": "flowchart",
                            "robotState": "teaching"
                        }
                    ]
                },
                {
                    "moduleId": "mod-3",
                    "moduleTitle": f"3. Real-World Architecture & Production Capstone",
                    "slides": [
                        {
                            "slideId": "s-3-1",
                            "title": "Production Hardening & Capstone Best Practices",
                            "speech": f"Congratulations on completing our masterclass! Here is your production architectural cheat sheet for {clean_topic}.",
                            "exampleTitle": "PRODUCTION CAPSTONE",
                            "code": f"# Production-hardened service pattern for {clean_topic}\nclass ProductionService:\n    def __init__(self, name: str):\n        self.name = name\n        self._healthy = True\n        \n    def status(self) -> dict:\n        return {{'service': self.name, 'healthy': self._healthy}}\n\nservice = ProductionService('{clean_topic}')\nprint(service.status())",
                            "output": f"{{'service': '{clean_topic}', 'healthy': True}}",
                            "explanation": f"True engineering mastery combines theoretical understanding, clean defensive coding, and resilient production architecture.",
                            "keyPoints": [
                                f"Review core rules for {clean_topic}",
                                "Implement comprehensive unit and integration tests",
                                "Deploy with telemetry and structured logging"
                            ],
                            "diagramType": "none",
                            "robotState": "lesson_completed"
                        }
                    ]
                }
            ]
        }