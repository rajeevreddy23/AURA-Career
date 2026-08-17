import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, targetAudience, depth } = body;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    try {
      const res = await fetch(`${backendUrl}/api/v1/agents/generate-lesson`, {
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
      const prompt = `You are a master curriculum designer for AURA Learn.
Generate a structured, interactive lesson module for:
Topic: ${topic || 'Web Development'}
Audience: ${targetAudience || 'Beginner to Intermediate'}
Depth Level: ${depth || 'Comprehensive'}

Return a Markdown formatted lesson with:
- # Lesson Title
- ## Learning Objectives
- ## Key Concepts
- ## Code Examples / Hands-on Activity
- ## Quiz / Knowledge Check`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 3000 }
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return NextResponse.json({ success: true, lesson: text, content: text, data: { lesson: text } });
        }
      }
    }

    return NextResponse.json({
      success: true,
      lesson: `# Lesson: ${topic || 'Custom Module'}\n\nKey educational concepts for ${topic}.`
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to generate lesson' },
      { status: 500 }
    );
  }
}
