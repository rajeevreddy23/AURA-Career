import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { doubt, topic, codeSnippet } = body;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

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
      // Fall through to Gemini API
    }

    const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (API_KEY) {
      const prompt = `You are a technical doubt-resolution AI mentor on AURA Learn.
Topic: ${topic || 'Coding & Tech'}
Student's Doubt/Question: ${doubt || JSON.stringify(body)}
${codeSnippet ? `Code Snippet:\n\`\`\`\n${codeSnippet}\n\`\`\`` : ''}

Analyze the doubt carefully and provide:
1. Direct answer/explanation
2. Corrected code or solution if applicable
3. Key takeaways to remember

Format with clean markdown.`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.5, maxOutputTokens: 2048 }
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return NextResponse.json({ success: true, resolution: text, response: text, data: { resolution: text } });
        }
      }
    }

    return NextResponse.json({
      success: true,
      resolution: `Resolution for doubt: ${doubt || 'query'}. Ensure Gemini API access for live resolution.`
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to resolve doubt' },
      { status: 500 }
    );
  }
}
