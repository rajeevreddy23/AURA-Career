'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { AnalyzeResume } from './AnalyzeResume';
import { CreateResume } from './CreateResume';
import { LiveJobSearch } from './LiveJobSearch';
import { SkillImprovementPlan } from './SkillImprovementPlan';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  FileText, Briefcase, Sparkles, Brain, Upload, Globe, TrendingUp,
  Target, Award, ArrowUpRight, Zap, CheckCircle2, ShieldCheck
} from 'lucide-react';

export const ResumeHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analyze' | 'jobs' | 'skills' | 'create'>('analyze');

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Background Ambient Radial Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[320px] bg-gradient-to-b from-purple-600/15 via-indigo-600/10 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-36 right-10 w-72 h-72 bg-emerald-500/10 blur-[100px] pointer-events-none -z-10" />

      {/* Hero Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div className="space-y-3">
            {/* Pulsing Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/80 border border-purple-800/60 text-purple-300 shadow-sm shadow-purple-950/40">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <Sparkles className="h-3 w-3 text-purple-400" />
              <span>AURA Career & Resume Intelligence</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Next-Gen <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400">Career & Job Toolkit</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Multi-criteria ATS evaluation, real-time live job matching with compatibility scoring, personalized skill upgrade roadmaps, and instant AI cover letter generation.
            </p>
          </div>

          {/* Telemetry Metric Badges */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 lg:justify-end">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner text-xs font-medium text-slate-200">
              <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
              <span>ATS Precision v2.5</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner text-xs font-medium text-slate-200">
              <Globe className="h-3.5 w-3.5 text-emerald-400" />
              <span>4 Live Job Boards</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner text-xs font-medium text-slate-200">
              <Brain className="h-3.5 w-3.5 text-cyan-400" />
              <span>Gemini AI Engine</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner text-xs font-medium text-slate-200">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Instant Feedback</span>
            </div>
          </div>
        </div>

        {/* Segmented Control Navigation Tabs */}
        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab as (value: string) => void}>
            <div className="p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 backdrop-blur-xl shadow-xl shadow-black/30 inline-block w-full max-w-3xl mb-8">
              <TabsList className="grid w-full grid-cols-4 bg-transparent p-0 gap-1.5">
                <TabsTrigger
                  value="analyze"
                  className="rounded-xl py-2.5 text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-600/30 text-slate-400 hover:text-slate-200"
                >
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="hidden sm:inline">ATS Evaluation</span>
                    <span className="sm:hidden">Analyze</span>
                  </div>
                </TabsTrigger>

                <TabsTrigger
                  value="jobs"
                  className="rounded-xl py-2.5 text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-600/30 text-slate-400 hover:text-slate-200"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Briefcase className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span className="hidden sm:inline">Live Job Matcher</span>
                    <span className="sm:hidden">Jobs</span>
                    <span className="hidden md:inline-block px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] rounded-full">
                      Live
                    </span>
                  </div>
                </TabsTrigger>

                <TabsTrigger
                  value="skills"
                  className="rounded-xl py-2.5 text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-600/30 text-slate-400 hover:text-slate-200"
                >
                  <div className="flex items-center justify-center gap-2">
                    <TrendingUp className="h-4 w-4 text-amber-400 shrink-0" />
                    <span className="hidden sm:inline">Skill Upgrade Plan</span>
                    <span className="sm:hidden">Skills</span>
                  </div>
                </TabsTrigger>

                <TabsTrigger
                  value="create"
                  className="rounded-xl py-2.5 text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-600/30 text-slate-400 hover:text-slate-200"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4 text-pink-400 shrink-0" />
                    <span className="hidden sm:inline">Resume Builder</span>
                    <span className="sm:hidden">Builder</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Contents */}
            <TabsContent value="analyze" className="mt-0">
              <AnalyzeResume onNavigateToJobs={() => setActiveTab('jobs')} />
            </TabsContent>

            <TabsContent value="jobs" className="mt-0">
              <LiveJobSearch />
            </TabsContent>

            <TabsContent value="skills" className="mt-0">
              <SkillImprovementPlan />
            </TabsContent>

            <TabsContent value="create" className="mt-0">
              <CreateResume />
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>

      {/* Feature Showcase Grid Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12 pt-8 border-t border-slate-800/80"
      >
        <div className="relative group p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 hover:border-purple-500/40 transition-all duration-300 shadow-lg hover:shadow-purple-500/10">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
              <Upload className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-purple-950/60 border border-purple-800/40 text-purple-300">
              01 • ANALYSIS
            </span>
          </div>
          <h3 className="text-base font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
            Comprehensive ATS Scoring
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Extracts PDF structure, scores format & experience, highlights critical missing keywords, and simulates top enterprise ATS scanners.
          </p>
        </div>

        <div className="relative group p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 shadow-lg hover:shadow-cyan-500/10">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <Globe className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-800/40 text-cyan-300">
              02 • DISCOVERY
            </span>
          </div>
          <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
            Live Web Job Discovery
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Real-time querying of Remotive, RemoteOK, Arbeitnow, and Adzuna job APIs, auto-ranked with compatibility percentages against your resume.
          </p>
        </div>

        <div className="relative group p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 shadow-lg hover:shadow-emerald-500/10">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Brain className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800/40 text-emerald-300">
              03 • OPTIMIZATION
            </span>
          </div>
          <h3 className="text-base font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
            Skill Roadmaps & Cover Letters
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Actionable skill upgrade milestones matched to curriculum modules, plus 1-click tailored cover letters matching job descriptions.
          </p>
        </div>
      </motion.div>
    </div>
  );
};