'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReferenceTeacher from './ReferenceTeacher';
import HumanTeacher3D from './HumanTeacher3D';
import { Volume2, VolumeX, RotateCcw, Pause, Sparkles, Box } from 'lucide-react';
import { getTeacher } from '@/lib/ai/teachers';

export type ProfessorState =
  | 'idle'
  | 'thinking'
  | 'preparing_lesson'
  | 'teaching'
  | 'speaking'
  | 'listening'
  | 'processing_question'
  | 'answering'
  | 'paused'
  | 'lesson_completed'
  | 'error';

export type TeacherStyleId = 'professor' | 'coach' | 'friend' | 'expert' | 'simplifier' | string;
export type AvatarGesture = 'idle' | 'explaining' | 'thinking' | 'welcoming' | 'motivating' | 'listening';

export interface AIProfessorAvatarProps {
  state: ProfessorState;
  gesture?: AvatarGesture;
  teacherStyle?: TeacherStyleId;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  gender?: 'female' | 'male';
  speechText?: string;
  isVoiceActive?: boolean;
  onAvatarClick?: () => void;
  onToggleVoice?: () => void;
  onPause?: () => void;
  onSwitchGender?: (gender: 'female' | 'male') => void;
  className?: string;
  showSpeechBubble?: boolean;
}

