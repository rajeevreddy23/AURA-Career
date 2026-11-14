'use client';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Play, Lightbulb, Code2, CheckCircle2, MessageCircle } from 'lucide-react';
import type { LessonSlide } from '@/hooks/useClassroomState';
import { getTeacher } from '@/lib/ai/teachers';
import LessonVisual from './LessonVisual';

interface Props {
  slide: LessonSlide; teacherStyle: string; busy: boolean;
  speak: (text: string) => void; ask: (text: string) => void;
}
export default function TeachingBoard({ slide, teacherStyle, busy, speak, ask }: Props) {
  const [step, setStep] = useState(0);
  const [prediction, setPrediction] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const teacher = getTeacher(teacherStyle);
  const steps = ['Understand', 'Work through', 'Predict', 'Check yourself'];
  const speech = step === 0 ? slide.speech : step === 1 ? slide.explanation : step === 2 ? `Before we reveal the output, what do you think this example will produce? ${showOutput ? `The expected result is ${slide.output}.` : 'Take a moment to reason through each step.'}` : `Let us check your understanding of ${slide.title}. ${slide.keyPoints?.join('. ')}. Explain the idea in your own words, or ask me about the part that is unclear.`;
  return <section className="rounded-3xl border border-slate-700 bg-[#101c2c] overflow-hidden shadow-xl mb-6" aria-label="Interactive lesson board">
    <div className="px-5 py-4 border-b border-slate-700 flex flex-wrap gap-3 items-center justify-between">
      <div><p className="text-xs uppercase tracking-widest" style={{ color: teacher.color }}>{teacher.name}&apos;s lesson · {slide.conceptTag || 'One concept at a time'}</p><h2 className="text-xl font-bold text-white mt-1">{slide.title}</h2></div>
      <div className="flex gap-2 flex-wrap"><button onClick={() => speak(speech)} aria-label="Explain this board" className="flex items-center gap-2 rounded-xl bg-indigo-500/20 border border-indigo-400/40 px-3 py-2 text-sm text-indigo-100"><Play size={15} /> Explain this</button><button disabled={busy} onClick={() => ask(`Teach me ${slide.title} in your teaching style. Use the current lesson example, build the idea from a real-life situation, walk through it, and ask me one prediction question.`)} className="rounded-xl bg-teal-500/10 border border-teal-400/30 px-3 py-2 text-sm text-teal-100 disabled:opacity-40">Live explanation</button></div>
    </div>
    <nav className="grid grid-cols-4 gap-1 p-3 bg-slate-950/30" aria-label="Lesson stages">
      {steps.map((label, i) => <button key={label} onClick={() => setStep(i)} aria-current={i === step ? 'step' : undefined} className={`rounded-xl px-2 py-2 text-xs sm:text-sm transition ${i === step ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>{i + 1}. {label}</button>)}
    </nav>
    <div className="p-5 sm:p-7 min-h-[220px] space-y-4">
      {(step === 0 || step === 1) && <LessonVisual key={slide.slideId} slide={slide} />}
      {step === 0 && <><div className="flex gap-3 text-indigo-200"><Lightbulb className="shrink-0" /><p className="text-base leading-8 text-slate-100 whitespace-pre-wrap">{slide.speech}</p></div><div className="grid gap-2 sm:grid-cols-3">{slide.keyPoints?.map((point, i) => <div key={i} className="rounded-xl p-3 bg-slate-950/40 border border-slate-700 text-sm leading-relaxed text-slate-300"><span className="text-indigo-300 font-bold mr-2">0{i + 1}</span>{point}</div>)}</div></>}
      {step === 1 && <><h3 className="flex gap-2 items-center text-sm font-semibold text-indigo-200"><Code2 size={18} /> {slide.exampleTitle || 'Worked example'}</h3>{slide.code && <pre className="rounded-2xl bg-[#070e19] p-4 text-sm leading-7 font-mono text-teal-200 overflow-x-auto"><code>{slide.code}</code></pre>}<p className="text-sm leading-7 text-slate-200 whitespace-pre-wrap">{slide.explanation}</p><button disabled={busy} onClick={() => ask(`Walk me through the worked example for ${slide.title}, line by line. Explain each change of value and why it happens.`)} className="text-sm text-indigo-300 underline underline-offset-4 disabled:opacity-40">Walk me through each step</button></>}
      {step === 2 && <><p className="text-base text-slate-100">Pause and predict: what will this example produce?</p><label className="block text-xs text-slate-400" htmlFor="output-prediction">Your prediction</label><textarea id="output-prediction" value={prediction} onChange={e => setPrediction(e.target.value)} placeholder="Describe the result and your reasoning…" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm" /><div className="flex flex-wrap gap-3"><button onClick={() => setShowOutput(!showOutput)} className="rounded-xl px-3 py-2 bg-teal-500/20 text-teal-200 text-sm">{showOutput ? 'Hide output' : 'Reveal expected output'}</button><button disabled={!prediction.trim() || busy} onClick={() => ask(`For ${slide.title}, my predicted output is: ${prediction}. Please check my reasoning against the current example, explain any mistake, and ask one follow-up question.`)} className="rounded-xl px-3 py-2 bg-indigo-500/20 text-indigo-200 text-sm disabled:opacity-40">Check my reasoning</button></div>{showOutput && <pre className="bg-slate-950 border border-teal-600/30 p-4 rounded-xl text-teal-200 text-sm overflow-x-auto">{slide.output || 'No console output for this example.'}</pre>}</>}
      {step === 3 && <><h3 className="flex items-center gap-2 text-teal-200"><CheckCircle2 size={19} /> Explain it back</h3><p className="text-slate-200 leading-7">How would you explain {slide.title.toLowerCase()} to someone seeing it for the first time? Try a simple example of your own.</p><div className="flex flex-wrap gap-2">{['Give me a small practice exercise', 'Explain this with a real-life analogy', 'I am confused; explain it more simply'].map(q => <button key={q} disabled={busy} onClick={() => ask(`${q}. Our lesson is ${slide.title}.`)} className="text-sm rounded-xl border border-slate-600 px-3 py-2 text-slate-200 hover:border-indigo-400 disabled:opacity-40">{q}</button>)}</div></>}
    </div>
    <div className="px-5 py-3 border-t border-slate-700 flex items-center justify-between gap-3">
      <button disabled={step === 0} onClick={() => setStep(s => s - 1)} className="flex items-center gap-1 text-sm text-slate-300 disabled:opacity-30"><ArrowLeft size={15} /> Back</button>
      <button disabled={busy} onClick={() => ask(`I have a doubt about ${slide.title}. Help me understand the key idea using this lesson's example.`)} className="text-xs sm:text-sm text-indigo-300 flex items-center gap-2 disabled:opacity-40"><MessageCircle size={15} /> Ask a doubt</button>
      <button disabled={step === 3} onClick={() => setStep(s => s + 1)} className="flex items-center gap-1 text-sm text-slate-300 disabled:opacity-30">Next step <ArrowRight size={15} /></button>
    </div>
  </section>;
}
