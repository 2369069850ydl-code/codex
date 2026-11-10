import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, eased, stag} from '../_lib/anim';
import {Backdrop} from '../_lib/backdrop';
import {Stage} from '../_lib/stage';
import {BallCard} from './BallCard';

// A few source frames are spread over more display slots (pulldown): numbered dashed slots appear,
// the source frames drop in below, then copies fill the slots in groups (e.g. 3-2-3-2-2) and each
// group gets its repeat count.

export type FramePulldownProps = {
  durationInFrames: number;
  device: string; // label on the phone icon, e.g. "60 FPS"
  formula: string;
  formulaUp: number;
  slots: number;
  slotsIn: number;
  pattern: number[]; // repeats per source frame
  cardsIn: number;
  fillAt: number;
  fillStagger: number;
  labels: number[]; // frame each group's count appears
  highlights: {group: number; from: number; to: number}[];
};

const PITCH = 47.7;
const SLOT0 = 150 + 4;

export const FramePulldown: React.FC<FramePulldownProps> = (p) => {
  const f = useCurrentFrame();
  const up = eased(f, [[p.formulaUp, 0], [p.formulaUp + 14, 1]]);
  const n = p.pattern.length;
  const groupOf: number[] = [];
  p.pattern.forEach((c, g) => {
    for (let i = 0; i < c; i++) groupOf.push(g);
  });
  const starts = p.pattern.map((_, g) => p.pattern.slice(0, g).reduce((a, b) => a + b, 0));
  const hi = (g: number) => p.highlights.some((h) => h.group === g && f >= h.from && f < h.to);

  return (
    <Stage texts={[p.formula, p.device]}>
      <Backdrop seed={12} />
      {/* phone icon */}
      <div style={{position: 'absolute', left: 178, top: 163 - 45 * up, width: 78, height: 122, transform: 'rotate(-12deg)', borderRadius: 12, background: '#111', border: '3px solid #e8622c', boxSizing: 'border-box'}}>
        <div style={{position: 'absolute', left: 0, top: 30, width: '100%', textAlign: 'center', fontFamily: CJK, fontWeight: 900, fontSize: 15, lineHeight: '17px', color: '#4b6bff', whiteSpace: 'pre'}}>{p.device.replace(' ', '\n')}</div>
      </div>
      <div style={{position: 'absolute', left: 316, top: 224 - 47 * up, fontFamily: CJK, fontWeight: 900, fontSize: 32, color: '#4b4596', whiteSpace: 'nowrap'}}>{p.formula}</div>
      {/* slots */}
      {Array.from({length: p.slots}, (_, i) => {
        const a = stag(f, p.slotsIn, 2, 8, i);
        return (
          <div key={i} style={{position: 'absolute', left: SLOT0 + i * PITCH, top: 282, width: 38, height: 38, border: '1.6px dashed #444', borderRadius: 3, boxSizing: 'border-box', opacity: a, fontFamily: 'MontserratLocal', fontWeight: 700, fontSize: 15.5, lineHeight: '35px', textAlign: 'center', color: '#222'}}>
            {String(i + 1).padStart(2, '0')}
          </div>
        );
      })}
      {/* source frames and their copies */}
      {Array.from({length: p.slots}, (_, s) => {
        const g = groupOf[s];
        if (g === undefined) return null;
        const first = s === starts[g];
        const drop = stag(f, p.cardsIn, 7, 14, g);
        const fill = eased(f, [[p.fillAt + s * p.fillStagger, 0], [p.fillAt + s * p.fillStagger + 12, 1]]);
        if (!first && fill <= 0) return null;
        const hx = 426 + (g - (n - 1) / 2) * 58 - 21;
        const hy = 368 - 21 + (1 - drop) * 90;
        const sx = SLOT0 - 2 + s * PITCH;
        const sy = 280;
        const x = hx + (sx - hx) * fill;
        const y = hy + (sy - hy) * fill;
        return (
          <div key={s} style={{position: 'absolute', left: x, top: y, opacity: first ? Math.min(1, drop * 2) : Math.min(1, fill * 3)}}>
            <BallCard idx={g * 5 + 3} n={25} size={42} tint={hi(g) ? '#27b6dc' : undefined} />
          </div>
        );
      })}
      {/* group counts */}
      {p.labels.map((at, g) => {
        const a = stag(f, at, 0, 8, 0);
        if (a <= 0) return null;
        const cx = SLOT0 + 19 + (starts[g] + (p.pattern[g] - 1) / 2) * PITCH;
        return (
          <div key={g} style={{position: 'absolute', left: cx - 15, top: 330 + (1 - a) * 8, width: 30, textAlign: 'center', fontFamily: 'MontserratLocal', fontWeight: 700, fontSize: hi(g) ? 30 : 23, color: hi(g) ? '#27b6dc' : '#4b4596', opacity: a}}>
            {p.pattern[g]}
          </div>
        );
      })}
    </Stage>
  );
};
