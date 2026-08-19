import { NextRequest, NextResponse } from 'next/server';
import { generateStructuredJSON } from '@/lib/ai/llm';

export interface DoubtResolution {
  title: string;
  breakdown: string[];
  codeComparison: {
    antiPattern: string;
    robustSolution: string;
  };
  summary: string;
  proTip: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { doubt, topic, level, codeSnippet } = body;

    const studentDoubt = (doubt || '').trim();
    if (!studentDoubt) {
      return NextResponse.json(
        { success: false, error: 'Doubt query is required' },
        { status: 400 }
      );
    }

    const currentTopic = topic || 'Computer Science & Programming';
    const currentLevel = level || 'Beginner to Intermediate';

    const systemPrompt = `You are a world-class technical doubt diagnostic AI mentor on AURA Learn.
Your role is to diagnose the student's root misconception, provide a step-by-step mechanical explanation, compare an anti-pattern with the robust solution, and give an exam/interview golden rule.

Topic: "${currentTopic}"
Level: "${currentLevel}"
Student Doubt: "${studentDoubt}"
${codeSnippet ? `Context Code:\n\`\`\`\n${codeSnippet}\n\`\`\`` : ''}

You MUST return a valid JSON object matching this schema:
{
  "title": "Concise diagnostic identification of the root problem/misconception",
  "breakdown": [
    "Step 1: Exactly why this behavior occurs in memory or execution flow",
    "Step 2: Common mistake or anti-pattern that leads to this confusion",
    "Step 3: Concrete correct mental model to follow"
  ],
  "codeComparison": {
    "antiPattern": "code showing the incorrect/buggy approach with comment",
    "robustSolution": "code showing the idiomatic correct solution with comment"
  },
  "summary": "1 memorable Golden Rule for exams and job interviews",
  "proTip": "1 practical high-performance or defensive tip"
}
Return JSON only without markdown formatting.`;

    const userPrompt = `Diagnose and resolve this doubt in "${currentTopic}": "${studentDoubt}".`;

    const data = await generateStructuredJSON<DoubtResolution>(
      systemPrompt,
      userPrompt,
      () => generateFallbackDoubt(studentDoubt, currentTopic)
    );

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error: any) {
    console.error('Doubt diagnostic error:', error);
    const fallback = generateFallbackDoubt('Concept Inquiry', 'Programming');
    return NextResponse.json({
      success: true,
      data: fallback,
    });
  }
}

function generateFallbackDoubt(doubt: string, topic: string): DoubtResolution {
  return {
    title: `Diagnostic Analysis for: "${doubt}"`,
    breakdown: [
      `In ${topic}, variable sharing and scope binding dictate whether mutations propagate to external callers.`,
      'Re-assigning a variable creates a new binding, while mutating in-place alters the shared underlying memory buffer.',
      'Always verify whether you need shallow references, deep cloning, or pure functional transformations.'
    ],
    codeComparison: {
      antiPattern: `# Buggy approach\ndef append_to(element, target=[]):\n    target.append(element)\n    return target`,
      robustSolution: `# Robust idiomatic approach\ndef append_to(element, target=None):\n    if target is None:\n        target = []\n    target.append(element)\n    return target`
    },
    summary: 'Never use mutable default arguments in function signatures; default values evaluate once at module definition time.',
    proTip: 'Use copy.deepcopy() or immutability freeze patterns when cloning complex nested structures to prevent accidental state contamination.'
  };
}
