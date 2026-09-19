import { NextRequest, NextResponse } from 'next/server';
import { generateStructuredJSON } from '@/lib/ai/llm';

// Allow up to 60 seconds for deep AI concept generation
export const maxDuration = 60;

interface AskProfessorPayload {
  question?: string;
  query?: string;
  message?: string;
  persona?: string;
  teacherId?: string;
  courseTitle?: string;
  topic?: string;
  currentTopic?: string;
  currentSlide?: {
    title?: string;
    speech?: string;
    code?: string;
    explanation?: string;
    keyPoints?: string[];
  };
  context?: string | Record<string, unknown>;
  history?: Array<{
    sender?: string;
    role?: string;
    text?: string;
    content?: string;
    name?: string;
  }>;
  difficulty?: string;
}

interface ProfessorResponseData {
  answer: string;
  speech?: string;
  codeSnippet?: string;
  output?: string;
  memoryInsight?: string;
  suggestedFollowUp?: string;
  nextConcept?: { title: string; teaser: string };
}

export async function POST(req: NextRequest) {
  try {
    const body: AskProfessorPayload = await req.json();
    const studentQuestion = (body.question || body.query || body.message || '').trim();
    const persona = body.persona || body.teacherId || 'Professor Structured';
    const topic = body.currentTopic || body.topic || 'Computer Science & Software Engineering';
    const courseTitle = body.courseTitle || 'Masterclass';
    const currentSlide = body.currentSlide || {};
    const history = body.history || [];
    const difficulty = body.difficulty || 'deep_masterclass';

    if (!studentQuestion) {
      return NextResponse.json(
        { success: false, error: 'Question text is required' },
        { status: 400 }
      );
    }

    const pLower = persona.toLowerCase();
    let personaDirective = 'TEACHING STYLE: Structured, clear academic explanation.';
    if (pLower.includes('friend')) {
      personaDirective = 'TEACHING STYLE: FRIEND / PEER MENTOR. Speak warmly and encouragingly like a supportive coding friend ("Hey friend!"). Use casual relatable analogies, warm encouragement, and accessible explanations.';
    } else if (pLower.includes('coach')) {
      personaDirective = 'TEACHING STYLE: MOTIVATIONAL COACH. High-energy, action-oriented, sports/gym training style ("Let us crush this concept!", "Training Step 1"). Push the student to master skills with high enthusiasm.';
    } else if (pLower.includes('expert')) {
      personaDirective = 'TEACHING STYLE: SENIOR PRINCIPAL ARCHITECT. Deep engineering focus on system design, micro-optimizations, edge cases, scalability, and production trade-offs.';
    } else if (pLower.includes('simplifier')) {
      personaDirective = 'TEACHING STYLE: SIMPLIFIER (ELI5). Explain like I am 5 years old. Break down every complex term into super simple everyday metaphors (like LEGO bricks, recipes, or postal mail).';
    } else if (pLower.includes('professor')) {
      personaDirective = 'TEACHING STYLE: ACADEMIC PROFESSOR. Rigorous, structured, first-principles logic with academic depth.';
    }

    let difficultyDirective = 'DIFFICULTY: Intermediate (Standard engineering standards & practical code).';
    if (difficulty === 'beginner') {
      difficultyDirective = 'DIFFICULTY LEVEL: BEGINNER. Focus on fundamental intuition, avoid intimidating jargon, explain all terms, and use basic step-by-step code.';
    } else if (difficulty === 'advanced' || difficulty === 'deep_masterclass') {
      difficultyDirective = 'DIFFICULTY LEVEL: ADVANCED. Cover low-level execution mechanics, memory/concurrency trade-offs, performance characteristics, and senior developer considerations.';
    } else if (difficulty === 'turbo_fast') {
      difficultyDirective = 'DIFFICULTY LEVEL: TURBO FAST. Be super rapid, punchy, 2-3 short paragraphs max with a concise code snippet.';
    }

    // ADVANCED CHATGPT / GEMINI CONVERSATIONAL AI PROFESSOR DIRECTIVES
    const systemPrompt = `You are "Professor AURA", a world-class conversational AI educator and principal engineer on AuraCareer, functioning with the intellectual depth, warmth, and teaching excellence of ChatGPT-4o and Google Gemini 1.5 Pro.

Persona: "${persona}". Course: "${courseTitle}". Active Topic: "${topic}".
${personaDirective}
${difficultyDirective}

YOUR CORE PEDAGOGY & CHATGPT-GRADE BEHAVIOR:
1. NATURAL CONVERSATIONAL TONE: Talk directly to the student like a real, brilliant 1-on-1 mentor having an active conversation. Greet their question naturally and empathetically.
2. LIVE VISUAL FLOWCHART (MANDATORY): Always include a clean, syntactically valid Mermaid.js diagram (using \`\`\`mermaid ... \`\`\`) in your markdown answer. Use \`graph TD\`, \`sequenceDiagram\`, or \`stateDiagram-v2\` to visually map out the concept's data flow, state machine, or step-by-step architecture. Ensure valid Mermaid syntax without special character issues.
3. FIRST-PRINCIPLES & UNDER-THE-HOOD MECHANISM: Do not stay on the surface. Walk through the internal machinery—how memory, call stacks, event loops, database indices, or CPU registers process this concept.
4. PRODUCTION CODE & DRY-RUN TRACE: Provide clean, idiomatic, syntax-highlighted code matching the topic domain. Follow the code with an execution trace showing what happens at each step.
5. REAL-WORLD FAANG / INDUSTRY USAGE: Explain how top engineering teams (e.g. Google, Netflix, Uber, Stripe) utilize this in production systems at scale.
6. WATCH OUT FOR THIS TRAP (ANTI-PATTERNS): Contrast a common junior developer misconception with the robust senior engineering pattern.
7. INTERACTIVE SOCRATIC CHALLENGE: Finish your response by asking the student a thought-provoking scenario or challenge question ("💡 Over to you: What happens if...? Let me know your thoughts!") to drive active learning.

Recent Chat Context:
${history.slice(-4).map((h) => `${h.sender || h.name || 'User'}: ${h.text || h.content || ''}`).join('\n')}

MANDATORY JSON RESPONSE SCHEMA (Return ONLY valid JSON):
{
  "answer": "Full comprehensive markdown explanation with conversational opening, \`\`\`mermaid diagram, deep mechanics, code with comments, industry context, anti-patterns, and interactive Socratic challenge.",
  "speech": "An energetic, natural conversational spoken summary (2-3 sentences max) for the floating AI avatar to speak aloud.",
  "codeSnippet": "The primary clean, runnable code snippet demonstrating the concept.",
  "output": "Exact simulated console / terminal output.",
  "memoryInsight": "One deep technical punchline regarding time/space complexity or internal architecture.",
  "suggestedFollowUp": "An intriguing follow-up question for the student to explore next.",
  "nextConcept": {
    "title": "Logical Next Concept",
    "teaser": "Quick compelling preview of why this next concept builds upon what was just learned."
  }
}`;

    const userPrompt = `Student question: "${studentQuestion}"

Course: "${courseTitle}"
Topic: "${topic}"

Provide a world-class, engaging, comprehensive ChatGPT/Gemini-grade explanation of "${studentQuestion}" with a visual Mermaid flowchart diagram, under-the-hood execution mechanics, runnable code, and an interactive Socratic challenge.`;

    const responseData = await generateStructuredJSON<ProfessorResponseData>(
      systemPrompt,
      userPrompt,
      () => generateIntelligentFallback(studentQuestion, topic, persona, currentSlide)
    );

    const safeAnswer = responseData.answer || `Here is the explanation for ${studentQuestion}.`;
    const safeData: ProfessorResponseData = {
      answer: safeAnswer,
      speech: responseData.speech || undefined,
      codeSnippet: responseData.codeSnippet || undefined,
      output: responseData.output || undefined,
      memoryInsight: responseData.memoryInsight || undefined,
      suggestedFollowUp: responseData.suggestedFollowUp || undefined,
      nextConcept: responseData.nextConcept || undefined,
    };

    return NextResponse.json({
      success: true,
      answer: safeData.answer,
      data: safeData,
    });

  } catch (error: any) {
    console.error('Ask-Professor error:', error);
    const fallback = generateIntelligentFallback(
      'Concept',
      'Computer Science',
      'Professor Aura',
      {}
    );
    return NextResponse.json({
      success: true,
      answer: fallback.answer,
      data: fallback,
    });
  }
}

