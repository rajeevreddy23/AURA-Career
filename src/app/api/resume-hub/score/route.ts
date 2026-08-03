import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'you', 'your', 'our', 'their', 'this', 'that', 'are', 'was', 'were',
  'have', 'has', 'had', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must', 'not',
  'but', 'from', 'into', 'onto', 'about', 'over', 'under', 'than', 'then', 'them', 'they', 'there',
  'here', 'where', 'when', 'what', 'which', 'who', 'whom', 'why', 'how', 'all', 'any', 'both',
  'each', 'few', 'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same', 'so', 'too',
  'very', 'just', 'also', 'thus', 'hence', 'during', 'before', 'after', 'above', 'below', 'between',
  'among', 'through', 'within', 'without', 'job', 'jobs', 'position', 'role', 'roles', 'work',
  'experience', 'years', 'year', 'company', 'team', 'ability', 'skills', 'including', 'including',
  'etc', 'via', 'per', 'well', 'new', 'using', 'use', 'used', 'based', 'need', 'must', 'one',
  'two', 'will', 'set', 'get', 'make', 'also', 'can', 'may', 'across', 'along', 'within',
  'a', 'an', 'of', 'in', 'on', 'at', 'to', 'as', 'is', 'it', 'be', 'been', 'being', 'do', 'does',
  'did', 'by', 'we', 'they', 'he', 'she', 'it', 'we', 'you', 'i', 'me', 'my', 'its', 'his', 'her',
  'looking', 'strong', 'seek', 'seeking', 'hiring', 'required', 'requirements', 'candidate',
  'candidates', 'applicants', 'apply', 'application', 'qualifications', 'responsibilities',
  'description', 'about', 'join', 'ideal', 'must', 'preferred', 'plus', 'nice', 'great', 'good',
  'best', 'top', 'high', 'highly', 'detail', 'details', 'include', 'includes', 'including', 'etc',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#./-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/[#.]$/, ''))
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));
}

function scoreLocally(resumeText: string, jobDescription: string) {
  const resumeTokens = new Set(tokenize(resumeText));
  const jdTokens = tokenize(jobDescription);

  // Track multi-token phrases first ("machine learning" beats two singles)
  const phraseHits: string[] = [];
  const singleMisses: string[] = [];

  // Multi-word keyword detection (up to 3 words) from the job description
  const jdLower = jobDescription.toLowerCase();
  const words = jdLower.replace(/[^a-z0-9+#./-]/g, ' ').split(/\s+/).filter(Boolean).map((w) => w.replace(/[#.]$/, ''));

  const matched = new Set<string>();
  const missing = new Set<string>();

  const isContentWord = (w: string) => w.length > 2 && !STOP_WORDS.has(w);

  for (let len = 3; len >= 2; len--) {
    for (let i = 0; i <= words.length - len; i++) {
      const phrase = words.slice(i, i + len).join(' ');
      const tokens = words.slice(i, i + len);
      if (!tokens.every(isContentWord)) continue;
      if (matched.has(phrase) || missing.has(phrase)) continue;
      const safePhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp(safePhrase, 'i').test(resumeText)) {
        matched.add(phrase);
      } else if (new RegExp(safePhrase, 'i').test(jdLower)) {
        missing.add(phrase);
      }
    }
  }

  // Drop sub-phrases already covered by a longer phrase in the same set
  const pruneContained = (set: Set<string>) => {
    for (const p of [...set]) {
      const longer = [...set].some((q) => q !== p && q.includes(p));
      if (longer) set.delete(p);
    }
  };
  pruneContained(matched);
  pruneContained(missing);

  // Single keywords: prioritize the ones that appear the most in the JD
  const jdFreq = new Map<string, number>();
  for (const token of jdTokens) jdFreq.set(token, (jdFreq.get(token) || 0) + 1);
  const jdRanked = [...jdFreq.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);

  for (const token of jdRanked) {
    if (matched.size + missing.size >= 40) break;
    if (matched.has(token) || missing.has(token)) continue;
    if (resumeTokens.has(token)) matched.add(token);
    else missing.add(token);
  }

  const total = matched.size + missing.size;
  const matchScore = total === 0 ? 0 : Math.round((matched.size / total) * 100);

  const tailoringSuggestions: string[] = [];
  const missingArr = [...missing];
  if (missingArr.length > 0) {
    const top = missingArr.slice(0, 6);
    tailoringSuggestions.push(
      `Add missing keywords to your resume: ${top.join(', ')} — mirror the exact phrasing used in the job description.`
    );
    tailoringSuggestions.push(
      `Reframe your experience bullets to lead with ${top[0] || 'the role\u2019s core requirements'} where you have relevant proof.`
    );
  } else {
    tailoringSuggestions.push('Your resume already covers the key terms in this job description. Make sure achievements are quantified to stand out.');
  }
  tailoringSuggestions.push('Customize the professional summary to echo the role title and top 3 requirements verbatim.');

  return {
    matchScore,
    matchedKeywords: [...matched].slice(0, 25),
    missingKeywords: missingArr.slice(0, 25),
    tailoringSuggestions,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { resume_text, job_description } = await request.json();

    if (!resume_text?.trim() || !job_description?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Both resume_text and job_description are required.' },
        { status: 400 }
      );
    }

    // Try the backend ATS agent first (authenticated environments only).
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/agents/resume/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_text: resume_text.slice(0, 15000),
          job_description: job_description.slice(0, 15000),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data?.data) {
          return NextResponse.json({ success: true, data: data.data });
        }
      }
    } catch {
      // fall through to local scoring
    }

    const result = scoreLocally(resume_text, job_description);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to score resume.' },
      { status: 500 }
    );
  }
}
