'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import {
  FileText, Download, Copy, Check, Sparkles,
  BookOpen, ListChecks, Hash, Quote, Eye
} from 'lucide-react';
import type { BoardPage } from '@/types';
import toast from 'react-hot-toast';

interface NotesGeneratorProps {
  boardPages: BoardPage[];
  topic: string;
  className?: string;
}

export const NotesGenerator: React.FC<NotesGeneratorProps> = ({
  boardPages,
  topic,
  className,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [notes, setNotes] = useState<{
    summary: string;
    keyPoints: string[];
    definitions: { term: string; definition: string }[];
    flashcards: { front: string; back: string }[];
    markdown: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<'summary' | 'keypoints' | 'definitions' | 'flashcards'>('summary');

  const generateNotes = useCallback(() => {
    setIsGenerating(true);
    
    // Simulate compilation latency
    setTimeout(() => {
      // Gather slide content
      const allItems = boardPages.flatMap(page => page.items);
      const headings = allItems.filter(item => item.type === 'heading').map(item => item.content);
      const bulletSets = allItems.filter(item => item.type === 'bullets').map(item => item.content);
      const codeBlocks = allItems.filter(item => item.type === 'code').map(item => item.content);
      
      const keyPoints: string[] = [];
      const definitions: { term: string; definition: string }[] = [];
      const flashcards: { front: string; back: string }[] = [];

      // Extract bullet points
      bulletSets.forEach(set => {
        const parts = set.split('||').map(p => p.trim()).filter(Boolean);
        keyPoints.push(...parts);
      });

      // Populate definitions based on keywords
      const defaultDefinitions = [
        { term: 'Component', definition: 'A reusable unit of user interface.' },
        { term: 'State', definition: 'Data that determines a component\'s behavior and rendering.' },
        { term: 'Function', definition: 'A block of organized, reusable code that performs an action.' },
        { term: 'Algorithm', definition: 'A step-by-step procedure for solving a computational problem.' },
      ];

      // Match terms found in keywords
      defaultDefinitions.forEach(def => {
        const hasKeyword = allItems.some(i => i.content.toLowerCase().includes(def.term.toLowerCase()));
        if (hasKeyword || def.term.toLowerCase() === 'function') {
          definitions.push(def);
        }
      });

      // Construct flashcards
      definitions.forEach(d => {
        flashcards.push({
          front: `What is a ${d.term}?`,
          back: d.definition
        });
      });

      if (keyPoints.length === 0) {
        keyPoints.push(`Successfully completed the introductory module on ${topic}.`);
        keyPoints.push('Reviewed code structure and diagrams.');
      }

      const summaryText = headings.length > 0 
        ? `This study guide summarizes the lecture on "${topic}". We covered key concepts including ${headings.slice(0, 3).join(', ')}.`
        : `Summary study guide for "${topic}", focusing on core syntax, structural diagrams, and practical examples.`;

      // Build structured markdown notes
      const markdownLines = [
        `# Class Study Notes: ${topic}`,
        `*Generated automatically by AuraCareer AI Classroom*`,
        '',
        `## 📝 Executive Summary`,
        summaryText,
        '',
        `## 🎯 Key Learning Points`,
        ...keyPoints.map(kp => `- ${kp}`),
        '',
        `## 📖 Glossary & Definitions`,
        ...definitions.map(d => `* **${d.term}**: ${d.definition}`),
      ];

      if (codeBlocks.length > 0) {
        markdownLines.push('', `## 💻 Code Reference & Snippets`);
        codeBlocks.forEach((code, idx) => {
          markdownLines.push(
            `### Implementation Example ${idx + 1}`,
            '```typescript',
            code,
            '```',
            ''
          );
        });
      }

      setNotes({
        summary: summaryText,
        keyPoints: keyPoints.slice(0, 8),
        definitions: definitions.length > 0 ? definitions : defaultDefinitions.slice(0, 2),
        flashcards: flashcards.length > 0 ? flashcards : [
          { front: `What was the topic of this class?`, back: topic },
          { front: `What skill levels does AuraCareer support?`, back: 'Beginner, Intermediate, and Advanced' }
        ],
        markdown: markdownLines.join('\n')
      });
      
      setIsGenerating(false);
      toast.success('Study notes compiled successfully!');
    }, 800);

  }, [boardPages, topic]);

  const copyNotes = useCallback(() => {
    if (!notes) return;
    navigator.clipboard.writeText(notes.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Markdown copied to clipboard!');
  }, [notes]);

  const downloadNotes = useCallback(() => {
    if (!notes) return;
    const blob = new Blob([notes.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic.toLowerCase().replace(/\s+/g, '-')}-notes.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Markdown notes downloaded!');
  }, [notes, topic]);

  const views = [
    { id: 'summary' as const, icon: BookOpen, label: 'Summary' },
    { id: 'keypoints' as const, icon: ListChecks, label: 'Key Points' },
    { id: 'definitions' as const, icon: Hash, label: 'Definitions' },
    { id: 'flashcards' as const, icon: Quote, label: 'Cards' },
  ];

  return (
    <Card className={cn("border border-white/5 bg-slate-900/60 text-white backdrop-blur-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-bold tracking-tight">
          <FileText className="h-4 w-4 text-indigo-400" />
          Lecture Notes
        </CardTitle>
        {notes && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={copyNotes} className="h-7 w-7 p-0 hover:bg-white/5">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={downloadNotes} className="h-7 w-7 p-0 hover:bg-white/5">
              <Download className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        {!notes ? (
          <div className="text-center py-6 space-y-3">
            <Sparkles className="h-6 w-6 text-indigo-400 mx-auto animate-pulse" />
            <p className="text-xs text-slate-400 max-w-[180px] mx-auto leading-relaxed">
              Compile slide bullet lists, code references, and diagrams into notes.
            </p>
            <Button
              variant="primary"
              onClick={generateNotes}
              isLoading={isGenerating}
              className="h-8 text-xs font-semibold px-4"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Compile Notes
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-1 p-0.5 rounded-lg bg-white/5 select-none">
              {views.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-300',
                    view === v.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin text-left text-xs leading-relaxed text-slate-300">
              {view === 'summary' && (
                <p className="whitespace-pre-wrap">{notes.summary}</p>
              )}
              {view === 'keypoints' && (
                <ul className="space-y-2">
                  {notes.keyPoints.map((kp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="h-4 w-4 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{kp}</span>
                    </li>
                  ))}
                </ul>
              )}
              {view === 'definitions' && (
                <div className="space-y-2">
                  {notes.definitions.map((d, i) => (
                    <div key={i} className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                      <span className="text-[11px] font-bold text-indigo-400 capitalize">{d.term}</span>
                      <p className="text-slate-400 mt-0.5 text-[10px] leading-relaxed">{d.definition}</p>
                    </div>
                  ))}
                </div>
              )}
              {view === 'flashcards' && (
                <div className="space-y-2">
                  {notes.flashcards.map((f, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                      <p className="font-semibold text-slate-300">Q: {f.front}</p>
                      <p className="text-slate-400 mt-1 pl-2 border-l border-indigo-500/35">A: {f.back}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 pt-2.5 border-t border-white/5">
              <Badge variant="default" className="text-[9px] bg-slate-800 text-slate-400 border-none px-1.5 py-0.5">
                {notes.keyPoints.length} points
              </Badge>
              <Badge variant="default" className="text-[9px] bg-slate-800 text-slate-400 border-none px-1.5 py-0.5">
                {notes.definitions.length} glossary
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
