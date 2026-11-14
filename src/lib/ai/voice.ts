'use client';
import { getTeacher, TEACHERS } from './teachers';

export interface VoiceOption { id: string; name: string; gender: 'male' | 'female'; language: string }
export interface SpeechFrame { active: boolean; mouth: number; rounded: number; word: string }
export interface PlayVoiceOptions {
  text: string; voice?: string; teacherId?: string; speed?: number; pitch?: number;
  gender?: 'male' | 'female'; onStart?: () => void; onEnd?: () => void;
  onError?: (err: unknown) => void; onBoundary?: (word: string, charIndex: number) => void;
}
export interface StopPlaybackHandle { stop: () => void }
let activeStop: (() => void) | null = null;
let frame: SpeechFrame = { active: false, mouth: 0, rounded: 0, word: '' };
export const getSpeechFrame = () => frame;
export function sanitizeSpeechText(text: string): string {
  return text.replace(/```[\s\S]*?```/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_~`]/g, '').replace(/^\s*[-•]\s+/gm, '').replace(/\n+/g, '. ').replace(/\s+/g, ' ').trim();
}
export async function getSupportedVoices(): Promise<VoiceOption[]> {
  return TEACHERS.map(t => ({ id: t.voice, name: t.name, gender: t.gender, language: t.voice.split('-').slice(0, 2).join('-') }));
}
export function stopAllVoicePlayback() {
  const stop = activeStop; activeStop = null; stop?.();
  frame = { active: false, mouth: 0, rounded: 0, word: '' };
  if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
}
export function playAuraVoice(options: PlayVoiceOptions): StopPlaybackHandle {
  stopAllVoicePlayback();
  const text = sanitizeSpeechText(options.text);
  const teacher = getTeacher(options.teacherId || TEACHERS.find(t => t.voice === options.voice)?.id || (options.gender === 'male' ? 'coach' : 'professor'));
  if (!text || typeof window === 'undefined') { options.onEnd?.(); return { stop() {} }; }
  const controller = new AbortController();
  let cancelled = false, ended = false, audio: HTMLAudioElement | null = null;
  let audioContext: AudioContext | null = null, raf = 0, wordIndex = 0, lastBoundaryAt = 0;
  const words = Array.from(text.matchAll(/\S+/g)).map(m => ({ word: m[0], index: m.index || 0 }));
  const speed = Math.max(0.5, Math.min(1.75, (options.speed || 1) * teacher.rate));
  const finish = () => {
    if (ended) return; ended = true;
    cancelAnimationFrame(raf); frame = { active: false, mouth: 0, rounded: 0, word: '' };
    audioContext?.close().catch(() => {});
    if (activeStop === stop) activeStop = null;
    options.onEnd?.();
  };
  const stop = () => { cancelled = true; controller.abort(); audio?.pause(); window.speechSynthesis?.cancel(); finish(); };
  activeStop = stop;
  const boundary = (index: number) => {
    const item = words.find(w => w.index >= index) || words[words.length - 1];
    if (!item) return;
    wordIndex = words.indexOf(item); lastBoundaryAt = performance.now(); frame.word = item.word;
    options.onBoundary?.(item.word, item.index);
  };
  const begin = (analyser?: AnalyserNode) => {
    if (cancelled) return;
    boundary(0); frame.active = true; options.onStart?.();
    const samples = analyser ? new Uint8Array(analyser.fftSize) : null;
    const tick = () => {
      if (cancelled || ended) return;
      const now = performance.now();
      if (now - lastBoundaryAt > 550 / speed && wordIndex < words.length - 1) boundary(words[wordIndex + 1].index);
      let energy = 0;
      if (analyser && samples) {
        analyser.getByteTimeDomainData(samples);
        energy = Math.sqrt(samples.reduce((sum, v) => sum + ((v - 128) / 128) ** 2, 0) / samples.length);
      }
      const pulse = (now - lastBoundaryAt) / 1000;
      const closed = /^[mbp]/i.test(frame.word) && pulse < 0.07;
      const mouth = closed ? 0.02 : analyser ? Math.min(1, energy * 7) : 0.12 + Math.max(0, Math.sin(pulse * 22 * speed)) * 0.6;
      frame.mouth += (mouth - frame.mouth) * 0.4;
      frame.rounded = /[ou]/i.test(frame.word) ? 0.6 : 0.05;
      raf = requestAnimationFrame(tick);
    }; tick();
  };
  const browserSpeech = async () => {
    if (cancelled) return;
    if (!window.speechSynthesis) { options.onError?.(new Error('Speech is unavailable in this browser')); finish(); return; }
    const synth = window.speechSynthesis;
    if (!synth.getVoices().length) await new Promise<void>(resolve => {
      const timeout = window.setTimeout(done, 700);
      function done() { clearTimeout(timeout); synth.removeEventListener('voiceschanged', done); resolve(); }
      synth.addEventListener('voiceschanged', done, { once: true });
    });
    if (cancelled) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    const preferred = teacher.browserVoices.map(name => voices.find(v => v.name.toLowerCase().includes(name.toLowerCase()))).find(Boolean);
    const genderPattern = teacher.gender === 'female' ? /zira|hazel|samantha|jenny|aria|susan|sonia|karen|female/i : /david|george|guy|ryan|daniel|alex|male/i;
    utterance.voice = preferred || voices.find(v => /^en/i.test(v.lang) && genderPattern.test(v.name)) || voices.find(v => /^en/i.test(v.lang)) || null;
    utterance.lang = utterance.voice?.lang || 'en-US'; utterance.rate = speed; utterance.pitch = options.pitch ?? teacher.pitch;
    utterance.onstart = () => begin();
    utterance.onboundary = e => { if (!cancelled && e.name === 'word') boundary(e.charIndex); };
    utterance.onend = finish;
    utterance.onerror = e => { if (!cancelled) options.onError?.(e); finish(); };
    synth.speak(utterance);
  };
  (async () => {
    try {
      const res = await fetch('/api/teacher-voice', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, teacherId: teacher.id, speed }),
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(6000)]),
      });
      if (!res.ok) throw new Error('Neural voice unavailable');
      const data = await res.json(); if (!data.audio) throw new Error('No audio returned');
      if (cancelled) return;
      audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
      let analyser: AnalyserNode | undefined;
      try {
        audioContext = new AudioContext();
        const source = audioContext.createMediaElementSource(audio);
        analyser = audioContext.createAnalyser(); analyser.fftSize = 256;
        source.connect(analyser); analyser.connect(audioContext.destination); await audioContext.resume();
      } catch { /* Word timing remains available without Web Audio. */ }
      audio.onplay = () => begin(analyser); audio.onended = finish;
      audio.onerror = () => { audio?.pause(); void browserSpeech(); };
      await audio.play();
    } catch { if (!cancelled) { audio?.pause(); audioContext?.close().catch(() => {}); await browserSpeech(); } }
  })();
  return { stop };
}
