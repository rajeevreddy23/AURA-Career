'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Volume2, VolumeX, Mic, MicOff, Send, Code, Terminal,
  Cpu, Copy, Check, Loader2, ExternalLink, Bot, ArrowDown, X,
  FileText, Users, MessageSquare, Download, Share2, BookOpen,
  Headphones, Globe, Phone, PhoneOff, Lightbulb, Award,
  ChevronDown, ChevronUp, Eye, Zap, Brain, Settings, SlidersHorizontal,
  CheckCircle2, XCircle, RotateCcw, HelpCircle, Layers,
} from 'lucide-react';
import { AIProfessorAvatar, ProfessorState } from '@/components/classroom/AIProfessorAvatar';
import { ExitClassModal } from '@/components/classroom/ExitClassModal';
import { useClassroomState } from '@/hooks/useClassroomState';
import { useAuth } from '@/contexts/AuthContext';
import { playAuraVoice, stopAllVoicePlayback, sanitizeSpeechText } from '@/lib/ai/voice';
import MermaidChart from '@/components/classroom/MermaidChart';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface ConceptFeedItem {
  id: string;
  type: 'concept' | 'qna' | 'system';
  title: string;
  topic: string;
  explanation: string;
  code?: string;
  output?: string;
  speech?: string;
  memoryInsight?: string;
  suggestedFollowUp?: string;
  nextConcept?: { title: string; teaser: string };
  timestamp: string;
}

interface PDFNote {
  id: string;
  title: string;
  content: string;
  code?: string;
  timestamp: string;
}

interface GroupChatMessage {
  id: string;
  username: string;
  text: string;
  time: string;
  isMe: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Markdown Renderer
// ─────────────────────────────────────────────────────────────────────────────
function renderInlineSpans(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="font-bold text-purple-200">{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className="bg-purple-950/90 text-purple-300 px-1.5 py-0.5 rounded font-mono text-[11.5px] border border-purple-800/60">{part.slice(1, -1)}</code>;
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i} className="italic text-slate-300">{part.slice(1, -1)}</em>;
    return part;
  });
}

