import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, eased, stag} from '../_lib/anim';
import {Backdrop} from '../_lib/backdrop';
import {Stage} from '../_lib/stage';
import {Toy} from '../signal/Signal';

// A dark app window plays a black-and-white loop; dated speech tags pop in beside it, then the
// colour version wipes in from the top.

export type EraTagsProps = {
  durationInFrames: number;
  windowIn: number;
  tags: {year: string; label: string; at: number; color: string; side: 'left' | 'right'}[];
  colorAt: number;
  intro?: {text: string; out: number}; // a black capsule that hands over to the window
};

const W = {x: 286, y: 88, w: 280, h: 300};

export const EraTags: React.FC<EraTagsProps> = (p) => {
  const f = useCurrentFrame();
  const win = eased(f, [[p.windowIn, 0], [p.windowIn + 12, 1]]);
  const col = eased(f, [[p.colorAt, 0], [p.colorAt + 18, 1]]);
  const sc = W.w / 203;
  return (
    <Stage texts={[...p.tags.flatMap((t) => [t.year, t.label]), p.intro?.text ?? '']}>
      <Backdrop seed={6} />
      {p.intro && f < p.intro.out + 8 && (
        <div style={{position: 'absolute', left: 280, top: 213, width: 293, height: 42, borderRadius: 9, background: '#1f1f23', color: '#fff', fontFamily: CJK, fontWeight: 900, fontSize: 18, lineHeight: '42px', textAlign: 'center', opacity: 1 - stag(f, p.intro.out, 0, 8, 0)}}>{p.intro.text}</div>
      )}
      <div style={{position: 'absolute', left: W.x, top: W.y, width: W.w, height: W.h, borderRadius: 8, background: '#1e1e21', overflow: 'hidden', opacity: win, transform: `scale(${0.9 + 0.1 * win})`}}>
        {['#ff4f6b', '#f5b52c', '#33c25a'].map((c, i) => (
          <div key={i} style={{position: 'absolute', left: 9 + i * 11, top: 8, width: 7, height: 7, borderRadius: 4, background: c, zIndex: 2}} />
        ))}
        <div style={{position: 'absolute', left: 0, top: 18, width: W.w, height: W.h - 18}}>
          <div style={{position: 'absolute', left: 0, top: 0, transform: `scale(${sc}) translateY(-8px)`, transformOrigin: '0 0'}}>
            <Toy f={f} mono />
          </div>
          <div style={{position: 'absolute', left: 0, top: 0, width: W.w, height: (W.h - 18) * col, overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: 0, top: 0, transform: `scale(${sc}) translateY(-8px)`, transformOrigin: '0 0', background: '#111114'}}>
              <Toy f={f} />
            </div>
          </div>
        </div>
      </div>
      {p.tags.map((t, i) => {
        const a = stag(f, t.at, 0, 12, 0);
        if (a <= 0) return null;
        const left = t.side === 'right';
        return (
          <div key={i} style={{position: 'absolute', left: left ? 540 : 168, top: left ? 128 : 228, transform: `translate(${(1 - a) * (left ? 30 : -60)}px, ${(1 - a) * 20}px) rotate(${(1 - a) * (left ? 10 : -25)}deg)`, opacity: Math.min(1, a * 2)}}>
            <svg width={150} height={84} style={{position: 'absolute'}}>
              <path d={`M 5 0 L 145 0 Q 150 0 150 5 L 150 61 Q 150 66 145 66 L 32 66 L 18 80 L 18 66 L 5 66 Q 0 66 0 61 L 0 5 Q 0 0 5 0 Z`} fill={t.color} stroke="#fff" strokeWidth={2} />
            </svg>
            <div style={{position: 'absolute', left: 13, top: 7, color: '#fff', fontFamily: CJK, fontWeight: 900, fontSize: 15, whiteSpace: 'nowrap'}}>{t.year}</div>
            <div style={{position: 'absolute', left: 13, top: 25, color: '#fff', fontFamily: CJK, fontWeight: 900, fontSize: 27, whiteSpace: 'nowrap'}}>{t.label}</div>
          </div>
        );
      })}
    </Stage>
  );
};
