'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { AnalyzeResume } from './AnalyzeResume';
import { CreateResume } from './CreateResume';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FileText, Briefcase, Sparkles, Brain, Upload, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ResumeHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analyze' | 'create'>('analyze');

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
              Your <span className="text-gradient">Career Toolkit</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Analyze your existing resume with AI or build a new one from scratch with intelligent guidance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Brain className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
            <Badge variant="outline" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              PDF & DOCX
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Briefcase className="h-3 w-3 mr-1" />
              Live Jobs
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab as (value: string) => void}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="analyze">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Analyze Resume</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="create">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Create Resume</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze">
            <AnalyzeResume />
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
            <h3 className="font-semibold mb-1">Smart Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Upload your resume and get detailed AI analysis with skills, experience level, and improvement suggestions
            </p>
          </CardContent>
        </Card>
        <Card hover className="border-primary/20">
          <CardContent className="py-6 text-center">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">AI Writing Assistant</h3>
            <p className="text-sm text-muted-foreground">
              Improve each section with ATS-friendly wording or generate complete sections from your background
            </p>
          </CardContent>
        </Card>
        <Card hover className="border-primary/20">
          <CardContent className="py-6 text-center">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">Live Job Matching</h3>
            <p className="text-sm text-muted-foreground">
              Get matched with real job listings from multiple sources based on your skills and experience
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};