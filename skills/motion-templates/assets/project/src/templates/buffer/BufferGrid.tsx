import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, eased, K, ramp} from '../_lib/anim';
import {Stage} from '../_lib/stage';

// Rolling buffer to frozen clip: an app icon (spinning ring) shrinks into a small status panel;
// numbered frame thumbnails stack up above it row by row, then keep rolling (the buffer refreshes);
// a trigger freezes it (ring goes grey), the panel leaves, the grid comes forward and a range of
// frames is selected cell by cell.

export type BufferGridProps = {
  durationInFrames: number;
  cols: number;
  rows: number;
  countStart: number; // frame where frame #1 appears
  rate: number; // new frames per video frame
  trigger: number; // freeze frame (ring goes grey)
  panel: {right: string; rows: [string, string]}; // panel texts
  panelOut: number; // panel slides away, grid zooms
  zoom: K;
  select: {from: number; to: K}; // selected frame numbers: from..to(t)
  thumb?: 'flame' | 'none';
  captions?: [number, string][];
};

const CELL = 40;
const PITCH = 55;

const Ring: React.FC<{size: number; spin: number; grey: number}> = ({size, spin, grey}) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={{display: 'block', filter: `saturate(${1 - grey}) brightness(${1 - grey * 0.15})`}}>
    <defs>
      <linearGradient id="bg-ring" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#7a1cff" />
        <stop offset="0.5" stopColor="#1f5bff" />
        <stop offset="1" stopColor="#14d6ff" />
      </linearGradient>
    </defs>
    <g transform={`rotate(${spin})`}>
      <circle r={30} fill="none" stroke="url(#bg-ring)" strokeWidth={20} />
      <circle cx={-21} cy={21} r={10} fill="#fff" />
    </g>
  </svg>
);

export const Flame: React.FC<{seed: number}> = ({seed}) => {
  const s = Math.sin(seed * 1.7) * 2;
  return (
    <svg width={CELL} height={CELL} viewBox="0 0 40 40" style={{position: 'absolute', inset: 0}}>
      <defs>
        <radialGradient id="bf-glow" cx="0.5" cy="0.7" r="0.6">
          <stop offset="0" stopColor="#ffcf5a" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="#d47a18" stopOpacity="0.35" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={40} height={40} fill="url(#bf-glow)" />
      <path d={`M ${20 + s} 10 Q ${27 + s} 22 20 33 Q ${13 - s} 22 ${20 + s} 10 Z`} fill="#ffe08a" opacity={0.9} />
      <rect x={17} y={31} width={6} height={9} fill="#a96b2a" />
    </svg>
  );
};

