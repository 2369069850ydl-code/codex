import React from 'react';
import {rng} from './anim';

/** Self-drawn hillside landscape (sky, far ridge, grassy hill with shrubs), fills w x h. */
export const Landscape: React.FC<{w: number; h: number; seed?: number}> = ({w, h, seed = 2}) => {
  const r = rng(seed);
  const shrubs = Array.from({length: 120}, () => {
    const x = r() * w;
    const y = h * (0.42 + r() * 0.55);
    return {x, y, s: 2 + r() * 6 * (y / h)};
  });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id="ls-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fb3d9" />
          <stop offset="1" stopColor="#dfe8ef" />
        </linearGradient>
        <linearGradient id="ls-hill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a69f6a" />
          <stop offset="0.5" stopColor="#c1a948" />
          <stop offset="1" stopColor="#6f9a3e" />
        </linearGradient>
        <linearGradient id="ls-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fae4a" />
          <stop offset="1" stopColor="#3f7a2d" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="url(#ls-sky)" />
      <path d={`M 0 ${h * 0.42} L ${w * 0.55} ${h * 0.3} L ${w * 0.75} ${h * 0.36} L ${w} ${h * 0.28} L ${w} ${h * 0.6} L 0 ${h * 0.6} Z`} fill="#5d7488" opacity={0.85} />
      <path d={`M 0 ${h * 0.12} C ${w * 0.2} ${h * 0.05} ${w * 0.35} ${h * 0.25} ${w * 0.55} ${h * 0.45} C ${w * 0.7} ${h * 0.55} ${w * 0.85} ${h * 0.5} ${w} ${h * 0.55} L ${w} ${h} L 0 ${h} Z`} fill="url(#ls-hill)" />
      <path d={`M 0 ${h * 0.78} C ${w * 0.3} ${h * 0.7} ${w * 0.6} ${h * 0.75} ${w} ${h * 0.7} L ${w} ${h} L 0 ${h} Z`} fill="url(#ls-front)" />
      {shrubs.map((s, i) => (
        <ellipse key={i} cx={s.x} cy={s.y} rx={s.s} ry={s.s * 0.7} fill="#2f3a22" opacity={0.75} />
      ))}
    </svg>
  );
};
