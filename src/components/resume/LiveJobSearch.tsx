'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Briefcase, MapPin, Sparkles, Filter, ExternalLink,
  CheckCircle2, XCircle, FileText, ChevronRight, RefreshCw,
  Building2, Globe, Flame, Award, Zap, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CoverLetterGenerator } from './CoverLetterGenerator';

export interface LiveJob {
  title: string;
  company: string;
  location: string;
  source: string;
  description: string;
  url: string;
  postedDate: string;
  matchScore: number;
}

const LOCATION_OPTIONS = [
  { label: 'Any / Worldwide', value: '' },
  { label: 'Remote', value: 'remote' },
  { label: 'India', value: 'India' },
  { label: 'United States', value: 'US' },
  { label: 'Europe', value: 'Europe' },
];

const PRESET_ROLES = [
  'Full Stack Developer',
  'Frontend Engineer',
  'Backend Developer',
  'Data Scientist',
  'ML Engineer',
  'DevOps Engineer',
  'Product Manager',
  'UI/UX Designer',
  'Cloud Architect'
];

const RESUME_STORAGE_KEY = 'aura_resume_analysis_cache';

export const LiveJobSearch: React.FC = () => {
  // Search parameters
  const [roleInput, setRoleInput] = useState<string>('Full Stack Developer');
  const [skillsInput, setSkillsInput] = useState<string>('React, TypeScript, Node.js, Python');
  const [selectedLocation, setSelectedLocation] = useState<string>('remote');
  const [minMatchFilter, setMinMatchFilter] = useState<number>(0);

  // Resume context
  const [resumeSyncInfo, setResumeSyncInfo] = useState<{
    atsScore?: number;
    roles?: string[];
    skills?: string[];
    rawText?: string;
  } | null>(null);

  // Job Search State
  const [jobs, setJobs] = useState<LiveJob[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchSummary, setSearchSummary] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cover Letter Modal State
  const [activeCoverLetterJob, setActiveCoverLetterJob] = useState<LiveJob | null>(null);

  // Selected Job for Drawer/Detail
  const [selectedDetailJob, setSelectedDetailJob] = useState<LiveJob | null>(null);

  // Load cached resume analysis on mount to auto-tune job search
  useEffect(() => {
    try {
      const cached = localStorage.getItem(RESUME_STORAGE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        if (data) {
          const matchedSkills = data.matched_keywords || [];
          const targetRole = data.takeaway || data.job_matches?.[0]?.title;

          setResumeSyncInfo({
            atsScore: data.ats_score,
            skills: matchedSkills,
            roles: targetRole ? [targetRole] : [],
          });

          if (matchedSkills.length > 0) {
            setSkillsInput(matchedSkills.slice(0, 8).join(', '));
          }
          if (data.job_matches?.[0]?.title) {
            setRoleInput(data.job_matches[0].title);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load resume analysis for job search:', e);
    }
  }, []);

  // Fetch Live Jobs
  const executeJobSearch = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const skillsArray = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/resume-hub/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roles: [roleInput],
          skills: skillsArray,
          location: selectedLocation,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setJobs(data.data.jobs || []);
        setSearchSummary(data.data.summary || '');
      } else {
        setErrorMsg(data.error || 'Failed to fetch live job listings.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error while fetching live jobs.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial search on mount
  useEffect(() => {
    executeJobSearch();
  }, []);

  // Filtered jobs
  const filteredJobs = jobs.filter((job) => job.matchScore >= minMatchFilter);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Resume Sync Banner */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {resumeSyncInfo && (
          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 text-primary rounded-xl shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Resume Synced from ATS Analysis</span>
                  {resumeSyncInfo.atsScore && (
                    <Badge variant="primary" className="text-[10px] py-0.5">
                      ATS Score: {resumeSyncInfo.atsScore}%
                    </Badge>
                  )}
                </p>
                <p className="text-xs text-slate-300 mt-0.5">
                  Extracted {resumeSyncInfo.skills?.length || 0} skills to automatically rank live web jobs by compatibility.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={executeJobSearch}
              disabled={isLoading}
              className="text-xs border-primary/30 hover:bg-primary/20 text-primary shrink-0 gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Re-Sync & Search</span>
            </Button>
          </div>
        )}

        {/* Search Bar & Controls */}
        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 text-primary rounded-xl">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Live AI Web Job Search</CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Aggregating live postings from Remotive, RemoteOK, Arbeitnow, Adzuna, and AI search indices.
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                Live APIs Active
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Role Query */}
              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Role / Job Title
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    placeholder="e.g. Full Stack Developer, Frontend Engineer..."
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="md:col-span-5">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Core Resume Skills (Comma separated)
                </label>
                <div className="relative">
                  <Zap className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="e.g. React, Python, AWS, Docker..."
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Location Select */}
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Location / Preference
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-primary appearance-none cursor-pointer"
                  >
                    {LOCATION_OPTIONS.map((opt) => (
                      <option key={opt.label} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800/60">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <span className="text-xs text-slate-400 font-semibold shrink-0">Preset Roles:</span>
                {PRESET_ROLES.slice(0, 4).map((r) => (
                  <button
                    key={r}
                    onClick={() => { setRoleInput(r); }}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-colors shrink-0 ${
                      roleInput === r
                        ? 'bg-primary/20 text-primary border-primary/30 font-semibold'
                        : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <Button
                onClick={executeJobSearch}
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-2.5 font-bold text-sm gap-2 shadow-lg shadow-primary/20"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Searching Web APIs...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Search Live Jobs</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Results Header & Match Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Live Job Matches</span>
            <Badge variant="primary" className="text-xs">{filteredJobs.length} Results</Badge>
          </h3>
          {searchSummary && (
            <p className="text-xs text-slate-400 mt-1">{searchSummary}</p>
          )}
        </div>

        {/* Filter by minimum match */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          <Filter className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-slate-300">Min Match:</span>
          <select
            value={minMatchFilter}
            onChange={(e) => setMinMatchFilter(Number(e.target.value))}
            className="bg-slate-800 text-xs text-slate-200 rounded-md px-2 py-1 focus:outline-none border border-slate-700"
          >
            <option value={0}>All Matches</option>
            <option value={80}>80%+ High Match</option>
            <option value={60}>60%+ Good Match</option>
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-slate-900/60 border-slate-800 p-6 space-y-4 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 bg-slate-800 rounded-xl" />
                <div className="w-16 h-6 bg-slate-800 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="w-3/4 h-5 bg-slate-800 rounded" />
                <div className="w-1/2 h-4 bg-slate-800 rounded" />
              </div>
              <div className="w-full h-12 bg-slate-800 rounded-xl" />
            </Card>
          ))}
        </div>
      )}

      {/* Job Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredJobs.map((job, idx) => {
              const isHighMatch = job.matchScore >= 80;
              return (
                <motion.div
                  key={`${job.title}-${job.company}-${idx}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex"
                >
                  <Card className="bg-slate-900 border-slate-800 hover:border-primary/40 shadow-xl flex flex-col justify-between w-full group transition-all duration-200 hover:-translate-y-1">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-base shrink-0 group-hover:scale-105 transition-transform">
                          {job.company.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">
                            {job.source}
                          </Badge>
                          <Badge
                            className={`text-xs font-bold px-2.5 py-0.5 ${
                              isHighMatch
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            }`}
                          >
                            {job.matchScore}% Match
                          </Badge>
                        </div>
                      </div>

                      <CardTitle className="text-lg font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">
                        {job.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span className="font-medium text-slate-300">{job.company}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          {job.location}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0 space-y-4 flex-1 flex flex-col justify-between">
                      <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                        {job.description}
                      </p>

                      {/* Card Actions */}
                      <div className="space-y-2 pt-2 border-t border-slate-800/80">
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveCoverLetterJob(job)}
                            className="text-xs border-slate-700 hover:bg-slate-800 text-slate-200 gap-1"
                          >
                            <FileText className="h-3.5 w-3.5 text-primary" />
                            <span>Cover Letter</span>
                          </Button>

                          <a
                            href={job.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-xl font-bold text-xs px-3 py-2 bg-primary text-white hover:bg-primary/90 transition-colors gap-1 shadow-sm"
                          >
                            <span>Apply Now</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredJobs.length === 0 && (
        <Card className="bg-slate-900 border-slate-800 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Search className="h-8 w-8" />
          </div>
          <h4 className="text-lg font-bold text-white">No Matching Jobs Found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your location preferences or broadening your search skills and job titles above.
          </p>
          <Button onClick={executeJobSearch} size="sm" variant="outline" className="border-slate-700 text-xs">
            Reset Filters & Search Again
          </Button>
        </Card>
      )}

      {/* Cover Letter Generator Modal */}
      {activeCoverLetterJob && (
        <CoverLetterGenerator
          isOpen={!!activeCoverLetterJob}
          onClose={() => setActiveCoverLetterJob(null)}
          jobTitle={activeCoverLetterJob.title}
          company={activeCoverLetterJob.company}
          location={activeCoverLetterJob.location}
          jobDescription={activeCoverLetterJob.description}
          resumeText={skillsInput}
        />
      )}
    </div>
  );
};
