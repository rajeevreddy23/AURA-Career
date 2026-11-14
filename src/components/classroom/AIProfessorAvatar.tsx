'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReferenceTeacher from './ReferenceTeacher';
import { Volume2, VolumeX, RotateCcw, Pause } from 'lucide-react';
import { getTeacher } from '@/lib/ai/teachers';

export type ProfessorState = 'idle' | 'thinking' | 'preparing_lesson' | 'teaching' | 'speaking' | 'listening' | 'processing_question' | 'answering' | 'paused' | 'lesson_completed' | 'error';
export type TeacherStyleId = 'professor' | 'coach' | 'friend' | 'expert' | 'simplifier' | string;
export type AvatarGesture = 'idle' | 'explaining' | 'thinking' | 'welcoming' | 'motivating' | 'listening';
export interface AIProfessorAvatarProps {
  state: ProfessorState; gesture?: AvatarGesture; teacherStyle?: TeacherStyleId;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'; gender?: 'female' | 'male';
  speechText?: string; isVoiceActive?: boolean; onAvatarClick?: () => void;
  onToggleVoice?: () => void; onPause?: () => void; onSwitchGender?: (gender: 'female' | 'male') => void;
  className?: string; showSpeechBubble?: boolean;
}
export const AIProfessorAvatar: React.FC<AIProfessorAvatarProps> = ({
  state, gesture = 'idle', teacherStyle = 'professor', size = 'full', speechText,
  isVoiceActive = true, onAvatarClick, onToggleVoice, onPause, className = '', showSpeechBubble = true,
}) => {
  const [floating, setFloating] = useState(false);
  const teacher = getTeacher(teacherStyle);
  const talking = ['speaking', 'answering', 'teaching'].includes(state);
  const thinking = ['thinking', 'preparing_lesson', 'processing_question'].includes(state);
  const status = thinking ? 'Thinking through your question' : state === 'listening' ? 'Listening to you' : talking ? 'Explaining' : state === 'paused' ? 'Paused' : 'Ready when you are';
  if (size === 'sm') return <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-slate-950 ${className}`} style={{ background: teacher.color }} aria-label={`${teacher.name}, ${status}`}>{teacher.initial}</span>;
  return <motion.section key={floating ? 'floating' : 'docked'} drag={floating} dragMomentum={false} className={`${floating ? 'fixed bottom-28 right-5 z-50 w-64 max-h-[calc(100dvh-160px)] overflow-y-auto rounded-3xl border border-slate-600 bg-slate-950 p-3 shadow-2xl cursor-grab' : 'w-full'} flex flex-col items-center ${className}`} aria-label={`${teacher.name}, ${teacher.role}`}>
    <div className="w-full mb-2 text-center">
      <h3 className="font-bold text-lg text-white">{teacher.name}</h3>
      <p className="text-xs" style={{ color: teacher.color }}>{teacher.role} · {status}</p>
    </div>
    <div className={`relative w-full shrink-0 rounded-3xl overflow-hidden bg-[#f2eeeb] ${size === 'md' ? 'h-[320px]' : floating ? 'h-[290px]' : 'h-[clamp(230px,calc(100dvh-365px),550px)]'}`}>
      <ReferenceTeacher teacherStyle={teacherStyle} speaking={talking} thinking={thinking} />
    </div>
    {showSpeechBubble && speechText && talking && <p className="w-full rounded-xl border border-slate-700 bg-slate-900/90 p-3 text-xs leading-relaxed text-slate-200 max-h-24 overflow-y-auto" aria-live="polite">{speechText}</p>}
    <div className="mt-3 flex gap-2 justify-center">
      {size === 'full' && <button onClick={() => setFloating(!floating)} className="rounded-xl border border-slate-700 bg-slate-800 px-2 text-xs text-slate-200">{floating ? 'Dock teacher' : 'Move teacher'}</button>}
      {onAvatarClick && <button onClick={onAvatarClick} aria-label={`Replay ${teacher.name}'s explanation`} title="Replay explanation" className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-200 hover:bg-slate-700"><RotateCcw size={16} /></button>}
      {onPause && <button onClick={onPause} aria-label="Stop narration" title="Stop narration" disabled={!talking} className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-200 disabled:opacity-40"><Pause size={16} /></button>}
      {onToggleVoice && <button onClick={onToggleVoice} aria-label={isVoiceActive ? 'Mute teacher' : 'Enable teacher voice'} title={isVoiceActive ? 'Mute teacher' : 'Enable teacher voice'} className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-200">{isVoiceActive ? <Volume2 size={16} /> : <VolumeX size={16} />}</button>}
    </div>
    <p className="mt-3 text-[11px] leading-relaxed text-slate-400 text-center">{teacher.approach}</p>
  </motion.section>;
};
