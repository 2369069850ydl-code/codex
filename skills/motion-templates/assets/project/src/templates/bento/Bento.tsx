import React from 'react';
import {CJK, eased, K, rng} from '../_lib/anim';

// Bento-grid world: flat tiles (paper white, ink black, electric blue) with 2px ink borders and a few
// decorative illustrations, viewed by a 2D camera (centre + zoom). Content goes into one focus tile.

export type Tile = {x: number; y: number; w: number; h: number; fill: 'w' | 'k' | 'b'; deco?: 'planet' | 'dot' | 'bars' | 'letters' | 'label' | 'lines'; text?: string};
export type Cam = {t: number; x: number; y: number; z: number};

export const INK = '#111114';
export const BLUE = '#3d3cf2';
export const PAPER = '#efefef';

const Planet: React.FC<{w: number; h: number}> = ({w, h}) => (
  <svg width={w} height={h} viewBox="0 0 184 258" preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', inset: 0}}>
    <ellipse cx={92} cy={222} rx={44} ry={11} fill={INK} />
    <g transform="rotate(38 92 120)" fill="none" stroke={INK} strokeWidth={2}>
      <ellipse cx={92} cy={120} rx={95} ry={32} />
      <ellipse cx={92} cy={120} rx={80} ry={24} />
    </g>
    <circle cx={110} cy={130} r={26} fill="#fff" stroke={INK} strokeWidth={2.5} />
    <path d="M 92 140 A 26 26 0 0 0 132 145" fill="none" stroke={INK} strokeWidth={4} />
    <circle cx={34} cy={88} r={8} fill="#fff" />
    <circle cx={58} cy={165} r={13} fill="#fff" />
    <circle cx={150} cy={182} r={6} fill="#fff" />
    <circle cx={165} cy={162} r={4} fill="#fff" />
    <rect x={10} y={245} width={40} height={3} fill="#fff" />
    <rect x={6} y={240} width={6} height={6} fill={INK} />
  </svg>
);

const Deco: React.FC<{t: Tile; f: number}> = ({t, f}) => {
  if (t.deco === 'planet') return <Planet w={t.w} h={t.h} />;
  if (t.deco === 'dot') {
    const r = Math.min(t.w, t.h) * 0.42;
    const a = f * 0.03;
    return (
      <svg width={t.w} height={t.h} style={{position: 'absolute', inset: 0}}>
        <circle cx={t.w / 2} cy={t.h / 2} r={r} fill={PAPER} />
        <circle cx={t.w / 2} cy={t.h / 2} r={r * 0.3} fill={BLUE} />
        <line x1={t.w / 2} y1={t.h / 2} x2={t.w / 2 + Math.cos(a) * r * 0.85} y2={t.h / 2 + Math.sin(a) * r * 0.85} stroke={INK} strokeWidth={1.5} />
        <circle cx={t.w / 2 + Math.cos(a) * r * 0.85} cy={t.h / 2 + Math.sin(a) * r * 0.85} r={r * 0.12} fill={INK} />
      </svg>
    );
  }
  if (t.deco === 'bars') {
    const R = rng(Math.round(t.x + t.y));
    return (
      <div style={{position: 'absolute', inset: 0}}>
        {[0, 1, 2].map((i) => {
          const a = 0.15 + R() * 0.4;
          return (
            <div key={i} style={{position: 'absolute', left: t.w * 0.08, right: t.w * 0.08, top: t.h * (0.08 + i * 0.2), height: t.h * 0.12, display: 'flex', gap: 6}}>
              <div style={{flex: a, background: INK}} />
              <div style={{flex: 0.25, background: BLUE}} />
              <div style={{flex: 1 - a, background: i === 1 ? INK : 'transparent'}} />
            </div>
          );
        })}
        <div style={{position: 'absolute', left: t.w * 0.25, right: t.w * 0.25, bottom: t.h * 0.08, height: t.h * 0.12, background: BLUE, color: '#fff', fontFamily: "'MontserratLocal'", fontWeight: 700, fontSize: t.h * 0.09, letterSpacing: 3, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{t.text ?? 'LIDAR'}</div>
      </div>
    );
  }
  if (t.deco === 'letters') {
    const s = (t.text ?? 'LIDAR').split('');
    return (
      <div style={{position: 'absolute', inset: 0}}>
        {s.map((c, i) => {
          const ang = (i / s.length) * Math.PI * 2 + f * 0.02;
          return <div key={i} style={{position: 'absolute', left: t.w / 2 + Math.cos(ang) * t.w * 0.3 - 6, top: t.h / 2 + Math.sin(ang) * t.h * 0.3 - 8, fontFamily: "'MontserratLocal'", fontWeight: 700, fontSize: 15, color: INK, transform: `rotate(${(ang * 180) / Math.PI + 90}deg)`}}>{c}</div>;
        })}
      </div>
    );
  }
  if (t.deco === 'label') return <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'MontserratLocal'", fontWeight: 700, fontSize: Math.min(16, t.h * 0.3), letterSpacing: 3, color: t.fill === 'w' ? INK : '#fff'}}>{t.text}</div>;
  if (t.deco === 'lines')
    return (
      <div style={{position: 'absolute', right: 8, top: 10, width: t.w * 0.5}}>
        <div style={{height: 4, background: t.fill === 'w' ? INK : INK, marginBottom: 6}} />
        <div style={{height: 2, background: '#fff', width: '70%', marginLeft: '30%'}} />
      </div>
    );
  return null;
};

export const camAt = (f: number, cam: Cam[]) => {
  const k = (s: (c: Cam) => number): K => cam.map((c) => [c.t, s(c)]);
  return {x: eased(f, k((c) => c.x)), y: eased(f, k((c) => c.y)), z: Math.exp(eased(f, k((c) => Math.log(c.z))))};
};

/** World of tiles under a camera; children are drawn in world coordinates on top of the tiles. */
export const BentoWorld: React.FC<{f: number; tiles: Tile[]; cam: Cam[]; children?: React.ReactNode}> = ({f, tiles, cam, children}) => {
  const c = camAt(f, cam);
  return (
    <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, transform: `translate(426px, 240px) scale(${c.z}) translate(${-c.x}px, ${-c.y}px)`, transformOrigin: '0 0'}}>
        {tiles.map((t, i) => (
          <div key={i} style={{position: 'absolute', left: t.x, top: t.y, width: t.w, height: t.h, background: t.fill === 'w' ? PAPER : t.fill === 'k' ? INK : BLUE, boxShadow: `inset 0 0 0 1.5px ${INK}`, overflow: 'hidden'}}>
            <Deco t={t} f={f} />
          </div>
        ))}
        {children}
      </div>
    </div>
  );
};

export const BentoCaption: React.FC<{text?: string}> = ({text}) =>
  text ? <div style={{position: 'absolute', left: 0, right: 0, top: 438, textAlign: 'center', fontFamily: CJK, fontWeight: 900, fontSize: 19, color: '#fff', textShadow: '0 0 3px rgba(0,0,0,0.55), 0 1px 2px rgba(0,0,0,0.5)'}}>{text}</div> : null;

/** Visible spectrum as a CSS gradient (violet -> red), optional black IR tail fraction. */
export const SPECTRUM = 'linear-gradient(90deg, #3a1a6e 0%, #5a1fc4 6%, #2a3cf0 18%, #18a7f5 30%, #1fd36a 44%, #c6f01e 56%, #ffe414 64%, #ff8a14 76%, #f2241c 88%, #8a0f12 96%, #2a0606 100%)';
