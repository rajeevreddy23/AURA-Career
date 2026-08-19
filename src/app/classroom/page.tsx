'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Sparkles,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Send,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  BookOpen,
  FileText,
  HelpCircle,
  Code,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  MessageSquare,
  Bot,
  Zap,
  Play,
  RotateCcw,
  Terminal,
  Cpu,
  Layers,
  Lightbulb,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';
import { AIProfessorAvatar, ProfessorState } from '@/components/classroom/AIProfessorAvatar';
import { InteractiveDiagram } from '@/components/classroom/InteractiveDiagram';
import { DoubtModal } from '@/components/classroom/DoubtModal';
import { CodingLabModal } from '@/components/classroom/CodingLabModal';
import { TeacherSelectModal } from '@/components/classroom/TeacherSelectModal';
import { ExitClassModal } from '@/components/classroom/ExitClassModal';
import { useClassroomState } from '@/hooks/useClassroomState';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

/** Helper to format inline markdown spans (bold, inline code) */
function renderInlineSpans(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
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
          className="bg-purple-950/90 text-purple-300 px-1.5 py-0.5 rounded font-mono text-[10.5px] border border-purple-800/60"
        >
          {part.slice(1, -1)}
        </code>
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
        <h4 key={idx} className="font-bold text-purple-300 text-xs mt-2 mb-0.5">
          {line.slice(4)}
        </h4>
      );
    }
    if (line.startsWith('## ') || line.startsWith('# ')) {
      return (
        <h3 key={idx} className="font-bold text-purple-200 text-xs mt-2 mb-1">
          {line.replace(/^#+\s/, '')}
        </h3>
      );
    }
    if (line.match(/^[\*\-•]\s/)) {
      return (
        <div key={idx} className="flex items-start space-x-1.5 my-0.5 pl-1">
          <span className="text-purple-400 font-bold mt-0.5 shrink-0">•</span>
          <span>{renderInlineSpans(line.replace(/^[\*\-•]\s/, ''))}</span>
        </div>
      );
    }
    if (line.match(/^\d+\.\s/)) {
      const numMatch = line.match(/^(\d+)\.\s(.*)/);
      return (
        <div key={idx} className="flex items-start space-x-1.5 my-0.5 pl-1">
          <span className="text-purple-400 font-mono text-[10px] font-bold shrink-0 mt-0.5">
            {numMatch?.[1]}.
          </span>
          <span>{renderInlineSpans(numMatch?.[2] || '')}</span>
        </div>
      );
    }
    if (!line.trim()) {
      return <div key={idx} className="h-1" />;
    }
    return <p key={idx} className="my-0.5">{renderInlineSpans(line)}</p>;
  });
}

