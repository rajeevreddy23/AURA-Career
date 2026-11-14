'use client';
import React, { Component, useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import type { LessonSlide } from '@/hooks/useClassroomState';
import Scene, { CameraShot, RoomTheme } from './Scene';

class SceneBoundary extends Component<{ children: React.ReactNode; onFailure: () => void; fallback: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function ContextHealth({ fail }: { fail: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const lost = (event: Event) => { event.preventDefault(); fail(); };
    gl.domElement.addEventListener('webglcontextlost', lost);
    return () => gl.domElement.removeEventListener('webglcontextlost', lost);
  }, [gl, fail]);
  return null;
}

interface Props { slide: LessonSlide; theme: RoomTheme; shot: CameraShot; forceFallback?: boolean }
export default function Stage({ slide, theme, shot, forceFallback = false }: Props) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [reduced, setReduced] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(preference.matches); update();
    preference.addEventListener('change', update);
    const probe = document.createElement('canvas');
    const context = probe.getContext('webgl2'); setSupported(Boolean(context));
    context?.getExtension('WEBGL_lose_context')?.loseContext();
    setQuality(window.matchMedia('(max-width: 767px)').matches || navigator.hardwareConcurrency <= 4 ? 'low' : 'medium');
    return () => preference.removeEventListener('change', update);
  }, [attempt]);
  const fallback = <div className="h-full overflow-y-auto bg-slate-950 p-6 sm:p-10 text-slate-100" role="status">
    <p className="text-amber-300 text-sm">{forceFallback ? 'Accessible board view' : '3D room unavailable on this device. Your lesson is still available.'}</p>
    <h2 className="text-2xl font-bold mt-5">{slide.title}</h2>
    <p className="leading-8 mt-4">{slide.speech}</p>
    <ul className="space-y-3 mt-5 list-disc pl-5">{slide.keyPoints.map(point => <li key={point}>{point}</li>)}</ul>
    {!forceFallback && <button onClick={() => { setFailed(false); setReady(false); setSupported(null); setAttempt(v => v + 1); }} className="mt-5 px-4 py-2 rounded-xl bg-indigo-600">Retry 3D room</button>}
  </div>;
  return <div ref={host} className="relative h-full min-h-[360px] rounded-3xl overflow-hidden border border-white/10 bg-slate-950" aria-label="3D classroom stage">
    {supported === null && !forceFallback ? <div className="absolute inset-0 grid place-content-center text-indigo-200" role="status">Preparing classroom…</div> : supported === false || failed || forceFallback ? fallback : <SceneBoundary key={attempt} fallback={fallback} onFailure={() => setFailed(true)}>
      <Canvas frameloop="demand" dpr={quality === 'low' ? 1 : quality === 'high' ? [1, 2] : [1, 1.5]} shadows={quality !== 'low'} camera={{position: [0, 3.3, 8.5], fov: 48, near: 0.1, far: 50}} gl={{antialias: quality !== 'low', powerPreference: 'default'}} onCreated={() => setReady(true)}>
        <Scene slide={slide} theme={theme} shot={shot} quality={quality} reducedMotion={reduced} />
        <ContextHealth fail={() => setFailed(true)} />
      </Canvas>
      {!ready && <div className="absolute inset-0 grid place-content-center text-indigo-200 pointer-events-none" role="status">Lighting your room…</div>}
    </SceneBoundary>}
    {!forceFallback && supported && !failed && <label className="absolute right-3 bottom-3 rounded-lg bg-slate-950/80 border border-white/10 px-3 py-2 text-xs text-white">Quality <select aria-label="3D quality" value={quality} onChange={e => setQuality(e.target.value as typeof quality)} className="bg-transparent ml-2"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>}
  </div>;
}
