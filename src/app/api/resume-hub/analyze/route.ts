import { NextRequest, NextResponse } from 'next/server';
import { generateStructuredJSON } from '@/lib/ai/llm';

interface ResumeAnalysisResult {
  skills: string[];
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
  suggestedRoles: string[];
  summary: string;
  strengths: string[];
  improvements: string[];
  searchKeywords: string[];
  atsScore: number;
  atsGaps: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { success: false, error: 'No resume text content provided.' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert ATS resume analyst and principal career coach.
Thoroughly analyze the student's raw resume text and return a strictly grounded, accurate evaluation.

You MUST return a JSON object with this exact schema:
{
  "skills": ["Array of detected technical and soft skills (at least 6-12)"],
  "experienceLevel": "entry" | "mid" | "senior" | "lead",
  "suggestedRoles": ["Top 3-5 job roles the candidate is best qualified for"],
  "summary": "2-3 sentence executive summary accurately highlighting the candidate's core background and value proposition",
  "strengths": ["3-5 concrete strengths grounded directly in their projects/work"],
  "improvements": ["3-5 high-impact, actionable resume recommendations (metrics, impact verbs, structure)"],
  "searchKeywords": ["5-8 optimized search keywords for tech job searches"],
  "atsScore": number from 40 to 95 reflecting keyword density, formatting clarity, and quantified impact,
  "atsGaps": ["2-4 specific missing sections, metrics, or technical keywords that could improve ATS ranking"]
}

Return ONLY valid JSON without markdown fences.`;

    const userPrompt = `Resume text to analyze:\n${text.slice(0, 12000)}`;

    const fallbackAnalysis = (): ResumeAnalysisResult => {
      // Basic heuristic keyword extraction if offline
      const lowercase = text.toLowerCase();
      const detectedSkills: string[] = [];
      const keywords = [
        'Python', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js',
        'SQL', 'PostgreSQL', 'AWS', 'Docker', 'Git', 'Machine Learning',
        'Java', 'C++', 'Tailwind', 'REST APIs', 'GraphQL'
      ];
      keywords.forEach((k) => {
        if (lowercase.includes(k.toLowerCase())) detectedSkills.push(k);
      });

      return {
        skills: detectedSkills.length > 0 ? detectedSkills : ['Software Engineering', 'Problem Solving', 'Data Structures'],
        experienceLevel: lowercase.includes('senior') || lowercase.includes('lead') ? 'senior' : 'mid',
        suggestedRoles: ['Software Engineer', 'Full-Stack Developer', 'Frontend Engineer'],
        summary: 'Technical professional with verified software development and applied engineering background.',
        strengths: ['Demonstrated problem solving abilities', 'Full-stack engineering proficiency', 'Modern framework experience'],
        improvements: ['Include more quantified business impact metrics (e.g. % improvements, user counts)', 'Add explicit technical certifications', 'Optimize header keyword hierarchy for ATS'],
        searchKeywords: detectedSkills.length > 0 ? detectedSkills.slice(0, 5) : ['Software Engineer', 'Developer'],
        atsScore: 78,
        atsGaps: ['Add quantifiable business metrics to project descriptions', 'Standardize skill category headings'],
      };
    };

    const analysis = await generateStructuredJSON<ResumeAnalysisResult>(
      systemPrompt,
      userPrompt,
      fallbackAnalysis
    );

    return NextResponse.json({
      success: true,
      data: { analysis, rawText: text.slice(0, 5000) },
    });
  } catch (error: any) {
    console.error('Resume analysis error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to analyze resume.' },
      { status: 500 }
    );
  }
}
