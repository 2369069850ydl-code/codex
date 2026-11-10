import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, ramp} from '../_lib/anim';
import {Media, MediaKind} from '../_lib/media';
import {Stage} from '../_lib/stage';

// Value words + gauge: a glitch cut opens a split screen (grid panel left, footage right); short
// value words stack up one by one; then the panel slides away, the footage takes over and a
// segmented arc gauge sweeps up from the corner with a counting number.

export type ValueWordsProps = {
  durationInFrames: number;
  words: {text: string; at: number}[];
  glitch: [number, number];
  media: {at: number; kind?: MediaKind; src?: string; seed?: number}[];
  gaugeAt: number; // panel slides away, gauge starts
  gaugeDur: number;
  count: [number, number]; // counter from..to
  segments: number;
  captions?: [number, string][];
};

const GRID = '#3a3448';

export const ValueWords: React.FC<ValueWordsProps> = (p) => {
  const f = useCurrentFrame();
  const g = ramp(f, p.gaugeAt, p.gaugeAt + 12, [0.6, 0, 0.3, 1]);
  const split = 373 + (160 - 373) * g; // media left edge
  const gl = f >= p.glitch[0] && f < p.glitch[1];
  const m = p.media.filter((x) => f >= x.at).pop() ?? p.media[0];
  const fill = ramp(f, p.gaugeAt, p.gaugeAt + p.gaugeDur, [0.15, 0.6, 0.3, 1]);
  const val = Math.round(p.count[0] + (p.count[1] - p.count[0]) * fill);
  const cap = (p.captions ?? []).filter((c) => f >= c[0]).pop();
  const texts = [...p.words.map((w) => w.text), ...(p.captions ?? []).map((c) => c[1])];
  // arc gauge geometry (circle seen from inside the corner)
  const C = {x: 360, y: 20, r: 452, w: 44};
  const a0 = 82; // deg, bottom end
  const a1 = -4; // top end
  const seg = p.segments;
  return (
    <Stage bg="#140f1c" texts={texts}>
      {/* left grid panel */}
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #19121f 0%, #22142a 100%)'}} />
      <svg width={852} height={480} style={{position: 'absolute', left: 0, top: 0}}>
        <rect x={0} y={0} width={72} height={72} fill="url(#vw-blue)" opacity={1 - g} />
        <defs>
          <linearGradient id="vw-blue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2a2fd8" />
            <stop offset="1" stopColor="#141a6a" />
          </linearGradient>
          <linearGradient id="vw-teal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4a9ab4" />
            <stop offset="1" stopColor="#2d5f75" />
          </linearGradient>
        </defs>
        {Array.from({length: 12}, (_, i) => (
          <line key={i} x1={0} x2={852} y1={i * 40 + 32} y2={i * 40 + 32} stroke="rgba(255,255,255,0.03)" />
        ))}
        {Array.from({length: 22}, (_, i) => (
          <line key={`v${i}`} y1={0} y2={480} x1={i * 40} x2={i * 40} stroke="rgba(255,255,255,0.03)" />
        ))}
        <line x1={73 - 300 * g} x2={73 - 300 * g} y1={0} y2={480} stroke={GRID} strokeWidth={1.2} />
        <line x1={split - 60} x2={split - 60} y1={0} y2={480} stroke={GRID} strokeWidth={1.2} opacity={1 - g} />
        <line x1={0} x2={split} y1={72} y2={72} stroke={GRID} strokeWidth={1.2} />
        <line x1={0} x2={split} y1={410} y2={410} stroke={GRID} strokeWidth={1.2} />
        <rect x={split - 60} y={410} width={60} height={70} fill="url(#vw-teal)" opacity={1 - g} />
      </svg>
      {p.words.map((w, i) => {
        const a = ramp(f, w.at, w.at + 10);
        if (a <= 0) return null;
        const y = 106 + i * 88;
        const out = g * -420;
        return (
          <div key={i} style={{position: 'absolute', left: 103 + out, top: y, opacity: a}}>
            <div style={{fontFamily: CJK, fontWeight: 900, fontSize: 46, letterSpacing: 2, color: `rgb(${150 + 105 * a},${150 + 105 * a},${160 + 95 * a})`, whiteSpace: 'nowrap', transform: `translateX(${(1 - a) * 10}px)`}}>{w.text}</div>
            <div style={{position: 'absolute', left: 175, top: -4, width: 12, height: 12, background: '#f4e17a', transform: `scale(${a})`}} />
            <div style={{position: 'absolute', left: -12, top: 52, width: 13, height: 13, background: '#3d2df0', transform: `scale(${a})`}} />
          </div>
        );
      })}
      {/* footage */}
      <div style={{position: 'absolute', left: split, top: 0, width: 852 - split, height: 480, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: (160 - 373) / 2 * (1 - g), top: 0, width: 692, height: 480}}>
          <Media w={692} h={480} kind={m.kind ?? 'sparks'} src={m.src} seed={m.seed ?? 1} f={f} pan={(f - m.at) / 120} />
        </div>
      </div>
      {/* gauge */}
      {g > 0 && (
        <svg width={852} height={480} style={{position: 'absolute', left: 0, top: 0}}>
          {Array.from({length: seg}, (_, i) => {
            const t0 = i / seg;
            if (t0 > fill) return null;
            const s0 = a0 + (a1 - a0) * t0;
            const s1 = a0 + (a1 - a0) * Math.min(fill, (i + 0.82) / seg);
            const pt = (ang: number, rr: number) => [C.x + Math.cos((ang * Math.PI) / 180) * rr, C.y + Math.sin((ang * Math.PI) / 180) * rr];
            const [x0, y0] = pt(s0, C.r);
            const [x1, y1] = pt(s1, C.r);
            const [x2, y2] = pt(s1, C.r + C.w);
            const [x3, y3] = pt(s0, C.r + C.w);
            return <path key={i} d={`M ${x0} ${y0} A ${C.r} ${C.r} 0 0 0 ${x1} ${y1} L ${x2} ${y2} A ${C.r + C.w} ${C.r + C.w} 0 0 1 ${x3} ${y3} Z`} fill="#1e5bff" stroke="#0a1f6e" strokeWidth={1.5} style={{filter: 'drop-shadow(0 0 4px rgba(40,100,255,0.6))'}} />;
          })}
        </svg>
      )}
      {g > 0 && (
        <div style={{position: 'absolute', left: 694, top: 330, opacity: g, display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'MontserratLocal'", fontWeight: 900, fontSize: 38, color: '#fff', textShadow: '0 0 10px rgba(255,255,255,0.6)'}}>
          <svg width={20} height={26} viewBox="0 0 20 26"><path d="M 10 1 L 19 12 L 13 12 L 13 25 L 7 25 L 7 12 L 1 12 Z" fill="#fff" /></svg>
          {val}
        </div>
      )}
      {g > 0 && <div style={{position: 'absolute', left: 160, width: 500, top: 422, height: 58, background: 'linear-gradient(90deg, rgba(60,140,170,0.75), rgba(30,60,90,0.25))', opacity: g}} />}
      {cap && <div style={{position: 'absolute', left: g > 0 ? 160 : split, width: g > 0 ? 500 : 852 - split, top: 438, textAlign: g > 0 ? 'center' : 'left', paddingLeft: g > 0 ? 0 : 20, fontFamily: CJK, fontWeight: 900, fontSize: 17, color: '#fff'}}>{cap[1]}</div>}
      {gl && (
        <div style={{position: 'absolute', inset: 0}}>
          {Array.from({length: 5}, (_, i) => {
            const k = (f * 7 + i * 13) % 17;
            return <div key={i} style={{position: 'absolute', left: (k - 8) * 30, top: i * 70 + (k % 3) * 10, width: 852, height: 30 + (k % 4) * 12, background: i % 3 === 0 ? 'rgba(40,60,255,0.32)' : i % 3 === 1 ? 'rgba(255,170,60,0.25)' : 'rgba(80,200,230,0.28)', mixBlendMode: 'screen'}} />;
          })}
        </div>
      )}
    </Stage>
  );
};
