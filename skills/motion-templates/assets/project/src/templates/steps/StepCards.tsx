import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, ramp, rng} from '../_lib/anim';
import {Stage} from '../_lib/stage';

// Step cards: HUD-style chamfered cards open one after another (each unfolds sideways from its
// centre with a short flicker), in reading order, over a dark "data tunnel" backdrop. Any
// N-step process: a pipeline, an approval flow, a course outline.

export type StepCardsProps = {
  durationInFrames: number;
  steps: string[];
  cols: number;
  start: number; // first card opens
  stagger: number; // frames between cards
  openDur: number;
  cell: {x0: number; y0: number; dx: number; dy: number; w: number; h: number}; // centre of the first card + pitch
  captions?: [number, string][];
};

const Tunnel: React.FC<{f: number}> = ({f}) => {
  const r = rng(11);
  const streaks = Array.from({length: 150}, () => ({a: r() * Math.PI * 2, d: r(), len: 4 + r() * 22, w: r() < 0.15 ? 2 : 1, o: 0.15 + r() * 0.5}));
  const dust = Array.from({length: 220}, () => [r() * 852, r() * 480, r()]);
  return (
    <svg width={852} height={480} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        <radialGradient id="sc-v" cx="0.5" cy="0.45" r="0.75">
          <stop offset="0" stopColor="#262626" />
          <stop offset="0.6" stopColor="#111" />
          <stop offset="1" stopColor="#050505" />
        </radialGradient>
      </defs>
      <rect width={852} height={480} fill="url(#sc-v)" />
      {streaks.map((s, i) => {
        // streaks drift outward from the vanishing point, axis-aligned like a grid tunnel
        const t = (s.d + f * 0.004) % 1;
        const dist = 30 + t * t * 520;
        const horiz = Math.abs(Math.cos(s.a)) > Math.abs(Math.sin(s.a));
        const x = 426 + Math.cos(s.a) * dist;
        const y = 228 + Math.sin(s.a) * dist * 0.6;
        const l = s.len * (0.4 + t) * 1.4;
        return horiz ? <rect key={i} x={x} y={y} width={l} height={s.w} fill={`rgba(255,255,255,${s.o * t})`} /> : <rect key={i} x={x} y={y} width={s.w} height={l} fill={`rgba(255,255,255,${s.o * t})`} />;
      })}
      {dust.map(([x, y, k], i) => (
        <rect key={i} x={x} y={y} width={1} height={1} fill={`rgba(255,255,255,${0.05 + k * 0.18})`} />
      ))}
      <rect x={425} y={0} width={1.4} height={480} fill="rgba(255,255,255,0.12)" />
      <rect x={0} y={238} width={852} height={1.4} fill="rgba(255,255,255,0.1)" />
    </svg>
  );
};

const Card: React.FC<{w: number; h: number; text: string; open: number; flick: number}> = ({w, h, text, open, flick}) => {
  const c = 7; // chamfer
  const path = `M ${c} 0 L ${w - c} 0 L ${w} ${c} L ${w} ${h} L ${c} ${h} L 0 ${h - c} L 0 0 Z`;
  const vis = Math.max(0.06, open);
  return (
    <div style={{position: 'absolute', left: -w / 2, top: -h / 2, width: w, height: h, clipPath: `inset(0 ${((1 - vis) * w) / 2}px)`, opacity: flick}}>
      <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <defs>
          <linearGradient id="sc-card" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4a4b4f" />
            <stop offset="0.5" stopColor="#1e1f22" />
            <stop offset="1" stopColor="#121214" />
          </linearGradient>
        </defs>
        <path d={path} fill="url(#sc-card)" stroke="rgba(255,255,255,0.8)" strokeWidth={1.2} />
        <path d={`M ${w - 12} 3 L ${w - 3} 3 L ${w - 3} 9`} fill="none" stroke="#fff" strokeWidth={1.6} />
        <path d={`M 3 ${h - 10} L 3 ${h - 3} L 10 ${h - 3}`} fill="none" stroke="#fff" strokeWidth={1.6} />
        <rect x={1} y={1} width={w - 2} height={h * 0.38} fill="rgba(255,255,255,0.06)" />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: CJK, fontWeight: 900, fontSize: 21, letterSpacing: 5, paddingLeft: 5, color: '#fff', whiteSpace: 'nowrap'}}>{text}</div>
    </div>
  );
};

export const StepCards: React.FC<StepCardsProps> = (p) => {
  const f = useCurrentFrame();
  const texts = [...p.steps, ...(p.captions ?? []).map((c) => c[1])];
  const cap = (p.captions ?? []).filter((c) => f >= c[0]).pop();
  return (
    <Stage bg="#0b0b0b" texts={texts}>
      <Tunnel f={f} />
      {p.steps.map((s, i) => {
        const t0 = p.start + i * p.stagger;
        if (f < t0) return null;
        const open = ramp(f, t0, t0 + p.openDur, [0.3, 0, 0.2, 1]);
        const k = f - t0;
        const flick = k < 5 ? [1, 0.25, 1, 0.5, 1][k] : 1;
        const x = p.cell.x0 + (i % p.cols) * p.cell.dx;
        const y = p.cell.y0 + Math.floor(i / p.cols) * p.cell.dy;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y}}>
            <Card w={p.cell.w} h={p.cell.h} text={s} open={open} flick={flick} />
          </div>
        );
      })}
      {cap && <div style={{position: 'absolute', left: 0, right: 0, top: 436, textAlign: 'center', fontFamily: CJK, fontWeight: 900, fontSize: 16, color: '#fff'}}>{cap[1]}</div>}
    </Stage>
  );
};