/**
 * Intelligent contextual fallback engine for offline resilience
 */
function generateIntelligentFallback(
  question: string,
  topic: string,
  persona: string,
  currentSlide: { title?: string; code?: string; explanation?: string }
): ProfessorResponseData {
  const cleanQ = question.trim() || 'Core Concept';
  const sanitizedTitle = cleanQ.replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 30) || 'ExecutionFlow';

  return {
    answer: `Let's break down **${cleanQ}** from first principles! This is a pivotal building block in modern software engineering and systems architecture.

### 📊 Visual Execution Flow
\`\`\`mermaid
graph TD
  A[Input Trigger: ${sanitizedTitle}] --> B[Processing & Memory Allocation]
  B --> C{Validation & Logic Flow}
  C -->|Valid Path| D[Optimal Execution & Output]
  C -->|Edge Case| E[Recovery Handler & Boundary Check]
  D --> F[Caller Context Updated]
\`\`\`

### 🔍 Under-the-Hood Mechanics
1. **State & Environment Setup**: The runtime initializes the call frame, allocates required memory on the stack or heap, and validates incoming parameters.
2. **Deterministic Processing**: The logic executes according to algorithmic invariants, maintaining consistent state transitions.
3. **Unwinding & Resource Cleanup**: Upon completion, return values are pushed to the caller and allocated references are safely resolved.

### 💻 Live Implementation Example
\`\`\`typescript
// Production-grade implementation for ${cleanQ}
export function handleConceptExecution(inputData: Record<string, unknown>) {
  if (!inputData || Object.keys(inputData).length === 0) {
    throw new Error('Invalid input parameter passed to execution context');
  }
  
  // Core processing pipeline
  console.log("Processing ${cleanQ} logic with optimal time complexity...");
  return { status: "success", timestamp: Date.now() };
}
\`\`\`

### 🏢 Real-World Industry Application (FAANG Scale)
In large-scale production architectures (such as distributed microservices at Google or Netflix), **${cleanQ}** is utilized to maintain data consistency, enforce boundary contracts, and prevent cascading systemic failures.

> 💡 **Watch Out for This Trap**: A common junior mistake is omitting defensive boundary checks or ignoring resource exhaustion edge cases. Always benchmark under peak concurrency loads.

---
💡 **Check Your Understanding**: If the incoming input in the example above was null or encountered a network timeout, how would your error boundary respond? Let me know your thoughts or ask your next question below!`,
    speech: `Welcome! Let's explore ${cleanQ}. It defines how logic and memory execute reliably under the hood. Take a look at the live architecture flowchart below!`,
    codeSnippet: currentSlide.code || `// Implementation of ${cleanQ}\nfunction run() {\n  console.log("Executing ${cleanQ}...");\n  return true;\n}\nrun();`,
    output: `Executing ${cleanQ}... [Status: 200 OK]`,
    memoryInsight: `Mastering ${cleanQ} gives you deep architectural leverage when building high-throughput systems.`,
    suggestedFollowUp: `How does ${cleanQ} perform under heavy concurrency loads?`,
    nextConcept: {
      title: `Advanced ${cleanQ} Patterns`,
      teaser: `Explore how senior staff engineers optimize ${cleanQ} for global distributed scale.`,
    },
  };
}
