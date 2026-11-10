import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, eased, K, ramp} from '../_lib/anim';
import {Stage} from '../_lib/stage';

// Arrow focus + title swap: a small subject in a big empty frame; hand-drawn arrows sketch in from
// all sides pointing at it, the view punches in and settles, the arrows are wiped, then big words
// pop in around the subject and are swapped for a second pair framing it.

export type ArrowFocusProps = {
  durationInFrames: number;
  target: [number, number];
  arrows: {from: [number, number]; bend: number; at: number}[]; // tail point, curvature (+/-)
  drawDur: number;
  arrowsOut: number; // frame the arrows are wiped
  zoom: K; // whole-scene scale around the target
  words: {text: string; x: number; y: number; at: number; out?: number; align?: 'left' | 'right'}[];
  subject?: 'rocket'; // drawn subject; replace with your own footage behind the overlay
  captions?: [number, string][];
};

const Rocket: React.FC<{f: number}> = ({f}) => (
  <svg width={40} height={150} viewBox="-20 -40 40 150" style={{position: 'absolute', left: -20, top: -40}}>
    <defs>
      <linearGradient id="af-flame" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff2c8" />
        <stop offset="0.3" stopColor="#ff9a57" stopOpacity="0.9" />
        <stop offset="1" stopColor="#ff6a3d" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="af-body" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#9aa3b5" />
        <stop offset="0.45" stopColor="#ffffff" />
        <stop offset="1" stopColor="#8b93a6" />
      </linearGradient>
    </defs>
    <path d={`M -4 44 Q ${-6 + Math.sin(f * 0.9) * 1.5} 80 0 ${104 + Math.sin(f * 1.3) * 5} Q ${6 + Math.cos(f) * 1.5} 80 4 44 Z`} fill="url(#af-flame)" />
    <path d="M -5 -36 Q 0 -44 5 -36 L 5 42 L -5 42 Z" fill="url(#af-body)" />
    <rect x={-5} y={-8} width={10} height={2.5} fill="#4a5060" />
    <rect x={-5} y={18} width={10} height={2} fill="#4a5060" />
    <path d="M -5 34 L -9 44 L -5 42 Z M 5 34 L 9 44 L 5 42 Z" fill="#6c7385" />
  </svg>
);

export const ArrowFocus: React.FC<ArrowFocusProps> = (p) => {
  const f = useCurrentFrame();
  const z = eased(f, p.zoom);
  const [tx, ty] = p.target;
  const wipe = ramp(f, p.arrowsOut, p.arrowsOut + 6, [0.5, 0, 0.7, 1]);
  const cap = (p.captions ?? []).filter((c) => f >= c[0]).pop();
  const texts = [...p.words.map((w) => w.text), ...(p.captions ?? []).map((c) => c[1])];
  return (
    <Stage bg="#0c3a96" texts={texts}>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(90% 90% at 50% 45%, #1450b8 0%, #0d3c98 55%, #0a2c78 100%)'}} />
      <div style={{position: 'absolute', inset: 0, transformOrigin: `${tx}px ${ty}px`, transform: `scale(${z})`}}>
        <div style={{position: 'absolute', left: tx, top: ty + Math.sin(f * 0.07) * 1.5, transform: 'scale(0.62) rotate(2deg)'}}>
          {p.subject !== undefined && <Rocket f={f} />}
        </div>
        <svg width={852} height={480} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          {wipe < 1 &&
            p.arrows.map((a, i) => {
              const t = ramp(f, a.at, a.at + p.drawDur, [0.4, 0, 0.3, 1]);
              if (t <= 0) return null;
              const [x0, y0] = a.from;
              const dx = tx - x0;
              const dy = ty - y0;
              const L = Math.hypot(dx, dy);
              const ux = dx / L;
              const uy = dy / L;
              const x1 = tx - ux * 46;
              const y1 = ty - uy * 46;
              const mx = (x0 + x1) / 2 - uy * a.bend * L;
              const my = (y0 + y1) / 2 + ux * a.bend * L;
              // head direction = tangent at the end of the quadratic
              const hx = x1 - mx;
              const hy = y1 - my;
              const hl = Math.hypot(hx, hy);
              const bx = hx / hl;
              const by = hy / hl;
              const head = (s: number) => `M ${x1 - bx * 16 + s * by * 11} ${y1 - by * 16 - s * bx * 11} L ${x1} ${y1}`;
              const ht = ramp(f, a.at + p.drawDur * 0.8, a.at + p.drawDur + 3);
              return (
                <g key={i} fill="none" stroke="#fff" strokeWidth={3.2} strokeLinecap="round" opacity={1 - wipe}>
                  <path d={`M ${x0} ${y0} Q ${mx} ${my} ${x1} ${y1}`} pathLength={1} strokeDasharray={`${t} 1`} />
                  {ht > 0 && (
                    <>
                      <path d={head(1)} pathLength={1} strokeDasharray={`${ht} 1`} />
                      <path d={head(-1)} pathLength={1} strokeDasharray={`${ht} 1`} />
                    </>
                  )}
                </g>
              );
            })}
        </svg>
      </div>
      {p.words.map((w, i) => {
        if (f < w.at || (w.out !== undefined && f >= w.out)) return null;
        const a = ramp(f, w.at, w.at + 5, [0.2, 1.4, 0.4, 1]);
        return (
          <div key={i} style={{position: 'absolute', top: w.y, ...(w.align === 'right' ? {right: 852 - w.x} : {left: w.x}), fontFamily: CJK, fontWeight: 900, fontSize: 98, lineHeight: '110px', color: '#fff', whiteSpace: 'nowrap', transform: `scale(${0.7 + 0.3 * a})`, transformOrigin: w.align === 'right' ? 'right center' : 'left center', opacity: Math.min(1, a * 2)}}>
            {w.text}
          </div>
        );
      })}
      {cap && <div style={{position: 'absolute', left: 0, right: 0, top: 436, textAlign: 'center', fontFamily: CJK, fontWeight: 900, fontSize: 16, color: '#fff'}}>{cap[1]}</div>}
    </Stage>
  );
};
