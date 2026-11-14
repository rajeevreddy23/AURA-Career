'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useClassroomState } from '@/hooks/useClassroomState';
import { playAuraVoice, stopAllVoicePlayback } from '@/lib/ai/voice';
import type { CameraShot, RoomTheme } from '@/components/classroom/stage/Scene';

const Stage = dynamic(() => import('@/components/classroom/stage/Stage'), { ssr: false, loading: () => <div role="status" className="h-full grid place-content-center text-indigo-200">Loading 3D classroom…</div> });

export default function ClassroomStudioPreview() {
  const params = useSearchParams();
  const course = params.get('course') || params.get('courseId') || '1';
  const { user, loading } = useAuth();
  const { session, currentSlide, goToSlideInModule, currentOverallSlideNumber, totalSlides } = useClassroomState(course, loading ? 'pending' : user?.uid || 'guest');
  const [theme, setTheme] = useState<RoomTheme>('classroom');
  const [shot, setShot] = useState<CameraShot>('wide');
  const [boardView, setBoardView] = useState(params.get('fallback') === '1');
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { stopAllVoicePlayback(); setSpeaking(false); }, [currentSlide.slideId]);
  useEffect(() => () => stopAllVoicePlayback(), []);
  const explain = () => {
    setError('');
    playAuraVoice({teacherId: params.get('teacher') || 'professor', text: currentSlide.speech, onStart: () => setSpeaking(true), onEnd: () => setSpeaking(false), onError: () => setError('Audio unavailable. Read the lesson transcript below.')});
  };
  return <main className="min-h-dvh bg-[#0a1220] text-slate-100 p-4 sm:p-6">
    <div className="max-w-[1600px] mx-auto space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs uppercase tracking-[0.2em] text-teal-300">AURA LEARN · 3D room foundation</p><h1 className="text-xl sm:text-2xl font-bold mt-2">A classroom with space to think.</h1><p className="text-xs text-slate-400 mt-2">Phase 1 preview. Rigged teachers and timed teaching are not connected yet.</p></div>
        <Link href={`/classroom?course=${encodeURIComponent(course)}&teacher=${encodeURIComponent(params.get('teacher') || 'professor')}`} onClick={stopAllVoicePlayback} className="rounded-xl border border-slate-700 px-4 py-2 text-sm">Return to live class</Link>
      </header>
      <div className="flex flex-wrap gap-3 items-center rounded-2xl border border-white/10 bg-white/5 p-3">
        <label className="text-xs text-slate-300">Room <select aria-label="Classroom theme" value={theme} onChange={e => setTheme(e.target.value as RoomTheme)} className="ml-2 rounded-lg bg-slate-900 p-2"><option value="classroom">Classroom</option><option value="studio">Modern Studio</option><option value="library">Library</option><option value="lab">Science Lab</option></select></label>
        <label className="text-xs text-slate-300">Camera <select aria-label="Camera view" value={shot} onChange={e => setShot(e.target.value as CameraShot)} className="ml-2 rounded-lg bg-slate-900 p-2"><option value="wide">Wide room</option><option value="board">Board close-up</option><option value="teacher">Teacher position</option><option value="shoulder">Over the shoulder</option><option value="orbit">Free orbit</option></select></label>
        <button aria-pressed={boardView} onClick={() => setBoardView(v => !v)} className="rounded-lg border border-slate-600 px-3 py-2 text-xs">{boardView ? 'Show 3D room' : 'Accessible board view'}</button>
        <label className="text-xs text-slate-300 flex-1 min-w-0">Lesson <select aria-label="Preview lesson" value={`${session.currentModuleIndex}:${session.currentSlideIndex}`} onChange={e => { const [m, s] = e.target.value.split(':').map(Number); goToSlideInModule(m, s); }} className="ml-2 rounded-lg bg-slate-900 p-2 max-w-full w-[min(100%,420px)]">{session.modules.map((module, m) => <optgroup key={module.moduleId} label={module.moduleTitle}>{module.slides.map((slide, s) => <option key={slide.slideId} value={`${m}:${s}`}>{slide.title}</option>)}</optgroup>)}</select></label>
      </div>
      <div className="h-[62dvh] min-h-[400px]"><Stage slide={currentSlide} theme={theme} shot={shot} forceFallback={boardView} /></div>
      <section className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 flex flex-wrap items-start gap-4">
        <div className="flex-1 min-w-[200px]"><p className="text-xs text-teal-300">LESSON {currentOverallSlideNumber} / {totalSlides}</p><h2 className="text-lg font-semibold mt-2">{currentSlide.title}</h2><p className="text-sm leading-7 text-slate-300 mt-3">{currentSlide.speech}</p>{error && <p className="text-sm text-amber-300 mt-2" role="alert">{error}</p>}</div>
        <button onClick={speaking ? () => { stopAllVoicePlayback(); setSpeaking(false); } : explain} className="rounded-xl bg-indigo-600 px-4 py-3 text-sm">{speaking ? 'Stop explanation' : 'Listen to saved lesson'}</button>
        <Link onClick={stopAllVoicePlayback} href={`/coding-lab?courseId=${encodeURIComponent(course)}`} className="rounded-xl border border-slate-600 px-4 py-3 text-sm">Open coding lab</Link>
      </section>
    </div>
  </main>;
}
