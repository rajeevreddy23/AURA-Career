import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobTitle, company, location, jobDescription, tone = 'Professional' } = await req.json();

    if (!resumeText || !jobTitle) {
      return NextResponse.json(
        { success: false, error: 'Resume text and target job title are required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    const prompt = `You are a world-class career strategist and expert executive resume/cover-letter writer.
Write an outstanding, highly tailored, ATS-optimized cover letter for the following job opportunity.

Job Details:
- Role Title: ${jobTitle}
- Company: ${company || 'Target Company'}
- Location: ${location || 'Remote / Not specified'}
- Job Description:
"""
${jobDescription || 'Standard requirements for ' + jobTitle}
"""

Candidate Resume / Background Context:
"""
${resumeText.slice(0, 10000)}
"""

Tone / Style: ${tone}

Formatting & Content Requirements:
1. Include professional header placeholder [Your Name, Email, Phone, Date].
2. Add a compelling opening hook explaining enthusiasm for ${company || 'the team'} and the ${jobTitle} role.
3. Highlight 2-3 specific quantifiable achievements and relevant skills from the candidate's resume that directly match the key requirements in the job description.
4. Express alignment with the company's mission and growth goals.
5. Conclude with a strong, proactive call-to-action requesting an interview.
6. Keep the length concise, impactful, and around 300-450 words.

Return ONLY the complete cover letter text with clean markdown formatting. No conversational meta-commentary before or after.`;

    if (apiKey) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const coverLetter = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (coverLetter && coverLetter.trim()) {
            return NextResponse.json({ success: true, coverLetter: coverLetter.trim() });
          }
        }
      } catch (err) {
        console.error('Gemini cover letter generation error:', err);
      }
    }

    // Fallback template if Gemini API key is missing or call fails
    const fallbackCoverLetter = generateFallbackCoverLetter(resumeText, jobTitle, company, tone);
    return NextResponse.json({ success: true, coverLetter: fallbackCoverLetter });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to generate cover letter.' },
      { status: 500 }
    );
  }
}

function generateFallbackCoverLetter(resumeText: string, jobTitle: string, company?: string, tone?: string): string {
  const companyName = company || 'your organization';
  return `[Your Full Name]
[Your Email Address] | [Your Phone Number] | [Your Location]
${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

Hiring Manager
${companyName}

RE: Application for ${jobTitle} Position

Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${companyName}. With a strong background demonstrated in my technical work, hands-on project delivery, and commitment to continuous learning, I am eager to contribute to your team's success.

Throughout my experience, I have developed expertise in software development, problem solving, and system design. My background closely aligns with the requirements of the ${jobTitle} role, particularly in delivering high-impact technical solutions, collaborating across functional teams, and maintaining code quality.

Key highlights of what I bring to ${companyName} include:
- Proven ability to write scalable, maintainable code and deliver feature requirements on schedule.
- Experience applying modern development practices, continuous integration, and user-centric design principles.
- Strong analytical skills and dedication to solving complex engineering challenges efficiently.

I admire ${companyName}'s innovation and dedication to technical excellence, and I would welcome the opportunity to bring my skills, drive, and enthusiasm to your team.

Thank you for your time and consideration. I look forward to the possibility of discussing how my experience and qualifications fit your team's needs.

Sincerely,

[Your Full Name]`;
}
