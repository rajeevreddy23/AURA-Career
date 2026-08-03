'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';
import {
  Upload,
  FileText,
  Loader2,
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
  Bot,
  Send,
  Paperclip,
  Brain,
  ShieldCheck,
  FileSearch,
  Wand2,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface ResumeAnalysis {
  skills: string[];
  experienceLevel: string;
  suggestedRoles: string[];
  summary: string;
  strengths: string[];
  improvements: string[];
  searchKeywords: string[];
  atsScore?: number;
  atsGaps?: string[];
}

interface Job {
  title: string;
  company: string;
  location: string;
  source: string;
  description: string;
  url: string;
  postedDate: string;
  matchScore?: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  kind: 'text' | 'typing' | 'analysis' | 'jobs';
  content?: string;
  analysis?: ResumeAnalysis;
  jobs?: Job[];
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let msgCounter = 0;
const nextId = () => `msg-${++msgCounter}-${Date.now()}`;

export const AnalyzeResume: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [rawText, setRawText] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [isPastedMode, setIsPastedMode] = useState(false);
  const [pasteContext, setPasteContext] = useState<'resume' | 'job'>('resume');
  const [pastedText, setPastedText] = useState('');
  const [chatInput, setChatInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isUploading]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const t = setTimeout(() => {
      setMessages([{
        id: nextId(),
        role: 'bot',
        kind: 'text',
        content:
          "Hi! I'm your AURA career coach 👋\n\nUpload your resume (PDF or DOCX) and I'll analyze it for ATS compatibility, extract your skills, suggest roles, and even hunt down matching job openings for you.\n\nGo ahead — drop your file or paste your resume text below.",
      }]);
      setQuickReplies(['Upload resume', 'Paste resume text']);
    }, 400);
    return () => clearTimeout(t);
  }, []);

  const appendMessage = useCallback((msg: ChatMessage) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  const botTyping = useCallback(() => {
    const typingMsg: ChatMessage = { id: nextId(), role: 'bot', kind: 'typing' };
    appendMessage(typingMsg);
    return typingMsg.id;
  }, [appendMessage]);

  const replaceTyping = useCallback((typingId: string, msg: Omit<ChatMessage, 'id' | 'role'>) => {
    setMessages(prev => prev.map(m => (m.id === typingId ? { id: m.id, role: 'bot', ...msg } : m)));
  }, []);

  const botSay = useCallback(async (text: string, delay = 900) => {
    const typingId = botTyping();
    await sleep(delay);
    replaceTyping(typingId, { kind: 'text', content: text });
  }, [botTyping, replaceTyping]);

  const botSaySequential = useCallback(async (steps: string[], perStep = 1100) => {
    for (const step of steps) {
      await botSay(step, perStep);
    }
  }, [botSay]);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setFileName(droppedFile.name);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
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

  const analyzeText = useCallback(async (text: string) => {
    setIsBusy(true);
    setQuickReplies([]);
    appendMessage({ id: nextId(), role: 'user', kind: 'text', content: fileName || 'Analyze my resume' });
    setFileName('');

    const typingId = botTyping();
    const steps = [
      'Reading your resume...',
      'Extracting skills and experience signals...',
      'Scoring against 200+ ATS rules...',
    ];
    for (const step of steps) {
      await sleep(1100);
      setMessages(prev => prev.map(m => (m.id === typingId ? { ...m, content: step } : m)));
    }

    try {
      const res = await fetch('/api/resume-hub/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Analysis failed');

      const result: ResumeAnalysis = data.data.analysis;
      setAnalysis(result);
      setRawText(data.data.rawText);
      replaceTyping(typingId, { kind: 'analysis', analysis: result });

      const score = result.atsScore ?? 0;
      const verdict =
        score >= 80 ? 'strong resume — recruiters should notice it. 🎯' :
        score >= 60 ? 'decent foundation, but ATS gaps are holding you back.' :
        'struggling to pass ATS filters — let\'s fix that.';
      await botSay(
        `Analysis complete! Here's your profile at a glance. Your resume scores **${score}/100** for ATS compatibility — a ${verdict}\n\nWhat would you like to do next?`,
        800
      );
      setQuickReplies([
        'Find matching jobs',
        'Improve my summary',
        'Show ATS gaps',
        'Score against a job description',
      ]);
    } catch (err: any) {
      replaceTyping(typingId, {
        kind: 'text',
        content: `I ran into an issue analyzing that file: ${err.message || 'unknown error'}. Mind trying again?`,
      });
    } finally {
      setIsBusy(false);
      setIsUploading(false);
    }
  }, [appendMessage, botTyping, replaceTyping, botSay, fileName]);

  const handleAnalyze = useCallback(async () => {
    if (!file) return;
    setIsUploading(true);
    setFile(null);

    const typingId = botTyping();
    await sleep(700);
    setMessages(prev => prev.map(m => (m.id === typingId ? { ...m, content: `Opening ${fileName} and extracting text...` } : m)));

    try {
      let text = '';
      const name = fileName.toLowerCase();
      if (name.endsWith('.pdf')) {
        text = await extractTextFromPDF(file);
      } else if (name.endsWith('.docx')) {
        text = await extractTextFromDOCX(file);
      } else {
        text = await file.text();
      }
      if (!text.trim()) throw new Error('No text content found in the file.');

      replaceTyping(typingId, { kind: 'text', content: `📄 Got it — "**${fileName}**" contains ${text.length.toLocaleString()} characters. Analyzing now...` });
      await analyzeText(text);
    } catch (err: any) {
      replaceTyping(typingId, { kind: 'text', content: `Couldn't read that file: ${err.message}. Try a PDF or DOCX.` });
      setIsUploading(false);
      setIsBusy(false);
    }
  }, [file, fileName, analyzeText, extractTextFromPDF, extractTextFromDOCX, botTyping, replaceTyping]);

  const handlePastedAnalyze = useCallback(async () => {
    const text = pastedText.trim();
    if (!text) return;

    if (pasteContext === 'job') {
      setIsPastedMode(false);
      setIsBusy(true);
      setQuickReplies([]);
      appendMessage({ id: nextId(), role: 'user', kind: 'text', content: 'Score against a job description' });
      const typingId = botTyping();
      await sleep(900);
      setMessages(prev => prev.map(m => (m.id === typingId ? { ...m, content: 'Comparing your resume against the job description keyword-by-keyword...' } : m)));

      try {
        const res = await fetch('/api/resume-hub/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resume_text: rawText.slice(0, 15000), job_description: text }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Scoring failed');
        const scoreData = data.data || {};
        const matchScore = scoreData.matchScore ?? 0;
        const matched = Array.isArray(scoreData.matchedKeywords) ? scoreData.matchedKeywords : [];
        const missing = Array.isArray(scoreData.missingKeywords) ? scoreData.missingKeywords : [];
        const tips = Array.isArray(scoreData.tailoringSuggestions) ? scoreData.tailoringSuggestions : [];

        let reply = `Here's how your resume matches that job description:\n\n**Match score: ${matchScore}/100**\n\n`;
        reply += `✅ **Matched keywords (${matched.length}):** ${matched.slice(0, 12).join(', ') || 'none found'}\n\n`;
        reply += `❌ **Missing keywords (${missing.length}):** ${missing.slice(0, 12).join(', ') || 'none — great coverage!'}\n\n`;
        if (tips.length > 0) {
          reply += `💡 **Tailoring suggestions:**\n`;
          tips.slice(0, 5).forEach((tip: string, i: number) => { reply += `${i + 1}. ${tip}\n`; });
        }
        reply += `\nWant me to find jobs that fit this profile instead?`;
        replaceTyping(typingId, { kind: 'text', content: reply });
        setQuickReplies(['Find matching jobs', 'Improve my summary', 'Show ATS gaps', 'New resume analysis']);
      } catch (err: any) {
        replaceTyping(typingId, {
          kind: 'text',
          content: `I couldn't score against that description: ${err.message}. Make sure you've analyzed a resume first, then try again.`,
        });
        setQuickReplies(['Find matching jobs', 'New resume analysis']);
      } finally {
        setIsBusy(false);
      }
      return;
    }

    setIsPastedMode(false);
    await analyzeText(text);
  }, [pastedText, pasteContext, rawText, analyzeText, appendMessage, botTyping, replaceTyping]);

  const handleFetchJobs = useCallback(async () => {
    if (!analysis) return;
    setIsBusy(true);
    setQuickReplies([]);
    appendMessage({ id: nextId(), role: 'user', kind: 'text', content: 'Find matching jobs' });

    const typingId = botTyping();
    const roles = analysis.suggestedRoles?.slice(0, 3).join(', ') || 'Software Engineer';
    const steps = [
      `Searching job boards for "${roles}"...`,
      'Cross-referencing your skills with live listings...',
      'Ranking matches by relevance to your profile...',
    ];
    for (const step of steps) {
      await sleep(1100);
      setMessages(prev => prev.map(m => (m.id === typingId ? { ...m, content: step } : m)));
    }

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
      if (!data.success) throw new Error(data.error || 'Job search failed');

      const found: Job[] = data.data.jobs || [];
      setJobs(found);
      replaceTyping(typingId, { kind: 'jobs', jobs: found });
      await botSay(
        found.length > 0
          ? `${data.data.summary || `I pulled **${found.length}** live openings for you.`}\n\nYour **top match** is "${found[0]?.title}" at ${found[0]?.company} (${found[0]?.matchScore}% fit) — tap it to apply directly, or ask me to refine the search.`
          : 'I searched several boards but couldn\'t find live matches for those exact roles right now. Try "Improve my summary" or a different search, and I\'ll scan again.',
        900
      );
      setQuickReplies(['Search with different location', 'Improve my summary', 'New resume analysis']);
    } catch {
      replaceTyping(typingId, { kind: 'text', content: 'The job boards are unreachable right now — the search service may be down. Please try again in a moment.' });
    } finally {
      setIsBusy(false);
    }
  }, [analysis, botSay, botTyping, appendMessage, replaceTyping]);

  const handleImproveSummary = useCallback(async () => {
    if (!analysis || !rawText) return;
    setIsBusy(true);
    setQuickReplies([]);
    appendMessage({ id: nextId(), role: 'user', kind: 'text', content: 'Improve my summary' });

    const typingId = botTyping();
    await sleep(800);
    setMessages(prev => prev.map(m => (m.id === typingId ? { ...m, content: 'Rewriting your professional summary with ATS-friendly, impact-driven language...' } : m)));

    try {
      const res = await fetch('/api/resume-hub/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'Professional Summary',
          content: analysis.summary,
          mode: 'improve',
          background: rawText.slice(0, 3000),
        }),
      });
      const data = await res.json();
      const improved = data?.data?.improved || analysis.summary;
      replaceTyping(typingId, {
        kind: 'text',
        content: `Here's a stronger, ATS-optimized version of your summary:\n\n${improved}\n\nSwap it into your resume and you'll rank higher for keyword scans. Want me to polish another section?`,
      });
      setQuickReplies(['Find matching jobs', 'Show ATS gaps', 'New resume analysis']);
    } catch {
      replaceTyping(typingId, { kind: 'text', content: 'I couldn\'t reach the AI writer this time. Try again shortly!' });
    } finally {
      setIsBusy(false);
    }
  }, [analysis, rawText, appendMessage, botTyping, replaceTyping]);

  const handleShowGaps = useCallback(async () => {
    if (!analysis) return;
    setIsBusy(true);
    setQuickReplies([]);
    appendMessage({ id: nextId(), role: 'user', kind: 'text', content: 'Show ATS gaps' });

    const typingId = botTyping();
    await sleep(900);
    const gaps = analysis.atsGaps?.length
      ? analysis.atsGaps.map((g, i) => `${i + 1}. ${g}`).join('\n')
      : 'No major ATS gaps detected — nice work!';
    replaceTyping(typingId, {
      kind: 'text',
      content: `Here's what's hurting your ATS score (${analysis.atsScore ?? 'N/A'}/100):\n\n${gaps}\n\nWant me to fix the most impactful one first?`,
    });
    setQuickReplies(['Find matching jobs', 'Improve my summary', 'New resume analysis']);
    setIsBusy(false);
  }, [analysis, appendMessage, botTyping, replaceTyping]);

  const handleQuickReply = useCallback((reply: string) => {
    if (isBusy) return;
    if (reply === 'Upload resume') {
      fileInputRef.current?.click();
    } else if (reply === 'Paste resume text') {
      setPasteContext('resume');
      setPastedText('');
      setIsPastedMode(true);
    } else if (reply === 'Find matching jobs') {
      handleFetchJobs();
    } else if (reply === 'Improve my summary') {
      handleImproveSummary();
    } else if (reply === 'Show ATS gaps') {
      handleShowGaps();
    } else if (reply === 'Search with different location') {
      handleFetchJobs();
    } else if (reply === 'New resume analysis') {
      resetConversation();
    } else if (reply === 'Score against a job description') {
      appendMessage({ id: nextId(), role: 'user', kind: 'text', content: 'Score against a job description' });
      setIsBusy(true);
      setQuickReplies([]);
      const typingId = botTyping();
      sleep(1000).then(() => {
        replaceTyping(typingId, {
          kind: 'text',
          content:
            'Great idea! Paste the job description here and I\'ll score your resume against it — matched keywords, missing keywords, and tailoring suggestions. ✍️',
        });
        setPasteContext('job');
        setPastedText('');
        setIsPastedMode(true);
        setIsBusy(false);
      });
    }
  }, [isBusy, handleFetchJobs, handleImproveSummary, handleShowGaps, appendMessage, botTyping, replaceTyping]);

  const resetConversation = useCallback(() => {
    setAnalysis(null);
    setJobs([]);
    setRawText('');
    setFile(null);
    setFileName('');
    setIsPastedMode(false);
    setMessages([{
      id: nextId(),
      role: 'bot',
      kind: 'text',
      content: 'Fresh start! Upload a resume or paste its text and I\'ll run a full career analysis for you. 🚀',
    }]);
    setQuickReplies(['Upload resume', 'Paste resume text']);
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

  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="bg-muted text-primary px-1 py-0.5 rounded text-xs font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }
      return <React.Fragment key={i}>{part}</React.Fragment>;
    });
  };

  const renderMessage = (msg: ChatMessage) => {
    if (msg.kind === 'typing') {
      return (
        <div className="flex items-center gap-1.5 py-1">
          <span className="h-2 w-2 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-2 w-2 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-2 w-2 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: '300ms' }} />
          <span className="text-xs text-muted-foreground ml-1">{msg.content || 'Thinking...'}</span>
        </div>
      );
    }

    if (msg.kind === 'analysis' && msg.analysis) {
      const a = msg.analysis;
      const score = a.atsScore ?? 0;
      return (
        <div className="space-y-3 w-full max-w-2xl">
          <div className="flex items-center gap-4 p-4 rounded-xl border border-primary/20 bg-card">
            <div className="relative h-16 w-16 shrink-0">
              <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3.5" className="text-muted" />
                <circle
                  cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={`${(score / 100) * 97.4} 97.4`}
                  className={score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500'}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{score}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold">ATS Score</p>
                <Badge className={cn('capitalize', getLevelColor(a.experienceLevel))}>{a.experienceLevel} level</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.summary}</p>
            </div>
            <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-border bg-card">
              <p className="text-xs font-medium flex items-center gap-1.5 mb-2 text-muted-foreground">
                <Star className="h-3.5 w-3.5 text-yellow-500" /> Skills detected
              </p>
              <div className="flex flex-wrap gap-1.5">
                {a.skills.slice(0, 10).map(s => (
                  <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{s}</span>
                ))}
                {a.skills.length > 10 && <span className="text-[11px] px-2 py-0.5 text-muted-foreground">+{a.skills.length - 10} more</span>}
              </div>
            </div>
            <div className="p-3 rounded-xl border border-border bg-card">
              <p className="text-xs font-medium flex items-center gap-1.5 mb-2 text-muted-foreground">
                <Target className="h-3.5 w-3.5 text-primary" /> Suggested roles
              </p>
              <div className="space-y-1.5">
                {a.suggestedRoles.slice(0, 4).map((role, i) => (
                  <div key={role} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="h-3 w-3 text-muted-foreground" /> {role}
                    </span>
                    <span className="font-mono text-muted-foreground">{Math.max(62, 90 - i * 9)}% match</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-border bg-card space-y-2.5">
            <div>
              <p className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1.5 mb-1">
                <CheckCircle className="h-3.5 w-3.5" /> Strengths
              </p>
              <ul className="space-y-0.5">
                {a.strengths.slice(0, 4).map(s => (
                  <li key={s} className="text-xs text-muted-foreground flex gap-1.5">
                    <span className="text-green-500">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium text-orange-500 flex items-center gap-1.5 mb-1">
                <ArrowUp className="h-3.5 w-3.5" /> Improvements
              </p>
              <ul className="space-y-0.5">
                {a.improvements.slice(0, 4).map(s => (
                  <li key={s} className="text-xs text-muted-foreground flex gap-1.5">
                    <span className="text-orange-500">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    }

    if (msg.kind === 'jobs' && msg.jobs) {
      return (
        <div className="space-y-2.5 w-full max-w-2xl">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <FileSearch className="h-3.5 w-3.5" /> Live listings — {msg.jobs.length} found
          </p>
          {msg.jobs.map((job, i) => (
            <motion.div
              key={`${job.title}-${job.company}-${i}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="overflow-hidden hover:border-primary/40 transition-colors">
                <CardContent className="p-3.5">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{job.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{job.company}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {typeof job.matchScore === 'number' && (
                            <Badge
                              variant={job.matchScore >= 75 ? 'success' : job.matchScore >= 50 ? 'warning' : 'outline'}
                              size="sm"
                              className="shrink-0"
                            >
                              {job.matchScore}% match
                            </Badge>
                          )}
                          <Badge variant="outline" size="sm" className="shrink-0">{job.source}</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{job.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" /> {job.postedDate}
                        </span>
                        {job.url && job.url !== '#' && (
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto flex items-center gap-1 text-primary hover:underline font-medium"
                          >
                            Apply <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      );
    }

    return (
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{renderInline(msg.content || '')}</p>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border bg-gradient-to-r from-primary/10 via-purple-500/10 to-transparent">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/25">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold">AURA Career Coach</p>
              <Badge variant="primary" size="sm">
                <Brain className="h-3 w-3 mr-1" /> AI
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online · ATS expert & job matcher
            </p>
          </div>
          <button
            onClick={resetConversation}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Start a new session"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="h-[480px] overflow-y-auto px-4 py-5 space-y-4 bg-gradient-to-b from-background to-muted/30 scrollbar-thin"
        >
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn('flex gap-2.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {msg.role === 'bot' && (
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-3',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-card border border-border rounded-bl-md shadow-sm'
                )}
              >
                {renderMessage(msg)}
              </div>
              {msg.role === 'user' && (
                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}

          {/* Paste text input */}
          <AnimatePresence>
            {isPastedMode && !isBusy && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex gap-2.5"
              >
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 max-w-[85%]">
                  <textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder={
                      pasteContext === 'job'
                        ? 'Paste the job description here...'
                        : 'Paste your resume text here... (at least a few lines)'
                    }
                    rows={6}
                    className="w-full p-3 rounded-xl border border-border bg-card text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 resize-y scrollbar-thin"
                  />
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsPastedMode(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={handlePastedAnalyze} disabled={!pastedText.trim()}>
                      <Wand2 className="h-3.5 w-3.5 mr-1" />
                      {pasteContext === 'job' ? 'Score It' : 'Analyze'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload zone */}
          <AnimatePresence>
            {!isPastedMode && !isUploading && !analysis && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex justify-start"
              >
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="ml-2 flex-1 max-w-[85%] p-5 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/60 transition-colors cursor-pointer text-center"
                >
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="h-6 w-6 text-primary" />
                      <div className="text-left">
                        <p className="text-sm font-medium">{fileName}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB — click to change</p>
                      </div>
                      <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); handleAnalyze(); }} isLoading={isUploading}>
                        {isUploading ? 'Analyzing...' : 'Analyze'}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <Upload className="h-6 w-6 text-primary" />
                      <p className="text-sm font-medium">Drop your resume here or click to browse</p>
                      <p className="text-xs text-muted-foreground">PDF or DOCX</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick replies + input */}
        <div className="p-3 border-t border-border bg-card/60">
          {quickReplies.length > 0 && !isBusy && (
            <div className="flex flex-wrap gap-2 mb-3">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => handleQuickReply(reply)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-xs font-medium text-primary hover:bg-primary/15 hover:scale-[1.03] transition-all"
                >
                  <Sparkles className="h-3 w-3" />
                  {reply}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isBusy}
              className="h-9 w-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors shrink-0 disabled:opacity-50"
              title="Attach a resume"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={isBusy ? 'AURA is working on it...' : 'Ask me anything about your career...'}
                disabled={isBusy}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isBusy && chatInput.trim()) {
                    const value = chatInput.trim();
                    setChatInput('');
                    if (value.toLowerCase().includes('job') || value.toLowerCase().includes('match')) {
                      handleFetchJobs();
                    } else {
                      appendMessage({ id: nextId(), role: 'user', kind: 'text', content: value });
                      setIsBusy(true);
                      setQuickReplies([]);
                      const typingId = botTyping();
                      sleep(1000).then(() => {
                        replaceTyping(typingId, {
                          kind: 'text',
                          content:
                            'I\'m focused on resume analysis and job matching right now. Try one of these: **Find matching jobs**, **Improve my summary**, **Show ATS gaps**, or upload a new resume.',
                        });
                        setQuickReplies(['Find matching jobs', 'Improve my summary', 'Show ATS gaps', 'New resume analysis']);
                        setIsBusy(false);
                      });
                    }
                  }
                }}
                className={cn(
                  'w-full h-9 px-3.5 pr-2 rounded-xl border text-sm transition-all outline-none',
                  'bg-muted/40 border-border placeholder:text-muted-foreground',
                  'focus:border-primary/50 focus:ring-2 focus:ring-primary/20',
                  isBusy && 'opacity-60'
                )}
              />
            </div>
            <button
              disabled={isBusy || !chatInput.trim()}
              onClick={() => {
                const value = chatInput.trim();
                setChatInput('');
                if (value.toLowerCase().includes('job') || value.toLowerCase().includes('match')) {
                  handleFetchJobs();
                } else {
                  appendMessage({ id: nextId(), role: 'user', kind: 'text', content: value });
                  setIsBusy(true);
                  setQuickReplies([]);
                  const typingId = botTyping();
                  sleep(1000).then(() => {
                    replaceTyping(typingId, {
                      kind: 'text',
                      content:
                        'I\'m focused on resume analysis and job matching right now. Try one of these: **Find matching jobs**, **Improve my summary**, **Show ATS gaps**, or upload a new resume.',
                    });
                    setQuickReplies(['Find matching jobs', 'Improve my summary', 'Show ATS gaps', 'New resume analysis']);
                    setIsBusy(false);
                  });
                }
              }}
              className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send"
            >
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Try: "Find matching jobs" · "Improve my summary" · "Score against a job description"
          </p>
        </div>
      </Card>
    </div>
  );
};
