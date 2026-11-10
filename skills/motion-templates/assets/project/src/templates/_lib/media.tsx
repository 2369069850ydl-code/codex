import React from 'react';
import {Img} from 'remotion';
import {rng} from './anim';
import {Landscape} from './landscape';

// Media slot: your image (`src`) or a drawn placeholder. `pan` slowly drifts the picture (0..1 over the
// shot) so a still reads as footage.
export type MediaKind = 'landscape' | 'sparks' | 'night';
export const Media: React.FC<{w: number; h: number; kind?: MediaKind; src?: string; seed?: number; pan?: number; f?: number}> = ({w, h, kind = 'landscape', src, seed = 2, pan = 0, f = 0}) => {
  const sx = 1.12;
  const inner = src ? (
    <Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
  ) : kind === 'landscape' ? (
    <Landscape w={w * sx} h={h * sx} seed={seed} />
  ) : (
    <Sparks w={w * sx} h={h * sx} seed={seed} f={f} night={kind === 'night'} />
  );
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#111'}}>
      <div style={{position: 'absolute', left: -w * (sx - 1) * pan, top: -h * (sx - 1) * 0.5, width: w * sx, height: h * sx}}>{inner}</div>
    </div>
  );
};

/** Night scene with a glowing ember cloud and rising sparks (drawn). */
export const Sparks: React.FC<{w: number; h: number; seed?: number; f: number; night?: boolean}> = ({w, h, seed = 1, f, night}) => {
  const r = rng(seed);
  const n = 160;
  const parts = Array.from({length: n}, () => ({x: r(), y: r(), v: 0.4 + r() * 1.4, s: 0.6 + r() * 1.6, k: r()}));
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <radialGradient id={`sp-g${seed}`} cx={night ? '0.25' : '0.4'} cy={night ? '0.25' : '0.35'} r="0.5">
          <stop offset="0" stopColor="#ffb347" />
          <stop offset="0.35" stopColor="#e2541b" stopOpacity="0.85" />
          <stop offset="1" stopColor="#1a0602" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={w} height={h} fill="#070402" />
      <ellipse cx={w * (night ? 0.25 : 0.42)} cy={h * (night ? 0.28 : 0.36)} rx={w * 0.42} ry={h * 0.32} fill={`url(#sp-g${seed})`} />
      {parts.map((p, i) => {
        const y = ((p.y - (f * p.v) / 260) % 1 + 1) % 1;
        return <circle key={i} cx={p.x * w + Math.sin(f * 0.05 + i) * 3} cy={y * h * 0.75} r={p.s} fill={p.k > 0.5 ? '#ffd27a' : '#ff8a3d'} opacity={0.5 + 0.5 * p.k} />;
      })}
      {night && (
        <path d={`M 0 ${h * 0.55} L ${w * 0.1} ${h * 0.5} L ${w * 0.32} ${h * 0.47} L ${w * 0.34} ${h * 0.4} L ${w * 0.6} ${h * 0.4} L ${w * 0.62} ${h * 0.36} L ${w * 0.95} ${h * 0.33} L ${w} ${h * 0.36} L ${w} ${h} L 0 ${h} Z`} fill="#0b0705" />
      )}
      {night &&
        Array.from({length: 6}, (_, i) => <circle key={i} cx={w * (0.2 + i * 0.09)} cy={h * 0.72} r={3} fill="#ffb15a" opacity={0.9} />)}
      {!night && <path d={`M 0 ${h * 0.7} Q ${w * 0.4} ${h * 0.6} ${w} ${h * 0.68} L ${w} ${h} L 0 ${h} Z`} fill="#050302" />}
    </svg>
  );
};
