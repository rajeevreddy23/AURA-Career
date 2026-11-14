'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { LessonSlide } from '@/hooks/useClassroomState';

export type RoomTheme = 'classroom' | 'studio' | 'library' | 'lab';
export type CameraShot = 'wide' | 'teacher' | 'board' | 'shoulder' | 'orbit';
export const ROOM_THEMES: Record<RoomTheme, { wall: string; floor: string; wood: string; light: string; accent: string }> = {
  classroom: { wall: '#d8dfe0', floor: '#a18b76', wood: '#866747', light: '#fff2d8', accent: '#347f75' },
  studio: { wall: '#182637', floor: '#25364b', wood: '#394959', light: '#d8e9ff', accent: '#5a89dd' },
  library: { wall: '#4c4038', floor: '#6b503c', wood: '#3c2a1e', light: '#ffe2b1', accent: '#bb9656' },
  lab: { wall: '#d3e1e8', floor: '#8098a5', wood: '#aab6c0', light: '#ecfaff', accent: '#398cbe' },
};

function Block({ position, size, color }: { position: [number, number, number]; size: [number, number, number]; color: string }) {
  return <mesh position={position} castShadow receiveShadow><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={0.8} /></mesh>;
}

export function CameraDirector({ shot, reducedMotion }: { shot: CameraShot; reducedMotion: boolean }) {
  const { camera, gl, invalidate } = useThree();
  const controls = useRef<OrbitControls>();
  const focus = useRef(new THREE.Vector3(0, 2, -2));
  const shots = useMemo(() => ({
    wide: { eye: new THREE.Vector3(0, 3.3, 8.5), look: new THREE.Vector3(0, 2, -2) },
    teacher: { eye: new THREE.Vector3(-1.8, 2.6, 4.1), look: new THREE.Vector3(-1.4, 1.6, -0.7) },
    board: { eye: new THREE.Vector3(0, 2.6, 3), look: new THREE.Vector3(0, 2.6, -3.32) },
    shoulder: { eye: new THREE.Vector3(-3.5, 2.3, 1.5), look: new THREE.Vector3(0, 2.5, -3.2) },
    orbit: { eye: new THREE.Vector3(0, 3.3, 8.5), look: new THREE.Vector3(0, 2, -2) },
  }), []);
  useEffect(() => {
    if (shot !== 'orbit') { invalidate(); return; }
    const orbit = new OrbitControls(camera, gl.domElement);
    orbit.target.copy(focus.current); orbit.minDistance = 2.5; orbit.maxDistance = 13;
    orbit.maxPolarAngle = Math.PI / 2 - 0.03; orbit.enablePan = false;
    const refresh = () => invalidate();
    orbit.addEventListener('change', refresh); controls.current = orbit;
    return () => { orbit.removeEventListener('change', refresh); orbit.dispose(); controls.current = undefined; };
  }, [shot, camera, gl, invalidate]);
  useFrame((_, delta) => {
    if (shot === 'orbit') return;
    const target = shots[shot];
    const blend = reducedMotion ? 1 : 1 - Math.exp(-delta * 3.5);
    camera.position.lerp(target.eye, blend); focus.current.lerp(target.look, blend); camera.lookAt(focus.current);
    if (camera.position.distanceTo(target.eye) > 0.002 || focus.current.distanceTo(target.look) > 0.002) invalidate();
  });
  return null;
}

function Whiteboard({ slide }: { slide: LessonSlide }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1536; canvas.height = 864;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = '#f8faf9'; ctx.fillRect(0, 0, 1536, 864);
    ctx.fillStyle = '#0f766e'; ctx.font = 'bold 24px sans-serif'; ctx.fillText('AURA LEARN  /  LESSON BOARD', 60, 65);
    const wrap = (text: string, y: number, font: string, color: string, lineHeight: number, maxLines: number) => {
      ctx.font = font; ctx.fillStyle = color;
      let line = '', lines = 0;
      for (const word of text.split(/\s+/)) {
        if (ctx.measureText(line + word).width > 1380 && line) {
          ctx.fillText(line, 60, y); y += lineHeight; line = ''; lines++;
          if (lines >= maxLines) return y;
        }
        line += word + ' ';
      }
      if (line) ctx.fillText(line, 60, y);
      return y + lineHeight;
    };
    let y = wrap(slide.title, 140, 'bold 44px sans-serif', '#15283b', 54, 2) + 20;
    y = wrap(slide.speech, y, '30px sans-serif', '#334155', 46, 4) + 32;
    for (const point of slide.keyPoints.slice(0, 3)) y = wrap('• ' + point, y, '26px sans-serif', '#0f766e', 42, 2) + 18;
    ctx.strokeStyle = '#cbd5e1'; ctx.beginPath(); ctx.moveTo(60, 790); ctx.lineTo(1476, 790); ctx.stroke();
    ctx.fillStyle = '#64748b'; ctx.font = '22px sans-serif'; ctx.fillText('Room preview • speech-synced board writing arrives in Phase 4', 60, 830);
    const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 4; return map;
  }, [slide]);
  useEffect(() => () => texture?.dispose(), [texture]);
  return <group position={[0, 2.55, -3.28]}>
    <Block position={[0, 0, -0.06]} size={[6.3, 3.6, 0.16]} color="#233345" />
    <mesh position={[0, 0, 0.04]}><planeGeometry args={[6.08, 3.42]} /><meshBasicMaterial map={texture} color={texture ? '#ffffff' : '#f8faf9'} /></mesh>
    <Block position={[0, -1.82, 0.08]} size={[6.4, 0.08, 0.3]} color="#546777" />
    {['#2563eb', '#d94646', '#14202e'].map((color, i) => <Block key={color} position={[1.8 + i * 0.18, -1.76, 0.14]} size={[0.1, 0.045, 0.2]} color={color} />)}
  </group>;
}

