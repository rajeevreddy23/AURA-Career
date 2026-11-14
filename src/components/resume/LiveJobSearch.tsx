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
          <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-purple-950/40 border border-cyan-500/30 text-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl shadow-lg shadow-cyan-950/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 rounded-xl shrink-0 shadow-inner">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  <p className="text-sm font-bold text-white">
                    Resume Intelligence Connected
                  </p>
                  {resumeSyncInfo.atsScore && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ATS: {resumeSyncInfo.atsScore}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Synchronized {resumeSyncInfo.skills?.length || 0} candidate skills to automatically rank live opportunities by compatibility.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={executeJobSearch}
              disabled={isLoading}
              className="text-xs border-cyan-500/40 hover:bg-cyan-500/20 text-cyan-300 shrink-0 gap-1.5 rounded-xl transition-all"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Re-Sync & Search</span>
            </Button>
          </div>
        )}

        {/* Search Bar & Controls */}
        <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl shadow-cyan-950/20 overflow-hidden">
          {/* Neon accent top bar */}
          <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500" />

          <div className="p-6 border-b border-slate-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl shrink-0">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    Live AI Career Matcher
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Querying Remotive, RemoteOK, Arbeitnow, Adzuna & live web indices in real-time.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live APIs Online
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Role Query */}
              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Target Role / Job Title
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    placeholder="e.g. Full Stack Developer, Frontend Engineer..."
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="md:col-span-5">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Key Skills (Comma separated)
                </label>
                <div className="relative">
                  <Zap className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="e.g. React, Python, AWS, Docker..."
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Location Select */}
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Location Preference
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-8 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 cursor-pointer appearance-none transition-all"
                  >
                    {LOCATION_OPTIONS.map((opt) => (
                      <option key={opt.label} value={opt.value} className="bg-slate-900 text-slate-100">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Action & Preset Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-800/80">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <span className="text-xs text-slate-400 font-semibold shrink-0">Popular:</span>
                {PRESET_ROLES.slice(0, 4).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleInput(r)}
                    className={`px-3 py-1 text-xs rounded-xl border transition-all shrink-0 font-medium cursor-pointer ${
                      roleInput === r
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                        : 'bg-slate-800/50 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <button
                onClick={executeJobSearch}
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Searching Web Boards...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Search Live Jobs</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-200 text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Results Header & Match Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
            <span>Discovered Opportunities</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              {filteredJobs.length} Results
            </span>
          </h3>
          {searchSummary && (
            <p className="text-xs text-slate-400 mt-1">{searchSummary}</p>
          )}
        </div>

        {/* Filter by minimum match */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-xl backdrop-blur-md">
          <Filter className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-300">Min Match:</span>
          <select
            value={minMatchFilter}
            onChange={(e) => setMinMatchFilter(Number(e.target.value))}
            className="bg-slate-950 text-xs text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none border border-slate-700 cursor-pointer"
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
            <div key={i} className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-slate-800 rounded-xl" />
                <div className="w-20 h-6 bg-slate-800 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="w-3/4 h-5 bg-slate-800 rounded" />
                <div className="w-1/2 h-4 bg-slate-800 rounded" />
              </div>
              <div className="w-full h-16 bg-slate-800/60 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Job Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredJobs.map((job, idx) => {
              const isHighMatch = job.matchScore >= 80;
              const isMediumMatch = job.matchScore >= 60 && job.matchScore < 80;

              return (
                <motion.div
                  key={`${job.title}-${job.company}-${idx}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex"
                >
                  <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/90 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 flex flex-col justify-between w-full group transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <div className="p-5 pb-3">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 border border-cyan-500/20 flex items-center justify-center font-bold text-cyan-400 text-base shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                          {job.company.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md border border-slate-800 bg-slate-950 text-slate-400">
                            {job.source}
                          </span>
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                              isHighMatch
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : isMediumMatch
                                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isHighMatch ? 'bg-emerald-400' : isMediumMatch ? 'bg-cyan-400' : 'bg-amber-400'
                              }`}
                            />
                            {job.matchScore}% Match
                          </span>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-cyan-300 transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span className="font-semibold text-slate-300">{job.company}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          {job.location}
                        </span>
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-0 space-y-4 flex-1 flex flex-col justify-between">
                      <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                        {job.description}
                      </p>

                      {/* Card Actions */}
                      <div className="space-y-2 pt-2 border-t border-slate-800/80">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setActiveCoverLetterJob(job)}
                            className="inline-flex items-center justify-center rounded-xl font-semibold text-xs px-3 py-2 border border-slate-700 bg-slate-800/60 hover:bg-slate-800 hover:border-slate-600 text-slate-200 transition-all gap-1.5 cursor-pointer"
                          >
                            <FileText className="h-3.5 w-3.5 text-cyan-400" />
                            <span>AI Letter</span>
                          </button>

                          <a
                            href={job.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-xl font-bold text-xs px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transition-all gap-1 shadow-md shadow-cyan-500/20"
                          >
                            <span>Apply</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredJobs.length === 0 && (
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-12 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400">
            <Search className="h-8 w-8" />
          </div>
          <h4 className="text-lg font-bold text-white">No Matching Jobs Found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try lowering the minimum match filter, changing your location, or broadening your target role.
          </p>
          <Button onClick={executeJobSearch} size="sm" variant="outline" className="border-slate-700 text-xs">
            Reset Filters & Search Again
          </Button>
        </div>
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
