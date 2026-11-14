'use client';

import { useEffect, useRef } from 'react';
import { getTeacher, TEACHERS } from '@/lib/ai/teachers';
import { getSpeechFrame } from '@/lib/ai/voice';

export interface TeacherLandmarkData {
  x: number;
  width: number;
  mouthX: number;
  mouthY: number;
  mouthRelX: number;
  leftEyeX: number;
  rightEyeX: number;
  eyeY: number;
  neckY: number;
  skinTone: string;
  lipColor: string;
}

export const TEACHER_LANDMARKS: TeacherLandmarkData[] = [
  // 0: Pravalika (Professor)
  {
    x: 0,
    width: 308,
    mouthX: 201,
    mouthY: 173,
    mouthRelX: 201,
    leftEyeX: 189,
    rightEyeX: 215,
    eyeY: 115,
    neckY: 235,
    skinTone: '#fdc29a',
    lipColor: '#c04f41',
  },
  // 1: Navya (Friend)
  {
    x: 308,
    width: 292,
    mouthX: 462,
    mouthY: 191,
    mouthRelX: 154,
    leftEyeX: 132,
    rightEyeX: 172,
    eyeY: 155,
    neckY: 250,
    skinTone: '#fda375',
    lipColor: '#dc5d44',
  },
  // 2: Srihita (Simplifier)
  {
    x: 600,
    width: 292,
    mouthX: 762,
    mouthY: 192,
    mouthRelX: 162,
    leftEyeX: 145,
    rightEyeX: 175,
    eyeY: 135,
    neckY: 250,
    skinTone: '#feb88b',
    lipColor: '#c16b52',
  },
  // 3: Madhu (Coach)
  {
    x: 892,
    width: 303,
    mouthX: 1050,
    mouthY: 159,
    mouthRelX: 158,
    leftEyeX: 141,
    rightEyeX: 197,
    eyeY: 114,
    neckY: 225,
    skinTone: '#f99c6a',
    lipColor: '#ee7b57',
  },
  // 4: Rajeev (Expert)
  {
    x: 1195,
    width: 341,
    mouthX: 1329,
    mouthY: 163,
    mouthRelX: 134,
    leftEyeX: 94,
    rightEyeX: 168,
    eyeY: 105,
    neckY: 230,
    skinTone: '#f8ca9a',
    lipColor: '#f9b086',
  },
];

// Preserved for backwards compatibility with selector pages
export const CHARACTER_REGIONS = TEACHER_LANDMARKS.map(t => ({
  x: t.x,
  width: t.width,
  mouthX: t.mouthX,
  mouthY: t.mouthY,
}));

export function TeacherPortrait({ teacherStyle, className = '' }: { teacherStyle: string; className?: string }) {
  const teacher = getTeacher(teacherStyle);
  const index = Math.max(0, TEACHERS.indexOf(teacher));
  const region = TEACHER_LANDMARKS[index] || TEACHER_LANDMARKS[0];
  return (
    <div
      role="img"
      aria-label={`${teacher.name}, reference character`}
      className={`overflow-hidden bg-[#0a0f1d] ${className}`}
      style={{
        backgroundImage: 'url("/teachers/reference-portrait.png")',
        backgroundSize: `${(1536 / region.width) * 100}% auto`,
        backgroundPosition: `${(region.x / (1536 - region.width)) * 100}% top`,
        backgroundRepeat: 'no-repeat',
        aspectRatio: `${region.width} / 935`,
      }}
    />
  );
}

export interface ReferenceTeacherProps {
  teacherStyle: string;
  speaking: boolean;
  thinking: boolean;
  listening?: boolean;
  gesture?: string;
  className?: string;
}

/**
 * Realistic Animated Human Teacher Engine
 * Articulates the authentic teacher design with:
 * - Natural human respiration & body sway
 * - Independent decoupled head nodding (pitch), tilting (roll), and micro-turns (yaw)
 * - Biological blinking with natural duration, ease, and double-blinks
 * - Speech-reactive lip-sync visemes (mouth opening, vowel widening/rounding, inner oral shading, upper teeth hint)
 * - Studio atmosphere with radiant teacher color aura, audio pulse rings, and subtle stage vignette
 */