function renderFormattedText(text: string, onCopySnippet?: (code: string) => void) {
  // Handle code blocks (including mermaid)
  const sections = text.split(/(```[\s\S]*?```)/g);
  return sections.map((section, sidx) => {
    if (section.startsWith('```')) {
      const match = section.match(/```(\w+)?\n?([\s\S]*?)```/);
      const lang = (match?.[1] || 'code').toLowerCase();
      const code = (match?.[2] || '').trim();

      // If Mermaid flowchart, render through MermaidChart
      if (lang === 'mermaid') {
        return <MermaidChart key={sidx} chart={code} />;
      }

      return (
        <div key={sidx} className="my-3.5 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden group">
          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[11px] font-mono text-purple-300 font-bold uppercase tracking-wider">{lang}</span>
            </div>
            {onCopySnippet && (
              <button
                onClick={() => onCopySnippet(code)}
                className="flex items-center space-x-1 text-[11px] font-mono text-slate-400 hover:text-purple-300 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 transition"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Code</span>
              </button>
            )}
          </div>
          <pre className="p-4 text-xs font-mono text-purple-200 overflow-x-auto leading-relaxed whitespace-pre-wrap">
            <code>{code}</code>
          </pre>
        </div>
      );
    }

    // Normal text lines, callouts, and lists
    const lines = section.split('\n');
    return (
      <div key={sidx} className="space-y-1">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-2" />;

          // Callout boxes: > ...
          if (line.startsWith('>')) {
            const content = line.replace(/^>\s*/, '');
            const isTip = content.includes('💡') || content.toLowerCase().includes('tip');
            const isWarn = content.includes('⚠️') || content.toLowerCase().includes('trap') || content.toLowerCase().includes('warning');
            return (
              <div
                key={idx}
                className={`my-3 p-3.5 rounded-xl border flex items-start space-x-3 text-xs leading-relaxed ${
                  isWarn
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    : isTip
                    ? 'bg-purple-950/40 border-purple-500/40 text-purple-200'
                    : 'bg-slate-900/60 border-slate-700 text-slate-200'
                }`}
              >
                <div className="shrink-0 text-base">{isWarn ? '⚠️' : isTip ? '💡' : '📌'}</div>
                <div className="flex-1">{renderInlineSpans(content)}</div>
              </div>
            );
          }

          // Headers
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-purple-300 text-sm mt-4 mb-1.5 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>{line.slice(4)}</span>
              </h4>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h3 key={idx} className="font-extrabold text-white text-base mt-5 mb-2 pb-1 border-b border-purple-500/20 flex items-center gap-2">
                <span>{line.slice(3)}</span>
              </h3>
            );
          }
          if (line.startsWith('# ')) {
            return <h2 key={idx} className="font-extrabold text-white text-lg mt-6 mb-3">{line.slice(2)}</h2>;
          }

          // Bullet and numbered lists
          if (line.match(/^[\*\-•]\s/)) {
            return (
              <div key={idx} className="flex items-start space-x-2 my-1">
                <span className="text-purple-400 mt-1 shrink-0 font-bold">•</span>
                <span className="text-slate-200 text-sm leading-relaxed">{renderInlineSpans(line.replace(/^[\*\-•]\s/, ''))}</span>
              </div>
            );
          }
          if (line.match(/^\d+\.\s/)) {
            const m = line.match(/^(\d+)\.\s(.*)/);
            return (
              <div key={idx} className="flex items-start space-x-2.5 my-1.5">
                <span className="text-purple-300 font-mono text-xs font-bold shrink-0 mt-0.5 bg-purple-950/90 border border-purple-800/60 px-2 py-0.5 rounded-full">
                  {m?.[1]}
                </span>
                <span className="text-slate-200 text-sm leading-relaxed">{renderInlineSpans(m?.[2] || '')}</span>
              </div>
            );
          }

          return <p key={idx} className="my-1.5 text-slate-200 text-sm leading-relaxed">{renderInlineSpans(line)}</p>;
        })}
      </div>
    );
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function LiveClassroomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const urlCourseId = searchParams.get('courseId') || searchParams.get('course') || '1';

  const { session, currentModule, currentSlide, setAIState, setVoiceGender, addChatMessage } = useClassroomState(urlCourseId);

  // ── Feed & Input State
  const [feedItems, setFeedItems] = useState<ConceptFeedItem[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isProfessorThinking, setIsProfessorThinking] = useState(false);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // ── Voice & Advanced Classroom State
  const [voiceGenderState, setLocalVoiceGender] = useState<'female' | 'male'>('female');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);
  const [isMicListening, setIsMicListening] = useState(false);
  const [isFastMode, setIsFastMode] = useState(false);
  const [speechSpeed, setSpeechSpeed] = useState(1.0);

  const urlTeacherStyle = (searchParams.get('teacher') || searchParams.get('style') || 'friend').toLowerCase();
  const urlDifficulty = (searchParams.get('level') || searchParams.get('diff') || 'intermediate').toLowerCase();

  const [activeTeacherStyle, setActiveTeacherStyle] = useState<'professor' | 'coach' | 'friend' | 'expert' | 'simplifier'>(
    urlTeacherStyle.includes('coach') ? 'coach' : urlTeacherStyle.includes('friend') ? 'friend' : urlTeacherStyle.includes('expert') ? 'expert' : urlTeacherStyle.includes('simplifier') ? 'simplifier' : 'professor'
  );
  const [activeDifficulty, setActiveDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>(
    (urlDifficulty as any) || 'intermediate'
  );
  const [showCertModal, setShowCertModal] = useState(false);
  const [studentCertName, setStudentCertName] = useState(user?.displayName || user?.email?.split('@')[0] || 'Rajeev Reddy');

  // ── Advanced Modals State
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [liveQuizQuestions, setLiveQuizQuestions] = useState<any[]>([]);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [quizTitle, setQuizTitle] = useState('20-Question Live Diagnostic Quiz');

  // ── Live Quiz API Generator (20 Questions)
  const fetchLiveQuiz = async () => {
    setShowQuizModal(true);
    setIsQuizLoading(true);
    setQuizSubmitted(false);
    setQuizAnswers({});
    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentModule.moduleTitle || session.courseTitle || 'Core Concepts',
          courseTitle: session.courseTitle,
          chatHistory: feedItems.map((f) => ({ title: f.title, explanation: f.explanation })),
        }),
      });
      const data = await res.json();
      if (data?.questions && data.questions.length > 0) {
        setLiveQuizQuestions(data.questions);
        setQuizTitle(data.quizTitle || '20-Question Live Diagnostic Quiz');
      }
    } catch {
      toast.error('Failed to generate live quiz');
    } finally {
      setIsQuizLoading(false);
    }
  };

  // ── Right Panels
  const [rightPanel, setRightPanel] = useState<'none' | 'notes' | 'group'>('none');

  // ── PDF Notes
  const [pdfNotes, setPdfNotes] = useState<PDFNote[]>([]);

  const feedBottomRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<any>(null);
  const continuousRecogRef = useRef<any>(null);

  const hasLoadedLiveInitialLesson = useRef(false);

  // ── Initialize with Live AI Lesson (No static pre-baked slides)
  useEffect(() => {
    if (!hasLoadedLiveInitialLesson.current && currentSlide?.title && session.courseTitle) {
      hasLoadedLiveInitialLesson.current = true;
      const initialTopic = currentSlide.title;
      const initialModule = currentModule.moduleTitle || session.courseTitle;
      // Trigger live AI generation immediately
      handleSendQuestion(`Explain the complete core architecture of ${initialTopic} with a visual flowchart diagram, practical code, and under-the-hood execution mechanics.`);
    }
  }, [currentSlide, currentModule, session.courseTitle]);

  // ── Auto-scroll
  useEffect(() => {
    feedBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [feedItems, isProfessorThinking]);

  // ── Voice narration
  const speakText = useCallback((textToSpeak: string) => {
    if (!isVoiceEnabled || !textToSpeak) return;
    stopAllVoicePlayback();
    setIsPlayingSpeech(true);
    setAIState('speaking' as ProfessorState);
    playAuraVoice({
      text: sanitizeSpeechText(textToSpeak),
      gender: voiceGenderState,
      speed: speechSpeed,
      onStart: () => { setIsPlayingSpeech(true); setAIState('speaking' as ProfessorState); },
      onEnd: () => { setIsPlayingSpeech(false); setAIState('idle' as ProfessorState); },
      onError: () => { setIsPlayingSpeech(false); setAIState('idle' as ProfessorState); },
    });
  }, [isVoiceEnabled, voiceGenderState, speechSpeed, setAIState]);

  const handleSendQuestion = async (queryText?: string) => {
    const textToSend = (queryText || chatInput).trim();
    if (!textToSend || isProfessorThinking) return;
    setChatInput('');
    setIsProfessorThinking(true);
    setAIState('thinking' as ProfessorState);

    const qId = `q-${Date.now()}`;
    const userLabel = textToSend.startsWith('Explain the complete core architecture of') 
      ? `Topic Overview: ${currentSlide?.title || 'Core Architecture'}` 
      : textToSend;

    setFeedItems((prev) => [...prev, {
      id: qId,
      type: 'qna',
      title: userLabel.length > 55 ? userLabel.slice(0, 52) + '...' : userLabel,
      topic: currentModule.moduleTitle || 'Inquiry',
      explanation: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setExpandedItems((prev) => new Set([...prev, qId]));
    addChatMessage('user', textToSend);

    try {
      const res = await fetch('/api/ask-professor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          persona: activeTeacherStyle,
          courseTitle: session.courseTitle,
          currentTopic: currentModule.moduleTitle,
          difficulty: isFastMode ? 'turbo_fast' : activeDifficulty,
          // Multi-turn history like ChatGPT
          history: feedItems.slice(-8).map((f) => ({
            role: f.type === 'qna' ? 'user' : 'assistant',
            sender: f.type === 'qna' ? 'Student' : 'Professor Aura',
            text: f.explanation,
            content: f.explanation,
          })),
          currentSlide: {
            title: feedItems[feedItems.length - 1]?.title || currentSlide?.title || textToSend,
            explanation: feedItems[feedItems.length - 1]?.explanation || '',
            code: feedItems[feedItems.length - 1]?.code || '',
          },
        }),
      });

      const resJson = await res.json();
      const d = resJson.data || resJson;

      const aId = `a-${Date.now()}`;
      const answerTitle = textToSend.startsWith('Explain the complete core architecture of')
        ? (currentSlide?.title || 'Masterclass Overview')
        : (textToSend.length > 50 ? textToSend.slice(0, 47) + '...' : textToSend);

      const newItem: ConceptFeedItem = {
        id: aId,
        type: 'concept',
        title: answerTitle,
        topic: currentModule.moduleTitle || session.courseTitle || '',
        explanation: d.answer || 'Here is the step-by-step breakdown.',
        code: d.codeSnippet || undefined,
        output: d.output || undefined,
        speech: d.speech || undefined,
        memoryInsight: d.memoryInsight || undefined,
        suggestedFollowUp: d.suggestedFollowUp || undefined,
        nextConcept: d.nextConcept || undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setFeedItems((prev) => [...prev, newItem]);
      setExpandedItems((prev) => new Set([...prev, aId]));
      addChatMessage('professor', d.answer);
      setAIState('idle' as ProfessorState);

      setPdfNotes((prev) => [
        {
          id: `note-${Date.now()}`,
          title: answerTitle,
          content: d.answer,
          code: d.codeSnippet,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev,
      ]);

      if (isVoiceEnabled && d.speech) speakText(d.speech);
    } catch {
      toast.error('AI Professor is busy. Please retry.');
      setAIState('idle' as ProfessorState);
    } finally {
      setIsProfessorThinking(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { toast.error('Voice input not supported'); return; }
    if (isMicListening) { speechRecognitionRef.current?.stop(); setIsMicListening(false); return; }
    const r = new SpeechRecognition();
    r.continuous = false; r.interimResults = false; r.lang = 'en-US';
    r.onstart = () => { setIsMicListening(true); setAIState('listening' as ProfessorState); };
    r.onresult = (e: any) => { const t = e.results[0][0].transcript; setChatInput(t); };
    r.onend = () => { setIsMicListening(false); setAIState('idle' as ProfessorState); };
    r.onerror = () => { setIsMicListening(false); };
    speechRecognitionRef.current = r;
    r.start();
  };

  const downloadPDFNotes = () => {
    if (pdfNotes.length === 0) { toast.error('No notes yet! Ask a question first.'); return; }
    
    const notesHtml = pdfNotes.map((n, i) => `
      <div style="background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #374151; padding-bottom: 12px; margin-bottom: 16px;">
          <h3 style="margin: 0; font-size: 18px; color: #f59e0b; font-weight: 700;">Note ${i + 1}: ${n.title}</h3>
          <span style="font-family: monospace; font-size: 12px; color: #9ca3af; background: #1f2937; padding: 4px 10px; border-radius: 8px;">${n.timestamp}</span>
        </div>
        <div style="font-size: 14px; line-height: 1.7; color: #e5e7eb; white-space: pre-wrap; margin-bottom: 16px;">${n.content}</div>
        ${n.code ? `
          <div style="background: #030712; border: 1px solid #374151; border-radius: 12px; overflow: hidden; margin-top: 12px;">
            <div style="background: #1f2937; padding: 8px 16px; font-size: 12px; font-family: monospace; color: #c084fc; font-weight: bold;">💻 Code Example</div>
            <pre style="padding: 16px; margin: 0; font-family: monospace; font-size: 13px; color: #e9d5ff; overflow-x: auto; line-height: 1.5;"><code>${n.code}</code></pre>
          </div>
        ` : ''}
      </div>
    `).join('');

    const fullDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>AuraCareer Session Notes — ${session.courseTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #070b14; color: #f3f4f6; margin: 0; padding: 40px 20px; }
    .container { max-width: 800px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #1f2937; }
    .badge { display: inline-block; background: #a855f720; border: 1px solid #a855f760; color: #c084fc; font-size: 12px; font-weight: bold; font-family: monospace; padding: 6px 16px; border-radius: 20px; margin-bottom: 12px; text-transform: uppercase; }
    h1 { margin: 8px 0; font-size: 28px; color: #ffffff; }
    p.meta { margin: 0; font-size: 13px; color: #9ca3af; font-family: monospace; }
    .print-btn { display: inline-block; margin-top: 16px; background: #f59e0b; color: #000; font-weight: bold; font-size: 13px; border: none; padding: 10px 20px; border-radius: 12px; cursor: pointer; text-decoration: none; }
    @media print { .print-btn { display: none; } body { background: #fff; color: #000; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">🎓 AuraCareer University</div>
      <h1>${session.courseTitle}</h1>
      <p class="meta">Generated Session Notes • ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
      <button onclick="window.print()" class="print-btn">🖨️ Print / Save as PDF</button>
    </div>
    ${notesHtml}
  </div>
</body>
</html>`;

    const blob = new Blob([fullDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AURA_Notes_${session.courseTitle?.replace(/[^a-zA-Z0-9]/g, '_') || 'Session'}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Neat formatted notes exported!');
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippetId(id);
    toast.success('Code copied!');
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  const voiceGenderLabel = voiceGenderState === 'female' ? 'Bekki (♀)' : 'Ben (♂)';

  return (
    <div className="h-screen w-screen bg-[#070b14] text-slate-100 flex flex-col overflow-hidden font-sans">

      {/* ═══ TOP HEADER BAR ═══ */}
      <header className="h-16 bg-slate-900/95 border-b border-slate-800 px-4 flex items-center justify-between z-30 shrink-0 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">LIVE</span>
          <div className="h-4 w-px bg-slate-700 hidden sm:block" />
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-white truncate max-w-[280px] md:max-w-md">{session.courseTitle}</h1>
            <p className="text-[10px] text-purple-300 font-mono">{currentModule.moduleTitle || 'Interactive Session'}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Teacher Style Persona Pill Switcher */}
          <div className="hidden lg:flex bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
            {[
              { id: 'friend', label: '🤝 Friend' },
              { id: 'coach', label: '⚡ Coach' },
              { id: 'professor', label: '🎓 Prof' },
              { id: 'expert', label: '🧠 Expert' },
              { id: 'simplifier', label: '💡 Simple' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTeacherStyle(t.id as any);
                  toast.success(`Switched AI Teacher style & avatar outfit to ${t.label}`);
                }}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                  activeTeacherStyle === t.id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Teaching Difficulty Level Switcher */}
          <div className="hidden xl:flex bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
            {[
              { id: 'beginner', label: '🟢 Beg' },
              { id: 'intermediate', label: '🟡 Int' },
              { id: 'advanced', label: '🔴 Adv' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  setActiveDifficulty(d.id as any);
                  toast.success(`Teaching depth set to ${d.label}`);
                }}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                  activeDifficulty === d.id
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Teacher Voice Toggle */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
            {(['female', 'male'] as const).map((g) => (
              <button key={g} onClick={() => { setLocalVoiceGender(g); setVoiceGender(g); stopAllVoicePlayback(); toast.success(`Switched voice to ${g === 'female' ? '♀ Bekki' : '♂ Ben'}`); }}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${voiceGenderState === g ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                <span>{g === 'female' ? '♀ Bekki' : '♂ Ben'}</span>
              </button>
            ))}
          </div>

          {/* ⚡ Turbo Fast Mode Toggle */}
          <button onClick={() => { const next = !isFastMode; setIsFastMode(next); toast(next ? '⚡ Turbo Mode Activated' : '🎓 Switched to Deep Mode', { icon: next ? '⚡' : '🎓' }); }}
            className={`px-2.5 py-1.5 rounded-xl border transition flex items-center space-x-1.5 text-xs font-bold ${isFastMode ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
            title="Toggle Turbo Fast Replies vs Deep Masterclass Explanations">
            <Zap className={`w-3.5 h-3.5 ${isFastMode ? 'text-amber-400 fill-amber-400 animate-pulse' : ''}`} />
            <span className="hidden lg:inline">{isFastMode ? 'Turbo Fast' : 'Deep Mode'}</span>
          </button>

          {/* 🧪 AI Diagnostic Quiz Challenge Button (20 Live Questions) */}
          <button onClick={fetchLiveQuiz}
            className="px-2.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition flex items-center space-x-1.5 text-xs font-bold"
            title="Generate a live 20-question diagnostic quiz from present classroom chat">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">20-Q Quiz</span>
          </button>

          {/* 🎓 Download Course Certificate */}
          <button onClick={() => setShowCertModal(true)}
            className="px-2.5 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition flex items-center space-x-1.5 text-xs font-bold"
            title="View & Download Official Course Completion Certificate">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Certificate</span>
          </button>

          {/* 🔊 Audio Mute / Unmute */}
          <button onClick={() => { isVoiceEnabled ? (stopAllVoicePlayback(), setIsVoiceEnabled(false), toast('Muted', { icon: '🔇' })) : (setIsVoiceEnabled(true), toast.success('Voice enabled')); }}
            className={`p-2 rounded-xl border transition ${isVoiceEnabled ? 'bg-purple-500/15 border-purple-500/30 text-purple-300' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
            title={isVoiceEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}>
            {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* 📝 PDF Notes */}
          <button onClick={() => setRightPanel(rightPanel === 'notes' ? 'none' : 'notes')}
            className={`p-2 rounded-xl border transition flex items-center space-x-1.5 text-xs font-bold ${rightPanel === 'notes' ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'}`}
            title="Session Notes">
            <FileText className="w-4 h-4" />
            <span className="hidden xl:inline">Notes</span>
            {pdfNotes.length > 0 && <span className="bg-amber-500 text-slate-950 text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{pdfNotes.length}</span>}
          </button>

          {/* 💻 Coding Lab */}
          <Link href={`/coding-lab?courseId=${urlCourseId}`}
            className="px-2.5 py-1.5 rounded-xl border border-purple-500/30 bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 transition hidden md:flex items-center space-x-1.5 text-xs font-bold"
            title="Open Interactive Coding Lab">
            <Code className="w-3.5 h-3.5 text-purple-400" />
            <span>Code Lab</span>
          </Link>

          {/* ⚙️ Classroom Control Center */}
          <button onClick={() => setShowSettingsModal(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Classroom Control Center">
            <SlidersHorizontal className="w-4 h-4 text-purple-400" />
          </button>

          {/* ❌ Exit Class */}
          <button onClick={() => setShowExitModal(true)} className="p-2 rounded-xl bg-slate-800 hover:bg-red-950/60 hover:text-red-300 text-slate-400 border border-slate-700 transition" title="Exit Classroom">
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ═══ MAIN AREA ═══ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── LEFT: Concept Feed ── */}
        <div className={`flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 py-6 space-y-5 pb-40 ${rightPanel !== 'none' ? 'max-w-3xl' : 'max-w-5xl'} mx-auto w-full`}>

          {feedItems.map((item) => {
            const isExpanded = expandedItems.has(item.id);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`rounded-3xl border shadow-2xl overflow-hidden ${
                  item.type === 'qna'
                    ? 'bg-purple-950/30 border-purple-600/40 ml-auto max-w-2xl w-full'
                    : 'bg-slate-900/90 border-slate-800'
                }`}
              >
                {/* Card header — always visible, click to expand/collapse */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-800/30 transition"
                  onClick={() => toggleExpand(item.id)}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`p-1.5 rounded-xl border ${item.type === 'qna' ? 'bg-purple-500/15 border-purple-500/30 text-purple-400' : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'}`}>
                      {item.type === 'qna' ? <Bot className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    </span>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-white leading-snug truncate max-w-xs sm:max-w-md">{item.title}</h2>
                      <span className="text-[10px] font-mono text-slate-500">{item.topic} • {item.timestamp}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.speech && (
                      <button onClick={(e) => { e.stopPropagation(); speakText(item.speech!); }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-900/60 text-purple-300 border border-slate-700 transition" title="Listen">
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Expandable content */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="px-5 pb-6 space-y-4 overflow-hidden"
                    >
                      {/* Full explanation */}
                      <div className="space-y-1 select-text">
                        {renderFormattedText(item.explanation, (code) => copyCode(code, item.id))}
                      </div>

                      {/* Stand-alone code block (if not inlined in explanation) */}
                      {item.code && !item.explanation.includes('```') && (
                        <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
                            <div className="flex items-center space-x-2">
                              <Terminal className="w-3.5 h-3.5 text-purple-400" />
                              <span className="text-xs font-mono font-bold text-slate-300">Code Example</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button onClick={() => copyCode(item.code!, item.id)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono flex items-center space-x-1 transition">
                                {copiedSnippetId === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedSnippetId === item.id ? 'Copied' : 'Copy'}</span>
                              </button>
                              <Link href={`/coding-lab?courseId=${urlCourseId}`}
                                className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold flex items-center space-x-1 transition">
                                <ExternalLink className="w-3 h-3" />
                                <span>Try in Lab</span>
                              </Link>
                            </div>
                          </div>
                          <pre className="p-4 text-xs font-mono text-purple-200 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                            <code>{item.code}</code>
                          </pre>
                          {item.output && (
                            <div className="px-4 py-2.5 bg-slate-900/60 border-t border-slate-800 text-[11px] font-mono text-emerald-300">
                              <span className="text-slate-500 select-none">▶ Output: </span>{item.output}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Memory / Performance Insight */}
                      {item.memoryInsight && (
                        <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-xs text-purple-200 flex items-center space-x-2">
                          <Cpu className="w-4 h-4 text-purple-400 shrink-0" />
                          <span className="font-mono">{item.memoryInsight}</span>
                        </div>
                      )}

                      {/* Suggested Follow-up */}
                      {item.suggestedFollowUp && (
                        <button
                          onClick={() => handleSendQuestion(item.suggestedFollowUp)}
                          disabled={isProfessorThinking}
                          className="w-full text-left p-3 rounded-2xl bg-slate-950/80 border border-slate-700 hover:border-purple-500/50 text-xs text-slate-300 hover:text-white transition flex items-center space-x-2"
                        >
                          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>💡 <strong>Suggested:</strong> {item.suggestedFollowUp}</span>
                        </button>
                      )}

                      {/* Next Concept Roadmap */}
                      {item.nextConcept && (
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/50 via-slate-950 to-indigo-950/50 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">🧭 EXPLORE NEXT</span>
                            <h3 className="text-sm font-bold text-white">{item.nextConcept.title}</h3>
                            <p className="text-xs text-slate-400">{item.nextConcept.teaser}</p>
                          </div>
                          <button
                            onClick={() => handleSendQuestion(`Explain in full detail: ${item.nextConcept!.title}. ${item.nextConcept!.teaser}`)}
                            disabled={isProfessorThinking}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition shadow-md flex items-center space-x-1.5 shrink-0"
                          >
                            <span>Go Deeper</span>
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {/* AI Thinking indicator */}
          {isProfessorThinking && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/90 border border-purple-500/40 rounded-3xl p-5 flex items-center space-x-3 shadow-xl max-w-sm"
            >
              <AIProfessorAvatar state="thinking" size="sm" teacherStyle={activeTeacherStyle} />
              <div>
                <p className="text-xs font-bold text-white">Preparing full concept explanation...</p>
                <p className="text-[11px] font-mono text-purple-300 mt-0.5">Generating complete analysis with code</p>
              </div>
            </motion.div>
          )}

          <div ref={feedBottomRef} />
        </div>

        {/* ── RIGHT PANEL: Notes / Group Chat ── */}
        <AnimatePresence>
          {rightPanel !== 'none' && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="border-l border-slate-800 bg-slate-950/90 flex flex-col overflow-hidden shrink-0"
            >
              {/* Panel header */}
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {rightPanel === 'notes' && <><FileText className="w-4 h-4 text-amber-400" /><span className="font-bold text-sm text-white">Session Notes ({pdfNotes.length})</span></>}
                  {rightPanel === 'group' && <><Users className="w-4 h-4 text-blue-400" /><span className="font-bold text-sm text-white">Group Study Chat</span></>}
                </div>
                <div className="flex items-center space-x-2">
                  {rightPanel === 'notes' && (
                    <button onClick={downloadPDFNotes} className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center space-x-1 transition">
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  )}
                  <button onClick={() => setRightPanel('none')} className="p-1 text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* PDF Notes Panel */}
              {rightPanel === 'notes' && (
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {pdfNotes.length === 0 ? (
                    <div className="text-center text-slate-500 text-xs mt-10 space-y-2">
                      <FileText className="w-10 h-10 mx-auto text-slate-700" />
                      <p>Ask questions to auto-generate notes.</p>
                      <p className="text-slate-600">Every answer is saved here.</p>
                    </div>
                  ) : pdfNotes.map((note) => (
                    <div key={note.id} className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-amber-300 truncate max-w-[200px]">{note.title}</h4>
                        <span className="text-[9px] font-mono text-slate-500">{note.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-4">{note.content.slice(0, 200)}...</p>
                      {note.code && (
                        <pre className="text-[10px] font-mono text-purple-300 bg-slate-950 rounded-lg p-2 overflow-x-auto max-h-20">
                          {note.code.slice(0, 150)}...
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ FLOATING AVATAR (bottom-right corner) ═══ */}
      <div className="fixed bottom-32 right-4 z-50 hidden lg:flex flex-col items-center">
        <AIProfessorAvatar
          state={isPlayingSpeech ? 'speaking' : isProfessorThinking ? 'thinking' : 'idle'}
          size="md"
          teacherStyle={activeTeacherStyle}
        />
        <div className="mt-1 text-[10px] font-mono font-bold text-center" style={{ color: '#a855f7' }}>
          {voiceGenderState === 'female' ? 'Bekki' : 'Ben'}
        </div>
      </div>

      {/* ═══ BOTTOM INPUT BAR ═══ */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/95 border-t border-slate-800 p-3 z-40 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Suggestion chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[10px] text-slate-500 font-mono shrink-0">Quick:</span>
            {[
              'Explain the full core process',
              'Show complete production code example',
              'What are all the real-world use cases?',
              'Explain the security architecture',
              'Walk me through line by line',
            ].map((chip) => (
              <button key={chip} onClick={() => handleSendQuestion(chip)} disabled={isProfessorThinking}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-purple-900/50 text-slate-300 hover:text-white border border-slate-700 text-[11px] shrink-0 transition whitespace-nowrap">
                {chip}
              </button>
            ))}
          </div>

          {/* Input row */}
          <form onSubmit={(e) => { e.preventDefault(); handleSendQuestion(); }} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask any question — e.g. 'Explain HTTPS in full detail with code'..."
                disabled={isProfessorThinking}
                className="w-full bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-2xl pl-4 pr-12 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              <button type="button" onClick={toggleMic}
                className={`absolute right-3 top-2.5 p-1.5 rounded-xl transition ${isMicListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                {isMicListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
            </div>
            <button type="submit" disabled={!chatInput.trim() || isProfessorThinking}
              className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-lg transition flex items-center space-x-1.5 shrink-0">
              <Send className="w-4 h-4" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </footer>

      {/* ═══ AI DIAGNOSTIC QUIZ CHALLENGE MODAL (20 Live Questions) ═══ */}
      <AnimatePresence>
        {showQuizModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{quizTitle}</h3>
                    <p className="text-xs text-emerald-300 font-mono">20 Live Questions Generated From Current Lesson</p>
                  </div>
                </div>
                <button onClick={() => { setShowQuizModal(false); setQuizSubmitted(false); setQuizAnswers({}); }} className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quiz Body */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
                {isQuizLoading ? (
                  <div className="py-16 flex flex-col items-center justify-center space-y-3">
                    <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
                    <p className="text-sm font-bold text-white">Generating 20 custom questions from your chat feed...</p>
                    <p className="text-xs text-slate-400 font-mono">Analyzing classroom concepts & code snippets</p>
                  </div>
                ) : liveQuizQuestions.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <HelpCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                    <p className="text-sm font-bold text-white">Ready for your Diagnostic Quiz?</p>
                    <button onClick={fetchLiveQuiz} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition">
                      Generate 20 Questions Now
                    </button>
                  </div>
                ) : (
                  liveQuizQuestions.map((item, qIdx) => (
                    <div key={item.id || qIdx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                      <p className="text-xs font-bold text-slate-100 flex items-start space-x-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono shrink-0">Q{qIdx + 1}</span>
                        <span>{item.question}</span>
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {item.options.map((opt: string, oIdx: number) => {
                          const isSelected = quizAnswers[qIdx] === oIdx;
                          const isCorrectOption = oIdx === item.correctIndex;
                          let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';

                          if (quizSubmitted) {
                            if (isCorrectOption) {
                              btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                            } else if (isSelected) {
                              btnStyle = 'bg-red-500/20 border-red-500 text-red-300 font-bold';
                            }
                          } else if (isSelected) {
                            btnStyle = 'bg-purple-600/30 border-purple-500 text-white font-bold';
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => !quizSubmitted && setQuizAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))}
                              disabled={quizSubmitted}
                              className={`w-full text-left p-3 rounded-xl text-xs font-mono transition border ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {quizSubmitted && item.explanation && (
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
                          💡 <strong>Explanation:</strong> {item.explanation}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Modal Footer */}
              {!isQuizLoading && liveQuizQuestions.length > 0 && (
                <div className="pt-4 border-t border-slate-800 flex justify-between items-center shrink-0">
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    {quizSubmitted
                      ? `Score: ${liveQuizQuestions.reduce((acc, q, idx) => (quizAnswers[idx] === q.correctIndex ? acc + 1 : acc), 0)} / ${liveQuizQuestions.length} (${Math.round((liveQuizQuestions.reduce((acc, q, idx) => (quizAnswers[idx] === q.correctIndex ? acc + 1 : acc), 0) / liveQuizQuestions.length) * 100)}%)`
                      : `Answered ${Object.keys(quizAnswers).length} of ${liveQuizQuestions.length} questions`}
                  </span>
                  <div className="flex space-x-2">
                    {!quizSubmitted ? (
                      <button onClick={() => { setQuizSubmitted(true); toast.success('Quiz Submitted! Check your score 🎉'); }}
                        disabled={Object.keys(quizAnswers).length === 0}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition">
                        Submit Answers
                      </button>
                    ) : (
                      <button onClick={fetchLiveQuiz}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5">
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Generate New 20 Questions</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ CLASSROOM CONTROL CENTER MODAL ═══ */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-purple-500/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <SlidersHorizontal className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Classroom Control Center</h3>
                    <p className="text-xs text-purple-300 font-mono">Customize speech speed, AI persona & preferences</p>
                  </div>
                </div>
                <button onClick={() => setShowSettingsModal(false)} className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Speech Speed Multiplier */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-200">AI Speech Speed Multiplier</span>
                    <span className="text-xs font-mono font-bold text-purple-400">{speechSpeed}x</span>
                  </div>
                  <div className="flex space-x-2">
                    {[0.8, 1.0, 1.25, 1.5].map((spd) => (
                      <button key={spd} onClick={() => { setSpeechSpeed(spd); toast.success(`Speech speed set to ${spd}x`); }}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-mono font-bold transition border ${speechSpeed === spd ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voice Gender Switch */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Selected Professor Voice</h4>
                    <p className="text-[11px] text-slate-400">Bekki (Sweet) or Ben (Deep Bass)</p>
                  </div>
                  <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                    {(['female', 'male'] as const).map((g) => (
                      <button key={g} onClick={() => { setLocalVoiceGender(g); setVoiceGender(g); stopAllVoicePlayback(); toast.success(`Voice set to ${g === 'female' ? '♀ Bekki' : '♂ Ben'}`); }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${voiceGenderState === g ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>
                        {g === 'female' ? '♀ Bekki' : '♂ Ben'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button onClick={() => setShowSettingsModal(false)} className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold transition">
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ OFFICIAL COURSE COMPLETION CERTIFICATE MODAL ═══ */}
      <AnimatePresence>
        {showCertModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Course Completion Certificate</h3>
                    <p className="text-xs text-amber-300 font-mono">Official AuraCareer Certification</p>
                  </div>
                </div>
                <button onClick={() => setShowCertModal(false)} className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Certificate Card Preview */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/40 border-2 border-amber-500/30 text-center space-y-4 shadow-xl relative">
                <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-mono text-[11px] font-bold border border-amber-500/30 uppercase tracking-widest">
                  OFFICIAL DIPLOMA
                </div>
                <p className="text-xs text-slate-400 font-mono uppercase">This certifies that</p>
                <input
                  type="text"
                  value={studentCertName}
                  onChange={(e) => setStudentCertName(e.target.value)}
                  className="text-xl font-extrabold text-amber-300 bg-slate-950/80 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-2 text-center w-full focus:outline-none"
                />
                <p className="text-xs text-slate-300">has successfully completed the interactive mastery course on</p>
                <h2 className="text-lg font-bold text-white">{session.courseTitle}</h2>
                <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>Grade: A+ (Honors)</span>
                  <span>Date: {new Date().toLocaleDateString()}</span>
                  <span>ID: AURACAREER-CERT-{urlCourseId}-8924</span>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-mono">Click name above to edit</span>
                <button
                  onClick={() => {
                    const doc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>AuraCareer Certificate — ${studentCertName}</title>
  <style>
    body { font-family: 'Segoe UI', Roboto, sans-serif; background: #070b14; color: #fff; text-align: center; padding: 60px 40px; }
    .cert { max-width: 800px; margin: 0 auto; border: 4px double #f59e0b; padding: 50px; background: #0f172a; border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
    h1 { font-size: 32px; color: #f59e0b; letter-spacing: 2px; }
    h2 { font-size: 26px; color: #38bdf8; margin: 20px 0; }
    p { font-size: 16px; color: #94a3b8; }
    .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; color: #64748b; font-family: monospace; }
  </style>
</head>
<body>
  <div class="cert">
    <p>AURACAREER UNIVERSITY</p>
    <h1>CERTIFICATE OF MASTERY</h1>
    <p>This certifies that</p>
    <h2>${studentCertName}</h2>
    <p>has demonstrated exceptional comprehension and successfully completed</p>
    <h3>${session.courseTitle}</h3>
    <div class="footer">
      <span>Grade: A+ (Honors)</span>
      <span>Date: ${new Date().toLocaleDateString()}</span>
      <span>Verification ID: AURACAREER-CERT-${urlCourseId}-8924</span>
    </div>
  </div>
  <script>window.print();</script>
</body>
</html>`;
                    const blob = new Blob([doc], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `AURA_Certificate_${studentCertName.replace(/\s+/g, '_')}.html`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success('Certificate exported! Opening print dialog...');
                  }}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Certificate</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ExitClassModal isOpen={showExitModal} onClose={() => setShowExitModal(false)} courseTitle={session.courseTitle} />
    </div>
  );
}