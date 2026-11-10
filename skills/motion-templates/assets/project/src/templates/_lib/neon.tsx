import React from 'react';
import {CJK} from './anim';

// "Neon glass" kit: dark navy page with a faint grid, a glowing rounded frame, glossy blue capsules,
// a blue arrow pointer and gradient display type. Design space 852x480.

export const N = {
  bg: '#050912',
  grid: 'rgba(60,90,160,0.10)',
  frame: 'rgba(120,150,230,0.45)',
  blue: '#2a4fe0',
  blueHi: '#4f7bff',
  text: '#e8ecf7',
  dim: '#8d96ad',
};

export const NeonGrid: React.FC<{opacity?: number}> = ({opacity = 1}) => (
  <svg width={852} height={480} style={{position: 'absolute', left: 0, top: 0, opacity}}>
    {Array.from({length: 36}, (_, i) => (
      <line key={`v${i}`} x1={i * 24 + 6} y1={0} x2={i * 24 + 6} y2={480} stroke={N.grid} strokeWidth={1} />
    ))}
    {Array.from({length: 21}, (_, i) => (
      <line key={`h${i}`} x1={0} y1={i * 24 + 4} x2={852} y2={i * 24 + 4} stroke={N.grid} strokeWidth={1} />
    ))}
  </svg>
);

/** Rounded frame with a soft blue glow, grows from its centre with t (0..1). */
export const NeonFrame: React.FC<{t?: number; x?: number; y?: number; w?: number; h?: number; fill?: string}> = ({t = 1, x = 22, y = 22, w = 808, h = 400, fill = 'rgba(16,18,28,0.92)'}) => {
  if (t <= 0) return null;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const ww = w * (0.6 + 0.4 * t);
  const hh = h * (0.6 + 0.4 * t);
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - ww / 2,
        top: cy - hh / 2,
        width: ww,
        height: hh,
        borderRadius: 14,
        background: fill,
        border: `1.4px solid ${N.frame}`,
        boxShadow: '0 0 18px rgba(70,110,230,0.35), inset 0 0 22px rgba(70,110,230,0.12)',
        opacity: Math.min(1, t * 1.6),
      }}
    />
  );
};

/** Capsule: outline (fill 0) to glossy filled blue (fill 1); `draw` traces the outline (0..1). */
export const Capsule: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  label: React.ReactNode;
  fill?: number;
  draw?: number;
  size?: number;
  glow?: number;
  spark?: boolean;
  style?: React.CSSProperties;
}> = ({x, y, w, h, label, fill = 0, draw = 1, size, glow = 0, spark, style}) => {
  const r = h / 2;
  const per = 2 * (w - h) + Math.PI * h;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, ...style}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: r,
          background: `linear-gradient(180deg, rgba(70,110,255,${0.95 * fill}), rgba(25,45,190,${0.95 * fill}))`,
          boxShadow: fill > 0 ? `0 0 ${14 * (fill + glow)}px rgba(60,100,255,${0.55 * fill + 0.3 * glow}), inset 0 1px 0 rgba(255,255,255,${0.35 * fill})` : undefined,
        }}
      />
      <svg width={w + 4} height={h + 4} style={{position: 'absolute', left: -2, top: -2}}>
        <rect x={2} y={2} width={w} height={h} rx={r} fill="none" stroke={fill > 0.5 ? 'rgba(170,195,255,0.9)' : 'rgba(220,226,240,0.85)'} strokeWidth={1.3} strokeDasharray={`${per * draw} ${per}`} />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontFamily: CJK, fontWeight: 900, fontSize: size ?? h * 0.48, color: N.text, whiteSpace: 'nowrap'}}>
        {spark && <Spark size={(size ?? h * 0.48) * 0.7} />}
        {label}
      </div>
    </div>
  );
};

export const Spark: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="-10 -10 20 20">
    <path d="M 0 -10 Q 1.5 -1.5 10 0 Q 1.5 1.5 0 10 Q -1.5 1.5 -10 0 Q -1.5 -1.5 0 -10 Z" fill="#ffffff" />
  </svg>
);

/** Blue arrow pointer; tip at (x, y). */
export const Pointer: React.FC<{x: number; y: number; scale?: number; opacity?: number}> = ({x, y, scale = 1, opacity = 1}) => (
  <svg width={40} height={40} viewBox="0 0 40 40" style={{position: 'absolute', left: x - 4, top: y - 4, transform: `scale(${scale})`, transformOrigin: '4px 4px', opacity, filter: 'drop-shadow(0 0 6px rgba(60,100,255,0.6))'}}>
    <path d="M 4 4 L 34 16 L 20 20 L 15 34 Z" fill="#2440c8" stroke="#6f8fff" strokeWidth={1.2} strokeLinejoin="round" />
  </svg>
);

/** Gradient display word (blue at left/top to pale at right/bottom). */
export const GradWord: React.FC<{text: string; size: number; style?: React.CSSProperties; dots?: boolean}> = ({text, size, style, dots}) => (
  <div
    style={{
      fontFamily: CJK,
      fontWeight: 900,
      fontSize: size,
      lineHeight: 1,
      letterSpacing: size * 0.01,
      // longhands only: React patches changed props one by one, and a `background` shorthand
      // update would reset background-clip and paint the glyph boxes solid.
      backgroundImage: dots
        ? 'radial-gradient(circle, rgba(150,200,255,0.95) 1.4px, rgba(0,0,0,0) 2px), linear-gradient(180deg, #3fd8ff 0%, #2f8bff 30%, #2142d8 100%)'
        : 'linear-gradient(115deg, #1f3fe0 0%, #3c62f0 40%, #a9b6e8 75%, #e9ecf7 100%)',
      backgroundSize: dots ? '6px 6px, 100% 100%' : '100% 100%',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {text}
  </div>
);
