'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import type { DoubtResolution } from '@/hooks/useClassroomState';
import toast from 'react-hot-toast';

interface DoubtModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  level: string;
}

export const DoubtModal: React.FC<DoubtModalProps> = ({ isOpen, onClose, topic, level }) => {
  const [doubtText, setDoubtText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resolution, setResolution] = useState<DoubtResolution | null>(null);

  if (!isOpen) return null;

  const handleResolveDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtText.trim()) {
      toast.error('Please enter your doubt or question!');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/doubt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          level,
          doubt: doubtText.trim(),
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setResolution(json.data);
        toast.success('Doubt diagnosed & resolved!');
      } else {
        toast.error('Could not process doubt. Please try again.');
      }
    } catch (err) {
      toast.error('Connection error while resolving doubt.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm select-none">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-1.5">
                <span>AI Doubt Diagnostic Breakdown</span>
                <Sparkles className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
              </h3>
              <p className="text-[11px] text-purple-400 font-mono">Topic: {topic} · {level}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {/* Doubt Submission Form */}
          <form onSubmit={handleResolveDoubt} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              What specific concept or error are you stuck on?
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={doubtText}
                onChange={(e) => setDoubtText(e.target.value)}
                placeholder="e.g. Why does modifying a list inside a dict affect other references?"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={isLoading || !doubtText.trim()}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-md shadow-purple-600/20"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 fill-white" />}
                <span>{isLoading ? 'Diagnosing...' : 'Resolve'}</span>
              </button>
            </div>
          </form>

          {/* Diagnostic Resolution Cards */}
          {resolution && (
            <div className="space-y-4 pt-3 border-t border-slate-800 animate-fadeIn">
              {/* Diagnosis Title */}
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/60">
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider block mb-0.5">
                  DIAGNOSTIC IDENTIFICATION
                </span>
                <h4 className="text-sm font-bold text-purple-200">{resolution.title}</h4>
              </div>

              {/* Step-by-Step Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                  <span>Step-by-Step Mechanical Analysis</span>
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {resolution.breakdown.map((step, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                      <div className="flex items-center space-x-1.5 text-purple-400 font-bold font-mono text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>Step {idx + 1}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-300">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Side-by-Side Code Comparison */}
              {resolution.codeComparison && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Anti-Pattern */}
                  <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/40 space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-red-400 text-xs font-bold font-mono">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Common Bug / Anti-Pattern</span>
                    </div>
                    <pre className="font-mono text-[11px] text-red-200 bg-black/40 p-2.5 rounded-lg overflow-x-auto">
                      <code>{resolution.codeComparison.antiPattern}</code>
                    </pre>
                  </div>

                  {/* Robust Solution */}
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-bold font-mono">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Idiomatic Robust Solution</span>
                    </div>
                    <pre className="font-mono text-[11px] text-emerald-200 bg-black/40 p-2.5 rounded-lg overflow-x-auto">
                      <code>{resolution.codeComparison.robustSolution}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* Golden Rule Summary */}
              {resolution.summary && (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs space-y-1">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                    👑 GOLDEN RULE FOR EXAMS & INTERVIEWS
                  </span>
                  <p className="text-amber-200 font-medium">{resolution.summary}</p>
                </div>
              )}

              {/* Pro Tip */}
              {resolution.proTip && (
                <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 text-xs space-y-1">
                  <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider block">
                    🚀 PRO PERFORMANCE TIP
                  </span>
                  <p className="text-blue-200">{resolution.proTip}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button onClick={onClose} className="px-4 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition">
            Close Diagnosis
          </button>
        </div>
      </motion.div>
    </div>
  );
};
