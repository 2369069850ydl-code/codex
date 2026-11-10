import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, eased, K, ramp, stag} from '../_lib/anim';
import {Stage} from '../_lib/stage';

// Parallel channels scale up: the camera glides over a colour-filter sensor down to a few
// converter chips wired to its edge, the title on the sensor swaps ("normal" -> "this one"),
// a long row of chips lights up left to right, then a fast pull-back reveals the whole sensor
// with its pin comb, a row of output processors and flex cables. All drawn in a flat world that
// a 2.5D camera (pan, zoom, tilt) moves over.

export type ChannelScaleProps = {
  durationInFrames: number;
  cam: {t: number; x: number; y: number; z: number; tilt: number}[]; // world point at screen centre
  titles: {text: string; at: number; out?: number}[]; // on the sensor
  chip: string; // "ADC"
  few: number; // chips shown first
  many: number; // chips after the expansion
  fewAt: number;
  manyAt: number;
  sensorLabel: string; // big faint word on the zoomed-out sensor
  blurAt: [number, number]; // colour filter -> soft gradient
  out: string; // "FPGA"
  outCount: number;
  captions?: [number, string][];
};

const SW = 1000;
const SH = 525;
const CELL = 19;
const CHIP_Y = 584;
const CHIP_W = 34;
const CHIP_H = 26;
const PITCH = 41;
const FPGA_Y = 615;

const Bayer: React.FC = () => {
  const cols = Math.ceil(SW / CELL);
  const rows = Math.ceil(SH / CELL);
  const rects: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const g = (r + c) % 2 === 0;
      const col = g ? '#2f8a3c' : r % 2 === 0 ? '#2759a8' : '#a2303a';
      rects.push(<rect key={`${r}-${c}`} x={c * CELL} y={r * CELL} width={CELL} height={CELL} fill={col} />);
    }
  return (
    <svg width={SW} height={SH} style={{position: 'absolute', left: 0, top: 0}} shapeRendering="crispEdges">
      {rects}
    </svg>
  );
};

const Chip: React.FC<{label: string; w: number; h: number; size: number}> = ({label, w, h, size}) => (
  <div style={{position: 'relative', width: w, height: h, background: 'linear-gradient(#3c4352, #1e222b)', borderRadius: 1.5, boxShadow: '0 0 0 0.6px #7d8aa3, 0 2px 4px rgba(0,0,0,0.6)', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: h * 0.38, backgroundImage: 'radial-gradient(#5f7bc4 0.6px, transparent 0.8px)', backgroundSize: `${h / 9}px ${h / 9}px`, opacity: 0.8}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: h * 0.06, textAlign: 'center', fontFamily: "'MontserratLocal'", fontWeight: 900, fontSize: size, color: '#8fb6ff', letterSpacing: 0.3}}>{label}</div>
  </div>
);

