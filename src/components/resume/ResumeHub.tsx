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
import { FileText, Briefcase, Sparkles, Brain, Upload, Globe, TrendingUp } from 'lucide-react';

export const ResumeHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analyze' | 'jobs' | 'skills' | 'create'>('analyze');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <Badge variant="primary" size="md" className="mb-3">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Resume Hub
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Your <span className="text-gradient">Career & Job Toolkit</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Analyze your resume, discover live matching web jobs with AI compatibility scoring, view skill improvement roadmaps, and craft tailored cover letters.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Brain className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Globe className="h-3 w-3 mr-1 text-emerald-400" />
              Live Web APIs
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Briefcase className="h-3 w-3 mr-1" />
              Auto Job Matcher
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab as (value: string) => void}>
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="analyze">
              <div className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">ATS Analysis</span>
                <span className="sm:hidden">Analyze</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="jobs">
              <div className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline">Live Job Matcher</span>
                <span className="sm:hidden">Jobs</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="skills">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-amber-400" />
                <span className="hidden sm:inline">Skill Upgrade Plan</span>
                <span className="sm:hidden">Skills</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="create">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Resume Builder</span>
                <span className="sm:hidden">Builder</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze">
            <AnalyzeResume onNavigateToJobs={() => setActiveTab('jobs')} />
          </TabsContent>

          <TabsContent value="jobs">
            <LiveJobSearch />
          </TabsContent>

          <TabsContent value="skills">
            <SkillImprovementPlan />
          </TabsContent>

          <TabsContent value="create">
            <CreateResume />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Feature highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
      >
        <Card hover className="border-primary/20">
          <CardContent className="py-6 text-center">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">Smart ATS Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Upload your PDF resume and get instant AI evaluation, breakdown scores, and keyword missing alerts.
            </p>
          </CardContent>
        </Card>
        <Card hover className="border-primary/20">
          <CardContent className="py-6 text-center">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">Live Multi-API Job Matcher</h3>
            <p className="text-sm text-muted-foreground">
              Search real-time remote & on-site job boards (Remotive, RemoteOK, Arbeitnow, Adzuna) auto-scored against your resume.
            </p>
          </CardContent>
        </Card>
        <Card hover className="border-primary/20">
          <CardContent className="py-6 text-center">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">1-Click AI Cover Letter</h3>
            <p className="text-sm text-muted-foreground">
              Instantly generate customized, high-converting cover letters tailored to any job posting in seconds.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};