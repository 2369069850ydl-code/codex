import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, eased, K, keyed, stag} from '../_lib/anim';
import {N, NeonFrame} from '../_lib/neon';
import {Stage} from '../_lib/stage';

// Gradient bar chart over a dark cell grid, with a brightness scale on the left (marker sliding
// on it) and a caption band across the bars. Later a dotted line zig-zags through the bars and
// one character of the caption swaps with a glow (e.g. "static" -> "dynamic").

export type BarMetaProps = {
  durationInFrames: number;
  label: string; // left-side name
  hi: string;
  lo: string;
  bars: [number, number][]; // [top, bottom] in design px
  barsIn: {start: number; stagger: number};
  caption: string;
  swap: {index: number; to: string; at: number};
  bandFade: [number, number];
  line: [number, number][];
  lineDraw: [number, number];
  marker: K;
};

const X0 = 308;
const BW = 65;
const AREA = {l: 276, t: 95, r: 790, b: 413};

const partial = (pts: [number, number][], t: number) => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  let left = seg.reduce((a, b) => a + b, 0) * t;
  const out: [number, number][] = [pts[0]];
  for (let i = 0; i < seg.length && left > 0; i++) {
    const k = Math.min(1, left / seg[i]);
    out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]);
    left -= seg[i];
  }
  return out;
};

export const BarMeta: React.FC<BarMetaProps> = (p) => {
  const f = useCurrentFrame();
  const band = 1 - eased(f, [[p.bandFade[0], 0], [p.bandFade[1], 1]]);
  const ld = eased(f, [[p.lineDraw[0], 0], [p.lineDraw[1], 1]]);
  const sw = stag(f, p.swap.at, 0, 8, 0);
  const chars = [...p.caption];
  const cells: React.ReactNode[] = [];
  for (let x = AREA.l + 8; x < AREA.r - 20; x += 25) for (let y = AREA.t + 4; y < AREA.b - 20; y += 25) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={21} height={21} rx={3} fill="#10131c" />);
  return (
    <Stage bg={N.bg} texts={[p.label, p.hi, p.lo, p.caption, p.swap.to]}>
      <NeonFrame t={1} x={50} y={25} w={752} h={430} />
      <svg width={852} height={480} style={{position: 'absolute', left: 0, top: 0}}>
        {cells}
        <path d={`M ${AREA.l} ${AREA.t} L ${AREA.l} ${AREA.b} L ${AREA.r} ${AREA.b}`} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={1.5} />
        <defs>
          <linearGradient id="bm-scale" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#000000" />
          </linearGradient>
        </defs>
        <rect x={236} y={95} width={12} height={313} fill="url(#bm-scale)" />
        <path d={`M 216 ${keyed(f, p.marker) - 6} L 226 ${keyed(f, p.marker)} L 216 ${keyed(f, p.marker) + 6} Z`} fill="#ffffff" />
      </svg>
      {[p.hi, p.lo].map((t, i) => (
        <div key={i} style={{position: 'absolute', left: 60, width: 110, top: i ? 390 : 90, textAlign: 'center', fontFamily: CJK, fontWeight: 700, fontSize: 17, letterSpacing: 5, color: N.text}}>
          [ {t} ]
        </div>
      ))}
      <div style={{position: 'absolute', left: 60, width: 150, top: 230, textAlign: 'center', fontFamily: CJK, fontWeight: 900, fontSize: 26, color: N.text}}>{p.label}</div>
      {p.bars.map(([top, bot], i) => {
        const t = stag(f, p.barsIn.start, p.barsIn.stagger, 10, i);
        if (t <= 0) return null;
        const mid = (top + bot) / 2;
        const h = (bot - top) * t;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: X0 + i * BW + 1,
              top: mid - h / 2,
              width: BW - 2,
              height: h,
              borderRadius: 3,
              opacity: t * 0.88,
              backgroundImage: 'linear-gradient(180deg, #8aa4c0 0%, #50709c 30%, #24238a 58%, #14154a 100%)',
              boxShadow: '0 0 0 1px rgba(150,160,230,0.25)',
            }}
          />
        );
      })}
      <div style={{position: 'absolute', left: X0 - 20, top: 193, width: BW * 7 + 40, height: 128, background: `rgba(8,10,18,${0.5 * band})`, border: `1px solid rgba(255,255,255,${0.2 * band})`, borderRadius: 3}} />
      <div style={{position: 'absolute', left: X0 - 20, top: 193, width: BW * 7 + 40, height: 128, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: CJK, fontWeight: 900, fontSize: 32, letterSpacing: 15, color: N.text, whiteSpace: 'pre'}}>
        <span>[ </span>
        {chars.map((c, i) =>
          i === p.swap.index ? (
            <span key={i} style={{position: 'relative', display: 'inline-block'}}>
              <span style={{opacity: 1 - sw}}>{c}</span>
              <span style={{position: 'absolute', left: 0, top: 0, opacity: sw, color: '#9ad8ff', textShadow: '0 0 10px #3f9cff, 0 0 20px #2a6cff', transform: `scale(${1 + 0.15 * (1 - sw)})`}}>{p.swap.to}</span>
            </span>
          ) : (
            <span key={i}>{c}</span>
          ),
        )}
        <span> ]</span>
      </div>
      {ld > 0 && (
        <svg width={852} height={480} style={{position: 'absolute', left: 0, top: 0}}>
          <polyline points={partial(p.line, ld).map((q) => q.join(',')).join(' ')} fill="none" stroke="#ffffff" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0 9" />
        </svg>
      )}
    </Stage>
  );
};
