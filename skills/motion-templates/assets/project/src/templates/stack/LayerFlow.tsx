import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, eased, K, keyed, stag} from '../_lib/anim';
import {N, NeonFrame, NeonGrid, Pointer, Spark} from '../_lib/neon';
import {Stage} from '../_lib/stage';

// Input pill -> arrow -> stack of glowing isometric plates -> arrow -> output pill.
// Optional opening: a laptop with a video thumbnail whose header capsule becomes the input pill.
// Every element is driven by keyframe arrays so the same scene covers "upload" and "process" beats.

export type Pill = {label: string; x: K; y: K; a: K; lit?: K; w?: number; h?: number; draw?: K; spark?: number; s?: K; clear?: K};
export type LayerFlowProps = {
  durationInFrames: number;
  gridOut?: [number, number]; // grid fades, frame grows in
  frameIn?: [number, number];
  laptop?: {a: K; s: K; y: K; dark: [number, number]; blur?: K};
  pills: Pill[];
  box?: {x: number; y: number; w: number; h: number; draw: [number, number]; a: K};
  arrows: {x: number; y: number; grow: [number, number]; a?: K}[];
  stack: {x: K; y: K; gap: K; a: K; plates: number[]; s?: K};
  pointer?: {x: K; y: K; a: K; clicks: number[]};
};

const Plate: React.FC<{x: number; y: number; t: number; s: number}> = ({x, y, t, s}) => {
  if (t <= 0) return null;
  const S = 196;
  return (
    <>
    <div style={{position: 'absolute', left: x - S / 2, top: y - S / 2 + 8 + (1 - t) * 30, width: S, height: S, opacity: t, transform: `scale(${s}) rotateX(68deg) rotateZ(-32deg)`, borderRadius: 10, background: '#3a2fa0', boxShadow: '0 0 18px rgba(90,70,230,0.5)'}} />
    <div style={{position: 'absolute', left: x - S / 2, top: y - S / 2 + (1 - t) * 30, width: S, height: S, opacity: t, transform: `scale(${s}) rotateX(68deg) rotateZ(-32deg)`}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 10,
          backgroundImage: 'radial-gradient(circle at 62% 70%, rgba(100,220,210,0.6), rgba(100,220,210,0) 50%), linear-gradient(135deg, #1f2ad0 0%, #2c38d0 40%, #5a52d0 72%, #7c66d8 100%)',
          border: '2px solid rgba(170,185,255,0.75)',
          boxShadow: '0 0 26px rgba(80,100,255,0.55)',
          opacity: 0.9,
        }}
      />
      {[0, 1, 2].map((i) =>
        [0, 1, 2].map((j) => <div key={`${i}${j}`} style={{position: 'absolute', left: 38 + i * 60 - 6, top: 38 + j * 60 - 6, width: 12, height: 12, borderRadius: 6, background: 'rgba(235,240,255,0.85)'}} />),
      )}
    </div>
    </>
  );
};

const PillView: React.FC<{p: Pill; f: number}> = ({p, f}) => {
  const a = keyed(f, p.a);
  if (a <= 0) return null;
  const x = eased(f, p.x);
  const y = eased(f, p.y);
  const v = Math.hypot(x - eased(f - 1, p.x), y - eased(f - 1, p.y));
  const lit = p.lit ? keyed(f, p.lit) : 0;
  const draw = p.draw ? keyed(f, p.draw) : 1;
  const w = p.w ?? 176;
  const h = p.h ?? 66;
  const sc = p.s ? keyed(f, p.s) : 1;
  const clear = p.clear ? keyed(f, p.clear) : 0;
  const per = 2 * (w - h) + Math.PI * h;
  const spark = p.spark !== undefined && f >= p.spark;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: a, transform: `scale(${sc})`, filter: v > 1 ? `blur(${Math.min(5, v * 0.3)}px)` : undefined}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: h / 2,
          backgroundImage: `linear-gradient(180deg, rgba(70,110,255,${0.95 * lit}), rgba(25,45,190,${0.95 * lit})), linear-gradient(180deg, rgba(32,44,120,${(1 - clear) * (1 - lit)}), rgba(20,28,85,${(1 - clear) * (1 - lit)}))`,
          boxShadow: lit > 0 ? `0 0 ${16 * lit}px rgba(60,100,255,${0.55 * lit}), inset 0 1px 0 rgba(255,255,255,${0.35 * lit})` : undefined,
        }}
      />
      <svg width={w + 4} height={h + 4} style={{position: 'absolute', left: -2, top: -2}}>
        <rect x={2} y={2} width={w} height={h} rx={h / 2} fill="none" stroke={lit > 0.5 ? 'rgba(170,195,255,0.9)' : 'rgba(150,170,240,0.75)'} strokeWidth={1.4} strokeDasharray={`${per * draw} ${per}`} />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontFamily: CJK, fontWeight: 900, fontSize: h * 0.5, color: N.text, whiteSpace: 'nowrap'}}>
        {spark && <Spark size={h * 0.3} />}
        {p.label}
      </div>
    </div>
  );
};

