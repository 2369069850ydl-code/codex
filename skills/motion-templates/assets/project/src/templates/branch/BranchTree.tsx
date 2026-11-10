import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, eased, K, ramp, rng} from '../_lib/anim';
import {Stage} from '../_lib/stage';

// Category tree: a glowing title tag (with a pointer and a rotating stamp ring) holds the screen,
// then rises and shrinks while a rounded branch grows out of it, and example cards pop in at the end of
// each branch with their captions. Any "X splits into N kinds" explanation.

export type BranchCard = {
  label: string;
  at: number; // card pops in
  labelAt?: number;
  art?: 'stick' | 'spiral' | 'room'; // drawn placeholder art
  src?: string; // your image (replaces art)
};
export type BranchTreeProps = {
  durationInFrames: number;
  title: string;
  stamp?: string; // text around the pointer ring (empty = no ring)
  stampAt?: number;
  branchAt: number; // the tag starts rising and the branch grows
  branchDur: number;
  cards: BranchCard[]; // 2-4, laid out left to right
  captions?: [number, string][];
};

const TAG = {x: 427.5, y: 85, w: 176, h: 62}; // final tag (design space)
const BIG = {y: 237, s: 1.65}; // tag while it is alone on screen
const BR = {y: 92, bottom: 250, r: 22};
const CARD = {w: 228, h: 128, y: 312};
const SPAN: [number, number] = [138, 717]; // x of the outer branches

const Art: React.FC<{kind: BranchCard['art']; w: number; h: number}> = ({kind, w, h}) => {
  if (kind === 'spiral') {
    const r = rng(9);
    return (
      <svg width={w} height={h}>
        <rect width={w} height={h} fill="#e9eef6" />
        {Array.from({length: 46}, (_, i) => {
          const a = i * 0.62;
          const d = 6 + i * 1.45;
          return <ellipse key={i} cx={w * 0.62 + Math.cos(a) * d} cy={h / 2 + Math.sin(a) * d * 0.9} rx={5.5} ry={3} transform={`rotate(${(a * 180) / Math.PI + 90} ${w * 0.62 + Math.cos(a) * d} ${h / 2 + Math.sin(a) * d * 0.9})`} fill={r() > 0.5 ? '#3d5a8a' : '#7c93b8'} />;
        })}
        <rect width={w * 0.38} height={h} fill="#141519" />
        {Array.from({length: 6}, (_, i) => (
          <line key={i} x1={w * 0.38} y1={h / 2} x2={0} y2={(h / 5) * i} stroke="#33353d" strokeWidth={6} />
        ))}
        <line x1={w * 0.3} y1={h / 2} x2={w * 0.62} y2={h / 2} stroke="#2a2a2e" strokeWidth={5} />
      </svg>
    );
  }
  if (kind === 'room') {
    const tiles = [];
    for (let i = 0; i < 9; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2 === 0) tiles.push([i, j]);
    return (
      <svg width={w} height={h}>
        <rect width={w} height={h} fill="#d8dccf" />
        <rect x={w * 0.12} y={h * 0.08} width={w * 0.76} height={h * 0.52} fill="#b9c4ae" />
        <rect x={w * 0.42} y={h * 0.12} width={w * 0.16} height={h * 0.36} fill="#eef0e8" />
        {tiles.map(([i, j], k) => {
          const y0 = h * 0.6 + (h * 0.4 * j) / 4;
          const y1 = h * 0.6 + (h * 0.4 * (j + 1)) / 4;
          const xl = (y: number, c: number) => w / 2 + (c / 9 - 0.5) * w * (0.76 + ((y - h * 0.6) / (h * 0.4)) * 0.6);
          return <polygon key={k} points={`${xl(y0, i)},${y0} ${xl(y0, i + 1)},${y0} ${xl(y1, i + 1)},${y1} ${xl(y1, i)},${y1}`} fill="#2b2b2b" />;
        })}
        <rect x={w * 0.66} y={h * 0.34} width={7} height={h * 0.42} rx={3} fill="#3a3a3a" />
        <circle cx={w * 0.66 + 3.5} cy={h * 0.3} r={5} fill="#3a3a3a" />
      </svg>
    );
  }
  return (
    <svg width={w} height={h}>
      <defs>
        <linearGradient id="bt-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f2f3f5" />
          <stop offset="1" stopColor="#a9adb5" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="url(#bt-g)" />
      <rect y={h * 0.32} width={w} height={h * 0.68} fill="rgba(160,170,185,0.35)" />
      <line x1={w * 0.46} y1={0} x2={w * 0.56} y2={h * 0.32} stroke="#151515" strokeWidth={5} />
      <line x1={w * 0.56} y1={h * 0.34} x2={w * 0.64} y2={h * 0.6} stroke="#151515" strokeWidth={5} />
    </svg>
  );
};