export default function LiveClassroomPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    session,
    setSession,
    currentModule,
    currentSlide,
    progressPercent,
    setAIState,
    setDifficulty,
    setPersona,
    setVoice,
    goToModule,
    goToSlide,
    nextSlideOrModule,
    prevSlideOrModule,
    addChatMessage,
    cancelInFlight,
  } = useClassroomState();

  // Local state
  const [topicInput, setTopicInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const [isMicListening, setIsMicListening] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRightChatOpen, setIsRightChatOpen] = useState(true);
  const [centerTab, setCenterTab] = useState<'code' | 'output'>('code');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showDoubtModal, setShowDoubtModal] = useState(false);
  const [showCodingLabModal, setShowCodingLabModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [showDevStateBar, setShowDevStateBar] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProfessorThinking, setIsProfessorThinking] = useState(false);
  const [copiedSnippetIndex, setCopiedSnippetIndex] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Sync teacher selection from URL search params if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const teacherParam = params.get('teacher');
      if (teacherParam) {
        setPersona(teacherParam);
      }
    }
  }, [setPersona]);

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

  // 1. Live Interactive Course & Multi-Slide Curriculum Generator
  const handleTeachTopic = async (customTopic?: string) => {
    const topicToTeach = customTopic || topicInput.trim();
    if (!topicToTeach) {
      toast.error('Please enter a topic to learn!');
      return;
    }

    setAIState('preparing_lesson');
    setIsGenerating(true);
    toast.loading(`Designing live multi-slide masterclass on "${topicToTeach}"...`, { id: 'teach-toast' });

    try {
      const res = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicToTeach,
          level: session.difficulty,
          persona: session.persona,
        }),
      });

      const json = await res.json();
      toast.dismiss('teach-toast');

      if (json.success && json.data) {
        const courseData = json.data;
        toast.success(`Loaded Masterclass: ${courseData.courseTitle || topicToTeach}`);

        if (courseData.modules && Array.isArray(courseData.modules) && courseData.modules.length > 0) {
          setSession((prev) => ({
            ...prev,
            courseTitle: courseData.courseTitle || `Masterclass: ${topicToTeach}`,
            topic: topicToTeach,
            modules: courseData.modules,
            currentModuleIndex: 0,
            currentSlideIndex: 0,
            aiState: 'teaching',
          }));
        }

        addChatMessage(
          'professor',
          `Welcome to "${courseData.courseTitle || topicToTeach}"! Let's explore Module 1 from first principles.`,
          'Professor Aura'
        );
        setAIState('teaching');
      } else {
        toast.error('Using structured masterclass fallback.');
        setAIState('teaching');
      }
    } catch (err) {
      toast.dismiss('teach-toast');
      toast.error('Backend offline or rate limited. Using structured masterclass.');
      setAIState('teaching');
    } finally {
      setIsGenerating(false);
      setTopicInput('');
    }
  };

  // 2. Real-Time Live Class "Ask Professor" with LLM API & Synchronized Robot Animation
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

        addChatMessage('professor', answerText, 'Professor Aura', {
          codeSnippet: data.codeSnippet,
          output: data.output,
          suggestedFollowUp: data.suggestedFollowUp,
          memoryInsight: data.memoryInsight,
        });

        setAIState('answering');

        // Spoken audio synthesis synchronized with Robot Avatar
        if (isVoiceMode && typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const cleanSpeech = answerText
            .replace(/[\*#`_~]/g, '')
            .replace(/\n+/g, '. ')
            .replace(/\s+/g, ' ')
            .trim();

          const utterance = new SpeechSynthesisUtterance(cleanSpeech);
          utterance.rate = 1.0;
          utterance.pitch = session.voice.includes('Female') ? 1.15 : 0.95;

          utterance.onend = () => {
            setAIState('teaching');
          };
          utterance.onerror = () => {
            setAIState('teaching');
          };

          window.speechSynthesis.speak(utterance);
        } else {
          setTimeout(() => setAIState('teaching'), 3500);
        }
      } else {
        addChatMessage(
          'professor',
          `In ${currentModule.moduleTitle}, this behavior is governed directly by memory referencing and type mutability.`,
          'Professor Aura'
        );
        setAIState('teaching');
      }
    } catch (err) {
      setIsProfessorThinking(false);
      addChatMessage(
        'professor',
        `Under the hood in ${currentModule.moduleTitle}, memory pointers allocate bucket slots deterministically. Let's inspect the code on blackboard.`,
        'Professor Aura'
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
      toast.error('Speech recognition not supported in this browser. Please type your doubt!');
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
        toast.success('Listening... Speak to Professor Aura!');
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
          toast.success(`Voice Recognized: "${transcript}"`);
          handleAskProfessor(transcript);
        }
      };

      recognition.start();
      speechRecognitionRef.current = recognition;
    } catch (err) {
      toast.error('Could not activate microphone access.');
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen w-screen bg-[#090d16] text-slate-100 font-sans overflow-hidden select-none"
    >
      {/* ========================================================================= */}
      {/* 1. TOP BAR */}
      {/* ========================================================================= */}
      <header className="h-14 bg-[#0f172a]/90 border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0 z-30">
        {/* Left: Board Config & Status Badges */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => toast.success('Board Configuration: Real-time Multi-Slide Enabled')}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition"
          >
            <Settings className="w-4 h-4 text-purple-400" />
            <span className="font-medium">Board Config</span>
          </button>

          <div className="hidden sm:flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-1.5 animate-pulse" />
              Professor is teaching
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/60 text-slate-300 border border-slate-700">
              {session.persona}
            </span>
          </div>
        </div>

        {/* Center: Switch Teacher Button, Difficulty & Voice Dropdowns */}
        <div className="flex items-center space-x-2.5">
          {/* Switch AI Teacher Button */}
          <button
            onClick={() => setShowTeacherModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 text-purple-200 border border-purple-500/50 text-xs font-semibold transition shadow-sm"
            title="Switch AI Teacher Persona & Design"
          >
            <Bot className="w-3.5 h-3.5 text-purple-300" />
            <span>AI Teacher: <strong className="text-white ml-0.5">{session.persona}</strong></span>
            <Sparkles className="w-3 h-3 text-amber-400" />
          </button>

          {/* Difficulty Dropdown */}
          <div className="flex items-center space-x-1.5 bg-slate-800/70 border border-slate-700/80 rounded-lg px-2.5 py-1">
            <span className="text-[11px] text-slate-400 font-medium">Diff:</span>
            <select
              value={session.difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-purple-300 focus:outline-none cursor-pointer"
            >
              <option value="beginner" className="bg-slate-900 text-slate-200">Beginner</option>
              <option value="intermediate" className="bg-slate-900 text-slate-200">Intermediate</option>
              <option value="advanced" className="bg-slate-900 text-slate-200">Advanced</option>
            </select>
          </div>

          {/* Voice Dropdown */}
          <div className="flex items-center space-x-1.5 bg-slate-800/70 border border-slate-700/80 rounded-lg px-2.5 py-1">
            <span className="text-[11px] text-slate-400 font-medium">Voice:</span>
            <select
              value={session.voice}
              onChange={(e) => setVoice(e.target.value)}
              className="bg-transparent text-xs font-semibold text-purple-300 focus:outline-none cursor-pointer"
            >
              <option value="Sweet Female Voice" className="bg-slate-900 text-slate-200">Sweet Female Voice</option>
              <option value="Deep Calm Male" className="bg-slate-900 text-slate-200">Deep Calm Male</option>
              <option value="Academic Mentor" className="bg-slate-900 text-slate-200">Academic Mentor</option>
            </select>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center space-x-2">
          {/* Voice Mode Toggle */}
          <button
            onClick={() => setIsVoiceMode(!isVoiceMode)}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium transition border ${
              isVoiceMode
                ? 'bg-purple-600/30 text-purple-300 border-purple-500/50'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {isVoiceMode ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Voice Mode</span>
          </button>

          {/* Exit Class Button */}
          <button
            onClick={() => setShowExitModal(true)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-xs text-red-300 border border-red-800/60 transition"
            title="Exit Live Classroom"
          >
            <X className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden md:inline">Exit Class</span>
          </button>

          {/* Action Icons */}
          <div className="flex items-center space-x-1 pl-2 border-l border-slate-800">
            <button
              onClick={() => setShowCodingLabModal(true)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-purple-300 transition"
              title="Practice Coding Lab"
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDoubtModal(true)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-purple-300 transition"
              title="Doubt Diagnostic Resolver"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsRightChatOpen(!isRightChatOpen)}
              className={`p-1.5 rounded-lg transition ${isRightChatOpen ? 'bg-purple-600/20 text-purple-400' : 'hover:bg-slate-800 text-slate-400'}`}
              title="Live Chat"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. REAL STATUS STRIP */}
      {/* ========================================================================= */}
      <div className="h-7 bg-[#0b101d] border-b border-slate-800/60 px-4 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0">
        <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400 font-semibold">SESSION: ACTIVE</span>
          </div>
          <span className="text-slate-600">|</span>
          <div>AI TEACHER: <span className="text-slate-200 font-medium">PROFESSOR ({session.persona.toUpperCase()})</span></div>
          <span className="text-slate-600">|</span>
          <div>AUDIO FEED: <span className="text-slate-200 font-medium">{session.voice.toUpperCase()}</span></div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center space-x-1.5">
            <span>COGNITIVE STREAM:</span>
            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="w-[88%] h-full bg-purple-500" />
            </div>
            <span className="text-purple-400 font-semibold">FOCUSED</span>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-1 text-slate-400">
          <Zap className="w-3 h-3 text-emerald-400" />
          <span>CONNECTION: SECURE SSL</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN WORKSPACE: 3 PANELS */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ----------------------------------------------------------------------- */}
        {/* 3. LEFT PANEL — CURRICULUM MODULES */}
        {/* ----------------------------------------------------------------------- */}
        <aside className="w-72 bg-[#0c1222]/95 border-r border-slate-800/80 flex flex-col shrink-0 overflow-y-auto">
          {/* Professor Header Card */}
          <div className="p-4 border-b border-slate-800/60 flex items-center space-x-3 bg-gradient-to-r from-purple-950/20 to-transparent">
            <AIProfessorAvatar state={session.aiState} size="sm" className="w-12 h-14" />
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-1">
                <span>Professor Aura</span>
                <Sparkles className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
              </h3>
              <p className="text-[11px] text-purple-400 font-medium">{session.persona}</p>
            </div>
          </div>

          {/* Current Course Progress Card */}
          <div className="p-4 border-b border-slate-800/60">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-semibold text-slate-300">Course Progress</span>
              <span className="text-xs font-mono font-bold text-purple-400">{progressPercent}%</span>
            </div>
            <h4 className="text-xs font-medium text-slate-400 mb-2 truncate">{session.courseTitle}</h4>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5">
              Module {session.currentModuleIndex + 1} of {session.modules.length} · Slide {session.currentSlideIndex + 1} of {currentModule.slides.length}
            </p>
          </div>

          {/* Module Step List */}
          <div className="flex-1 p-3 space-y-2 overflow-y-auto">
            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">
              Curriculum Flow
            </h4>
            {session.modules.map((mod, idx) => {
              const isActive = idx === session.currentModuleIndex;
              const isDone = mod.status === 'completed';

              return (
                <button
                  key={mod.moduleId}
                  onClick={() => goToModule(idx)}
                  className={`w-full text-left p-2.5 rounded-xl transition flex items-start space-x-3 border ${
                    isActive
                      ? 'bg-purple-950/40 border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                      : isDone
                      ? 'bg-slate-900/50 border-slate-800/60 hover:bg-slate-800/50'
                      : 'bg-slate-950/30 border-slate-900 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isActive ? (
                      <div className="w-4 h-4 rounded-full bg-purple-500/20 border border-purple-400 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-500">
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${isActive ? 'text-purple-200' : isDone ? 'text-slate-300' : 'text-slate-400'}`}>
                      {mod.moduleTitle}
                    </p>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                        isDone
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                          : isActive
                          ? 'bg-purple-900/40 text-purple-300 border border-purple-700/40'
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {isDone ? 'Completed' : isActive ? 'Active Module' : 'Upcoming'}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">
                        {mod.slides.length} slides
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Lab Link */}
          <div className="p-3 border-t border-slate-800/60">
            <button
              onClick={() => setShowCodingLabModal(true)}
              className="w-full py-2 px-3 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 text-xs font-medium text-indigo-300 border border-indigo-700/50 flex items-center justify-center space-x-2 transition"
            >
              <Code className="w-3.5 h-3.5 text-indigo-400" />
              <span>Open Coding Lab Sandbox</span>
            </button>
          </div>
        </aside>

        {/* ----------------------------------------------------------------------- */}
        {/* 4. CENTER PANEL — MULTI-SLIDE BLACKBOARD & HOVERING PROFESSOR */}
        {/* ----------------------------------------------------------------------- */}
        <main className="flex-1 flex flex-col bg-[#090d16] relative overflow-y-auto">
          <div className="flex-1 p-6 flex flex-col justify-between max-w-5xl mx-auto w-full space-y-5">
            {/* Slide Header & Spoken Speech Bubble */}
            <motion.div
              key={currentSlide.slideId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl relative backdrop-blur-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold uppercase tracking-wider border border-purple-500/30">
                    {currentSlide.exampleTitle || 'CORE SYNTAX'}
                  </span>
                  <span className="text-xs font-bold text-slate-200">{currentSlide.title}</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Slide {session.currentSlideIndex + 1} of {currentModule.slides.length}
                </span>
              </div>

              {/* High-Energy Teacher Avatar Speech */}
              <div className="p-3.5 bg-purple-950/20 border border-purple-800/30 rounded-xl">
                <div className="flex items-center space-x-2 text-[10px] font-mono text-purple-400 font-bold mb-1">
                  <Bot className="w-3.5 h-3.5" />
                  <span>PROFESSOR SCRIPT:</span>
                </div>
                <p className="text-xs md:text-sm text-purple-100 leading-relaxed font-medium">
                  {currentSlide.speech}
                </p>
              </div>

              {/* In-depth Conceptual Deep-Dive & Time Complexity */}
              <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-start space-x-2">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>{currentSlide.explanation}</p>
              </div>
            </motion.div>

            {/* Interactive Grid: Code / Terminal + Diagram + Hovering Avatar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start flex-1">
              {/* Code & Output Panel (Left 7 Cols) */}
              <div className="lg:col-span-7 flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl min-h-[300px]">
                {/* Panel Header & Tabs */}
                <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <div className="flex space-x-1 ml-2">
                      <button
                        onClick={() => setCenterTab('code')}
                        className={`px-2.5 py-0.5 rounded text-[11px] font-mono transition ${
                          centerTab === 'code' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        EXAMPLE.py
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
                  <span className="text-[10px] font-mono bg-purple-950/60 text-purple-300 px-2 py-0.5 rounded border border-purple-800/40">
                    python 3.12
                  </span>
                </div>

                {/* Tab Views */}
                {centerTab === 'code' ? (
                  <div className="p-4 font-mono text-xs text-slate-200 overflow-x-auto flex-1 leading-relaxed bg-[#0d1322]">
                    <pre className="text-purple-200">
                      <code>{currentSlide.code}</code>
                    </pre>
                  </div>
                ) : (
                  <div className="p-4 font-mono text-xs text-emerald-400 overflow-x-auto flex-1 leading-relaxed bg-black/90">
                    <pre>
                      <code>{currentSlide.output || '>>> Execution completed with code 0.'}</code>
                    </pre>
                  </div>
                )}

                {/* Key Points / Exam Cheat-Sheet */}
                {currentSlide.keyPoints && currentSlide.keyPoints.length > 0 && (
                  <div className="p-3 bg-slate-900/60 border-t border-slate-800 text-[11px] space-y-1">
                    <span className="font-mono text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                      📌 CHEAT SHEET & KEY RULES:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentSlide.keyPoints.map((kp, idx) => (
                        <span key={idx} className="bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          • {kp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Architecture Diagram + Hovering Avatar (Right 5 Cols) */}
              <div className="lg:col-span-5 flex flex-col space-y-4">
                {/* Interactive Diagram */}
                {currentSlide.diagramType && currentSlide.diagramType !== 'none' && (
                  <InteractiveDiagram type={currentSlide.diagramType} />
                )}

                {/* Hovering Robot Avatar */}
                <div className="flex flex-col items-center justify-center relative min-h-[220px]">
                  <AIProfessorAvatar state={session.aiState} teacherStyle={session.persona} size="lg" />
                  <div className="mt-1 text-center">
                    <span className="text-[10px] font-mono text-purple-400 bg-purple-950/40 border border-purple-800/40 px-3 py-0.5 rounded-full inline-flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                      <span>{session.aiState.toUpperCase()}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide Navigation Carousel Dots */}
            <div className="flex items-center justify-center space-x-2 py-1">
              <span className="text-[10px] font-mono text-slate-500 mr-1">
                SLIDES:
              </span>
              {currentModule.slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className={`h-2.5 rounded-full transition-all ${
                    i === session.currentSlideIndex
                      ? 'w-7 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]'
                      : 'w-2.5 bg-slate-700 hover:bg-slate-600'
                  }`}
                  title={`Slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Bottom Controls: Previous / Ask Professor (Mic) / Next */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
              <button
                onClick={prevSlideOrModule}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition border border-slate-700"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Slide</span>
              </button>

              {/* Prominent Mic Button */}
              <button
                onClick={toggleMicListening}
                className={`px-6 py-3 rounded-full text-xs font-bold transition-all shadow-lg flex items-center space-x-2 ${
                  isMicListening
                    ? 'bg-red-600 text-white shadow-red-500/50 animate-bounce'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/30'
                }`}
              >
                <Mic className={`w-4 h-4 ${isMicListening ? 'animate-pulse' : ''}`} />
                <span>{isMicListening ? 'Listening... Speak!' : 'Ask Professor'}</span>
              </button>

              <button
                onClick={nextSlideOrModule}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition border border-slate-700"
              >
                <span>Next Slide</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>

        {/* ----------------------------------------------------------------------- */}
        {/* 5. RIGHT PANEL — LIVE CLASS CHAT & VOICE QA STREAM */}
        {/* ----------------------------------------------------------------------- */}
        <AnimatePresence>
          {isRightChatOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-[#0b101e] border-l border-slate-800/80 flex flex-col shrink-0 h-full"
            >
              {/* Header */}
              <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Live Class Stream</h3>
                  <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">👤 128</span>
                  <button onClick={() => setIsRightChatOpen(false)} className="text-slate-400 hover:text-slate-200">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3 scrollbar-thin">
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
                          ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)] border border-purple-400/40'
                          : 'bg-slate-700 text-slate-200 border border-slate-600'
                      }`}
                    >
                      {msg.isAI ? '🤖' : msg.name.charAt(0)}
                    </div>
                    <div
                      className={`max-w-[86%] p-3 rounded-2xl text-xs leading-relaxed space-y-2.5 shadow-md ${
                        msg.isAI
                          ? 'bg-gradient-to-b from-purple-950/50 to-slate-900/80 border border-purple-800/40 text-purple-100 rounded-tl-none backdrop-blur-sm'
                          : 'bg-slate-800 text-slate-200 rounded-tr-none border border-slate-700/80'
                      }`}
                    >
                      <div className="flex items-center justify-between space-x-2 border-b border-purple-900/30 pb-1.5">
                        <span className="font-semibold text-[11px] text-purple-300 flex items-center space-x-1.5">
                          <span>{msg.name}</span>
                          {msg.isAI && (
                            <span className="bg-purple-500/30 text-purple-300 text-[9px] px-1.5 py-0.2 rounded-full border border-purple-400/40 font-mono font-bold">
                              AI TUTOR
                            </span>
                          )}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">{msg.timestamp}</span>
                      </div>

                      {/* Main Message Content */}
                      <div className="text-xs text-slate-200 leading-relaxed">
                        {msg.isAI ? renderFormattedMessage(msg.text) : <p className="whitespace-pre-wrap">{msg.text}</p>}
                      </div>

                      {/* Code Snippet attached to Answer with Copy Action */}
                      {msg.codeSnippet && (
                        <div className="rounded-xl bg-black/70 border border-purple-900/60 overflow-hidden shadow-inner">
                          <div className="px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[10px] font-mono text-purple-300">
                            <span>EXAMPLE CODE</span>
                            <button
                              type="button"
                              onClick={() => copyCodeToClipboard(msg.codeSnippet || '', msg.id)}
                              className="flex items-center space-x-1 text-slate-400 hover:text-purple-300 transition"
                              title="Copy code"
                            >
                              {copiedSnippetIndex === msg.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400 text-[10px]">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <div className="p-2.5 font-mono text-[11px] text-purple-200 overflow-x-auto">
                            <pre><code>{msg.codeSnippet}</code></pre>
                          </div>
                        </div>
                      )}

                      {/* Execution Output Box */}
                      {msg.output && (
                        <div className="p-2 rounded-lg bg-black/80 border border-emerald-900/40 text-[10.5px] font-mono text-emerald-400 overflow-x-auto space-y-0.5">
                          <span className="text-[9px] text-slate-500 block uppercase font-bold">OUTPUT:</span>
                          <pre><code>{msg.output}</code></pre>
                        </div>
                      )}

                      {/* Memory / Complexity Insight Badge */}
                      {msg.memoryInsight && (
                        <div className="flex items-start space-x-2 text-[10.5px] font-mono text-purple-300 bg-purple-950/60 px-2.5 py-1.5 rounded-lg border border-purple-800/40">
                          <Cpu className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{msg.memoryInsight}</span>
                        </div>
                      )}

                      {/* Suggested Follow-up Prompt Chip */}
                      {msg.suggestedFollowUp && (
                        <button
                          type="button"
                          onClick={() => handleAskProfessor(msg.suggestedFollowUp)}
                          className="w-full text-left p-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 text-[10.5px] text-purple-200 border border-purple-700/50 transition flex items-center space-x-1.5 shadow-sm group"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-400 group-hover:text-amber-300 shrink-0 transition" />
                          <span className="truncate font-medium">Ask: {msg.suggestedFollowUp}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Live Real-Time Thinking Indicator when Robot is processing LLM */}
                {isProfessorThinking && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start space-x-2"
                  >
                    <div className="w-7 h-7 rounded-full bg-purple-600/30 text-purple-300 border border-purple-500/50 flex items-center justify-center text-xs font-bold shrink-0 animate-pulse">
                      🤖
                    </div>
                    <div className="bg-purple-950/50 border border-purple-800/50 text-purple-200 rounded-2xl rounded-tl-none p-3 text-xs flex items-center space-x-2 shadow-lg">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400 shrink-0" />
                      <span className="text-[11px] font-medium text-purple-300 animate-pulse">
                        Professor Aura is thinking & consulting LLM...
                      </span>
                    </div>
                  </motion.div>
                )}

                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskProfessor();
                }}
                className="p-3 border-t border-slate-800 bg-slate-900/70 flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question..."
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
                  className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white transition shadow-md shadow-purple-600/30"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* ========================================================================= */}
      {/* 6. BOTTOM BAR */}
      {/* ========================================================================= */}
      <footer className="h-14 bg-[#0b101e] border-t border-slate-800/80 px-4 flex items-center justify-between shrink-0 z-30">
        {/* Topic Input + Teach Button */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleTeachTopic();
          }}
          className="flex items-center space-x-2 flex-1 max-w-xl"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="Enter any topic (e.g. Python Dictionaries, React Hooks, Quantum Computing)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/80"
            />
            <Sparkles className="w-3.5 h-3.5 text-purple-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
          <button
            type="submit"
            disabled={isGenerating || !topicInput.trim()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 transition disabled:opacity-40 shadow-md shadow-purple-600/20"
          >
            <span>Teach</span>
            <Zap className="w-3.5 h-3.5 fill-white" />
          </button>
        </form>

        {/* Quick Action Buttons */}
        <div className="hidden sm:flex items-center space-x-2">
          <button
            onClick={() => toggleMicListening()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition"
          >
            <Mic className="w-3.5 h-3.5 text-purple-400" />
            <span>Voice</span>
          </button>
          <button
            onClick={() => setShowDoubtModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>Doubt</span>
          </button>
          <button
            onClick={() => setShowCodingLabModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition"
          >
            <Code className="w-3.5 h-3.5 text-purple-400" />
            <span>Lab</span>
          </button>
          <button
            onClick={() => setShowNotesModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition"
          >
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span>Notes</span>
          </button>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 7. DEV STATE MACHINE SWITCHER */}
      {/* ========================================================================= */}
      {showDevStateBar && (
        <div className="bg-slate-950 border-t border-purple-900/60 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono text-slate-400 z-40">
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
            <span className="text-purple-400 font-bold">ROBOT STATES (11):</span>
            {(
              [
                'idle',
                'thinking',
                'preparing_lesson',
                'teaching',
                'speaking',
                'listening',
                'processing_question',
                'answering',
                'paused',
                'lesson_completed',
                'error',
              ] as ProfessorState[]
            ).map((st) => (
              <button
                key={st}
                onClick={() => setAIState(st)}
                className={`px-2 py-0.5 rounded transition ${
                  session.aiState === st
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
          <button onClick={() => setShowDevStateBar(false)} className="text-slate-500 hover:text-slate-300 ml-2">
            ✕
          </button>
        </div>
      )}

      {/* AI Doubt Diagnostic Modal */}
      <DoubtModal
        isOpen={showDoubtModal}
        onClose={() => setShowDoubtModal(false)}
        topic={session.topic}
        level={session.difficulty}
      />

      {/* Interactive Coding Lab Modal */}
      <CodingLabModal
        isOpen={showCodingLabModal}
        onClose={() => setShowCodingLabModal(false)}
        topic={currentModule.moduleTitle}
      />

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Classroom Notes — {session.topic}</span>
              </h3>
              <button onClick={() => setShowNotesModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Type your personal lesson notes..."
              className="w-full h-48 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNotesModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  toast.success('Notes saved to session!');
                  setShowNotesModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* In-Page Teacher Select Modal */}
      <TeacherSelectModal
        isOpen={showTeacherModal}
        onClose={() => setShowTeacherModal(false)}
        currentPersona={session.persona}
        onSelectPersona={(id, name) => {
          setPersona(name);
          toast.success(`Switched to AI Teacher: ${name}`);
        }}
      />

      {/* Exit Live Class Confirmation Modal */}
      <ExitClassModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        courseTitle={session.courseTitle}
      />
    </div>
  );
}