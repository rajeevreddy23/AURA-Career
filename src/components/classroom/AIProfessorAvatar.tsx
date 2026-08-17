'use client';

import React from 'react';
import { motion } from 'framer-motion';

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

interface AIProfessorAvatarProps {
  state: ProfessorState;
  teacherStyle?: TeacherStyleId;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'w-32 h-40',
  md: 'w-48 h-60',
  lg: 'w-64 h-80',
  xl: 'w-80 h-96',
};

// Teacher Style Theme Configurations
const TEACHER_THEMES: Record<string, {
  primary: string;
  glow: string;
  platform: string;
  chestBg: string;
  emblemPath: string;
  badgeLabel: string;
}> = {
  professor: {
    primary: '#a855f7',
    glow: '#c084fc',
    platform: 'rgba(168, 85, 247, 0.5)',
    chestBg: '#1e1b4b',
    // Graduation Cap / Star
    emblemPath: 'M 100 145 L 112 151 L 100 157 L 88 151 Z M 112 151 L 112 160 M 100 157 L 100 165',
    badgeLabel: 'Professor',
  },
  coach: {
    primary: '#f59e0b',
    glow: '#fbbf24',
    platform: 'rgba(245, 158, 11, 0.5)',
    chestBg: '#451a03',
    // Lightning Zap
    emblemPath: 'M 102 145 L 94 155 L 100 155 L 98 165 L 106 153 L 100 153 Z',
    badgeLabel: 'Coach',
  },
  friend: {
    primary: '#ec4899',
    glow: '#f472b6',
    platform: 'rgba(236, 72, 153, 0.5)',
    chestBg: '#500724',
    // Heart
    emblemPath: 'M 100 162 C 95 157 88 150 88 145 C 88 140 92 138 96 140 C 99 142 100 145 100 145 C 100 145 101 142 104 140 C 108 138 112 140 112 145 C 112 150 105 157 100 162 Z',
    badgeLabel: 'Friend',
  },
  expert: {
    primary: '#8b5cf6',
    glow: '#a78bfa',
    platform: 'rgba(139, 92, 246, 0.5)',
    chestBg: '#2e1065',
    // Brain / Diamond Node
    emblemPath: 'M 100 143 L 110 153 L 100 163 L 90 153 Z M 100 148 L 105 153 L 100 158 L 95 153 Z',
    badgeLabel: 'Expert',
  },
  simplifier: {
    primary: '#06b6d4',
    glow: '#22d3ee',
    platform: 'rgba(6, 182, 212, 0.5)',
    chestBg: '#083344',
    // Lightbulb / Book
    emblemPath: 'M 94 145 Q 100 140 106 145 Q 108 152 103 156 L 103 160 L 97 160 L 97 156 Q 92 152 94 145 Z',
    badgeLabel: 'Simplifier',
  },
};

