'use client';
import { useState } from 'react';
import type { LessonSlide } from '@/hooks/useClassroomState';

export default function LessonVisual({ slide }: { slide: LessonSlide }) {
  const [selected, setSelected] = useState(0);
  const literal = slide.code?.match(/\[\s*((?:-?\d+(?:\.\d+)?\s*,\s*)*-?\d+(?:\.\d+)?\s*)\]/);
  const values = literal?.[1].split(',').map(v => v.trim()).slice(0, 10);
  const points = slide.keyPoints?.filter(Boolean).slice(0, 4) || [];
  if (!values && !points.length) return null;
  return <figure className="rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-950/40 to-slate-950 p-5">
    <figcaption className="text-xs uppercase tracking-widest text-indigo-300 mb-4">{values ? 'Explore the list in this example' : 'Your learning map'}</figcaption>
    {values ? <><div className="flex gap-2 flex-wrap">{values.map((value, i) => <button key={i} onClick={() => setSelected(i)} aria-pressed={selected === i} aria-label={`Index ${i}, value ${value}`} className={`min-w-14 rounded-xl border p-3 transition-all ${selected === i ? 'border-teal-300 bg-teal-400/20 -translate-y-1' : 'border-slate-600 bg-slate-800'}`}><span className="block text-lg font-mono text-white">{value}</span><span className="text-[10px] text-slate-400">index {i}</span></button>)}</div><p className="text-sm text-slate-300 mt-4" aria-live="polite">Index <span className="text-teal-300">{selected}</span> selects <span className="text-teal-300">{values[selected]}</span>. Counting starts at zero. Click a cell to explore.</p></> : <div className="grid gap-3 sm:grid-cols-2">{points.map((point, i) => <div key={i} className="flex gap-3 items-start"><span className="rounded-full bg-indigo-400/20 px-2 py-1 text-xs text-indigo-200">{i + 1}</span><p className="text-sm leading-6 text-slate-200">{point}</p></div>)}</div>}
  </figure>;
}
