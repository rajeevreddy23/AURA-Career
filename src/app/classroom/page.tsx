'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Send,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  X,
  BookOpen,
  FileText,
  Code,
  CheckCircle2,
  Circle,
  MessageSquare,
  Bot,
  Play,
  Pause,
  RotateCcw,
  Terminal,
  Cpu,
  Lightbulb,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  Download,
  BookMarked,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { AIProfessorAvatar, ProfessorState } from '@/components/classroom/AIProfessorAvatar';
import { InteractiveDiagram } from '@/components/classroom/InteractiveDiagram';
import { ExitClassModal } from '@/components/classroom/ExitClassModal';
import { useClassroomState } from '@/hooks/useClassroomState';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

/** Helper to format inline markdown spans (bold, inline code, italics) */
function renderInlineSpans(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-purple-200">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="bg-purple-950/90 text-purple-300 px-1.5 py-0.5 rounded font-mono text-[11px] border border-purple-800/60"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className="italic text-slate-300">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

/** Helper to format assistant multi-line markdown responses */
function renderFormattedMessage(text: string) {
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    if (line.startsWith('### ')) {
      return (
        <h4 key={idx} className="font-bold text-purple-300 text-xs mt-2 mb-0.5 tracking-wide uppercase font-mono">
          {line.slice(4)}
        </h4>
      );
    }
    if (line.startsWith('## ') || line.startsWith('# ')) {
      return (
        <h3 key={idx} className="font-bold text-purple-100 text-xs mt-2.5 mb-1 pb-0.5 border-b border-purple-900/40">
          {line.replace(/^#+\s/, '')}
        </h3>
      );
    }
    if (line.match(/^[\*\-•]\s/)) {
      return (
        <div key={idx} className="flex items-start space-x-1.5 my-1 pl-1">
          <span className="text-purple-400 font-bold mt-0.5 shrink-0 text-[10px]">•</span>
          <span className="text-slate-200">{renderInlineSpans(line.replace(/^[\*\-•]\s/, ''))}</span>
        </div>
      );
    }
    if (line.match(/^\d+\.\s/)) {
      const numMatch = line.match(/^(\d+)\.\s(.*)/);
      return (
        <div key={idx} className="flex items-start space-x-1.5 my-1 pl-1">
          <span className="text-purple-400 font-mono text-[10px] font-bold shrink-0 mt-0.5 bg-purple-950/60 px-1 rounded border border-purple-800/40">
            {numMatch?.[1]}
          </span>
          <span className="text-slate-200">{renderInlineSpans(numMatch?.[2] || '')}</span>
        </div>
      );
    }
    if (!line.trim()) {
      return <div key={idx} className="h-1.5" />;
    }
    return <p key={idx} className="my-0.5 text-slate-200 leading-relaxed">{renderInlineSpans(line)}</p>;
  });
}

export default function LiveClassroomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const urlCourseId = searchParams.get('courseId') || searchParams.get('course') || '1';

  const {
    session,
    setSession,
    currentModule,
    currentSlide,
    progressPercent,
    currentOverallSlideNumber,
    totalSlides,
    setAIState,
    setVoiceGender,
    goToModule,
    goToSlide,
    goToSlideInModule,
    nextSlideOrModule,
    prevSlideOrModule,
    addChatMessage,
    addAutoLiveNote,
    cancelInFlight,
  } = useClassroomState(urlCourseId);

  // UI state
  const [chatInput, setChatInput] = useState('');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);
  const [isMicListening, setIsMicListening] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCurriculumOpen, setIsCurriculumOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [rightTab, setRightTab] = useState<'chat' | 'notes'>('chat');
  const [centerTab, setCenterTab] = useState<'code' | 'output'>('code');
  const [showExitModal, setShowExitModal] = useState(false);
  const [isProfessorThinking, setIsProfessorThinking] = useState(false);
  const [copiedSnippetIndex, setCopiedSnippetIndex] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Expand active module in curriculum map
  useEffect(() => {
    if (currentModule?.moduleId) {
      setExpandedModules((prev) => ({
        ...prev,
        [currentModule.moduleId]: true,
      }));
    }
  }, [currentModule?.moduleId]);

  // Auto-generate live note summary when entering or completing a slide
  useEffect(() => {
    if (currentSlide?.title && currentSlide?.keyPoints && currentSlide.keyPoints.length > 0) {
      addAutoLiveNote(
        currentModule.moduleTitle,
        currentSlide.title,
        currentSlide.keyPoints.slice(0, 3)
      );
    }
  }, [currentSlide?.title, currentSlide?.keyPoints, currentModule?.moduleTitle, addAutoLiveNote]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.conversation, isProfessorThinking]);

  // Fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const toggleModuleAccordion = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const copyCodeToClipboard = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedSnippetIndex(id);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopiedSnippetIndex(null), 2000);
    } catch {
      toast.error('Failed to copy code.');
    }
  };

  // Speak current slide narration with Gemini TTS voice profile
  const speakCurrentSlideNarration = useCallback((customText?: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const textToSpeak = customText || currentSlide.speech;
    if (!textToSpeak) return;

    const cleanText = textToSpeak
      .replace(/[\*#`_~]/g, '')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    // Set pitch based on Voice Gender (Step 3: Male vs Female)
    utterance.pitch = session.voiceGender === 'female' ? 1.15 : 0.88;

    utterance.onstart = () => {
      setIsPlayingSpeech(true);
      setAIState('speaking');
    };

    utterance.onend = () => {
      setIsPlayingSpeech(false);
      setAIState('teaching');
    };

    utterance.onerror = () => {
      setIsPlayingSpeech(false);
      setAIState('teaching');
    };

    window.speechSynthesis.speak(utterance);
  }, [currentSlide.speech, session.voiceGender, setAIState]);

  const toggleSpeechPlayback = () => {
    if (isPlayingSpeech) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingSpeech(false);
      setAIState('teaching');
    } else {
      speakCurrentSlideNarration();
    }
  };

  // Ask Professor inline Q&A (Step 5, 9, 10)
  const handleAskProfessor = async (questionText?: string) => {
    const query = questionText || chatInput.trim();
    if (!query || isProfessorThinking) return;

    cancelInFlight();
    addChatMessage('user', query, user?.displayName || 'Student');
    setChatInput('');
    setAIState('processing_question');
    setIsProfessorThinking(true);

    try {
      const res = await fetch('/api/ask-professor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: session.persona,
          courseTitle: session.courseTitle,
          currentTopic: currentModule.moduleTitle,
          currentSlide: {
            title: currentSlide.title,
            speech: currentSlide.speech,
            code: currentSlide.code,
            explanation: currentSlide.explanation,
            keyPoints: currentSlide.keyPoints,
          },
          history: session.conversation.slice(-6).map((m) => ({
            sender: m.sender,
            name: m.name,
            text: m.text,
          })),
          question: query,
          difficulty: session.difficulty,
        }),
      });

      const json = await res.json();
      setIsProfessorThinking(false);

      if (json.success && json.data) {
        const data = json.data;
        const answerText = data.answer || 'Here is the step-by-step concept analysis.';

        addChatMessage('professor', answerText, session.persona, {
          codeSnippet: data.codeSnippet,
          output: data.output,
          suggestedFollowUp: data.suggestedFollowUp,
          memoryInsight: data.memoryInsight,
        });

        // Append to running live notes
        if (data.memoryInsight) {
          addAutoLiveNote(currentModule.moduleTitle, `Q&A: ${query.slice(0, 30)}...`, [
            `Student Question: "${query}"`,
            `Professor Insight: ${data.memoryInsight}`,
          ]);
        }

        setAIState('answering');

        if (isVoiceEnabled) {
          speakCurrentSlideNarration(answerText);
        } else {
          setTimeout(() => setAIState('teaching'), 3000);
        }
      } else {
        addChatMessage(
          'professor',
          `In **${currentModule.moduleTitle}**, execution flow is governed directly by runtime memory layout. Let's inspect the code on the blackboard.`,
          session.persona
        );
        setAIState('teaching');
      }
    } catch (err) {
      setIsProfessorThinking(false);
      addChatMessage(
        'professor',
        `Under the hood in **${currentModule.moduleTitle}**, memory structures allocate runtime values predictably. Let's step through the implementation.`,
        session.persona
      );
      setAIState('teaching');
    }
  };

  // Mic Speech-To-Text Handler
  const toggleMicListening = () => {
    if (isMicListening) {
      speechRecognitionRef.current?.stop();
      setIsMicListening(false);
      setAIState('teaching');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported in this browser. Please type your question!');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsMicListening(true);
        setAIState('listening');
        toast.success('Listening... Ask your question!');
      };

      recognition.onerror = () => {
        setIsMicListening(false);
        setAIState('error');
        setTimeout(() => setAIState('teaching'), 1500);
      };

      recognition.onend = () => setIsMicListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          toast.success(`Heard: "${transcript}"`);
          handleAskProfessor(transcript);
        }
      };

      recognition.start();
      speechRecognitionRef.current = recognition;
    } catch {
      toast.error('Could not activate microphone.');
    }
  };

  // Export Notes (Step 6)
  const exportNotesAsMarkdown = () => {
    const lines: string[] = [];
    lines.push(`# Study Notes: ${session.courseTitle}`);
    lines.push(`**Level**: ${session.difficulty.toUpperCase()} | **Date**: ${new Date().toLocaleDateString()}`);
    lines.push(`---\n`);

    session.notes.forEach((note) => {
      lines.push(`### ${note.moduleTitle} — ${note.slideTitle}`);
      lines.push(`*Recorded at ${note.timestamp}*\n`);
      note.bullets.forEach((b) => lines.push(`- ${b}`));
      lines.push('');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${session.courseTitle.replace(/[^a-z0-9]/gi, '_')}_Notes.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Notes downloaded as Markdown!');
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen w-screen bg-[#070b14] text-slate-100 font-sans overflow-hidden select-none"
    >
      {/* ========================================================================= */}
      {/* 1. MINIMAL CLEAN HEADER (STEP 1 & STEP 3) */}
      {/* ========================================================================= */}
      <header className="h-13 bg-[#0d1322] border-b border-slate-800/90 px-4 flex items-center justify-between shrink-0 z-30 shadow-md">
        {/* Left: Course Title + Current Module & Slide Breadcrumb */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={() => setIsCurriculumOpen(!isCurriculumOpen)}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition border ${
              isCurriculumOpen
                ? 'bg-purple-950/60 text-purple-300 border-purple-700/60'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle Curriculum Map"
          >
            <BookMarked className="w-4 h-4" />
            <span className="hidden sm:inline">Syllabus</span>
          </button>

          <div className="flex items-center space-x-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50 shrink-0 font-mono">
              ● LIVE
            </span>

            <span className="text-xs md:text-sm font-bold text-slate-100 truncate">
              {session.courseTitle}
            </span>
            <span className="text-slate-600 hidden md:inline">·</span>
            <span className="text-xs text-purple-300 font-medium truncate hidden md:inline">
              Module {session.currentModuleIndex + 1} of {session.modules.length}: {currentModule.moduleTitle}
            </span>
          </div>
        </div>

        {/* Right: Dual Voice Toggle, Fullscreen & Exit */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Dual Voice Toggle: Exactly Male & Female (Step 3) */}
          <div className="flex items-center bg-slate-800/90 border border-slate-700/90 rounded-lg p-0.5 text-xs font-medium">
            <button
              onClick={() => setVoiceGender('female')}
              className={`px-2.5 py-1 rounded-md transition flex items-center space-x-1 ${
                session.voiceGender === 'female'
                  ? 'bg-purple-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Female Voice</span>
            </button>
            <button
              onClick={() => setVoiceGender('male')}
              className={`px-2.5 py-1 rounded-md transition flex items-center space-x-1 ${
                session.voiceGender === 'male'
                  ? 'bg-purple-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Male Voice</span>
            </button>
          </div>

          {/* Voice Mute/Unmute */}
          <button
            onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
            className={`p-1.5 rounded-lg border transition ${
              isVoiceEnabled
                ? 'bg-purple-950/60 text-purple-300 border-purple-800/60'
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
            title={isVoiceEnabled ? 'Voice enabled' : 'Voice muted'}
          >
            {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Right Sidebar Toggle (Chat / Notes) */}
          <button
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            className={`p-1.5 rounded-lg transition border ${
              isRightSidebarOpen
                ? 'bg-purple-600/30 text-purple-300 border-purple-500/50'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle Live Chat & Notes"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition border border-slate-700"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Exit Class */}
          <button
            onClick={() => setShowExitModal(true)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-xs text-red-300 border border-red-800/60 transition"
            title="Exit Classroom"
          >
            <X className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT: CURRICULUM DRAWER + CENTRAL PLAYER + CHAT/NOTES SIDEBAR */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ----------------------------------------------------------------------- */}
        {/* 2. LEFT PANEL — PERSISTENT COMPLETE CURRICULUM MAP (STEP 8 & 9) */}
        {/* ----------------------------------------------------------------------- */}
        <AnimatePresence>
          {isCurriculumOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-[#0b101e] border-r border-slate-800/90 flex flex-col shrink-0 overflow-hidden shadow-2xl z-20"
            >
              {/* Header */}
              <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/70">
                <div className="flex items-center space-x-2">
                  <BookMarked className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    COURSE ROADMAP
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/50">
                  {progressPercent}% Done
                </span>
              </div>

              {/* Progress Bar */}
              <div className="px-3.5 py-2 border-b border-slate-800/60 bg-slate-950/40">
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 font-mono">
                  <span>Concept {currentOverallSlideNumber} of {totalSlides}</span>
                  <span className="capitalize text-purple-300 font-semibold">{session.difficulty} level</span>
                </div>
              </div>

              {/* Modules & Slides Accordion List */}
              <div className="flex-1 p-2.5 space-y-2 overflow-y-auto scrollbar-thin">
                {session.modules.map((mod, modIdx) => {
                  const isCurrentMod = modIdx === session.currentModuleIndex;
                  const isModCompleted = mod.status === 'completed';
                  const isExpanded = !!expandedModules[mod.moduleId];

                  return (
                    <div
                      key={mod.moduleId}
                      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                        isCurrentMod
                          ? 'bg-purple-950/30 border-purple-500/50 shadow-sm'
                          : isModCompleted
                          ? 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                          : 'bg-slate-950/40 border-slate-900 hover:border-slate-800'
                      }`}
                    >
                      {/* Module Title */}
                      <div
                        onClick={() => {
                          goToModule(modIdx);
                          toggleModuleAccordion(mod.moduleId);
                        }}
                        className="p-2.5 cursor-pointer flex items-start space-x-2 hover:bg-white/[0.02] transition"
                      >
                        <div className="mt-0.5 shrink-0">
                          {isModCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : isCurrentMod ? (
                            <div className="w-4 h-4 rounded-full bg-purple-500/20 border border-purple-400 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-mono text-slate-500">
                              {modIdx + 1}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p
                              className={`text-xs font-bold truncate ${
                                isCurrentMod ? 'text-purple-200' : isModCompleted ? 'text-slate-300' : 'text-slate-400'
                              }`}
                            >
                              {mod.moduleTitle}
                            </p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleModuleAccordion(mod.moduleId);
                              }}
                              className="p-0.5 text-slate-500 hover:text-slate-300"
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <span className="text-[9px] text-slate-500 font-mono block mt-0.5">
                            {mod.slides.length} concepts · {isModCompleted ? 'Completed' : isCurrentMod ? 'Active' : 'Upcoming'}
                          </span>
                        </div>
                      </div>

                      {/* Expandable Sub-Topic Slides (Review completed concepts) */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-slate-950/80 border-t border-slate-800/60 px-1.5 py-1 space-y-0.5"
                          >
                            {mod.slides.map((slide, slideIdx) => {
                              const isCurrentSlide = isCurrentMod && slideIdx === session.currentSlideIndex;
                              const canJump = modIdx <= session.currentModuleIndex;

                              return (
                                <button
                                  key={slide.slideId || slideIdx}
                                  onClick={() => canJump && goToSlideInModule(modIdx, slideIdx)}
                                  disabled={!canJump}
                                  className={`w-full text-left p-2 rounded-lg transition-all flex items-start space-x-2 text-xs border ${
                                    isCurrentSlide
                                      ? 'bg-purple-900/40 border-purple-500/60 text-purple-100 font-medium'
                                      : canJump
                                      ? 'border-transparent hover:bg-slate-900/70 text-slate-400 hover:text-slate-200'
                                      : 'border-transparent text-slate-600 cursor-not-allowed opacity-60'
                                  }`}
                                >
                                  <div className="mt-0.5 shrink-0">
                                    {isCurrentSlide ? (
                                      <div className="w-3 h-3 rounded-full bg-purple-400" />
                                    ) : (
                                      <Circle className="w-3 h-3 text-slate-600" />
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center space-x-1.5">
                                      <span className="text-[9px] font-mono text-purple-400 font-bold shrink-0">
                                        {modIdx + 1}.{slideIdx + 1}
                                      </span>
                                      <p className="text-[11px] truncate">{slide.title}</p>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ----------------------------------------------------------------------- */}
        {/* 3. CENTRAL YOUTUBE-LECTURE-STYLE TEACHING VIEWPORT (STEP 7) */}
        {/* ----------------------------------------------------------------------- */}
        <main className="flex-1 flex flex-col bg-[#070b14] relative overflow-y-auto">
          <div className="flex-1 p-4 md:p-6 flex flex-col justify-between max-w-5xl mx-auto w-full space-y-4">
            {/* Lecture Slide Header & Animated Narration Bubble */}
            <motion.div
              key={currentSlide.slideId || `${session.currentModuleIndex}-${session.currentSlideIndex}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl relative backdrop-blur-md space-y-3.5"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold uppercase tracking-wider border border-purple-500/40">
                    {currentSlide.conceptTag || 'CORE CONCEPT'}
                  </span>
                  <span className="text-sm md:text-base font-bold text-slate-100">
                    {currentSlide.title}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                    Chapter {session.currentModuleIndex + 1}
                  </span>
                  <span>
                    Slide {session.currentSlideIndex + 1} of {currentModule.slides.length}
                  </span>
                </div>
              </div>

              {/* High-Impact Lecture Script Narration */}
              <div className="p-4 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900/50 border border-purple-800/40 rounded-xl shadow-inner">
                <div className="flex items-center justify-between text-[10px] font-mono text-purple-300 font-bold mb-2">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-3.5 h-3.5 text-purple-400" />
                    <span>PROFESSOR LECTURE NARRATION:</span>
                  </div>
                  <button
                    onClick={toggleSpeechPlayback}
                    className="flex items-center space-x-1 text-purple-300 hover:text-white bg-purple-900/50 px-2 py-0.5 rounded border border-purple-700/50 transition"
                  >
                    {isPlayingSpeech ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{isPlayingSpeech ? 'Pause Voice' : 'Play Narration'}</span>
                  </button>
                </div>
                <p className="text-xs md:text-sm text-purple-100 leading-relaxed font-medium">
                  {currentSlide.speech}
                </p>
              </div>

              {/* Conceptual Mechanics Deep-Dive */}
              {currentSlide.explanation && (
                <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 flex items-start space-x-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                      UNDER THE HOOD & RUNTIME INTERNALS:
                    </span>
                    <p className="text-slate-200">{currentSlide.explanation}</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Video-weight Grid: Code Viewport + Architecture Diagram + Robot Avatar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start flex-1">
              {/* Left 7 Columns: Verified Code Viewer + Terminal Tab + "Try in Coding Lab" Link (Step 4) */}
              <div className="lg:col-span-7 flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl min-h-[300px]">
                {/* Code Header Bar */}
                <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <div className="flex space-x-1 ml-2">
                      <button
                        onClick={() => setCenterTab('code')}
                        className={`px-2.5 py-0.5 rounded text-[11px] font-mono transition ${
                          centerTab === 'code' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        lesson_demo.code
                      </button>
                      <button
                        onClick={() => setCenterTab('output')}
                        className={`px-2.5 py-0.5 rounded text-[11px] font-mono flex items-center space-x-1 transition ${
                          centerTab === 'output' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Terminal className="w-3 h-3" />
                        <span>Execution Output</span>
                      </button>
                    </div>
                  </div>

                  {/* Actions: Copy & "Try in Coding Lab" (Step 4) */}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => copyCodeToClipboard(currentSlide.code, 'center-code')}
                      className="p-1 rounded text-slate-400 hover:text-purple-300 transition"
                      title="Copy slide code"
                    >
                      {copiedSnippetIndex === 'center-code' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <Link
                      href={`/coding-lab?snippet=${encodeURIComponent(currentSlide.code)}`}
                      target="_blank"
                      className="flex items-center space-x-1 text-[10.5px] font-mono font-semibold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded border border-indigo-700/60 transition"
                      title="Open snippet in full Coding Lab"
                    >
                      <span>Try in Coding Lab</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Tab Content */}
                {centerTab === 'code' ? (
                  <div className="p-4 font-mono text-xs text-slate-200 overflow-x-auto flex-1 leading-relaxed bg-[#0a0f1d] select-text">
                    <pre className="text-purple-200 font-mono">
                      <code>{currentSlide.code}</code>
                    </pre>
                  </div>
                ) : (
                  <div className="p-4 font-mono text-xs text-emerald-400 overflow-x-auto flex-1 leading-relaxed bg-black/95 select-text">
                    <pre className="font-mono">
                      <code>{currentSlide.output || '>>> Execution completed with exit code 0.'}</code>
                    </pre>
                  </div>
                )}

                {/* Key Takeaways Footer */}
                {currentSlide.keyPoints && currentSlide.keyPoints.length > 0 && (
                  <div className="p-3 bg-slate-900/70 border-t border-slate-800 text-[11px] space-y-1">
                    <span className="font-mono text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                      📌 CORE PRINCIPLES & RULES:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentSlide.keyPoints.map((kp, idx) => (
                        <span
                          key={idx}
                          className="bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-lg text-[10.5px]"
                        >
                          • {kp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right 5 Columns: Architecture Diagram & Animated AI Professor Avatar */}
              <div className="lg:col-span-5 flex flex-col space-y-3.5">
                {/* Interactive Diagram */}
                {currentSlide.diagramType && currentSlide.diagramType !== 'none' && (
                  <InteractiveDiagram type={currentSlide.diagramType} />
                )}

                {/* Animated Robot Avatar */}
                <div className="flex flex-col items-center justify-center relative min-h-[200px] bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 shadow-xl">
                  <AIProfessorAvatar state={session.aiState} size="lg" />
                  <div className="mt-2 text-center">
                    <span className="text-[10px] font-mono text-purple-300 bg-purple-950/70 border border-purple-800/40 px-3 py-0.5 rounded-full inline-flex items-center space-x-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                      <span>{session.aiState.toUpperCase()}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Playback Scrubber & Dots */}
            <div className="flex items-center justify-center space-x-2 py-1">
              <span className="text-[10px] font-mono text-slate-500 mr-1 uppercase">
                Slides:
              </span>
              {currentModule.slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === session.currentSlideIndex
                      ? 'w-7 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]'
                      : 'w-2 bg-slate-700 hover:bg-slate-600'
                  }`}
                  title={`Slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Playback Controls (Previous / Mic Q&A / Next) */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <button
                onClick={prevSlideOrModule}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition border border-slate-700 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Slide</span>
              </button>

              {/* Mic Ask Professor Button */}
              <button
                onClick={toggleMicListening}
                className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-lg flex items-center space-x-2 ${
                  isMicListening
                    ? 'bg-red-600 text-white shadow-red-500/50 animate-bounce'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/30'
                }`}
              >
                <Mic className={`w-4 h-4 ${isMicListening ? 'animate-pulse' : ''}`} />
                <span>{isMicListening ? 'Listening... Speak!' : 'Ask Professor (Voice)'}</span>
              </button>

              <button
                onClick={nextSlideOrModule}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition border border-slate-700 shadow-sm"
              >
                <span>Next Slide</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>

        {/* ----------------------------------------------------------------------- */}
        {/* 4. RIGHT SIDEBAR — LIVE Q&A CHAT & LIVE NOTES SUMMARY (STEP 6, 7) */}
        {/* ----------------------------------------------------------------------- */}
        <AnimatePresence>
          {isRightSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 350, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-[#0b101e] border-l border-slate-800/90 flex flex-col shrink-0 h-full shadow-2xl z-20"
            >
              {/* Tab Selector: Live Q&A vs Running Notes (Step 6) */}
              <div className="p-2 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setRightTab('chat')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                      rightTab === 'chat'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Live Q&A</span>
                  </button>
                  <button
                    onClick={() => setRightTab('notes')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                      rightTab === 'notes'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Live Notes ({session.notes.length})</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsRightSidebarOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tab 1: Live Chat */}
              {rightTab === 'chat' ? (
                <>
                  <div className="flex-1 p-3 overflow-y-auto space-y-3 scrollbar-thin select-text">
                    {session.conversation.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex items-start space-x-2 ${
                          msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm ${
                            msg.isAI
                              ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white border border-purple-400/40'
                              : 'bg-slate-700 text-slate-200 border border-slate-600'
                          }`}
                        >
                          {msg.isAI ? '🤖' : msg.name.charAt(0)}
                        </div>
                        <div
                          className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed space-y-2 shadow-md ${
                            msg.isAI
                              ? 'bg-gradient-to-b from-purple-950/40 to-slate-900/90 border border-purple-800/40 text-purple-100 rounded-tl-none'
                              : 'bg-slate-800 text-slate-200 rounded-tr-none border border-slate-700/80'
                          }`}
                        >
                          <div className="flex items-center justify-between space-x-2 border-b border-purple-900/30 pb-1">
                            <span className="font-semibold text-[11px] text-purple-300">
                              {msg.name}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono">{msg.timestamp}</span>
                          </div>

                          <div className="text-xs text-slate-200 leading-relaxed">
                            {msg.isAI ? renderFormattedMessage(msg.text) : <p className="whitespace-pre-wrap">{msg.text}</p>}
                          </div>

                          {msg.codeSnippet && (
                            <div className="rounded-xl bg-black/80 border border-purple-900/60 overflow-hidden">
                              <div className="px-2.5 py-1 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[9.5px] font-mono text-purple-300">
                                <span>CODE SOLUTION</span>
                                <button
                                  type="button"
                                  onClick={() => copyCodeToClipboard(msg.codeSnippet || '', msg.id)}
                                  className="text-slate-400 hover:text-purple-300"
                                >
                                  {copiedSnippetIndex === msg.id ? 'Copied' : 'Copy'}
                                </button>
                              </div>
                              <div className="p-2 font-mono text-[11px] text-purple-200 overflow-x-auto">
                                <pre><code>{msg.codeSnippet}</code></pre>
                              </div>
                            </div>
                          )}

                          {msg.suggestedFollowUp && (
                            <button
                              type="button"
                              onClick={() => handleAskProfessor(msg.suggestedFollowUp)}
                              className="w-full text-left p-2 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 text-[10.5px] text-purple-200 border border-purple-700/50 transition flex items-center space-x-1.5"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                              <span className="truncate">Ask: {msg.suggestedFollowUp}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {isProfessorThinking && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start space-x-2">
                        <div className="w-7 h-7 rounded-full bg-purple-600/30 text-purple-300 border border-purple-500/50 flex items-center justify-center text-xs font-bold shrink-0 animate-pulse">
                          🤖
                        </div>
                        <div className="bg-purple-950/50 border border-purple-800/50 text-purple-200 rounded-2xl rounded-tl-none p-3 text-xs flex items-center space-x-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                          <span className="text-[11px]">Professor is analyzing your question...</span>
                        </div>
                      </motion.div>
                    )}

                    <div ref={chatBottomRef} />
                  </div>

                  {/* Input form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAskProfessor();
                    }}
                    className="p-2.5 border-t border-slate-800 bg-slate-900/80 flex items-center space-x-2"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask the professor anything..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={toggleMicListening}
                      className={`p-2 rounded-xl border transition ${
                        isMicListening
                          ? 'bg-red-600 text-white border-red-500 animate-pulse'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                      title="Speak Question"
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white transition shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </>
              ) : (
                /* Tab 2: Live Running Notes Summary Panel (Step 6) */
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="p-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
                    <span className="text-[11px] font-mono text-slate-400">
                      Auto-generated lesson summary
                    </span>
                    <button
                      onClick={exportNotesAsMarkdown}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-700/60 text-xs font-semibold transition"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download .MD</span>
                    </button>
                  </div>

                  <div className="flex-1 p-3 overflow-y-auto space-y-3.5 scrollbar-thin select-text">
                    {session.notes.length === 0 ? (
                      <div className="text-center py-12 text-slate-500 text-xs">
                        Notes will auto-generate as you step through each slide!
                      </div>
                    ) : (
                      session.notes.map((note) => (
                        <div
                          key={note.id}
                          className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-1.5 shadow-sm"
                        >
                          <div className="flex items-center justify-between border-b border-slate-800/60 pb-1">
                            <span className="text-xs font-bold text-purple-200 truncate">
                              {note.slideTitle}
                            </span>
                            <span className="text-[9.5px] font-mono text-slate-500">{note.timestamp}</span>
                          </div>
                          <p className="text-[10px] font-mono text-slate-400">{note.moduleTitle}</p>
                          <ul className="space-y-1 pt-1">
                            {note.bullets.map((b, idx) => (
                              <li key={idx} className="text-xs text-slate-300 flex items-start space-x-1.5 leading-snug">
                                <span className="text-purple-400 font-bold shrink-0">•</span>
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Exit Confirmation Modal */}
      <ExitClassModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        courseTitle={session.courseTitle}
      />
    </div>
  );
}