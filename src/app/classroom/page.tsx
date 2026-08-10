'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MOCK_COURSES, TEACHER_STYLES } from '@/lib/constants';
import type { TeacherStyleId } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, ArrowLeft, Sparkles, MessageSquare, Loader2,
  ChevronRight, Mic, MicOff, Maximize2, Minimize2,
  HelpCircle, BookOpen, Volume2, VolumeX, FastForward,
  X, Keyboard, FileText, CheckCircle2, ShieldAlert
} from 'lucide-react';

// Types
type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
  suggestions?: string[];
};

export default function ClassroomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const courseId = searchParams.get('courseId') || '';
  const initialTopic = searchParams.get('topic') || '';
  const initialStyle = (searchParams.get('style') as TeacherStyleId) || 'socratic';

  const course = MOCK_COURSES.find((c) => c.id === courseId);
  const courseTitle = course?.title || 'Interactive Classroom';

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [topic, setTopic] = useState(initialTopic || courseTitle);
  const [teacherStyle, setTeacherStyle] = useState<TeacherStyleId>(initialStyle);
  const [showNotes, setShowNotes] = useState(false);

  // Focus & Controls UI State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [notesText, setNotesText] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Fullscreen Listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsMuted((prev) => !prev);
      } else if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        setIsVoiceActive((prev) => !prev);
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setShowNotes((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      handleInitialGreeting();
    }
  }, []);

  const handleInitialGreeting = async () => {
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const greetingText = `Welcome to your interactive AI session on **${topic}**!\n\nI am your professor today using the **${
      TEACHER_STYLES.find((s) => s.id === teacherStyle)?.name || 'Socratic'
    }** approach. I will guide you concept by concept.\n\nWhat area would you like to explore first?`;

    setMessages([
      {
        id: Date.now().toString(),
        role: 'model',
        content: greetingText,
        suggestions: ['Start from the core basics', 'Show me a practical example', 'Quiz my current understanding'],
      },
    ]);

    setIsTyping(false);
  };

  const callGemini = async (chatMessages: { role: string; parts: { text: string }[] }[]) => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!API_KEY) {
        console.warn('API Key missing');
        return 'API key is missing. Please check your environment variables.';
      }

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: chatMessages,
            systemInstruction: {
              parts: [
                {
                  text: `You are an AI professor on the AURA Learn platform. You teach ${topic} at an intermediate level. Your teaching style is ${teacherStyle}. Explain concepts clearly with structured headers, code snippets when relevant, and clean markdown. After each explanation, suggest 2-3 follow-up topics the student might want to explore next. Format suggestions as a JSON array at the very end of your response like: \n\n[SUGGESTIONS]["topic1","topic2","topic3"][/SUGGESTIONS]`,
                },
              ],
            },
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }

      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I had trouble generating a response. Please try again.';
    } catch (err) {
      console.error('Gemini API Error:', err);
      return 'An error occurred while contacting the AI. Please try again later.';
    }
  };

  const parseSuggestions = (text: string): { cleanText: string; suggestions: string[] } => {
    const match = text.match(/\[SUGGESTIONS\]([\s\S]*?)\[\/SUGGESTIONS\]/);
    if (match) {
      try {
        const suggestionsStr = match[1];
        const suggestions = JSON.parse(suggestionsStr);
        return {
          cleanText: text.replace(match[0], '').trim(),
          suggestions: Array.isArray(suggestions) ? suggestions : [],
        };
      } catch (e) {
        return { cleanText: text.replace(match[0], '').trim(), suggestions: [] };
      }
    }
    return { cleanText: text, suggestions: [] };
  };

  const handleSendMessage = async (text: string = inputValue) => {
    if (!text.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Format history for Gemini
    const history = messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));
    history.push({ role: 'user', parts: [{ text }] });

    const responseText = await callGemini(history);
    const { cleanText, suggestions } = parseSuggestions(responseText);

    const modelMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      content: cleanText,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };

    setMessages((prev) => [...prev, modelMessage]);
    setIsTyping(false);
  };

  const TypewriterMarkdown = ({ content }: { content: string }) => {
    const [displayed, setDisplayed] = useState('');

    useEffect(() => {
      let i = 0;
      setDisplayed('');
      const interval = setInterval(() => {
        setDisplayed(content.slice(0, i));
        i += 3;
        if (i > content.length) {
          setDisplayed(content);
          clearInterval(interval);
        }
      }, 8);
      return () => clearInterval(interval);
    }, [content]);

    return (
      <div className="prose prose-invert max-w-none prose-pre:bg-[#070A12] prose-pre:border prose-pre:border-slate-800 prose-p:leading-relaxed prose-pre:p-4 prose-pre:rounded-xl">
        <ReactMarkdown>{displayed}</ReactMarkdown>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col font-sans select-none overflow-hidden relative"
    >
      {/* IMMERSIVE TOP BAR */}
      <header className="h-16 border-b border-slate-800/80 bg-[#070A12]/90 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 z-30 sticky top-0 shadow-2xl">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl"
            title="Exit Classroom"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-bold text-white tracking-tight truncate max-w-[180px] sm:max-w-md">
                {courseTitle}
              </h1>
              <Badge variant="outline" className="hidden sm:inline-flex border-cyan-500/30 text-cyan-400 bg-cyan-500/10 text-xs">
                {TEACHER_STYLES.find((s) => s.id === teacherStyle)?.name || 'Teacher'}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Topic: {topic}</p>
          </div>
        </div>

        {/* AI Professor Presence Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 flex items-center gap-2 shadow-inner">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isTyping ? 'bg-cyan-400' : 'bg-emerald-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isTyping ? 'bg-cyan-500' : 'bg-emerald-500'
                }`}
              />
            </span>
            <span className="text-xs font-semibold text-slate-300">
              {isTyping ? 'AI Professor Writing...' : 'AI Professor Live'}
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              className={`rounded-xl text-slate-400 hover:text-white ${isMuted ? 'text-amber-400 bg-amber-500/10' : ''}`}
              title={isMuted ? 'Unmute Audio (M)' : 'Mute Audio (M)'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotes(!showNotes)}
              className={`rounded-xl text-slate-400 hover:text-white ${showNotes ? 'text-primary bg-primary/10' : ''}`}
              title="Class Notes & Outline (N)"
            >
              <FileText className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowShortcutsModal(true)}
              className="rounded-xl text-slate-400 hover:text-white hidden md:inline-flex"
              title="Keyboard Shortcuts (?)"
            >
              <Keyboard className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="rounded-xl text-slate-400 hover:text-white"
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Focus Mode Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN FULL-SCREEN CLASSROOM STAGE */}
      <div className="flex-1 flex overflow-hidden relative bg-[#070A12]">
        {/* WHITEBOARD STAGE CANVAS (75-85% VIEWPORT) */}
        <main className="flex-1 flex flex-col relative max-w-5xl mx-auto w-full px-4 md:px-8 py-6 overflow-hidden">
          {/* Main Whiteboard Canvas Box */}
          <div className="flex-1 bg-[#0F1629]/90 border border-slate-800/80 rounded-3xl p-6 md:p-8 overflow-y-auto space-y-6 shadow-2xl backdrop-blur-md pb-36 scrollbar-thin scrollbar-thumb-slate-800">
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}
                >
                  <div className={`flex gap-3.5 max-w-[92%] md:max-w-[88%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {/* Role Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {msg.role === 'user' ? (
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs">
                          YOU
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                          <Sparkles className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Whiteboard Board Content */}
                    <div className="flex flex-col gap-2">
                      <div
                        className={`p-5 rounded-2xl ${
                          msg.role === 'user'
                            ? 'bg-slate-800/90 border border-slate-700 text-white rounded-tr-none shadow-md'
                            : 'bg-[#070A12]/90 border border-cyan-500/20 text-slate-100 rounded-tl-none shadow-xl relative'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <div className="whitespace-pre-wrap font-sans text-sm">{msg.content}</div>
                        ) : index === messages.length - 1 && isTyping === false ? (
                          <TypewriterMarkdown content={msg.content} />
                        ) : (
                          <div className="prose prose-invert max-w-none prose-pre:bg-[#070A12] prose-pre:border prose-pre:border-slate-800 prose-p:leading-relaxed prose-pre:p-4 prose-pre:rounded-xl">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        )}
                      </div>

                      {/* Interactive Follow-up Topic Suggestions */}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-[11px] text-slate-400 font-semibold w-full">Explore Follow-up:</span>
                          {msg.suggestions.map((sug, i) => (
                            <button
                              key={i}
                              onClick={() => handleSendMessage(sug)}
                              className="text-xs px-3.5 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all flex items-center gap-1.5 font-medium shadow-sm"
                            >
                              <MessageSquare className="w-3 w-3 text-cyan-400" />
                              {sug}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* AI Thinking Stream Indicator */}
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start w-full">
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white animate-pulse">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="bg-[#070A12] border border-cyan-500/30 p-4 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs text-cyan-300 font-medium">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>AI Professor is formulating whiteboard explanation...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* FLOATING CONTROLS DOCK (UNOBTRUSIVE / BOTTOM) */}
          <div className="absolute bottom-4 left-4 right-4 max-w-5xl mx-auto z-20">
            <div className="bg-slate-950/90 backdrop-blur-2xl border border-slate-800 rounded-2xl p-2.5 flex items-center gap-2 shadow-2xl border-cyan-500/20">
              {/* Voice Mic Toggle */}
              <button
                onClick={() => setIsVoiceActive(!isVoiceActive)}
                className={`p-3 rounded-xl transition-all flex items-center gap-2 text-xs font-semibold ${
                  isVoiceActive
                    ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                title="Raise Hand / Voice Q&A"
              >
                {isVoiceActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                <span className="hidden sm:inline">{isVoiceActive ? 'Listening...' : 'Raise Hand'}</span>
              </button>

              {/* Text Query Input */}
              <div className="flex-1 flex items-center relative">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask the AI Professor a question or type a concept..."
                  rows={1}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none max-h-24"
                />
              </div>

              {/* Send Button */}
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                size="sm"
                className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold px-4 py-2.5 rounded-xl disabled:opacity-40 shrink-0 gap-1.5 shadow-lg shadow-cyan-500/20"
              >
                {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span className="hidden sm:inline">Ask</span>
              </Button>
            </div>
          </div>
        </main>

        {/* COLLAPSIBLE SIDEBAR: CLASS NOTES & OUTLINE */}
        <AnimatePresence>
          {showNotes && (
            <motion.aside
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              className="w-80 border-l border-slate-800 bg-[#0F1629]/95 backdrop-blur-xl flex flex-col z-20 shadow-2xl"
            >
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#070A12]/40">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Class Notes & Scratchpad</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowNotes(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-4 flex-1 flex flex-col space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Session Notes</label>
                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    className="w-full h-48 bg-[#070A12] border border-slate-800 rounded-xl p-3 text-slate-200 text-xs font-mono resize-none focus:outline-none focus:border-cyan-500"
                    placeholder="Take personal notes during lecture..."
                  />
                </div>

                <div className="border-t border-slate-800 pt-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Lesson Outline</h4>
                  <div className="space-y-1.5 text-xs text-slate-400">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-slate-200">
                      <span>1. Core Concepts</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-slate-400">
                      <span>2. Practical Example</span>
                      <span className="text-[10px] text-cyan-400 font-medium">In Progress</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-slate-500">
                      <span>3. Knowledge Check</span>
                      <span>Next</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* KEYBOARD SHORTCUTS MODAL */}
      {showShortcutsModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0F1629] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-white text-base">
                <Keyboard className="w-5 h-5 text-cyan-400" />
                <span>Keyboard Shortcuts</span>
              </div>
              <button onClick={() => setShowShortcutsModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { key: 'F', action: 'Toggle Fullscreen Focus Mode' },
                { key: 'N', action: 'Toggle Class Notes Drawer' },
                { key: 'M', action: 'Mute / Unmute Audio Stream' },
                { key: 'V', action: 'Toggle Voice Microphone' },
                { key: '?', action: 'Show / Hide Shortcuts Overlay' },
              ].map((sc) => (
                <div key={sc.key} className="flex items-center justify-between p-2 rounded-xl bg-[#070A12] border border-slate-800">
                  <span className="text-slate-300 font-medium">{sc.action}</span>
                  <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-cyan-400 font-bold">
                    {sc.key}
                  </span>
                </div>
              ))}
            </div>

            <Button onClick={() => setShowShortcutsModal(false)} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-2 rounded-xl">
              Got it
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}