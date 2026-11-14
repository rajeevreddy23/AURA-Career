'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, TrendingUp, BookOpen, CheckCircle, ArrowRight,
  RefreshCw, Layers, Edit3, Target, Zap, AlertTriangle, FileText, Check, ArrowUpRight
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
          reason: `Frequently demanded requirement for ${data.takeaway || 'target role'}.`,
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
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl shadow-amber-950/20"
      >
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-purple-500 absolute top-0 left-0" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20 shadow-inner shrink-0">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Targeted Career Growth
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Skill Upgrade & ATS Revision Roadmap
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Targeted skill gaps to learn directly in AuraCareer and tactical resume updates to maximize interview callbacks.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Column 1: Skills to Improve */}
        <div className="lg:col-span-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Skills You Should Improve</h3>
                <p className="text-xs text-slate-400">Master these missing keywords to unlock senior roles.</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
              {skillsToImprove.length} Skills
            </span>
          </div>

          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            {skillsToImprove.map((item, idx) => {
              const isHigh = item.priority === 'High';
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 hover:border-purple-500/40 transition-all duration-200 flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">
                          {item.skill}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isHigh
                              ? 'bg-red-500/20 text-red-300 border-red-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {item.priority} Priority
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{item.reason}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Category: <span className="text-slate-300">{item.category}</span>
                    </span>
                    <Link
                      href={`/classroom?topic=${encodeURIComponent(item.suggestedTopic)}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Learn in Classroom</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Resume Updates Needed */}
        <div className="lg:col-span-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
                <Edit3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">What to Update in Your Resume</h3>
                <p className="text-xs text-slate-400">Section fixes to pass automated ATS filters.</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Action Items
            </span>
          </div>

          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            {resumeUpdates.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 hover:border-amber-500/40 transition-all duration-200 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border border-slate-700 bg-slate-900 text-slate-300">
                    {item.section} Section
                  </span>
                  <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Critical Action
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-white">{item.currentIssue}</h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  {item.actionRequired}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Resume Section Rewriter / Enhancer */}
      <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl shadow-indigo-950/20 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500" />

        <div className="p-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">Instant AI Resume Section Rewriter</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Paste any work bullet point, summary, or project snippet to get a high-impact, quantifiable rewrite optimized for ATS.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Section Category
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-all"
              >
                <option value="Summary" className="bg-slate-900">Professional Summary</option>
                <option value="Experience" className="bg-slate-900">Work Experience Bullet</option>
                <option value="Skills" className="bg-slate-900">Technical Skills Matrix</option>
                <option value="Projects" className="bg-slate-900">Project Description</option>
              </select>
            </div>

            <div className="md:col-span-8">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Paste Draft Text to Optimize
              </label>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="e.g. Developed a web application with React and Node.js for managing online orders and increased speed..."
                rows={3}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleImproveContent}
              disabled={isImproving || !customInput.trim()}
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
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
            </button>
          </div>

          {improvedResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/40 space-y-3 shadow-lg shadow-emerald-950/10"
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  AI Optimized Result
                </span>
                <button
                  onClick={handleCopy}
                  className="text-xs px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Edit3 className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                </button>
              </div>
              <p className="text-sm text-slate-100 font-sans leading-relaxed whitespace-pre-wrap bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                {improvedResult}
              </p>
            </motion.div>
          )}
        </div>
      </div>
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
