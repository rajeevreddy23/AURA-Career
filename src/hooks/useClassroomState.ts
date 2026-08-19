'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { ProfessorState } from '@/components/classroom/AIProfessorAvatar';
import { getCourseSyllabus, COURSE_SYLLABI } from '@/lib/constants/syllabi';

export interface LessonSlide {
  slideId: string;
  title: string;
  speech: string;
  exampleTitle: string;
  conceptTag?: string;
  code: string;
  output: string;
  explanation: string;
  keyPoints: string[];
  diagramType: 'hashmap' | 'array' | 'tree' | 'flowchart' | 'none';
}

export interface LessonModule {
  moduleId: string;
  moduleTitle: string;
  chapterSummary?: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  slides: LessonSlide[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'professor';
  name: string;
  text: string;
  timestamp: string;
  isAI?: boolean;
  codeSnippet?: string;
  output?: string;
  suggestedFollowUp?: string;
  memoryInsight?: string;
}

export interface LiveSessionNote {
  id: string;
  timestamp: string;
  moduleTitle: string;
  slideTitle: string;
  bullets: string[];
}

export interface CodingChallenge {
  id?: string;
  title: string;
  description?: string;
  instructions?: string[] | string;
  starterCode: string;
  solutionCode?: string;
  language?: string;
  hints?: string[];
  testCases: Array<{
    input: string;
    expected?: string;
    expectedOutput?: string;
    description?: string;
    explanation?: string;
  }>;
}

export interface DoubtResolution {
  doubtText?: string;
  title?: string;
  summary?: string;
  proTip?: string;
  answer?: string;
  breakdown?: string[];
  breakdownSteps?: string[];
  codeComparison?: {
    before?: string;
    after?: string;
    antiPattern?: string;
    robustSolution?: string;
    beforeDesc?: string;
    afterDesc?: string;
    explanation?: string;
  };
  codeSnippet?: string;
  output?: string;
  suggestedFollowUp?: string;
  memoryInsight?: string;
}

export interface ClassroomSessionState {
  sessionId: string;
  courseId: string;
  courseTitle: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  persona: string;
  voiceGender: 'male' | 'female';
  modules: LessonModule[];
  currentModuleIndex: number;
  currentSlideIndex: number;
  conversation: ChatMessage[];
  notes: LiveSessionNote[];
  aiState: ProfessorState;
  voiceState: 'idle' | 'recording' | 'speaking';
  connectionStatus: 'connected' | 'reconnecting' | 'disconnected';
  lastActivityTimestamp: number;
}

export function useClassroomState(initialCourseId = '1') {
  const [courseId, setCourseId] = useState(initialCourseId);

  // Initialize session state with real syllabus
  const [session, setSession] = useState<ClassroomSessionState>(() => {
    const initialSyllabus = getCourseSyllabus(initialCourseId);
    return {
      sessionId: `session-${Date.now()}`,
      courseId: initialCourseId,
      courseTitle: initialSyllabus.courseTitle,
      topic: initialSyllabus.modules[0]?.slides[0]?.title || initialSyllabus.courseTitle,
      difficulty: 'beginner',
      persona: 'Professor Aura',
      voiceGender: 'female',
      modules: initialSyllabus.modules,
      currentModuleIndex: 0,
      currentSlideIndex: 0,
      conversation: [
        {
          id: 'welcome-msg',
          sender: 'professor',
          name: 'Professor Aura',
          text: `Welcome to **${initialSyllabus.courseTitle}**! I am your AI Professor. Today we will explore ${initialSyllabus.modules.length} comprehensive modules from first principles.\n\nLet us begin with Chapter 1: **${initialSyllabus.modules[0]?.moduleTitle || 'Foundations'}**.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAI: true,
          memoryInsight: 'Curriculum roadmap synchronized with your enrolled difficulty level.',
        },
      ],
      notes: [],
      aiState: 'teaching',
      voiceState: 'idle',
      connectionStatus: 'connected',
      lastActivityTimestamp: Date.now(),
    };
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Load course and enrollment on client mount or URL change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const urlCourseId = params.get('courseId') || params.get('course') || courseId;
    const urlLevel = (params.get('level') || params.get('diff')) as 'beginner' | 'intermediate' | 'advanced' | null;

    let targetLevel: 'beginner' | 'intermediate' | 'advanced' = urlLevel || 'beginner';
    let resumeModIdx = 0;
    let resumeSlideIdx = 0;
    let existingNotes: LiveSessionNote[] = [];

    // Read stored enrollment for this course
    const storedEnrollment = localStorage.getItem(`aura_enrollment_${urlCourseId}`);
    if (storedEnrollment) {
      try {
        const parsed = JSON.parse(storedEnrollment);
        if (parsed.level) targetLevel = parsed.level;
        if (typeof parsed.currentModuleIndex === 'number') resumeModIdx = parsed.currentModuleIndex;
        if (typeof parsed.currentSlideIndex === 'number') resumeSlideIdx = parsed.currentSlideIndex;
        if (Array.isArray(parsed.notes)) existingNotes = parsed.notes;
      } catch {
        // use defaults
      }
    } else {
      const lastLevel = localStorage.getItem('aura_last_level') as any;
      if (lastLevel) targetLevel = lastLevel;
    }

    // Read preferred voice gender
    const storedVoice = localStorage.getItem('aura_preferred_voice') as 'male' | 'female' | null;
    const voiceGender: 'male' | 'female' = storedVoice === 'male' || storedVoice === 'female' ? storedVoice : 'female';

    const courseSyllabus = getCourseSyllabus(urlCourseId, targetLevel);
    setCourseId(urlCourseId);

    // Update modules with resume status
    const updatedModules = courseSyllabus.modules.map((mod, mIdx) => {
      if (mIdx < resumeModIdx) return { ...mod, status: 'completed' as const };
      if (mIdx === resumeModIdx) return { ...mod, status: 'in_progress' as const };
      return { ...mod, status: 'upcoming' as const };
    });

    const activeMod = updatedModules[resumeModIdx] || updatedModules[0];
    const activeSlide = activeMod?.slides[resumeSlideIdx] || activeMod?.slides[0];

    setSession((prev) => ({
      ...prev,
      courseId: urlCourseId,
      courseTitle: courseSyllabus.courseTitle,
      topic: activeSlide?.title || courseSyllabus.courseTitle,
      difficulty: targetLevel,
      voiceGender,
      modules: updatedModules,
      currentModuleIndex: resumeModIdx,
      currentSlideIndex: resumeSlideIdx,
      notes: existingNotes.length > 0 ? existingNotes : prev.notes,
      aiState: 'teaching',
      conversation: [
        {
          id: `welcome-${Date.now()}`,
          sender: 'professor',
          name: 'Professor Aura',
          text: `Welcome to **${courseSyllabus.courseTitle}** (${targetLevel.toUpperCase()} level)!\n\nWe are on **Chapter ${resumeModIdx + 1}: ${activeMod?.moduleTitle}**.\n\n${activeSlide?.speech || ''}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAI: true,
          codeSnippet: activeSlide?.code,
          output: activeSlide?.output,
          memoryInsight: activeSlide?.keyPoints?.[0],
          suggestedFollowUp: `What is the core intuition behind ${activeSlide?.title || activeMod?.moduleTitle}?`,
        },
      ],
    }));
  }, [courseId]);

  // Persist progress changes to localStorage
  const persistProgress = useCallback((nextModIdx: number, nextSlideIdx: number, nextModules: LessonModule[], nextNotes: LiveSessionNote[]) => {
    if (typeof window === 'undefined') return;

    const currentCourseId = session.courseId;
    const progressPercent = Math.round(((nextModIdx + (nextSlideIdx + 1) / (nextModules[nextModIdx]?.slides.length || 1)) / nextModules.length) * 100);

    const enrollmentData = {
      courseId: currentCourseId,
      courseTitle: session.courseTitle,
      level: session.difficulty,
      currentModuleIndex: nextModIdx,
      currentSlideIndex: nextSlideIdx,
      progress: Math.min(100, progressPercent),
      completedModules: nextModules.filter((m) => m.status === 'completed').map((m) => m.moduleId),
      notes: nextNotes,
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem(`aura_enrollment_${currentCourseId}`, JSON.stringify(enrollmentData));
    localStorage.setItem(`aura_course_progress_${currentCourseId}`, String(Math.min(100, progressPercent)));

    // If 100% completed, record into completed courses record for Certificates
    if (nextModIdx >= nextModules.length - 1 && nextSlideIdx >= (nextModules[nextModIdx]?.slides.length || 1) - 1) {
      const storedCompleted = localStorage.getItem('aura_completed_courses');
      let completedList: any[] = [];
      try {
        if (storedCompleted) completedList = JSON.parse(storedCompleted);
      } catch {}

      if (!completedList.some((c) => c.courseId === currentCourseId)) {
        completedList.push({
          id: `AURA-CERT-${currentCourseId}-${Date.now()}`,
          courseId: currentCourseId,
          courseName: session.courseTitle,
          level: session.difficulty,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          grade: 'A+',
          score: 98,
          verificationId: `VERIFIED-${currentCourseId}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          skills: [session.courseTitle.split(' ')[0], 'Architecture', 'Applied Engineering'],
        });
        localStorage.setItem('aura_completed_courses', JSON.stringify(completedList));
      }
    }
  }, [session.courseId, session.courseTitle, session.difficulty]);

  const setAIState = useCallback((nextState: ProfessorState) => {
    setSession((prev) => ({ ...prev, aiState: nextState, lastActivityTimestamp: Date.now() }));
  }, []);

  const setVoiceGender = useCallback((gender: 'male' | 'female') => {
    setSession((prev) => ({ ...prev, voiceGender: gender }));
    if (typeof window !== 'undefined') {
      localStorage.setItem('aura_preferred_voice', gender);
    }
  }, []);

  const setPersona = useCallback((persona: string) => {
    setSession((prev) => ({ ...prev, persona }));
  }, []);

  // Jump to specific module
  const goToModule = useCallback((moduleIdx: number) => {
    setSession((prev) => {
      if (moduleIdx < 0 || moduleIdx >= prev.modules.length) return prev;
      const updated = prev.modules.map((m, i) => {
        if (i < moduleIdx) return { ...m, status: 'completed' as const };
        if (i === moduleIdx) return { ...m, status: 'in_progress' as const };
        return { ...m, status: 'upcoming' as const };
      });
      persistProgress(moduleIdx, 0, updated, prev.notes);
      return {
        ...prev,
        currentModuleIndex: moduleIdx,
        currentSlideIndex: 0,
        modules: updated,
        aiState: 'teaching',
        lastActivityTimestamp: Date.now(),
      };
    });
  }, [persistProgress]);

  // Jump to slide within active module
  const goToSlide = useCallback((slideIdx: number) => {
    setSession((prev) => {
      const activeMod = prev.modules[prev.currentModuleIndex];
      if (!activeMod || slideIdx < 0 || slideIdx >= activeMod.slides.length) return prev;
      persistProgress(prev.currentModuleIndex, slideIdx, prev.modules, prev.notes);
      return {
        ...prev,
        currentSlideIndex: slideIdx,
        aiState: 'teaching',
        lastActivityTimestamp: Date.now(),
      };
    });
  }, [persistProgress]);

  // Jump to specific slide in specific module (for reviewing completed slides)
  const goToSlideInModule = useCallback((moduleIdx: number, slideIdx: number) => {
    setSession((prev) => {
      if (moduleIdx < 0 || moduleIdx >= prev.modules.length) return prev;
      const targetMod = prev.modules[moduleIdx];
      const validSlideIdx = Math.max(0, Math.min(slideIdx, targetMod.slides.length - 1));
      const updated = prev.modules.map((m, i) => {
        if (i < moduleIdx) return { ...m, status: 'completed' as const };
        if (i === moduleIdx) return { ...m, status: 'in_progress' as const };
        return { ...m, status: 'upcoming' as const };
      });
      persistProgress(moduleIdx, validSlideIdx, updated, prev.notes);
      return {
        ...prev,
        currentModuleIndex: moduleIdx,
        currentSlideIndex: validSlideIdx,
        modules: updated,
        aiState: 'teaching',
        lastActivityTimestamp: Date.now(),
      };
    });
  }, [persistProgress]);

  // Next slide or module
  const nextSlideOrModule = useCallback(() => {
    setSession((prev) => {
      const activeMod = prev.modules[prev.currentModuleIndex];
      if (!activeMod) return prev;

      // Next slide in current module
      if (prev.currentSlideIndex + 1 < activeMod.slides.length) {
        const nextSlideIdx = prev.currentSlideIndex + 1;
        persistProgress(prev.currentModuleIndex, nextSlideIdx, prev.modules, prev.notes);
        return {
          ...prev,
          currentSlideIndex: nextSlideIdx,
          aiState: 'teaching',
          lastActivityTimestamp: Date.now(),
        };
      }

      // Next module
      const nextModIdx = prev.currentModuleIndex + 1;
      if (nextModIdx < prev.modules.length) {
        const updated = prev.modules.map((m, i) => {
          if (i < nextModIdx) return { ...m, status: 'completed' as const };
          if (i === nextModIdx) return { ...m, status: 'in_progress' as const };
          return { ...m, status: 'upcoming' as const };
        });
        persistProgress(nextModIdx, 0, updated, prev.notes);
        return {
          ...prev,
          currentModuleIndex: nextModIdx,
          currentSlideIndex: 0,
          modules: updated,
          aiState: 'teaching',
          lastActivityTimestamp: Date.now(),
        };
      }

      // Reached course end
      const allCompleted = prev.modules.map((m) => ({ ...m, status: 'completed' as const }));
      persistProgress(prev.currentModuleIndex, prev.currentSlideIndex, allCompleted, prev.notes);
      return { ...prev, modules: allCompleted, aiState: 'lesson_completed' };
    });
  }, [persistProgress]);

  // Previous slide or module
  const prevSlideOrModule = useCallback(() => {
    setSession((prev) => {
      if (prev.currentSlideIndex > 0) {
        const prevSlideIdx = prev.currentSlideIndex - 1;
        persistProgress(prev.currentModuleIndex, prevSlideIdx, prev.modules, prev.notes);
        return {
          ...prev,
          currentSlideIndex: prevSlideIdx,
          aiState: 'teaching',
          lastActivityTimestamp: Date.now(),
        };
      }

      if (prev.currentModuleIndex > 0) {
        const prevModIdx = prev.currentModuleIndex - 1;
        const prevMod = prev.modules[prevModIdx];
        const lastSlideIdx = Math.max(0, prevMod.slides.length - 1);
        const updated = prev.modules.map((m, i) => {
          if (i < prevModIdx) return { ...m, status: 'completed' as const };
          if (i === prevModIdx) return { ...m, status: 'in_progress' as const };
          return { ...m, status: 'upcoming' as const };
        });
        persistProgress(prevModIdx, lastSlideIdx, updated, prev.notes);
        return {
          ...prev,
          currentModuleIndex: prevModIdx,
          currentSlideIndex: lastSlideIdx,
          modules: updated,
          aiState: 'teaching',
          lastActivityTimestamp: Date.now(),
        };
      }

      return prev;
    });
  }, [persistProgress]);

  const addChatMessage = useCallback((
    sender: 'user' | 'professor',
    text: string,
    name = 'Student',
    extra?: Partial<ChatMessage>
  ) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sender,
      name: sender === 'professor' ? 'Professor Aura' : name,
      text,
      timestamp: timeStr,
      isAI: sender === 'professor',
      ...extra,
    };
    setSession((prev) => ({
      ...prev,
      conversation: [...prev.conversation, newMsg],
      lastActivityTimestamp: Date.now(),
    }));
  }, []);

  const addAutoLiveNote = useCallback((moduleTitle: string, slideTitle: string, bullets: string[]) => {
    const newNote: LiveSessionNote = {
      id: `note-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      moduleTitle,
      slideTitle,
      bullets,
    };
    setSession((prev) => {
      // Avoid duplicate notes for the same slide title
      const filtered = prev.notes.filter((n) => n.slideTitle !== slideTitle);
      const updatedNotes = [...filtered, newNote];
      persistProgress(prev.currentModuleIndex, prev.currentSlideIndex, prev.modules, updatedNotes);
      return {
        ...prev,
        notes: updatedNotes,
      };
    });
  }, [persistProgress]);

  const cancelInFlight = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const currentModule = session.modules[session.currentModuleIndex] || session.modules[0];
  const currentSlide = currentModule?.slides[session.currentSlideIndex] || currentModule?.slides[0] || {
    slideId: 's-fallback',
    title: 'Interactive Masterclass',
    speech: 'Welcome to class! Let us begin our deep-dive.',
    exampleTitle: 'CORE SYNTAX',
    code: '# Loading lesson code...',
    output: 'Ready',
    explanation: 'Interactive deep dive.',
    keyPoints: ['Core Fundamentals'],
    diagramType: 'none' as const,
  };

  const totalSlides = session.modules.reduce((acc, m) => acc + m.slides.length, 0);
  const currentOverallSlideNumber = session.modules
    .slice(0, session.currentModuleIndex)
    .reduce((acc, m) => acc + m.slides.length, 0) + (session.currentSlideIndex + 1);

  const progressPercent = Math.min(100, Math.round((currentOverallSlideNumber / Math.max(1, totalSlides)) * 100));

  return {
    session,
    setSession,
    currentModule,
    currentSlide,
    progressPercent,
    currentOverallSlideNumber,
    totalSlides,
    setAIState,
    setVoiceGender,
    setPersona,
    goToModule,
    goToSlide,
    goToSlideInModule,
    nextSlideOrModule,
    prevSlideOrModule,
    addChatMessage,
    addAutoLiveNote,
    cancelInFlight,
    abortControllerRef,
  };
}
