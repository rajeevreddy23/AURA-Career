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
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="primary" className="text-xs font-semibold">AI Cover Letter Generator</Badge>
                <Badge variant="outline" className="text-xs">{tone}</Badge>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                {jobTitle} <span className="text-slate-400 font-normal">at</span> {company}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          {/* Tone selector */}
          <div className="flex items-center justify-between gap-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
            <span className="text-xs font-semibold text-slate-300">Select Tone:</span>
            <div className="flex flex-wrap gap-1.5">
              {(['Professional', 'Enthusiastic', 'Executive', 'Creative'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                    tone === t
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={generateLetter}
              disabled={isGenerating}
              className="text-xs border-slate-700 hover:bg-slate-700 text-slate-200 gap-1.5 ml-auto shrink-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </Button>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-sm">
              {error}
            </div>
          )}

          {isGenerating ? (
            <div className="py-16 text-center space-y-4">
              <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <div>
                <p className="text-base font-semibold text-white">Crafting Tailored Cover Letter...</p>
                <p className="text-xs text-slate-400 mt-1">Analyzing skills alignment with {company}'s requirements.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={16}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-slate-200 text-sm font-sans leading-relaxed focus:outline-none focus:border-primary resize-none shadow-inner"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-primary" />
            <span>Ready to edit or copy into your job application</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleCopy}
              disabled={!coverLetter || isGenerating}
              className="border-slate-700 hover:bg-slate-800 text-slate-200 gap-2"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </Button>

            <Button
              onClick={handleDownload}
              disabled={!coverLetter || isGenerating}
              className="gap-2 font-semibold shadow-lg shadow-primary/20"
            >
              <Download className="h-4 w-4" />
              <span>Download File</span>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
