import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, eased, K, keyed, stag} from '../_lib/anim';
import {Backdrop} from '../_lib/backdrop';
import {Stage} from '../_lib/stage';

// PWM dimming explainer: a lamp label box that blinks, a scrolling square wave with ON/OFF and
// duty-cycle labels, a toggle switch, and a tilted phone whose brightness slider follows the duty.

export type PwmProps = {
  durationInFrames: number;
  lamp: string;
  on: string;
  off: string;
  dutyStart: number; // percent shown on the first period
  dutyStep: number; // percent added each period
  periodFrames: number; // frames to scroll one period
  blinkFrames: number; // frames per blink half-cycle of the label box / toggle
  brightness: K; // 0..1 phone slider fill
  screen: K; // 0..1 phone screen lightness
  intro: number; // frame the intro starts
};

const PER = 134; // px per period
const PURPLE = '#7a4cf5';

export const Pwm: React.FC<PwmProps> = (p) => {
  const f = useCurrentFrame();
  const iT = eased(f, [[p.intro, 0], [p.intro + 20, 1]]);
  const scroll = (f / p.periodFrames) * PER;
  const k0 = Math.floor(scroll / PER);
  const lit = Math.floor((f - p.intro) / p.blinkFrames) % 2 === 0;
  const bright = keyed(f, p.brightness);
  const scr = keyed(f, p.screen);

  // square wave inside the strip (strip local coords: 0..268 x 0..68)
  const hi = 25;
  const lo = 52;
  const segs: {x0: number; x1: number; duty: number}[] = [];
  for (let k = k0 - 1; k <= k0 + 3; k++) {
    const duty = Math.min(100, Math.max(0, p.dutyStart + k * p.dutyStep));
    const x0 = 6 + k * PER - scroll + 40;
    segs.push({x0, x1: x0 + PER * (0.35 + 0.004 * duty), duty});
  }
  let d = '';
  segs.forEach((s, i) => {
    const next = segs[i + 1]?.x0 ?? s.x0 + PER;
    d += `${i === 0 ? 'M' : 'L'} ${s.x0} ${lo} L ${s.x0} ${hi} L ${s.x1} ${hi} L ${s.x1} ${lo} L ${next} ${lo} `;
  });

  const grow = (t: number) => ({transform: `scale(${t})`, opacity: Math.min(1, t * 2)});
  const boxT = stag(f, p.intro + 2, 0, 16, 0);
  const stripT = stag(f, p.intro + 5, 0, 16, 0);
  const tgl = eased(f, [[p.intro, 0], [p.intro + 18, 1]]);
  const ty = eased(f, [[p.intro, 88], [p.intro + 22, 0]]);
  const knobLeft = !lit;
  const ktx = eased(f, [[Math.floor((f - p.intro) / p.blinkFrames) * p.blinkFrames + p.intro, knobLeft ? 1 : 0], [Math.floor((f - p.intro) / p.blinkFrames) * p.blinkFrames + p.intro + 6, knobLeft ? 0 : 1]]);

  return (
    <Stage texts={[p.lamp, p.on, p.off, '%']}>
      <Backdrop />
      <div style={{fontFamily: CJK, fontWeight: 900}}>
        {/* lamp box */}
        <div style={{position: 'absolute', left: 158, top: 117, width: 268, height: 67, borderRadius: 9, border: `2.5px solid #4b2fb8`, boxSizing: 'border-box', background: lit ? '#c3b5f6' : '#fdfcff', transformOrigin: '134px 33px', ...grow(boxT)}}>
          <div style={{width: '100%', lineHeight: '62px', textAlign: 'center', fontSize: 34, color: '#f4f0ff', letterSpacing: 40, textIndent: 40, opacity: lit ? 1 : 0, whiteSpace: 'nowrap'}}>{p.lamp}</div>
        </div>
        {/* wave strip */}
        <div style={{position: 'absolute', left: 158, top: 200, width: 268, height: 68, borderRadius: 9, border: `2.5px solid #4b2fb8`, boxSizing: 'border-box', background: '#212026', overflow: 'hidden', transformOrigin: '134px 34px', ...grow(stripT)}}>
          <svg width={268} height={68} style={{position: 'absolute', left: -2.5, top: -2.5}}>
            <path d={d} fill="none" stroke={PURPLE} strokeWidth={3} strokeLinejoin="miter" />
          </svg>
          {segs.map((s, i) => (
            <React.Fragment key={i}>
              <div style={{position: 'absolute', left: s.x0, width: s.x1 - s.x0, top: 4, textAlign: 'center', color: '#fff', fontSize: 11}}>{p.on}</div>
              <div style={{position: 'absolute', left: s.x0 + 6, top: 27, color: '#fff', fontSize: 12}}>{s.duty}%</div>
              <div style={{position: 'absolute', left: s.x1 + 18, top: 33, color: '#9b7bf8', fontSize: 11}}>{p.off}</div>
            </React.Fragment>
          ))}
        </div>
        {/* toggle */}
        <div style={{position: 'absolute', left: 246 - (1 - tgl) * 150, top: 298, width: 90, height: 36, borderRadius: 18, background: PURPLE, border: '2px solid #4b2fb8', boxSizing: 'border-box'}}>
          <div style={{position: 'absolute', left: 3 + ktx * 51, top: 2, width: 30, height: 28, borderRadius: 15, background: '#fff', fontSize: 10.5, lineHeight: '28px', textAlign: 'center', color: knobLeft ? '#2fd36b' : '#3b3b44', opacity: f < p.intro + 18 ? 0.95 : 1}}>
            {f < p.intro + 18 ? '' : knobLeft ? p.on : p.off}
          </div>
        </div>
      </div>
      {/* phone */}
      <div style={{position: 'absolute', left: 532, top: 128, width: 118, height: 214, perspective: 700}}>
        <div style={{position: 'absolute', inset: 0, transform: `rotateY(${ty}deg) rotateZ(${25 * (1 - ty / 88)}deg)`, transformStyle: 'preserve-3d'}}>
          <div style={{position: 'absolute', left: 8, top: 9, width: 118, height: 214, borderRadius: 20, background: '#5a2fd0'}} />
          <div style={{position: 'absolute', left: 0, top: 0, width: 118, height: 214, borderRadius: 20, background: '#151517', padding: 5, boxSizing: 'border-box'}}>
            <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 16, background: `rgb(${[0x8c, 0x8c, 0x8f].map((c) => Math.round(c + (0xf2 - c) * scr)).join(',')})`, overflow: 'hidden'}}>
              <div style={{position: 'absolute', left: 34, top: 0, width: 40, height: 9, borderRadius: '0 0 7px 7px', background: '#151517'}} />
              <div style={{position: 'absolute', left: 35, top: 50, width: 38, height: 98, borderRadius: 4, background: '#3a3a3e', overflow: 'hidden'}}>
                <div style={{position: 'absolute', left: 0, bottom: 0, width: '100%', height: `${bright * 100}%`, background: '#f7f7f8'}} />
                <svg width={16} height={16} viewBox="-8 -8 16 16" style={{position: 'absolute', left: 11, bottom: 10}}>
                  <circle r={3} fill="none" stroke="#777" strokeWidth={1.2} />
                  {Array.from({length: 8}, (_, i) => (
                    <line key={i} x1={0} y1={-5} x2={0} y2={-6.8} stroke="#777" strokeWidth={1.2} transform={`rotate(${i * 45})`} />
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Stage>
  );
};
