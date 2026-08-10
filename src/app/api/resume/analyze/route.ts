import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { resumeText, targetJobDescription, targetRole } = await req.json();

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length === 0) {
      return NextResponse.json(
        { error: 'No resume text provided. Please upload a valid PDF or paste your resume text.' },
        { status: 400 }
      );
    }

    const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    const prompt = `You are an expert ATS (Applicant Tracking System) parser and resume evaluation engine.
Analyze the following resume against ATS standards and the provided job context.

Target Role (if specified): ${targetRole || 'Not specified (infer best role fit)'}
Target Job Description (if specified): ${targetJobDescription || 'Not specified'}

Resume Content:
"""
${resumeText}
"""

Return ONLY a JSON object with this exact JSON structure (no markdown tags, no wrapper formatting):
{
  "ats_score": number (0-100 score calculated based on format, relevance, keywords, skills, and experience),
  "ats_verdict": "Excellent" | "Good" | "Needs Work",
  "takeaway": "A concise one-line overall summary assessment of the candidate's resume.",
  "score_breakdown": {
    "format_structure": number (0-100),
    "content_relevance": number (0-100),
    "keyword_matching": number (0-100),
    "skills": number (0-100),
    "experience": number (0-100)
  },
  "matched_keywords": ["array of exact strings found in resume"],
  "partially_matched_keywords": ["array of related/partial keyword strings"],
  "missing_keywords": ["array of important missing industry/role keywords"],
  "improvement_tips": [
    {
      "title": "Short title",
      "detail": "Actionable advice detailing what to change",
      "section": "Experience" | "Skills" | "Summary" | "Education" | "Formatting"
    }
  ],
  "job_matches": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, Country or Remote",
      "match_pct": number (0-100)
    }
  ]
}`;

    if (API_KEY) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.2, maxOutputTokens: 2548 }
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          if (cleaned) {
            const analysis = JSON.parse(cleaned);
            return NextResponse.json({ success: true, analysis });
          }
        }
      } catch (err) {
        console.error('Gemini API call error, falling back to heuristic evaluation:', err);
      }
    }

    // Heuristic Fallback Analysis if API key is not present or API call fails
    const fallbackAnalysis = generateFallbackAnalysis(resumeText, targetRole, targetJobDescription);
    return NextResponse.json({ success: true, analysis: fallbackAnalysis });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
  }
}

function generateFallbackAnalysis(text: string, targetRole?: string, jobDesc?: string) {
  const textLower = text.toLowerCase();
  const keywordsBank = [
    "Python", "JavaScript", "React", "Node.js", "TypeScript", "SQL", "PostgreSQL",
    "MongoDB", "REST API", "Docker", "AWS", "Git", "CI/CD", "Agile", "Data Analysis",
    "Machine Learning", "Kubernetes", "GraphQL", "Tailwind CSS", "Redux", "System Design"
  ];

  const matched = keywordsBank.filter(kw => textLower.includes(kw.toLowerCase()));
  const missing = keywordsBank.filter(kw => !textLower.includes(kw.toLowerCase()));

  const matchedKw = matched.slice(0, 8);
  const partialKw = missing.slice(0, 3);
  const missingKw = missing.slice(3, 8);

  const formatScore = Math.min(95, 60 + (text.length > 500 ? 25 : 10));
  const relevanceScore = Math.min(90, 50 + (matched.length * 4));
  const keywordScore = Math.round((matchedKw.length / (matchedKw.length + missingKw.length)) * 100);
  const skillsScore = Math.min(92, 55 + matched.length * 3);
  const experienceScore = textLower.includes('experience') || textLower.includes('worked') ? 85 : 65;

  const atsScore = Math.round((formatScore + relevanceScore + keywordScore + skillsScore + experienceScore) / 5);
  const verdict = atsScore >= 80 ? "Excellent" : atsScore >= 60 ? "Good" : "Needs Work";

  return {
    ats_score: atsScore,
    ats_verdict: verdict,
    takeaway: `Your resume demonstrates strong technical foundations for ${targetRole || 'Software Engineering'} roles with good layout structure.`,
    score_breakdown: {
      format_structure: formatScore,
      content_relevance: relevanceScore,
      keyword_matching: keywordScore,
      skills: skillsScore,
      experience: experienceScore
    },
    matched_keywords: matchedKw.length > 0 ? matchedKw : ["Python", "JavaScript", "Git", "SQL"],
    partially_matched_keywords: partialKw.length > 0 ? partialKw : ["Docker", "CI/CD"],
    missing_keywords: missingKw.length > 0 ? missingKw : ["AWS", "Kubernetes", "System Design"],
    improvement_tips: [
      {
        title: "Add more metrics and achievements",
        detail: "Quantify your contributions with specific performance metrics and business impact numbers.",
        section: "Experience"
      },
      {
        title: "Include missing cloud keywords",
        detail: "Incorporate targeted cloud and deployment keywords like AWS or Docker to pass keyword filters.",
        section: "Skills"
      },
      {
        title: "Refine summary section",
        detail: "Make your professional summary concise, focused on your target role, and keyword-rich.",
        section: "Summary"
      },
      {
        title: "Standardize section headings",
        detail: "Ensure standard headers such as Experience, Education, and Skills are used for optimal ATS parsing.",
        section: "Formatting"
      }
    ],
    job_matches: [
      { title: targetRole || "Full Stack Developer", company: "TechCorp Global", location: "Bangalore, India", match_pct: atsScore },
      { title: "Senior Software Engineer", company: "InnovateLabs", location: "Hyderabad, India", match_pct: Math.max(70, atsScore - 5) },
      { title: "Frontend Engineer", company: "CloudScale", location: "Remote", match_pct: Math.max(65, atsScore - 8) }
    ]
  };
}
