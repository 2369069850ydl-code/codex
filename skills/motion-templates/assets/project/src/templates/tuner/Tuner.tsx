import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {CJK, eased, K, keyed, stag} from '../_lib/anim';
import {Landscape} from '../_lib/landscape';
import {Stage} from '../_lib/stage';

// A picture next to a dark settings panel: the panel plots the light's sine and the camera's
// sampling sine; editing the frame-rate value brings them into step and the picture stops banding.

export type TunerProps = {
  durationInFrames: number;
  title: string;
  options: [string, string];
  freqLabel: string;
  checkLabel: string;
  value: K; // frame-rate value shown in the box
  target: number; // value at which both waves line up
  panelIn: number;
  sliderIn: number;
  src?: string; // optional picture in public/
};

const PIC = {x: 108, y: 88, w: 393, h: 320};
const PAN = {x: 514, y: 95, w: 246, h: 313};
const G = {x: 530, y: 140, w: 208, h: 150};

export const Tuner: React.FC<TunerProps> = (p) => {
  const f = useCurrentFrame();
  const v = keyed(f, p.value);
  const off = Math.abs(v - p.target) / p.target; // 0 when synced
  const pan = eased(f, [[p.panelIn, 0], [p.panelIn + 14, 1]]);
  const sl = stag(f, p.sliderIn, 0, 10, 0);
  const band = off > 0.01 ? 0.18 * Math.min(1, off * 3) : 0;
  const bandY = ((f * 7) % (PIC.h + 120)) - 60;
  const wave = (period: number, phase: number) => {
    let d = '';
    for (let x = 0; x <= G.w - 20; x += 2) {
      const y = G.h / 2 - 48 * Math.sin((x / period) * Math.PI * 2 + phase);
      d += `${d ? 'L' : 'M'} ${G.x + 14 + x} ${G.y + y} `;
    }
    return d;
  };
  const font = {fontFamily: CJK, fontWeight: 900, color: '#fff'} as const;
  return (
    <Stage texts={[p.title, ...p.options, p.freqLabel, p.checkLabel]}>
      <div style={{position: 'absolute', left: 85, top: 58, width: 682, height: 364, background: '#ececee', borderRadius: 6}} />
      <div style={{position: 'absolute', left: PIC.x, top: PIC.y, width: PIC.w, height: PIC.h, borderRadius: 12, border: '4px solid #2b2b2e', overflow: 'hidden', boxSizing: 'border-box'}}>
        {p.src ? <Img src={staticFile(p.src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <Landscape w={PIC.w - 8} h={PIC.h - 8} />}
        {band > 0 && <div style={{position: 'absolute', left: 0, top: bandY, width: '100%', height: 90, background: `linear-gradient(rgba(0,0,0,0), rgba(0,0,0,${band}), rgba(0,0,0,0))`}} />}
      </div>
      <div style={{position: 'absolute', left: PAN.x, top: PAN.y + (1 - pan) * 20, width: PAN.w, height: PAN.h, borderRadius: 10, background: '#2b2b2e', opacity: pan, ...font}}>
        {['#ff4f6b', '#f5b52c', '#33c25a'].map((c, i) => (
          <div key={i} style={{position: 'absolute', left: 9 + i * 10, top: 8, width: 6, height: 6, borderRadius: 3, background: c}} />
        ))}
        <div style={{position: 'absolute', left: 14, top: 22, fontSize: 12.5}}>{p.title}</div>
        <div style={{position: 'absolute', right: 12, top: 25, display: 'flex', gap: 10, fontSize: 7, color: '#bbb', whiteSpace: 'nowrap', alignItems: 'center'}}>
          <span>{p.options[0]}</span>
          <span style={{width: 8, height: 8, borderRadius: 4, background: '#fff', display: 'inline-block'}} />
          <span>{p.options[1]}</span>
        </div>
        <div style={{position: 'absolute', left: 14, top: 232, fontSize: 12}}>{p.freqLabel}</div>
        <div style={{position: 'absolute', left: 14, top: 254, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, whiteSpace: 'nowrap'}}>
          <div style={{width: 11, height: 11, borderRadius: 2, background: '#e8e8ea', color: '#2b2b2e', fontSize: 9, lineHeight: '11px', textAlign: 'center'}}>✓</div>
          {p.checkLabel}
          <div style={{marginLeft: 26, width: 36, height: 16, borderRadius: 3, background: '#1b1b1d', fontSize: 11, lineHeight: '16px', textAlign: 'center'}}>{Math.round(v)}</div>
        </div>
        <div style={{position: 'absolute', left: 14, top: 284, width: 218, height: 3, borderRadius: 2, background: '#7a7a80', opacity: sl}}>
          <div style={{position: 'absolute', left: ((v - 10) / 20) * 210 - 7, top: -6, width: 14, height: 14, borderRadius: 7, border: '2px solid #ddd', background: '#2b2b2e', boxSizing: 'border-box'}} />
        </div>
      </div>
      <svg width={852} height={480} style={{position: 'absolute', left: 0, top: (1 - pan) * 20, opacity: pan}}>
        <rect x={G.x} y={G.y} width={G.w} height={G.h} rx={6} fill="#3d3d42" />
        <line x1={G.x + 14} y1={G.y + 8} x2={G.x + 14} y2={G.y + G.h - 8} stroke="#999" strokeWidth={1} />
        <line x1={G.x + 8} y1={G.y + G.h / 2} x2={G.x + G.w - 8} y2={G.y + G.h / 2} stroke="#999" strokeWidth={1} />
        <path d={wave(92, 0)} fill="none" stroke="#e9e9ee" strokeWidth={1.8} />
        <path d={wave(92 * (1 + off * 0.9), 0.6 * off * 4)} fill="none" stroke="#141416" strokeWidth={1.8} opacity={off < 0.01 ? 0 : 1} />
      </svg>
    </Stage>
  );
};
