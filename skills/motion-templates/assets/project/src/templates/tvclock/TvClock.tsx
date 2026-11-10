import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, eased, K, ramp} from '../_lib/anim';
import {Stage} from '../_lib/stage';

// "Real time vs playback time": a TV shows a typed sentence whose key value rolls in and gets a
// highlight; the TV shrinks aside while a panel of the real-world subject (an antique clock, drawn)
// slides in with a "real capture" tag; then the TV turns into a player that plays the same subject
// with a time bar that crawls (1 s of capture = minutes of playback).

export type Rect = {x: number; y: number; w: number; h: number};
export type TvClockProps = {
  durationInFrames: number;
  lines: string[]; // sentence lines; the last line ends with the value
  value: {text: string; suffix: string; end: string; countFrom: number; countTo: number; at: number; land: number; suffixAt: number; endAt: number};
  tv: [number, Rect][]; // TV rectangle keys (design space)
  panelX: K; // left edge of the subject panel (852 = off-screen)
  tag: string; // "实际拍摄: 1S"
  playerAt: number; // TV screen turns into the player
  playTime: [number, number][]; // [frame, seconds] keys for the player clock
  total: string; // "2:30"
  hand: K; // second hand angle (deg) keys
  captions?: [number, string][];
};

const BASE: Rect = {x: 95, y: 30, w: 670, h: 410};
const lerpRect = (f: number, keys: [number, Rect][]): Rect => {
  const k = (sel: (r: Rect) => number): K => keys.map(([t, r]) => [t, sel(r)]);
  return {x: eased(f, k((r) => r.x)), y: eased(f, k((r) => r.y)), w: eased(f, k((r) => r.w)), h: eased(f, k((r) => r.h))};
};

