'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { Bot, User, Mic, MicOff, Send, Volume2, VolumeX, Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPanelProps {
  agentType: string;
  title?: string;
  context?: Record<string, unknown> | null;
  voiceMode?: boolean;
  onVoiceModeChange?: (on: boolean) => void;
  speak?: (text: string) => void;
  className?: string;
  placeholder?: string;
}

/** Render markdown-lite: bold, inline code, numbered list items, bullet points */
function renderContent(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Render code blocks header
    if (line.startsWith('```')) {
      return <div key={i} className="h-px bg-white/10 my-1" />;
    }
    // Heading lines
    if (line.startsWith('## ')) {
      return (
        <p key={i} className="font-bold text-primary text-[11px] mt-2 mb-0.5 uppercase tracking-wide">
          {line.slice(3)}
        </p>
      );
    }
    if (line.startsWith('# ')) {
      return (
        <p key={i} className="font-bold text-white text-xs mt-2 mb-0.5">
          {line.slice(2)}
        </p>
      );
    }
    // Bullet lines
    if (line.match(/^[\-\*•]\s/)) {
      return (
        <div key={i} className="flex gap-1.5 mt-0.5">
          <span className="text-primary mt-0.5 shrink-0">•</span>
          <span>{renderInline(line.slice(2))}</span>
        </div>
      );
    }
    // Numbered list
    if (line.match(/^\d+\.\s/)) {
      const num = line.match(/^(\d+)\./)?.[1];
      return (
        <div key={i} className="flex gap-1.5 mt-0.5">
          <span className="text-primary/70 shrink-0 font-mono text-[10px] mt-0.5">{num}.</span>
          <span>{renderInline(line.replace(/^\d+\.\s/, ''))}</span>
        </div>
      );
    }
    if (line.trim() === '') return <div key={i} className="h-1.5" />;
    return <p key={i} className="mt-0.5">{renderInline(line)}</p>;
  });
}

