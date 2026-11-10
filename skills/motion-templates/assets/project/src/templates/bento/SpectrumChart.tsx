import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, eased, K, ramp} from '../_lib/anim';
import {Stage} from '../_lib/stage';
import {BentoCaption, BentoWorld, BLUE, Cam, INK, Tile} from './Bento';

// Curve over a band + valid range: a chart card in a bento layout. The x axis rescales to reveal a far
// value, a tinted region and a glowing marker point at it, a note box explains it, then a second curve
// draws in over the first and both get legend entries.

export type Curve = {pts: [number, number][]; color: string; at: number; dur: number; legend: string; legendAt: number};
export type SpectrumChartProps = {
  durationInFrames: number;
  tiles: Tile[];
  cam: Cam[];
  card: {x: number; y: number; w: number; h: number};
  xDomain: [number, [number, number]][]; // keys of [min, max]
  xTicks: number[];
  band: [number, number]; // visible band (x units)
  curves: Curve[];
  region: {from: number; to: number; at: number; out: number}; // tinted region
  marker: {x: number; at: number};
  note: {text: string[]; at: number};
  captions?: [number, string][];
};

const SPEC_STOPS = ['#2b0c66', '#5a1fd0', '#2a3cf0', '#18b5f5', '#20d36a', '#c6f01e', '#ffe414', '#ff8a14', '#f2241c', '#7a0a0a'];

export const SpectrumChart: React.FC<SpectrumChartProps> = (p) => {
  const f = useCurrentFrame();
  const c = p.card;
  const PL = c.x + 34;
  const PR = c.x + c.w - 40;
  const PT = c.y + 18;
  const PB = c.y + c.h - 50;
  const lo = eased(f, p.xDomain.map(([t, d]) => [t, d[0]]) as K);
  const hi = eased(f, p.xDomain.map(([t, d]) => [t, d[1]]) as K);
  const X = (v: number) => PL + ((v - lo) / (hi - lo)) * (PR - PL);
  const Y = (v: number) => PB - (v / 100) * (PB - PT);
  const rA = ramp(f, p.region.at, p.region.at + 10) * (1 - ramp(f, p.region.out, p.region.out + 10));
  const mA = ramp(f, p.marker.at, p.marker.at + 8);
  const nA = ramp(f, p.note.at, p.note.at + 8);
  const cap = (p.captions ?? []).filter((x) => f >= x[0]).pop();
  const texts = [...p.curves.map((k) => k.legend), ...p.note.text, ...(p.captions ?? []).map((x) => x[1])];
  const legends = p.curves.filter((k) => f >= k.legendAt);
  const pathOf = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'} ${X(x).toFixed(1)} ${Y(y).toFixed(1)}`).join(' ');
  return (
    <Stage bg={INK} texts={texts}>
      <BentoWorld f={f} tiles={p.tiles} cam={p.cam}>
        {/* plot */}
        <div style={{position: 'absolute', left: PL, top: PT, width: PR - PL, height: PB - PT, background: '#060606', overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: X(p.band[0]) - PL, width: X(p.band[1]) - X(p.band[0]), top: 0, bottom: 0, background: `linear-gradient(90deg, ${SPEC_STOPS.join(', ')})`, filter: 'blur(1.5px) saturate(1.15)'}} />
          <div style={{position: 'absolute', left: X(p.region.from) - PL, width: X(p.region.to) - X(p.region.from), top: 0, bottom: 0, background: 'linear-gradient(90deg, rgba(120,20,20,0.15), rgba(150,30,30,0.32))', opacity: rA}} />
          <svg width={PR - PL} height={PB - PT} style={{position: 'absolute', left: 0, top: 0}}>
            {Array.from({length: 31}, (_, i) => (
              <line key={`v${i}`} x1={(i * (PR - PL)) / 30} x2={(i * (PR - PL)) / 30} y1={0} y2={PB - PT} stroke="rgba(255,255,255,0.28)" strokeWidth={0.7} />
            ))}
            {Array.from({length: 11}, (_, i) => (
              <line key={`h${i}`} x1={0} x2={PR - PL} y1={(i * (PB - PT)) / 10} y2={(i * (PB - PT)) / 10} stroke="rgba(255,255,255,0.28)" strokeWidth={0.7} />
            ))}
          </svg>
          <div style={{position: 'absolute', left: X(p.marker.x) - PL - 3, top: (PB - PT) * 0.07, width: 5, bottom: 0, background: '#fff', boxShadow: '0 0 8px 3px rgba(255,255,255,0.8)', opacity: mA, transformOrigin: 'bottom', transform: `scaleY(${mA})`}} />
        </div>
        <svg width={1000} height={600} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <defs>
            <clipPath id="sc-plot">
              <rect x={PL} y={PT - 10} width={PR - PL} height={PB - PT + 10} />
            </clipPath>
          </defs>
          {p.curves.map((k, i) => {
            const d = ramp(f, k.at, k.at + k.dur, [0.4, 0, 0.6, 1]);
            if (d <= 0) return null;
            return <path key={i} d={pathOf(k.pts)} fill="none" stroke={k.color} strokeWidth={2.2} strokeLinejoin="round" pathLength={1} strokeDasharray={`${d} 1`} clipPath="url(#sc-plot)" />;
          })}
          <line x1={PL} x2={PL} y1={PT} y2={PB} stroke={BLUE} strokeWidth={1.5} />
          <line x1={PL} x2={PR} y1={PB} y2={PB} stroke={BLUE} strokeWidth={1.5} />
          <line x1={PR} x2={PR} y1={PT - 4} y2={PT + 6} stroke={BLUE} strokeWidth={1.5} />
          {Array.from({length: 11}, (_, i) => (
            <text key={i} x={PL - 8} y={Y(i * 10) + 2} fontSize={5.5} fontFamily="MontserratLocal" fontWeight={600} fill="#444" textAnchor="end">{i * 10}</text>
          ))}
          {p.xTicks.map((v) => (
            <text key={v} x={X(v)} y={PB + 10} fontSize={5.5} fontFamily="MontserratLocal" fontWeight={600} fill="#444" textAnchor="middle" opacity={v <= hi + 1 ? 1 : 0}>{v}</text>
          ))}
        </svg>
        {/* note */}
        <div style={{position: 'absolute', right: 1000 - PR + 10, width: 168, top: PB - 32, background: BLUE, padding: '2px 4px', fontFamily: CJK, fontWeight: 700, fontSize: 8.5, lineHeight: '11px', color: '#fff', opacity: nA, left: PR - 178}}>
          {p.note.text.map((t, i) => <div key={i}>{t}</div>)}
        </div>
        {/* legends */}
        <div style={{position: 'absolute', left: c.x, width: c.w, top: PB + 16, display: 'flex', justifyContent: 'center', gap: 40}}>
          {legends.map((k, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 6, fontFamily: CJK, fontWeight: 700, fontSize: 11, color: INK, opacity: ramp(f, k.legendAt, k.legendAt + 8)}}>
              <span style={{width: 11, height: 11, background: k.color === '#d42a3a' ? '#e02020' : BLUE, display: 'inline-block'}} />
              {k.legend}
            </div>
          ))}
        </div>
      </BentoWorld>
      <BentoCaption text={cap?.[1]} />
    </Stage>
  );
};