export default function Scene({ theme, shot, slide, reducedMotion, quality }: { theme: RoomTheme; shot: CameraShot; slide: LessonSlide; reducedMotion: boolean; quality: 'low' | 'medium' | 'high' }) {
  const palette = ROOM_THEMES[theme];
  return <>
    <color attach="background" args={[palette.wall]} />
    <hemisphereLight args={[palette.light, '#303746', 1.6]} />
    <directionalLight position={[-4, 7, 4]} color={palette.light} intensity={3} castShadow={quality !== 'low'} shadow-mapSize-width={quality === 'high' ? 2048 : 1024} shadow-mapSize-height={quality === 'high' ? 2048 : 1024} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} shadow-bias={-0.0005} />
    <pointLight position={[4, 4, 0]} color={palette.accent} intensity={6} />
    <Block position={[0, -0.12, 0]} size={[14, 0.24, 16]} color={palette.floor} />
    <Block position={[0, 2.5, -3.6]} size={[14, 5, 0.25]} color={palette.wall} />
    <Block position={[-6.5, 2.5, 0]} size={[0.2, 5, 8]} color={palette.wall} />
    <Block position={[6.5, 2.5, 0]} size={[0.2, 5, 8]} color={palette.wall} />
    {[0, 1].map(i => <group key={i} position={[-6.36, 2.8, -1 + i * 2.8]}>
      <Block position={[0, 0, 0]} size={[0.12, 2.1, 2.2]} color="#c2dfef" />
      <Block position={[0.09, 0, 0]} size={[0.1, 2.2, 0.06]} color="#edf3f2" />
      <Block position={[0.09, 0, 0]} size={[0.1, 0.06, 2.3]} color="#edf3f2" />
    </group>)}
    <Whiteboard slide={slide} />
    <group position={[3.5, 0, -1.4]}>
      <Block position={[0, 1, 0]} size={[2.3, 0.15, 1.2]} color={palette.wood} />
      {[-0.9, 0.9].flatMap(x => [-0.4, 0.4].map(z => <Block key={`${x}${z}`} position={[x, 0.45, z]} size={[0.09, 1, 0.09]} color="#36434d" />))}
      {[0, 1, 2].map(i => <Block key={i} position={[-0.4, 1.12 + i * 0.085, 0]} size={[0.65, 0.07, 0.5]} color={['#789499', '#bb6d5d', '#d3ad76'][i]} />)}
      <mesh position={[0.6, 1.45, 0]}><sphereGeometry args={[0.28, 24, 16]} /><meshStandardMaterial color="#6392b4" roughness={0.6} /></mesh>
      <Block position={[0.6, 1.17, 0]} size={[0.12, 0.18, 0.12]} color="#b49b6c" />
    </group>
    {[-2.5, 0, 2.5].flatMap(x => [3, 5.5].map(z => <group key={`${x}${z}`} position={[x, 0, z]}>
      <Block position={[0, 0.55, 0]} size={[0.85, 0.12, 0.85]} color={palette.wood} />
      <Block position={[0, 1, 0.35]} size={[0.85, 0.8, 0.12]} color={palette.wood} />
      {[-0.32, 0.32].flatMap(dx => [-0.3, 0.3].map(dz => <Block key={`${dx}${dz}`} position={[dx, 0.25, dz]} size={[0.06, 0.5, 0.06]} color="#39434b" />))}
    </group>))}
    {theme === 'library' && <group position={[5.7, 0, -2.7]}>
      {[0.5, 1.4, 2.3, 3.2].map(y => <group key={y}><Block position={[0, y, 0]} size={[1.1, 0.09, 0.55]} color={palette.wood} />{[0, 1, 2, 3, 4].map(i => <Block key={i} position={[-0.42 + i * 0.2, y + 0.3, 0]} size={[0.13, 0.55, 0.38]} color={['#bc7968', '#819581', '#bfad7c'][i % 3]} />)}</group>)}
    </group>}
    {theme === 'lab' && <group position={[3.7, 1.18, -1.1]}>{[0, 1].map(i => <mesh key={i} position={[i * 0.35, 0.12, 0]}><cylinderGeometry args={[0.12, 0.12, 0.28, 20]} /><meshStandardMaterial color={i ? '#54b89e' : '#599dd0'} transparent opacity={0.65} roughness={0.25} /></mesh>)}</group>}
    <CameraDirector shot={shot} reducedMotion={reducedMotion} />
  </>;
}
