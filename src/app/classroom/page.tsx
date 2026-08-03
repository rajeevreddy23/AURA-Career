'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { MOCK_COURSES, TEACHER_STYLES } from '@/lib/constants';
import type { TeacherStyleId, BoardPage, BoardContentItem } from '@/types';
import { generateId, cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useAI } from '@/contexts/AIContext';
import toast from 'react-hot-toast';
import {
  Bot, Sparkles, ArrowLeft, Play, Pause, Square, Volume2, VolumeX,
  ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, Maximize, Minimize, Maximize2, Minimize2,
  MessageSquare, HelpCircle, StickyNote, Timer, Calendar, CalendarIcon, Settings, Sun, Moon,
  Mic, MicOff, BookOpen, Brain, Code2, LayoutGrid, BarChart3, Trophy, Star,
  RefreshCw, Copy, Check, Lightbulb, AlertTriangle, CheckCircle, XCircle,
  Send, Grid, Circle, Layers, Palette, GraduationCap, Zap, Heart, ChevronDown,
  X, Expand, Shrink, Monitor, PanelRight, PanelLeft, Wand2, Target, Award,
  MessageCircleQuestion, Clock, FileText, Quote, StopCircle, Loader2
} from 'lucide-react';
import { ChatPanel } from '@/components/classroom/ChatPanel';
import { TeacherAvatar } from '@/components/classroom/TeacherAvatar';
import { ConceptDiagram } from '@/components/classroom/ConceptDiagram';
import { NotesGenerator } from '@/components/classroom/NotesGenerator';
import { PomodoroTimer } from '@/components/classroom/PomodoroTimer';
import { StudentDashboard } from '@/components/classroom/StudentDashboard';
import { CalendarIntegration } from '@/components/classroom/CalendarIntegration';
import { AudioPlayer } from '@/components/classroom/AudioPlayer';
import ReactMarkdown from 'react-markdown';


