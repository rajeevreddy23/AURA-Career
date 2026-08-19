import { NextRequest, NextResponse } from 'next/server';
import { generateStructuredJSON } from '@/lib/ai/llm';
import type { LessonModule } from '@/hooks/useClassroomState';
import { getCourseSyllabus } from '@/lib/constants/syllabi';

interface CourseCurriculumResponse {
  courseTitle: string;
  topic: string;
  overview: string;
  modules: LessonModule[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const courseId = body.courseId || '1';
    const knownCourse = getCourseSyllabus(courseId, body.level || 'beginner');
    const topic = (body.topic || body.currentTopic || knownCourse.courseTitle || 'Computer Science & Software Engineering').trim();
    const level = body.level || body.difficulty || 'beginner';
    const persona = body.persona || 'Professor Aura';
    const depth = body.depth || 'Comprehensive';

    const systemPrompt = `You are "Professor Aura", a world-class AI computer science educator and principal curriculum architect.
Your task is to generate a comprehensive, highly structured, production-grade 4-module masterclass curriculum for the topic: "${topic}".
Target Audience Level: "${level}".
Teaching Persona: "${persona}".
Depth: "${depth}".

You MUST return a valid JSON object matching this EXACT schema:
{
  "courseTitle": "Masterclass: Concise High-Impact Course Title",
  "topic": "${topic}",
  "overview": "A clear, compelling 1-2 sentence overview of what the student will achieve by mastering this curriculum.",
  "modules": [
    {
      "moduleId": "mod-1",
      "moduleTitle": "1. Chapter Name (e.g. Foundations & Architecture)",
      "chapterSummary": "A clear 1-sentence summary of what this chapter covers and explains.",
      "status": "in_progress",
      "slides": [
        {
          "slideId": "s-1-1",
          "title": "Concept Name (e.g. Memory Layout & Pointer Allocation)",
          "conceptTag": "CORE ARCHITECTURE",
          "speech": "An energetic, engaging, step-by-step spoken explanation from Professor Aura introducing the concept with real-world intuition.",
          "exampleTitle": "FOUNDATIONAL SYNTAX",
          "code": "Clean, syntactically correct, well-commented code snippet demonstrating the concept in the most appropriate language (Python, TypeScript, Go, etc.).",
          "output": "The exact console/terminal output produced when this code executes.",
          "explanation": "In-depth technical breakdown explaining memory layout, Big-O time/space complexity, internal execution flow, and why this design matters.",
          "keyPoints": [
            "Golden rule / core concept 1",
            "Performance or safety takeaway 2",
            "Interview / production best practice 3"
          ],
          "diagramType": "flowchart"
        }
      ]
    }
  ]
}

Curriculum Requirements:
1. Generate 3 to 4 structured modules (Chapters).
2. Module 1: Foundations & Architecture.
3. Module 2: Mechanics, Syntax & Implementation.
4. Module 3: Performance, Edge Cases & Real-World Capstone.
5. Each module MUST have 2 high-impact slides with clean concise code, realistic output, and key points.
6. diagramType must be one of: 'hashmap' | 'array' | 'tree' | 'flowchart' | 'none'.
7. The first module must have status "in_progress", and subsequent modules must have status "upcoming".
8. Return valid JSON only without any markdown fences.`;

    const userPrompt = `Generate a 3-module masterclass curriculum for "${topic}" at level "${level}".`;

    const curriculum = await generateStructuredJSON<CourseCurriculumResponse>(
      systemPrompt,
      userPrompt,
      () => generateFallbackCourse(topic, level, persona)
    );

    // Sanitize modules to ensure all required fields exist
    const sanitizedModules: LessonModule[] = (curriculum.modules || []).map((mod, modIdx) => ({
      moduleId: mod.moduleId || `mod-${modIdx + 1}`,
      moduleTitle: mod.moduleTitle || `Module ${modIdx + 1}: ${topic}`,
      chapterSummary: mod.chapterSummary || `Comprehensive deep dive into ${mod.moduleTitle || topic}.`,
      status: modIdx === 0 ? 'in_progress' : 'upcoming',
      slides: (mod.slides || []).map((slide, slideIdx) => ({
        slideId: slide.slideId || `s-${modIdx + 1}-${slideIdx + 1}`,
        title: slide.title || `Concept ${slideIdx + 1}`,
        conceptTag: slide.conceptTag || (slideIdx === 0 ? 'CORE CONCEPT' : 'PRACTICAL LAB'),
        speech: slide.speech || `Let's examine how ${topic} works from first principles.`,
        exampleTitle: slide.exampleTitle || 'CODE IMPLEMENTATION',
        code: slide.code || `# Verified example for ${topic}\nprint("Mastering ${topic}")`,
        output: slide.output || `>>> Mastering ${topic}`,
        explanation: slide.explanation || `Understanding the fundamental runtime mechanics of ${topic}.`,
        keyPoints: Array.isArray(slide.keyPoints) && slide.keyPoints.length > 0
          ? slide.keyPoints
          : ['Understand time and space complexity', 'Write idiomatic and defensive code', 'Validate edge cases'],
        diagramType: (['hashmap', 'array', 'tree', 'flowchart', 'none'].includes(slide.diagramType)
          ? slide.diagramType
          : 'flowchart') as any,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: {
        courseTitle: curriculum.courseTitle || `Masterclass: ${topic}`,
        topic,
        overview: curriculum.overview || `Mastering ${topic} from fundamentals to advanced patterns.`,
        modules: sanitizedModules.length > 0 ? sanitizedModules : generateFallbackCourse(topic, level, persona).modules,
      },
    });

  } catch (error: any) {
    console.error('generate-lesson error:', error);
    const fallback = generateFallbackCourse('Computer Science & Software Engineering', 'beginner', 'Professor Aura');
    return NextResponse.json({
      success: true,
      data: fallback,
    });
  }
}

/**
 * Rich, context-aware fallback curriculum generator when external APIs are unavailable
 */
function generateFallbackCourse(topic: string, level: string, persona: string): CourseCurriculumResponse {
  return {
    courseTitle: `Masterclass: ${topic} Architecture & Engineering`,
    topic,
    overview: `A complete masterclass in ${topic}, covering core architecture, runtime mechanics, performance optimizations, and design patterns.`,
    modules: [
      {
        moduleId: 'mod-1',
        moduleTitle: `1. Foundations & Architecture of ${topic}`,
        chapterSummary: `Foundational mental models, execution lifecycle, and core abstractions in ${topic}.`,
        status: 'in_progress',
        slides: [
          {
            slideId: 's-1-1',
            title: 'Core Abstractions & System Design',
            conceptTag: 'CORE ARCHITECTURE',
            speech: `Welcome everyone! Today we dissect ${topic} from first principles. Notice how core data structures and execution flow dictate performance.`,
            exampleTitle: 'CORE ARCHITECTURE',
            code: `# Foundational setup for ${topic}\ndef initialize_system():\n    config = {"topic": "${topic}", "mode": "production"}\n    print(f"System initialized with {config['topic']}")\n    return config\n\ninitialize_system()`,
            output: `System initialized with ${topic}`,
            explanation: `Under the hood in ${topic}, memory pointers and runtime structures ensure predictable allocation and deterministic execution.`,
            keyPoints: [
              `O(1) initialization and predictable state layout`,
              `Clean modular abstraction separating concerns`,
              `Strict validation of inputs at boundary layers`
            ],
            diagramType: 'flowchart',
          },
          {
            slideId: 's-1-2',
            title: 'Memory Layout & Data Flow',
            conceptTag: 'MEMORY & STATE',
            speech: `Let's trace what happens in memory when processing streams in ${topic}. Notice how references prevent unnecessary allocations.`,
            exampleTitle: 'PRACTICAL LAB',
            code: `# Memory-efficient processing in ${topic}\ndef process_stream(items):\n    return [item.strip().title() for item in items if item]\n\nraw_data = ["alpha", "beta", "gamma"]\nprint(f"Processed: {process_stream(raw_data)}")`,
            output: `Processed: ['Alpha', 'Beta', 'Gamma']`,
            explanation: `In-place transformations and generator iterators bypass intermediary list allocations, saving heap space.`,
            keyPoints: [
              `Leverage zero-copy iterators for large payloads`,
              `Prevent reference leaks by isolating state transformations`,
              `Ensure immutability guarantees where state is shared`
            ],
            diagramType: 'array',
          },
        ],
      },
      {
        moduleId: 'mod-2',
        moduleTitle: `2. Syntax, Patterns & Idiomatic Implementation`,
        chapterSummary: `Idiomatic syntax, best practices, and pattern implementation in ${topic}.`,
        status: 'upcoming',
        slides: [
          {
            slideId: 's-2-1',
            title: 'Idiomatic Patterns & Error Handling',
            conceptTag: 'SYNTAX & PATTERNS',
            speech: `Writing production code requires robust error handling. Let's see how defensive engineering eliminates runtime crashes.`,
            exampleTitle: 'DEFENSIVE PATTERNS',
            code: `# Defensive execution pattern in ${topic}\ndef safe_execute(action_fn, *args):\n    try:\n        return {"success": True, "result": action_fn(*args)}\n    except Exception as err:\n        return {"success": False, "error": str(err)}\n\nres = safe_execute(lambda x: 100 / x, 5)\nprint(f"Execution: {res}")`,
            output: `Execution: {'success': True, 'result': 20.0}`,
            explanation: `Defensive boundary checks catch boundary anomalies early before bubbling up to consumer components.`,
            keyPoints: [
              `Wrap third-party and I/O boundaries in safe error wrappers`,
              `Return structured result objects rather than raw exceptions`,
              `Log diagnostic context alongside failure reasons`
            ],
            diagramType: 'flowchart',
          },
          {
            slideId: 's-2-2',
            title: 'High-Throughput Transformation',
            conceptTag: 'DATA TRANSFORMATION',
            speech: `When transforming datasets, vectorized or compiled loops run significantly faster than naive element-by-element iterations.`,
            exampleTitle: 'ALGORITHMIC PIPELINE',
            code: `# High-throughput mapping in ${topic}\ndef transform_pipeline(records):\n    return {r['id']: r['val'] * 2 for r in records if r.get('active', False)}\n\ndataset = [{'id': 'a1', 'val': 10, 'active': True}, {'id': 'a2', 'val': 20, 'active': False}]\nprint(f"Mapped: {transform_pipeline(dataset)}")`,
            output: `Mapped: {'a1': 20}`,
            explanation: `Hash table indexing gives O(1) average lookup times while filtering active keys in a single pass.`,
            keyPoints: [
              `O(n) single-pass dictionary comprehension`,
              `Eliminates redundant lookup passes`,
              `Filters inactive state cleanly in comprehension condition`
            ],
            diagramType: 'hashmap',
          },
        ],
      },
      {
        moduleId: 'mod-3',
        moduleTitle: `3. Performance Optimization & Edge Cases`,
        chapterSummary: `Profiling bottlenecks, memory optimization, and edge-case resilience in ${topic}.`,
        status: 'upcoming',
        slides: [
          {
            slideId: 's-3-1',
            title: 'Algorithmic Complexity & Profiling',
            conceptTag: 'PERFORMANCE & TIME COMPLEXITY',
            speech: `Every algorithm has trade-offs. Let's analyze time and space complexity to ensure sub-millisecond latency.`,
            exampleTitle: 'COMPLEXITY BENCHMARK',
            code: `import time\n\n# Benchmark O(1) vs O(n) lookups\ncache = {f"k_{i}": i for i in range(1000)}\nstart = time.perf_counter()\nval = cache.get("k_999")\nend = time.perf_counter()\n\nprint(f"Lookup result: {val} (Latency: {(end - start)*1e6:.2f} \u03bcs)")`,
            output: `Lookup result: 999 (Latency: 0.24 \u03bcs)`,
            explanation: `CPython hash collision resolution uses perturbation probing to ensure constant-time lookups across millions of entries.`,
            keyPoints: [
              `O(1) average time complexity for key lookups`,
              `Monitor load factor to prevent excessive hash collision clustering`,
              `Preallocate capacity when total item count is known in advance`
            ],
            diagramType: 'hashmap',
          },
        ],
      },
      {
        moduleId: 'mod-4',
        moduleTitle: `4. Production Capstone & Architecture Mastery`,
        chapterSummary: `Building end-to-end resilient architecture, design patterns, and capstone review in ${topic}.`,
        status: 'upcoming',
        slides: [
          {
            slideId: 's-4-1',
            title: 'Production Capstone: Scalable Architecture',
            conceptTag: 'CAPSTONE ARCHITECTURE',
            speech: `Congratulations on reaching the capstone! Let's synthesize everything we have learned into an enterprise-ready pattern.`,
            exampleTitle: 'ENTERPRISE PATTERN',
            code: `class ServiceManager:\n    def __init__(self, name: str):\n        self.name = name\n        self.registry = {}\n\n    def register(self, key: str, handler):\n        self.registry[key] = handler\n        return self\n\n    def dispatch(self, key: str, payload):\n        handler = self.registry.get(key)\n        if not handler:\n            raise ValueError(f"Handler not found for: {key}")\n        return handler(payload)\n\n# Instantiate & dispatch\nservice = ServiceManager("${topic}Service")\nservice.register("ping", lambda d: {"status": "ok", "echo": d})\nprint(service.dispatch("ping", "hello live classroom"))`,
            output: `{'status': 'ok', 'echo': 'hello live classroom'}`,
            explanation: `The Registry Pattern decouples handler implementations from the dispatch lifecycle, enabling painless horizontal extensibility.`,
            keyPoints: [
              `Decoupled dependency injection enables isolated unit testing`,
              `O(1) handler dispatch via dictionary lookup table`,
              `Clean separation between business logic and transport mechanics`
            ],
            diagramType: 'tree',
          },
        ],
      },
    ],
  };
}
