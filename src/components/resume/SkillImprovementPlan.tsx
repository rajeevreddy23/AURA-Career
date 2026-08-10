'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, TrendingUp, BookOpen, CheckCircle, ArrowRight,
  RefreshCw, Layers, Edit3, Target, Zap, AlertTriangle, FileText, Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

const STORAGE_KEY = 'aura_resume_analysis_cache';

interface SkillGapItem {
  skill: string;
  category: string;
  priority: 'High' | 'Medium';
  reason: string;
  suggestedTopic: string;
}

interface ResumeUpdateItem {
  section: 'Summary' | 'Experience' | 'Skills' | 'Projects' | 'Formatting';
  currentIssue: string;
  actionRequired: string;
  suggestedText?: string;
}

export const SkillImprovementPlan: React.FC = () => {
  const [skillsToImprove, setSkillsToImprove] = useState<SkillGapItem[]>([]);
  const [resumeUpdates, setResumeUpdates] = useState<ResumeUpdateItem[]>([]);
  const [targetRole, setTargetRole] = useState<string>('Software Engineer');
  const [selectedSection, setSelectedSection] = useState<string>('Summary');
  const [customInput, setCustomInput] = useState<string>('');
  const [improvedResult, setImprovedResult] = useState<string>('');
  const [isImproving, setIsImproving] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Load from cache or generate defaults
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        const missing = data.missing_keywords || [];
        const partial = data.partially_matched_keywords || [];
        const tips = data.improvement_tips || [];

        // Build skill improvement roadmap
        const skillGaps: SkillGapItem[] = missing.map((sk: string, idx: number) => ({
          skill: sk,
          category: idx % 2 === 0 ? 'Core Technical Skill' : 'Cloud / Tooling',
          priority: idx < 3 ? 'High' : 'Medium',
          reason: `Frequently required in target roles for ${data.takeaway || 'Engineering'}.`,
          suggestedTopic: sk,
        }));

        if (partial.length > 0) {
          partial.forEach((sk: string) => {
            skillGaps.push({
              skill: sk,
              category: 'Skill Enhancement',
              priority: 'Medium',
              reason: 'Found partially in your resume; needs explicit project proof.',
              suggestedTopic: sk,
            });
          });
        }

        setSkillsToImprove(skillGaps.length > 0 ? skillGaps : defaultSkillGaps);

        // Build resume update plan
        const updates: ResumeUpdateItem[] = tips.map((tip: any) => ({
          section: (tip.section as any) || 'Experience',
          currentIssue: tip.title || 'Section needs optimization',
          actionRequired: tip.detail || 'Add quantifiable achievements and targeted keywords.',
        }));

        setResumeUpdates(updates.length > 0 ? updates : defaultResumeUpdates);
      } else {
        setSkillsToImprove(defaultSkillGaps);
        setResumeUpdates(defaultResumeUpdates);
      }
    } catch (e) {
      setSkillsToImprove(defaultSkillGaps);
      setResumeUpdates(defaultResumeUpdates);
    }
  }, []);

  const handleImproveContent = async () => {
    if (!customInput.trim()) return;
    setIsImproving(true);
    try {
      const res = await fetch('/api/resume-hub/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: selectedSection,
          content: customInput,
          mode: 'improve',
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.improved) {
        setImprovedResult(data.data.improved);
      }
    } catch (err) {
      console.error('Improve error:', err);
    } finally {
      setIsImproving(false);
    }
  };

  const handleCopy = () => {
    if (!improvedResult) return;
    navigator.clipboard.writeText(improvedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Skill Upgrade & Resume Revision Roadmap</h2>
            <p className="text-xs text-slate-400">
              Targeted skill gaps to learn in AURA Learn and step-by-step resume updates to boost ATS scores.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Column 1: Skills to Improve */}
        <Card className="lg:col-span-6 bg-slate-900 border-slate-800 shadow-xl">
          <CardHeader className="border-b border-slate-800/80 pb-4">
            <CardTitle className="text-lg font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Skills You Should Improve
              </span>
              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                {skillsToImprove.length} Skills Identified
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Master these missing or weak skills to match top job requirements.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            {skillsToImprove.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between gap-3 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-base">{item.skill}</h4>
                      <Badge
                        className={`text-[10px] px-2 py-0.5 ${
                          item.priority === 'High'
                            ? 'bg-red-500/20 text-red-300 border-red-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {item.priority} Priority
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{item.reason}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                  <span className="text-[11px] text-slate-400 font-medium">Category: {item.category}</span>
                  <Link
                    href={`/classroom?topic=${encodeURIComponent(item.suggestedTopic)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Learn in Classroom</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Column 2: Resume Updates Needed */}
        <Card className="lg:col-span-6 bg-slate-900 border-slate-800 shadow-xl">
          <CardHeader className="border-b border-slate-800/80 pb-4">
            <CardTitle className="text-lg font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-amber-400" />
                What to Update in Your Resume
              </span>
              <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400">
                Action Items
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Section-by-section fixes to increase impact and pass ATS filters.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            {resumeUpdates.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] uppercase font-bold border-slate-600 text-slate-300">
                    {item.section} Section
                  </Badge>
                  <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Recommendation
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-white">{item.currentIssue}</h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                  {item.actionRequired}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI Resume Section Rewriter / Enhancer */}
      <Card className="bg-slate-900 border-slate-800 shadow-xl">
        <CardHeader className="border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Instant AI Resume Section Rewriter</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Paste any section of your resume (e.g. work experience bullet, summary) and get an ATS-optimized, high-impact rewrite using Gemini API.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Section Type</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-primary"
              >
                <option value="Summary">Professional Summary</option>
                <option value="Experience">Work Experience Bullet</option>
                <option value="Skills">Technical Skills List</option>
                <option value="Projects">Project Description</option>
              </select>
            </div>

            <div className="md:col-span-9">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Paste Current Text to Rewrite</label>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="e.g. Developed a web app using React and backend API for customer orders..."
                rows={3}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleImproveContent}
              disabled={isImproving || !customInput.trim()}
              className="gap-2 font-bold text-sm shadow-lg shadow-primary/20"
            >
              {isImproving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Rewriting with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate ATS-Optimized Rewrite</span>
                </>
              )}
            </Button>
          </div>

          {improvedResult && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                  ✓ AI Optimized Result
                </Badge>
                <Button size="sm" variant="outline" onClick={handleCopy} className="text-xs border-slate-700 text-slate-200 gap-1.5">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Edit3 className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                </Button>
              </div>
              <p className="text-sm text-slate-100 font-sans leading-relaxed whitespace-pre-wrap">{improvedResult}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const defaultSkillGaps: SkillGapItem[] = [
  {
    skill: 'AWS / Cloud Deployment',
    category: 'Cloud Infrastructure',
    priority: 'High',
    reason: 'Critical keyword required for modern full stack engineering positions.',
    suggestedTopic: 'AWS Cloud Fundamentals',
  },
  {
    skill: 'Docker & Containerization',
    category: 'DevOps',
    priority: 'High',
    reason: 'High frequency in recruiter candidate filters.',
    suggestedTopic: 'Docker & Kubernetes',
  },
  {
    skill: 'GraphQL & API Design',
    category: 'Backend Architecture',
    priority: 'Medium',
    reason: 'Adds competitive edge for senior frontend & full stack roles.',
    suggestedTopic: 'GraphQL API Masterclass',
  },
];

const defaultResumeUpdates: ResumeUpdateItem[] = [
  {
    section: 'Experience',
    currentIssue: 'Bullet points lack quantifiable metrics',
    actionRequired: 'Add specific percentage increases or scale metrics (e.g. "improved load time by 35%", "handled 10k daily users").',
  },
  {
    section: 'Skills',
    currentIssue: 'Cloud keywords missing from main skills matrix',
    actionRequired: 'Group skills by categories (Frontend, Backend, Cloud/DevOps, Database) for easier ATS parsing.',
  },
  {
    section: 'Summary',
    currentIssue: 'Summary is generic and does not echo target role title',
    actionRequired: 'Rewrite summary to lead with your exact target title (e.g. "Full Stack Engineer with 3+ years experience...")',
  },
];
