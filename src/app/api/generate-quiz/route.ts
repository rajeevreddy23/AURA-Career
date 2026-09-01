import { NextRequest, NextResponse } from 'next/server';
import { generateStructuredJSON } from '@/lib/ai/llm';

export const maxDuration = 60;

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface GenerateQuizPayload {
  topic?: string;
  courseTitle?: string;
  chatHistory?: Array<{ title?: string; explanation?: string }>;
}

interface QuizResponse {
  quizTitle: string;
  questions: QuizQuestion[];
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateQuizPayload = await req.json();
    const topic = body.topic || 'Computer Science & Software Engineering';
    const courseTitle = body.courseTitle || 'Masterclass';
    const historyText = (body.chatHistory || [])
      .map((h, i) => `Concept ${i + 1}: ${h.title || ''} - ${h.explanation?.slice(0, 150) || ''}`)
      .join('\n');

    const systemPrompt = `You are Professor AURA. Generate a comprehensive 20-question multiple-choice diagnostic quiz based on the user's current classroom lesson on "${topic}" (Course: "${courseTitle}").

Recent classroom discussions and topics covered:
${historyText || topic}

CRITICAL RULES:
1. Generate EXACTLY 20 distinct, high-quality multiple choice questions (numbered 1 to 20).
2. Each question MUST have exactly 4 options labeled A, B, C, D.
3. Provide the zero-based index of the correct answer (0 for A, 1 for B, 2 for C, 3 for D).
4. Include a concise 1-sentence explanation for why that answer is correct.
5. Base the questions directly on the lesson concepts provided.

Respond ONLY as valid JSON in this exact structure:
{
  "quizTitle": "Comprehensive Diagnostic Quiz on ${topic}",
  "questions": [
    {
      "id": 1,
      "question": "Clear, precise technical question 1?",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      "correctIndex": 0,
      "explanation": "Detailed reason why Option A is correct."
    }
  ]
}`;

    const userPrompt = `Generate a 20-question quiz for "${topic}". Ensure there are 20 questions in the "questions" array.`;

    const quizData = await generateStructuredJSON<QuizResponse>(
      systemPrompt,
      userPrompt,
      () => generateFallbackQuiz(topic)
    );

    const validQuestions = (quizData?.questions && quizData.questions.length >= 10)
      ? quizData.questions
      : generateFallbackQuiz(topic).questions;

    return NextResponse.json({
      success: true,
      quizTitle: quizData?.quizTitle || `Diagnostic Quiz: ${topic}`,
      questions: validQuestions,
    });

  } catch (error: any) {
    console.error('Quiz generation error:', error);
    const fallback = generateFallbackQuiz('Computer Science');
    return NextResponse.json({
      success: true,
      quizTitle: fallback.quizTitle,
      questions: fallback.questions,
    });
  }
}

function generateFallbackQuiz(topic: string): QuizResponse {
  const sampleTopics = [
    { q: `What is the core objective when engineering systems for ${topic}?`, opts: ['A. Maximizing execution speed & system stability', 'B. Minimizing memory to zero bytes', 'C. Eliminating all user inputs', 'D. Ignoring error handling'], correct: 0, exp: 'Engineering systems prioritizes execution efficiency and fault tolerance.' },
    { q: `How do scalable architectures handle sudden traffic spikes?`, opts: ['A. By crashing immediately', 'B. Via load balancing, auto-scaling & caching', 'C. By deleting database records', 'D. By disabling network ports'], correct: 1, exp: 'Load balancing distributes traffic dynamically across available worker nodes.' },
    { q: `What is the primary benefit of modular code design in ${topic}?`, opts: ['A. Harder debugging', 'B. High coupling', 'C. Reusability, maintainability & clear separation of concerns', 'D. Slower compile times'], correct: 2, exp: 'Modular design isolates functionality for easy testing and maintenance.' },
    { q: `Which complexity class represents logarithmic search efficiency?`, opts: ['A. O(N^2)', 'B. O(N)', 'C. O(log N)', 'D. O(2^N)'], correct: 2, exp: 'Binary search and balanced trees operate in O(log N) logarithmic time.' },
    { q: `Why are immutable data structures preferred in concurrent multi-threaded environments?`, opts: ['A. They eliminate data race conditions', 'B. They use 100x more memory', 'C. They prevent function calls', 'D. They disable garbage collection'], correct: 0, exp: 'Immutability guarantees state cannot be altered by competing threads simultaneously.' },
    { q: `What is the function of an index in database query optimization?`, opts: ['A. Encrypting table records', 'B. Accelerated O(1) or O(log N) record lookups', 'C. Auto-deleting old data', 'D. Formatting UI displays'], correct: 1, exp: 'Indexes create B-Tree lookup paths to bypass full table scans.' },
    { q: `What does defensive programming advocate at API boundaries?`, opts: ['A. Trusting all incoming inputs implicitly', 'B. Strict input validation, sanitization & error handling', 'C. Commenting out assertions', 'D. Disabling CORS headers'], correct: 1, exp: 'Boundary validation prevents malformed requests and security vulnerabilities.' },
    { q: `In asynchronous programming, what does an event loop manage?`, opts: ['A. Hardware CPU clock cycles', 'B. Non-blocking I/O callbacks & task queues', 'C. Hard drive partitioning', 'D. Monitor refresh rates'], correct: 1, exp: 'The event loop processes asynchronous callbacks efficiently on single/multi-thread runtimes.' },
    { q: `What is the time complexity of a hash map lookup on average?`, opts: ['A. O(N)', 'B. O(1)', 'C. O(N log N)', 'D. O(N^3)'], correct: 1, exp: 'Direct hash key indexing provides constant O(1) average lookup time.' },
    { q: `Why is caching used in modern system architecture?`, opts: ['A. To bypass repeated expensive database/network calls', 'B. To permanently store backups', 'C. To replace application code', 'D. To slow down API response times'], correct: 0, exp: 'Caching stores frequently requested data in fast memory for instant retrieval.' },
  ];

  const questions: QuizQuestion[] = [];
  for (let i = 1; i <= 20; i++) {
    const item = sampleTopics[(i - 1) % sampleTopics.length];
    questions.push({
      id: i,
      question: `${i}. ${item.q}`,
      options: item.opts,
      correctIndex: item.correct,
      explanation: item.exp,
    });
  }

  return {
    quizTitle: `Live Diagnostic Quiz: ${topic} (20 Questions)`,
    questions,
  };
}
