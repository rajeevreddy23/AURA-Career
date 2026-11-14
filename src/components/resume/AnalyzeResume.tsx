'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud, FileText, CheckCircle2, XCircle, AlertCircle,
  Sparkles, Briefcase, Award, TrendingUp, Layers, Check, RefreshCw,
  Search, ExternalLink, ChevronRight, HelpCircle, ArrowRight, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { extractTextFromPdf } from '@/lib/pdfParser';

// --- Data Types ---
export interface ScoreBreakdown {
  format_structure: number;
  content_relevance: number;
  keyword_matching: number;
  skills: number;
  experience: number;
}

export interface ImprovementTip {
  title: string;
  detail: string;
  section?: string;
}

export interface JobMatch {
  title: string;
  company: string;
  location: string;
  match_pct: number;
}

export interface AnalysisData {
  ats_score: number;
  ats_verdict: 'Excellent' | 'Good' | 'Needs Work' | string;
  takeaway?: string;
  score_breakdown: ScoreBreakdown;
  matched_keywords: string[];
  partially_matched_keywords?: string[];
  missing_keywords: string[];
  improvement_tips: ImprovementTip[];
  job_matches: JobMatch[];
}

const STORAGE_KEY = 'aura_resume_analysis_cache';

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

export interface AnalyzeResumeProps {
  onNavigateToJobs?: () => void;
}

