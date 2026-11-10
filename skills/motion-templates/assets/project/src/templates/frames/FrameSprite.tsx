import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, eased, K, keyed, stag} from '../_lib/anim';
import {Backdrop} from '../_lib/backdrop';
import {Stage} from '../_lib/stage';
import {BallCard} from './BallCard';

// One big frame of a bouncing-ball animation counts through its frames, then the camera pulls back
// to show every frame as a grid, which collapses into a row under a formula.

export type FrameSpriteProps = {
  durationInFrames: number;
  n: number; // frames in the ball loop
  counter: K; // frame index shown on the big card (fractional ok)
  gridAt: number; // big card -> grid
  spreadAt: number; // grid spacing opens
  rowAt: number; // grid -> row of `rowCount`
  rowCount: number;
  formulas: {at: number; text: string}[];
};

export const FrameSprite: React.FC<FrameSpriteProps> = (p) => {
  const f = useCurrentFrame();
  const idx = Math.floor(keyed(f, p.counter)) % p.n || p.n;
  const g = eased(f, [[p.gridAt, 0], [p.gridAt + 14, 1]]);
  const sp = eased(f, [[p.spreadAt, 0], [p.spreadAt + 12, 1]]);
  const row = eased(f, [[p.rowAt, 0], [p.rowAt + 16, 1]]);
  const fm = [...p.formulas].reverse().find((x) => f >= x.at);
  const fmA = fm ? stag(f, fm.at, 0, 10, 0) : 0;
  const lift = p.formulas.length > 1 ? eased(f, [[p.formulas[1].at, 0], [p.formulas[1].at + 10, 1]]) : 0;

  const cards: React.ReactNode[] = [];
  if (g > 0) {
    for (let i = 0; i < p.n; i++) {
      const c = i % 5;
      const r = Math.floor(i / 5);
      const cell = 52 + 8 * sp;
      const gx = 426 + (c - 2) * cell;
      const gy = 232 + (r - 2) * cell;
      const inRow = i < p.rowCount;
      const rx = 426 + (i - (p.rowCount - 1) / 2) * 59;
      const ry = 266 + 22 * lift;
      const x = inRow ? gx + (rx - gx) * row : gx;
      const y = inRow ? gy + (ry - gy) * row : gy + 40 * row;
      const s = (44 + 4 * sp) * (inRow ? 1 + 0.1 * row : 1);
      const a = inRow ? 1 : 1 - row;
      if (a <= 0) continue;
      cards.push(
        <div key={i} style={{position: 'absolute', left: x - s / 2, top: y - s / 2, opacity: a * Math.min(1, g * 1.5)}}>
          <BallCard idx={i + 1} n={p.n} size={s} />
        </div>,
      );
    }
  }
  const big = 243 * (1 + 0.06 * eased(f, [[p.gridAt - 16, 0], [p.gridAt, 1]]));
  return (
    <Stage texts={p.formulas.map((x) => x.text)}>
      <Backdrop seed={9} />
      {g < 1 && (
        <div style={{position: 'absolute', left: 426 - big / 2, top: 230 - big / 2, opacity: 1 - g, transform: `scale(${1 - 0.7 * g})`}}>
          <BallCard idx={idx} n={p.n} size={big} showNumber />
        </div>
      )}
      {cards}
      {fm && (
        <div style={{position: 'absolute', left: 0, width: 852, top: 168 + 24 * lift, textAlign: 'center', fontFamily: CJK, fontWeight: 900, fontSize: 38, color: '#4b4596', opacity: fmA, letterSpacing: 1}}>{fm.text}</div>
      )}
    </Stage>
  );
};