export const ChannelScale: React.FC<ChannelScaleProps> = (p) => {
  const f = useCurrentFrame();
  const key = (sel: (c: ChannelScaleProps['cam'][number]) => number): K => p.cam.map((c) => [c.t, sel(c)]);
  const cx = eased(f, key((c) => c.x));
  const cy = eased(f, key((c) => c.y));
  const z = Math.exp(eased(f, key((c) => Math.log(c.z))));
  const tilt = eased(f, key((c) => c.tilt));
  const blur = ramp(f, p.blurAt[0], p.blurAt[1], [0.4, 0, 0.6, 1]);
  const fewA = ramp(f, p.fewAt, p.fewAt + 10);
  const wire = ramp(f, p.fewAt + 2, p.fewAt + 14);
  const chipsOut = blur;
  const cap = (p.captions ?? []).filter((c) => f >= c[0]).pop();
  const texts = [...p.titles.map((t) => t.text), ...(p.captions ?? []).map((c) => c[1])];
  const span = (p.many - 1) * PITCH;
  const x0 = (SW - span) / 2;
  const fewX0 = 31;
  return (
    <Stage bg="#121318" texts={texts}>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(90% 80% at 50% 35%, #2a2c33, #111216)'}} />
      <div style={{position: 'absolute', inset: 0, perspective: 900, perspectiveOrigin: '426px 240px'}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 852, height: 480, transform: `rotateX(${tilt}deg)`, transformOrigin: '426px 240px', transformStyle: 'preserve-3d'}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: SW, height: 900, transform: `translate(426px, 240px) scale(${z}) translate(${-cx}px, ${-cy}px)`, transformOrigin: '0 0'}}>
            {/* board */}
            <div style={{position: 'absolute', left: -50, top: -60, width: SW + 100, height: SH + 85, background: 'linear-gradient(#25272d, #1c1d22)', borderRadius: 6, boxShadow: '0 30px 60px rgba(0,0,0,0.6)'}} />
            {/* sensor */}
            <div style={{position: 'absolute', left: 0, top: 0, width: SW, height: SH, boxShadow: '0 0 0 1.5px #cfd6c8', overflow: 'hidden'}}>
              <div style={{position: 'absolute', inset: 0, opacity: 1 - blur}}>
                <Bayer />
              </div>
              <div style={{position: 'absolute', inset: 0, opacity: blur, background: 'linear-gradient(180deg, #b6463a 0%, #8a4a44 35%, #5d7a5c 75%, #4f8a6a 100%)', filter: 'saturate(0.85)'}} />
              <div style={{position: 'absolute', inset: 0, opacity: blur * 0.5, backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1.5px)', backgroundSize: '6px 6px'}} />
              <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: "'MontserratLocal'", fontWeight: 900, fontSize: 210, letterSpacing: 6, color: 'rgba(200,200,200,0.42)', opacity: ramp(f, p.blurAt[0] + 8, p.blurAt[1] + 6)}}>{p.sensorLabel}</div>
              {/* column read-out traces (faint) */}
              {Array.from({length: p.many}, (_, i) => (
                <div key={i} style={{position: 'absolute', left: x0 + i * PITCH - 3, top: 0, width: 6, height: SH, background: 'rgba(255,170,110,0.12)', opacity: (1 - blur) * ramp(f, p.manyAt, p.manyAt + 20)}} />
              ))}
              {p.titles.map((t, i) => {
                const a = ramp(f, t.at, t.at + 12, [0.2, 0.8, 0.2, 1]);
                const o = t.out !== undefined ? ramp(f, t.out, t.out + 8) : 0;
                if (a <= 0 || o >= 1) return null;
                return (
                  <div key={i} style={{position: 'absolute', left: 120, top: 486, width: 260, height: 39, overflow: 'hidden'}}>
                    <div style={{fontFamily: CJK, fontWeight: 900, fontSize: 30, letterSpacing: 4, color: '#fff', lineHeight: '38px', whiteSpace: 'nowrap', textShadow: '0 2px 6px rgba(0,0,0,0.5)', opacity: (1 - o) * a * (1 - blur), transform: `translateY(${(1 - a) * 30 + o * 30}px)`}}>{t.text}</div>
                  </div>
                );
              })}
            </div>
            {/* pin comb (zoomed-out view) */}
            <div style={{position: 'absolute', left: 0, top: SH + 4, width: SW, height: 22, opacity: blur, backgroundImage: 'repeating-linear-gradient(90deg, #9aa0ab 0 3px, transparent 3px 9px)'}} />
            <div style={{position: 'absolute', left: 0, top: SH + 8, width: SW, height: 3, opacity: blur, background: '#5a6070'}} />
            {/* few chips + wires */}
            {Array.from({length: p.few}, (_, i) => (
              <React.Fragment key={`f${i}`}>
                <div style={{position: 'absolute', left: fewX0 + i * PITCH - 3, top: SH, width: 6, height: (CHIP_Y - SH) * wire, background: '#e58c4f', opacity: 1 - chipsOut}} />
                <div style={{position: 'absolute', left: fewX0 + i * PITCH - CHIP_W / 2, top: CHIP_Y, opacity: fewA * (1 - chipsOut) * (f >= p.manyAt + 4 ? 0 : 1)}}>
                  <Chip label={p.chip} w={CHIP_W} h={CHIP_H} size={9.5} />
                </div>
              </React.Fragment>
            ))}
            {/* many chips */}
            {f >= p.manyAt &&
              Array.from({length: p.many}, (_, i) => {
                const a = stag(f, p.manyAt, 0.9, 10, i) * (1 - chipsOut);
                return (
                  <React.Fragment key={`m${i}`}>
                    <div style={{position: 'absolute', left: x0 + i * PITCH - 3, top: SH, width: 6, height: (CHIP_Y - SH) * Math.min(1, a * 1.5), background: '#e58c4f', opacity: a}} />
                    <div style={{position: 'absolute', left: x0 + i * PITCH - CHIP_W / 2, top: CHIP_Y, opacity: a, filter: `brightness(${0.3 + 0.7 * a})`}}>
                      <Chip label={p.chip} w={CHIP_W} h={CHIP_H} size={9.5} />
                    </div>
                  </React.Fragment>
                );
              })}
            {/* output processors + flex cables */}
            {Array.from({length: p.outCount}, (_, i) => {
              const w = SW / p.outCount;
              return (
                <div key={`o${i}`} style={{opacity: ramp(f, p.manyAt - 4, p.manyAt + 8)}}>
                  <div style={{position: 'absolute', left: i * w + w * 0.3, top: FPGA_Y + 128, width: w * 0.4, height: 160, backgroundImage: 'repeating-linear-gradient(90deg, #d7741f 0 3px, #f39a45 3px 6px)'}} />
                  <div style={{position: 'absolute', left: i * w + 3, top: FPGA_Y}}>
                    <Chip label={p.out} w={w - 6} h={130} size={44} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {cap && cap[1] && <div style={{position: 'absolute', left: 0, right: 0, top: 438, textAlign: 'center', fontFamily: CJK, fontWeight: 900, fontSize: 19, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>{cap[1]}</div>}
    </Stage>
  );
};