function renderInline(text: string) {
  // Split on **bold**, `code`
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="bg-white/10 text-emerald-300 px-1 py-0.5 rounded text-[10px] font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

/**
 * Live ChatGPT-style chat surface. One component, any agent.
 * - Streams answers via SSE from /api/v1/agents/chat/{agentType}
 * - Typewriter effect — renders token-by-token as they arrive from the server
 * - Optional voice mode: speaks the full answer, then auto-reopens the mic
 */
export function ChatPanel({
  agentType,
  title = 'Chat with AURA',
  context = null,
  voiceMode = false,
  onVoiceModeChange,
  speak,
  className,
  placeholder = 'Ask anything about the current lesson...',
}: ChatPanelProps) {
  const { user } = useAuth();
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const voiceModeRef = useRef(voiceMode);
  const speakRef = useRef(speak);
  const isStreamingRef = useRef(false);
  const historyRef = useRef<ChatMessage[]>([]);
  const submitMessageRef = useRef<((text?: string) => Promise<void>) | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { voiceModeRef.current = voiceMode; }, [voiceMode]);
  useEffect(() => { speakRef.current = speak; }, [speak]);
  useEffect(() => { historyRef.current = history; }, [history]);

  useEffect(() => {
    // Auto-scroll to bottom on new messages or stream update
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, streamText]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const stopListening = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch {}
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported. Please use Chrome.');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onstart = () => setIsListening(true);
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript.trim()) {
          setInput(transcript);
          submitMessageRef.current?.(transcript);
        }
      };
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Speech recognition failed:', e);
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    if (voiceMode) startListening();
    else stopListening();
  }, [voiceMode, startListening, stopListening]);

  const speakWithDefault = useCallback((text: string) => {
    if (speakRef.current) {
      speakRef.current(text);
    } else if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const copyMessage = useCallback(async (content: string, index: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const submitMessage = useCallback(
    async (text?: string) => {
      const message = (text ?? input).trim();
      if (!message || isStreamingRef.current) return;

      setInput('');
      const historySnapshot = historyRef.current;
      const userMessage: ChatMessage = { role: 'user', content: message };
      setHistory([...historySnapshot, userMessage]);
      setIsStreaming(true);
      isStreamingRef.current = true;
      setStreamText('');
      abortRef.current = new AbortController();

      let full = '';
      try {
        // Get auth token if user is logged in — optional, won't fail without it
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        try {
          if (user) {
            const token = await user.getIdToken();
            if (token) headers['Authorization'] = `Bearer ${token}`;
          }
        } catch { /* no token, proceed anonymously */ }

        const res = await fetch(`/api/v1/agents/chat/${agentType}`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ message, history: historySnapshot, context }),
          signal: abortRef.current.signal,
        });

        if (!res.ok || !res.body) throw new Error('Chat request failed');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split('\n\n');
          buffer = events.pop() || '';

          for (const event of events) {
            const line = event.trim();
            if (!line.startsWith('data:')) continue;
            const payload = line.slice(5).trim();
            if (payload === '[DONE]') continue;
            // Stream token by token — append each chunk to display
            full += payload;
            setStreamText(full);
          }
        }

        if (full.trim()) {
          const assistantMessage: ChatMessage = { role: 'assistant', content: full.trim() };
          setHistory(prev => [...prev, assistantMessage]);
          setStreamText('');
          if (voiceModeRef.current) speakWithDefault(full.trim());
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        // Graceful fallback when backend is offline
        const fallback = `I'm here to help! Let me explain "${message}" — think of it like building blocks where each concept builds on the previous one. What specific aspect would you like me to dive into?`;
        setHistory(prev => [...prev, { role: 'assistant', content: fallback }]);
        setStreamText('');
        if (voiceModeRef.current) speakWithDefault(fallback);
      } finally {
        setIsStreaming(false);
        isStreamingRef.current = false;

        // Voice loop — reopen mic after AURA finishes speaking
        if (voiceModeRef.current) {
          if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.addEventListener('end', () => {
              if (voiceModeRef.current && !isStreamingRef.current) {
                setTimeout(() => startListening(), 500);
              }
            }, { once: true });
          } else {
            setTimeout(() => {
              if (!isStreamingRef.current && voiceModeRef.current) startListening();
            }, 800);
          }
        }

        // Refocus input
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [agentType, context, input, user, startListening, speakWithDefault]
  );

  useEffect(() => { submitMessageRef.current = submitMessage; }, [submitMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isStreaming) {
      e.preventDefault();
      submitMessage();
    }
  };

  return (
    <div className={cn('flex flex-col h-full bg-transparent', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="h-7 w-7 rounded-full bg-primary/15 text-primary flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <span className={cn(
              'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background',
              isStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'
            )} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">{title}</span>
            <span className="text-[9px] text-muted-foreground">
              {isStreaming ? '🟢 AURA is typing...' : '🟢 Online · Ask anything'}
            </span>
          </div>
        </div>

        {/* Voice mode toggle */}
        <button
          onClick={() => {
            const next = !voiceMode;
            onVoiceModeChange?.(next);
            if (!next) stopListening();
          }}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold transition-all border',
            voiceMode
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
          )}
          title={voiceMode ? 'Voice mode on' : 'Enable voice mode'}
        >
          {voiceMode ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
          {voiceMode ? 'Voice ON' : 'Voice'}
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3 scrollbar-thin">
        {history.length === 0 && !streamText && (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-3 py-8">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary/60" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Chat with AURA</p>
              <p className="text-[10px] text-slate-600 mt-1 max-w-[200px] leading-relaxed">
                Ask questions about the lesson. AURA answers live, like a real tutor.
              </p>
            </div>
            {voiceMode && (
              <p className="text-[10px] text-emerald-400/80 flex items-center gap-1 animate-pulse">
                <Mic className="h-3 w-3" /> Listening — speak your question
              </p>
            )}
          </div>
        )}

        <AnimatePresence initial={false}>
          {history.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {msg.role === 'assistant' && (
                <div className="h-6 w-6 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-1">
                  <Bot className="h-3.5 w-3.5" />
                </div>
              )}

              <div className={cn(
                'group relative max-w-[85%]',
                msg.role === 'user' ? 'items-end' : 'items-start'
              )}>
                <div className={cn(
                  'px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-white/[0.05] border border-white/[0.08] text-slate-200 rounded-bl-sm'
                )}>
                  {msg.role === 'assistant' ? (
                    <div className="space-y-0.5">{renderContent(msg.content)}</div>
                  ) : (
                    msg.content
                  )}
                </div>

                {/* Copy button for assistant messages */}
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => copyMessage(msg.content, i)}
                    className="absolute -top-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center"
                    title="Copy message"
                  >
                    {copiedId === i ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-slate-400" />}
                  </button>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="h-6 w-6 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-1">
                  <User className="h-3.5 w-3.5" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Live streaming message — typewriter effect */}
        {streamText && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 justify-start"
          >
            <div className="h-6 w-6 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-1">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-bl-sm text-xs leading-relaxed bg-white/[0.05] border border-white/[0.08] text-slate-200">
              <div className="space-y-0.5">{renderContent(streamText)}</div>
              {/* Blinking cursor to show it's still typing */}
              <span className="inline-block w-[2px] h-3.5 bg-primary animate-pulse ml-0.5 align-middle rounded-full" />
            </div>
          </motion.div>
        )}

        {/* Thinking animation — shown before first token arrives */}
        {isStreaming && !streamText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="h-6 w-6 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-white/[0.05] border border-white/[0.08]">
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input area */}
      <div className="px-3 py-3 border-t border-border/60 shrink-0">
        <div className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isStreaming ? 'AURA is typing...' : placeholder}
              disabled={isStreaming}
              className={cn(
                'w-full h-9 px-3.5 pr-2 rounded-xl border text-xs transition-all outline-none',
                'bg-white/[0.04] border-white/[0.10] text-slate-200 placeholder:text-slate-600',
                'focus:border-primary/50 focus:bg-white/[0.06] focus:shadow-[0_0_0_2px_rgba(99,102,241,0.15)]',
                isStreaming && 'opacity-60 cursor-not-allowed'
              )}
            />
          </div>

          {/* Send button */}
          <button
            onClick={() => submitMessage()}
            disabled={!input.trim() || isStreaming}
            className={cn(
              'h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-all',
              input.trim() && !isStreaming
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                : 'bg-white/5 border border-white/10 text-slate-600 cursor-not-allowed'
            )}
            title="Send message"
          >
            {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </button>

          {/* Mic button */}
          <button
            onClick={toggleListening}
            disabled={isStreaming}
            className={cn(
              'h-9 w-9 rounded-xl border flex items-center justify-center transition-all shrink-0',
              isListening
                ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-400 hover:text-slate-200'
            )}
            title={isListening ? 'Stop listening' : 'Speak your question'}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
        </div>

        {isListening && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-[10px] text-red-400/90 flex items-center gap-1.5 mt-1.5 animate-pulse"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Listening... speak your question
          </motion.p>
        )}
      </div>
    </div>
  );
}
