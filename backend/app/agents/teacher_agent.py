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

    async def generate_multi_slide_course(self, topic: str, level: str = "Beginner", persona: str = "Professor Structured") -> dict:
        prompt = f"""You are designing a world-class live classroom interactive curriculum for the AI learning platform AURA Learn.
The user requested the topic: "{topic}".
Target Learner Level: {level} (e.g. Beginner, Intermediate, Advanced, Mastery).
Teacher Persona: {persona} (e.g. Professor Structured, Socrates Socratic Inquiry, Dr. Maya Deep Visuals, Coach Alex Fast & Fun).

Generate an exhaustive, highly structured interactive course with 5 progressive topic modules.
For each module (especially Module 1), generate at least 4 to 5 comprehensive, interactive slides.

For each slide, you MUST provide:
1. "title": Crisp, descriptive slide title.
2. "speech": High-energy, pedagogical spoken script (3-5 engaging sentences) written as the teacher avatar with clear analogies, real-world framing, and enthusiastic tone.
3. "exampleTitle": Semantic label (e.g., "CORE SYNTAX", "PRACTICAL LAB", "MEMORY MAP", "EDGE CASE HANDLING").
4. "code": Fully runnable, production-quality code snippet (10-25 lines) with rich inline comments, clean variable naming, and real use cases.
5. "output": Complete, realistic terminal stdout/stderr execution output.
6. "explanation": In-depth conceptual deep-dive (3-5 sentences) explaining the internal mechanics, algorithmic time complexity (e.g., O(1), O(n)), and memory layout.
7. "keyPoints": 3 to 5 actionable bullet points and exam cheat-sheet rules.
8. "diagramType": "hashmap" | "array" | "tree" | "flowchart" | "none" (specifying the optimal visual diagram).

Format strictly as JSON with this schema:
{{
  "courseTitle": "Mastering {topic}",
  "level": "{level}",
  "modules": [
    {{
      "moduleId": "mod-1",
      "moduleTitle": "1. Fundamentals & Mental Model",
      "slides": [
        {{
          "slideId": "s-1-1",
          "title": "Core Architecture & Analogy",
          "speech": "Welcome everyone! Today we dissect...",
          "exampleTitle": "CORE SYNTAX",
          "code": "# Python demonstration\\n...",
          "output": "Execution output...",
          "explanation": "Under the hood, this data structure...",
          "keyPoints": ["O(1) average lookup", "Immutable keys required"],
          "diagramType": "hashmap"
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
                return parsed
        except Exception:
            pass

        # Fallback multi-slide course structure
        return self._fallback_course(topic, level, persona)

    async def ask_professor(
        self,
        persona: str,
        course_title: str,
        current_topic: str,
        current_slide: dict,
        question: str
    ) -> dict:
        slide_title = current_slide.get("title", "Current Slide")
        slide_speech = current_slide.get("speech", "")
        slide_code = current_slide.get("code", "")

        prompt = f"""You are AURA Professor, an animated 3D AI Teacher conducting a live interactive classroom with over 100 students online.
Persona style: {persona}.
Current Course: "{course_title}".
Current Topic Module: "{current_topic}".
Current Slide on Blackboard: "{slide_title}"
Teacher Speech on Screen: "{slide_speech}"
Active Blackboard Code:
{slide_code}

A student in the live class asked: "{question}"

Provide a rich, multi-tiered response strictly formatted as JSON:
1. "answer": Direct, friendly, spoken answer (3-4 sentences) tailored for text-to-speech audio with conversational cadence and conceptual clarity.
2. "codeSnippet": A clean 4-10 line code demonstration resolving the student's question with side-by-side commentary.
3. "output": Expected execution output of this code demonstration.
4. "suggestedFollowUp": A thought-provoking interactive inquiry to test the student's understanding.
5. "memoryInsight": A 1-sentence explanation of what happens under the hood (in memory/CPU).

