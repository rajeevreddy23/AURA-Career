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
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-3 py-1 text-sm font-semibold">Excellent</Badge>;
    } else if (verdict === 'Good') {
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-3 py-1 text-sm font-semibold">Good</Badge>;
    } else {
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 px-3 py-1 text-sm font-semibold">Needs Work</Badge>;
    }
  };

  // Render Score Circular Gauge
  const renderCircularGauge = (score: number) => {
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    const strokeColor = score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : '#f59e0b';

    return (
      <div className="relative flex items-center justify-center w-36 h-36">
        <svg className="transform -rotate-90 w-36 h-36">
          <circle cx="72" cy="72" r={radius} stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-800" />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            cx="72" cy="72" r={radius}
            stroke={strokeColor}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold text-white tracking-tight">{score}</span>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Out of 100</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* ERROR ALERT */}
      {errorMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 flex items-start gap-3">
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
          <Card className="bg-slate-900/90 border-slate-800 shadow-xl overflow-hidden backdrop-blur">
            <CardHeader className="border-b border-slate-800/60 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">AI Resume Analyzer</CardTitle>
                  <CardDescription className="text-slate-400">
                    Scan your resume against real ATS criteria, uncover missing keywords, and get tailored recommendations.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* PDF Dropzone */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-200">
                  1. Upload Resume (PDF) <span className="text-red-400">*</span>
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                    isDragOver
                      ? 'border-primary bg-primary/10'
                      : selectedFile
                      ? 'border-emerald-500/50 bg-emerald-950/10'
                      : 'border-slate-700 bg-slate-800/40 hover:border-slate-500 hover:bg-slate-800/70'
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
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-full">
                        <FileText className="h-8 w-8" />
                      </div>
                      <p className="font-semibold text-emerald-400 text-lg">{selectedFile.name}</p>
                      <p className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB — Click or drag to replace</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 text-primary">
                        <UploadCloud className="h-10 w-10" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200 text-lg">
                          Drag and drop your PDF resume here, or <span className="text-primary underline">browse</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Supports standard text-based PDF format</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Job Context */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-200">
                    Target Job Role <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-primary text-sm"
                  >
                    <option value="">Select or type a role...</option>
                    {PRESET_ROLES.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-200">
                    Paste Target Job Description <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    value={targetJobDescription}
                    onChange={(e) => setTargetJobDescription(e.target.value)}
                    placeholder="Paste job posting text to perform targeted keyword matching..."
                    rows={3}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary text-sm resize-none"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 flex justify-end">
                <Button
                  onClick={runAnalysis}
                  disabled={isAnalyzing || !selectedFile}
                  size="lg"
                  className="w-full sm:w-auto px-8 py-6 rounded-xl font-bold text-base shadow-lg shadow-primary/25"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center gap-3">
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>{loadingStep}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      <span>Analyze Resume with AI</span>
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ANALYZING LOADING MODAL / OVERLAY */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full text-center space-y-6 shadow-2xl">
            <div className="relative flex items-center justify-center w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
              <div className="p-4 bg-primary/10 text-primary rounded-full border border-primary/30">
                <Sparkles className="h-10 w-10 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">AI Scanning in Progress</h3>
              <p className="text-sm text-primary font-medium animate-pulse">{loadingStep}</p>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full animate-pulse w-3/4" />
            </div>
            <p className="text-xs text-slate-400">This usually takes under 10 seconds.</p>
          </motion.div>
        </div>
      )}

      {/* RESULTS DISPLAY UI */}
      {analysis && !isAnalyzing && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
                {getVerdictBadge(analysis.ats_verdict)}
              </div>
              <p className="text-sm text-slate-400">
                {selectedFile ? `File: ${selectedFile.name}` : 'Resume evaluation complete'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {onNavigateToJobs && (
                <Button onClick={onNavigateToJobs} className="gap-2 font-bold shadow-lg shadow-primary/20">
                  <Briefcase className="h-4 w-4" />
                  <span>Search Live Jobs</span>
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
            <Card className="lg:col-span-5 bg-slate-900 border-slate-800 shadow-xl flex flex-col justify-between">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-300 flex items-center justify-between">
                  <span>Overall ATS Score</span>
                  <Award className="h-5 w-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2 flex flex-col items-center text-center space-y-4">
                {renderCircularGauge(analysis.ats_score)}
                <div>
                  <p className="text-xl font-bold text-white mb-1">Verdict: {analysis.ats_verdict}</p>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                    {analysis.takeaway || 'Your resume has strong foundations and can be further optimized for top recruiter matches.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Score Breakdown (Horizontal Progress Bars) */}
            <Card className="lg:col-span-7 bg-slate-900 border-slate-800 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-300 flex items-center justify-between">
                  <span>Detailed Score Breakdown</span>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Format & Structure', value: analysis.score_breakdown.format_structure, icon: Layers },
                  { label: 'Content Relevance', value: analysis.score_breakdown.content_relevance, icon: FileText },
                  { label: 'Keyword Matching', value: analysis.score_breakdown.keyword_matching, icon: Search },
                  { label: 'Skills Coverage', value: analysis.score_breakdown.skills, icon: CheckCircle2 },
                  { label: 'Experience Impact', value: analysis.score_breakdown.experience, icon: Briefcase }
                ].map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <item.icon className="h-3.5 w-3.5 text-primary" />
                        {item.label}
                      </span>
                      <span className="text-slate-200">{item.value} / 100</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          item.value >= 80 ? 'bg-emerald-500' : item.value >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Section 2: 4 Summary Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-slate-900 border-slate-800 p-4 flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{analysis.matched_keywords.length}</p>
                <p className="text-xs text-slate-400 font-medium">Matched Keywords</p>
              </div>
            </Card>

            <Card className="bg-slate-900 border-slate-800 p-4 flex items-center gap-4">
              <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
                <XCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{analysis.missing_keywords.length}</p>
                <p className="text-xs text-slate-400 font-medium">Missing Keywords</p>
              </div>
            </Card>

            <Card className="bg-slate-900 border-slate-800 p-4 flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{analysis.improvement_tips.length}</p>
                <p className="text-xs text-slate-400 font-medium">Actionable Tips</p>
              </div>
            </Card>

            <Card className="bg-slate-900 border-slate-800 p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{analysis.job_matches.length}</p>
                <p className="text-xs text-slate-400 font-medium">Job Matches</p>
              </div>
            </Card>
          </div>

          {/* Section 3: Keyword Match Panel */}
          <Card className="bg-slate-900 border-slate-800 shadow-xl">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-200">Keyword Match Analysis</CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    ATS scanners parse resumes for exact skill keywords. Review matched vs missing terms.
                  </CardDescription>
                </div>
                {/* Legend */}
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Matched
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Partial
                  </span>
                  <span className="flex items-center gap-1.5 text-red-400">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Missing
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {/* Keyword Chips */}
              <div className="flex flex-wrap gap-2">
                {analysis.matched_keywords.map((kw) => (
                  <Badge key={kw} className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 px-3 py-1 text-xs">
                    ✓ {kw}
                  </Badge>
                ))}

                {analysis.partially_matched_keywords?.map((kw) => (
                  <Badge key={kw} className="bg-amber-500/15 text-amber-300 border-amber-500/30 px-3 py-1 text-xs">
                    ~ {kw}
                  </Badge>
                ))}

                {analysis.missing_keywords.map((kw) => (
                  <Badge key={kw} className="bg-red-500/15 text-red-300 border-red-500/30 px-3 py-1 text-xs">
                    + {kw}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Improvement Suggestions Panel */}
          <Card className="bg-slate-900 border-slate-800 shadow-xl">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <CardTitle className="text-lg font-semibold text-slate-200 flex items-center justify-between">
                <span>Tailored Improvement Suggestions</span>
                <Sparkles className="h-5 w-5 text-amber-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.improvement_tips.map((tip, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-3.5">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0 mt-0.5">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm text-slate-100">{tip.title}</h4>
                      {tip.section && (
                        <Badge variant="outline" className="text-[10px] border-slate-600 text-slate-400 uppercase">
                          {tip.section}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{tip.detail}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Section 5: Top Job Recommendations */}
          <Card className="bg-slate-900 border-slate-800 shadow-xl">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <CardTitle className="text-lg font-semibold text-slate-200 flex items-center justify-between">
                <span>Top Job Matches</span>
                <Briefcase className="h-5 w-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
                {analysis.job_matches.map((job, idx) => (
                  <div key={idx} className="min-w-[260px] max-w-[280px] p-4 rounded-xl bg-slate-800/70 border border-slate-700/80 space-y-3 shrink-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm">
                          {job.company.substring(0, 2).toUpperCase()}
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs font-semibold">
                          {job.match_pct}% Match
                        </Badge>
                      </div>
                      <h4 className="font-bold text-slate-100 text-sm line-clamp-1">{job.title}</h4>
                      <p className="text-xs text-slate-400">{job.company} • {job.location}</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full text-xs border-slate-700 hover:bg-slate-700 text-slate-200 justify-between">
                      <span>View Role</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
