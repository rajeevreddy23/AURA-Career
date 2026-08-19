'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CodingLab } from '@/components/coding/CodingLab';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import {
  Code2, Sparkles, ChevronRight
} from 'lucide-react';

const challenges = [
  { title: 'Hello, World!', difficulty: 'easy', language: 'python', description: 'Print "Hello, World!" to the console.' },
  { title: 'FizzBuzz', difficulty: 'easy', language: 'python', description: 'Print numbers 1-100, replacing multiples of 3 with Fizz, 5 with Buzz.' },
  { title: 'Palindrome Checker', difficulty: 'medium', language: 'python', description: 'Check if a string is a palindrome.' },
  { title: 'Fibonacci Sequence', difficulty: 'medium', language: 'python', description: 'Generate the Fibonacci sequence up to n terms.' },
  { title: 'Binary Search', difficulty: 'medium', language: 'python', description: 'Implement binary search on a sorted array.' },
  { title: 'Sorting Visualizer', difficulty: 'hard', language: 'javascript', description: 'Create a visual sorting algorithm demonstration.' },
];

export default function CodingLabPage() {
  const searchParams = useSearchParams();
  const snippetParam = searchParams.get('snippet');
  const langParam = searchParams.get('lang');

  const [selectedChallenge, setSelectedChallenge] = useState<typeof challenges[0] | null>(null);
  const [activeTab, setActiveTab] = useState<'workspace' | 'challenges'>('workspace');
  const [activeCode, setActiveCode] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (snippetParam) {
      try {
        setActiveCode(decodeURIComponent(snippetParam));
      } catch {
        setActiveCode(snippetParam);
      }
    }
  }, [snippetParam]);

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-16 h-[calc(100vh-4rem)] flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Code2 className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold">Coding Lab</span>
            <Badge variant="default" size="sm">Interactive Workspace</Badge>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('workspace')}
              className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                activeTab === 'workspace' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Workspace
            </button>
            <button
              onClick={() => setActiveTab('challenges')}
              className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                activeTab === 'challenges' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Challenges
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Challenge Sidebar */}
          {activeTab === 'challenges' && (
            <div className="w-72 border-r border-border bg-card overflow-y-auto">
              <div className="p-3 border-b border-border">
                <h3 className="text-sm font-medium">Practice Challenges</h3>
                <p className="text-xs text-muted-foreground">Choose a challenge to solve</p>
              </div>
              <div className="p-2 space-y-1">
                {challenges.map((ch) => (
                  <button
                    key={ch.title}
                    onClick={() => {
                      setSelectedChallenge(ch);
                      setActiveCode(undefined);
                      setActiveTab('workspace');
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors text-left"
                  >
                    <div className={cn(
                      'h-2 w-2 rounded-full shrink-0',
                      ch.difficulty === 'easy' ? 'bg-green-500' :
                      ch.difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ch.title}</p>
                      <p className="text-xs text-muted-foreground">{ch.language} • {ch.difficulty}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main Workspace */}
          <div className="flex-1 flex flex-col">
            {selectedChallenge && (
              <div className="px-4 py-2 border-b border-border bg-card/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{selectedChallenge.title}</span>
                    <Badge variant="default" size="sm">{selectedChallenge.difficulty}</Badge>
                    <Badge variant="default" size="sm">{selectedChallenge.language}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{selectedChallenge.description}</span>
                </div>
              </div>
            )}
            <div className="flex-1">
              <CodingLab
                key={activeCode ? 'snippet-loaded' : selectedChallenge?.title || 'default-lab'}
                initialCode={activeCode}
                language={langParam || selectedChallenge?.language || 'python'}
                showAI={true}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
