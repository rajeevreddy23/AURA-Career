import { NextRequest, NextResponse } from 'next/server';

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
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (backendUrl && backendUrl !== 'http://localhost:8000') {
      try {
        const res = await fetch(`${backendUrl}/api/v1/agents/doubt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        }
      } catch {
        // Fall through to LLMs
      }
    }

    const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (API_KEY) {
      const prompt = `You are a world-class technical doubt diagnostic AI mentor on AURA Learn.
Topic: "${topic || 'Coding & Tech'}"
Level: "${level || 'Beginner to Intermediate'}"
Student's Doubt: "${doubt || ''}"
${codeSnippet ? `Code Snippet:\n\`\`\`\n${codeSnippet}\n\`\`\`` : ''}

Output a valid JSON object matching this schema:
{
  "title": "Concise diagnostic identification of the root problem/misconception",
  "breakdown": [
    "Step 1: Exactly why this behavior occurs in memory or execution flow",
    "Step 2: Common mistake or anti-pattern that leads to this confusion",
    "Step 3: Concrete correct mental model to follow"
  ],
  "codeComparison": {
    "antiPattern": "code showing the incorrect/buggy approach",
    "robustSolution": "code showing the idiomatic correct solution"
  },
  "summary": "1 memorable Golden Rule for exams and job interviews",
  "proTip": "1 practical high-performance or defensive tip"
}`;

      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.5,
                maxOutputTokens: 2048,
                responseMimeType: 'application/json',
              },
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            let clean = rawText.trim();
            if (clean.startsWith('```json')) clean = clean.slice(7);
            if (clean.startsWith('```')) clean = clean.slice(3);
            if (clean.endsWith('```')) clean = clean.slice(0, -3);
            const parsed = JSON.parse(clean.trim());
            return NextResponse.json({
              success: true,
              data: parsed,
            });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini doubt error:', geminiErr);
      }
    }

    // Intelligent Fallback
    const fallback: DoubtResolution = {
      title: `Diagnostic Analysis for: "${doubt || 'Concept Inquiry'}"`,
      breakdown: [
        `Under ${topic || 'Python'}, memory referencing and object mutability dictate variable sharing and runtime binding.`,
        'Re-assigning vs mutating in-place determines whether callers observe state alterations across scopes.',
        'Always verify whether you need a shallow reference or an isolated copy.'
      ],
      codeComparison: {
        antiPattern: `# Buggy approach\ndef append_to(element, target=[]):\n    target.append(element)\n    return target`,
        robustSolution: `# Robust idiomatic approach\ndef append_to(element, target=None):\n    if target is None:\n        target = []\n    target.append(element)\n    return target`
      },
      summary: 'Never use mutable default arguments in function signatures; defaults evaluate only once at function definition time.',
      proTip: 'Use copy.deepcopy() or dict comprehensions when cloning complex nested structures to prevent accidental state mutation.'
    };

    return NextResponse.json({
      success: true,
      data: fallback,
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to resolve doubt' },
      { status: 500 }
    );
  }
}

