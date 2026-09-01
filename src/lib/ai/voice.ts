'use client';

export interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female';
  language: string;
}

export interface PlayVoiceOptions {
  text: string;
  voice?: string;
  speed?: number;
  pitch?: number;
  gender?: 'male' | 'female';
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

export interface StopPlaybackHandle {
  stop: () => void;
}

let activeAudio: HTMLAudioElement | null = null;

/**
 * Clean text for audio narration: strip markdown symbols, URLs, etc.
 */
export function sanitizeSpeechText(text: string): string {
  if (!text) return '';
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/[#*_~`]/g, '')
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fetch list of available neural and standard voices from the backend.
 */
export async function getSupportedVoices(): Promise<VoiceOption[]> {
  try {
    const res = await fetch('/api/v1/agents/public/voice/voices');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data?.data || [];
  } catch {
    return [
      { id: 'en-US-Neural2-F', name: 'Bekki (Female - Sweet Neural)', gender: 'female', language: 'en-US' },
      { id: 'en-US-Neural2-D', name: 'Ben (Male - Deep Bass Neural)', gender: 'male', language: 'en-US' },
      { id: 'en-US-Standard-C', name: 'Bekki (Female - Sweet Standard)', gender: 'female', language: 'en-US' },
      { id: 'en-US-Standard-D', name: 'Ben (Male - Deep Bass Standard)', gender: 'male', language: 'en-US' },
    ];
  }
}

/**
 * Play text using Backend Neural TTS first, falling back to Browser Web Speech API.
 */
export function playAuraVoice({
  text,
  voice,
  speed = 1.0,
  pitch,
  gender = 'female',
  onStart,
  onEnd,
  onError,
}: PlayVoiceOptions): StopPlaybackHandle {
  // Cancel any running speech or audio element
  stopAllVoicePlayback();

  const cleanText = sanitizeSpeechText(text);
  if (!cleanText) {
    onEnd?.();
    return { stop: () => {} };
  }

  let cancelled = false;

  const fallbackToWebSpeech = () => {
    if (cancelled || typeof window === 'undefined' || !window.speechSynthesis) {
      onEnd?.();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Query available browser neural & natural voices
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        if (gender === 'female') {
          // Bekki: Sweet, gentle female voice
          const femaleVoice = voices.find(
            (v) =>
              /female|woman|jenny|samantha|aria|eva|zira|karen|victoria/i.test(v.name) &&
              /en/i.test(v.lang)
          ) || voices.find((v) => /female|samantha|jenny|aria|eva/i.test(v.name));

          if (femaleVoice) {
            utterance.voice = femaleVoice;
          }
          // Sweet voice modulation: pitch 1.22 (sweet), soft rate
          utterance.pitch = pitch !== undefined ? pitch : 1.22;
          utterance.rate = Math.max(0.85, Math.min(1.2, speed * 0.95));
        } else {
          // Ben: Deep, resonant bass male voice
          const maleVoice = voices.find(
            (v) =>
              /male|man|guy|george|david|daniel|alex|mark|ryan/i.test(v.name) &&
              /en/i.test(v.lang)
          ) || voices.find((v) => /male|guy|david|daniel/i.test(v.name));

          if (maleVoice) {
            utterance.voice = maleVoice;
          }
          // Deep bass voice modulation: pitch 0.72 (deep bass), steady rate
          utterance.pitch = pitch !== undefined ? pitch : 0.72;
          utterance.rate = Math.max(0.8, Math.min(1.2, speed * 0.92));
        }
      } else {
        utterance.pitch = pitch !== undefined ? pitch : (gender === 'female' ? 1.22 : 0.72);
        utterance.rate = gender === 'female' ? 0.95 : 0.92;
      }

      utterance.onstart = () => {
        if (!cancelled) onStart?.();
      };
      utterance.onend = () => {
        if (!cancelled) onEnd?.();
      };
      utterance.onerror = (e) => {
        if (!cancelled) {
          onError?.(e);
          onEnd?.();
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      onError?.(e);
      onEnd?.();
    }
  };

  const defaultVoice = gender === 'female' ? 'en-US-Neural2-F' : 'en-US-Neural2-D';
  const targetVoice = voice || defaultVoice;

  // Attempt backend neural TTS synthesis first
  fetch('/api/v1/agents/public/voice/synthesize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: cleanText,
      voice: targetVoice,
      speed,
    }),
  })
    .then(async (res) => {
      if (cancelled) return;
      if (!res.ok) {
        fallbackToWebSpeech();
        return;
      }
      const data = await res.json();
      const base64Audio = data?.data?.audio_base64;
      if (base64Audio) {
        const audioSrc = `data:audio/mp3;base64,${base64Audio}`;
        const audio = new Audio(audioSrc);
        audio.playbackRate = speed;
        activeAudio = audio;

        audio.onplay = () => {
          if (!cancelled) onStart?.();
        };
        audio.onended = () => {
          activeAudio = null;
          if (!cancelled) onEnd?.();
        };
        audio.onerror = (e) => {
          activeAudio = null;
          if (!cancelled) {
            fallbackToWebSpeech();
          }
        };

        audio.play().catch(() => {
          fallbackToWebSpeech();
        });
      } else {
        fallbackToWebSpeech();
      }
    })
    .catch(() => {
      if (!cancelled) {
        fallbackToWebSpeech();
      }
    });

  return {
    stop: () => {
      cancelled = true;
      stopAllVoicePlayback();
      onEnd?.();
    },
  };
}

/**
 * Stop any active audio or speech synthesis in the window.
 */
export function stopAllVoicePlayback() {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch {
      // Ignore
    }
    activeAudio = null;
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
}
