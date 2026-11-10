import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, eased, K, keyed, stag} from '../_lib/anim';
import {Backdrop} from '../_lib/backdrop';
import {Stage} from '../_lib/stage';
import {BallCard} from '../frames/BallCard';

// A phone that moves, tilts and flips around its vertical axis; the screen shows text or a
// bouncing-ball animation (optionally with pulldown stutter). Formula text can type in beside it.

type Screen = {from: number; lines?: string[]; ball?: {fps: number; source: number; n: number}};
export type PhoneDemoProps = {
  durationInFrames: number;
  x: K;
  y: K;
  scale: K;
  rot: K; // degrees in plane
  flip: K; // degrees around the vertical axis (90 = edge-on)
  screens: Screen[];
  formulas: {from: number; to?: number; text: string; x: number; y: number; size: number}[];
  row?: {text: string; out: number}; // leftover formula + row of five ball frames at the start
  trail?: {out: number}; // diagonal trail of ball frames under the phone at the start
};

const PW = 150;
const PH = 300;

export const PhoneDemo: React.FC<PhoneDemoProps> = (p) => {
  const f = useCurrentFrame();
  const x = eased(f, p.x);
  const y = eased(f, p.y);
  const s = eased(f, p.scale);
  const rot = eased(f, p.rot);
  const flip = keyed(f, p.flip);
  const scr = [...p.screens].reverse().find((q) => f >= q.from) ?? p.screens[0];
  const edge = Math.abs(Math.cos((flip * Math.PI) / 180));
  let content: React.ReactNode = null;
  if (scr.lines) {
    content = (
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: CJK, fontWeight: 900, color: '#4a4cf0', fontSize: 38, lineHeight: '50px', whiteSpace: 'nowrap'}}>
        {scr.lines.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    );
  } else if (scr.ball) {
    // a `source`-fps ball animation shown on a `fps` screen: each source frame holds for 3 or 2 screen frames
    const b = scr.ball;
    const t = (f - scr.from) / 30; // seconds
    const idx = Math.floor(t * b.source) % b.n;
    content = (
      <div style={{position: 'absolute', left: -30, top: 40}}>
        <BallCard idx={idx + 1} n={b.n} size={PW + 52} showNumber tint="#3131d3" />
      </div>
    );
  }
  const r0 = p.row ? 1 - stag(f, p.row.out, 0, 12, 0) : 0;
  return (
    <Stage texts={[...p.screens.flatMap((q) => q.lines ?? []), ...p.formulas.map((q) => q.text), p.row?.text ?? '']}>
      <Backdrop seed={14} />
      {p.row && r0 > 0 && (
        <div style={{opacity: r0}}>
          <div style={{position: 'absolute', left: 0, width: 852, top: 168, textAlign: 'center', fontFamily: CJK, fontWeight: 900, fontSize: 38, color: '#4b4596'}}>{p.row.text}</div>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{position: 'absolute', left: 426 + (i - 2) * 59 - 24, top: 264}}>
              <BallCard idx={i * 5 + 3} n={25} size={48} />
            </div>
          ))}
        </div>
      )}
      {p.trail &&
        (() => {
          const a = 1 - stag(f, p.trail.out, 0, 10, 0);
          return a > 0
            ? [0, 1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} style={{position: 'absolute', left: 205 + i * 38, top: 282 + i * 16 + (1 - a) * 60, opacity: a}}>
                  <BallCard idx={i * 3 + 2} n={25} size={34} />
                </div>
              ))
            : null;
        })()}
      <div style={{position: 'absolute', left: x - PW / 2, top: y - PH / 2, width: PW, height: PH, transform: `rotate(${rot}deg) scale(${s * Math.max(0.04, edge)}, ${s})`, opacity: 1 - r0}}>
        <div style={{position: 'absolute', left: 6 * Math.sign(Math.cos((flip * Math.PI) / 180)), top: 7, width: PW, height: PH, borderRadius: 22, background: '#ef6a2e'}} />
        <div style={{position: 'absolute', left: 0, top: 0, width: PW, height: PH, borderRadius: 22, background: edge < 0.3 ? '#ef6a2e' : '#111113', overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 4, top: 4, right: 4, bottom: 4, borderRadius: 18, background: scr.ball ? '#3131d3' : '#08080a', overflow: 'hidden'}}>{edge > 0.3 && content}</div>
          <div style={{position: 'absolute', left: PW / 2 - 26, top: 4, width: 52, height: 12, borderRadius: '0 0 8px 8px', background: '#111113'}} />
        </div>
      </div>
      {p.formulas.map((q, i) => {
        const a = stag(f, q.from, 0, 10, 0) * (q.to === undefined ? 1 : 1 - stag(f, q.to, 0, 8, 0));
        return a > 0 ? (
          <div key={i} style={{position: 'absolute', left: q.x + (1 - a) * 40, top: q.y, fontFamily: CJK, fontWeight: 900, fontSize: q.size, color: '#4b4596', whiteSpace: 'nowrap', opacity: a, filter: a < 1 ? `blur(${(1 - a) * 4}px)` : undefined}}>
            {q.text}
          </div>
        ) : null;
      })}
    </Stage>
  );
};
