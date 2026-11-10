import React from 'react';
import {Img, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {eased, K, keyed, rng} from '../_lib/anim';
import {Stage} from '../_lib/stage';

// A dark media-player window (video, fast-forward chevrons, progress bar, three buttons) that
// morphs between landscape and portrait. Without a video file it shows a self-drawn light-streak
// tunnel so the template renders on its own.

export type PlayerProps = {
  durationInFrames: number;
  portrait: K; // 0 landscape .. 1 portrait
  intro: number;
  src?: string; // file in public/, optional
  video?: boolean;
  speed?: number; // streak speed
};

const LAND = {w: 489, h: 301};
const PORT = {w: 181, h: 303};
const PURPLE = '#5a4fc4';

const Streaks: React.FC<{f: number; w: number; h: number; speed: number}> = ({f, w, h, speed}) => {
  const r = rng(21);
  const lines = Array.from({length: 46}, () => ({a: r() * Math.PI * 2, o: r(), hue: r() < 0.5 ? 35 + r() * 20 : 190 + r() * 40, l: 0.15 + r() * 0.35, wid: 1 + r() * 3}));
  const cx = w / 2;
  const cy = h * 0.52;
  const R = Math.hypot(w, h) * 0.6;
  return (
    <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        <radialGradient id="pl-bg" cx="0.5" cy="0.52" r="0.7">
          <stop offset="0" stopColor="#2a2f45" />
          <stop offset="1" stopColor="#07080d" />
        </radialGradient>
      </defs>
      <rect width={w} height={h} fill="url(#pl-bg)" />
      {lines.map((L, i) => {
        const t = (L.o + (f * speed) / 60) % 1;
        const r0 = R * t * t;
        const r1 = R * Math.min(1, t * t + L.l * t);
        return <line key={i} x1={cx + Math.cos(L.a) * r0} y1={cy + Math.sin(L.a) * r0 * 0.7} x2={cx + Math.cos(L.a) * r1} y2={cy + Math.sin(L.a) * r1 * 0.7} stroke={`hsl(${L.hue},90%,${60 + 20 * t}%)`} strokeWidth={L.wid * (0.4 + t)} opacity={0.3 + 0.7 * t} strokeLinecap="round" />;
      })}
    </svg>
  );
};

export const Player: React.FC<PlayerProps> = (p) => {
  const f = useCurrentFrame();
  const t = keyed(f, p.portrait);
  const e = t * t * (3 - 2 * t);
  const w = LAND.w + (PORT.w - LAND.w) * e;
  const h = LAND.h + (PORT.h - LAND.h) * e;
  const x = 426 - w / 2;
  const y = 95;
  const it = eased(f, [[p.intro, 0], [p.intro + 16, 1]]);
  const vid = {x: 16, y: 24, w: w - 32, h: h - 112};
  const r = rng(4);
  const squares = Array.from({length: 18}, () => ({x: 90 + r() * 670, y: 70 + r() * 340, s: 8 + r() * 16}));
  return (
    <Stage>
      <div style={{position: 'absolute', left: 85, top: 58, width: 682, height: 364, background: '#ececee', borderRadius: 6}} />
      {squares.map((q, i) => (
        <div key={i} style={{position: 'absolute', left: q.x, top: q.y, width: q.s, height: q.s, background: '#e2e2e5'}} />
      ))}
      {/* intro bars */}
      {it < 1 &&
        [0, 1, 2, 3].map((i) => (
          <div key={i} style={{position: 'absolute', left: 120 + i * 120 + it * 400, top: 330 - it * 300, width: 16, height: 220, background: i === 1 ? '#c0392b' : PURPLE, transform: 'rotate(40deg)', opacity: 1 - it}} />
        ))}
      <div style={{position: 'absolute', left: x, top: y + (1 - it) * 30, width: w, height: h, borderRadius: 8, background: '#2b2b3a', boxShadow: '0 8px 22px rgba(0,0,0,0.25)', overflow: 'hidden', opacity: Math.min(1, it * 1.5)}}>
        <div style={{position: 'absolute', left: 9, top: 7, width: 9, height: 9, borderRadius: 5, background: PURPLE}} />
        <div style={{position: 'absolute', left: vid.x, top: vid.y, width: vid.w, height: vid.h, overflow: 'hidden', background: '#000'}}>
          {p.src ? (
            p.video ? <OffthreadVideo src={staticFile(p.src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <Img src={staticFile(p.src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          ) : (
            <Streaks f={f} w={vid.w} h={vid.h} speed={p.speed ?? 1.2} />
          )}
          <svg width={90} height={50} viewBox="0 0 90 50" style={{position: 'absolute', left: vid.w / 2 - 45, top: vid.h / 2 - 25}}>
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M ${8 + i * 24} 4 L ${30 + i * 24} 25 L ${8 + i * 24} 46 L ${18 + i * 24} 46 L ${40 + i * 24} 25 L ${18 + i * 24} 4 Z`} fill={PURPLE} opacity={0.85} />
            ))}
          </svg>
        </div>
        <div style={{position: 'absolute', left: vid.x, top: h - 76, width: vid.w, height: 3, background: '#4a4a5c', borderRadius: 2}}>
          <div style={{width: `${((f % 150) / 150) * 100}%`, height: 3, background: '#d9d9e6', borderRadius: 2}} />
        </div>
        {[-1, 0, 1].map((i) => (
          <div key={i} style={{position: 'absolute', left: w / 2 - 11 + i * 36, top: h - 50, width: 22, height: 22, borderRadius: 11, border: `2px solid ${PURPLE}`, boxSizing: 'border-box', background: i === 0 ? PURPLE : 'transparent'}} />
        ))}
      </div>
    </Stage>
  );
};