export const AnalyzeResume: React.FC<AnalyzeResumeProps> = ({ onNavigateToJobs }) => {
  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>('');
  const [targetJobDescription, setTargetJobDescription] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('Scanning document...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [keywordFilter, setKeywordFilter] = useState<'all' | 'matched' | 'partial' | 'missing'>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load cached analysis on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        setAnalysis(JSON.parse(cached));
      }
    } catch (e) {
      console.error('Failed to load cached analysis:', e);
    }
  }, []);

  // Save analysis to cache when updated
  const saveToCache = (data: AnalysisData) => {
    setAnalysis(data);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save analysis to cache:', e);
    }
  };

  const clearCache = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAnalysis(null);
    setSelectedFile(null);
    setExtractedText('');
    setErrorMsg(null);
  };

  // Handle File Selection
  const handleFileChange = async (file: File | undefined) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setErrorMsg('Please upload a PDF file (.pdf).');
      return;
    }
    setErrorMsg(null);
    setSelectedFile(file);

    try {
      setLoadingStep('Extracting text from PDF...');
      const text = await extractTextFromPdf(file);
      if (!text || text.trim().length < 50) {
        setErrorMsg('Could not extract readable text from PDF. It may be scanned or image-only. Please try another PDF or paste text directly.');
      } else {
        setExtractedText(text);
      }
    } catch (err: any) {
      console.error('Parsing error:', err);
      setErrorMsg(err.message || 'Failed to parse PDF file. Please ensure it is a valid text-based PDF.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFileChange(file);
  };

  // Start AI Analysis Flow
  const runAnalysis = async () => {
    if (!extractedText.trim()) {
      setErrorMsg('Please upload a valid readable PDF resume first.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);

    const steps = [
      'Scanning PDF Structure...',
      'Evaluating ATS Formatting & Sections...',
      'Comparing against Target Job Keywords...',
      'Running AI Skill & Experience Evaluation...',
      'Generating Custom Actionable Report...'
    ];

    let currentStepIndex = 0;
    const interval = setInterval(() => {
      currentStepIndex = (currentStepIndex + 1) % steps.length;
      setLoadingStep(steps[currentStepIndex]);
    }, 2000);

    try {
      const res = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: extractedText,
          targetRole,
          targetJobDescription
        })
      });

      const data = await res.json();
      clearInterval(interval);

      if (data.success && data.analysis) {
        saveToCache(data.analysis);
      } else {
        setErrorMsg(data.error || 'Failed to analyze resume. Please try again.');
      }
    } catch (err: any) {
      clearInterval(interval);
      setErrorMsg(err.message || 'Connection error. Please check your network and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Verdict Styling Helpers
  const getVerdictBadge = (verdict: string) => {
    if (verdict === 'Excellent') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-950/40">
          <CheckCircle2 className="h-3.5 w-3.5" /> Excellent Match
        </span>
      );
    } else if (verdict === 'Good') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-950/40">
          <CheckCircle2 className="h-3.5 w-3.5" /> Strong Potential
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-950/40">
          <AlertCircle className="h-3.5 w-3.5" /> Needs Optimization
        </span>
      );
    }
  };

  // Render Score Circular Gauge with Glow
  const renderCircularGauge = (score: number) => {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    const strokeColor = score >= 80 ? '#10b981' : score >= 60 ? '#38bdf8' : '#f59e0b';
    const glowColor = score >= 80 ? 'rgba(16, 185, 129, 0.25)' : score >= 60 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(245, 158, 11, 0.25)';

    return (
      <div className="relative flex items-center justify-center w-40 h-40">
        <div
          className="absolute inset-2 rounded-full blur-xl pointer-events-none"
          style={{ backgroundColor: glowColor }}
        />
        <svg className="transform -rotate-90 w-40 h-40 relative z-10">
          <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-800/80" />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            cx="80" cy="80" r={radius}
            stroke={strokeColor}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center z-20">
          <span className="text-4xl font-extrabold text-white tracking-tight">{score}</span>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ATS Score</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* ERROR ALERT */}
      {errorMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 flex items-start gap-3 shadow-lg">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">{errorMsg}</div>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-200">
            <XCircle className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      {/* NO RESULTS STATE: UPLOAD FORM */}
      {!analysis && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl mx-auto">
          {/* Main Upload Card */}
          <div className="relative group rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80 mb-6">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-inner">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">AI ATS Resume Evaluator</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    Extracts formatting, computes keyword density, and scores against modern recruiter algorithms.
                  </p>
                </div>
              </div>
              <span className="self-start sm:self-center px-3 py-1 rounded-full text-xs font-mono font-medium bg-slate-800/80 border border-slate-700 text-slate-300">
                PDF Format Supported
              </span>
            </div>

            <div className="space-y-6">
              {/* PDF Dropzone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Step 1 • Upload Resume (PDF) <span className="text-purple-400">*</span>
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-300 ${
                    isDragOver
                      ? 'border-purple-500 bg-purple-950/20 shadow-xl shadow-purple-950/40'
                      : selectedFile
                      ? 'border-emerald-500/60 bg-emerald-950/15 shadow-lg shadow-emerald-950/30'
                      : 'border-slate-700/80 bg-slate-950/50 hover:border-purple-500/50 hover:bg-slate-900/80'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,application/pdf"
                    onChange={(e) => handleFileChange(e.target.files?.[0])}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3.5 bg-emerald-500/20 text-emerald-300 rounded-2xl border border-emerald-500/30 shadow-md">
                        <FileText className="h-8 w-8" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-base sm:text-lg">{selectedFile.name}</p>
                        <p className="text-xs text-emerald-400 font-mono mt-0.5">
                          {(selectedFile.size / 1024).toFixed(1)} KB • Ready for AI Parsing
                        </p>
                      </div>
                      <span className="text-xs text-slate-400 hover:text-slate-200 underline mt-1">Click to replace file</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-purple-400 shadow-inner group-hover:scale-105 transition-transform">
                        <UploadCloud className="h-9 w-9" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200 text-base sm:text-lg">
                          Drag and drop your PDF resume here, or <span className="text-purple-400 underline font-bold">browse</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Standard single or multi-page text-based PDF documents</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Job Context */}
              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Step 2 • Target Role <span className="text-slate-500 font-normal lowercase">(optional)</span>
                    </label>
                    <span className="text-[11px] text-purple-400 font-medium">Quick Presets</span>
                  </div>

                  {/* Preset Quick Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {PRESET_ROLES.slice(0, 6).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setTargetRole(role)}
                        className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                          targetRole === role
                            ? 'bg-purple-600/30 text-purple-200 border-purple-500/50 font-semibold shadow-sm'
                            : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="Or type a custom role (e.g. Senior Frontend Architect)..."
                    className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Target Job Description <span className="text-slate-500 font-normal lowercase">(optional for exact keyword diff)</span>
                  </label>
                  <textarea
                    value={targetJobDescription}
                    onChange={(e) => setTargetJobDescription(e.target.value)}
                    placeholder="Paste job posting text here to perform exact ATS keyword gap matching..."
                    rows={3}
                    className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm resize-none shadow-inner"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 flex justify-end">
                <Button
                  onClick={runAnalysis}
                  disabled={isAnalyzing || !selectedFile}
                  size="lg"
                  className="w-full sm:w-auto px-8 py-6 rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:opacity-95 shadow-xl shadow-purple-600/25 transition-all"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center gap-3">
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>{loadingStep}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-amber-300" />
                      <span>Run AI ATS Evaluation</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ANALYZING LOADING MODAL / OVERLAY */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-purple-500/20 blur-2xl rounded-full" />
            <div className="relative flex items-center justify-center w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-purple-500/30 animate-ping" />
              <div className="p-4 bg-purple-500/15 text-purple-400 rounded-2xl border border-purple-500/30 shadow-lg">
                <Sparkles className="h-10 w-10 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1.5">AI ATS Analysis In Progress</h3>
              <p className="text-sm text-purple-400 font-medium animate-pulse">{loadingStep}</p>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden shadow-inner">
              <div className="bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 h-full rounded-full animate-pulse w-3/4" />
            </div>
            <p className="text-xs text-slate-400">Deep AI multi-tier evaluation takes only 4 to 8 seconds.</p>
          </motion.div>
        </div>
      )}

      {/* RESULTS DISPLAY UI */}
      {analysis && !isAnalyzing && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-xl">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <h2 className="text-2xl font-extrabold text-white">ATS Evaluation Report</h2>
                {getVerdictBadge(analysis.ats_verdict)}
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                {selectedFile ? `Scanned document: ${selectedFile.name}` : 'Cached resume analysis loaded'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {onNavigateToJobs && (
                <Button onClick={onNavigateToJobs} className="gap-2 font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 shadow-lg shadow-purple-600/25">
                  <Briefcase className="h-4 w-4" />
                  <span>Search Matching Jobs</span>
                </Button>
              )}
              <Button onClick={clearCache} variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-200 gap-2">
                <RefreshCw className="h-4 w-4" />
                <span>Upload New Resume</span>
              </Button>
            </div>
          </div>

          {/* Section 1: ATS Score Card & Score Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ATS Score Card */}
            <div className="lg:col-span-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl p-6 flex flex-col justify-between items-center text-center backdrop-blur-xl">
              <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800/80">
                <span className="text-sm font-bold text-slate-300">Composite ATS Score</span>
                <Award className="h-5 w-5 text-purple-400" />
              </div>

              <div className="py-4">
                {renderCircularGauge(analysis.ats_score)}
              </div>

              <div className="w-full space-y-2 pt-2 border-t border-slate-800/80">
                <p className="text-lg font-bold text-white">Assessment: {analysis.ats_verdict}</p>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                  {analysis.takeaway || 'Your resume demonstrates clean structure and is ready for automated recruiter matching.'}
                </p>
              </div>
            </div>

            {/* Score Breakdown (Horizontal Progress Bars) */}
            <div className="lg:col-span-7 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                  <span>Category Breakdown Metrics</span>
                </h3>
                <span className="text-xs font-mono text-slate-400">Target: 80+ for Top Tier</span>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Format & Layout Structure', value: analysis.score_breakdown.format_structure, icon: Layers },
                  { label: 'Content Depth & Relevance', value: analysis.score_breakdown.content_relevance, icon: FileText },
                  { label: 'Keyword Density & Match', value: analysis.score_breakdown.keyword_matching, icon: Search },
                  { label: 'Technical Skills Alignment', value: analysis.score_breakdown.skills, icon: CheckCircle2 },
                  { label: 'Measurable Experience Impact', value: analysis.score_breakdown.experience, icon: Briefcase }
                ].map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-2 text-slate-300">
                        <item.icon className="h-3.5 w-3.5 text-purple-400" />
                        {item.label}
                      </span>
                      <span className="font-mono text-slate-200">{item.value}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800/80">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          item.value >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : item.value >= 60 ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: 4 Summary Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 flex items-center gap-3.5 shadow-lg">
              <div className="p-3 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/20">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white">{analysis.matched_keywords.length}</p>
                <p className="text-xs text-slate-400 font-medium">Matched Skills</p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 flex items-center gap-3.5 shadow-lg">
              <div className="p-3 bg-red-500/15 text-red-400 rounded-xl border border-red-500/20">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white">{analysis.missing_keywords.length}</p>
                <p className="text-xs text-slate-400 font-medium">Missing Keywords</p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 flex items-center gap-3.5 shadow-lg">
              <div className="p-3 bg-amber-500/15 text-amber-400 rounded-xl border border-amber-500/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white">{analysis.improvement_tips.length}</p>
                <p className="text-xs text-slate-400 font-medium">Action Items</p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 flex items-center gap-3.5 shadow-lg">
              <div className="p-3 bg-cyan-500/15 text-cyan-400 rounded-xl border border-cyan-500/20">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white">{analysis.job_matches.length}</p>
                <p className="text-xs text-slate-400 font-medium">Live Matches</p>
              </div>
            </div>
          </div>

          {/* Section 3: Keyword Match Panel with Filter Tabs */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl p-6 backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
              <div>
                <h3 className="text-base font-bold text-white">Keyword Match Analysis</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ATS parsers filter candidate profiles by exact keyword matches. Review terms below.
                </p>
              </div>

              {/* Interactive Keyword Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  onClick={() => setKeywordFilter('all')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                    keywordFilter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setKeywordFilter('matched')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors flex items-center gap-1 ${
                    keywordFilter === 'matched' ? 'bg-emerald-500/20 text-emerald-300 shadow-sm' : 'text-slate-400 hover:text-emerald-300'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Matched ({analysis.matched_keywords.length})
                </button>
                <button
                  onClick={() => setKeywordFilter('partial')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors flex items-center gap-1 ${
                    keywordFilter === 'partial' ? 'bg-amber-500/20 text-amber-300 shadow-sm' : 'text-slate-400 hover:text-amber-300'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  Partial ({analysis.partially_matched_keywords?.length || 0})
                </button>
                <button
                  onClick={() => setKeywordFilter('missing')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors flex items-center gap-1 ${
                    keywordFilter === 'missing' ? 'bg-red-500/20 text-red-300 shadow-sm' : 'text-slate-400 hover:text-red-300'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                  Missing ({analysis.missing_keywords.length})
                </button>
              </div>
            </div>

            {/* Keyword Badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              {(keywordFilter === 'all' || keywordFilter === 'matched') &&
                analysis.matched_keywords.map((kw) => (
                  <span key={kw} className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <Check className="h-3 w-3" /> {kw}
                  </span>
                ))}

              {(keywordFilter === 'all' || keywordFilter === 'partial') &&
                analysis.partially_matched_keywords?.map((kw) => (
                  <span key={kw} className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    ~ {kw}
                  </span>
                ))}

              {(keywordFilter === 'all' || keywordFilter === 'missing') &&
                analysis.missing_keywords.map((kw) => (
                  <span key={kw} className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold bg-red-500/15 text-red-300 border border-red-500/30">
                    + {kw}
                  </span>
                ))}
            </div>
          </div>

          {/* Section 4: Improvement Suggestions Panel */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>Actionable Improvement Recommendations</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">{analysis.improvement_tips.length} Tips Generated</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {analysis.improvement_tips.map((tip, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 flex items-start gap-3.5 hover:border-slate-700 transition-colors">
                  <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl shrink-0 mt-0.5 border border-amber-500/20">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-sm text-slate-100">{tip.title}</h4>
                      {tip.section && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md uppercase font-mono font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                          {tip.section}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{tip.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Top Job Recommendations */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-cyan-400" />
                <span>Top Matching Live Job Roles</span>
              </h3>
              {onNavigateToJobs && (
                <button
                  onClick={onNavigateToJobs}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                >
                  <span>View All In Job Matcher</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
              {analysis.job_matches.map((job, idx) => (
                <div key={idx} className="min-w-[270px] max-w-[290px] p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-3 shrink-0 flex flex-col justify-between hover:border-cyan-500/40 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-bold text-purple-400 text-sm">
                        {job.company.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {job.match_pct}% Match
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-100 text-sm line-clamp-1">{job.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{job.company} • {job.location}</p>
                  </div>
                  {onNavigateToJobs && (
                    <Button
                      onClick={onNavigateToJobs}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs border-slate-700/80 hover:bg-slate-800 text-slate-200 justify-between rounded-xl"
                    >
                      <span>Explore Matches</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
