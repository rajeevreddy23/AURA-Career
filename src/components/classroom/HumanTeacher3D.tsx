'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { TeacherProfile } from '@/lib/ai/teachers';
import { getSpeechFrame } from '@/lib/ai/voice';
import type { AvatarGesture, ProfessorState } from './AIProfessorAvatar';

interface Props { teacher: TeacherProfile; state: ProfessorState; gesture: AvatarGesture; compact?: boolean }

/** Procedural, articulated human character: no remote models or static portrait animation. */
export default function HumanTeacher3D({ teacher, state, gesture, compact }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const live = useRef({ state, gesture });
  live.current = { state, gesture };
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    if (!host.current) return;
    const container = host.current;
    setUnavailable(false);
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }); }
    catch { setUnavailable(true); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-label', `${teacher.name}, animated 3D human teacher wearing ${teacher.initial}`);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(compact ? 29 : 31, 1, 0.1, 30);
    camera.position.set(0, compact ? 3.25 : 2.4, compact ? 4.2 : 7.6);
    camera.lookAt(0, compact ? 3.15 : 2.15, 0);
    scene.add(new THREE.HemisphereLight('#fff2e4', '#17213e', 2.4));
    const key = new THREE.DirectionalLight('#fff1de', 3.4); key.position.set(-3, 5, 5); scene.add(key);
    const rim = new THREE.DirectionalLight(teacher.color, 2.3); rim.position.set(3, 3, -2); scene.add(rim);
    const fill = new THREE.DirectionalLight('#c9e9ff', 1); fill.position.set(3, 2, 4); scene.add(fill);

    const material = (color: string, roughness = 0.8) => new THREE.MeshStandardMaterial({ color, roughness });
    const skin = material(teacher.skin, 0.75), hair = material(teacher.hair, 0.65);
    const shirt = material(teacher.color), pants = material('#222d49'), white = material('#fff9ef');
    const pupil = material('#201914', 0.3), lip = material(teacher.gender === 'female' ? '#a14d50' : '#8c4a3d');
    const mouthInside = material('#3c1821'), gold = material('#e9bf74', 0.3);
    const character = new THREE.Group(); scene.add(character);
    const ellipsoid = (parent: THREE.Object3D, mat: THREE.Material, x: number, y: number, z: number, sx: number, sy: number, sz: number) => {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), mat);
      mesh.position.set(x, y, z); mesh.scale.set(sx, sy, sz); parent.add(mesh); return mesh;
    };
    const capsule = (parent: THREE.Object3D, mat: THREE.Material, x: number, y: number, z: number, radius: number, length: number) => {
      const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 8, 16), mat);
      mesh.position.set(x, y, z); parent.add(mesh); return mesh;
    };
    const female = teacher.gender === 'female';
    // Feet and relaxed standing posture.
    for (const side of [-1, 1]) {
      capsule(character, pants, side * 0.18, 0.85, 0, 0.15, 0.92);
      ellipsoid(character, white, side * 0.18, 0.16, 0.12, 0.19, 0.12, 0.33);
    }
    const torso = ellipsoid(character, shirt, 0, 1.98, 0, female ? 0.46 : 0.52, 0.64, 0.28);
    capsule(character, skin, 0, 2.63, 0, 0.13, 0.16);
    const head = new THREE.Group(); head.position.set(0, 3.08, 0); character.add(head);
    // Hair behind face, cheekbones, soft jaw, ears, and nose.
    ellipsoid(head, hair, 0, 0.11, -0.08, 0.43, 0.51, 0.34);
    ellipsoid(head, skin, 0, 0, 0.05, 0.37, 0.46, 0.32);
    ellipsoid(head, skin, 0, -0.29, 0.12, 0.27, 0.19, 0.25);
    for (const side of [-1, 1]) {
      ellipsoid(head, skin, side * 0.36, -0.02, 0.03, 0.065, 0.11, 0.065);
      if (female) ellipsoid(head, gold, side * 0.39, -0.12, 0.04, 0.025, 0.045, 0.025);
    }
    ellipsoid(head, skin, 0, -0.075, 0.354, 0.055, 0.092, 0.08);
    // Side swept fringe with individual locks, distinct hairstyles for each teacher.
    for (let i = 0; i < 7; i++) {
      const lock = ellipsoid(head, hair, -0.29 + i * 0.085, 0.31 + Math.sin(i * 0.45) * 0.06, 0.12, 0.105, 0.17, 0.2);
      lock.rotation.z = -0.35;
    }
    if (teacher.hairstyle === 'long' || teacher.hairstyle === 'bob') {
      for (const side of [-1, 1]) {
        const long = teacher.hairstyle === 'long';
        ellipsoid(head, hair, side * 0.35, long ? -0.24 : -0.07, -0.06, 0.105, long ? 0.55 : 0.38, 0.24);
      }
    } else if (teacher.hairstyle === 'ponytail') {
      ellipsoid(head, hair, 0.24, 0.15, -0.38, 0.19, 0.23, 0.2);
      const tail = ellipsoid(head, hair, 0.31, -0.22, -0.37, 0.16, 0.48, 0.17); tail.rotation.z = 0.2;
    } else if (teacher.hairstyle === 'swept') {
      const fringe = ellipsoid(head, hair, -0.08, 0.4, 0.02, 0.38, 0.15, 0.3); fringe.rotation.z = 0.2;
    }
    const eyes: THREE.Mesh[] = [], brows: THREE.Mesh[] = [];
    for (const side of [-1, 1]) {
      const eye = new THREE.Group(); eye.position.set(side * 0.135, 0.065, 0.316); head.add(eye);
      const sclera = ellipsoid(eye, white, 0, 0, 0, 0.083, 0.046, 0.038);
      eyes.push(sclera);
      const iris = ellipsoid(eye, material('#5e3d2b', 0.35), 0, 0, 0.032, 0.034, 0.036, 0.012); eyes.push(iris);
      const dot = ellipsoid(eye, pupil, 0, 0, 0.043, 0.016, 0.024, 0.007); eyes.push(dot);
      ellipsoid(eye, white, -0.009, 0.012, 0.049, 0.007, 0.009, 0.005);
      const brow = ellipsoid(head, hair, side * 0.135, 0.147, 0.317, 0.086, 0.015, 0.02);
      brow.rotation.z = side * -0.06; brows.push(brow);
    }
    // Separate lips, inner mouth and lower jaw respond to audio energy / word timing.
    const opening = ellipsoid(head, mouthInside, 0, -0.22, 0.356, 0.092, 0.008, 0.014);
    const upperLip = ellipsoid(head, lip, 0, -0.21, 0.367, 0.097, 0.012, 0.017);
    const lowerLip = ellipsoid(head, lip, 0, -0.232, 0.369, 0.09, 0.015, 0.018);
    const teeth = ellipsoid(head, white, 0, -0.223, 0.372, 0.07, 0.009, 0.005);
    // Shirt initial, actually mapped onto the front of the 3D torso.
    const labelCanvas = document.createElement('canvas'); labelCanvas.width = labelCanvas.height = 256;
    const ctx = labelCanvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 180px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(teacher.initial, 128, 139);
    const labelTexture = new THREE.CanvasTexture(labelCanvas); labelTexture.colorSpace = THREE.SRGBColorSpace;
    const label = new THREE.Mesh(new THREE.PlaneGeometry(0.39, 0.39), new THREE.MeshBasicMaterial({ map: labelTexture, transparent: true, depthWrite: false }));
    label.position.set(0, 2.14, 0.279); character.add(label);
    const arms: { shoulder: THREE.Group; elbow: THREE.Group }[] = [];
    for (const side of [-1, 1]) {
      const shoulder = new THREE.Group(); shoulder.position.set(side * (female ? 0.39 : 0.46), 2.38, 0); character.add(shoulder);
      capsule(shoulder, shirt, 0, -0.12, 0, 0.16, 0.15);
      capsule(shoulder, skin, 0, -0.34, 0, 0.1, 0.32);
      const elbow = new THREE.Group(); elbow.position.set(0, -0.58, 0); shoulder.add(elbow);
      capsule(elbow, skin, 0, -0.2, 0, 0.085, 0.31);
      ellipsoid(elbow, skin, 0, -0.46, 0, 0.105, 0.14, 0.058);
      for (let f = 0; f < 4; f++) capsule(elbow, skin, -0.063 + f * 0.04, -0.59, 0, 0.018, 0.1 + Math.sin(f) * 0.018);
      const thumb = capsule(elbow, skin, side * -0.1, -0.48, 0.02, 0.028, 0.075); thumb.rotation.z = side * -0.6;
      arms.push({ shoulder, elbow });
    }
    const platform = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 1, 0.06, 64), material('#18243b'));
    platform.position.y = 0.02; scene.add(platform);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.012, 8, 64), new THREE.MeshBasicMaterial({ color: teacher.color }));
    ring.rotation.x = Math.PI / 2; ring.position.y = 0.06; scene.add(ring);

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      renderer.setSize(Math.max(width, 1), Math.max(height, 1)); camera.aspect = width / Math.max(height, 1); camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize); observer.observe(container); resize();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const start = performance.now();
    const animate = () => {
      const t = (performance.now() - start) / 1000;
      const { state: mode, gesture: pose } = live.current;
      const speech = getSpeechFrame();
      const talking = speech.active && (mode === 'speaking' || mode === 'answering' || mode === 'teaching');
      const thinking = mode === 'thinking' || mode === 'preparing_lesson' || mode === 'processing_question';
      const listening = mode === 'listening';
      const smoothing = 0.1;
      const approach = (value: number, target: number) => THREE.MathUtils.lerp(value, target, smoothing);
      character.position.y = reduced ? 0 : Math.sin(t * 1.7) * 0.008;
      torso.scale.y = 0.64 + (reduced ? 0 : Math.sin(t * 1.7) * 0.005);
      head.rotation.y = approach(head.rotation.y, thinking ? -0.14 : talking && !reduced ? Math.sin(t * 1.3) * 0.07 : 0);
      head.rotation.z = approach(head.rotation.z, listening ? 0.1 : thinking ? -0.1 : talking && !reduced ? Math.sin(t * 1.6) * 0.028 : 0);
      head.rotation.x = approach(head.rotation.x, talking && !reduced ? Math.sin(t * 2.4) * 0.04 : listening ? 0.04 : 0);
      const blink = !reduced && t % 4.1 < 0.14 ? 0.09 : 1;
      eyes.forEach(eye => { eye.scale.y = approach(eye.scale.y, (eye === eyes[0] || eye === eyes[3] ? 0.046 : eye === eyes[1] || eye === eyes[4] ? 0.036 : 0.024) * blink); });
      brows.forEach((b, i) => { b.position.y = approach(b.position.y, thinking ? 0.16 : listening ? 0.175 : 0.147 + (talking ? speech.mouth * 0.025 : 0)); b.rotation.z = approach(b.rotation.z, (i ? 1 : -1) * (thinking ? 0.16 : -0.06)); });
      const amount = talking ? speech.mouth : 0;
      opening.scale.y = 0.008 + amount * 0.066; opening.scale.x = 0.092 - (talking ? speech.rounded * 0.025 : 0);
      lowerLip.position.y = -0.232 - amount * 0.055; lowerLip.scale.x = opening.scale.x;
      upperLip.scale.x = opening.scale.x + 0.005; teeth.visible = amount > 0.18;
      // Independent shoulder and elbow motion: board pointing, open palm, thoughtful chin pose.
      let leftZ = -0.08, leftX = 0, leftElbow = -0.12, rightZ = 0.08, rightX = 0, rightElbow = -0.12;
      if (thinking) { rightZ = -0.55; rightX = -0.35; rightElbow = -2.1; }
      else if (listening) { rightZ = -0.25; rightElbow = -0.55; }
      else if (talking && !reduced) {
        const beat = Math.sin(t * (pose === 'motivating' ? 3.5 : 1.9));
        leftZ = -0.65 + beat * 0.14; leftX = -0.35; leftElbow = -0.8 + beat * 0.15;
        rightZ = pose === 'welcoming' || pose === 'motivating' ? 0.75 : 0.28;
        rightX = -0.2; rightElbow = -0.65 - beat * 0.2;
      }
      arms[0].shoulder.rotation.z = approach(arms[0].shoulder.rotation.z, leftZ);
      arms[0].shoulder.rotation.x = approach(arms[0].shoulder.rotation.x, leftX);
      arms[0].elbow.rotation.x = approach(arms[0].elbow.rotation.x, leftElbow);
      arms[1].shoulder.rotation.z = approach(arms[1].shoulder.rotation.z, rightZ);
      arms[1].shoulder.rotation.x = approach(arms[1].shoulder.rotation.x, rightX);
      arms[1].elbow.rotation.x = approach(arms[1].elbow.rotation.x, rightElbow);
      if (!document.hidden) renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();
    const lost = (event: Event) => { event.preventDefault(); setUnavailable(true); cancelAnimationFrame(raf); };
    renderer.domElement.addEventListener('webglcontextlost', lost);
    return () => {
      cancelAnimationFrame(raf); observer.disconnect(); renderer.domElement.removeEventListener('webglcontextlost', lost);
      scene.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
          materials.forEach(m => m.dispose());
        }
      });
      labelTexture.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    };
  }, [teacher, compact]);

  return <div ref={host} className="relative h-full w-full" data-testid="human-teacher-3d">
    {unavailable && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-4">
      <span className="flex h-20 w-20 items-center justify-center rounded-full text-4xl font-bold" style={{ background: teacher.color }}>{teacher.initial}</span>
      <span className="text-xs text-slate-300">3D rendering is unavailable. {teacher.name}&apos;s voice and lessons are still available.</span>
    </div>}
  </div>;
}