const Laptop: React.FC<{dark: number}> = ({dark}) => (
  <div style={{position: 'absolute', left: -188, top: -118, width: 376, height: 236}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: 10, background: '#1c2766', padding: 9, boxSizing: 'border-box'}}>
      <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 4, overflow: 'hidden', background: 'linear-gradient(160deg, #3a6cf0, #2546c8)'}}>
        <div style={{position: 'absolute', left: -60, top: -90, width: 260, height: 200, borderRadius: '50%', background: 'rgba(120,170,255,0.25)'}} />
        <div style={{position: 'absolute', right: -30, bottom: -60, width: 170, height: 170, borderRadius: '50%', background: '#2238c0'}} />
        <svg width={80} height={80} viewBox="0 0 80 80" style={{position: 'absolute', left: 140, top: 60}}>
          <path d="M 18 12 Q 18 4 26 8 L 70 34 Q 76 40 70 46 L 26 72 Q 18 76 18 68 Z" fill="#c9ccd6" />
        </svg>
        <div style={{position: 'absolute', inset: 0, background: '#07080e', opacity: dark}} />
      </div>
    </div>
    <div style={{position: 'absolute', left: -30, top: 236, width: 436, height: 16, borderRadius: '2px 2px 8px 8px', background: 'linear-gradient(#e2e4ea, #b9bcc6)'}}>
      <div style={{position: 'absolute', left: 14, top: 4, width: 330, height: 3, borderRadius: 2, background: '#9a9da8'}} />
    </div>
  </div>
);

