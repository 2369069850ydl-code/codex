import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, ramp} from '../_lib/anim';
import {Stage} from '../_lib/stage';

// Two-variable balance: a drawn pan balance on a white card assembles itself; names appear on both
// sides; weights drop onto the pans with value labels; the beam tilts toward the heavier side; when
// both sides match the card glows neutral, otherwise it glows in the colour of the imbalance.

export type Side = {value: number; count: number};
export type BalanceProps = {
  durationInFrames: number;
  names: [string, string];
  namesAt: [number, number];
  build: [number, number];
  states: {at: number; left?: Side; right?: Side}[]; // undefined side = empty pan
  unit: string; // "K"
  glow: {even: string; leftLess: string; leftMore: string; at: number; lag: number}; // glow colours, first glow frame, delay after a change
  captions?: [number, string][];
};

const W = 288;
const H = 138;
const CX = 430;
const CY = 297;

const Jar: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-6} y={-20} width={12} height={20} rx={2} fill="#111" stroke="#fff" strokeWidth={1.4} />
    <rect x={-4} y={-24} width={8} height={5} fill="#111" stroke="#fff" strokeWidth={1.2} />
    <line x1={-3} y1={-14} x2={3} y2={-14} stroke="#fff" strokeWidth={1} />
  </g>
);