export const AIProfessorAvatar: React.FC<AIProfessorAvatarProps> = ({
  state = 'idle',
  teacherStyle = 'professor',
  size = 'lg',
  className = '',
}) => {
  // Normalize style key
  const normalizedStyle = teacherStyle.toLowerCase().includes('coach')
    ? 'coach'
    : teacherStyle.toLowerCase().includes('friend')
    ? 'friend'
    : teacherStyle.toLowerCase().includes('expert')
    ? 'expert'
    : teacherStyle.toLowerCase().includes('simplifier')
    ? 'simplifier'
    : 'professor';

  const theme = TEACHER_THEMES[normalizedStyle] || TEACHER_THEMES.professor;

  // State-specific visual parameters
  const isError = state === 'error';
  const isPaused = state === 'paused';
  const isSpeaking = state === 'speaking' || state === 'answering';
  const isListening = state === 'listening';
  const isThinking = state === 'thinking' || state === 'processing_question' || state === 'preparing_lesson';
  const isTeaching = state === 'teaching';
  const isCompleted = state === 'lesson_completed';

  // Dynamic eye color & glows matching teacher style
  const eyeColor = isError ? '#ef4444' : isListening ? '#38bdf8' : theme.primary;
  const glowColor = isError ? '#f87171' : isListening ? '#7dd3fc' : theme.glow;
  const platformGlow = isError ? 'rgba(239, 68, 68, 0.4)' : isListening ? 'rgba(56, 189, 248, 0.6)' : theme.platform;

  // Float animation parameters based on state & teacher
  const floatY = isPaused ? [0, 0] : isThinking ? [-4, 4, -4] : isSpeaking ? [-8, 2, -8] : [-6, 6, -6];
  const floatDuration = isThinking ? 1.5 : isSpeaking ? 1.2 : 3.0;
  const platformSpeed = isThinking ? 2 : isSpeaking ? 4 : isPaused ? 0 : 8;

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${sizeMap[size]} ${className}`}>
      {/* Background Hologram Particle Burst / Ambient Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{
            scale: isSpeaking ? [1, 1.25, 1] : isListening ? [1.1, 1.2, 1.1] : [0.95, 1.05, 0.95],
            opacity: isPaused ? 0.2 : isSpeaking ? [0.6, 0.9, 0.6] : 0.4,
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background: `radial-gradient(circle, ${platformGlow} 0%, rgba(15, 23, 42, 0.1) 55%, transparent 75%)`,
          }}
          className="w-full h-full rounded-full filter blur-xl"
        />
      </div>

      {/* Floating Robot Body Structure */}
      <motion.div
        animate={{ y: floatY, rotate: isListening ? [-1, 2, -1] : isThinking ? [-2, 2, -2] : 0 }}
        transition={{ duration: floatDuration, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 w-full h-[85%] flex items-center justify-center"
      >
        <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-2xl overflow-visible">
          <defs>
            {/* Glossy Metallic Plastic Gradients */}
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>

            <linearGradient id="headGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="80%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>

            <linearGradient id="screenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#090d16" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>

            <linearGradient id="teacherGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.glow} />
              <stop offset="100%" stopColor={theme.primary} />
            </linearGradient>

            <filter id="eyeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Top Antenna Orb & Stem */}
          <g>
            <line x1="100" y1="28" x2="100" y2="45" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            <motion.circle
              cx="100"
              cy="24"
              r="7"
              fill="url(#teacherGlow)"
              filter="url(#eyeGlow)"
              animate={{
                scale: isThinking || isListening ? [1, 1.3, 1] : 1,
                opacity: isPaused ? 0.4 : [0.7, 1, 0.7],
              }}
              transition={{ duration: isThinking ? 0.8 : 1.8, repeat: Infinity }}
            />
          </g>

          {/* Left Arm */}
          <motion.g
            animate={{
              rotate: isListening ? [5, -5, 5] : isSpeaking ? [-10, 10, -10] : 0,
            }}
            style={{ transformOrigin: '55px 145px' }}
          >
            <path d="M 55 145 Q 35 155 38 175 C 40 185 55 185 58 170 C 60 160 62 148 55 145 Z" fill="url(#bodyGradient)" />
          </motion.g>

          {/* Right Arm (Teaching / Pointing Pose) */}
          <motion.g
            animate={{
              rotate: isTeaching ? [-35, -25, -35] : isSpeaking ? [-20, 0, -20] : [0, 5, 0],
            }}
            style={{ transformOrigin: '145px 145px' }}
          >
            <path d="M 145 145 Q 168 130 178 115 C 185 105 170 95 160 110 C 150 125 145 140 145 145 Z" fill="url(#bodyGradient)" />
            {isTeaching && (
              <circle cx="180" cy="100" r="4" fill={theme.glow} filter="url(#eyeGlow)" />
            )}
          </motion.g>

          {/* Main Torso Body */}
          <rect x="62" y="125" width="76" height="70" rx="35" fill="url(#bodyGradient)" />
          <path d="M 64 160 Q 100 180 136 160 C 130 185 115 195 100 195 C 85 195 70 185 64 160 Z" fill="#cbd5e1" opacity="0.4" />

          {/* Chest Emblem Badge (Dynamic per AI Teacher Persona) */}
          <g>
            <circle cx="100" cy="155" r="14" fill={theme.chestBg} stroke={theme.primary} strokeWidth="2" />
            <motion.path
              d={theme.emblemPath}
              fill="none"
              stroke={eyeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#eyeGlow)"
              animate={{
                rotate: isCompleted ? [0, 180, 360] : 0,
                scale: isThinking ? [0.9, 1.2, 0.9] : 1,
              }}
              transition={{ duration: isThinking ? 0.6 : 2, repeat: isThinking || isCompleted ? Infinity : 0 }}
              style={{ transformOrigin: '100px 155px' }}
            />
          </g>

          {/* Head Capsule */}
          <rect x="42" y="42" width="116" height="90" rx="42" fill="url(#headGradient)" stroke="#f8fafc" strokeWidth="2" />
          <rect x="36" y="72" width="10" height="30" rx="5" fill="#94a3b8" />
          <rect x="154" y="72" width="10" height="30" rx="5" fill="#94a3b8" />

          {/* Black OLED Screen */}
          <rect x="52" y="52" width="96" height="70" rx="32" fill="url(#screenGradient)" stroke="#334155" strokeWidth="1.5" />

          {/* OLED Eyes */}
          <g>
            {/* Left Eye */}
            <motion.circle
              cx="78"
              cy="80"
              r={isListening ? 7 : isThinking ? 5 : 6}
              fill={eyeColor}
              filter="url(#eyeGlow)"
              animate={{
                scaleY: isPaused ? 0.2 : [1, 1, 0.1, 1],
              }}
              transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 1] }}
            />
            {/* Right Eye */}
            <motion.circle
              cx="122"
              cy="80"
              r={isListening ? 7 : isThinking ? 5 : 6}
              fill={eyeColor}
              filter="url(#eyeGlow)"
              animate={{
                scaleY: isPaused ? 0.2 : [1, 1, 0.1, 1],
              }}
              transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 1] }}
            />
          </g>

          {/* OLED Mouth Waveform */}
          <g>
            {isSpeaking ? (
              <motion.path
                d="M 86 102 Q 93 94 100 102 Q 107 110 114 102"
                fill="none"
                stroke={glowColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                filter="url(#eyeGlow)"
                animate={{
                  d: [
                    "M 86 102 Q 93 94 100 102 Q 107 110 114 102",
                    "M 86 102 Q 93 110 100 102 Q 107 94 114 102",
                    "M 86 102 Q 93 98 100 102 Q 107 106 114 102",
                  ],
                }}
                transition={{ duration: 0.25, repeat: Infinity, ease: 'linear' }}
              />
            ) : isError ? (
              <path d="M 88 106 Q 100 98 112 106" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
            ) : isListening ? (
              <circle cx="100" cy="102" r="4.5" fill="none" stroke={glowColor} strokeWidth="2" filter="url(#eyeGlow)" />
            ) : (
              <path d="M 88 98 Q 100 108 112 98" fill="none" stroke={glowColor} strokeWidth="2.5" strokeLinecap="round" filter="url(#eyeGlow)" />
            )}
          </g>
        </svg>
      </motion.div>

      {/* Glowing Holographic Platform */}
      <div className="relative z-0 w-full h-[15%] flex items-center justify-center">
        <motion.div
          animate={{ rotate: platformSpeed ? 360 : 0 }}
          transition={{ duration: platformSpeed || 8, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[80%] h-6 rounded-[100%] border shadow-lg"
          style={{
            transform: 'rotateX(70deg)',
            borderColor: theme.primary,
            boxShadow: `0 0 15px ${theme.platform}`,
          }}
        />
        <motion.div
          animate={{
            scale: isThinking ? [0.9, 1.1, 0.9] : [1, 1.05, 1],
            opacity: isPaused ? 0.3 : [0.6, 0.9, 0.6],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute w-[60%] h-4 rounded-[100%] border"
          style={{
            transform: 'rotateX(70deg)',
            backgroundColor: `${theme.primary}20`,
            borderColor: theme.glow,
            boxShadow: `0 0 20px ${theme.platform}`,
          }}
        />
      </div>
    </div>
  );
};
