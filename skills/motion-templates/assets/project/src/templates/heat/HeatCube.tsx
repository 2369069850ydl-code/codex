import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, ramp, rng} from '../_lib/anim';
import {Stage} from '../_lib/stage';

// Input drives colour: a block hangs over a (drawn) fire; side scales slide in; as the input grows
// the block changes colour step by step and markers on both scales climb to the matching colour.

export type HeatCubeProps = {
  durationInFrames: number;
  fireIn: [number, number];
  scalesIn: number;
  colors: [number, string][]; // block colour keys (hex)
  markers: {at: number; pos: number; color: string}[]; // pos 0 (bottom) .. 1 (top) on the scales
  scale: string[]; // gradient stops bottom -> top
  captions?: [number, string][];
};

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  return A.map((v, i) => Math.round(v + (B[i] - v) * t));
};
const colorAt = (f: number, keys: [number, string][]) => {
  if (f <= keys[0][0]) return hex(keys[0][1]);
  for (let i = 0; i < keys.length - 1; i++) {
    const [a, ca] = keys[i];
    const [b, cb] = keys[i + 1];
    if (f <= b) return mix(ca, cb, ramp(f, a, b, [0.4, 0, 0.6, 1]));
  }
  return hex(keys[keys.length - 1][1]);
};
const rgb = (c: number[], k = 1) => `rgb(${c.map((v) => Math.round(Math.min(255, v * k))).join(',')})`;

const Fire: React.FC<{f: number; a: number}> = ({f, a}) => {
  const R = rng(5);
  const tongues = Array.from({length: 34}, (_, i) => ({x: (R() - 0.5) * 130, h: 80 + R() * 110, w: 10 + R() * 20, ph: R() * 6.28, sp: 0.25 + R() * 0.3, layer: i % 3}));
  const cols = ['#e3150e', '#ff7a12', '#ffd23a'];
  return (
    <svg width={300} height={300} viewBox="-150 -260 300 300" style={{position: 'absolute', left: 426 - 150, top: 420 - 260, overflow: 'visible', opacity: a}}>
      <defs>
        <radialGradient id="hc-glow" cx="0" cy="-40" r="170" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ff7a1a" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ff3a00" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={0} cy={-40} r={170} fill="url(#hc-glow)" />
      {[0, 1, 2].map((layer) => (
        <g key={layer}>
          {tongues
            .filter((t) => t.layer <= 2 - layer || layer === 0)
            .map((t, i) => {
              const k = 1 - layer * 0.3;
              const w = t.w * k;
              const h = t.h * k * a * (0.85 + 0.15 * Math.sin(f * t.sp * 1.7 + t.ph));
              const sway = Math.sin(f * t.sp + t.ph) * 12;
              const x = t.x * k;
              const s2 = Math.sin(f * t.sp * 2.3 + t.ph * 2) * 8;
              return <path key={i} d={`M ${x - w} -10 C ${x - w * 1.2} ${-h * 0.35}, ${x + s2 - w * 0.6} ${-h * 0.6}, ${x + sway} ${-h} C ${x + s2 + w * 0.5} ${-h * 0.62}, ${x + w * 1.1} ${-h * 0.3}, ${x + w} -10 Z`} fill={cols[layer]} opacity={0.88} />;
            })}
        </g>
      ))}
      {Array.from({length: 7}, (_, i) => (
        <ellipse key={i} cx={-80 + i * 27} cy={-2 + (i % 2) * 6} rx={22} ry={9} fill={['#3c3a3e', '#57545a', '#2b292d'][i % 3]} />
      ))}
      {Array.from({length: 14}, (_, i) => {
        const t = (f * 0.02 + i / 14) % 1;
        return <rect key={`s${i}`} x={Math.sin(i * 7.1) * 90 + Math.sin(f * 0.1 + i) * 6} y={-60 - t * 200} width={2.5} height={2.5} fill="#ff6a1a" opacity={(1 - t) * 0.8} />;
      })}
    </svg>
  );
};

export const HeatCube: React.FC<HeatCubeProps> = (p) => {
  const f = useCurrentFrame();
  const fa = ramp(f, p.fireIn[0], p.fireIn[1]);
  const c = colorAt(f, p.colors);
  const sIn = ramp(f, p.scalesIn, p.scalesIn + 12, [0.2, 0.8, 0.2, 1]);
  const grad = `linear-gradient(0deg, ${p.scale.join(', ')})`;
  const cap = (p.captions ?? []).filter((x) => f >= x[0]).pop();
  const bob = Math.sin(f * 0.05) * 2;
  const glowAmt = Math.max(0, (c[0] + c[1] + c[2]) / 765 - 0.1);
  return (
    <Stage bg="#050101" texts={(p.captions ?? []).map((x) => x[1])}>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(60% 80% at 50% 60%, #2a0704 0%, #120202 60%, #050101 100%)', opacity: 0.4 + 0.6 * fa}} />
      <div style={{position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.25) 0 2px, transparent 2px 22px)', opacity: fa}} />
      <svg width={852} height={480} style={{position: 'absolute', inset: 0}}>
        {[90, 330, 600, 760].map((x, i) => (
          <path key={i} d={`M ${x} -10 C ${x + 60} 90, ${x - 70} 200, ${x + 30} 300 S ${x - 20} 420, ${x + 40} 500`} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1.3} transform={`translate(${Math.sin(f * 0.02 + i) * 6} 0)`} />
        ))}
      </svg>
      <Fire f={f} a={fa} />
      {/* block */}
      <svg width={140} height={140} viewBox="0 0 140 140" style={{position: 'absolute', left: 426 - 62, top: 122 + bob, overflow: 'visible', filter: glowAmt > 0.15 ? `drop-shadow(0 0 ${10 * glowAmt}px ${rgb(c)})` : undefined}}>
        <polygon points="8,12 104,6 120,18 22,26" fill={rgb(c, 1.18)} />
        <polygon points="104,6 120,18 118,112 104,118" fill={rgb(c, 0.72)} />
        <polygon points="8,12 104,6 104,118 10,120" fill={rgb(c, 0.95)} />
        <polygon points="8,12 104,6 104,118 10,120" fill="url(#hc-shade)" opacity={Math.min(1, glowAmt * 3)} />
        <defs>
          <linearGradient id="hc-shade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0.25" />
            <stop offset="1" stopColor="#ffb070" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>
      {/* scales */}
      {[0, 1].map((side) => (
        <React.Fragment key={side}>
          <div style={{position: 'absolute', top: 0, bottom: 0, width: 16, ...(side ? {right: -16 + 16 * sIn} : {left: -16 + 16 * sIn}), background: grad}} />
          {p.markers.map((m, i) => {
            const a = ramp(f, m.at, m.at + 6);
            return <div key={i} style={{position: 'absolute', top: 470 - m.pos * 470 - 4, width: 8, height: 8, background: m.color, opacity: a, ...(side ? {right: 26} : {left: 26})}} />;
          })}
        </React.Fragment>
      ))}
      {cap && cap[1] && <div style={{position: 'absolute', left: 0, right: 0, top: 438, textAlign: 'center', fontFamily: CJK, fontWeight: 900, fontSize: 19, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>{cap[1]}</div>}
    </Stage>
  );
};

