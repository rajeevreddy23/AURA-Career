import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message, resumeText, history } = await req.json();
    
    const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    const systemPrompt = `You are an expert career coach and resume advisor on the AURA Learn platform. You have analyzed the user's resume and are now having a conversation about it. Be specific, actionable, and encouraging. Reference specific parts of their resume when giving advice. Use markdown formatting for clarity.\n\nUser's Resume:\n${resumeText}`;
    
    const contents = [
      ...(history || []),
      { role: 'user', parts: [{ text: message }] }
    ];
    
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
        }),
      }
    );
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I had trouble generating a response.';
    return NextResponse.json({ success: true, response: text });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Chat failed' }, { status: 500 });
  }
}
