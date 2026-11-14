import { NextRequest, NextResponse } from 'next/server';
import { getTeacher } from '@/lib/ai/teachers';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (typeof body.text !== 'string' || !body.text.trim() || body.text.length > 4500) return NextResponse.json({ error: 'Provide between 1 and 4500 characters.' }, { status: 400 });
    const key = process.env.GOOGLE_TTS_API_KEY;
    if (!key) return NextResponse.json({ fallback: 'browser' }, { status: 503 });
    const teacher = getTeacher(body.teacherId);
    const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: { text: body.text }, voice: { name: teacher.voice, languageCode: teacher.voice.split('-').slice(0, 2).join('-') }, audioConfig: { audioEncoding: 'MP3', speakingRate: Math.max(0.5, Math.min(1.75, Number(body.speed) || 1)) } }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return NextResponse.json({ fallback: 'browser' }, { status: 503 });
    const data = await res.json(); return NextResponse.json({ audio: data.audioContent, teacher: teacher.name });
  } catch { return NextResponse.json({ fallback: 'browser' }, { status: 503 }); }
}
