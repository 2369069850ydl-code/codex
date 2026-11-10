import React from 'react';
import type {PhotoKind} from './types';

// Self-drawn "night drive" scenes: a vanishing point, light streaks, glows and bokeh, from a seed.
// No photographs are used, so the template ships with no third-party image rights.

const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

type Look = {sky: [string, string]; floor: [string, string]; lights: string[]; streaks: number; glow: number; walls?: string};
const LOOKS: Record<PhotoKind, Look> = {
  tunnel: {sky: ['#6b7077', '#9aa1a8'], floor: ['#4a4e54', '#2b2e33'], lights: ['#ffffff', '#dfe8ef'], streaks: 7, glow: 0.7, walls: '#7d838a'},
  road: {sky: ['#05070b', '#141a22'], floor: ['#1a1f26', '#0a0c10'], lights: ['#e9ff9a', '#9df2c4', '#ffd36b'], streaks: 5, glow: 0.9},
  amber: {sky: ['#1b120a', '#3a2610'], floor: ['#5a3b14', '#2a1a08'], lights: ['#ffb43a', '#ffd27a', '#ff8a1e'], streaks: 9, glow: 1},
  corridor: {sky: ['#9fc4e6', '#d9ecff'], floor: ['#7fa6c8', '#4f7698'], lights: ['#ffffff', '#e6f6ff'], streaks: 6, glow: 0.6, walls: '#8db3d6'},
  street: {sky: ['#120d1c', '#2a1830'], floor: ['#2a1e2a', '#120c14'], lights: ['#ff5c8a', '#ffd86b', '#8ab4ff'], streaks: 4, glow: 1},
  neon: {sky: ['#0d1020', '#20263d'], floor: ['#242437', '#101018'], lights: ['#ffe14d', '#ff6a3d', '#7ee0ff'], streaks: 4, glow: 1},
  highway: {sky: ['#14181d', '#2a3038'], floor: ['#3b4048', '#16181c'], lights: ['#ffffff', '#ffe6b0', '#ff6464'], streaks: 12, glow: 0.85},
  garage: {sky: ['#3d434b', '#646b74'], floor: ['#555b63', '#2f3338'], lights: ['#ffffff', '#c9f0d6'], streaks: 8, glow: 0.6, walls: '#59606a'},
};

export const NightPhoto: React.FC<{kind: PhotoKind; seed: number}> = ({kind, seed}) => {
  const r = rng(seed * 9973 + kind.length * 131);
  const L = LOOKS[kind];
  const id = `p${seed}${kind}`;
  const vx = 60 + r() * 40;
  const vy = 52 + r() * 18;
  const streaks = Array.from({length: L.streaks}, (_, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const ang = (side * (12 + r() * 70) * Math.PI) / 180;
    const len = 140 + r() * 60;
    const x2 = vx + Math.sin(ang) * len;
    const y2 = vy + Math.cos(ang) * len * (0.4 + r() * 0.8) * (r() < 0.35 ? -0.6 : 1);
    return {x2, y2, c: L.lights[Math.floor(r() * L.lights.length)], w: 0.8 + r() * 2.6, o: 0.45 + r() * 0.5};
  });
  const blobs = Array.from({length: 7}, () => ({
    x: r() * 160,
    y: 20 + r() * 90,
    s: 3 + r() * 12,
    c: L.lights[Math.floor(r() * L.lights.length)],
    o: 0.25 + r() * 0.6,
  }));
  return (
    <svg viewBox="0 0 160 160" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" style={{display: 'block'}}>
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={L.sky[0]} />
          <stop offset="1" stopColor={L.sky[1]} />
        </linearGradient>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={L.floor[0]} />
          <stop offset="1" stopColor={L.floor[1]} />
        </linearGradient>
        <filter id={`${id}b`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
        <filter id={`${id}g`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <rect width="160" height="160" fill={`url(#${id}s)`} />
      <polygon points={`0,160 160,160 160,${vy + 18} ${vx},${vy} 0,${vy + 22}`} fill={`url(#${id}f)`} />
      {L.walls ? (
        <>
          <polygon points={`0,0 ${vx - 6},${vy - 4} ${vx - 6},${vy + 4} 0,${vy + 40}`} fill={L.walls} opacity={0.55} />
          <polygon points={`160,0 ${vx + 6},${vy - 4} ${vx + 6},${vy + 4} 160,${vy + 44}`} fill={L.walls} opacity={0.45} />
        </>
      ) : null}
      <g filter={`url(#${id}g)`} opacity={L.glow}>
        {blobs.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r={b.s} fill={b.c} opacity={b.o} />
        ))}
      </g>
      <g filter={`url(#${id}b)`}>
        {streaks.map((s, i) => (
          <line key={i} x1={vx} y1={vy} x2={s.x2} y2={s.y2} stroke={s.c} strokeWidth={s.w * 2.4} strokeOpacity={s.o * 0.6} strokeLinecap="round" />
        ))}
      </g>
      {streaks.map((s, i) => (
        <line key={i} x1={vx + (s.x2 - vx) * 0.25} y1={vy + (s.y2 - vy) * 0.25} x2={s.x2} y2={s.y2} stroke={s.c} strokeWidth={s.w * 0.6} strokeOpacity={s.o} strokeLinecap="round" />
      ))}
      <circle cx={vx} cy={vy} r={6} fill={L.lights[0]} opacity={0.35} filter={`url(#${id}g)`} />
    </svg>
  );
};
