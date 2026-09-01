'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { cn } from '@/lib/utils';
import {
  Play, Pause, Volume2, VolumeX, SkipBack, SkipForward,
  Music, CloudRain, BookOpen, Coffee, TreePine, Waves, School, ChevronDown
} from 'lucide-react';

interface AudioPlayerProps {
  visible?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
}

const ambientSounds = [
  { id: 'none', label: 'None', icon: VolumeX },
  { id: 'classroom', label: 'Classroom', icon: School },
  { id: 'rain', label: 'Rain', icon: CloudRain },
  { id: 'library', label: 'Library', icon: BookOpen },
  { id: 'instrumental', label: 'Soft Music', icon: Music },
  { id: 'white-noise', label: 'White Noise', icon: Waves },
  { id: 'nature', label: 'Nature', icon: TreePine },
  { id: 'coffee-shop', label: 'Coffee Shop', icon: Coffee },
];

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  visible = true,
  onVisibilityChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [speed, setSpeed] = useState(1);
  const [selectedAmbient, setSelectedAmbient] = useState('none');
  const [ambientVolume, setAmbientVolume] = useState(30);
  const [showAmbient, setShowAmbient] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<AudioNode | null>(null);

  // Procedural Web Audio Ambient Sound Synthesizer
  const stopAmbientSound = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        if ('stop' in sourceNodeRef.current && typeof (sourceNodeRef.current as any).stop === 'function') {
          (sourceNodeRef.current as any).stop();
        }
        sourceNodeRef.current.disconnect();
      } catch {}
      sourceNodeRef.current = null;
    }
  }, []);

  const playAmbientSound = useCallback((ambientId: string, currentVolume: number) => {
    stopAmbientSound();
    if (ambientId === 'none') return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const gain = ctx.createGain();
      gain.gain.value = Math.max(0.001, (currentVolume / 100) * 0.15);
      gain.connect(ctx.destination);
      gainNodeRef.current = gain;

      if (ambientId === 'white-noise' || ambientId === 'rain' || ambientId === 'waves' || ambientId === 'nature' || ambientId === 'classroom' || ambientId === 'coffee-shop') {
        // Generate continuous pink/brown noise
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99765 * b0 + white * 0.0990460;
          b1 = 0.96300 * b1 + white * 0.2965164;
          b2 = 0.57000 * b2 + white * 1.0526913;
          data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.08;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        if (ambientId === 'rain') {
          filter.type = 'lowpass';
          filter.frequency.value = 900;
        } else if (ambientId === 'waves') {
          filter.type = 'bandpass';
          filter.frequency.value = 400;
        } else if (ambientId === 'classroom' || ambientId === 'coffee-shop') {
          filter.type = 'lowpass';
          filter.frequency.value = 650;
        } else {
          filter.type = 'lowpass';
          filter.frequency.value = 1400;
        }

        noise.connect(filter);
        filter.connect(gain);
        noise.start();
        sourceNodeRef.current = noise;
      } else if (ambientId === 'instrumental' || ambientId === 'library') {
        // Generate gentle warm harmonic drone
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(174.61, ctx.currentTime); // F3 calming frequency
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 500;

        osc.connect(filter);
        filter.connect(gain);
        osc.start();
        sourceNodeRef.current = osc;
      }
    } catch (e) {
      console.warn('Ambient sound synthesis unavailable:', e);
    }
  }, [stopAmbientSound]);

  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        Math.max(0.001, (ambientVolume / 100) * 0.15),
        audioContextRef.current.currentTime
      );
    }
  }, [ambientVolume]);

  useEffect(() => {
    return () => {
      stopAmbientSound();
      audioContextRef.current?.close();
    };
  }, [stopAmbientSound]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      window.speechSynthesis?.pause();
      stopAmbientSound();
    } else {
      window.speechSynthesis?.resume();
      if (selectedAmbient !== 'none') {
        playAmbientSound(selectedAmbient, ambientVolume);
      }
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, selectedAmbient, ambientVolume, playAmbientSound, stopAmbientSound]);

  const handleVolumeChange = useCallback((value: number[]) => {
    setVolume(value[0]);
  }, []);

  const handleSpeedChange = useCallback((value: number[]) => {
    setSpeed(value[0]);
  }, []);

  const handleAmbientSelect = useCallback((ambientId: string) => {
    setSelectedAmbient(ambientId);
    playAmbientSound(ambientId, ambientVolume);
    if (ambientId !== 'none') {
      setIsPlaying(true);
    }
  }, [ambientVolume, playAmbientSound]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 right-6 z-50">
      <div className="bg-card border border-border rounded-2xl shadow-2xl p-4 w-72">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">Voice Narration</span>
          <Button variant="ghost" size="sm" onClick={() => onVisibilityChange?.(false)}>
            <VolumeX className="h-4 w-4" />
          </Button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <Button variant="ghost" size="icon">
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            variant="primary"
            size="icon"
            onClick={togglePlay}
            className="h-10 w-10"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon">
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Volume */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1">
              <Volume2 className="h-3 w-3" />
              Volume
            </span>
            <span>{volume}%</span>
          </div>
          <Slider value={[volume]} onValueChange={handleVolumeChange} max={100} step={1} />
        </div>

        {/* Speed */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span>Speed</span>
            <span>{speed}x</span>
          </div>
          <Slider value={[speed]} onValueChange={handleSpeedChange} min={0.5} max={2} step={0.25} />
        </div>

        {/* Ambient Sounds */}
        <div>
          <button
            onClick={() => setShowAmbient(!showAmbient)}
            className="flex items-center justify-between w-full text-xs font-medium mb-2"
          >
            <span>Ambient Sounds</span>
            <ChevronDown className={cn('h-3 w-3 transition-transform', showAmbient && 'rotate-180')} />
          </button>
          {showAmbient && (
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {ambientSounds.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => handleAmbientSelect(sound.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-lg text-[10px] transition-colors',
                    selectedAmbient === sound.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent'
                  )}
                >
                  <sound.icon className="h-4 w-4" />
                  {sound.label}
                </button>
              ))}
            </div>
          )}
          {selectedAmbient !== 'none' && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span>Ambient Volume</span>
                <span>{ambientVolume}%</span>
              </div>
              <Slider value={[ambientVolume]} onValueChange={(v) => setAmbientVolume(v[0])} max={100} step={1} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