export default function ClassroomPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams.get('course');
  const topicParam = searchParams.get('topic');
  const teacherId = (searchParams.get('teacher') || 'professor') as TeacherStyleId;

  const teacher = TEACHER_STYLES.find(t => t.id === teacherId) || TEACHER_STYLES[0];
  const course = courseId ? MOCK_COURSES.find(c => c.id === courseId) : null;
  const topic = topicParam || course?.title || '';

  const [boardStyle, setBoardStyle] = useState<'whiteboard' | 'blackboard'>('blackboard');
  const [activeSidebarTab, setActiveSidebarTab] = useState<'chat' | 'doubt' | 'notes' | 'timer' | 'calendar' | null>('chat');
  const [voiceMode, setVoiceMode] = useState(false);
  const voiceModeRef = useRef(voiceMode);
  useEffect(() => {
    voiceModeRef.current = voiceMode;
  }, [voiceMode]);
  const [memoryInsight, setMemoryInsight] = useState('');
  const memorySyncRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [aiProvider, setAiProvider] = useState<string>('');

  // Show which AI engine is serving the lesson (NVIDIA / Groq / Gemini / mock)
  useEffect(() => {
    fetch('/api/v1/agents/status')
      .then(res => res.json())
      .then(data => {
        if (data?.success && data?.data?.provider) setAiProvider(data.data.provider);
      })
      .catch(() => {});
  }, []);
  
  // Dashboard & Gamification States
  const [showDashboard, setShowDashboard] = useState(false);
  const [xpPoints, setXpPoints] = useState(150);
  const [weakTopics, setWeakTopics] = useState<string[]>(['Recursion Base Cases']);
  const [quizHistory, setQuizHistory] = useState<{ topic: string; correct: number; total: number; timestamp: Date }[]>([]);
  
  // Interactive Quiz States
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, boolean>>({});

  const [doubtQuestion, setDoubtQuestion] = useState('');
  const [doubtAnswer, setDoubtAnswer] = useState('');
  const [doubtLoading, setDoubtLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWideView, setIsWideView] = useState(false);
  const [inputTopic, setInputTopic] = useState(topic);
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>(
    course?.level || 'beginner'
  );

  // Board state
  const [boardPages, setBoardPages] = useState<BoardPage[]>([{
    id: generateId(),
    pageNumber: 1,
    items: [],
    createdAt: new Date(),
    downloaded: false,
  }]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeakingLesson, setIsSpeakingLesson] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [objectives, setObjectives] = useState<string[]>([]);
  const [voiceSpeed, setVoiceSpeed] = useState(1);
  const [selectedVoiceGender, setSelectedVoiceGender] = useState<'female' | 'male'>('female');
  const [currentSection, setCurrentSection] = useState('');
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [teacherState, setTeacherState] = useState<'idle' | 'speaking' | 'thinking' | 'happy'>('idle');
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);
  const [pausedAt, setPausedAt] = useState<{pageIndex: number; charOffset: number} | null>(null);
  const [highlightColor, setHighlightColor] = useState('indigo');
  
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [canvasTheme, setCanvasTheme] = useState<'cyber' | 'chalk' | 'studio' | 'terminal'>('cyber');
  const [gridPattern, setGridPattern] = useState<'dots' | 'lines' | 'cyber' | 'none'>('cyber');
  const [ambientAudio, setAmbientAudio] = useState<'off' | 'lofi' | 'rain' | 'coffee'>('off');

  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientNodeRef = useRef<AudioNode | null>(null);

  const classroomRef = useRef<HTMLDivElement>(null);
  const boardEndRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const flyingRef = useRef<HTMLDivElement>(null);
  const currentItemRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const { setAssistantEmotion, setAssistantAnimation } = useAI();

  useEffect(() => {
    setAssistantEmotion('happy');
    setAssistantAnimation('idle');
    setTeacherState('happy');
  }, [setAssistantEmotion, setAssistantAnimation]);

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: 'smooth' });
  }, [boardPages, isGenerating]);

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const startAmbientAudio = useCallback((type: 'off' | 'lofi' | 'rain' | 'coffee') => {
    if (typeof window === 'undefined') return;
    
    if (ambientNodeRef.current) {
      try {
        (ambientNodeRef.current as any).stop();
      } catch {}
      ambientNodeRef.current = null;
    }
    
    if (type === 'off') return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;
      
      const filter = ctx.createBiquadFilter();
      filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
      filter.frequency.value = type === 'rain' ? 800 : 250;
      
      const gainNode = ctx.createGain();
      gainNode.gain.value = type === 'rain' ? 0.08 : type === 'lofi' ? 0.05 : 0.04;
      
      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      whiteNoise.start();
      ambientNodeRef.current = whiteNoise as any;
    } catch (e) {
      console.warn("Web Audio API not initialized:", e);
    }
  }, []);

  useEffect(() => {
    startAmbientAudio(ambientAudio);
    return () => {
      if (ambientNodeRef.current) {
        try {
          (ambientNodeRef.current as any).stop();
        } catch {}
      }
    };
  }, [ambientAudio, startAmbientAudio]);

  // Auto-start if we have a course/topic
  useEffect(() => {
    if (topic && boardPages[0].items.length === 0 && !isGenerating) {
      generateLesson();
    }
  }, []);

  // Live progress rail sync — push slide progress to MemoryAgent.analyze_progress
  // so the dashboard/insights update as the student goes, not only at session end.
  useEffect(() => {
    if (boardPages.length === 0) return;
    if (memorySyncRef.current) clearTimeout(memorySyncRef.current);
    memorySyncRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/v1/agents/memory/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(user ? { Authorization: `Bearer ${await user.getIdToken().catch(() => '')}` } : {}),
          },
          body: JSON.stringify({
            topic: lessonTitle || topic,
            slidesCompleted: currentPage + 1,
            totalSlides: boardPages.length,
            currentSlide: currentSection,
            quizHistory,
          }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          const d = data.data;
          const insight =
            (Array.isArray(d.recommendedNextTopics) && d.recommendedNextTopics.join(', ')) ||
            (Array.isArray(d.personalizedStudyTips) && d.personalizedStudyTips[0]) ||
            (Array.isArray(d.strengths) && `Strong in: ${d.strengths.slice(0, 2).join(', ')}`) ||
            'Progress synced to your dashboard';
          setMemoryInsight(insight);
        }
      } catch {
        // Non-blocking — analytics sync must never interrupt the lesson
      }
    }, 1200);
  }, [currentPage, boardPages.length, user, lessonTitle, topic, currentSection]);

  const currentBoard = boardPages[currentPage];

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeakingLesson(false);
    setTeacherState('idle');
  }, []);

  const getSelectedVoice = useCallback((gender: 'female' | 'male') => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    
    // Curated high quality English voices for female/male
    const femaleNames = ['samantha', 'zira', 'karen', 'google us english', 'google uk english female', 'hazel', 'moira', 'tessa'];
    const maleNames = ['david', 'daniel', 'google uk english male', 'google us english male', 'mark', 'ravi', 'richard'];
    
    const filterNames = gender === 'female' ? femaleNames : maleNames;
    
    // Try to find custom sweet voice match from list
    for (const name of filterNames) {
      const match = voices.find(v => v.name.toLowerCase().includes(name));
      if (match) return match;
    }
    
    // Fallback to matching language and gender keyword in name
    const langMatch = voices.filter(v => v.lang.startsWith('en'));
    if (langMatch.length > 0) {
      if (gender === 'female') {
        const femaleVoice = langMatch.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha'));
        if (femaleVoice) return femaleVoice;
      } else {
        const maleVoice = langMatch.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('daniel'));
        if (maleVoice) return maleVoice;
      }
      return langMatch[0];
    }
    
    return voices[0] || null;
  }, []);

  const speakText = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voiceSpeed;
    utterance.pitch = teacherId === 'friend' ? 1.2 : teacherId === 'expert' ? 0.9 : 1;
    utterance.volume = 1;
    
    const voice = getSelectedVoice(selectedVoiceGender);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      setIsSpeakingLesson(true);
      setTeacherState('speaking');
    };
    utterance.onend = () => {
      setIsSpeakingLesson(false);
      setTeacherState('happy');
    };
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [voiceSpeed, teacherId, selectedVoiceGender, getSelectedVoice]);

  const handleQuizAnswer = (isCorrect: boolean, quizTopic: string, selectedOption: string) => {
    if (isCorrect) {
      setXpPoints(prev => prev + 50);
      toast.success('Correct answer! +50 XP');
    } else {
      setWeakTopics(prev => {
        if (prev.includes(quizTopic)) return prev;
        return [...prev, quizTopic];
      });
      toast.error('Incorrect answer. Focus area logged.');
    }
    
    setQuizHistory(prev => [
      ...prev,
      {
        topic: quizTopic,
        correct: isCorrect ? 1 : 0,
        total: 1,
        timestamp: new Date()
      }
    ]);
  };

  const startVoiceRecognition = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported in this browser. Please use Chrome.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListeningVoice(true);
        toast('Listening for voice doubt...', { icon: '🎙️' });
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListeningVoice(false);
      };

      recognition.onend = () => {
        setIsListeningVoice(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setDoubtQuestion(transcript);
        toast.success(`Heard: "${transcript}"`);
        
        // Trigger doubt submit
        setDoubtLoading(true);
        setDoubtAnswer('');
        setIsPaused(true);
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        
        fetch('/api/v1/agents/teach/doubt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: transcript, lesson_context: currentSection || topic }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.data) {
              const answer = data.data.explanation || data.data;
              setDoubtAnswer(answer);
              speakText(answer);
              // Voice mode loop: after the answer is spoken, resume the lesson
              // and keep listening for the next doubt.
              if (voiceModeRef.current) {
                const spokenMs = Math.max(3000, answer.length * 55);
                setTimeout(() => {
                  if (!isPausedRef.current) return;
                  resumeLesson(true);
                  if (voiceModeRef.current) startVoiceRecognition();
                }, spokenMs);
              }
            } else {
              throw new Error();
            }
          })
          .catch(() => {
            const mock = `That is a great question! For "${transcript}", think of it as building layers of blocks where each layer depends on the previous one. Does that analogy help make it clearer?`;
            setDoubtAnswer(mock);
            speakText(mock);
          })
          .finally(() => setDoubtLoading(false));
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Failed to start speech recognition:', e);
    }
  }, [currentSection, topic, speakText]);

  const stopVoiceRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListeningVoice(false);
  }, []);

  const scrollToSection = useCallback((idx: number) => {
    setCurrentPage(idx);
    const elements = document.querySelectorAll('[data-section]');
    if (elements[idx]) {
      elements[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const generateLesson = useCallback(async () => {
    const teachTopic = inputTopic || topic;
    if (!teachTopic.trim()) return;

    abortRef.current = new AbortController();
    setIsGenerating(true);

    const freshPage: BoardPage = {
      id: generateId(),
      pageNumber: 1,
      items: [],
      createdAt: new Date(),
      downloaded: false,
    };
    setBoardPages([freshPage]);
    setCurrentPage(0);
    setLessonTitle('');
    setObjectives([]);
    setCurrentSection('');
    setAssistantEmotion('thinking');
    setAssistantAnimation('thinking');
    setTeacherState('thinking');

    // Build teacher-specific system prompt
    const teacherPrompt = buildTeacherPrompt(teacher, teachTopic, level);

    try {
      // Get auth token if available — falls back gracefully for anonymous users
      let authHeaders: Record<string, string> = {};
      try {
        if (user) {
          const token = await user.getIdToken();
          if (token) authHeaders = { Authorization: `Bearer ${token}` };
        }
      } catch { /* anonymous — proceed without auth */ }

      const res = await fetch('/api/v1/agents/generate/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          prompt: teacherPrompt,
          system_prompt: `You are ${teacher.name}, an AI teacher on the AURA Learn platform. ${teacher.description}`,
          stream: true,
        }),
        signal: abortRef.current.signal,
      });


      if (!res.ok) throw new Error('Failed to generate lesson');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let buffer = '';
      let textBuffer = '';

      const appendItem = (type: BoardContentItem['type'], content: string) => {
        setBoardPages(prev => {
          const pages = [...prev];
          const current = { ...pages[pages.length - 1] };
          current.items = [...current.items, {
            id: generateId(),
            type,
            content,
            isStreaming: true,
            timestamp: new Date(),
          }];
          pages[pages.length - 1] = current;
          return pages;
        });
        if (type === 'text') {
          if (voiceModeRef.current) speakText(content);
          setCurrentSection(content.slice(0, 100));
        } else if (type === 'heading') {
          if (voiceModeRef.current) speakText(`Now on the board: ${content}`);
          setCurrentSection(content.slice(0, 100));
        } else if (type === 'diagram') {
          if (voiceModeRef.current) speakText(`A diagram is displayed on the board to explain this idea.`);
          setCurrentSection('Diagram on board');
        } else if (type === 'code') {
          if (voiceModeRef.current) speakText(`A code example appears on the board. ${content.split('\n').slice(0, 2).join(' ')}.`);
          setCurrentSection('Code example');
        } else if (type === 'check') {
          if (voiceModeRef.current) speakText(`Quick check: ${content}`);
          setCurrentSection(content.slice(0, 100));
        } else if (type === 'bullets') {
          const speakableText = content.split('||').join('. ');
          if (voiceModeRef.current) {
            speakText(speakableText);
            // Voice mode loop: after AURA finishes speaking the slide, listen
            // for a spoken doubt.
            if (window.speechSynthesis) {
              window.speechSynthesis.addEventListener('end', () => {
                if (voiceModeRef.current && !isPausedRef.current) {
                  startVoiceRecognition();
                }
              }, { once: true });
            }
          }
          setCurrentSection(speakableText.slice(0, 100));
        } else if (type === 'quiz') {
          if (voiceModeRef.current) speakText("Time for a checkpoint quiz. Please review the challenge on the board.");
          setCurrentSection("Checkpoint Quiz");
          setIsPaused(true);
        }
      };

      const updateLastItem = (content: string) => {
        setBoardPages(prev => {
          const pages = [...prev];
          const current = { ...pages[pages.length - 1] };
          const items = [...current.items];
          if (items.length > 0) {
            items[items.length - 1] = { ...items[items.length - 1], content, isStreaming: true };
          }
          current.items = items;
          pages[pages.length - 1] = current;
          return pages;
        });
      };

      const finalizeLastItem = () => {
        setBoardPages(prev => {
          const pages = [...prev];
          const current = { ...pages[pages.length - 1] };
          current.items = current.items.map(item => ({ ...item, isStreaming: false }));
          pages[pages.length - 1] = current;
          return pages;
        });
      };

      // Start a new board page for each slide
      const startNewBoardPage = () => {
        setBoardPages(prev => {
          const pages = [...prev];
          const lastPage = pages[pages.length - 1];
          if (lastPage.items.length === 0) {
            return pages;
          }
          const newPage: BoardPage = {
            id: generateId(),
            pageNumber: lastPage.pageNumber + 1,
            items: [],
            createdAt: new Date(),
            downloaded: false,
          };
          pages.push(newPage);
          setCurrentPage(pages.length - 1);
          return pages;
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('##TITLE##')) {
            setLessonTitle(trimmed.replace('##TITLE##', '').trim());
          } else if (trimmed.startsWith('##OBJECTIVES##')) {
            setObjectives(trimmed.replace('##OBJECTIVES##', '').trim().split('||').filter(Boolean));
          } else if (trimmed.startsWith('##HEADING##')) {
            finalizeLastItem();
            startNewBoardPage();
            const content = trimmed.replace('##HEADING##', '').trim();
            appendItem('heading', content);
          } else if (trimmed.startsWith('##BULLETS##')) {
            finalizeLastItem();
            const content = trimmed.replace('##BULLETS##', '').trim();
            appendItem('bullets', content);
          } else if (trimmed.startsWith('##DIAGRAM##')) {
            finalizeLastItem();
            const content = trimmed.replace('##DIAGRAM##', '').trim();
            appendItem('diagram', content);
          } else if (trimmed.startsWith('##QUIZ##')) {
            finalizeLastItem();
            const content = trimmed.replace('##QUIZ##', '').trim();
            appendItem('quiz', content);
          } else if (trimmed.startsWith('##CODE##')) {
            finalizeLastItem();
            const content = trimmed.replace('##CODE##', '').trim();
            appendItem('code', content);
          } else if (trimmed.startsWith('##TEXT##')) {
            finalizeLastItem();
            const content = trimmed.replace('##TEXT##', '').trim();
            if (content) appendItem('text', content);
          } else if (trimmed.startsWith('##CHECK##')) {
            finalizeLastItem();
            const content = trimmed.replace('##CHECK##', '').trim();
            if (content) appendItem('check', content);
          } else if (trimmed.startsWith('##PAUSE##')) {
            setIsPaused(true);
          } else if (trimmed.startsWith('##RESUME##')) {
            setIsPaused(false);
          }
        }
      }

      finalizeLastItem();
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      // Fallback: teach without API
      fallbackTeaching(teachTopic, level);
    } finally {
      setIsGenerating(false);
      setAssistantEmotion('happy');
      setAssistantAnimation('idle');
      setTeacherState('happy');
      setBoardPages(prev => {
        const pages = [...prev];
        const last = { ...pages[pages.length - 1] };
        last.items = last.items.map(item => ({ ...item, isStreaming: false }));
        pages[pages.length - 1] = last;
        return pages;
      });
    }
  }, [inputTopic, topic, level, teacher, user, setAssistantEmotion, setAssistantAnimation, speakText]);

  const buildTeacherPrompt = (t: typeof teacher, teachTopic: string, lvl: string) => {
    const styleMap: Record<string, string> = {
      professor: 'Teach like a university professor with structured, comprehensive explanations. Use formal language, build from fundamentals, and cover topics in depth.',
      coach: 'Teach like a motivational coach with practical, hands-on explanations. Focus on "why this matters" and real applications. Be encouraging.',
      friend: 'Teach like a friendly guide. Use casual language, humor, and everyday analogies. Make learning feel natural and fun. Say things like "think of it this way..."',
      expert: 'Teach like a senior industry expert. Focus on best practices, advanced insights, and professional techniques. Be precise and authoritative.',
      simplifier: 'Teach like someone who makes complex topics simple. Use step-by-step breakdowns, simple analogies, and clear explanations. "Explain like I\'m 5" approach.',
    };

    return `Teach a live, conversational lesson on "${teachTopic}" tailored for a ${lvl} student.

Your teaching style: ${styleMap[t.id] || styleMap.professor}

Guidelines for a modern AI tutor experience:
1. Lead with a strong hook and explain why the topic matters right away.
2. Use short, conversational explanations that sound like a skilled mentor speaking directly to a learner.
3. Break the lesson into a few focused moments rather than a rigid board outline: hook, concept, example, pitfall, action step.
4. Use one concrete analogy per important idea and keep the language clear and practical.
5. If code is relevant, include a compact, commented example that feels natural to read.
6. Keep the lesson interactive by occasionally asking a quick check-in or prompting the student to think through a tiny challenge.
7. Make the response feel like a polished Gemini/Copilot-style tutor: crisp, precise, and encouraging.

Structure your lesson as a streaming tutor conversation:
##TITLE## The lesson title
##OBJECTIVES## Objective 1||Objective 2||Objective 3
##TEXT## Start with a warm introduction and explain the real-world relevance.
##HEADING## A focused concept block
##BULLETS## Key idea 1||Key idea 2||Key idea 3
##TEXT## Explain the concept in plain language with a simple analogy.
##CODE## language\ncode block (only if code is relevant)
##CHECK## A short prompt that keeps the learner engaged
##TEXT## Finish with a practical takeaway or a tiny next step.

Keep the pacing natural, never overly formal, and make each chunk feel like part of a live conversation rather than a static slide deck.`;
  };

  const fallbackTeaching = (teachTopic: string, lvl: string) => {
    const page1: BoardContentItem[] = [
      { id: generateId(), type: 'heading', content: `Introduction to ${teachTopic}`, isStreaming: false, timestamp: new Date() },
      { id: generateId(), type: 'bullets', content: `Welcome to our session on ${teachTopic}||We will learn the fundamental concepts step-by-step||This lesson is designed for a ${lvl} level student`, isStreaming: false, timestamp: new Date() },
      { id: generateId(), type: 'diagram', content: JSON.stringify({
        root: { label: teachTopic },
        children: [
          { label: 'Introduction' },
          { label: 'Core Goals' }
        ]
      }), isStreaming: false, timestamp: new Date() },
      { id: generateId(), type: 'quiz', content: JSON.stringify({
        question: `What is the primary focus of learning ${teachTopic}?`,
        options: ["Learning step-by-step from first principles", "Rote memorization of codes", "Skipping fundamentals"],
        answer: "Learning step-by-step from first principles",
        explanation: "AURA Learn designs curriculum around step-by-step conceptual mapping and analogies."
      }), isStreaming: false, timestamp: new Date() }
    ];

    const page2: BoardContentItem[] = [
      { id: generateId(), type: 'heading', content: 'Key Conceptual Layout', isStreaming: false, timestamp: new Date() },
      { id: generateId(), type: 'bullets', content: `Understanding the structural relationships is key||Concepts branch from a central root module||Review the visual connections on the board`, isStreaming: false, timestamp: new Date() },
      { id: generateId(), type: 'diagram', content: JSON.stringify({
        root: { label: 'System Architecture' },
        children: [
          { label: 'Isolation' },
          { label: 'Interoperability' },
          { label: 'Scalability' }
        ]
      }), isStreaming: false, timestamp: new Date() },
      { id: generateId(), type: 'quiz', content: JSON.stringify({
        question: "Which pattern maps parent concepts down to branch modules?",
        options: ["Hierarchical tree structure", "Linear sequence chain", "None of these"],
        answer: "Hierarchical tree structure",
        explanation: "A hierarchical tree structure centers around a main concept (parent node) and branches out into specific nodes (children)."
      }), isStreaming: false, timestamp: new Date() }
    ];

    const page3: BoardContentItem[] = [
      { id: generateId(), type: 'heading', content: 'Practice & Summary', isStreaming: false, timestamp: new Date() },
      { id: generateId(), type: 'bullets', content: `Apply what you've learned to simple exercises||Keep practicing regularly to build muscle memory||Ask questions anytime if you face doubts`, isStreaming: false, timestamp: new Date() },
      { id: generateId(), type: 'diagram', content: JSON.stringify({
        root: { label: 'Summary Action' },
        children: [
          { label: 'Exercise Practice' },
          { label: 'Conceptual Check' }
        ]
      }), isStreaming: false, timestamp: new Date() },
      { id: generateId(), type: 'quiz', content: JSON.stringify({
        question: "Why should you regularly practice exercises?",
        options: ["To build muscle memory and reinforce core logic", "Only to clear exams", "It is not recommended"],
        answer: "To build muscle memory and reinforce core logic",
        explanation: "Regular practice transforms theoretical rules into code muscle memory, critical for senior engineering success."
      }), isStreaming: false, timestamp: new Date() }
    ];

    if (teachTopic.toLowerCase().includes('python') || teachTopic.toLowerCase().includes('code') || teachTopic.toLowerCase().includes('program')) {
      page2.splice(page2.length - 1, 0, {
        id: generateId(),
        type: 'code',
        content: '# Code Example\ndef main():\n    # System core processing\n    print("System active")\n\nif __name__ == "__main__":\n    main()',
        isStreaming: false,
        timestamp: new Date()
      });
    }

    setLessonTitle(`Learning ${teachTopic}`);
    setObjectives([`Understand ${teachTopic} fundamentals`, `Apply concepts in practice`, `Build confidence with ${lvl} level exercises`]);
    setBoardPages([
      { id: generateId(), pageNumber: 1, items: page1, createdAt: new Date(), downloaded: false },
      { id: generateId(), pageNumber: 2, items: page2, createdAt: new Date(), downloaded: false },
      { id: generateId(), pageNumber: 3, items: page3, createdAt: new Date(), downloaded: false }
    ]);
    setCurrentPage(0);
  };

  const handleDoubtSubmit = useCallback(async () => {
    if (!doubtQuestion.trim()) return;
    setDoubtLoading(true);
    setDoubtAnswer('');

    // Save what's on the board for resume context
    const currentBoardState = currentBoard?.items || [];

    // Pause teaching
    setIsPaused(true);

    try {
      const res = await fetch('/api/v1/agents/public/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `The student is learning about "${lessonTitle || topic}" with a ${teacherId} style teacher. They asked: "${doubtQuestion}"

Current lesson context: ${currentBoardState.map(i => i.type + ': ' + i.content).join('\n')}

Answer their doubt in the style of ${teacher.name} (${teacher.teachingApproach} teacher).
Return as JSON: {"explanation": "clear answer", "codeExample": "code if relevant"}

Keep the explanation focused and helpful. After answering, say "Ready to continue?" to resume the lesson.`,
          system_prompt: teacher.description,
        }),
      });
      const data = await res.json();
      const rawResponse = data?.data?.response || 'I understand your question. Let me explain...';
      let parsed: Record<string, string> = {};
      try { parsed = JSON.parse(rawResponse); } catch { parsed = { explanation: rawResponse }; }

      const answer = parsed.explanation || rawResponse;
      setDoubtAnswer(answer);

      // Speak the answer
      speakText(answer);

      // Add doubt answer to board as a special text item
      const answerItem: BoardContentItem = {
        id: generateId(),
        type: 'text',
        content: `📝 Doubt: "${doubtQuestion}"\n💡 ${teacher.name}: ${answer}`,
        isStreaming: false,
        timestamp: new Date(),
      };

      setBoardPages(prev => {
        const pages = [...prev];
        const current = { ...pages[pages.length - 1] };
        current.items = [...current.items, answerItem];
        pages[pages.length - 1] = current;
        return pages;
      });

      // Show the code example if any
      const codeExample = parsed.codeExample;
      if (codeExample) {
        setBoardPages(prev => {
          const pages = [...prev];
          const current = { ...pages[pages.length - 1] };
          current.items = [...current.items, {
            id: generateId(), type: 'code', content: codeExample,
            isStreaming: false, timestamp: new Date(),
          }];
          pages[pages.length - 1] = current;
          return pages;
        });
      }
    } catch {
      setDoubtAnswer(`Great question! Let me explain "${doubtQuestion}". The key point is to understand the fundamental concept first, then practice with examples. Ready to continue with the lesson?`);
    } finally {
      setDoubtLoading(false);
      setDoubtQuestion('');
    }
  }, [doubtQuestion, lessonTitle, topic, teacherId, teacher, currentBoard, speakText]);

  const resumeLesson = useCallback((skipCancel = false) => {
    setIsPaused(false);
    setDoubtAnswer('');
    setAssistantEmotion('happy');
    setAssistantAnimation('idle');
    // Continue speaking if there's more content
    if (!skipCancel) window.speechSynthesis.cancel();
  }, [setAssistantEmotion, setAssistantAnimation]);

  const downloadBoardPage = useCallback((page: BoardPage) => {
    const content = [
      `# ${lessonTitle || 'Lesson Notes'}`,
      `Page ${page.pageNumber}`,
      `Generated: ${page.createdAt.toLocaleString()}`,
      '',
      ...page.items.map(item => {
        switch(item.type) {
          case 'heading': return `\n## ${item.content}\n`;
          case 'text': return `\n${item.content}\n`;
          case 'code': return `\n\`\`\`\n${item.content}\n\`\`\`\n`;
          default: return item.content;
        }
      }),
      '',
      '---',
      'Generated by AURA Learn AI Teacher',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lessonTitle || 'lesson'}-page-${page.pageNumber}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [lessonTitle]);

  const downloadFullCourse = useCallback(() => {
    const allContent = boardPages.map(page => [
      `# Page ${page.pageNumber}`,
      ...page.items.map(item => {
        switch(item.type) {
          case 'heading': return `\n## ${item.content}\n`;
          case 'text': return `\n${item.content}\n`;
          case 'code': return `\n\`\`\`\n${item.content}\n\`\`\`\n`;
          default: return item.content;
        }
      }),
    ].join('\n'));

    const content = [
      `# ${lessonTitle || 'Full Course Notes'}`,
      `Teacher: ${teacher.name}`,
      `Total Pages: ${boardPages.length}`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      ...allContent,
      '',
      '---',
      'Generated by AURA Learn AI Teacher',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lessonTitle || 'full-course'}-notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [boardPages, lessonTitle, teacher.name]);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    setIsGenerating(false);
    setAssistantEmotion('neutral');
    setAssistantAnimation('idle');
  }, [setAssistantEmotion, setAssistantAnimation]);

  // Flying assistant position tracking
  useEffect(() => {
    if (currentItemRef.current && flyingRef.current) {
      const rect = currentItemRef.current.getBoundingClientRect();
      const classroom = classroomRef.current?.getBoundingClientRect();
      if (classroom) {
        flyingRef.current.style.transform = `translate(${rect.left - classroom.left}px, ${rect.top - classroom.top - 40}px)`;
      }
    }
  }, [currentPage, boardPages]);

  const getCanvasStyle = () => {
    switch (canvasTheme) {
      case 'chalk':
        return {
          backgroundColor: '#0b221a',
          backgroundImage: gridPattern === 'none' ? 'none' : 
            gridPattern === 'dots' ? 'radial-gradient(rgba(255, 255, 255, 0.03) 1.5px, transparent 1.5px)' :
            'linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          fontFamily: 'var(--font-patrick), var(--font-caveat), Chalkboard SE, Comic Sans MS, cursive',
        };
      case 'studio':
        return {
          backgroundColor: '#ffffff',
          backgroundImage: gridPattern === 'none' ? 'none' : 
            gridPattern === 'dots' ? 'radial-gradient(rgba(99, 102, 241, 0.04) 1.5px, transparent 1.5px)' :
            'linear-gradient(rgba(99, 102, 241, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.02) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          fontFamily: 'var(--font-caveat), var(--font-patrick), Chalkboard SE, Comic Sans MS, cursive',
        };
      case 'terminal':
        return {
          backgroundColor: '#000000',
          backgroundImage: gridPattern === 'none' ? 'none' : 
            'linear-gradient(rgba(51, 255, 51, 0.02) 2px, transparent 2px)',
          backgroundSize: '100% 4px',
          fontFamily: 'Courier New, Courier, monospace',
        };
      case 'cyber':
      default:
        return {
          backgroundColor: '#060a13',
          backgroundImage: gridPattern === 'none' ? 'none' : 
            gridPattern === 'dots' ? 'radial-gradient(rgba(139, 92, 246, 0.08) 1.5px, transparent 1.5px)' :
            'linear-gradient(rgba(139, 92, 246, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.015) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
          fontFamily: 'Inter, sans-serif',
        };
    }
  };

  const getCanvasTextClass = () => {
    switch (canvasTheme) {
      case 'chalk': return 'chalk-text font-chalk';
      case 'studio': return 'text-slate-800 font-whiteboard';
      case 'terminal': return 'text-[#33ff33]';
      case 'cyber':
      default:
        return 'text-slate-100';
    }
  };

  const boardBgStyle = getCanvasStyle();
  const boardText = getCanvasTextClass();

  const renderTranscriptItem = (item: BoardContentItem) => {
    const baseCard = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-sm';

    switch (item.type) {
      case 'heading':
        return (
          <div className="mb-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-indigo-300">
              <Sparkles className="h-3 w-3" />
              {lessonTitle || 'Live Lesson'}
            </div>
            <h3 className="mt-3 text-xl font-semibold text-white">{item.content}</h3>
          </div>
        );
      case 'bullets':
        return (
          <div className={cn(baseCard, 'p-4')}>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              <Bot className="h-3.5 w-3.5" />
              Professor explanation
            </div>
            <ul className="space-y-2 text-sm leading-6 text-slate-200">
              {item.content.split('||').filter(Boolean).map((bullet, idx) => (
                <li key={`${item.id}-${idx}`} className="flex gap-2">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      case 'code':
        return (
          <div className={cn(baseCard, 'overflow-hidden p-0')}>
            <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/70 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-slate-400">
              <span>Code example</span>
              <button
                onClick={() => navigator.clipboard.writeText(item.content)}
                className="rounded-md border border-white/10 px-2 py-1 text-[10px] text-slate-300"
              >
                Copy
              </button>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap p-4 text-sm leading-6 text-slate-100">{item.content}</pre>
          </div>
        );
      case 'check':
        return (
          <div className={cn(baseCard, 'border-cyan-500/30 bg-cyan-500/10 p-4')}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">Quick check</div>
            <p className="mt-2 text-sm text-slate-100">{item.content}</p>
          </div>
        );
      case 'quiz':
        return (
          <div className={cn(baseCard, 'border-amber-500/30 bg-amber-500/10 p-4')}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-300">Checkpoint</div>
            <p className="mt-2 text-sm text-slate-100">{item.content}</p>
          </div>
        );
      case 'text':
      default:
        return (
          <div className={cn(baseCard, 'p-4')}>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Follow-up</div>
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-200">{item.content}</p>
          </div>
        );
    }
  };

  const renderSlideContent = (items: BoardContentItem[]) => {
    if (!items || items.length === 0) return null;

    const headingItem = items.find(i => i.type === 'heading');
    const bulletsItem = items.find(i => i.type === 'bullets');
    const diagramItem = items.find(i => i.type === 'diagram');
    const codeItem = items.find(i => i.type === 'code');
    const quizItem = items.find(i => i.type === 'quiz');
    const checkItem = items.find(i => i.type === 'check');
    const textItems = items.filter(i => i.type === 'text');

    const hasSplitLayout = bulletsItem && diagramItem;

    return (
      <div className="space-y-6 w-full text-left">
        {/* Slide Heading */}
        {headingItem && (
          <motion.div
            key={headingItem.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-b border-white/5 pb-3 mb-6"
          >
            {canvasTheme === 'chalk' ? (
              <h2 className="text-3xl font-bold tracking-tight chalk-text-yellow border-b border-dashed border-yellow-200/20 pb-1 w-full">
                ✨ {headingItem.content}
                {headingItem.isStreaming && <span className="inline-block w-2.5 h-6 ml-1.5 bg-yellow-200 animate-pulse align-middle" />}
              </h2>
            ) : (
              <div className="flex items-center gap-3">
                <span className="h-6 w-1.5 rounded-full bg-gradient-to-b from-primary to-purple-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] shrink-0" />
                <h2 className={cn('text-2xl font-bold tracking-tight', canvasTheme === 'studio' ? 'text-slate-800' : 'text-white')}>
                  {headingItem.content}
                  {headingItem.isStreaming && <span className="inline-block w-2.5 h-6 ml-1.5 bg-primary animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)] align-middle" />}
                </h2>
              </div>
            )}
          </motion.div>
        )}

        {/* Main Slide Body Grid */}
        {hasSplitLayout ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-[380px] w-full">
            {/* Left Column: Bullets */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <ul className="space-y-3 text-left">
                {bulletsItem.content.split('||').map((bullet, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.15 + 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <span className={cn('h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1 select-none',
                      canvasTheme === 'chalk' ? 'text-cyan-300 font-chalk' : 'text-indigo-400 font-sans'
                    )}>
                      ✦
                    </span>
                    <span className={cn("text-lg leading-relaxed font-semibold", 
                      canvasTheme === 'chalk' ? 'chalk-text' : canvasTheme === 'studio' ? 'text-slate-800 font-whiteboard' : 'text-slate-200'
                    )}>
                      {bullet}
                    </span>
                  </motion.li>
                ))}
              </ul>
              {bulletsItem.isStreaming && (
                <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-2" />
              )}
            </motion.div>

            {/* Right Column: Visual Diagram */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center items-center w-full"
            >
              <ConceptDiagram dataString={diagramItem.content} theme={canvasTheme} />
            </motion.div>
          </div>
        ) : (
          // Non-split Layout fallback (Standard full-width elements rendered one by one)
          <div className="space-y-6 w-full">
            {bulletsItem && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 text-left"
              >
                <ul className="space-y-2">
                  {bulletsItem.content.split('||').map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="h-5 w-5 text-indigo-400 mt-1 font-bold">✦</span>
                      <span className={cn("text-lg leading-relaxed", canvasTheme === 'chalk' ? 'chalk-text' : '')}>
                        {bullet}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {diagramItem && (
              <div className="flex justify-center my-6">
                <ConceptDiagram dataString={diagramItem.content} theme={canvasTheme} />
              </div>
            )}
            
            {textItems.map((txt) => (
              <div key={txt.id} className={cn('p-4 rounded-xl', canvasTheme === 'chalk' ? 'chalk-text' : 'text-slate-300')}>
                <p className="text-lg leading-relaxed whitespace-pre-wrap">{txt.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Code Projector Screen (if present) */}
        {codeItem && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative my-6 px-1 md:px-4"
          >
            {/* Projector Screen Casing */}
            <div className="h-6 w-full bg-slate-400 rounded-full border border-slate-500 shadow-md flex items-center justify-between px-4 relative z-20 select-none">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
              <div className="text-[9px] text-slate-700 font-bold tracking-widest uppercase font-mono truncate max-w-[200px] md:max-w-none">
                PROJECTOR SCREEN // {codeItem.content.split('\n')[0].startsWith('#') 
                  ? codeItem.content.split('\n')[0].replace('#', '').trim() 
                  : 'source-code.py'}
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
            </div>
            {/* Hanger cords */}
            <div className="flex justify-between px-8 -mt-1 relative z-10 select-none">
              <div className="w-0.5 h-2 bg-slate-500" />
              <div className="w-0.5 h-2 bg-slate-500" />
            </div>
            {/* The Projected Screen Body */}
            <div className="bg-[#f8fafc] border-x-[8px] border-b-[8px] border-slate-300 rounded-b-xl shadow-2xl overflow-hidden relative">
              {/* Light beams projection glow */}
              <div className="absolute inset-0 bg-indigo-500/5 mix-blend-screen pointer-events-none" />
              
              <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200 select-none">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(codeItem.content);
                    toast.success('Code copied!');
                  }}
                  className="text-[11px] px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium font-sans"
                >
                  Copy Code
                </button>
              </div>
              <div className="p-5 font-mono text-sm leading-relaxed overflow-x-auto text-slate-800">
                <pre className="whitespace-pre-wrap">{codeItem.content}</pre>
                {codeItem.isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-indigo-500 animate-pulse" />}
              </div>
              {/* Screen Pull Ring/Handle */}
              <div className="w-full flex justify-center py-1 bg-slate-200/50 border-t border-slate-200 select-none">
                <div className="w-3 h-3 rounded-full border-2 border-slate-400 flex items-center justify-center cursor-pointer" title="Pull Screen" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Checkpoint Quiz */}
        {checkItem && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 backdrop-blur-md space-y-3 my-6 text-left"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <MessageCircleQuestion className="h-4 w-4" /> Quick Check
              </span>
              <Badge size="sm" className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                still with me?
              </Badge>
            </div>
            <p className="text-base font-semibold text-slate-100">{checkItem.content}</p>
            <p className="text-xs text-slate-400">Think it through — then ask your doubt in the chat, or just say it aloud in voice mode.</p>
          </motion.div>
        )}

        {quizItem && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl border-2 border-dashed border-indigo-500/20 bg-slate-900/60 backdrop-blur-md space-y-4 my-6 text-left"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 animate-spin text-primary" /> Checkpoint Challenge
              </span>
              <Badge variant="primary" size="sm">
                +50 XP Reward
              </Badge>
            </div>

            {(() => {
              try {
                let cleaned = quizItem.content.trim();
                if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/```json|```/g, '').trim();
                else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/```/g, '').trim();
                
                const quizData = JSON.parse(cleaned);
                const questionId = quizItem.id;
                const isSubmitted = submittedAnswers[questionId];
                const selected = selectedAnswers[questionId];
                const isCorrect = selected === quizData.answer;

                return (
                  <div className="space-y-4">
                    <p className="text-base font-bold text-slate-100">{quizData.question}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {quizData.options.map((opt: string, oIdx: number) => {
                        const isSelected = selected === opt;
                        const isCorrectOpt = opt === quizData.answer;
                        
                        let btnStyle = "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300";
                        if (isSelected) {
                          if (isSubmitted) {
                            btnStyle = isCorrect 
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                              : "bg-red-500/20 border-red-500 text-red-300 font-bold";
                          } else {
                            btnStyle = "bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold";
                          }
                        } else if (isSubmitted && isCorrectOpt) {
                          btnStyle = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold";
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={isSubmitted}
                            onClick={() => setSelectedAnswers(prev => ({ ...prev, [questionId]: opt }))}
                            className={cn("p-3 rounded-xl border text-sm text-left transition-all duration-300", btnStyle)}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {!isSubmitted ? (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={!selected}
                        onClick={() => {
                          setSubmittedAnswers(prev => ({ ...prev, [questionId]: true }));
                          handleQuizAnswer(isCorrect, lessonTitle || topic, selected);
                        }}
                        className="w-full h-9 font-bold"
                      >
                        Submit Answer
                      </Button>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className={cn("p-4 rounded-xl text-xs space-y-1.5 leading-relaxed", 
                          isCorrect ? "bg-emerald-500/5 text-emerald-400" : "bg-red-500/5 text-red-400"
                        )}
                      >
                        <p className="font-bold uppercase tracking-wider text-[10px]">
                          {isCorrect ? "🎉 Correct!" : "❌ Try Again Next Time"}
                        </p>
                        <p className="text-slate-300">{quizData.explanation}</p>
                        {isPaused && (
                          <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={() => resumeLesson()}
                            className="mt-3 h-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                          >
                            Continue Lecture
                          </Button>
                        )}
                      </motion.div>
                    )}
                  </div>
                );
              } catch (e) {
                return (
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                    <span>Streaming checkpoint question...</span>
                  </div>
                );
              }
            })()}
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 h-[calc(100vh-4rem)] flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowSettingsPanel(!showSettingsPanel)}
                className="flex items-center gap-1.5"
              >
                <Settings className="h-4 w-4" />
                Board Config
              </Button>
              
              {showSettingsPanel && (
                <div className="absolute top-10 left-0 w-80 bg-[#0c101d] border border-white/10 rounded-2xl p-5 shadow-2xl z-50 space-y-4 text-white font-sans text-xs">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="font-bold text-sm text-primary flex items-center gap-1">
                      <Settings className="h-4.5 w-4.5" /> Engine Settings
                    </span>
                    <button onClick={() => setShowSettingsPanel(false)} className="hover:text-red-400">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Theme Selector */}
                  <div className="space-y-2">
                    <span className="font-semibold block text-slate-400">Canvas Theme</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'cyber', name: '🌌 Cyber Neon' },
                        { id: 'chalk', name: '🏫 Classic Chalk' },
                        { id: 'studio', name: '🎨 Tech Studio' },
                        { id: 'terminal', name: '📟 Retro Terminal' }
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => setCanvasTheme(t.id as any)}
                          className={cn("p-2 rounded-xl text-center border font-semibold transition-all",
                            canvasTheme === t.id 
                              ? "bg-primary border-primary text-white" 
                              : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                          )}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grid Selector */}
                  <div className="space-y-2">
                    <span className="font-semibold block text-slate-400">Grid Pattern</span>
                    <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-bold">
                      {[
                        { id: 'cyber', name: 'Cyber' },
                        { id: 'dots', name: 'Dots' },
                        { id: 'lines', name: 'Lines' },
                        { id: 'none', name: 'None' }
                      ].map(g => (
                        <button
                          key={g.id}
                          onClick={() => setGridPattern(g.id as any)}
                          className={cn("p-1.5 rounded-lg border transition-all",
                            gridPattern === g.id 
                              ? "bg-primary border-primary text-white" 
                              : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                          )}
                        >
                          {g.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Focus Ambient Noise */}
                  <div className="space-y-2">
                    <span className="font-semibold block text-slate-400">Ambient Background Audio</span>
                    <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-bold">
                      {[
                        { id: 'off', name: 'Mute' },
                        { id: 'lofi', name: 'Lo-Fi' },
                        { id: 'rain', name: 'Rain' },
                        { id: 'coffee', name: 'Cafe' }
                      ].map(a => (
                        <button
                          key={a.id}
                          onClick={() => setAmbientAudio(a.id as any)}
                          className={cn("p-1.5 rounded-lg border transition-all",
                            ambientAudio === a.id 
                              ? "bg-primary border-primary text-white" 
                              : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                          )}
                        >
                          {a.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Speech Rate Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-semibold">Speech speed:</span>
                      <span className="font-bold text-white">{voiceSpeed}x</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="2" 
                      step="0.1" 
                      value={voiceSpeed}
                      onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>
              )}
            </div>
            <Badge variant="primary" size="sm" dot>
              {isGenerating ? `${teacher.name} is teaching...` : `${teacher.name} is ready`}
            </Badge>
            {aiProvider && (
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2.5 py-1" title="Active AI engine">
                <span className={cn("h-1.5 w-1.5 rounded-full", aiProvider === 'mock' ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse')} />
                {aiProvider}
              </span>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-accent/30 rounded-full px-3 py-1">
              <Quote className="h-3 w-3" />
              {teacher.name} · {teacher.teachingApproach}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as typeof level)}
              className="h-7 px-2 rounded border border-input bg-background text-xs"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <select
              value={selectedVoiceGender}
              onChange={(e) => setSelectedVoiceGender(e.target.value as 'female' | 'male')}
              className="h-7 px-2 rounded border border-input bg-background text-xs font-medium"
            >
              <option value="female">🔊 Sweet Female Voice</option>
              <option value="male">🔊 Sweet Male Voice</option>
            </select>
            <button
              onClick={() => {
                const next = !voiceMode;
                setVoiceMode(next);
                if (next) {
                  startVoiceRecognition();
                } else {
                  stopVoiceRecognition();
                  if (window.speechSynthesis) window.speechSynthesis.cancel();
                  setIsSpeakingLesson(false);
                }
              }}
              className={cn(
                "h-7 px-2.5 rounded-full border text-[10px] font-bold flex items-center gap-1.5 transition-all",
                voiceMode
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                  : "border-input bg-background text-muted-foreground hover:text-slate-200"
              )}
              title="Voice mode — AURA speaks each slide and listens for spoken doubts"
            >
              {voiceMode ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
              {voiceMode ? 'Voice ON' : 'Voice Mode'}
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDashboard(!showDashboard)}
              className={cn("flex items-center gap-1 h-7 text-xs font-semibold px-2.5 rounded border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400")}
              title="Show Analytics Dashboard"
            >
              <Award className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </Button>
            
            <div className="h-5 w-px bg-border/80 mx-1 select-none" />

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setActiveSidebarTab(activeSidebarTab === 'doubt' ? null : 'doubt')}
              title="Toggle AI Chat Doubt"
              className={cn("h-7 w-7", activeSidebarTab === 'doubt' && "text-primary bg-primary/10")}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setActiveSidebarTab(activeSidebarTab === 'chat' ? null : 'chat')}
              title="Toggle Live Chat"
              className={cn("h-7 w-7", activeSidebarTab === 'chat' && "text-primary bg-primary/10")}
            >
              <Bot className="h-4 w-4" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setActiveSidebarTab(activeSidebarTab === 'notes' ? null : 'notes')}
              title="Toggle Notes Compiler"
              className={cn("h-7 w-7", activeSidebarTab === 'notes' && "text-primary bg-primary/10")}
            >
              <FileText className="h-4 w-4" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setActiveSidebarTab(activeSidebarTab === 'timer' ? null : 'timer')}
              title="Toggle Pomodoro Timer"
              className={cn("h-7 w-7", activeSidebarTab === 'timer' && "text-primary bg-primary/10")}
            >
              <Clock className="h-4 w-4" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setActiveSidebarTab(activeSidebarTab === 'calendar' ? null : 'calendar')}
              title="Toggle Study Calendar"
              className={cn("h-7 w-7", activeSidebarTab === 'calendar' && "text-primary bg-primary/10")}
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsWideView(!isWideView)}
              title="Toggle Wide Lecture Board"
              className={cn("h-7 w-7", isWideView && "text-primary bg-primary/10")}
            >
              {isWideView ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4 rotate-45" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(!isFullscreen)} className="h-7 w-7">
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Live Diagnostics/Telemetry bar */}
        <div className="flex items-center justify-between px-6 py-1.5 bg-[#070b13] border-b border-white/[0.03] text-[10px] text-slate-400 tracking-wider uppercase font-mono select-none">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]" />
              <span>Session: <span className="text-emerald-400 font-semibold">Active</span></span>
            </div>
            <div>
              <span>AI Teacher: <span className="text-purple-400 font-semibold">{teacher.name} ({teacher.teachingApproach})</span></span>
            </div>
            <div>
              <span>Audio Feed: <span className="text-blue-400 font-semibold">{selectedVoiceGender === 'female' ? 'Female (Sweet)' : 'Male (Sweet)'}</span></span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span>Cognitive Stream:</span>
              <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000", isGenerating ? "w-[85%]" : "w-[5%]")} 
                />
              </div>
              <span className="text-[9px] font-semibold text-slate-300">{isGenerating ? "Processing" : "Standby"}</span>
            </div>
            <div>
              <span>Connection: <span className="text-emerald-400 font-semibold">Secure SSL</span></span>
            </div>
          </div>
        </div>

        {/* Main Classroom */}
        <div ref={classroomRef} className="flex-1 flex overflow-hidden relative">
          <div className="hidden w-[30%] min-w-[280px] shrink-0 flex-col border-r border-white/10 bg-[#0b1120] lg:flex">
            <div className="flex items-center gap-3 border-b border-white/10 p-4">
              <div className="relative shrink-0">
                <div className="h-10 w-10 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-1.5">
                  <TeacherAvatar
                    styleId={teacher.id as 'professor' | 'coach' | 'friend' | 'expert' | 'simplifier'}
                    state={teacherState}
                    isFemale={true}
                    className="h-full w-full"
                  />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0b1120] bg-emerald-400 animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{teacher.name} · AI Teacher Chat</p>
                <p className="truncate text-xs text-slate-400">{teacher.teachingApproach}</p>
              </div>
              {lessonTitle && (
                <span className="max-w-[110px] truncate text-[10px] font-mono text-indigo-300">{lessonTitle}</span>
              )}
            </div>
            <ChatPanel
              agentType="teacher"
              title={`Chat with ${teacher.name}`}
              context={{
                currentLesson: lessonTitle || topic,
                currentSlide: currentSection,
                slideIndex: currentPage,
                totalSlides: boardPages.length,
              }}
              voiceMode={voiceMode}
              onVoiceModeChange={setVoiceMode}
              speak={speakText}
              className="flex-1"
            />
          </div>

          <div className="flex-1 min-h-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_45%),linear-gradient(180deg,_#0f172a,_#020617)]">
            <div className="mx-auto flex h-full min-h-0 max-w-5xl flex-col px-4 py-4 sm:px-6 lg:px-8">
              <div className="mb-4 shrink-0 rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-300">AI tutor studio</div>
                    <div className="mt-1 text-xl font-semibold text-white">{lessonTitle || `Learning ${topic || 'your topic'}`}</div>
                  </div>
                  <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
                    {isGenerating ? 'Streaming lesson' : 'Ready'}
                  </div>
                </div>
              </div>

              {/* Slide navigation rail */}
              {boardPages.length > 0 && currentBoard && currentBoard.items.length > 0 && (
                <div className="mb-2 shrink-0 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-1.5 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[11px] text-slate-300 hover:bg-white/10"
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      title="Previous slide"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" /> Prev
                    </Button>
                    <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                      Slide <span className="text-indigo-300 font-semibold">{currentPage + 1}</span> / {boardPages.length}
                    </span>
                    <div className="hidden md:flex items-center gap-1.5">
                      {boardPages.map((page, idx) => (
                        <button
                          key={page.id}
                          onClick={() => setCurrentPage(idx)}
                          title={`Slide ${idx + 1}`}
                          className={cn(
                            "h-1.5 rounded-full transition-all",
                            idx === currentPage
                              ? "w-6 bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                              : "w-1.5 bg-slate-600 hover:bg-slate-400"
                          )}
                        />
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[11px] text-slate-300 hover:bg-white/10"
                      disabled={currentPage >= boardPages.length - 1}
                      onClick={() => setCurrentPage(Math.min(boardPages.length - 1, currentPage + 1))}
                      title="Next slide"
                    >
                      Next <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const next = boardStyle === 'blackboard' ? 'whiteboard' : 'blackboard';
                        setBoardStyle(next);
                        setCanvasTheme(next === 'whiteboard' ? 'studio' : 'cyber');
                      }}
                      title="Toggle blackboard / whiteboard"
                      className={cn(
                        "h-6 px-2.5 rounded-lg border text-[10px] font-semibold flex items-center gap-1.5 transition-all",
                        boardStyle === 'blackboard'
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                          : "border-indigo-500/30 bg-indigo-500/10 text-indigo-300"
                      )}
                    >
                      {boardStyle === 'blackboard' ? (
                        <><Palette className="h-3 w-3" /> Blackboard</>
                      ) : (
                        <><Layers className="h-3 w-3" /> Whiteboard</>
                      )}
                    </button>
                    {isPaused && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => resumeLesson()}
                        className="h-6 px-2.5 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white"
                      >
                        <Play className="h-3 w-3 mr-1" /> Resume
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <div ref={transcriptRef} className="board-container rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-inner">
                {memoryInsight && (
                  <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-300">Memory insight</div>
                    <p className="mt-1 text-sm leading-6">{memoryInsight}</p>
                  </div>
                )}

                {objectives.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {objectives.slice(0, 3).map((objective, idx) => (
                      <span key={idx} className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-200">
                        <span className="font-bold text-primary">{idx + 1}.</span> {objective}
                      </span>
                    ))}
                  </div>
                )}

                {currentBoard && currentBoard.items.length > 0 ? (
                  renderSlideContent(currentBoard.items)
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center text-slate-500 space-y-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                      <Sparkles className="h-7 w-7 text-primary/50" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-400">
                        {isGenerating ? 'AURA is preparing your lesson...' : 'The lesson board is empty'}
                      </p>
                      <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-600">
                        {isGenerating
                          ? 'Slides will stream here as your teacher explains each part.'
                          : 'Type any topic below and press Teach to start your live lesson.'}
                      </p>
                    </div>
                    {isGenerating && (
                      <div className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    )}
                  </div>
                )}

                <div ref={boardEndRef} />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {activeSidebarTab && !isWideView && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '33.333%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className={cn("hidden lg:block border-l border-border bg-card overflow-hidden transition-all duration-300", 
                  boardStyle === 'whiteboard' ? 'bg-slate-50 border-slate-200' : 'bg-[#0c101d] border-white/5 text-white'
                )}
              >
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-2">
                      {activeSidebarTab === 'chat' && <Bot className="h-4 w-4 text-primary" />}
                      {activeSidebarTab === 'doubt' && <MessageSquare className="h-4 w-4 text-primary" />}
                      {activeSidebarTab === 'notes' && <FileText className="h-4 w-4 text-primary" />}
                      {activeSidebarTab === 'timer' && <Clock className="h-4 w-4 text-primary" />}
                      {activeSidebarTab === 'calendar' && <CalendarIcon className="h-4 w-4 text-primary" />}
                      <span className="font-medium">
                        {activeSidebarTab === 'chat' && `Live Chat with ${teacher.name}`}
                        {activeSidebarTab === 'doubt' && `Ask ${teacher.name}`}
                        {activeSidebarTab === 'notes' && 'Class Notes'}
                        {activeSidebarTab === 'timer' && 'Study Timer'}
                        {activeSidebarTab === 'calendar' && 'Study Calendar'}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setActiveSidebarTab(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className={cn('flex-1 overflow-y-auto scrollbar-thin', activeSidebarTab === 'chat' ? '' : 'p-4')}>
                    {activeSidebarTab === 'chat' && (
                      <ChatPanel
                        agentType="teacher"
                        title={`Chat with ${teacher.name}`}
                        context={{
                          currentLesson: lessonTitle || topic,
                          currentSlide: currentSection,
                          slideIndex: currentPage,
                          totalSlides: boardPages.length,
                        }}
                        voiceMode={voiceMode}
                        onVoiceModeChange={setVoiceMode}
                        speak={speakText}
                        className="h-full"
                      />
                    )}

                    {activeSidebarTab === 'doubt' && (
                      <div className="h-full flex flex-col justify-between space-y-4 text-xs font-sans">
                        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin text-left">
                          {doubtAnswer && (
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-slate-300 leading-relaxed whitespace-pre-wrap">
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => <p className="mb-2 text-[13px] leading-relaxed">{children}</p>,
                                  ul: ({ children }) => <ul className="mb-2 space-y-1 pl-4 list-disc">{children}</ul>,
                                  ol: ({ children }) => <ol className="mb-2 space-y-1 pl-4 list-decimal">{children}</ol>,
                                  li: ({ children }) => <li className="text-[13px] leading-relaxed">{children}</li>,
                                  code: ({ children }) => (
                                    <code className="bg-white/10 text-emerald-300 px-1 py-0.5 rounded text-[11px] font-mono">
                                      {children}
                                    </code>
                                  ),
                                  pre: ({ children }) => (
                                    <pre className="mb-2 p-3 rounded-lg bg-slate-950/80 border border-white/10 overflow-x-auto text-[11px] font-mono text-slate-100">
                                      {children}
                                    </pre>
                                  ),
                                  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                                  h3: ({ children }) => <h3 className="mb-1 mt-2 text-sm font-bold text-white">{children}</h3>,
                                }}
                              >
                                {doubtAnswer}
                              </ReactMarkdown>
                            </div>
                          )}
                          {doubtLoading && (
                            <div className="flex items-center gap-2 text-slate-400">
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                              <span>{teacher.name} is thinking...</span>
                            </div>
                          )}
                          {!doubtAnswer && !doubtLoading && (
                            <div className="text-center py-8 text-slate-500">
                              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                              <p>Ask a doubt regarding the lecture and receive first-principles answers.</p>
                            </div>
                          )}
                        </div>
                        <div className="pt-2 border-t border-white/5 space-y-2">
                          <div className="flex gap-2">
                            <Input
                              value={doubtQuestion}
                              onChange={(e) => setDoubtQuestion(e.target.value)}
                              placeholder="Type doubt..."
                              className="h-9 text-xs"
                              onKeyDown={(e) => e.key === 'Enter' && handleDoubtSubmit()}
                            />
                            <Button variant="primary" size="icon" onClick={handleDoubtSubmit} isLoading={doubtLoading} className="h-9 w-9 shrink-0">
                              <Send className="h-3.5 w-3.5" />
                            </Button>
                            <button
                              onClick={isListeningVoice ? stopVoiceRecognition : startVoiceRecognition}
                              className={cn(
                                "h-9 w-9 rounded-xl border flex items-center justify-center transition-all shrink-0",
                                isListeningVoice 
                                  ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse" 
                                  : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
                              )}
                              title="Voice Mode Doubt"
                            >
                              <span className="text-sm">🎙️</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSidebarTab === 'notes' && (
                      <NotesGenerator
                        boardPages={boardPages}
                        topic={lessonTitle || topic || 'Lecture Topic'}
                        className="border-none bg-transparent backdrop-blur-none p-0"
                      />
                    )}

                    {activeSidebarTab === 'timer' && (
                      <PomodoroTimer className="border-none bg-transparent backdrop-blur-none p-0" />
                    )}

                    {activeSidebarTab === 'calendar' && (
                      <CalendarIntegration />
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card">
          <div className="flex items-center gap-2">
            <div className="flex gap-2 w-full max-w-md">
              <Input
                value={inputTopic}
                onChange={(e) => setInputTopic(e.target.value)}
                placeholder="Enter any topic to learn..."
                className="h-9 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && generateLesson()}
              />
              {isGenerating ? (
                <Button variant="destructive" size="sm" onClick={stopGeneration}>
                  <StopCircle className="h-4 w-4 mr-1" /> Stop
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={generateLesson} disabled={!inputTopic.trim()}>
                  <Sparkles className="h-4 w-4 mr-1" /> {course ? 'Teach Course' : 'Teach'}
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => {
              if (isSpeakingLesson) stopSpeaking();
              else {
                const text = currentBoard?.items.filter(i => i.type === 'text').map(i => i.content).join('. ');
                if (text) speakText(text);
              }
            }}>
              {isSpeakingLesson ? <VolumeX className="h-4 w-4 mr-1" /> : <Volume2 className="h-4 w-4 mr-1" />}
              {isSpeakingLesson ? 'Mute' : 'Voice'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setActiveSidebarTab(activeSidebarTab === 'doubt' ? null : 'doubt')} className={cn(activeSidebarTab === 'doubt' && "text-primary bg-primary/10")}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Doubt
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setActiveSidebarTab(activeSidebarTab === 'notes' ? null : 'notes')} className={cn(activeSidebarTab === 'notes' && "text-primary bg-primary/10")}>
              <FileText className="h-4 w-4 mr-2" />
              Notes
            </Button>
          </div>
        </div>
      </div>

      {showDashboard && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4 font-sans text-white">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-4xl relative"
          >
            <button
              onClick={() => setShowDashboard(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all z-[100] hover:scale-105"
            >
              <X className="h-5 w-5" />
            </button>
            <StudentDashboard
              level={level}
              xpPoints={xpPoints}
              weakTopics={weakTopics}
              quizHistory={quizHistory}
            />
          </motion.div>
        </div>
      )}
    </main>
  );
}