export const Balance: React.FC<BalanceProps> = (p) => {
  const f = useCurrentFrame();
  const idx = p.states.filter((s) => f >= s.at).length - 1;
  const st = idx >= 0 ? p.states[idx] : {at: 0};
  const prev = idx >= 1 ? p.states[idx - 1] : {at: 0};
  const w = (s?: Side) => (s ? s.value : 0);
  const tiltOf = (s: {left?: Side; right?: Side}) => Math.max(-1, Math.min(1, (w(s.left) - w(s.right)) / 4000)) * 7;
  const tt = idx >= 0 ? ramp(f, st.at + 6, st.at + 20, [0.4, 0, 0.3, 1.2]) : 0;
  const tilt = tiltOf(prev) + (tiltOf(st) - tiltOf(prev)) * tt; // degrees, + = left side down
  const b = (i: number) => ramp(f, p.build[0] + i * ((p.build[1] - p.build[0]) / 6), p.build[0] + i * ((p.build[1] - p.build[0]) / 6) + 6);
  const glowOf = (s: {left?: Side; right?: Side}) => (!s.left || !s.right ? null : s.left.value === s.right.value ? p.glow.even : s.left.value < s.right.value ? p.glow.leftLess : p.glow.leftMore);
  const glowCol = idx >= 0 ? glowOf(st) : null;
  const prevCol = idx >= 1 ? glowOf(prev) : null;
  const gStart = Math.max(p.glow.at, (st.at ?? 0) + p.glow.lag);
  const gt = ramp(f, gStart, gStart + 18);
  const ga = glowCol ? gt : 0; // current colour
  const pa = prevCol && f >= p.glow.at ? 1 - gt : 0; // previous colour fading out
  const cap = (p.captions ?? []).filter((x) => f >= x[0]).pop();
  const texts = [...p.names.map((n) => n.split('').join(' ')), ...(p.captions ?? []).map((x) => x[1])];
  const beamHalf = 100;
  const rad = (tilt * Math.PI) / 180;
  const panY = (side: -1 | 1) => -side * Math.sin(rad) * beamHalf; // left side (-1) goes down when tilt>0
  const drop = (side: 'left' | 'right') => {
    const s = st[side];
    const was = prev[side];
    if (!s) return null;
    const changed = !was || was.count !== s.count || was.value !== s.value;
    const d = changed ? ramp(f, st.at, st.at + 10, [0.5, 0, 0.9, 1]) : 1;
    const sx = side === 'left' ? -88 : 88;
    const py = panY(side === 'left' ? -1 : 1);
    const labelA = changed ? ramp(f, st.at + 4, st.at + 12) : 1;
    const gone = was && was.count > s.count ? was.count - s.count : 0;
    return (
      <g>
        {Array.from({length: s.count}, (_, i) => (
          <Jar key={i} x={sx + (i - (s.count - 1) / 2) * 14} y={-62 + py - (1 - d) * 70} />
        ))}
        {gone > 0 && Array.from({length: gone}, (_, i) => <Jar key={`g${i}`} x={sx + (i - (gone - 1) / 2) * 14} y={-150 - ramp(f, st.at, st.at + 12) * 10} />)}
        <text x={sx} y={-100 + Math.min(py, 0) * 0.5} fill="#fff" fontFamily="MontserratLocal" fontWeight={700} fontStyle="italic" fontSize={11} letterSpacing={5} textAnchor="middle" opacity={labelA}>{`${s.value}${p.unit}`}</text>
      </g>
    );
  };
  return (
    <Stage bg="#000" texts={texts}>
      <svg width={852} height={480} style={{position: 'absolute', inset: 0}}>
        {[110, 300, 650, 760].map((x, i) => (
          <path key={i} d={`M ${x} -10 C ${x + 50} 100, ${x - 60} 220, ${x + 20} 320 S ${x - 30} 430, ${x + 30} 500`} fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth={1.2} transform={`translate(${Math.sin(f * 0.015 + i * 2) * 8} 0)`} />
        ))}
      </svg>
      {/* card + glow layers */}
      {[prevCol && pa > 0 ? [prevCol, pa] : null, glowCol && ga > 0 ? [glowCol, ga] : null].map((g, i) =>
        g ? <div key={i} style={{position: 'absolute', left: CX - W / 2, top: CY - H / 2, width: W, height: H, borderRadius: 9, boxShadow: `0 0 18px 6px ${g[0]}`, opacity: g[1] as number}} /> : null,
      )}
      <div style={{position: 'absolute', left: CX - W / 2, top: CY - H / 2, width: W, height: H, borderRadius: 9, background: '#fff', transform: `scale(${0.6 + 0.4 * b(0)})`, opacity: b(0)}} />
      <svg width={852} height={480} style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(${CX} ${CY})`}>
          {/* base */}
          <path d="M -120 30 L 120 30 L 120 69 L -120 69 Z" fill="#111" opacity={b(1)} />
          <path d="M -110 30 L -96 18 L 96 18 L 110 30 Z" fill="#111" opacity={b(1)} />
          <rect x={-6} y={-2} width={12} height={20} fill="#111" opacity={b(1)} />
          <line x1={-2} y1={30} x2={-2} y2={50} stroke="#fff" strokeWidth={1} opacity={b(1)} />
          <line x1={2} y1={30} x2={2} y2={50} stroke="#fff" strokeWidth={1} opacity={b(1)} />
          {/* pillar + dial */}
          <path d="M -5 -12 L -3 -100 L 3 -100 L 5 -12 Z" fill="#111" opacity={b(2)} />
          <path d="M -12 -14 L 12 -14 L 8 -22 L -8 -22 Z" fill="#111" opacity={b(2)} />
          <g opacity={b(3)}>
            <path d="M -22 -138 L 22 -138 L 18 -116 L -18 -116 Z" fill="#111" stroke="#fff" strokeWidth={1.4} />
            {Array.from({length: 11}, (_, i) => (
              <line key={i} x1={-13 + i * 2.6} y1={-133} x2={-13 + i * 2.6} y2={-124} stroke="#fff" strokeWidth={0.8} />
            ))}
            <path d="M -4 -116 L 0 -100 L 4 -116" fill="#111" />
            <line x1={0} y1={-110} x2={Math.sin(rad) * 14} y2={-128} stroke="#fff" strokeWidth={1.2} />
          </g>
          {/* beam */}
          <g transform={`rotate(${-tilt})`} opacity={b(4)}>
            <rect x={-beamHalf} y={-14} width={beamHalf * 2} height={6} fill="#111" />
            <line x1={-118} y1={-11} x2={118} y2={-11} stroke="#111" strokeWidth={1.6} />
            {Array.from({length: 40}, (_, i) => (
              <line key={i} x1={-60 + i * 3} y1={-17} x2={-60 + i * 3} y2={-13} stroke="#111" strokeWidth={0.8} />
            ))}
            <rect x={-62} y={-17} width={124} height={8} fill="none" stroke="#111" strokeWidth={1.2} />
            <path d="M -6 -24 L 6 -24 L 9 -12 L -9 -12 Z" fill="#111" />
          </g>
          {/* pans */}
          {([-1, 1] as const).map((side) => (
            <g key={side} transform={`translate(${side * 88} ${panY(side)})`} opacity={b(5)}>
              <rect x={-6} y={-36} width={12} height={34} fill="#111" />
              <rect x={-8} y={-26} width={16} height={4} fill="#fff" />
              <rect x={-8} y={-12} width={16} height={4} fill="#fff" />
              <path d="M -38 -44 Q 0 -32 38 -44 L 34 -40 Q 0 -30 -34 -40 Z" fill="#111" />
              <path d="M -40 -46 L 40 -46" stroke="#111" strokeWidth={4} strokeLinecap="round" />
              <path d="M -8 -2 Q -2 14 6 20" stroke="#111" fill="none" strokeWidth={1.4} />
            </g>
          ))}
          {drop('left')}
          {drop('right')}
        </g>
      </svg>
      {p.names.map((n, i) => {
        const a = ramp(f, p.namesAt[i], p.namesAt[i] + 10);
        return (
          <div key={i} style={{position: 'absolute', top: CY - 20, ...(i === 0 ? {right: 852 - (CX - W / 2 - 96)} : {left: CX + W / 2 + 70}), fontFamily: CJK, fontWeight: 900, fontSize: 30, color: '#fff', opacity: a, transform: `translateY(${(1 - a) * 8}px)`, whiteSpace: 'nowrap'}}>
            {n.split('').join(' ')}
          </div>
        );
      })}
      {cap && cap[1] && <div style={{position: 'absolute', left: 0, right: 0, top: 438, textAlign: 'center', fontFamily: CJK, fontWeight: 900, fontSize: 19, color: '#fff'}}>{cap[1]}</div>}
    </Stage>
  );
};
