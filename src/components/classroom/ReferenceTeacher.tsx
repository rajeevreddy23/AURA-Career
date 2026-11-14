'use client';
import { useEffect, useRef } from 'react';
import { getTeacher, TEACHERS } from '@/lib/ai/teachers';
import { getSpeechFrame } from '@/lib/ai/voice';

// Source rectangles intentionally use the untouched portrait, not regenerated faces.
export const CHARACTER_REGIONS = [
  { x: 0, width: 308, mouthX: 201, mouthY: 173 },
  { x: 308, width: 292, mouthX: 462, mouthY: 191 },
  { x: 600, width: 292, mouthX: 762, mouthY: 192 },
  { x: 892, width: 303, mouthX: 1050, mouthY: 159 },
  { x: 1195, width: 341, mouthX: 1329, mouthY: 163 },
];

export function TeacherPortrait({ teacherStyle, className = '' }: { teacherStyle: string; className?: string }) {
  const index = TEACHERS.indexOf(getTeacher(teacherStyle));
  const region = CHARACTER_REGIONS[index];
  return <div role="img" aria-label={`${getTeacher(teacherStyle).name}, reference character`} className={`overflow-hidden bg-[#f2eeeb] ${className}`} style={{ backgroundImage: 'url("/teachers/reference-portrait.png")', backgroundSize: `${1536 / region.width * 100}% auto`, backgroundPosition: `${region.x / (1536 - region.width) * 100}% top`, backgroundRepeat: 'no-repeat', aspectRatio: `${region.width} / 935` }} />;
}

export default function ReferenceTeacher({ teacherStyle, speaking, thinking }: { teacherStyle: string; speaking: boolean; thinking: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const source = new Image();
    let frame = 0, ready = false;
    const region = CHARACTER_REGIONS[TEACHERS.indexOf(getTeacher(teacherStyle))];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    source.onload = () => { ready = true; };
    source.src = '/teachers/reference-portrait.png';
    canvas.width = region.width * 2;
    // Waist-up framing makes expressions legible on a laptop classroom stage.
    canvas.height = 600 * 2;
    const paint = (time: number) => {
      if (ready) {
        ctx.setTransform(2, 0, 0, 2, 0, 0);
        ctx.fillStyle = '#f2eeeb'; ctx.fillRect(0, 0, region.width, 935);
        ctx.save();
        const sway = reduced ? 0 : Math.sin(time / (thinking ? 1400 : 2200)) * (speaking ? 0.008 : 0.003);
        ctx.translate(region.width / 2, 920); ctx.rotate(sway); ctx.translate(-region.width / 2, -920);
        ctx.drawImage(source, region.x, 0, region.width, 935, 0, 0, region.width, 935);
        // A small source-pixel deformation follows actual speech energy. This is
        // illustrated animation, not phoneme-accurate facial rigging.
        const speech = getSpeechFrame();
        if (!reduced && speaking && speech.active) {
          const x = region.mouthX - region.x - 16, y = region.mouthY - 5;
          const height = 12 + Math.min(1, speech.mouth) * 3;
          ctx.drawImage(source, region.mouthX - 16, y, 32, 12, x, y, 32, height);
        }
        ctx.restore();
      }
      frame = requestAnimationFrame(paint);
    };
    frame = requestAnimationFrame(paint);
    return () => { cancelAnimationFrame(frame); source.onload = null; };
  }, [teacherStyle, speaking, thinking]);
  return <canvas ref={ref} role="img" aria-label={`${getTeacher(teacherStyle).name}, animated reference character`} className="h-full max-w-full object-contain mx-auto" />;
}