/** Antique clock face, drawn. `cx, cy, r` in local px; only the part inside the parent clip shows. */
export const ClockFace: React.FC<{cx: number; cy: number; r: number; hand: number; id: string}> = ({cx, cy, r, hand, id}) => {
  const roman = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  const ticks = Array.from({length: 60}, (_, i) => i);
  const pt = (deg: number, rr: number) => [cx + Math.sin((deg * Math.PI) / 180) * rr, cy - Math.cos((deg * Math.PI) / 180) * rr];
  return (
    <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      <defs>
        <radialGradient id={`${id}-dial`} cx={cx} cy={cy} r={r * 1.1} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f3e3bf" />
          <stop offset="0.7" stopColor="#e2cc9c" />
          <stop offset="1" stopColor="#b89566" />
        </radialGradient>
        <radialGradient id={`${id}-shade`} cx={cx + r * 0.3} cy={cy - r * 0.5} r={r * 1.3} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff6dc" stopOpacity="0.35" />
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#2a1a0c" stopOpacity="0.55" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="#2a1d12" />
      <circle cx={cx} cy={cy} r={r * 1.12} fill="#5a3a20" />
      <circle cx={cx} cy={cy} r={r * 1.06} fill="#7b5230" />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-dial)`} />
      {/* minute track */}
      <circle cx={cx} cy={cy} r={r * 0.93} fill="none" stroke="#2b2a26" strokeWidth={r * 0.006} />
      <circle cx={cx} cy={cy} r={r * 0.88} fill="none" stroke="#2b2a26" strokeWidth={r * 0.006} />
      {ticks.map((i) => {
        const [x1, y1] = pt(i * 6, r * 0.88);
        const [x2, y2] = pt(i * 6, r * 0.93);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2b2a26" strokeWidth={i % 5 ? r * 0.006 : r * 0.016} />;
      })}
      {roman.map((t, i) => {
        const [x, y] = pt(i * 30, r * 0.7);
        return (
          <text key={t} x={x} y={y} fill="#22262a" fontFamily="MontserratLocal" fontWeight={600} fontSize={r * 0.2} textAnchor="middle" dominantBaseline="central" transform={`rotate(${i * 30} ${x} ${y})`} style={{letterSpacing: -r * 0.01}}>
            {t}
          </text>
        );
      })}
      {/* small seconds dial */}
      <circle cx={cx} cy={cy} r={r * 0.42} fill="none" stroke="#3a3328" strokeWidth={r * 0.005} />
      {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((s) => {
        const [x, y] = pt(s * 6, r * 0.36);
        return (
          <text key={s} x={x} y={y} fill="#3a3328" fontFamily="MontserratLocal" fontWeight={600} fontSize={r * 0.05} textAnchor="middle" dominantBaseline="central">
            {s === 0 ? 60 : s}
          </text>
        );
      })}
      {Array.from({length: 60}, (_, i) => {
        const [x1, y1] = pt(i * 6, r * 0.42);
        const [x2, y2] = pt(i * 6, r * 0.44);
        return <line key={`s${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3a3328" strokeWidth={r * 0.004} />;
      })}
      {/* hands */}
      {(() => {
        const [hx, hy] = pt(hand, r * 0.98);
        const [tx, ty] = pt(hand + 180, r * 0.12);
        const [mx, my] = pt(28, r * 0.6);
        return (
          <g>
            <line x1={cx} y1={cy} x2={mx} y2={my} stroke="#16130f" strokeWidth={r * 0.022} strokeLinecap="round" />
            <line x1={tx} y1={ty} x2={hx} y2={hy} stroke="#16130f" strokeWidth={r * 0.008} strokeLinecap="round" />
            <circle cx={cx} cy={cy} r={r * 0.05} fill="#1b2226" />
            <circle cx={cx - r * 0.012} cy={cy - r * 0.015} r={r * 0.02} fill="#3c4a52" />
          </g>
        );
      })()}
      <circle cx={cx} cy={cy} r={r * 1.06} fill={`url(#${id}-shade)`} />
    </svg>
  );
};

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export const TvClock: React.FC<TvClockProps> = (p) => {
  const f = useCurrentFrame();
  const tv = lerpRect(f, p.tv);
  const k = tv.w / BASE.w;
  const v = p.value;
  // big rolling number flying into the line
  const fly = ramp(f, v.at, v.land, [0.5, 0, 0.3, 1]);
  const count = Math.round(v.countFrom + (v.countTo - v.countFrom) * ramp(f, v.at, v.land - 4, [0.3, 0.6, 0.4, 1]));
  const landed = f >= v.land;
  const suffixN = Math.max(0, Math.min(v.suffix.length, Math.floor((f - v.suffixAt) / 3) + 1));
  const endShown = f >= v.endAt;
  const hl = ramp(f, v.land + 2, v.endAt, [0.3, 0.7, 0.3, 1]);
  const cursor = !endShown && Math.floor(f / 8) % 2 === 0;
  const player = ramp(f, p.playerAt, p.playerAt + 10);
  const secs = eased(f, p.playTime.map(([a, b]) => [a, b]) as K, (x) => x);
  const hand = eased(f, p.hand, (x) => x);
  const prog = secs / (parseInt(p.total.split(':')[0]) * 60 + parseInt(p.total.split(':')[1]));
  const px = eased(f, p.panelX);
  const cap = (p.captions ?? []).filter((c) => f >= c[0]).pop();
  const texts = [...p.lines, v.suffix, v.end, p.tag, ...(p.captions ?? []).map((c) => c[1])];
  const TXT: React.CSSProperties = {fontFamily: CJK, fontWeight: 500, fontSize: 21, color: '#f2f2f2', letterSpacing: 0.4, whiteSpace: 'nowrap', lineHeight: '46px'};
  return (
    <Stage bg="#1d2029" texts={texts}>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(70% 90% at 35% 40%, #3a3f52 0%, #262a37 55%, #15171e 100%)'}} />
      <div style={{position: 'absolute', left: -60, top: -40, width: 520, height: 300, background: 'radial-gradient(closest-side, rgba(120,130,160,0.18), transparent)'}} />
      {/* TV */}
      <div style={{position: 'absolute', left: tv.x, top: tv.y, width: BASE.w, height: BASE.h, transform: `scale(${k})`, transformOrigin: '0 0'}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: 6, background: 'linear-gradient(160deg, #4a4446 0%, #2b2729 40%, #1c1a1b 100%)', boxShadow: '0 24px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.18)'}} />
        <div style={{position: 'absolute', left: 32, top: 30, right: 32, bottom: 40, background: '#0f110e', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)', overflow: 'hidden'}}>
          {/* sentence */}
          <div style={{position: 'absolute', left: 0, right: 0, top: 112, textAlign: 'center', opacity: 1 - player}}>
            {p.lines.map((l, i) => (
              <div key={i} style={TXT}>
                {l}
                {i === p.lines.length - 1 && (
                  <span style={{position: 'relative'}}>
                    <span style={{position: 'absolute', left: -2, top: 8, height: 30, width: `calc(${hl * 100}% + 4px)`, background: '#f6a63a', borderRadius: 2}} />
                    <span style={{position: 'relative', fontFamily: "'MontserratLocal'", fontWeight: 900, color: '#ffe3b0', opacity: landed ? 1 : 0}}>{v.text}</span>
                    <span style={{position: 'relative', color: '#fff6e8'}}>{v.suffix.slice(0, f >= v.suffixAt ? suffixN : 0)}</span>
                  </span>
                )}
                {i === p.lines.length - 1 && endShown && v.end}
                {i === p.lines.length - 1 && cursor && <span style={{fontWeight: 300, marginLeft: 6}}>|</span>}
              </div>
            ))}
          </div>
          {!landed && f >= v.at - 20 && (
            <div style={{position: 'absolute', left: 300 + fly * 170, top: 150 - fly * -20, fontFamily: "'MontserratLocal'", fontWeight: 900, fontSize: 92 - fly * 70, color: '#c9c9c9', opacity: 0.55 + 0.3 * fly, filter: `blur(${(1 - fly) * 1.5}px)`, transform: 'translate(-50%, -50%)', whiteSpace: 'nowrap'}}>{count}</div>
          )}
          {/* player */}
          {player > 0 && (
            <div style={{position: 'absolute', inset: 0, opacity: player}}>
              <ClockFace cx={40} cy={470} r={480} hand={hand} id="tvc" />
              <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 46, background: 'linear-gradient(transparent, rgba(0,0,0,0.85))'}} />
              <div style={{position: 'absolute', left: 18, right: 18, bottom: 12, height: 20, display: 'flex', alignItems: 'center', gap: 14, color: '#fff', fontFamily: "'MontserratLocal'", fontWeight: 600, fontSize: 14}}>
                <span style={{fontSize: 13}}>⏮</span>
                <span style={{display: 'inline-flex', gap: 4}}>
                  <i style={{width: 4, height: 15, background: '#fff', display: 'inline-block'}} />
                  <i style={{width: 4, height: 15, background: '#fff', display: 'inline-block'}} />
                </span>
                <span style={{fontSize: 13}}>⏭</span>
                <span>{fmt(secs)}</span>
                <div style={{position: 'relative', flex: 1, height: 3, background: 'rgba(255,255,255,0.75)', borderRadius: 2}}>
                  <div style={{position: 'absolute', left: `${prog * 100}%`, top: -6, width: 15, height: 15, marginLeft: -7, borderRadius: 8, background: '#e9e9e9', boxShadow: '0 1px 3px rgba(0,0,0,0.6)'}} />
                </div>
                <span>{p.total}</span>
              </div>
            </div>
          )}
          {/* glass reflection */}
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(115deg, transparent 0 62%, rgba(255,255,255,0.07) 62% 100%)'}} />
        </div>
        {/* gear + LED */}
        <svg width={22} height={22} viewBox="-11 -11 22 22" style={{position: 'absolute', left: BASE.w / 2 - 11, top: BASE.h - 31}}>
          <circle r={5} fill="none" stroke="#9a9a9a" strokeWidth={3} strokeDasharray="2.2 1.4" />
          <circle cx={5} cy={5} r={3} fill="none" stroke="#9a9a9a" strokeWidth={2} strokeDasharray="1.6 1" />
        </svg>
        <div style={{position: 'absolute', right: 16, bottom: 16, width: 4, height: 4, borderRadius: 2, background: '#9cff5a', boxShadow: '0 0 6px #9cff5a'}} />
      </div>
      {/* subject panel */}
      {px < 852 && (
        <div style={{position: 'absolute', left: px, top: 0, width: 852 - px, height: 480, overflow: 'hidden', boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'}}>
          <ClockFace cx={30} cy={455} r={500} hand={hand} id="pnl" />
          <div style={{position: 'absolute', left: 18, top: 10, fontFamily: CJK, fontWeight: 900, fontSize: 16, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.8)', whiteSpace: 'nowrap'}}>{p.tag}</div>
        </div>
      )}
      {cap && cap[1] && <div style={{position: 'absolute', left: 0, right: 0, top: 438, textAlign: 'center', fontFamily: CJK, fontWeight: 900, fontSize: 19, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.7)'}}>{cap[1]}</div>}
    </Stage>
  );
};
