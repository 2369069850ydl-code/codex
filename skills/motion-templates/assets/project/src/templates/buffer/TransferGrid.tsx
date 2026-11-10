import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, eased, K, ramp} from '../_lib/anim';
import {Stage} from '../_lib/stage';
import {Flame} from './BufferGrid';

// Fill a fast store, then copy it to a big one: a "memory" label becomes the base bar of a grid of
// numbered frames that fills row by row; a "disk" panel slides in with a usage percentage; frames
// are copied in order (cells turn cyan) while the percentage counts up and a level bar rises.

export type TransferGridProps = {
  durationInFrames: number;
  cols: number;
  rows: number;
  source: string; // "内存"
  target: string; // "硬盘"
  capacity: string; // big faint word on the target panel, "2TB"
  usedLabel: string; // "已使用"
  fill: {start: number; rate: number};
  copied: K; // cells copied over time
  pctPerCell: number;
  barAt: number; // label box -> bar
  zoom: {t: number; z: number; x: number; y: number}[]; // camera on the layout (centre point)
  captions?: [number, string][];
};

const CELL = 42;
const PITCH = 48;
const GX = 62; // grid left (layout space)
const GB = 372; // grid bottom
const PX = 555; // disk panel
const PW = 242;

export const TransferGrid: React.FC<TransferGridProps> = (p) => {
  const f = useCurrentFrame();
  const total = p.cols * p.rows;
  const n = Math.max(0, Math.min(total, Math.floor((f - p.fill.start) * p.fill.rate) + 1));
  const cp = Math.max(0, eased(f, p.copied, (x) => x));
  const pct = Math.floor(cp) * p.pctPerCell;
  const bar = ramp(f, p.barAt, p.barAt + 14, [0.5, 0, 0.2, 1]);
  const panelIn = ramp(f, p.barAt + 4, p.barAt + 18, [0.2, 0.7, 0.2, 1]);
  const k = (s: (z: TransferGridProps['zoom'][number]) => number): K => p.zoom.map((z) => [z.t, s(z)]);
  const z = eased(f, k((c) => c.z));
  const cx = eased(f, k((c) => c.x));
  const cy = eased(f, k((c) => c.y));
  const cap = (p.captions ?? []).filter((c) => f >= c[0]).pop();
  const texts = [p.source.split('').join(' '), p.target.split('').join(' '), p.capacity, p.usedLabel, ...(p.captions ?? []).map((c) => c[1])];
  const gw = p.cols * PITCH - (PITCH - CELL);
  // label box (centre) -> bar under the grid
  const bx = 252 + (GX - 252) * bar;
  const by = 185 + (GB + 14 - 185) * bar;
  const bw = 355 + (gw - 355) * bar;
  const bh = 92 + (26 - 92) * bar;
  return (
    <Stage bg="#1d1f26" texts={texts}>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(70% 60% at 45% 40%, #3b3e49 0%, #272932 55%, #17181d 100%)'}} />
      <div style={{position: 'absolute', left: 0, top: 0, width: 852, height: 480, transform: `translate(426px, 240px) scale(${z}) translate(${-cx}px, ${-cy}px)`, transformOrigin: '0 0'}}>
        {Array.from({length: n}, (_, i) => {
          const r = Math.floor(i / p.cols);
          const c = p.cols - 1 - (i % p.cols);
          const born = p.fill.start + i / p.fill.rate;
          const a = ramp(f, born, born + 6);
          const copied = i < Math.floor(cp);
          const ca = copied ? 1 : i < cp ? cp - Math.floor(cp) : 0;
          return (
            <div key={i} style={{position: 'absolute', left: GX + c * PITCH, top: GB - CELL - r * PITCH, width: CELL, height: CELL, opacity: a, filter: a < 1 ? `blur(${(1 - a) * 3}px)` : undefined, background: '#3b4a4f', borderRadius: 2, overflow: 'hidden'}}>
              <Flame seed={i + 1} />
              <div style={{position: 'absolute', inset: 0, background: '#a9dade', opacity: ca * 0.92}} />
              <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'MontserratLocal'", fontWeight: 900, fontSize: 20, letterSpacing: -0.5, color: ca > 0.5 ? 'rgba(255,255,255,0.7)' : '#f1d9a6', textShadow: '0 1px 2px rgba(0,0,0,0.5)'}}>{i + 1}</div>
            </div>
          );
        })}
        {/* source label -> bar */}
        <div style={{position: 'absolute', left: bx, top: by, width: bw, height: bh, borderRadius: 4, background: '#0d1150', boxShadow: '0 0 0 1px rgba(90,110,255,0.25)', overflow: 'hidden'}}>
          <div style={{position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(120,140,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(120,140,255,0.08) 1px, transparent 1px)', backgroundSize: '12px 12px', opacity: 1 - bar}} />
          <div style={{position: 'absolute', left: 110 * bar, top: 0, right: 0, bottom: 0, background: '#0e1a9a', opacity: bar}} />
          <div style={{position: 'absolute', left: bar * 22 + (1 - bar) * 0, width: bar ? undefined : '100%', top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: bar > 0.5 ? 'flex-start' : 'center', right: bar > 0.5 ? undefined : 0, fontFamily: CJK, fontWeight: 900, fontSize: 40 - 26 * bar, letterSpacing: 10 - 4 * bar, color: '#e8e8f0'}}>{p.source.split('').join(' ')}</div>
          <div style={{position: 'absolute', left: 118, top: bh / 2 - 0.75, width: (bw - 140) * ramp(f, p.barAt + 10, p.barAt + 30), height: 1.5, background: '#c8ceff', opacity: bar}} />
          <div style={{position: 'absolute', left: 118 + (bw - 140) * ramp(f, p.barAt + 10, p.barAt + 30) - 8, top: bh / 2 - 6, width: 9, height: 9, borderRight: '1.5px solid #c8ceff', borderTop: '1.5px solid #c8ceff', transform: 'rotate(45deg)', opacity: bar}} />
        </div>
        {/* target panel */}
        <div style={{position: 'absolute', left: PX + (1 - panelIn) * 320, top: 34, width: PW, height: 336, background: '#1e1f23', borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 6, textAlign: 'center', fontFamily: "'MontserratLocal'", fontWeight: 900, fontSize: 86, color: 'rgba(255,255,255,0.06)'}}>{p.capacity}</div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 128, textAlign: 'center', fontFamily: CJK, fontWeight: 900, fontSize: 22, letterSpacing: 4, color: '#d7d7d7'}}>{p.usedLabel}</div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 160, textAlign: 'center', fontFamily: "'MontserratLocal'", fontWeight: 900, fontSize: 40, letterSpacing: 2, color: '#d7d7d7'}}>{pct.toFixed(2)}%</div>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: Math.max(2, (pct / 100) * 336), background: '#19b4f0', opacity: pct > 0 ? 1 : 0.4}} />
        </div>
        <div style={{position: 'absolute', left: PX + (1 - panelIn) * 320, top: GB + 14, width: PW, height: 26, borderRadius: 3, background: '#0d1150', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: CJK, fontWeight: 900, fontSize: 14, letterSpacing: 6, color: '#d7d7e8'}}>{p.target.split('').join(' ')}</div>
      </div>
      {cap && cap[1] && <div style={{position: 'absolute', left: 0, right: 0, top: 438, textAlign: 'center', fontFamily: CJK, fontWeight: 900, fontSize: 19, color: '#fff'}}>{cap[1]}</div>}
    </Stage>
  );
};
