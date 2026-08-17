'use client';

import { useState, useCallback, useRef } from 'react';
import type { ProfessorState } from '@/components/classroom/AIProfessorAvatar';

export interface LessonSlide {
  slideId: string;
  title: string;
  speech: string;
  exampleTitle: string;
  code: string;
  output: string;
  explanation: string;
  keyPoints: string[];
  diagramType: 'hashmap' | 'array' | 'tree' | 'flowchart' | 'none';
}

export interface LessonModule {
  moduleId: string;
  moduleTitle: string;
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

export interface DoubtResolution {
  title: string;
  breakdown: string[];
  codeComparison: {
    antiPattern: string;
    robustSolution: string;
  };
  summary: string;
  proTip: string;
}

export interface CodingChallenge {
  title: string;
  instructions: string;
  starterCode: string;
  solutionCode: string;
  testCases: Array<{
    input: string;
    expected: string;
    description: string;
  }>;
}

export interface ClassroomSessionState {
  sessionId: string;
  courseTitle: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  persona: string;
  voice: string;
  modules: LessonModule[];
  currentModuleIndex: number;
  currentSlideIndex: number;
  conversation: ChatMessage[];
  aiState: ProfessorState;
  voiceState: 'idle' | 'recording' | 'speaking';
  connectionStatus: 'connected' | 'reconnecting' | 'disconnected';
  lastActivityTimestamp: number;
}

const DEFAULT_MODULES: LessonModule[] = [
  {
    moduleId: 'mod-1',
    moduleTitle: '1. Python Lists & Memory Layout',
    status: 'completed',
    slides: [
      {
        slideId: 's-1-1',
        title: 'Dynamic Array Allocation & Indexing',
        speech: 'Welcome everyone! Lists in Python are dynamic arrays that allocate over-sized contiguous memory blocks for lightning-fast indexing.',
        exampleTitle: 'CORE SYNTAX',
        code: `# Contiguous dynamic array in Python\nfruits = ["apple", "banana", "cherry"]\nfruits.append("dragonfruit")\nprint(f"Slice access: {fruits[1:3]}")`,
        output: "Slice access: ['banana', 'cherry']",
        explanation: 'Python lists store 64-bit pointers to heap objects. Slicing creates a shallow copy in O(k) time where k is slice length.',
        keyPoints: [
          'O(1) amortized append operations',
          'Contiguous memory pointers allow instant O(1) index lookups',
          'Memory growth factor allocates ~1.125x capacity on resize'
        ],
        diagramType: 'array',
      },
    ],
  },
  {
    moduleId: 'mod-2',
    moduleTitle: '2. Tuples & Immutability Guarantees',
    status: 'completed',
    slides: [
      {
        slideId: 's-2-1',
        title: 'Fixed Memory Allocation & Hashability',
        speech: 'Tuples provide strict immutability. Because their length and items cannot change, Python optimizes them for fast allocation and hash keys.',
        exampleTitle: 'PRACTICAL LAB',
        code: `# Immutable coordinates tuple\npoint = (1024, 768)\nwidth, height = point\nprint(f"Display resolution: {width}x{height}")`,
        output: 'Display resolution: 1024x768',
        explanation: 'Small tuples (len <= 20) are cached in a free-list in CPython, avoiding operating system malloc calls entirely.',
        keyPoints: [
          'Tuples can be used as dictionary keys if all elements are hashable',
          'Saves memory compared to lists (no resize padding)',
          'Thread-safe for read operations across threads'
        ],
        diagramType: 'tree',
      },
    ],
  },
  {
    moduleId: 'mod-3',
    moduleTitle: '3. Python Dictionaries & Hash Maps',
    status: 'in_progress',
    slides: [
      {
        slideId: 's-3-1',
        title: 'Core Hash Table Architecture',
        speech: 'Today we dissect Python Dictionaries! Dictionaries are compact hash tables with O(1) average lookup times using deterministic hash probing.',
        exampleTitle: 'CORE SYNTAX',
        code: `# Dictionary key-value store\nstudent = {\n    "name": "Alex",\n    "grade": "A",\n    "skills": ["Python", "Algorithms"]\n}\n\nstudent["status"] = "Active Learner"\nprint(student.get("name"))`,
        output: 'Alex',
        explanation: 'CPython uses a two-table design: a compact indices array plus an entries table containing hash, key pointer, and value pointer.',
        keyPoints: [
          'O(1) average time complexity for get, set, and in operations',
          'Keys must be hashable and strictly immutable',
          'Maintains insertion order since Python 3.7'
        ],
        diagramType: 'hashmap',
      },
      {
        slideId: 's-3-2',
        title: 'Hash Collisions & Probing Mechanics',
        speech: 'What happens when two different keys generate the same hash? Python uses open addressing with perturbation probing to resolve collisions seamlessly.',
        exampleTitle: 'MEMORY MAP',
        code: `import sys\n\n# Probing and hash distribution\ncache = {f"item_{i}": i * 10 for i in range(5)}\nprint(f"Memory size: {sys.getsizeof(cache)} bytes")\nprint(f"Hash of 'item_0': {hash('item_0')}")`,
        output: "Memory size: 224 bytes\nHash of 'item_0': 4819284729182",
        explanation: 'The perturbation recurrence formula j = (5*j + 1 + perturb) >> 5 ensures all table slots are eventually probed without infinite loops.',
        keyPoints: [
          'Open addressing resolves collisions without linked lists',
          'Load factor threshold triggers resizing at 2/3 capacity',
          'Never mutate keys while computing hash'
        ],
        diagramType: 'hashmap',
      },
      {
        slideId: 's-3-3',
        title: 'Defensive Access & Defaultdict',
        speech: 'Never let your production APIs crash on missing keys. Always use defensive patterns like get() or collections.defaultdict for rock-solid reliability.',
        exampleTitle: 'EDGE CASE HANDLING',
        code: `from collections import defaultdict\n\n# Grouping items without KeyError\ngroups = defaultdict(list)\nfor word in ["apple", "avocado", "banana", "berry"]:\n    groups[word[0]].append(word)\n\nprint(dict(groups))`,
        output: "{'a': ['apple', 'avocado'], 'b': ['banana', 'berry']}",
        explanation: 'Defaultdict invokes its factory callable upon accessing a missing key, eliminating explicit if-else membership branching.',
        keyPoints: [
          'Eliminates KeyError crashes in high-throughput loops',
          'Factory callable executes on first missing key lookup',
          'Cleaner, more maintainable architectural pattern'
        ],
        diagramType: 'flowchart',
      },
    ],
  },
  {
    moduleId: 'mod-4',
    moduleTitle: '4. Sets & Unique Mathematical Operations',
    status: 'upcoming',
    slides: [
      {
        slideId: 's-4-1',
        title: 'Set Theory & Deduplication',
        speech: 'Sets are unordered collections of unique elements. Perfect for deduplicating streams and performing mathematical intersections in O(min(len(s), len(t))) time.',
        exampleTitle: 'PRACTICAL LAB',
        code: `# Fast membership and set operations\nactive_users = {"alex", "maya", "sam"}\nnew_signups = {"sam", "jordan"}\n\nall_unique = active_users.union(new_signups)\nprint(f"Combined users: {all_unique}")`,
        output: "Combined users: {'alex', 'maya', 'sam', 'jordan'}",
        explanation: 'Sets are implemented using the same open-addressing hash table mechanics as dictionaries, but without storing values.',
        keyPoints: [
          'O(1) membership testing using in operator',
          'Supports union, intersection, and symmetric difference',
          'Frozenset provides immutable, hashable variant'
        ],
        diagramType: 'array',
      },
    ],
  },
  {
    moduleId: 'mod-5',
    moduleTitle: '5. Comprehensions & Capstone Mastery',
    status: 'upcoming',
    slides: [
      {
        slideId: 's-5-1',
        title: 'Dictionary & Set Comprehensions',
        speech: 'Congratulations on reaching the capstone module! Comprehensions provide elegant, C-optimized loops for transforming data at maximum speed.',
        exampleTitle: 'CAPSTONE SUMMARY',
        code: `# High-performance dictionary comprehension\nsquares = {x: x**2 for x in range(6) if x % 2 == 0}\nprint(f"Even squares mapping: {squares}")`,
        output: 'Even squares mapping: {0: 0, 2: 4, 4: 16}',
        explanation: 'Comprehensions are transformed into optimized bytecode that bypasses standard Python interpreter stack push/pop overhead.',
        keyPoints: [
          '20-30% faster execution than manual append loops',
          'Expressive, readable, and functional data transformation',
          'Keep comprehensions readable—avoid nesting > 2 levels'
        ],
        diagramType: 'flowchart',
      },
    ],
  },
];

export function useClassroomState() {
  const [session, setSession] = useState<ClassroomSessionState>({
    sessionId: 'session-live-001',
    courseTitle: 'Masterclass: Python Data Structures & Architecture',
    topic: 'Python Data Structures',
    difficulty: 'beginner',
    persona: 'Professor Structured',
    voice: 'Sweet Female Voice',
    modules: DEFAULT_MODULES,
    currentModuleIndex: 2, // Dictionaries
    currentSlideIndex: 0,
    conversation: [
      {
        id: 'msg-1',
        sender: 'professor',
        name: 'Professor Aura',
        text: 'Welcome to class! Today we are exploring Python Dictionaries. Notice how key-value pairs allow O(1) access time via hash tables.',
        timestamp: '10:14 AM',
        isAI: true,
        memoryInsight: 'Hash buckets allocated in contiguous C-array with 64-bit pointers.',
      },
      {
        id: 'msg-2',
        sender: 'user',
        name: 'Alex',
        text: 'What happens if I try to access a key that does not exist?',
        timestamp: '10:15 AM',
      },
      {
        id: 'msg-3',
        sender: 'professor',
        name: 'Professor Aura',
        text: "Great question! Using square brackets `dict['key']` triggers a `KeyError`. Using `dict.get('key')` safely returns `None` or your fallback default!",
        timestamp: '10:15 AM',
        isAI: true,
        codeSnippet: `student = {"name": "Alex"}\n# Safe access\nvalue = student.get("role", "Learner")\nprint(f"Role: {value}")`,
        output: 'Role: Learner',
        suggestedFollowUp: 'What is the performance difference between try-except and get() for missing keys?',
        memoryInsight: 'The .get() method performs an internal NULL check without raising C-level PyErr.',
      },
    ],
    aiState: 'teaching',
    voiceState: 'idle',
    connectionStatus: 'connected',
    lastActivityTimestamp: Date.now(),
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const setAIState = useCallback((nextState: ProfessorState) => {
    setSession((prev) => ({ ...prev, aiState: nextState, lastActivityTimestamp: Date.now() }));
  }, []);

  const setDifficulty = useCallback((difficulty: 'beginner' | 'intermediate' | 'advanced') => {
    setSession((prev) => ({ ...prev, difficulty }));
  }, []);

  const setPersona = useCallback((persona: string) => {
    setSession((prev) => ({ ...prev, persona }));
  }, []);

  const setVoice = useCallback((voice: string) => {
    setSession((prev) => ({ ...prev, voice }));
  }, []);

  const goToModule = useCallback((moduleIdx: number) => {
    setSession((prev) => {
      if (moduleIdx < 0 || moduleIdx >= prev.modules.length) return prev;
      const updated = prev.modules.map((m, i) => {
        if (i < moduleIdx) return { ...m, status: 'completed' as const };
        if (i === moduleIdx) return { ...m, status: 'in_progress' as const };
        return { ...m, status: 'upcoming' as const };
      });
      return {
        ...prev,
        currentModuleIndex: moduleIdx,
        currentSlideIndex: 0,
        modules: updated,
        aiState: 'teaching',
        lastActivityTimestamp: Date.now(),
      };
    });
  }, []);

  const goToSlide = useCallback((slideIdx: number) => {
    setSession((prev) => {
      const activeMod = prev.modules[prev.currentModuleIndex];
      if (!activeMod || slideIdx < 0 || slideIdx >= activeMod.slides.length) return prev;
      return {
        ...prev,
        currentSlideIndex: slideIdx,
        aiState: 'teaching',
        lastActivityTimestamp: Date.now(),
      };
    });
  }, []);

  const nextSlideOrModule = useCallback(() => {
    setSession((prev) => {
      const activeMod = prev.modules[prev.currentModuleIndex];
      if (!activeMod) return prev;

      // Next slide in current module
      if (prev.currentSlideIndex + 1 < activeMod.slides.length) {
        return {
          ...prev,
          currentSlideIndex: prev.currentSlideIndex + 1,
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
      return { ...prev, aiState: 'lesson_completed' };
    });
  }, []);

  const prevSlideOrModule = useCallback(() => {
    setSession((prev) => {
      if (prev.currentSlideIndex > 0) {
        return {
          ...prev,
          currentSlideIndex: prev.currentSlideIndex - 1,
          aiState: 'teaching',
          lastActivityTimestamp: Date.now(),
        };
      }

      if (prev.currentModuleIndex > 0) {
        const prevModIdx = prev.currentModuleIndex - 1;
        const prevMod = prev.modules[prevModIdx];
        const lastSlideIdx = prevMod.slides.length - 1;
        const updated = prev.modules.map((m, i) => {
          if (i < prevModIdx) return { ...m, status: 'completed' as const };
          if (i === prevModIdx) return { ...m, status: 'in_progress' as const };
          return { ...m, status: 'upcoming' as const };
        });
        return {
          ...prev,
          currentModuleIndex: prevModIdx,
          currentSlideIndex: Math.max(0, lastSlideIdx),
          modules: updated,
          aiState: 'teaching',
          lastActivityTimestamp: Date.now(),
        };
      }

      return prev;
    });
  }, []);

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

  const progressPercent = Math.round(((session.currentModuleIndex + 1) / session.modules.length) * 100);

  return {
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
    abortControllerRef,
  };
}
