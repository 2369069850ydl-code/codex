import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, ramp} from '../_lib/anim';
import {Stage} from '../_lib/stage';
import {BentoCaption, BentoWorld, Cam, INK, SPECTRUM, Tile} from './Bento';

// Range reveal inside a bento layout: the camera pushes into a card holding a full-band table (a thin
// rainbow sliver among many labels); labels fade, the sliver widens into a bar with a dark tail,
// brackets name the two ranges and ticks mark values under it; then the camera pulls away.

export type SpectrumBarProps = {
  durationInFrames: number;
  tiles: Tile[];
  cam: Cam[];
  card: {x: number; y: number; w: number; h: number}; // focus tile (world)
  table: {zh: string; en: string}[][]; // two rows of labels left/right of the sliver
  expandAt: number;
  ranges: {text: string; from: number; to: number; at: number}[]; // fractions of the bar
  ticks: {text: string; at: number; pos: number}[];
  tickAt: number;
  irFrom: number; // bar fraction where the dark tail starts
  captions?: [number, string][];
};

export const SpectrumBar: React.FC<SpectrumBarProps> = (p) => {
  const f = useCurrentFrame();
  const e = ramp(f, p.expandAt, p.expandAt + 22, [0.5, 0, 0.2, 1]);
  const lab = 1 - ramp(f, p.expandAt - 6, p.expandAt + 8);
  const c = p.card;
  // table box -> bar
  const tw = 326 + (390 - 326) * e;
  const th = 62 + (72 - 62) * e;
  const tx = c.x + c.w / 2 - tw / 2;
  const ty = c.y + c.h / 2 - th / 2;
  const sliverW = 6 + (tw - 6) * e;
  const sliverX = tx + tw * 0.48 * (1 - e);
  const visW = sliverW * (p.irFrom * e + (1 - e));
  const cap = (p.captions ?? []).filter((x) => f >= x[0]).pop();
  const texts = [...p.table.flat().map((t) => t.zh), ...p.ranges.map((r) => r.text), ...p.ticks.map((t) => t.text), ...(p.captions ?? []).map((x) => x[1])];
  return (
    <Stage bg={INK} texts={texts}>
      <BentoWorld f={f} tiles={p.tiles} cam={p.cam}>
        <div style={{position: 'absolute', left: tx, top: ty, width: tw, height: th, background: INK, opacity: Math.max(lab, 0)}}>
          {p.table.map((row, ri) => (
            <div key={ri} style={{position: 'absolute', left: 0, right: 0, top: 8 + ri * 24, display: 'flex', justifyContent: 'space-between', padding: '0 8px'}}>
              {row.map((t, i) => (
                <div key={i} style={{fontFamily: CJK, fontSize: 9.5, fontWeight: 500, color: '#fff', lineHeight: '11px', width: i === row.length / 2 ? 70 : undefined}}>
                  {t.zh}
                  <div style={{fontFamily: "'MontserratLocal'", fontWeight: 600, fontSize: 5.5, color: '#bbb'}}>{t.en}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{position: 'absolute', left: sliverX, top: ty, width: visW, height: th, background: SPECTRUM}} />
        <div style={{position: 'absolute', left: sliverX + visW, top: ty, width: sliverW - visW, height: th, background: 'linear-gradient(90deg, #2a0606, #050505 40%)'}} />
        {/* ranges */}
        {p.ranges.map((r, i) => {
          const a = ramp(f, r.at, r.at + 10);
          const x0 = tx + tw * r.from;
          const x1 = tx + tw * r.to;
          if (a <= 0) return null;
          return (
            <React.Fragment key={i}>
              <div style={{position: 'absolute', left: x0, top: ty - 16, width: (x1 - x0) * a, height: 10, borderTop: `1.5px solid ${INK}`, borderLeft: `1.5px solid ${INK}`, borderRight: a > 0.95 ? `1.5px solid ${INK}` : undefined}} />
              <div style={{position: 'absolute', left: (x0 + x1) / 2, top: ty - 40, transform: 'translateX(-50%)', fontFamily: CJK, fontWeight: 700, fontSize: 15, color: INK, opacity: a, whiteSpace: 'nowrap'}}>{r.text}</div>
            </React.Fragment>
          );
        })}
        {/* ticks */}
        {p.ticks.map((t, i) => {
          const a = ramp(f, t.at, t.at + 8);
          const x = tx + tw * t.pos;
          if (a <= 0) return null;
          return (
            <React.Fragment key={i}>
              <div style={{position: 'absolute', left: x - 0.75, top: ty + th, width: 1.5, height: 36 * a, background: INK}} />
              <div style={{position: 'absolute', left: x, top: ty + th + 40, transform: 'translateX(-50%)', fontFamily: CJK, fontWeight: 700, fontSize: 10.5, color: INK, opacity: a, whiteSpace: 'nowrap'}}>{t.text}</div>
            </React.Fragment>
          );
        })}
      </BentoWorld>
      <BentoCaption text={cap?.[1]} />
    </Stage>
  );
};
