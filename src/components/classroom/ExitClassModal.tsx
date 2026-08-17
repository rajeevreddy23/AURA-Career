'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { X, LogOut, LayoutDashboard, GraduationCap, BookOpen } from 'lucide-react';

interface ExitClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
}

export const ExitClassModal: React.FC<ExitClassModalProps> = ({
  isOpen,
  onClose,
  courseTitle,
}) => {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Exit Live Classroom?</h3>
                <p className="text-xs text-slate-400 line-clamp-1">{courseTitle}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800">
            Your lesson progress and notes are auto-saved. Select where you would like to go next:
          </p>

          <div className="space-y-2.5">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-between transition border border-slate-700"
            >
              <span className="flex items-center space-x-2">
                <LayoutDashboard className="w-4 h-4 text-purple-400" />
                <span>Return to Student Dashboard</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">Dashboard</span>
            </button>

            <button
              onClick={() => router.push('/select-teacher')}
              className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-between transition border border-slate-700"
            >
              <span className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>Choose a Different AI Teacher</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">AI Teachers</span>
            </button>

            <button
              onClick={() => router.push('/courses')}
              className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-between transition border border-slate-700"
            >
              <span className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>Explore Other Courses</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">Catalog</span>
            </button>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition"
            >
              Stay in Live Class
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
