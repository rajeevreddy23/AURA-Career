import { NextRequest, NextResponse } from 'next/server';

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID || '';
const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY || '';

const SOURCE_TAGS = {
  remotive: 'Remotive',
  remoteok: 'RemoteOK',
  arbeitnow: 'Arbeitnow',
  adzuna: 'Adzuna',
};

function normalizeText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function deduplicateJobs(jobs: Array<any>, seen: Set<string>, allJobs: Array<any>) {
  for (const job of jobs) {
    const title = normalizeText(job.title || job.role || job.position || job.name) || 'Position';
    const company = normalizeText(job.company || job.company_name || job.employer) || 'Unknown Company';
    const key = `${title}|${company}|${normalizeText(job.location)}`.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      allJobs.push(job);
    }
  }
}

function deriveTags(roles: string[], skills: string[]): string[] {
  const raw = [...roles, ...skills].join(' ').toLowerCase();
  const known: Record<string, string> = {
    'react': 'react',
    'reactjs': 'react',
    'react.js': 'react',
    'node': 'node',
    'node.js': 'node',
    'nodejs': 'node',
    'python': 'python',
    'javascript': 'javascript',
    'typescript': 'typescript',
    'go': 'golang',
    'golang': 'golang',
    'java': 'java',
    'rust': 'rust',
    'cpp': 'c++',
    'c++': 'c++',
    'sql': 'sql',
    'postgres': 'postgresql',
    'postgresql': 'postgresql',
    'mysql': 'mysql',
    'mongodb': 'mongodb',
    'aws': 'aws',
    'azure': 'azure',
    'gcp': 'gcp',
    'docker': 'docker',
    'kubernetes': 'kubernetes',
    'devops': 'devops',
    'frontend': 'frontend',
    'backend': 'backend',
    'fullstack': 'fullstack',
    'full-stack': 'fullstack',
    'data': 'data',
    'machine learning': 'machine-learning',
    'ai': 'ai',
    'linux': 'linux',
    'git': 'git',
    'laravel': 'laravel',
    'php': 'php',
    'ruby': 'ruby',
    'rails': 'rails',
    'graphql': 'graphql',
    'flutter': 'flutter',
    'android': 'android',
    'ios': 'ios',
    'c#': 'csharp',
    'csharp': 'csharp',
    'vue': 'vue',
    'angular': 'angular',
    'svelte': 'svelte',
    'nextjs': 'nextjs',
    'next.js': 'nextjs',
    'wordpress': 'wordpress',
    'design': 'design',
    'dev': 'dev',
  };
  const found: string[] = [];
  const allWords = raw.split(/[^a-z0-9+#.]+/);
  const has = (w: string) => raw.includes(w.toLowerCase());
  for (const key of Object.keys(known)) {
    if (has(key) && !found.includes(known[key])) found.push(known[key]);
  }
  if (found.length === 0 && allWords.length > 0) {
    // Fall back to role keywords (e.g. "engineer", "developer")
    for (const w of allWords) {
      if (['engineer', 'developer', 'software', 'analyst', 'manager', 'designer', 'scientist'].includes(w)) {
        if (!found.includes(w)) found.push(w);
        break;
      }
    }
  }
  return found.slice(0, 3);
}

const GENERIC_ROLE_WORDS = new Set([
  'developer', 'engineer', 'software', 'analyst', 'manager', 'designer', 'scientist',
  'junior', 'senior', 'lead', 'principal', 'staff', 'full', 'stack', 'frontend',
  'backend', 'architect', 'specialist', 'associate', 'director', 'head', 'intern',
  'internship', 'golang', 'ios', 'data', 'product', 'remote', 'offshore', 'onsite',
]);

function roleHeadWords(roles: string[]): string[] {
  const words = new Set<string>();
  for (const role of roles) {
    for (const w of role.toLowerCase().replace(/[^a-z0-9+#.-]+/g, ' ').split(/\s+/)) {
      if (w.length > 2 && !GENERIC_ROLE_WORDS.has(w)) words.add(w);
    }
  }
  return [...words];
}

function boundaryRegex(term: string): RegExp {
  const safe = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9+#])${safe}([^a-z0-9+#]|$)`, 'i');
}

function computeMatch(title: string, description: string, skills: string[], roles: string[]): number {
  const hay = `${title} ${description}`.toLowerCase();
  const terms: string[] = [];
  for (const s of skills) {
    const t = s.trim().toLowerCase();
    if (t.length > 1) terms.push(t);
  }
  for (const w of roleHeadWords(roles)) {
    if (!terms.includes(w)) terms.push(w);
  }
  if (terms.length === 0) return 50;

  let hits = 0;
  for (const term of terms) {
    if (term.includes(' ') ? hay.includes(term) : boundaryRegex(term).test(hay)) hits++;
  }
  let score = Math.round((hits / terms.length) * 100);

  const titleLower = title.toLowerCase();
  const titleHits = terms.filter((t) =>
    t.includes(' ') ? titleLower.includes(t) : boundaryRegex(t).test(titleLower)
  ).length;
  if (titleHits > 0) score = Math.min(99, score + 8 * titleHits);

  return score;
}

function matchesQuery(hay: string, skills: string[], roles: string[]): boolean {
  const h = hay.toLowerCase();
  for (const t of skills) {
    const term = t.trim().toLowerCase();
    if (term.length > 1 && (term.includes(' ') ? h.includes(term) : boundaryRegex(term).test(h))) return true;
  }
  for (const w of roleHeadWords(roles)) {
    if (boundaryRegex(w).test(h)) return true;
  }
  return false;
}

const TIMEOUT_MS = 10000;

function timedFetch(url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roles, skills, location } = body;

    const searchRoles = Array.isArray(roles) && roles.length > 0 ? roles.slice(0, 3) : ['Software Engineer'];
    const searchSkills = Array.isArray(skills) ? skills.slice(0, 8) : [];
    const searchLocation = location || 'remote';
    const primaryRole = searchRoles[0];
    const query = [primaryRole, ...searchSkills].slice(0, 6).join(' ');
    const tags = deriveTags(searchRoles, searchSkills);

    const allJobs: Array<{
      title: string;
      company: string;
      location: string;
      source: string;
      description: string;
      url: string;
      postedDate: string;
      matchScore: number;
    }> = [];

    const seen = new Set<string>();

    // Source 1: Remotive â€” public, no key, remote-focused
    try {
      const rokRes = await timedFetch(
        `https://remotive.com/api/remote-jobs?category=software-dev&search=${encodeURIComponent(primaryRole)}`
      );
      if (rokRes.ok) {
        const rokData = await rokRes.json();
        deduplicateJobs(
          (rokData.jobs || [])
            .filter((j: any) => {
              const hay = `${normalizeText(j.title)} ${normalizeText(j.tags?.join(' '))} ${normalizeText(j.description)}`;
              return matchesQuery(hay, searchSkills, searchRoles);
            })
            .slice(0, 12)
            .map((j: any) => {
              const title = normalizeText(j.title) || 'Remote Developer Role';
              const fullDescription = normalizeText(j.description);
              const description = fullDescription?.slice(0, 400) || 'Remote role matching your skills.';
              return {
                title,
                company: normalizeText(j.company_name) || 'Unknown Company',
                location: normalizeText(j.candidate_required_location) || 'Remote',
                source: SOURCE_TAGS.remotive,
                description,
                url: j.url || '',
                postedDate: j.publication_date ? new Date(j.publication_date).toLocaleDateString() : 'Recent',
                matchScore: computeMatch(title, fullDescription, searchSkills, searchRoles),
              };
            }),
          seen,
          allJobs
        );
      }
    } catch {
      // fall through to other sources
    }

    // Source 2: RemoteOK â€” public, no key, tag-based remote jobs
    try {
      const tagParam = tags.length > 0 ? `?tags=${tags[0]}` : '';
      const rokRes = await timedFetch(`https://remoteok.com/api${tagParam}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      if (rokRes.ok) {
        const rokData = await rokRes.json();
        const jobs = Array.isArray(rokData) && rokData.length > 1 ? rokData.slice(1) : [];
        const filtered = (jobs as any[])
          .filter((j) => {
            const hay = `${normalizeText(j.position)} ${normalizeText(j.tags?.join(' '))} ${normalizeText(j.description)}`;
            return matchesQuery(hay, searchSkills, searchRoles);
          })
          .slice(0, 12)
          .map((j: any) => {
            const title = normalizeText(j.position) || 'Remote Developer Role';
            const fullDescription = normalizeText(j.description);
            const description = fullDescription?.slice(0, 400) || 'Remote role matching your skills.';
            return {
              title,
              company: normalizeText(j.company) || 'Unknown Company',
              location: normalizeText(j.location) || 'Remote',
              source: SOURCE_TAGS.remoteok,
              description,
              url: j.apply_url || `https://remoteok.com/remote-jobs/${j.slug}`,
              postedDate: j.date ? new Date(j.date).toLocaleDateString() : 'Recent',
              matchScore: computeMatch(title, fullDescription, searchSkills, searchRoles),
            };
          });
        deduplicateJobs(filtered, seen, allJobs);
      }
    } catch {
      // fall through
    }

    // Source 3: Arbeitnow â€” public, no key, includes on-site roles in Europe
    try {
      const abRes = await timedFetch('https://www.arbeitnow.com/api/job-board-api');
      if (abRes.ok) {
        const abData = await abRes.json();
        const filtered = (abData.data || [])
          .filter((j: any) => {
            const hay = `${normalizeText(j.title)} ${normalizeText(j.tags?.join(' '))} ${normalizeText(j.description)}`;
            return matchesQuery(hay, searchSkills, searchRoles);
          })
          .slice(0, 12)
          .map((j: any) => {
            const title = normalizeText(j.title) || 'Developer Role';
            const fullDescription = normalizeText(j.description);
            const description = fullDescription?.slice(0, 400) || 'Open role matching your profile.';
            return {
              title,
              company: normalizeText(j.company_name) || 'Unknown Company',
              location: normalizeText(j.location) || searchLocation,
              source: SOURCE_TAGS.arbeitnow,
              description,
              url: j.url || '',
              postedDate: j.created_at ? new Date(j.created_at).toLocaleDateString() : 'Recent',
              matchScore: computeMatch(title, fullDescription, searchSkills, searchRoles),
            };
          });
        deduplicateJobs(filtered, seen, allJobs);
      }
    } catch {
      // fall through
    }

    // Source 4: Adzuna (only if configured)
    if (ADZUNA_APP_ID && ADZUNA_API_KEY) {
      try {
        const adzunaRes = await timedFetch(
          `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_API_KEY}&results_per_page=8&what=${encodeURIComponent(query)}&where=${encodeURIComponent(searchLocation)}&content-type=application/json`
        );
        if (adzunaRes.ok) {
          const adzunaData = await adzunaRes.json();
          deduplicateJobs(
            (adzunaData.results || []).map((j: any) => {
              const title = normalizeText(j.title) || 'Software Engineer';
              const fullDescription = normalizeText(j.description);
              const description = fullDescription?.slice(0, 400) || 'Open role matching your profile.';
              return {
                title,
                company: normalizeText(j.company?.display_name) || 'Unknown Company',
                location: normalizeText(j.location?.display_name) || searchLocation,
                source: SOURCE_TAGS.adzuna,
                description,
                url: j.redirect_url || '',
                postedDate: j.created ? new Date(j.created).toLocaleDateString() : 'Recent',
                matchScore: computeMatch(title, fullDescription, searchSkills, searchRoles),
              };
            }),
            seen,
            allJobs
          );
        }
      } catch {
        // fall through
      }
    }

    // Rank by match score, keep only the strongest results
    const ranked = allJobs
      .sort((a, b) => b.matchScore - a.matchScore)
      .filter((j, i, arr) => j.matchScore > 0 || arr.length < 8)
      .slice(0, 20);

    return NextResponse.json({
      success: true,
      data: {
        jobs: ranked,
        summary: `Found ${ranked.length} live openings matching your profile from ${new Set(ranked.map((j) => j.source)).size} sources. Top matches are ranked by how well they fit your skills.`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch jobs.' },
      { status: 500 }
    );
  }
}

