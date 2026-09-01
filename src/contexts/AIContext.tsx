'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type {
  AIAssistantState,
  AIAnimation,
  AIEmotion,
  AIGesture,
  Doubt,
  AIResponse,
  AIAgentMessage,
  AIAgentState,
  AgentType,
  APIResponse,
  Resource,
} from '@/types';
import { generateId } from '@/lib/utils';
import { playAuraVoice, stopAllVoicePlayback } from '@/lib/ai/voice';

interface AIContextType {
  assistant: AIAssistantState;
  agents: AIAgentState[];
  setAssistantVisible: (visible: boolean) => void;
  setAssistantEmotion: (emotion: AIEmotion) => void;
  setAssistantAnimation: (animation: AIAnimation) => void;
  setAssistantGesture: (gesture: AIGesture) => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  askDoubt: (question: string, lessonId: string) => Promise<AIResponse>;
  resolveDoubt: (doubtId: string) => void;
  agentMessages: AIAgentMessage[];
  addAgentMessage: (message: AIAgentMessage) => void;
  activeDoubt: Doubt | null;
  isDoubtPanelOpen: boolean;
  closeDoubtPanel: () => void;
}

const defaultAssistantState: AIAssistantState = {
  isVisible: true,
  position: { x: 100, y: 100 },
  animation: 'idle',
  emotion: 'neutral',
  speech: '',
  isSpeaking: false,
  gesture: 'none',
  pointingTo: undefined,
};

