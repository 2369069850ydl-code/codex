import React, {useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {AbsoluteFill, Freeze, useCurrentFrame} from 'remotion';
import {ensureFonts} from '../fonts';
import {CJK, ensureCjk} from '../Lidar/cjk';
import {keyed} from '../Lidar/util';
import type {MultiplyProps} from './types';

const W = 852, H = 480;

/** Log-space interpolation, so a pull-back from 4 to 400 feels even. */
const logKeyed = (f: number, keys: [number, number][]) => Math.exp(keyed(f, keys.map(([a, b]) => [a, Math.log(b)] as [number, number])));

const Rig: React.FC<{frame: number; p: MultiplyProps}> = ({frame, p}) => {
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const d = logKeyed(frame, p.camera.distance);
  const el = (keyed(frame, p.camera.elevation) * Math.PI) / 180;
  const az = (keyed(frame, p.camera.azimuth) * Math.PI) / 180;
  cam.position.set(d * Math.cos(el) * Math.sin(az), d * Math.sin(el), d * Math.cos(el) * Math.cos(az));
  cam.fov = p.camera.fov;
  cam.aspect = W / H;
  cam.near = Math.max(0.01, d * 0.02);
  cam.far = d * 40 + 50;
  cam.lookAt(0, 0.25, 0);
  cam.updateProjectionMatrix();
  return null;
};

/** One InstancedMesh per unit box; instance colour fades copies in from the background. */
const Grid: React.FC<{frame: number; p: MultiplyProps}> = ({frame, p}) => {
  const {n, pitch} = p.grid;
  const count = (2 * n + 1) ** 2;
  // All unit boxes merged into one geometry: per-box material values are baked as vertex colour
  // (colour) and a per-vertex 'aMetal' / 'aRough' pair, so the whole grid is a single InstancedMesh.
  const meshes = useMemo(() => {
    const parts = p.unit.map((b) => {
      const g = new THREE.BoxGeometry(...b.size).toNonIndexed();
      g.translate(...b.pos);
      const n = g.attributes.position.count;
      const col = new THREE.Color(b.color); // already in linear working space
      g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3).map((_, i) => [col.r, col.g, col.b][i % 3]), 3));
      g.setAttribute('aMR', new THREE.BufferAttribute(new Float32Array(n * 2).map((_, i) => (i % 2 ? b.rough : b.metal)), 2));
      return g;
    });
    const g = mergeGeometries(parts);
    g.setAttribute('aAlpha', new THREE.InstancedBufferAttribute(new Float32Array(count).fill(1), 1));
    const m = new THREE.MeshStandardMaterial({vertexColors: true, transparent: true});
    m.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nattribute float aAlpha;\nattribute vec2 aMR;\nvarying float vAlpha;\nvarying vec2 vMR;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvAlpha = aAlpha;\nvMR = aMR;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vAlpha;\nvarying vec2 vMR;')
        .replace('#include <metalnessmap_fragment>', 'float metalnessFactor = vMR.x;')
        .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = vMR.y;')
        .replace('#include <dithering_fragment>', '#include <dithering_fragment>\ngl_FragColor.a *= vAlpha;');
    };
    const im = new THREE.InstancedMesh(g, m, count);
    const mat = new THREE.Matrix4();
    let i = 0;
    for (let x = -n; x <= n; x++) for (let z = -n; z <= n; z++) im.setMatrixAt(i++, mat.makeTranslation(x * pitch, 0, z * pitch));
    im.instanceMatrix.needsUpdate = true;
    return [im];
  }, [p.unit, n, pitch, count]);
  const r = keyed(frame, p.reveal.radius);
  for (const im of meshes) {
    const a = im.geometry.getAttribute('aAlpha') as THREE.InstancedBufferAttribute;
    let i = 0;
    let visible = 0;
    for (let x = -n; x <= n; x++)
      for (let z = -n; z <= n; z++) {
        const dist = Math.hypot(x, z);
        const v = Math.min(1, Math.max(0, (r - dist) / p.reveal.soft + 1));
        a.setX(i++, x === 0 && z === 0 ? 1 : v * v);
        if (v > 0) visible++;
      }
    a.needsUpdate = true;
    im.count = count;
    void visible;
  }
  return (
    <>
      {meshes.map((m, i) => (
        <primitive key={i} object={m} />
      ))}
    </>
  );
};

export const Multiply: React.FC<MultiplyProps> = (p) => {
  ensureFonts();
  ensureCjk(p.captions.map((c) => c.text));
  const frame = useCurrentFrame();
  const cap = p.captions.find((c) => frame >= c.from && frame <= c.to);
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${p.palette.bgTop}, ${p.palette.bgBottom})`}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <defs>
          <radialGradient id="mg" cx="70%" cy="85%" r="70%">
            <stop offset="0" stopColor={p.palette.glow} stopOpacity={0.55} />
            <stop offset="1" stopColor={p.palette.glow} stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#mg)" />
        <g fill="none" stroke={p.palette.grid} strokeWidth={1}>
          {[-1, 0, 1, 2].map((i) => (
            <circle key={i} cx={W / 2 + i * 300 - 150} cy={H / 2} r={300} />
          ))}
          <line x1={0} y1={H / 2} x2={W} y2={H / 2} />
          <line x1={W / 2} y1={0} x2={W / 2} y2={H} />
        </g>
      </svg>
      <ThreeCanvas width={W} height={H} gl={{antialias: true, alpha: true, preserveDrawingBuffer: true}}>
        <Rig frame={frame} p={p} />
        {/* Lights only (no environment map): deterministic per frame, same look at any distance. */}
        <hemisphereLight args={['#fff4e0', '#2a2036', 1.1]} />
        <directionalLight position={[-3, 6, 4]} intensity={2.4} color="#fff1d8" />
        <directionalLight position={[4, 3, -2]} intensity={0.9} color="#b9a6ff" />
        <Grid frame={frame} p={p} />
      </ThreeCanvas>
      {cap ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 438, textAlign: 'center', fontFamily: CJK, fontWeight: 500, fontSize: 19, color: '#fff',
          textShadow: '0 0 2px #000, 0 1px 3px rgba(0,0,0,0.7)', letterSpacing: 1}}>
          {cap.text}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const MultiplyProbe: React.FC<MultiplyProps & {probe: number[]}> = ({probe, ...p}) => {
  const f = useCurrentFrame();
  return (
    <Freeze frame={probe[Math.min(f, probe.length - 1)]}>
      <Multiply {...p} />
    </Freeze>
  );
};
