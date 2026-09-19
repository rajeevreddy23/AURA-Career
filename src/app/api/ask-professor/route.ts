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

    // DEEP CONCEPT SYSTEM PROMPT — Concept-focused, language-appropriate
    const systemPrompt = `You are "Professor AURA", an elite AI computer science and software engineering educator on the AuraCareer platform.

Persona: "${persona}". Course: "${courseTitle}". Topic: "${topic}".
${personaDirective}
${difficultyDirective}

STRICT INSTRUCTIONS:
1. FOCUS STRICTLY ON THE USER'S ASKED CONCEPT ("${studentQuestion}"). Do NOT drift into unrelated topics or Python memory models unless Python was explicitly requested.
2. Adopt the selected TEACHING STYLE (${personaDirective}) and DIFFICULTY LEVEL (${difficultyDirective}) in your response tone and depth.
3. Use language-appropriate code or pseudocode matching the requested domain (e.g. JS/TS for web, C/C++ for OS/memory, SQL for databases, general pseudocode/Python ONLY if appropriate).

MANDATORY RESPONSE STRUCTURE for the "answer" field:

## 🧠 What is [Concept]?
Write a crystal-clear, intuitive definition of "${studentQuestion}". Use a memorable real-world analogy.

## 🔍 Core Mechanism — How It Works (Step-by-Step)
Explain step-by-step how "${studentQuestion}" operates under the hood.

## 🌐 Real-World Applications & Industry Uses
Provide concrete real-world use cases where this exact concept is applied in production.

## 💻 Code / Concrete Example
Provide a clean, production-ready code snippet or structural example demonstrating "${studentQuestion}".

## 🔬 Key Takeaways & Best Practices
Highlight trade-offs, common pitfalls, and architectural best practices.

Student question: "${studentQuestion}"
Recent chat:
${history.slice(-4).map((h) => `${h.sender || h.name || 'User'}: ${h.text || h.content || ''}`).join('\n')}

Respond ONLY as valid JSON (no markdown fences) with this schema:
{
  "answer": "FULL MARKDOWN RESPONSE answering '${studentQuestion}'",
  "speech": "A concise 2-3 sentence spoken overview of the core concept for the AI avatar.",
  "codeSnippet": "Code snippet demonstrating the exact concept",
  "output": "Console/terminal output of the example",
  "memoryInsight": "Key technical insight about efficiency, complexity, or architecture of this concept.",
  "suggestedFollowUp": "1 insightful follow-up question to deepen understanding.",
  "nextConcept": {
    "title": "Logical next concept to explore",
    "teaser": "Brief preview of why the next concept matters."
  }
}`;

    const userPrompt = `The student asks: "${studentQuestion}"

Provide a thorough, direct explanation of "${studentQuestion}". Focus strictly on what was asked.`;

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

  return {
    answer: `## 🧠 What is ${cleanQ}?\n\n**${cleanQ}** is a fundamental concept in software engineering and computer science. It defines how systems structure logic, process inputs, and manage operational flow.\n\n### 🔍 Core Mechanism (Step-by-Step)\n1. **Initialization**: The system sets up state, variables, or data context required for execution.\n2. **Processing**: Operations execute sequentially or concurrently based on core rules.\n3. **Evaluation**: Outputs are computed, validated, and returned to the calling context.\n\n### 🌐 Real-World Applications\n* **Production Systems**: Applied in distributed architectures, database engines, and web applications for reliable processing.\n* **Best Practice**: Validate inputs at boundary layers and design for modular, maintainable execution.`,
    codeSnippet: currentSlide.code || `// Demonstration of ${cleanQ}\nfunction explainConcept() {\n  console.log("Executing core logic for ${cleanQ}");\n  return true;\n}\n\nexplainConcept();`,
    output: `Executing core logic for ${cleanQ}`,
    memoryInsight: `Understanding ${cleanQ} ensures optimal system architecture and predictable execution times.`,
    suggestedFollowUp: `What are the most common edge cases when working with ${cleanQ}?`,
    nextConcept: {
      title: `Advanced ${cleanQ} Patterns`,
      teaser: `Explore how senior engineers optimize ${cleanQ} for high-scale production systems.`,
    },
  };
}