const AIContext = createContext<AIContextType | undefined>(undefined);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assistant, setAssistant] = useState<AIAssistantState>(defaultAssistantState);
  const defaultAgents: AIAgentState[] = [
    { agentId: 'curriculum-1', agentType: 'curriculum', status: 'idle', lastActive: new Date(), progress: 0 },
    { agentId: 'teacher-1', agentType: 'teacher', status: 'idle', lastActive: new Date(), progress: 0 },
    { agentId: 'whiteboard-1', agentType: 'whiteboard', status: 'idle', lastActive: new Date(), progress: 0 },
    { agentId: 'voice-1', agentType: 'voice', status: 'idle', lastActive: new Date(), progress: 0 },
    { agentId: 'coding-1', agentType: 'coding', status: 'idle', lastActive: new Date(), progress: 0 },
    { agentId: 'quiz-1', agentType: 'quiz', status: 'idle', lastActive: new Date(), progress: 0 },
    { agentId: 'memory-1', agentType: 'memory', status: 'idle', lastActive: new Date(), progress: 0 },
    { agentId: 'translation-1', agentType: 'translation', status: 'idle', lastActive: new Date(), progress: 0 },
    { agentId: 'career-1', agentType: 'career', status: 'idle', lastActive: new Date(), progress: 0 },
    { agentId: 'analytics-1', agentType: 'analytics', status: 'idle', lastActive: new Date(), progress: 0 },
    { agentId: 'help-1', agentType: 'help', status: 'idle', lastActive: new Date(), progress: 0 },
  ];

  const [agents, setAgents] = useState<AIAgentState[]>(defaultAgents);
  const [agentMessages, setAgentMessages] = useState<AIAgentMessage[]>([]);
  const [activeDoubt, setActiveDoubt] = useState<Doubt | null>(null);
  const [isDoubtPanelOpen, setIsDoubtPanelOpen] = useState(false);
  const activeVoiceHandleRef = useRef<{ stop: () => void } | null>(null);

  const setAssistantVisible = useCallback((visible: boolean) => {
    setAssistant((prev) => ({ ...prev, isVisible: visible }));
  }, []);

  const setAssistantEmotion = useCallback((emotion: AIEmotion) => {
    setAssistant((prev) => ({ ...prev, emotion }));
  }, []);

  const setAssistantAnimation = useCallback((animation: AIAnimation) => {
    setAssistant((prev) => ({ ...prev, animation }));
  }, []);

  const setAssistantGesture = useCallback((gesture: AIGesture) => {
    setAssistant((prev) => ({ ...prev, gesture }));
  }, []);

  const speak = useCallback((text: string) => {
    if (activeVoiceHandleRef.current) {
      activeVoiceHandleRef.current.stop();
      activeVoiceHandleRef.current = null;
    }

    activeVoiceHandleRef.current = playAuraVoice({
      text,
      onStart: () => {
        setAssistant((prev) => ({ ...prev, isSpeaking: true, speech: text, animation: 'speaking' }));
      },
      onEnd: () => {
        setAssistant((prev) => ({ ...prev, isSpeaking: false, speech: '', animation: 'idle' }));
        activeVoiceHandleRef.current = null;
      },
      onError: () => {
        setAssistant((prev) => ({ ...prev, isSpeaking: false, speech: '', animation: 'idle' }));
        activeVoiceHandleRef.current = null;
      },
    });
  }, []);

  const stopSpeaking = useCallback(() => {
    if (activeVoiceHandleRef.current) {
      activeVoiceHandleRef.current.stop();
      activeVoiceHandleRef.current = null;
    }
    stopAllVoicePlayback();
    setAssistant((prev) => ({ ...prev, isSpeaking: false, speech: '', animation: 'idle' }));
  }, []);

  const addAgentMessage = useCallback((message: AIAgentMessage) => {
    setAgentMessages((prev) => [...prev, message]);
  }, []);

  const askDoubt = useCallback(
    async (question: string, lessonId: string): Promise<AIResponse> => {
      setAssistantAnimation('thinking');

      try {
        const res = await fetch('/api/v1/agents/public/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `Answer this student doubt: "${question}" with a clear explanation, code examples, and related concepts. Return as JSON with: explanation, codeExamples (array of {id, language, code, explanation, isExecutable, lineByLine}), relatedConcepts (array), suggestedResources (array of {id, title, type, url, description, isRequired}).`,
            system_prompt: 'You are an expert teacher. Answer doubts with detailed explanations, code examples, and learning resources.',
          }),
        });

        const data: APIResponse = await res.json();
        const responseData = typeof data?.data === 'object' && data.data !== null
          ? (data.data as Record<string, unknown>)?.response
          : '';

        let parsed: Partial<AIResponse> = {};
        if (typeof responseData === 'string') {
          try {
            parsed = JSON.parse(responseData);
          } catch {
            parsed = { explanation: responseData };
          }
        }

        const rawCodeExamples = (parsed.codeExamples || []) as unknown as Array<Record<string, unknown>>;
        const rawResources = (parsed.suggestedResources || []) as unknown as Array<Record<string, unknown>>;

        const aiResponse: AIResponse = {
          explanation: parsed.explanation || 'Here is an explanation for your doubt.',
          codeExamples: rawCodeExamples.map((ex, i) => ({
            id: `ce-${i}`,
            language: String(ex.language || 'python'),
            code: String(ex.code || ''),
            explanation: String(ex.explanation || ''),
            isExecutable: Boolean(ex.isExecutable),
            lineByLine: Boolean(ex.lineByLine),
          })),
          diagrams: parsed.diagrams || [],
          relatedConcepts: parsed.relatedConcepts || [],
          suggestedResources: rawResources.map((r, i) => ({
            id: `sr-${i}`,
            title: String(r.title || ''),
            type: (String(r.type) || 'link') as Resource['type'],
            url: String(r.url || ''),
            description: String(r.description || ''),
            isRequired: Boolean(r.isRequired),
          })),
        };

        const doubt: Doubt = {
          id: generateId(),
          userId: '',
          lessonId,
          question,
          context: '',
          status: 'answered',
          attachments: [],
          createdAt: new Date(),
          aiResponse,
          isResolved: true,
        };

        setActiveDoubt(doubt);
        setIsDoubtPanelOpen(true);
        setAssistantAnimation('idle');
        setAssistantEmotion('happy');
        return aiResponse;
      } catch {
        const fallback: AIResponse = {
          explanation: `I understand you're asking about "${question}". Let me explain with a clear example. The concept you're asking about is important for building strong fundamentals. Try breaking down the problem into smaller parts, and practice with simple examples first.`,
          codeExamples: [
            {
              id: '1',
              language: 'python',
              code: '# Example\ndef example():\n    result = sum(range(10))\n    return result\n\nprint(example())',
              explanation: 'This example demonstrates the concept step by step.',
              isExecutable: true,
              lineByLine: false,
            },
          ],
          diagrams: [],
          relatedConcepts: ['Practice with examples', 'Build fundamentals', 'Review documentation'],
          suggestedResources: [],
        };

        const doubt: Doubt = {
          id: generateId(),
          userId: '',
          lessonId,
          question,
          context: '',
          status: 'answered',
          attachments: [],
          createdAt: new Date(),
          aiResponse: fallback,
          isResolved: true,
        };

        setActiveDoubt(doubt);
        setIsDoubtPanelOpen(true);
        setAssistantAnimation('idle');
        setAssistantEmotion('happy');
        return fallback;
      }
    },
    [setAssistantAnimation, setAssistantEmotion]
  );

  const resolveDoubt = useCallback((doubtId: string) => {
    setActiveDoubt((prev) => {
      if (prev && prev.id === doubtId) {
        setIsDoubtPanelOpen(false);
        return null;
      }
      return prev;
    });
  }, []);

  const closeDoubtPanel = useCallback(() => {
    setIsDoubtPanelOpen(false);
    setActiveDoubt(null);
  }, []);

  return (
    <AIContext.Provider
      value={{
        assistant,
        agents,
        setAssistantVisible,
        setAssistantEmotion,
        setAssistantAnimation,
        setAssistantGesture,
        speak,
        stopSpeaking,
        askDoubt,
        resolveDoubt,
        agentMessages,
        addAgentMessage,
        activeDoubt,
        isDoubtPanelOpen,
        closeDoubtPanel,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};
