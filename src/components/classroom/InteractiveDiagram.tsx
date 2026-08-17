'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface InteractiveDiagramProps {
  type: 'hashmap' | 'array' | 'tree' | 'flowchart' | 'none';
  className?: string;
}

export const InteractiveDiagram: React.FC<InteractiveDiagramProps> = ({ type, className = '' }) => {
  if (type === 'none') return null;

  return (
    <div className={`bg-[#0b101f] border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center relative overflow-hidden select-none ${className}`}>
      <div className="absolute top-2 left-3 flex items-center space-x-1.5 z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
        <span className="text-[10px] font-mono text-purple-300 font-bold uppercase tracking-wider">
          MEMORY ARCHITECTURE · {type.toUpperCase()}
        </span>
      </div>

      <div className="w-full h-32 flex items-center justify-center pt-3">
        {type === 'hashmap' && (
          <div className="flex items-center space-x-4">
            {/* Key Input */}
            <motion.div
              animate={{ y: [-2, 2, -2] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="px-2.5 py-1.5 rounded-lg bg-purple-950 border border-purple-600 text-[11px] font-mono text-purple-200 shadow-md shadow-purple-950"
            >
              Key: "user"
            </motion.div>

            {/* Hash Function Arrow */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-mono text-slate-400">hash() % 8</span>
              <span className="text-purple-400 font-bold">➔</span>
            </div>

            {/* Bucket Array */}
            <div className="flex flex-col space-y-1">
              {[0, 1, 2, 3].map((b) => (
                <div
                  key={b}
                  className={`flex items-center space-x-2 px-2 py-0.5 rounded border text-[10px] font-mono ${
                    b === 2
                      ? 'bg-purple-600/30 border-purple-400 text-purple-100 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="font-bold text-slate-400">[{b}]</span>
                  <span>{b === 2 ? '➜ Entry(hash, "user", 0x7FA)' : 'empty'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {type === 'array' && (
          <div className="flex items-center space-x-2">
            {[
              { idx: 0, val: '0x10A', label: 'Item 0' },
              { idx: 1, val: '0x10B', label: 'Item 1' },
              { idx: 2, val: '0x10C', label: 'Item 2' },
              { idx: 3, val: '0x10D', label: 'Item 3' },
            ].map((cell) => (
              <motion.div
                key={cell.idx}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center p-2 rounded-lg bg-slate-900 border border-purple-500/40 font-mono text-[10px]"
              >
                <span className="text-slate-400">Idx [{cell.idx}]</span>
                <span className="text-purple-300 font-bold my-0.5">{cell.val}</span>
                <span className="text-[9px] text-emerald-400 bg-emerald-950/60 px-1 rounded">{cell.label}</span>
              </motion.div>
            ))}
          </div>
        )}

        {type === 'tree' && (
          <div className="flex flex-col items-center space-y-2">
            <div className="px-2.5 py-1 rounded bg-purple-600/40 border border-purple-400 text-[10px] font-mono text-purple-100">
              Root Node [0]
            </div>
            <div className="flex items-center space-x-8">
              <div className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-purple-300">
                Left [1]
              </div>
              <div className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-purple-300">
                Right [2]
              </div>
            </div>
          </div>
        )}

        {type === 'flowchart' && (
          <div className="flex items-center space-x-3 text-[10px] font-mono">
            <div className="px-2 py-1 rounded bg-purple-950 border border-purple-600 text-purple-200">
              Input Stream
            </div>
            <span className="text-purple-400">➔</span>
            <div className="px-2 py-1 rounded bg-indigo-950 border border-indigo-500 text-indigo-200">
              Filter / Check
            </div>
            <span className="text-purple-400">➔</span>
            <div className="px-2 py-1 rounded bg-emerald-950 border border-emerald-500 text-emerald-200">
              Deterministic Output
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