export const AIProfessorAvatar: React.FC<AIProfessorAvatarProps> = ({
  state,
  gesture = 'idle',
  teacherStyle = 'professor',
  size = 'full',
  speechText,
  isVoiceActive = true,
  onAvatarClick,
  onToggleVoice,
  onPause,
  className = '',
  showSpeechBubble = true,
}) => {
  const [floating, setFloating] = useState(false);
  const [avatarMode, setAvatarMode] = useState<'studio' | '3d'>('studio');

  const teacher = getTeacher(teacherStyle);
  const talking = ['speaking', 'answering', 'teaching'].includes(state);
  const thinking = ['thinking', 'preparing_lesson', 'processing_question'].includes(state);
  const listening = state === 'listening';

  const status = thinking
    ? 'Thinking through question'
    : listening
    ? 'Listening to you'
    : talking
    ? 'Live Explaining'
    : state === 'paused'
    ? 'Paused'
    : 'Ready to teach';

  if (size === 'sm') {
    return (
      <span
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-slate-950 shadow-md ${className}`}
        style={{ background: teacher.color }}
        aria-label={`${teacher.name}, ${status}`}
      >
        {teacher.initial}
      </span>
    );
  }

  return (
    <motion.section
      key={floating ? 'floating' : 'docked'}
      drag={floating}
      dragMomentum={false}
      className={`${
        floating
          ? 'fixed bottom-28 right-5 z-50 w-72 max-h-[calc(100dvh-160px)] overflow-y-auto rounded-3xl border border-slate-700 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-xl cursor-grab'
          : 'w-full'
      } flex flex-col items-center select-none ${className}`}
      aria-label={`${teacher.name}, ${teacher.role}`}
    >
      {/* ── Teacher Header & Controls ── */}
      <div className="w-full mb-3 flex items-center justify-between px-1">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-white tracking-tight">{teacher.name}</h3>
            {talking && (
              <span className="flex items-center gap-0.5 h-3 px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[9px] text-emerald-300 font-mono">
                <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                <span className="ml-1 font-bold">LIVE</span>
              </span>
            )}
          </div>
          <p className="text-[11px] font-medium flex items-center gap-1.5 mt-0.5" style={{ color: teacher.color }}>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                talking ? 'bg-emerald-400 animate-ping' : thinking ? 'bg-amber-400 animate-pulse' : listening ? 'bg-blue-400 animate-pulse' : 'bg-slate-400'
              }`}
            />
            {teacher.role} · {status}
          </p>
        </div>

        {/* Mode Switcher: Studio Real vs 3D Avatar */}
        {size !== 'md' && (
          <div className="flex items-center rounded-xl bg-slate-900/90 border border-slate-700/80 p-0.5 text-[10px] font-semibold text-slate-300">
            <button
              type="button"
              onClick={() => setAvatarMode('studio')}
              className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
                avatarMode === 'studio' ? 'bg-indigo-600 text-white shadow-sm font-bold' : 'hover:text-white'
              }`}
              title="Studio Real Avatar: Same illustrated design with lifelike human head nods, breathing, blinks, and lip-sync"
            >
              <Sparkles size={11} />
              <span>Studio</span>
            </button>
            <button
              type="button"
              onClick={() => setAvatarMode('3d')}
              className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
                avatarMode === '3d' ? 'bg-indigo-600 text-white shadow-sm font-bold' : 'hover:text-white'
              }`}
              title="3D Human Stage: Articulated 3D mesh with procedural limbs and camera lighting"
            >
              <Box size={11} />
              <span>3D</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Avatar Stage Canvas ── */}
      <div
        onClick={onAvatarClick}
        className={`relative w-full shrink-0 rounded-3xl overflow-hidden border border-slate-800/80 bg-gradient-to-b from-[#0a0f1d] via-[#0f172a] to-[#020617] shadow-2xl transition-all ${
          size === 'md'
            ? 'h-[320px]'
            : floating
            ? 'h-[300px]'
            : 'h-[clamp(240px,calc(100dvh-375px),560px)]'
        } ${onAvatarClick ? 'cursor-pointer hover:border-indigo-500/50' : ''}`}
        title={onAvatarClick ? `Click to replay ${teacher.name}'s explanation` : undefined}
      >
        {avatarMode === 'studio' ? (
          <ReferenceTeacher
            teacherStyle={teacherStyle}
            speaking={talking}
            thinking={thinking}
            listening={listening}
            gesture={gesture}
          />
        ) : (
          <HumanTeacher3D
            teacher={teacher}
            state={state}
            gesture={gesture}
            compact={size === 'md' || floating}
          />
        )}

        {/* Ambient corner indicator */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950/70 border border-white/10 backdrop-blur-md text-[9px] text-slate-300 pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: teacher.color }} />
          <span>{avatarMode === 'studio' ? 'Realistic Studio' : 'Articulated 3D'}</span>
        </div>
      </div>

      {/* ── Subtitle / Speech Bubble ── */}
      {showSpeechBubble && speechText && talking && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mt-2.5 rounded-2xl border border-indigo-500/30 bg-slate-900/95 p-3 text-xs leading-relaxed text-slate-200 max-h-24 overflow-y-auto shadow-lg backdrop-blur-sm"
          aria-live="polite"
        >
          <span className="font-semibold text-indigo-300 mr-1.5">{teacher.name}:</span>
          {speechText}
        </motion.p>
      )}

      {/* ── Action Toolbar ── */}
      <div className="mt-3 flex items-center gap-2 justify-center w-full">
        {size === 'full' && (
          <button
            type="button"
            onClick={() => setFloating(!floating)}
            className="rounded-xl border border-slate-700 bg-slate-800/90 hover:bg-slate-700 px-2.5 py-1.5 text-xs text-slate-200 transition"
          >
            {floating ? 'Dock' : 'Floating'}
          </button>
        )}
        {onAvatarClick && (
          <button
            type="button"
            onClick={onAvatarClick}
            aria-label={`Replay ${teacher.name}'s explanation`}
            title="Replay explanation"
            className="rounded-xl border border-slate-700 bg-slate-800/90 p-2 text-slate-200 hover:bg-slate-700 hover:text-white transition"
          >
            <RotateCcw size={15} />
          </button>
        )}
        {onPause && (
          <button
            type="button"
            onClick={onPause}
            aria-label="Stop narration"
            title="Stop narration"
            disabled={!talking}
            className="rounded-xl border border-slate-700 bg-slate-800/90 p-2 text-slate-200 disabled:opacity-30 hover:bg-slate-700 hover:text-white transition"
          >
            <Pause size={15} />
          </button>
        )}
        {onToggleVoice && (
          <button
            type="button"
            onClick={onToggleVoice}
            aria-label={isVoiceActive ? 'Mute teacher' : 'Enable teacher voice'}
            title={isVoiceActive ? 'Mute teacher' : 'Enable teacher voice'}
            className="rounded-xl border border-slate-700 bg-slate-800/90 p-2 text-slate-200 hover:bg-slate-700 hover:text-white transition"
          >
            {isVoiceActive ? <Volume2 size={15} className="text-emerald-400" /> : <VolumeX size={15} className="text-rose-400" />}
          </button>
        )}
      </div>

      <p className="mt-2.5 text-[11px] leading-relaxed text-slate-400 text-center px-1">
        {teacher.approach}
      </p>
    </motion.section>
  );
};
