import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, eased, rng} from '../_lib/anim';
import {Stage} from '../_lib/stage';

// A pile of cards and sheets slides past the camera like papers blown across a desk; the pile
// clears to leave one document card centred, with its highlighted value box.

export type PaperScatterProps = {
  durationInFrames: number;
  title: string;
  value: string;
  clearAt: number; // frame the last sheets leave
  seed?: number;
  colors?: string[];
};

type Sheet = {x0: number; y0: number; r0: number; x1: number; y1: number; r1: number; w: number; h: number; c: string; lines: boolean; t0: number; t1: number; z: number};

export const PaperScatter: React.FC<PaperScatterProps> = (p) => {
  const f = useCurrentFrame();
  const r = rng(p.seed ?? 8);
  const cols = p.colors ?? ['#4b4596', '#ffffff', '#111111', '#ffffff', '#4b4596', '#ffffff'];
  const sheets: Sheet[] = Array.from({length: 22}, (_, i) => {
    const w = 170 + r() * 170;
    const h = w * (0.7 + r() * 0.5);
    const ang = -0.6 + r() * 1.2;
    const x0 = 100 + r() * 650;
    const y0 = 60 + r() * 380;
    const dist = 520 + r() * 300;
    return {
      x0,
      y0,
      r0: -50 + r() * 100,
      x1: x0 - Math.cos(ang) * dist,
      y1: y0 + 220 + Math.sin(ang) * dist * 0.5,
      r1: -90 + r() * 180,
      w,
      h,
      c: cols[i % cols.length],
      lines: r() < 0.25,
      t0: -10 + r() * (p.clearAt - 30),
      t1: 0,
      z: i,
    };
  }).map((s) => ({...s, t1: Math.min(p.clearAt, s.t0 + 22 + r() * 14)}));
  const card = eased(f, [[p.clearAt - 14, 0], [p.clearAt + 6, 1]]);
  return (
    <Stage bg="#f6f6f8" texts={[p.title, p.value]}>
      <div style={{position: 'absolute', left: 85, top: 58, width: 682, height: 364, background: '#efeff2', borderRadius: 6}} />
      {/* the document card */}
      <div style={{position: 'absolute', left: 330, top: 108 + (1 - card) * 30, width: 192, height: 240, transform: `scale(${1.05 - 0.05 * card}) rotate(${(1 - card) * 8}deg)`, background: '#fff', borderRadius: 8, boxShadow: '0 6px 18px rgba(30,30,70,0.12)', fontFamily: CJK, fontWeight: 900}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 120, height: 10, borderRadius: '8px 0 0 0', background: '#4b4596'}} />
        <div style={{position: 'absolute', left: 0, top: 22, width: 192, textAlign: 'center', color: '#4b4596', fontSize: 16.5, letterSpacing: 1.5, whiteSpace: 'nowrap'}}>{p.title}</div>
        <div style={{position: 'absolute', left: 13, top: 58, width: 166, height: 48, borderRadius: 3, background: '#7b72c9', color: '#fff', textAlign: 'center', fontSize: 24, lineHeight: '48px', letterSpacing: 3}}>{p.value}</div>
        <div style={{position: 'absolute', left: 9, top: 54, width: 174, height: 56, borderRadius: 4, border: '1.6px solid #4b4596', opacity: card}} />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{position: 'absolute', left: 24, top: 142 + i * 15, width: 144, height: 1.6, background: '#4b4596', opacity: 0.8}} />
        ))}
      </div>
      {/* sheets sliding away */}
      {sheets.map((s, i) => {
        const t = eased(f, [[s.t0, 0], [s.t1, 1]]);
        if (t >= 1) return null;
        const x = s.x0 + (s.x1 - s.x0) * t;
        const y = s.y0 + (s.y1 - s.y0) * t;
        const rot = s.r0 + (s.r1 - s.r0) * t;
        return (
          <div key={i} style={{position: 'absolute', left: x - s.w / 2, top: y - s.h / 2, width: s.w, height: s.h, transform: `rotate(${rot}deg)`, background: s.c, borderRadius: 12, boxShadow: '0 6px 16px rgba(20,20,50,0.18)', overflow: 'hidden'}}>
            {s.lines && Array.from({length: 18}, (_, k) => <div key={k} style={{position: 'absolute', left: 10, right: 10, top: 10 + k * 8, height: 1.4, background: '#cfcfd6'}} />)}
          </div>
        );
      })}
    </Stage>
  );
};
