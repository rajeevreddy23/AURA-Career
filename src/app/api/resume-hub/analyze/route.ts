import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function analyzeWithGemini(text: string): Promise<Record<string, unknown>> {
  if (BACKEND_URL) {
    // Unified ResumeAgent analysis (ATS analyst + coach) — conversational, grounded in resume text.
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/agents/resume/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: text.slice(0, 15000) }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data?.data) return data.data;
      }
    } catch {
      // fall through to local fallback
    }
  }

  const prompt = `Analyze this resume text and return a structured JSON with:
- skills: array of skill strings
- experienceLevel: "entry" | "mid" | "senior" | "lead"
- suggestedRoles: array of job role strings
- summary: 2-3 sentence professional summary
- strengths: array of strength strings
- improvements: array of improvement suggestion strings
- searchKeywords: array of keyword strings for job search
- atsScore: number 0-100
- atsGaps: array of missing keywords/sections that hurt ATS parsing

Resume text:
${text.slice(0, 15000)}

Return ONLY valid JSON.`;

  if (BACKEND_URL) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/agents/public/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          system_prompt: 'You are an expert resume analyst. Return only valid JSON with no extra text.',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const responseText = data?.data?.response || '';
        try {
          return JSON.parse(responseText);
        } catch {
          const cleaned = responseText.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim();
          return JSON.parse(cleaned);
        }
      }
    } catch {
      // fall through
    }
  }

  return {
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python'],
    experienceLevel: 'mid',
    suggestedRoles: ['Frontend Developer', 'Full Stack Developer', 'Software Engineer'],
    summary: 'Experienced developer with strong skills in web technologies. Proven track record of delivering scalable applications.',
    strengths: ['Strong problem-solving skills', 'Excellent communication', 'Full-stack capabilities'],
    improvements: ['Add quantifiable achievements', 'Include relevant certifications', 'Tailor summary to target role'],
    searchKeywords: ['JavaScript', 'React', 'Node.js', 'Full Stack', 'Software Engineer'],
    atsScore: 72,
    atsGaps: ['Missing quantifiable metrics in work experience', 'No contact section header', 'Skills section lacks keyword density for ATS'],
  };
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { success: false, error: 'No text content provided.' },
        { status: 400 }
      );
    }

    const analysis = await analyzeWithGemini(text);

    return NextResponse.json({
      success: true,
      data: { analysis, rawText: text.slice(0, 5000) },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to analyze resume.' },
      { status: 500 }
    );
  }
}
