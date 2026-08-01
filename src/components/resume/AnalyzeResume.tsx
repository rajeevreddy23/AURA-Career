'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';
import {
  Upload,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Briefcase,
  ExternalLink,
  TrendingUp,
  UserCheck,
  Star,
  Target,
  ArrowUp,
  Sparkles,
  MapPin,
  Building2,
  CalendarDays,
  RefreshCw,
} from 'lucide-react';

interface ResumeAnalysis {
  skills: string[];
  experienceLevel: string;
  suggestedRoles: string[];
  summary: string;
  strengths: string[];
  improvements: string[];
  searchKeywords: string[];
}

interface Job {
  title: string;
  company: string;
  location: string;
  source: string;
  description: string;
  url: string;
  postedDate: string;
}

export const AnalyzeResume: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [rawText, setRawText] = useState('');
  const [isFetchingJobs, setIsFetchingJobs] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  }, []);

  const extractTextFromPDF = useCallback(async (file: File): Promise<string> => {
    const pdfjsLib: any = await import('pdfjs-dist/build/pdf.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    const buffer = await file.arrayBuffer();
    const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
    let text = '';
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(' ') + '\n';
    }
    return text.trim();
  }, []);

  const extractTextFromDOCX = useCallback(async (file: File): Promise<string> => {
    const mammoth = await import('mammoth');
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value.trim();
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    setJobs([]);

    try {
      let text = '';
      const name = file.name.toLowerCase();

      if (name.endsWith('.pdf')) {
        text = await extractTextFromPDF(file);
      } else if (name.endsWith('.docx')) {
        text = await extractTextFromDOCX(file);
      } else {
        text = await file.text();
      }

      if (!text.trim()) {
        throw new Error('No text content found in the file.');
      }

      const res = await fetch('/api/resume-hub/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysis(data.data.analysis);
      setRawText(data.data.rawText);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [file, extractTextFromPDF, extractTextFromDOCX]);

  const handleFetchJobs = useCallback(async () => {
    if (!analysis) return;
    setIsFetchingJobs(true);

    try {
      const res = await fetch('/api/resume-hub/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roles: analysis.suggestedRoles,
          skills: analysis.searchKeywords,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setJobs(data.data.jobs);
      }
    } catch {
      // silent fail for jobs
    } finally {
      setIsFetchingJobs(false);
    }
  }, [analysis]);

  const resetAnalysis = useCallback(() => {
    setFile(null);
    setAnalysis(null);
    setError(null);
    setJobs([]);
    setRawText('');
  }, []);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'entry': return 'bg-green-500/10 text-green-500';
      case 'mid': return 'bg-yellow-500/10 text-yellow-500';
      case 'senior': return 'bg-orange-500/10 text-orange-500';
      case 'lead': return 'bg-purple-500/10 text-purple-500';
      default: return 'bg-primary/10 text-primary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      {!analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-dashed border-2 border-primary/20">
            <CardContent className="py-12">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className="flex flex-col items-center justify-center text-center"
              >
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Upload Your Resume</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md">
                  Drag and drop your resume here, or click to browse. Supports PDF and DOCX formats.
                </p>

                <label className="cursor-pointer">
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium">
                    <Upload className="h-4 w-4" />
                    {file ? file.name : 'Choose File'}
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>

                {file && (
                  <div className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleAnalyze}
                      isLoading={isAnalyzing}
                      className="ml-auto"
                    >
                      {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 animate-pulse">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Analyzing Your Resume</h3>
          <p className="text-sm text-muted-foreground">
            Extracting text and analyzing with AI...
          </p>
          <Progress value={80} animated className="max-w-xs mt-6" />
        </motion.div>
      )}

      {/* Error State */}
      {error && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="bordered" className="border-red-500/30">
            <CardContent className="flex flex-col items-center py-10 text-center">
              <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
                <AlertCircle className="h-7 w-7 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Analysis Failed</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md">{error}</p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={resetAnalysis}>
                  Try Again
                </Button>
                <Button variant="primary" onClick={handleAnalyze}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Analysis Results Dashboard */}
      {analysis && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="success" size="md">
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                Analysis Complete
              </Badge>
              <Button variant="ghost" size="sm" onClick={resetAnalysis}>
                <Upload className="h-4 w-4 mr-1" />
                New Analysis
              </Button>
            </div>
          </div>

          {/* Profile Summary Card */}
          <Card>
            <CardContent className="py-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center shrink-0">
                  <UserCheck className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">Professional Summary</h3>
                    <Badge className={cn('capitalize', getLevelColor(analysis.experienceLevel))}>
                      {analysis.experienceLevel} Level
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{analysis.summary}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="flex items-center gap-4 py-4">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analysis.skills.length}</p>
                  <p className="text-xs text-muted-foreground">Skills Detected</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 py-4">
                <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analysis.strengths.length}</p>
                  <p className="text-xs text-muted-foreground">Strengths</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 py-4">
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <ArrowUp className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analysis.improvements.length}</p>
                  <p className="text-xs text-muted-foreground">Improvements</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 py-4">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analysis.suggestedRoles.length}</p>
                  <p className="text-xs text-muted-foreground">Suggested Roles</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Star className="h-4 w-4 text-primary" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.skills.map((skill) => (
                    <Badge key={skill} variant="default" size="sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Suggested Roles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-4 w-4 text-primary" />
                  Suggested Roles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.suggestedRoles.map((role, i) => (
                  <div
                    key={role}
                    className="flex items-center gap-3 p-3 rounded-lg bg-accent/50"
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Briefcase className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{role}</p>
                      <p className="text-xs text-muted-foreground">
                        Match: {80 - i * 15}%
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Strengths vs Improvements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-green-500 mb-2 flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Strengths
                  </h4>
                  <ul className="space-y-1">
                    {analysis.strengths.map((s) => (
                      <li key={s} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-orange-500 mb-2 flex items-center gap-1">
                    <ArrowUp className="h-3.5 w-3.5" />
                    Improvements
                  </h4>
                  <ul className="space-y-1">
                    {analysis.improvements.map((s) => (
                      <li key={s} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-orange-500 mt-0.5">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Job Listings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase className="h-4 w-4 text-primary" />
                Matching Job Listings
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFetchJobs}
                isLoading={isFetchingJobs}
              >
                {isFetchingJobs ? (
                  'Fetching...'
                ) : jobs.length > 0 ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 mr-1" />
                    Refresh
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    Find Jobs
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {isFetchingJobs ? (
                <div className="flex flex-col items-center py-10">
                  <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                  <p className="text-sm text-muted-foreground">Searching for matching jobs...</p>
                </div>
              ) : jobs.length > 0 ? (
                <div className="grid gap-3">
                  {jobs.map((job, i) => (
                    <motion.div
                      key={`${job.title}-${job.company}-${i}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card hover className="cursor-pointer">
                        <CardContent className="py-4">
                          <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Building2 className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h4 className="font-medium">{job.title}</h4>
                                  <p className="text-sm text-muted-foreground">{job.company}</p>
                                </div>
                                <Badge variant="outline" size="sm">{job.source}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {job.description}
                              </p>
                              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {job.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <CalendarDays className="h-3 w-3" />
                                  {job.postedDate}
                                </span>
                              </div>
                            </div>
                            {job.url && job.url !== '#' && (
                              <a
                                href={job.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button size="sm" variant="outline">
                                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                  Apply
                                </Button>
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-10 text-center">
                  <Briefcase className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Click "Find Jobs" to see matching positions based on your skills and suggested roles.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};