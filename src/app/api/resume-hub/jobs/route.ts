import { NextRequest, NextResponse } from 'next/server';

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID || '';
const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY || '';

function normalizeText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function deduplicateJobs(jobs: Array<any>, seen: Set<string>, allJobs: Array<any>) {
  for (const job of jobs) {
    const title = normalizeText(job.title || job.role || job.position || job.name) || 'Position';
    const company = normalizeText(job.company || job.company_name || job.employer) || 'Unknown Company';
    const key = `${title}|${company}`.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      allJobs.push(job);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roles, skills, location } = body;

    const searchRoles = Array.isArray(roles) ? roles.slice(0, 3) : ['Software Engineer'];
    const searchSkills = Array.isArray(skills) ? skills.slice(0, 5) : [];
    const searchLocation = location || 'remote';
    const query = [...searchRoles, ...searchSkills].slice(0, 6).join(' ');

    const allJobs: Array<{
      title: string;
      company: string;
      location: string;
      source: string;
      description: string;
      url: string;
      postedDate: string;
    }> = [];

    const seen = new Set<string>();

    // Source 1: GitHub Jobs (public, no key)
    try {
      const githubUrl = `https://jobs.github.com/positions.json?search=${encodeURIComponent(query)}&location=${encodeURIComponent(searchLocation)}`;
      const githubRes = await fetch(githubUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (githubRes.ok) {
        const githubData = await githubRes.json();
        deduplicateJobs(
          (githubData || []).slice(0, 8).map((j: any) => ({
            title: normalizeText(j.title) || 'Software Engineer',
            company: normalizeText(j.company) || 'Unknown Company',
            location: normalizeText(j.location) || searchLocation,
            source: 'GitHub Jobs',
            description: normalizeText(j.description)?.slice(0, 280) || 'Open role matching your profile.',
            url: j.url || '',
            postedDate: j.created_at ? new Date(j.created_at).toLocaleDateString() : 'Recent',
          })),
          seen,
          allJobs
        );
      }
    } catch {
      // fall through to other sources
    }

    // Source 2: Adzuna (if configured)
    if (ADZUNA_APP_ID && ADZUNA_API_KEY) {
      try {
        const adzunaRes = await fetch(
          `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_API_KEY}&results_per_page=8&what=${encodeURIComponent(query)}&where=${encodeURIComponent(searchLocation)}&content-type=application/json`
        );
        if (adzunaRes.ok) {
          const adzunaData = await adzunaRes.json();
          deduplicateJobs(
            (adzunaData.results || []).map((j: any) => ({
              title: normalizeText(j.title) || 'Software Engineer',
              company: normalizeText(j.company?.display_name) || 'Unknown Company',
              location: normalizeText(j.location?.display_name) || searchLocation,
              source: 'Adzuna',
              description: normalizeText(j.description)?.slice(0, 280) || 'Open role matching your profile.',
              url: j.redirect_url || '',
              postedDate: j.created ? new Date(j.created).toLocaleDateString() : 'Recent',
            })),
            seen,
            allJobs
          );
        }
      } catch {
        // fall through
      }
    }

    // Source 3: Remotive (public, remote-focused)
    try {
      const rokQuery = searchRoles[0]?.toLowerCase().replace(/\s+/g, '-') || 'software-engineer';
      const rokRes = await fetch(`https://remotive.com/api/remote-jobs?category=software-dev&search=${encodeURIComponent(rokQuery)}`);
      if (rokRes.ok) {
        const rokData = await rokRes.json();
        deduplicateJobs(
          (rokData.jobs || []).slice(0, 8).map((j: any) => ({
            title: normalizeText(j.title) || 'Remote Developer Role',
            company: normalizeText(j.company_name) || 'Unknown Company',
            location: normalizeText(j.candidate_required_location) || 'Remote',
            source: 'Remotive',
            description: normalizeText(j.description)?.slice(0, 280) || 'Remote role matching your skills.',
            url: j.url || '',
            postedDate: j.publication_date ? new Date(j.publication_date).toLocaleDateString() : 'Recent',
          })),
          seen,
          allJobs
        );
      }
    } catch {
      // fall through
    }

    // Source 4: Working Nomads (public jobs feed)
    try {
      const workingNomadsRes = await fetch('https://www.workingnomads.com/api/exposed-jobs', { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (workingNomadsRes.ok) {
        const workingNomadsData = await workingNomadsRes.json();
        deduplicateJobs(
          (workingNomadsData || []).slice(0, 8).map((j: any) => ({
            title: normalizeText(j.title || j.position || j.role) || 'Remote Role',
            company: normalizeText(j.company_name || j.company || j.employer) || 'Unknown Company',
            location: normalizeText(j.location || j.city || searchLocation) || searchLocation,
            source: 'Working Nomads',
            description: normalizeText(j.description || j.snippet)?.slice(0, 280) || 'Remote-friendly role matching your background.',
            url: j.url || j.apply_url || j.link || '',
            postedDate: j.date ? new Date(j.date).toLocaleDateString() : 'Recent',
          })),
          seen,
          allJobs
        );
      }
    } catch {
      // fall through
    }

    if (allJobs.length === 0) {
      const fallbackRoles = searchRoles.length > 0 ? searchRoles : ['Software Engineer'];
      for (const role of fallbackRoles) {
        allJobs.push({
          title: role,
          company: 'Open Opportunities',
          location: searchLocation,
          source: 'Search',
          description: `Search for ${role} openings on major job boards and apply directly.`,
          url: `https://www.google.com/search?q=${encodeURIComponent(`${role} jobs`)}`,
          postedDate: 'Now',
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: { jobs: allJobs.slice(0, 20) },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch jobs.' },
      { status: 500 }
    );
  }
}
