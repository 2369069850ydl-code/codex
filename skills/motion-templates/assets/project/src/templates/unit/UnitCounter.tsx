import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, ramp} from '../_lib/anim';
import {Stage} from '../_lib/stage';

// Unit reveal + value-driven colour: a unit name resolves into a counter; each new value rolls in
// from above (the old one sinks and fades), markers slide along the two side scales, the
// background takes the colour of the value and a giant outlined word names the current range.

export type UnitCounterProps = {
  durationInFrames: number;
  unitName: string; // "开尔文"
  unitLatin: string; // "Kelvin"
  unit: string; // "K"
  steps: {at: number; value: number}[]; // first step replaces the unit name
  scale: number[]; // tick values, top to bottom
  stops: {value: number; color: string; bg: string}[]; // colour bar + background tint per value
  ranges: {from: number; to: number; word: string}[]; // giant outline word while value is in [from, to]
  captions?: [number, string][];
};

const TICK_Y = (i: number, n: number) => 8 + (i * 462) / (n - 1);

const lerpHex = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((k) => parseInt(a.slice(k, k + 2), 16));
  const pb = [1, 3, 5].map((k) => parseInt(b.slice(k, k + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(',')})`;
};

export const UnitCounter: React.FC<UnitCounterProps> = (p) => {
  const f = useCurrentFrame();
  const n = p.scale.length;
  const idx = p.steps.filter((s) => f >= s.at).length - 1;
  const cur = idx >= 0 ? p.steps[idx] : null;
  const prev = idx >= 1 ? p.steps[idx - 1] : null;
  const roll = cur ? ramp(f, cur.at, cur.at + 9, [0.2, 0.7, 0.2, 1]) : 0;
  const shown = cur ? (prev ? prev.value + (cur.value - prev.value) * roll : cur.value) : 0;
  // background tint from stops
  const sorted = [...p.stops].sort((a, b) => a.value - b.value);
  let bg = '#000000';
  if (cur) {
    const v = shown;
    let lo = sorted[0];
    let hi = sorted[sorted.length - 1];
    for (let i = 0; i < sorted.length - 1; i++) if (v >= sorted[i].value && v <= sorted[i + 1].value) [lo, hi] = [sorted[i], sorted[i + 1]];
    const t = hi.value === lo.value ? 0 : Math.min(1, Math.max(0, (v - lo.value) / (hi.value - lo.value)));
    bg = lerpHex(lo.bg, hi.bg, t);
  }
  const tint = cur ? ramp(f, p.steps[0].at, p.steps[0].at + 20) : 0;
  // marker y on the scale (piecewise between ticks)
  const markY = (() => {
    const v = shown;
    for (let i = 0; i < n - 1; i++) {
      const a = p.scale[i];
      const b = p.scale[i + 1];
      if ((v <= a && v >= b) || (v >= a && v <= b)) return TICK_Y(i, n) + ((v - a) / (b - a || 1)) * (TICK_Y(i + 1, n) - TICK_Y(i, n));
    }
    return TICK_Y(n - 1, n);
  })();
  const range = cur ? p.ranges.find((r) => cur.value >= r.from && cur.value <= r.to) : undefined;
  const rangeAt = range ? p.steps.find((s) => s.value >= range.from && s.value <= range.to)!.at : 0;
  const ra = range ? ramp(f, rangeAt, rangeAt + 12) : 0;
  const nameOut = p.steps.length ? ramp(f, p.steps[0].at, p.steps[0].at + 10) : 0;
  const latinA = ramp(f, 8, 20) * (1 - nameOut);
  const unitA = ramp(f, 12, 20);
  const glow = cur ? Math.max(0, 1 - Math.abs(f - (cur.at + 22)) / 8) : 0;
  const cap = (p.captions ?? []).filter((c) => f >= c[0]).pop();
  const texts = [p.unitName, ...p.ranges.map((r) => r.word), ...(p.captions ?? []).map((c) => c[1])];
  const grad = `linear-gradient(180deg, ${p.stops
    .slice()
    .sort((a, b) => b.value - a.value)
    .map((s, i, arr) => `${s.color} ${(i / (arr.length - 1)) * 100}%`)
    .join(', ')})`;
  const NUM: React.CSSProperties = {fontFamily: "'MontserratLocal'", fontWeight: 900, fontStyle: 'italic', fontSize: 34, letterSpacing: 9, color: '#e8e8e8', whiteSpace: 'nowrap'};
  return (
    <Stage bg="#000" texts={texts}>
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(80% 80% at 50% 50%, ${bg}, #050505)`, opacity: tint}} />
      <svg width={852} height={480} style={{position: 'absolute', left: 0, top: 0}}>
        {[0, 1, 2].map((i) => {
          const x = 200 + i * 230 + Math.sin(f * 0.03 + i * 2) * 10;
          return <path key={i} d={`M ${x} -10 C ${x + 80} 100, ${x - 90} 220, ${x + 20} 300 S ${x - 40} 450, ${x + 30} 500`} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1.2} />;
        })}
        <line x1={610} x2={610} y1={0} y2={480} stroke="rgba(255,255,255,0.12)" opacity={tint} />
      </svg>
      {range && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', fontFamily: CJK, fontWeight: 900, fontStyle: 'italic', fontSize: 230, letterSpacing: 40, color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.13)', opacity: ra, whiteSpace: 'nowrap', transform: `scale(${1.06 - 0.06 * ra})`}}>{range.word}</div>
      )}
      {/* side bars + scales */}
      {[0, 1].map((side) => (
        <React.Fragment key={side}>
          <div style={{position: 'absolute', left: side ? 819 : 0, top: 0, width: 33, height: 480, background: grad}} />
          {p.scale.map((v, i) => (
            <div key={i} style={{position: 'absolute', top: TICK_Y(i, n) - 7, ...(side ? {right: 38} : {left: 40}), fontFamily: "'MontserratLocal'", fontWeight: 500, fontSize: 11, letterSpacing: 1.5, color: 'rgba(255,255,255,0.45)', opacity: tint}}>{`${v}K`}</div>
          ))}
          {cur && <div style={{position: 'absolute', top: markY - 3, ...(side ? {right: 102} : {left: 102}), width: 0, height: 0, borderTop: '3px solid transparent', borderBottom: '3px solid transparent', ...(side ? {borderLeft: '4px solid #fff'} : {borderRight: '4px solid #fff'}), opacity: tint}} />}
        </React.Fragment>
      ))}
      {/* centre: unit name, then rolling numbers */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 216, height: 60}}>
        {nameOut < 1 && (
          <div style={{position: 'absolute', right: 452, top: -2 + nameOut * 56, fontFamily: CJK, fontWeight: 900, fontStyle: 'italic', fontSize: 24, letterSpacing: 9, color: '#fff', opacity: 1 - nameOut * 0.75, whiteSpace: 'nowrap'}}>{p.unitName}</div>
        )}
        <div style={{position: 'absolute', left: 404, top: 24 + nameOut * 50, fontFamily: "'MontserratLocal'", fontWeight: 500, fontStyle: 'italic', fontSize: 10, letterSpacing: 7, color: 'rgba(255,255,255,0.7)', opacity: latinA}}>{p.unitLatin}</div>
        <div style={{...NUM, position: 'absolute', left: 462, top: -8, opacity: unitA}}>[ {p.unit} ]</div>
        {cur && (
          <div style={{...NUM, position: 'absolute', right: 400, top: -8 - (1 - roll) * 56, opacity: roll, textShadow: glow > 0 ? `0 0 ${14 * glow}px rgba(255,255,255,${0.9 * glow})` : undefined}}>{cur.value}</div>
        )}
        {prev && roll < 1 && <div style={{...NUM, position: 'absolute', right: 400, top: -8 + roll * 60, opacity: 0.25 * (1 - roll) + 0.12, color: '#bbb'}}>{prev.value}</div>}
        {prev && roll >= 1 && f - cur!.at < 40 && <div style={{...NUM, position: 'absolute', right: 400, top: 52, opacity: 0.12 * (1 - (f - cur!.at) / 40) + 0.05, color: '#bbb'}}>{prev.value}</div>}
      </div>
      {cap && <div style={{position: 'absolute', left: 0, right: 0, top: 436, textAlign: 'center', fontFamily: CJK, fontWeight: 900, fontSize: 16, color: '#fff'}}>{cap[1]}</div>}
    </Stage>
  );
};
