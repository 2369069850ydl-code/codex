import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, ramp} from '../_lib/anim';
import {Stage} from '../_lib/stage';

// Three objects in the dark, answers revealed one by one: each label rises and its value types in
// below it (one can be emphasised with a glow). Optional extra shots explain why: a tilted camera
// screen whose menu scrolls to a setting, and a side view where the same lamps look different, with
// a monitor showing what the camera records. Lamps, menu and monitor are drawn.

export type Lamp = {label: string; value: string; x: number; color: string; alt?: string}; // alt: colour in the side shot
export type Shot = {kind: 'front' | 'menu' | 'side'; from: number; to: number};
export type LampTrioProps = {
  durationInFrames: number;
  lamps: Lamp[];
  reveal: {lamp: number; at: number; glow?: boolean}[]; // label rises, value types in 12f later
  revealed?: boolean; // all labels already up at frame 0 (no reveal animation)
  shots: Shot[];
  menu?: {title: string; values: string[]; from: number; to: number; scroll: [number, number]};
  title?: {text: string; at: number};
  captions?: [number, string][];
};

const LABEL_LOW = 247;
const LABEL_HIGH = 172;
const VALUE_Y = 222;

const Bulb: React.FC<{x: number; y: number; color: string; s?: number; pool?: number}> = ({x, y, color, s = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0}}>
    <div style={{position: 'absolute', left: -80 * s, top: -60 * s, width: 160 * s, height: 130 * s, background: `radial-gradient(closest-side, ${color}38, transparent)`}} />
    <div style={{position: 'absolute', left: -170 * s, top: 14 * s, width: 340 * s, height: 60 * s, background: `radial-gradient(closest-side, ${color}50, ${color}10 60%, transparent)`}} />
    <div style={{position: 'absolute', left: -15 * s, top: 12 * s, width: 30 * s, height: 50 * s, background: `linear-gradient(#ffffff, ${color}cc 40%, transparent)`, filter: `blur(${3 * s}px)`}} />
    <svg width={40 * s} height={60 * s} viewBox="-20 -36 40 60" style={{position: 'absolute', left: -20 * s, top: -36 * s, overflow: 'visible'}}>
      <path d="M -2 -36 L 2 -36 L 8 -10 L -8 -10 Z" fill="#596070" />
      <path d="M -8 -10 L 8 -10 L 9 -6 L -9 -6 Z" fill="#7d8494" />
      <rect x={-12} y={-6} width={24} height={20} rx={5} fill="#ffffff" style={{filter: `drop-shadow(0 0 4px ${color}) drop-shadow(0 0 10px ${color})`}} />
    </svg>
  </div>
);

const LBL: React.CSSProperties = {fontFamily: "'MontserratLocal'", fontWeight: 900, fontStyle: 'italic', color: '#fff', whiteSpace: 'nowrap', transform: 'translateX(-50%)', position: 'absolute'};

