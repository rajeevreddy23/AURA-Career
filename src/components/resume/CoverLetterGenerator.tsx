'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Copy, Check, Download, RefreshCw, X, FileText, Send, Building2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';

interface CoverLetterGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  company: string;
  location?: string;
  jobDescription?: string;
  resumeText?: string;
}

export const CoverLetterGenerator: React.FC<CoverLetterGeneratorProps> = ({
  isOpen,
  onClose,
  jobTitle,
  company,
  location = 'Remote',
  jobDescription = '',
  resumeText = '',
}) => {
  const [tone, setTone] = useState<'Professional' | 'Enthusiastic' | 'Executive' | 'Creative'>('Professional');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateLetter = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/resume-hub/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle,
          company,
          location,
          jobDescription,
          resumeText,
          tone,
        }),
      });

      const data = await res.json();
      if (data.success && data.coverLetter) {
        setCoverLetter(data.coverLetter);
      } else {
        setError(data.error || 'Failed to generate cover letter');
      }
    } catch (err: any) {
      setError(err.message || 'Network error while generating cover letter.');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (isOpen && !coverLetter && jobTitle) {
      generateLetter();
    }
  }, [isOpen, jobTitle]);

  const handleCopy = () => {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!coverLetter) return;
    const blob = new Blob([coverLetter], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cover_Letter_${company.replace(/[^a-zA-Z0-9]/g, '_')}_${jobTitle.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900/95 border border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 backdrop-blur-2xl"
      >
        {/* Neon accent line */}
        <div className="h-1 w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500" />

        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-start justify-between bg-slate-950/50">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-2xl shadow-inner">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  AI Cover Letter Generator
                </span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  {tone} Tone
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                {jobTitle} <span className="text-slate-400 font-normal">at</span> {company}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Tone selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Select Voice Tone:</span>
            <div className="flex flex-wrap gap-1.5">
              {(['Professional', 'Enthusiastic', 'Executive', 'Creative'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-3 py-1 text-xs rounded-xl font-medium transition-all cursor-pointer ${
                    tone === t
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20 font-bold'
                      : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700/50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              onClick={generateLetter}
              disabled={isGenerating}
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 flex items-center gap-1.5 ml-auto shrink-0 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-purple-400 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-sm">
              {error}
            </div>
          )}

          {isGenerating ? (
            <div className="py-16 text-center space-y-4">
              <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 animate-ping" />
                <Sparkles className="h-8 w-8 text-purple-400 animate-pulse" />
              </div>
              <div>
                <p className="text-base font-semibold text-white">Drafting Tailored Cover Letter...</p>
                <p className="text-xs text-slate-400 mt-1">Analyzing skills alignment with {company}'s requirements.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={15}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-slate-200 text-sm font-sans leading-relaxed focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none shadow-inner transition-all"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/70 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <FileText className="h-4 w-4 text-purple-400" />
            <span>Fully editable - adapt before submitting your application.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              disabled={!coverLetter || isGenerating}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 hover:bg-slate-800 text-slate-200 flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={!coverLetter || isGenerating}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/25 transition-all disabled:opacity-40 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Download .txt</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