export const LayerFlow: React.FC<LayerFlowProps> = (p) => {
  const f = useCurrentFrame();
  const gridA = p.gridOut ? 1 - eased(f, [[p.gridOut[0], 0], [p.gridOut[1], 1]]) : 0;
  const fr = p.frameIn ? eased(f, [[p.frameIn[0], 0], [p.frameIn[1], 1]]) : 1;
  const sx = eased(f, p.stack.x);
  const sy = eased(f, p.stack.y);
  const gap = eased(f, p.stack.gap);
  const sa = keyed(f, p.stack.a);
  const ss = p.stack.s ? keyed(f, p.stack.s) : 1;
  const ys = [-1, 0, 1].map((k) => sy + k * gap);
  return (
    <Stage bg={N.bg} texts={p.pills.map((q) => q.label)}>
      {gridA > 0 && <NeonGrid opacity={gridA} />}
      <NeonFrame t={fr} x={50} y={25} w={752} h={430} />
      {p.laptop &&
        (() => {
          const a = keyed(f, p.laptop.a);
          if (a <= 0) return null;
          const dark = eased(f, [[p.laptop.dark[0], 0], [p.laptop.dark[1], 1]]);
          const blur = p.laptop.blur ? keyed(f, p.laptop.blur) : 0;
          return (
            <div style={{position: 'absolute', left: 438, top: eased(f, p.laptop.y), transform: `scale(${keyed(f, p.laptop.s)})`, opacity: a, filter: blur > 0.05 ? `blur(${blur}px)` : undefined}}>
              <Laptop dark={dark} />
            </div>
          );
        })()}
      {p.box &&
        (() => {
          const b = p.box;
          const d = eased(f, [[b.draw[0], 0], [b.draw[1], 1]]);
          const a = keyed(f, b.a);
          if (d <= 0 || a <= 0) return null;
          return (
            <svg width={852} height={480} style={{position: 'absolute', left: 0, top: 0, opacity: a, filter: 'drop-shadow(0 0 4px rgba(70,100,255,0.5))'}}>
              {[1, -1].map((dir) => {
                const r = 40;
                const cy = b.y + b.h / 2;
                const ey = dir > 0 ? b.y : b.y + b.h;
                const d1 = `M ${b.x} ${cy} L ${b.x} ${ey + dir * r} Q ${b.x} ${ey} ${b.x + r} ${ey} L ${b.x + b.w - r} ${ey} Q ${b.x + b.w} ${ey} ${b.x + b.w} ${ey + dir * r} L ${b.x + b.w} ${cy}`;
                return <path key={dir} d={d1} fill="none" stroke="rgba(80,115,240,0.8)" strokeWidth={2} pathLength={1} strokeDasharray={`${d} 1`} />;
              })}
            </svg>
          );
        })()}
      {p.arrows.map((ar, i) => {
        const g = stag(f, ar.grow[0], 0, ar.grow[1] - ar.grow[0], 0);
        const a = ar.a ? keyed(f, ar.a) : 1;
        if (g <= 0 || a <= 0) return null;
        return (
          <svg key={i} width={104} height={60} viewBox="0 0 70 40" style={{position: 'absolute', left: ar.x - 52, top: ar.y - 30, opacity: a * g, transform: `scaleX(${g})`, transformOrigin: 'left center'}}>
            <defs>
              <linearGradient id={`lf-ar${i}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#2a46c8" stopOpacity={0.5} />
                <stop offset="1" stopColor="#4c74ff" />
              </linearGradient>
            </defs>
            <path d="M 4 14 L 40 14 L 40 4 L 66 20 L 40 36 L 40 26 L 4 26 Z" fill={`url(#lf-ar${i})`} />
          </svg>
        );
      })}
      {sa > 0 && (
        <div style={{position: 'absolute', left: 0, top: 0, width: 852, height: 480, opacity: sa}}>
          {[2, 1, 0].map((k) => (
            <Plate key={k} x={sx} y={ys[k]} t={stag(f, p.stack.plates[k], 0, 10, 0)} s={ss} />
          ))}
          <svg width={852} height={480} style={{position: 'absolute', left: 0, top: 0, opacity: stag(f, Math.max(...p.stack.plates), 0, 10, 0)}}>
            <path d={`M ${sx + 40 * ss} ${ys[0] - 4} Q ${sx + 92 * ss} ${ys[0] + 8} ${sx + 70 * ss} ${ys[1] + 6}`} fill="none" stroke="rgba(235,240,255,0.7)" strokeWidth={1.4} />
            <path d={`M ${sx + 64 * ss} ${ys[1] + 2} l 6 6 l 4 -8`} fill="none" stroke="rgba(235,240,255,0.7)" strokeWidth={1.4} />
            <path d={`M ${sx - 6 * ss} ${ys[1] - 6} Q ${sx - 40 * ss} ${ys[1] + 20} ${sx - 4 * ss} ${ys[2] + 4}`} fill="none" stroke="rgba(235,240,255,0.55)" strokeWidth={1.4} />
          </svg>
        </div>
      )}
      {p.pills.map((q, i) => (
        <PillView key={i} p={q} f={f} />
      ))}
      {p.pointer &&
        (() => {
          const a = keyed(f, p.pointer.a);
          if (a <= 0) return null;
          const press = p.pointer.clicks.some((c) => f >= c - 2 && f < c + 3) ? 0.85 : 1;
          return <Pointer x={eased(f, p.pointer.x)} y={eased(f, p.pointer.y)} scale={1.6 * press} opacity={a} />;
        })()}
    </Stage>
  );
};