export const LampTrio: React.FC<LampTrioProps> = (p) => {
  const f = useCurrentFrame();
  const shotA = (s: Shot) => (f < s.from || f >= s.to ? 0 : Math.min(ramp(f, s.from, s.from + 8), 1 - ramp(f, s.to - 4, s.to)));
  const cap = (p.captions ?? []).filter((c) => f >= c[0]).pop();
  const texts = [p.menu?.title ?? '', p.title?.text ?? '', ...(p.captions ?? []).map((c) => c[1])];
  return (
    <Stage bg="#030303" texts={texts}>
      {p.shots.map((s, si) => {
        const a = shotA(s);
        if (a <= 0) return null;
        if (s.kind === 'front') {
          const titleA = p.title ? ramp(f, p.title.at, p.title.at + 14) : 0;
          return (
            <div key={si} style={{position: 'absolute', inset: 0, opacity: a}}>
              <div style={{position: 'absolute', left: 0, right: 0, top: 340, height: 140, background: 'linear-gradient(#0b0c10, #030303)'}} />
              {p.lamps.map((l, i) => {
                const r = p.reveal.find((x) => x.lamp === i);
                const up = p.revealed || !r ? 1 : ramp(f, r.at, r.at + 10, [0.3, 0.7, 0.3, 1]);
                const typed = p.revealed || !r ? l.value.length : Math.max(0, Math.floor((f - r.at - 12) / 2));
                const glow = r?.glow ? ramp(f, r.at, r.at + 8) : 0;
                const y = LABEL_LOW + (LABEL_HIGH - LABEL_LOW) * up;
                return (
                  <React.Fragment key={i}>
                    <Bulb x={l.x} y={332} color={l.color} />
                    <div style={{...LBL, left: l.x, top: y - 13 - glow * 8, fontSize: 22 + glow * 10, textShadow: glow ? `0 0 ${10 * glow}px #fff, 0 0 ${24 * glow}px rgba(255,255,255,${0.8 * glow})` : undefined}}>{l.label}</div>
                    <div style={{...LBL, left: l.x, top: VALUE_Y - 9, fontSize: 15, letterSpacing: 3, opacity: up}}>{l.value.slice(0, typed)}</div>
                  </React.Fragment>
                );
              })}
              {p.title && <div style={{position: 'absolute', left: 0, right: 0, top: 78, textAlign: 'center', fontFamily: CJK, fontWeight: 900, fontStyle: 'italic', fontSize: 19, color: '#fff', opacity: titleA}}>{p.title.text}</div>}
            </div>
          );
        }
        if (s.kind === 'menu' && p.menu) {
          const m = p.menu;
          const pos = m.scroll[0] + (m.scroll[1] - m.scroll[0]) * ramp(f, m.from, m.to, [0.45, 0, 0.3, 1]);
          const ROW = 15;
          const push = ramp(f, s.from, s.to, [0.3, 0, 0.7, 1]);
          return (
            <div key={si} style={{position: 'absolute', inset: 0, opacity: a}}>
              <div style={{position: 'absolute', left: 230, top: 40, width: 420, height: 380, borderRadius: 60, background: 'radial-gradient(closest-side, #15161a, transparent)', transform: 'rotate(-28deg)'}} />
              <div style={{position: 'absolute', left: 186, top: 120, width: 300, height: 205, transform: `perspective(700px) rotateZ(-27deg) rotateX(14deg) scale(${1 + push * 0.06})`, borderRadius: 6, background: '#121418', boxShadow: '0 0 0 5px #1c1d21, 0 20px 40px rgba(0,0,0,0.8)', overflow: 'hidden'}}>
                <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(60% 50% at 70% 55%, #2a2d33, #0e0f12)'}} />
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{position: 'absolute', left: 130 + i * 60, top: 118 - i * 18, width: 14, height: 14, borderRadius: 7, background: '#fff', boxShadow: `0 0 10px 4px ${p.lamps[i]?.color ?? '#fff'}aa`}} />
                ))}
                <div style={{position: 'absolute', left: 140, top: 6, width: 22, height: 9, borderRadius: 2, background: '#3ad13a'}} />
                <div style={{position: 'absolute', left: 10, top: 14, width: 80, height: 182, background: 'rgba(0,0,0,0.55)'}} />
                <div style={{position: 'absolute', left: 14, top: 18, fontFamily: CJK, fontSize: 9, color: '#ddd'}}>{m.title}</div>
                <div style={{position: 'absolute', left: 14, top: 34, width: 120, height: ROW * 9, overflow: 'hidden'}}>
                  {m.values.map((v, i) => (
                    <div key={v} style={{position: 'absolute', left: 6, top: (i - pos + 1) * ROW, fontFamily: "'MontserratLocal'", fontWeight: 600, fontSize: 9, color: '#e8e8e8'}}>{v}</div>
                  ))}
                </div>
                <div style={{position: 'absolute', left: 14, top: 34 + ROW - 2, width: 112, height: ROW + 1, border: '1.5px solid #d6a52a', borderRadius: 2}} />
              </div>
            </div>
          );
        }
        // side shot: lamps in perspective + monitor showing the recorded (neutral) image
        return (
          <div key={si} style={{position: 'absolute', inset: 0, opacity: a}}>
            <div style={{position: 'absolute', left: 0, right: 0, top: 316, height: 164, background: 'linear-gradient(#0b0a09, #020202)'}} />
            {p.lamps.map((l, i) => (
              <Bulb key={i} x={95 + i * 177} y={292 + i * 4} color={l.alt ?? l.color} s={0.75 - i * 0.04} />
            ))}
            <div style={{position: 'absolute', left: 592, top: 182, width: 176, height: 104, transform: 'perspective(500px) rotateY(-14deg)', background: '#0d0f13', boxShadow: '0 0 0 3px #222, 0 10px 30px rgba(0,0,0,0.9)', overflow: 'hidden'}}>
              <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(#1b2028, #0b0d11)'}} />
              {p.lamps.map((l, i) => (
                <div key={i} style={{position: 'absolute', left: 22 + i * 56, top: 38 + i * 2, width: 8, height: 6, borderRadius: 3, background: '#fff', boxShadow: `0 0 8px 3px ${l.color}`}} />
              ))}
              <div style={{position: 'absolute', left: 6, right: 6, top: 52, height: 1, background: 'rgba(160,190,255,0.35)'}} />
              <div style={{position: 'absolute', left: 60, bottom: 10, display: 'flex', gap: 3}}>
                {['#e44', '#fc3', '#3c6', '#39f'].map((c) => <i key={c} style={{width: 6, height: 6, borderRadius: 3, border: `1px solid ${c}`, display: 'inline-block'}} />)}
              </div>
            </div>
            <div style={{position: 'absolute', left: 500, top: 270, width: 70, height: 80, background: 'linear-gradient(#141414, #050505)', borderRadius: 4}} />
          </div>
        );
      })}
      {cap && cap[1] && <div style={{position: 'absolute', left: 0, right: 0, top: 438, textAlign: 'center', fontFamily: CJK, fontWeight: 900, fontSize: 19, color: '#fff'}}>{cap[1]}</div>}
    </Stage>
  );
};
