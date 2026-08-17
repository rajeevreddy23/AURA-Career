import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, teacherId, topic, context } = body;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    try {
      const res = await fetch(`${backendUrl}/api/v1/agents/ask-professor`, {
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
      const prompt = `You are AI Professor, an expert academic tutor on the AURA Learn platform.
Teacher Style: ${teacherId || 'friendly, clear, and highly educational'}
Topic: ${topic || 'Computer Science / Engineering'}
Context: ${context || 'Student learning session'}

Student Question: ${question || JSON.stringify(body)}

Provide a clear, engaging, step-by-step academic answer using Markdown.`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return NextResponse.json({ success: true, answer: text, response: text, data: { answer: text } });
        }
      }
    }

    return NextResponse.json({
      success: true,
      answer: `Here is guidance regarding ${question || 'your query'}. Ensure Gemini API access for full dynamic responses.`
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to ask professor' },
      { status: 500 }
    );
  }
}