export default function ReferenceTeacher({
  teacherStyle,
  speaking,
  thinking,
  listening = false,
  gesture = 'idle',
  className = '',
}: ReferenceTeacherProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const teacher = getTeacher(teacherStyle);
  const teacherIndex = Math.max(0, TEACHERS.indexOf(teacher));
  const region = TEACHER_LANDMARKS[teacherIndex] || TEACHER_LANDMARKS[0];

  // Persistent kinematic state for smooth interpolation between frames
  const animState = useRef({
    headPitch: 0,
    headRoll: 0,
    headYaw: 0,
    mouthOpen: 0,
    mouthWidth: 0,
    nextBlinkTime: 0,
    blinkStartTime: 0,
    isBlinking: false,
    isDoubleBlink: false,
    blinkCount: 0,
  });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const source = new Image();
    let frame = 0;
    let ready = false;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    source.onload = () => {
      ready = true;
    };
    source.src = '/teachers/reference-portrait.png';

    // Retina 2x canvas scaling
    canvas.width = region.width * 2;
    // Waist-up framing (600px logical height)
    canvas.height = 600 * 2;

    const anim = animState.current;
    anim.nextBlinkTime = performance.now() + 2500 + Math.random() * 2000;

    const paint = (time: number) => {
      if (ready) {
        ctx.setTransform(2, 0, 0, 2, 0, 0);

        // 1. Studio Lighting Background (Deep space gradient)
        const bg = ctx.createLinearGradient(0, 0, 0, 600);
        bg.addColorStop(0, '#0a0f1d');
        bg.addColorStop(0.55, '#0f172a');
        bg.addColorStop(1, '#020617');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, region.width, 600);

        // 2. Ambient Radiant Studio Aura (Teacher signature color)
        const aura = ctx.createRadialGradient(
          region.width / 2,
          region.neckY,
          25,
          region.width / 2,
          region.neckY,
          region.width * 0.95
        );
        aura.addColorStop(0, `${teacher.color}38`);
        aura.addColorStop(0.55, `${teacher.color}10`);
        aura.addColorStop(1, 'transparent');
        ctx.fillStyle = aura;
        ctx.fillRect(0, 0, region.width, 600);

        // 3. Audio Energy & Speech Frame
        const speech = getSpeechFrame();
        const isTalking = !reduced && speaking && speech.active;

        // Animated soundwave rings when teacher is actively speaking
        if (isTalking) {
          for (let r = 0; r < 3; r++) {
            const wave = (time * 0.0016 + r * 0.33) % 1;
            const radius = 55 + wave * (region.width * 0.44);
            const alpha = Math.max(0, (1 - wave) * 0.38 * speech.mouth);
            ctx.beginPath();
            ctx.arc(region.width / 2, region.neckY, radius, 0, Math.PI * 2);
            ctx.strokeStyle = `${teacher.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
            ctx.lineWidth = 1.8;
            ctx.stroke();
          }
        }

        // 4. Biological Breathing Cycle
        const breath = reduced ? 0 : Math.sin(time / 1400);
        const breathY = breath * 2.2;
        const breathScaleX = 1 + breath * 0.004;

        // 5. Kinematic Target Calculation (Head & Neck articulation)
        let targetPitch = 0;
        let targetRoll = 0;
        let targetYaw = 0;

        if (thinking) {
          targetRoll = -0.055; // Contemplative head tilt
          targetPitch = -0.012; // Slight chin lift
          targetYaw = -2.0;
        } else if (listening) {
          targetRoll = 0.035; // Attentive tilt toward student
          targetPitch = 0.014 + (reduced ? 0 : Math.sin(time / 800) * 0.01); // Receptive affirmative nod
          targetYaw = 0.8;
        } else if (isTalking) {
          // Dynamic conversational nodding & phrasing tilt
          targetPitch = Math.sin(time / 270) * 0.016 * speech.mouth;
          targetRoll = Math.sin(time / 1500) * 0.024 + Math.sin(time / 420) * 0.01;
          targetYaw = Math.sin(time / 1300) * 1.8;
        } else if (!reduced) {
          // Natural resting idle sway
          targetRoll = Math.sin(time / 2600) * 0.012;
          targetPitch = Math.sin(time / 2100) * 0.004;
          targetYaw = Math.sin(time / 3200) * 1.0;
        }

        // Smooth exponential damping (fluid human movement, no snapping)
        const lerpFactor = 0.085;
        anim.headPitch += (targetPitch - anim.headPitch) * lerpFactor;
        anim.headRoll += (targetRoll - anim.headRoll) * lerpFactor;
        anim.headYaw += (targetYaw - anim.headYaw) * lerpFactor;

        // 6. Biological Eye Blinking Logic
        if (!reduced) {
          if (!anim.isBlinking && time >= anim.nextBlinkTime) {
            anim.isBlinking = true;
            anim.blinkStartTime = time;
            anim.blinkCount += 1;
            // Every 4th blink is a quick natural double-blink
            anim.isDoubleBlink = anim.blinkCount % 4 === 0;
          }
        }

        let blinkAmount = 0;
        if (anim.isBlinking) {
          const elapsed = time - anim.blinkStartTime;
          if (anim.isDoubleBlink) {
            // Double-blink sequence: blink -> gap -> blink
            if (elapsed < 110) {
              blinkAmount = Math.sin((elapsed / 110) * Math.PI);
            } else if (elapsed < 170) {
              blinkAmount = 0;
            } else if (elapsed < 270) {
              blinkAmount = Math.sin(((elapsed - 170) / 100) * Math.PI);
            } else {
              anim.isBlinking = false;
              anim.nextBlinkTime = time + 3200 + Math.random() * 2400;
            }
          } else {
            // Single natural blink (125ms total duration)
            if (elapsed < 125) {
              blinkAmount = Math.sin((elapsed / 125) * Math.PI);
            } else {
              anim.isBlinking = false;
              anim.nextBlinkTime = time + 3500 + Math.random() * 2500;
            }
          }
        }

        // 7. Layer A: Torso & Shoulders (Organic Respiration & Posture)
        ctx.save();
        ctx.translate(region.width / 2, 600);
        ctx.scale(breathScaleX, 1);
        ctx.translate(-region.width / 2, -600 + breathY);

        // Draw body from neck downwards
        ctx.drawImage(
          source,
          region.x,
          region.neckY,
          region.width,
          935 - region.neckY,
          0,
          region.neckY,
          region.width,
          935 - region.neckY
        );
        ctx.restore();

        // 8. Layer B: Articulated Head & Neck (Independent Human Kinematics)
        ctx.save();
        const pivotX = region.mouthRelX;
        const pivotY = region.neckY;

        ctx.translate(pivotX + anim.headYaw, pivotY + breathY * 0.65);
        ctx.rotate(anim.headRoll);
        ctx.translate(-pivotX, -pivotY);

        // Draw head, hair, and face with soft feather overlap onto neck
        ctx.drawImage(
          source,
          region.x,
          0,
          region.width,
          region.neckY + 14,
          0,
          0,
          region.width,
          region.neckY + 14
        );

        // 9. Biological Eye Blinking (Smooth realistic eyelids over pupils)
        if (blinkAmount > 0.03) {
          const eyeW = 18;
          const eyeH = 11;
          const eyes = [region.leftEyeX, region.rightEyeX];

          eyes.forEach((ex) => {
            const lidDrop = blinkAmount * eyeH;
            ctx.save();
            // Clip to anatomical eye contour
            ctx.beginPath();
            ctx.ellipse(ex, region.eyeY, eyeW / 2 + 1, eyeH / 2 + 1, 0, 0, Math.PI * 2);
            ctx.clip();

            // Smooth natural eyelid matching teacher skin tone
            ctx.fillStyle = region.skinTone;
            ctx.beginPath();
            ctx.ellipse(ex, region.eyeY - eyeH / 2 + lidDrop, eyeW / 2 + 2, lidDrop + 2, 0, 0, Math.PI * 2);
            ctx.fill();

            // Fine natural eyelash contour margin
            ctx.strokeStyle = '#221513';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.ellipse(ex, region.eyeY - eyeH / 2 + lidDrop, eyeW / 2, 2.2, 0, 0, Math.PI);
            ctx.stroke();
            ctx.restore();
          });
        }

        // 10. Speech Lip-Sync & Viseme Engine
        const targetMouthOpen = isTalking ? Math.min(1, Math.max(0, speech.mouth)) : 0;
        const targetMouthWidth = isTalking ? speech.rounded : 0;
        anim.mouthOpen += (targetMouthOpen - anim.mouthOpen) * 0.18;
        anim.mouthWidth += (targetMouthWidth - anim.mouthWidth) * 0.14;

        if (anim.mouthOpen > 0.04) {
          const mx = region.mouthRelX;
          const my = region.mouthY;
          const openPx = anim.mouthOpen * 10.5; // Up to 10.5px jaw drop
          const widthMod = (1 - anim.mouthWidth) * 3.5 - anim.mouthWidth * 2.0;
          const mw = 22 + widthMod;

          ctx.save();
          // Inner oral cavity depth shading
          ctx.beginPath();
          ctx.ellipse(mx, my + openPx * 0.38, mw / 2, openPx / 2 + 1, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#291016';
          ctx.fill();

          // Upper teeth edge visible on wide open vowel sounds
          if (openPx > 3.8) {
            ctx.beginPath();
            ctx.ellipse(mx, my + 1.2, mw / 2.6, 2.0, 0, 0, Math.PI);
            ctx.fillStyle = '#faf6f0';
            ctx.fill();
          }

          // Upper lip articulation with Cupid's bow contour
          ctx.beginPath();
          ctx.ellipse(mx, my - 0.8, mw / 2 + 1, 2.4, 0, Math.PI, 0);
          ctx.fillStyle = region.lipColor;
          ctx.fill();

          // Lower lip articulating dynamically down with the jaw
          ctx.beginPath();
          ctx.ellipse(mx, my + openPx + 1.2, mw / 2 + 1, 2.6, 0, 0, Math.PI);
          ctx.fillStyle = region.lipColor;
          ctx.fill();

          ctx.restore();
        }

        ctx.restore(); // Restore head transform

        // 11. Studio Stage Floor Vignette (Smooth gradient blend into stage card)
        const vignette = ctx.createLinearGradient(0, 520, 0, 600);
        vignette.addColorStop(0, 'transparent');
        vignette.addColorStop(1, '#020617');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 520, region.width, 80);
      }

      frame = requestAnimationFrame(paint);
    };

    frame = requestAnimationFrame(paint);
    return () => {
      cancelAnimationFrame(frame);
      source.onload = null;
    };
  }, [teacherStyle, speaking, thinking, listening, region, teacher]);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={`${teacher.name}, animated living human teacher`}
      className={`h-full max-w-full object-contain mx-auto transition-transform ${className}`}
    />
  );
}