export const BufferGrid: React.FC<BufferGridProps> = (p) => {
  const f = useCurrentFrame();
  const cap = p.cols * p.rows;
  const N = Math.max(0, Math.floor((Math.min(f, p.trigger) - p.countStart) * p.rate) + 1);
  const shown = Math.min(N, cap);
  const filledRows = Math.ceil(shown / p.cols);
  const rowsAnim = eased(f, [[p.countStart, 0], ...Array.from({length: p.rows}, (_, r) => [p.countStart + ((r * p.cols) / p.rate) + 4, r + 1] as [number, number])]);
  const icon = ramp(f, 8, 26, [0.5, 0, 0.2, 1]); // big icon -> panel slot
  const panelOpen = ramp(f, 12, 28, [0.3, 0.7, 0.2, 1]);
  const out = ramp(f, p.panelOut, p.panelOut + 12, [0.5, 0, 0.5, 1]);
  const z = eased(f, p.zoom);
  const grey = ramp(f, p.trigger, p.trigger + 6);
  const spin = (Math.min(f, p.trigger) * 9) % 360;
  // vertical layout: grid block above the panel, both centred
  const gridH = (rowsAnim > 0 ? rowsAnim * PITCH - (PITCH - CELL) : 0) * (1 - out) + (p.rows * PITCH - (PITCH - CELL)) * out;
  const panelH = 82;
  const gap = rowsAnim > 0 ? 26 * (1 - out) : 0;
  const total = gridH + gap + panelH * (1 - out);
  const top0 = 240 - total / 2;
  const gridBottom = top0 + gridH;
  const panelY = gridBottom + gap + out * 120;
  const gridW = p.cols * PITCH - (PITCH - CELL);
  const gx = 426 - gridW / 2;
  const selTo = eased(f, p.select.to);
  const cap2 = (p.captions ?? []).filter((c) => f >= c[0]).pop();
  const texts = [...(p.captions ?? []).map((c) => c[1])];
  const iconSize = 190 - icon * 120;
  const iconX = 426 - iconSize / 2 + icon * (243 + 35 - 426);
  const iconY = 240 - iconSize / 2 + icon * (panelY + 41 - 240);
  return (
    <Stage bg="#1c1e25" texts={texts}>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(60% 50% at 40% 45%, #3a3d48 0%, #262832 55%, #16171c 100%)'}} />
      {[[120, 20, 140], [520, -10, 120], [700, 80, 90], [260, 420, 160]].map(([x, y, r], i) => (
        <div key={i} style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, background: 'radial-gradient(closest-side, rgba(150,160,190,0.12), transparent)'}} />
      ))}
      {/* grid */}
      <div style={{position: 'absolute', left: 0, top: 0, width: 852, height: 480, transform: `scale(${z})`, transformOrigin: `426px ${top0 + gridH / 2}px`}}>
        {Array.from({length: shown}, (_, k) => {
          const r = Math.floor(k / p.cols); // 0 = bottom row
          const c = p.cols - 1 - (k % p.cols);
          const num = N > cap ? k + 1 + (N - cap) : k + 1;
          const born = p.countStart + k / p.rate;
          const a = N > cap ? 1 : ramp(f, born, born + 6);
          const y = gridBottom - CELL - r * PITCH;
          const sel = num >= p.select.from && num <= selTo;
          return (
            <div key={k} style={{position: 'absolute', left: gx + c * PITCH, top: y, width: CELL, height: CELL, opacity: a, filter: a < 1 ? `blur(${(1 - a) * 3}px)` : undefined, background: sel ? '#a9dade' : '#3b4a4f', borderRadius: 2, overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.4)'}}>
              {p.thumb !== 'none' && <div style={{position: 'absolute', inset: 0, opacity: sel ? 0.35 : 1}}><Flame seed={num} /></div>}
              <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'MontserratLocal'", fontWeight: 900, fontSize: num > 99 ? 15 : 18, letterSpacing: -0.5, color: sel ? 'rgba(255,255,255,0.75)' : '#f1d9a6', textShadow: '0 1px 2px rgba(0,0,0,0.6)'}}>{num}</div>
            </div>
          );
        })}
      </div>
      {/* status panel */}
      {out < 1 && (
        <div style={{position: 'absolute', left: 243, top: panelY, width: 70 + 300 * panelOpen, height: panelH, borderRadius: 4, background: '#0c1488', boxShadow: '0 0 0 1px rgba(80,110,255,0.35), 0 10px 30px rgba(0,0,0,0.45)', opacity: Math.min(1, panelOpen * 2) * (1 - out), overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 82, top: 18, fontFamily: "'MontserratLocal'", fontWeight: 600, fontSize: 15, letterSpacing: 1.5, color: '#fff', lineHeight: '26px', whiteSpace: 'nowrap'}}>
            <div>{p.panel.rows[0]}</div>
            <div>{p.panel.rows[1]}</div>
          </div>
          <div style={{position: 'absolute', left: 182, top: 18, fontFamily: "'MontserratLocal'", fontWeight: 600, fontSize: 15, letterSpacing: 2, color: '#fff', whiteSpace: 'nowrap'}}>{p.panel.right}</div>
          <div style={{position: 'absolute', left: 182, top: 53, width: 170, height: 1.5, background: '#c9d0ff'}} />
          <div style={{position: 'absolute', left: 350, top: 46, width: 1.5, height: 16, background: '#c9d0ff'}} />
        </div>
      )}
      {/* icon: big card -> panel slot */}
      {out < 1 && (
        <div style={{position: 'absolute', left: iconX, top: iconY, width: iconSize, height: iconSize, background: '#1b1c20', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 1 - out}}>
          <Ring size={iconSize * 0.86} spin={spin} grey={grey} />
        </div>
      )}
      {cap2 && cap2[1] && <div style={{position: 'absolute', left: 0, right: 0, top: 438, textAlign: 'center', fontFamily: CJK, fontWeight: 900, fontSize: 19, color: '#fff'}}>{cap2[1]}</div>}
    </Stage>
  );
};