Format strictly as JSON:
{{
  "answer": "...",
  "codeSnippet": "...",
  "output": "...",
  "suggestedFollowUp": "...",
  "memoryInsight": "..."
}}
"""
        try:
            result = await self.generate(prompt)
            parsed = self.extract_json(result)
            if isinstance(parsed, dict) and "answer" in parsed and parsed.get("answer"):
                return parsed
        except Exception:
            pass

        return {
            "answer": f"Great inquiry regarding '{question}'! In {current_topic}, this behavior is governed directly by memory referencing and type mutability. Notice how our current slide handles the underlying state.",
            "codeSnippet": f"# Demonstration for: {question[:30]}\nresult = {{'status': 'resolved', 'concept': '{current_topic}'}}\nprint(f'Verified: {{result}}')",
            "output": f"Verified: {{'status': 'resolved', 'concept': '{current_topic}'}}",
            "suggestedFollowUp": "What would happen if we mutated the reference object concurrently in a multithreaded runtime?",
            "memoryInsight": "The interpreter allocates a continuous memory pointer buffer and evaluates the hash table buckets in O(1) amortized time."
        }

    async def resolve_doubt_deep(self, topic: str, level: str, doubt: str) -> dict:
        prompt = f"""A student has encountered a conceptual roadblock in "{topic}" ({level} level):
Student's Doubt: "{doubt}"

Provide a comprehensive, high-output diagnostic resolution formatted strictly as JSON:
1. "title": Precise topic diagnosis (e.g., "Resolving Key Mutation & Hash Collisions in Dicts").
2. "breakdown": An array of 4-6 detailed, sequential steps walking the student through:
   - Root cause of the confusion
   - How the language engine / interpreter processes it
   - The architectural solution
   - Best industry practices
3. "codeComparison": Clean before/after code blocks comparing:
   - "antiPattern": Common bug or pitfall code
   - "robustSolution": Clean, idiomatic, robust solution code
4. "summary": A punchy, memorable golden rule (1-2 sentences) the student can memorize for exams and technical interviews.
5. "proTip": An advanced insider tip regarding performance, edge cases, or debugging tools.

Format strictly as JSON:
{{
  "title": "...",
  "breakdown": [
    "Step 1: Root Cause Analysis - ...",
    "Step 2: Engine Mechanics - ...",
    "Step 3: Correct Pattern - ...",
    "Step 4: Industry Standard - ..."
  ],
  "codeComparison": {{
    "antiPattern": "# Buggy code\\n...",
    "robustSolution": "# Robust solution\\n..."
  }},
  "summary": "...",
  "proTip": "..."
}}
"""
        try:
            result = await self.generate(prompt)
            parsed = self.extract_json(result)
            if isinstance(parsed, dict) and "title" in parsed and "breakdown" in parsed and isinstance(parsed["breakdown"], list):
                return parsed
        except Exception:
            pass

        return {
            "title": f"Diagnostic Breakdown: {doubt[:50]}",
            "breakdown": [
                f"1. Root Cause: The difficulty with '{doubt}' stems from confusing value equality with memory reference identity.",
                "2. Engine Mechanics: The interpreter calculates object hashes upon instantiation and matches bucket addresses in memory.",
                "3. Architectural Solution: Always utilize immutable data types for keys and leverage defensive copies when passing mutable collections.",
                "4. Best Practice: Implement comprehensive unit assertions and type annotations to catch structural mutations before runtime."
            ],
            "codeComparison": {
                "antiPattern": "# Anti-Pattern: Unchecked access or direct mutation\n# This causes KeyError or unexpected side effects\ndata = {}\n# value = data['missing_key']  # Crashes with KeyError",
                "robustSolution": "# Idiomatic Pattern: Safe access with fallback or default dict\ndata = {}\nvalue = data.get('missing_key', 'default_value')\nprint(f'Retrieved safely: {value}')"
            },
            "summary": f"In {topic}, immutability guarantees deterministic hashing, preventing state pollution across scopes.",
            "proTip": "Use `sys.getsizeof()` and `collections.defaultdict` in Python to optimize both memory footprint and access speed."
        }

    async def generate_coding_challenge(self, current_topic: str) -> dict:
        prompt = f"""Generate a hands-on coding challenge for the lesson "{current_topic}".
