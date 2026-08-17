'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GraduationCap, Zap, Heart, Brain, BookOpen, Check, Sparkles, Volume2 } from 'lucide-react';
import { TEACHER_STYLES } from '@/lib/constants';

interface TeacherSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPersona: string;
  onSelectPersona: (personaId: string, personaName: string) => void;
}

export const TeacherSelectModal: React.FC<TeacherSelectModalProps> = ({
  isOpen,
  onClose,
  currentPersona,
  onSelectPersona,
}) => {
  if (!isOpen) return null;

  const getIcon = (iconName: string, color: string) => {
    const props = { className: 'w-6 h-6', style: { color } };
    switch (iconName) {
      case 'GraduationCap': return <GraduationCap {...props} />;
      case 'Zap': return <Zap {...props} />;
      case 'Heart': return <Heart {...props} />;
      case 'Brain': return <Brain {...props} />;
      case 'BookOpen': return <BookOpen {...props} />;
      default: return <GraduationCap {...props} />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between sticky top-0 bg-[#0f172a] z-10">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Switch AI Teacher Style</h2>
                <p className="text-xs text-slate-400">
                  Select an AI Teacher persona. The robot avatar design & teaching approach will adapt instantly!
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Teacher Selection Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEACHER_STYLES.map((style) => {
              const isSelected = currentPersona.toLowerCase().includes(style.id.toLowerCase());
              return (
                <div
                  key={style.id}
                  onClick={() => {
                    onSelectPersona(style.id, style.name);
                    onClose();
                  }}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'border-purple-500 bg-purple-950/20 shadow-lg shadow-purple-500/10'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 p-1 bg-purple-500 rounded-full text-white">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className="flex items-start space-x-3">
                    <div
                      className="p-3 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${style.color}20` }}
                    >
                      {getIcon(style.icon, style.color)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                        {style.name}
                        <span className="text-[10px] font-mono text-slate-400 font-normal">({style.title})</span>
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 leading-snug">{style.tagline}</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
                    <p className="line-clamp-2 text-[11px] text-slate-400">{style.description}</p>
                    <div className="flex items-center justify-between text-[10px] font-mono pt-1">
                      <span className="flex items-center text-purple-300">
                        <Volume2 className="w-3 h-3 mr-1 text-purple-400" />
                        {style.voiceStyle}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {style.pace} pace
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400 flex items-center justify-between">
            <span>✨ Your current slide, notes, and lesson progress will be preserved!</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
            >
              Keep Current Teacher
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