const Ring: React.FC<{text: string; f: number; a: number}> = ({text, f, a}) => {
  const n = 3;
  const s = `${text} · `.repeat(n);
  return (
    <svg width={80} height={80} viewBox="-40 -40 80 80" style={{position: 'absolute', left: -40, top: -40, opacity: a, transform: `rotate(${f * 2.2}deg) scale(${0.6 + 0.4 * a})`}}>
      <defs>
        <path id="bt-ring" d="M -27 0 a 27 27 0 1 1 54 0 a 27 27 0 1 1 -54 0" />
      </defs>
      <text fontFamily="'MontserratLocal'" fontWeight={500} fontSize={6.6} fill="#fff" letterSpacing={0.6}>
        <textPath href="#bt-ring" textLength={168}>{s}</textPath>
      </text>
    </svg>
  );
};

const Arrow: React.FC = () => (
  <svg width={26} height={26} viewBox="0 0 26 26" style={{position: 'absolute', left: -6, top: -6, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'}}>
    <path d="M 4 4 L 22 10 L 15 13 L 22 20 L 19 23 L 12 16 L 9 23 Z" fill="#e8202a" stroke="#ffd0d0" strokeWidth={0.8} />
  </svg>
);

export const BranchTree: React.FC<BranchTreeProps> = (p) => {
  const f = useCurrentFrame();
  const up = ramp(f, p.branchAt, p.branchAt + p.branchDur * 0.85, [0.5, 0, 0.2, 1]);
  const ty = BIG.y + (TAG.y - BIG.y) * up;
  const ts = BIG.s + (1 - BIG.s) * up;
  const grow = ramp(f, p.branchAt + 2, p.branchAt + p.branchDur, [0.4, 0, 0.3, 1]);
  const n = p.cards.length;
  const xs = p.cards.map((_, i) => SPAN[0] + ((SPAN[1] - SPAN[0]) * i) / Math.max(1, n - 1));
  const mid = n % 2 === 1 ? Math.floor(n / 2) : -1;
  const dy = ty - TAG.y; // the branch hangs from the tag while it rises
  const texts = [p.title, ...p.cards.map((c) => c.label), ...(p.captions ?? []).map((c) => c[1])];
  const cap = (p.captions ?? []).filter((c) => f >= c[0]).pop();
  const stampA = p.stamp ? ramp(f, p.stampAt ?? 0, (p.stampAt ?? 0) + 8) : 0;
  const r = rng(3);
  const specks = Array.from({length: 26}, () => [r() * 852, r() * 480, r()]);
  // branch paths: one per card, from the tag centre line
  const paths = xs.map((x, i) => {
    if (i === mid || Math.abs(x - TAG.x) < 2) return `M ${x} ${BR.y + TAG.h / 2 - 4} L ${x} ${BR.bottom}`;
    const sgn = Math.sign(x - TAG.x);
    return `M ${TAG.x} ${BR.y} L ${x - sgn * BR.r} ${BR.y} Q ${x} ${BR.y} ${x} ${BR.y + BR.r} L ${x} ${BR.bottom}`;
  });
  return (
    <Stage bg="#000" texts={texts}>
      <svg width={852} height={480} style={{position: 'absolute', left: 0, top: 0}}>
        {[0, 1, 2, 3].map((i) => {
          const x0 = 120 + i * 210 + Math.sin(f * 0.02 + i) * 12;
          return <path key={i} d={`M ${x0} -10 C ${x0 - 60} 120, ${x0 + 70} 240, ${x0 - 20} 330 S ${x0 + 40} 470, ${x0 - 10} 500`} fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth={1.2} />;
        })}
        {specks.map(([x, y, k], i) => (
          <circle key={i} cx={x} cy={(y + f * (0.15 + k * 0.3)) % 480} r={0.6 + k * 0.9} fill={`rgba(255,255,255,${0.25 + 0.4 * k})`} />
        ))}
      </svg>
      <svg width={852} height={480} style={{position: 'absolute', left: 0, top: dy, overflow: 'visible'}}>
        <defs>
          <linearGradient id="bt-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#1f5cff" />
            <stop offset="1" stopColor="#58a6ff" />
          </linearGradient>
        </defs>
        {grow > 0 &&
          paths.map((d, i) => <path key={i} d={d} fill="none" stroke="url(#bt-line)" strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={`${grow} 1`} style={{filter: 'drop-shadow(0 0 5px rgba(60,120,255,0.75))'}} />)}
      </svg>
      {p.cards.map((c, i) => {
        const a = ramp(f, c.at, c.at + 10, [0.2, 0.9, 0.3, 1]);
        const la = ramp(f, c.labelAt ?? c.at + 12, (c.labelAt ?? c.at + 12) + 8);
        if (a <= 0) return null;
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: xs[i] - CARD.w / 2, top: CARD.y - CARD.h / 2, width: CARD.w, height: CARD.h, overflow: 'hidden', opacity: Math.min(1, a * 1.5), transform: `scale(${0.45 + 0.55 * a})`, filter: a < 0.9 ? `blur(${(1 - a) * 4}px)` : undefined}}>
              {c.src ? <img src={c.src} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <Art kind={c.art} w={CARD.w} h={CARD.h} />}
            </div>
            <div style={{position: 'absolute', left: xs[i] - 100, width: 200, top: 396, textAlign: 'center', fontFamily: CJK, fontWeight: 900, fontSize: 12, letterSpacing: 3, color: '#fff', opacity: la}}>“{c.label}”</div>
          </React.Fragment>
        );
      })}
      <div style={{position: 'absolute', left: TAG.x, top: ty, transform: `scale(${ts})`}}>
        <div style={{position: 'absolute', left: -TAG.w / 2, top: -TAG.h / 2, width: TAG.w, height: TAG.h, borderRadius: 4, background: 'linear-gradient(180deg, #5aa2ff 0%, #2f72f5 100%)', border: '1.5px solid #a9d4ff', boxShadow: '0 0 16px rgba(70,140,255,0.85), 0 0 40px rgba(40,100,255,0.35), inset 0 1px 0 rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: CJK, fontWeight: 900, fontSize: 23, color: '#fff', textShadow: '0 1px 2px rgba(0,40,120,0.5)', whiteSpace: 'nowrap', boxSizing: 'border-box'}}>
          “{p.title}”
        </div>
        {[-1, 1].map((s) => (
          <div key={s} style={{position: 'absolute', left: s * (TAG.w / 2 + 5) - 3.5, top: -3.5, width: 7, height: 7, background: '#3b86ff', opacity: 1 - up}} />
        ))}
        <div style={{position: 'absolute', left: TAG.w / 2 - 6, top: TAG.h / 2 - 2}}>
          {p.stamp ? <Ring text={p.stamp} f={f} a={stampA} /> : null}
          <Arrow />
        </div>
      </div>
      {cap && <div style={{position: 'absolute', left: 0, right: 0, top: 436, textAlign: 'center', fontFamily: CJK, fontWeight: 900, fontSize: 16, color: '#fff'}}>{cap[1]}</div>}
    </Stage>
  );
};