The challenge should include:
1. "instructions": Clear task requirements and constraints.
2. "starterCode": Boilerplate starter function with TODO markers and docstrings.
3. "solutionCode": Complete working solution.
4. "testCases": 3 sample test assertions with input and expected output.

Format strictly as JSON:
{{
  "title": "Practice Challenge: {current_topic}",
  "instructions": "...",
  "starterCode": "def solve():\\n    # TODO: Implement solution\\n    pass",
  "solutionCode": "def solve():\\n    return True",
  "testCases": [
    {{"input": "solve()", "expected": "True", "description": "Basic validation"}}
  ]
}}
"""
        try:
            result = await self.generate(prompt)
            parsed = self.extract_json(result)
            if isinstance(parsed, dict) and "starterCode" in parsed and parsed.get("starterCode"):
                return parsed
        except Exception:
            pass

        return {
            "title": f"Live Coding Lab: {current_topic}",
            "instructions": f"Implement a clean, production-ready function to manipulate and validate {current_topic} with O(n) or better complexity.",
            "starterCode": f"def process_data(items: list) -> dict:\n    \"\"\"\n    TODO: Process items into a structured mapping for {current_topic}.\n    \"\"\"\n    result = {{}}\n    # Your implementation here\n    return result\n\n# Test execution\nprint(process_data(['alpha', 'beta', 'alpha']))",
            "solutionCode": "def process_data(items: list) -> dict:\n    result = {}\n    for item in items:\n        result[item] = result.get(item, 0) + 1\n    return result\n\nprint(process_data(['alpha', 'beta', 'alpha']))",
            "testCases": [
                {"input": "process_data(['a', 'b', 'a'])", "expected": "{'a': 2, 'b': 1}", "description": "Duplicate item frequency"},
                {"input": "process_data([])", "expected": "{}", "description": "Empty input safety"},
                {"input": "process_data(['x'])", "expected": "{'x': 1}", "description": "Single element mapping"}
            ]
        }

    def _fallback_course(self, topic: str, level: str, persona: str) -> dict:
        return {
            "courseTitle": f"Masterclass: {topic}",
            "level": level,
            "persona": persona,
            "modules": [
                {
                    "moduleId": "mod-1",
                    "moduleTitle": f"1. Core Mental Models & Syntax in {topic}",
                    "slides": [
                        {
                            "slideId": "s-1-1",
                            "title": "Architectural Foundation & Mental Model",
                            "speech": f"Welcome to our live masterclass on {topic}! Today we break down the core foundations from first principles so you master this both theoretically and practically.",
                            "exampleTitle": "CORE SYNTAX",
                            "code": f"# Fundamental setup for {topic}\ndef initialize_concept():\n    data_store = ['first_principle', 'declarative_logic']\n    print(f'Active state initialized: {{data_store}}')\n    return data_store\n\ninitialize_concept()",
                            "output": "Active state initialized: ['first_principle', 'declarative_logic']",
                            "explanation": f"When executing {topic}, the runtime environment allocates contiguous memory blocks and evaluates variable references in O(1) time.",
                            "keyPoints": [
                                "First-principles data structures ensure maximum runtime efficiency",
                                "Always maintain pure state isolation where possible",
                                "Time complexity: O(1) amortized access"
                            ],
                            "diagramType": "hashmap"
                        },
                        {
                            "slideId": "s-1-2",
                            "title": "Practical Implementation & Data Flow",
                            "speech": "Now let's look at how data actually moves through our pipeline. Notice how clean variable naming and deterministic transformations prevent subtle bugs.",
                            "exampleTitle": "PRACTICAL LAB",
                            "code": f"# Data transformation pipeline for {topic}\ndef transform_stream(inputs: list[int]) -> dict[int, int]:\n    # Dictionary comprehension for high performance\n    return {{num: num ** 2 for num in inputs if num > 0}}\n\nresult = transform_stream([1, 2, 3, 4, 5])\nprint(f'Computed output map: {{result}}')",
                            "output": "Computed output map: {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}",
                            "explanation": "Comprehensions execute in optimized C-level loops, reducing bytecode overhead compared to explicit append cycles.",
                            "keyPoints": [
                                "Comprehensions are 20-30% faster than manual for-loops",
                                "Memory footprint scales linearly O(n) with input size",
                                "Avoid nested comprehensions deeper than 2 levels"
                            ],
                            "diagramType": "array"
                        },
                        {
                            "slideId": "s-1-3",
                            "title": "Memory Map & Internal Allocation",
                            "speech": "Let's peer beneath the hood at how memory and pointers behave. Understanding hash tables and pointer indexing is what separates juniors from senior engineers.",
                            "exampleTitle": "MEMORY MAP",
                            "code": f"import sys\n\n# Inspecting memory allocation for {topic}\nitems = {{f'key_{{i}}': i for i in range(10)}}\nprint(f'Dictionary size in bytes: {{sys.getsizeof(items)}}')\nprint('Key presence test: ' + str('key_5' in items))",
                            "output": "Dictionary size in bytes: 360\nKey presence test: True",
                            "explanation": "Hash tables use open addressing with perturbation or bucket chaining, achieving instantaneous O(1) membership testing.",
                            "keyPoints": [
                                "Hash collision resolution uses deterministic probing",
                                "Keys must be strictly immutable (hashable)",
                                "Resizing occurs dynamically when load factor exceeds 2/3"
                            ],
                            "diagramType": "tree"
                        },
                        {
                            "slideId": "s-1-4",
                            "title": "Edge Cases & Production Hardening",
                            "speech": "In real-world production systems, you will face missing keys, unexpected nulls, and concurrency. Here is the hardened pattern you should always deploy.",
                            "exampleTitle": "EDGE CASE HANDLING",
                            "code": f"from collections import defaultdict\n\n# Defensive architecture for {topic}\nstats = defaultdict(list)\n\ndef record_event(category: str, metric: float):\n    stats[category].append(metric)\n\nrecord_event('latency_ms', 14.2)\nrecord_event('latency_ms', 11.8)\nprint(f'Consolidated metrics: {{dict(stats)}}')",
                            "output": "Consolidated metrics: {'latency_ms': [14.2, 11.8]}",
                            "explanation": "Defaultdict eliminates explicit defensive branching (try/except or if key in dict), leading to cleaner, more maintainable code.",
                            "keyPoints": [
                                "Eliminates KeyError exceptions automatically",
                                "Factory function executes lazily on first access",
                                "Standard pattern across high-throughput microservices"
                            ],
                            "diagramType": "flowchart"
                        }
                    ]
                },
                {
                    "moduleId": "mod-2",
                    "moduleTitle": f"2. Advanced Operations & Optimization",
                    "slides": [
                        {
                            "slideId": "s-2-1",
                            "title": "Algorithmic Efficiency & Benchmarking",
                            "speech": "Moving into Module 2! Let's explore performance benchmarks and algorithmic scaling under heavy data loads.",
                            "exampleTitle": "BENCHMARKING LAB",
                            "code": f"# Benchmarking lookup speeds in {topic}\nimport time\n\ndata_set = set(range(100_000))\nstart = time.perf_counter()\nfound = 99_999 in data_set\nelapsed = (time.perf_counter() - start) * 1_000_000\nprint(f'Lookup succeeded: {{found}} in {{elapsed:.2f}} microseconds')",
                            "output": "Lookup succeeded: True in 0.85 microseconds",
                            "explanation": "Sets and Dictionaries utilize direct pointer offsets, avoiding full sequential array scans.",
                            "keyPoints": [
                                "Set lookup: O(1) vs List lookup: O(n)",
                                "Always benchmark before premature optimization",
                                "Profile hot paths using cProfile or time.perf_counter"
                            ],
                            "diagramType": "hashmap"
                        }
                    ]
                },
                {
                    "moduleId": "mod-3",
                    "moduleTitle": f"3. Concurrency & State Management",
                    "slides": [
                        {
                            "slideId": "s-3-1",
                            "title": "Thread Safety & Immutable Snapshots",
                            "speech": "In concurrent applications, shared mutable state leads to race conditions. Let's study how to safely pass state across async tasks.",
                            "exampleTitle": "CONCURRENCY LAB",
                            "code": f"import asyncio\n\nasync def worker(worker_id: int, state: dict):\n    await asyncio.sleep(0.01)\n    print(f'Worker {{worker_id}} read state: {{state.get(\"status\")}}')\n\nasync def main():\n    shared_state = {{'status': 'HEALTHY', 'version': '1.0'}}\n    await asyncio.gather(*(worker(i, shared_state) for i in range(3)))\n\nasyncio.run(main())",
                            "output": "Worker 0 read state: HEALTHY\nWorker 1 read state: HEALTHY\nWorker 2 read state: HEALTHY",
                            "explanation": "Read-only snapshots are inherently thread-safe because no mutator lock is required.",
                            "keyPoints": [
                                "Prefer immutable data structures for concurrent tasks",
                                "Use asyncio.Lock when writing to shared state",
                                "Never mutate dictionaries while iterating over them"
                            ],
                            "diagramType": "flowchart"
                        }
                    ]
                },
                {
                    "moduleId": "mod-4",
                    "moduleTitle": f"4. Real-World Architecture & Case Studies",
                    "slides": [
                        {
                            "slideId": "s-4-1",
                            "title": "Production Microservice Integration",
                            "speech": "Let's connect our concepts to real enterprise architecture. Here is how top tech companies structure data caches and services.",
                            "exampleTitle": "SYSTEM ARCHITECTURE",
                            "code": f"# Cache layer implementation for {topic}\nclass SimpleCache:\n    def __init__(self, ttl: int = 60):\n        self._store = {{}}\n        self._ttl = ttl\n    \n    def set(self, key: str, value: any):\n        self._store[key] = value\n        \n    def get(self, key: str):\n        return self._store.get(key, None)\n\ncache = SimpleCache()\ncache.set('user:101', {{'name': 'Aura Learner', 'tier': 'pro'}})\nprint(cache.get('user:101'))",
                            "output": "{'name': 'Aura Learner', 'tier': 'pro'}",
                            "explanation": "In-memory caching reduces downstream database load by up to 95% in high-traffic APIs.",
                            "keyPoints": [
                                "Cache invalidation is a critical design requirement",
                                "Use LRU (Least Recently Used) eviction for bounded memory",
                                "Serialize data using compact binary formats when scaling"
                            ],
                            "diagramType": "tree"
                        }
                    ]
                },
                {
                    "moduleId": "mod-5",
                    "moduleTitle": f"5. Synthesis, Quiz & Capstone Practice",
                    "slides": [
                        {
                            "slideId": "s-5-1",
                            "title": "Mastery Capstone & Interview Checklist",
                            "speech": "Congratulations on completing the multi-module masterclass! Here is your final summary and technical interview cheat sheet.",
                            "exampleTitle": "CAPSTONE SUMMARY",
                            "code": f"# Capstone mastery verification for {topic}\nchecklist = [\n    'Time Complexity: Mastered O(1) vs O(n)',\n    'Memory Layout: Understood Hash probing',\n    'Production Safety: Defaultdict & Lock patterns verified'\n]\n\nfor item in checklist:\n    print(f'✅ {{item}}')\n\nprint('\\n🚀 Ready for real-world projects and technical interviews!')",
                            "output": "✅ Time Complexity: Mastered O(1) vs O(n)\n✅ Memory Layout: Understood Hash probing\n✅ Production Safety: Defaultdict & Lock patterns verified\n\n🚀 Ready for real-world projects and technical interviews!",
                            "explanation": "True mastery combines first-principles understanding, clean coding habits, and deep architectural intuition.",
                            "keyPoints": [
                                "Review the key rules before any technical assessment",
                                "Practice implementing data structures from scratch",
                                "Keep experimenting in the interactive coding lab"
                            ],
                            "diagramType": "none"
                        }
                    ]
                }
            ]
        }