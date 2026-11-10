import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, eased, K, keyed, rng, stag} from '../_lib/anim';
import {Backdrop} from '../_lib/backdrop';
import {Stage} from '../_lib/stage';

// Two dark windows under a status bar: a looping toy animation (blue funnel, bouncing yellow ball)
// and a chart with two bell curves whose peaks can drift apart. Speech bubbles, a tag and short
// glitches comment on it. The status bar types its message.

type Alert = {at: number; kind: 'warn' | 'ok'; text: string};
type Bubble = {at: number; text: string};
export type SignalProps = {
  durationInFrames: number;
  alerts: Alert[];
  typeSpeed: number; // characters per frame
  legend: [string, string];
  legendIn: number;
  chartIn: number;
  peakA: K; // x of the blue peak (chart px)
  peakB: K; // x of the yellow peak
  peaksIn: number; // dashed peak markers
  tag?: {text: string; in: number; out: number};
  bubbles: Bubble[];
  glitches: number[]; // start frames of 10-frame glitches on the left window
  winIn: number;
};

const BLUE = '#3b3ff0';
const YEL = '#f7c65e';
const DARK = '#1e1e22';
const CH = {x: 391, y: 185, w: 296, h: 156};

const bell = (x: number, peak: number) => {
  const d = x - peak;
  const w = d < 0 ? 62 : 34;
  return 0.12 + 0.88 * Math.exp(-(d * d) / (2 * w * w)) + (d < 0 ? 0.08 * (1 - Math.exp(d / 120)) : -0.04);
};
const curve = (peak: number) => {
  let s = '';
  for (let x = CH.x; x <= CH.x + CH.w; x += 3) {
    const y = CH.y + CH.h - 26 - bell(x, peak) * 100;
    s += `${s ? 'L' : 'M'} ${x} ${y.toFixed(1)} `;
  }
  return s;
};

export const Toy: React.FC<{f: number; mono?: boolean}> = ({f, mono}) => {
  const ph = (f % 46) / 46;
  const by = 245 + 55 * Math.abs(Math.cos(Math.PI * ph));
  const squash = by > 290 ? 1 + (by - 290) / 30 : 1;
  return (
    <svg width={203} height={203} viewBox="163 150 203 203">
      {mono ? null : <path d="M 172 168 L 357 168 L 355 186 C 330 200 300 230 290 275 C 282 315 280 340 278 353 L 240 353 C 236 330 226 300 206 270 C 190 248 178 220 172 186 Z" fill="#4472d6" />}
      <g fill="none" stroke="#bcd0f7" strokeWidth={1.4} opacity={mono ? 0 : 0.75}>
        <path d="M 240 172 C 270 190 320 186 350 176" />
        <path d="M 225 180 C 262 214 330 206 352 190" />
        <path d="M 196 200 C 214 250 250 240 262 220 C 270 205 300 200 320 215" />
        <path d="M 250 290 C 262 300 270 320 268 350" />
      </g>
      <ellipse cx={265} cy={by} rx={26 * squash} ry={26 / squash} fill={mono ? '#ffffff' : '#fcc43c'} />
    </svg>
  );
};

const BubbleBox: React.FC<{text: string; f: number; at: number}> = ({text, f, at}) => {
  const a = stag(f, at, 0, 10, 0);
  const wide = text.length > 2;
  const w = wide ? 178 : 104;
  const bob = Math.sin((f - at) / 9) * 2;
  return (
    <div style={{position: 'absolute', left: wide ? 305 : 320, top: 252 + bob, width: w, height: 78, transform: `scale(${0.4 + 0.6 * a})`, transformOrigin: '10% 100%', opacity: Math.min(1, a * 2)}}>
      <svg width={w} height={90} style={{position: 'absolute'}}>
        <path d={`M 6 0 L ${w - 6} 0 Q ${w} 0 ${w} 6 L ${w} 66 Q ${w} 72 ${w - 6} 72 L 34 72 L 18 88 L 18 72 L 6 72 Q 0 72 0 66 L 0 6 Q 0 0 6 0 Z`} fill="#fcc94a" stroke="#fff" strokeWidth={2} />
      </svg>
      <div style={{position: 'absolute', left: 0, top: 0, width: w, height: 72, lineHeight: '72px', textAlign: 'center', color: '#fff', fontFamily: CJK, fontWeight: 900, fontSize: wide ? 25 : 48}}>{text}</div>
    </div>
  );
};

export const Signal: React.FC<SignalProps> = (p) => {
  const f = useCurrentFrame();
  const win = eased(f, [[p.winIn, 0], [p.winIn + 14, 1]]);
  const alert = p.alerts.reduce((a, x) => (f >= x.at ? x : a), p.alerts[0]);
  const shown = Math.max(0, Math.floor((f - alert.at) * p.typeSpeed));
  const pa = keyed(f, p.peakA);
  const pb = keyed(f, p.peakB);
  const chart = stag(f, p.chartIn, 0, 24, 0);
  const g = p.glitches.find((s) => f >= s && f < s + 10);
  const r = rng(Math.floor(f * 7) + 3);
  const bub = [...p.bubbles].reverse().find((b) => f >= b.at);
  const texts = [...p.alerts.map((a) => a.text), ...p.legend, ...p.bubbles.map((b) => b.text), p.tag?.text ?? ''];

  return (
    <Stage texts={texts}>
      <Backdrop contours={false} />
      <div style={{opacity: win, transform: `scale(${0.94 + 0.06 * win})`, transformOrigin: '431px 230px'}}>
        {/* status bar */}
        <div style={{position: 'absolute', left: 163, top: 110, width: 536, height: 28, borderRadius: 6, background: DARK, fontFamily: CJK, fontWeight: 900, fontSize: 14, color: alert.kind === 'warn' ? '#f5a442' : '#fff', lineHeight: '28px', whiteSpace: 'nowrap', overflow: 'hidden'}}>
          <svg width={20} height={20} style={{position: 'absolute', left: 9, top: 4}} viewBox="0 0 20 20">
            {alert.kind === 'warn' ? <path d="M 10 2 L 19 18 L 1 18 Z" fill="#e5322f" /> : <circle cx={10} cy={10} r={8.5} fill="#22c55e" />}
            {alert.kind === 'warn' ? <rect x={9} y={8} width={2} height={6} fill={DARK} /> : <path d="M 6 10 L 9 13 L 14 7" stroke="#fff" strokeWidth={2.2} fill="none" />}
          </svg>
          <span style={{position: 'absolute', left: 42, letterSpacing: 1}}>{alert.text.slice(0, shown)}</span>
        </div>
        {/* toy window */}
        <div style={{position: 'absolute', left: 163, top: 150, width: 203, height: 203, borderRadius: 6, background: '#111114', overflow: 'hidden'}}>
          <Toy f={f} />
          {g !== undefined &&
            Array.from({length: 14}, (_, i) => (
              <div key={i} style={{position: 'absolute', left: (r() - 0.5) * 40, top: r() * 203, width: 203, height: 3 + r() * 14, background: r() < 0.5 ? 'rgba(255,255,255,0.55)' : 'rgba(60,60,70,0.85)', mixBlendMode: 'normal'}} />
            ))}
        </div>
        {/* chart window */}
        <div style={{position: 'absolute', left: 379, top: 150, width: 320, height: 203, borderRadius: 6, background: DARK}} />
        <svg width={852} height={480} style={{position: 'absolute', left: 0, top: 0}}>
          <defs>
            <clipPath id="sg-chart">
              <rect x={CH.x} y={CH.y} width={CH.w * chart} height={CH.h} />
            </clipPath>
          </defs>
          <rect x={CH.x} y={CH.y} width={CH.w} height={CH.h} rx={6} fill="#3a3a3f" />
          <g stroke="#6c6c72" strokeWidth={1.2} strokeDasharray="6 5">
            {[1, 2, 3, 4].map((i) => (
              <line key={`v${i}`} x1={CH.x + (CH.w * i) / 4.5} y1={CH.y} x2={CH.x + (CH.w * i) / 4.5} y2={CH.y + CH.h} />
            ))}
            {[1, 2, 3].map((i) => (
              <line key={`h${i}`} x1={CH.x} y1={CH.y + (CH.h * i) / 4} x2={CH.x + CH.w} y2={CH.y + (CH.h * i) / 4} />
            ))}
          </g>
          <g clipPath="url(#sg-chart)" fill="none" strokeWidth={5} strokeLinecap="round">
            <path d={curve(pa)} stroke={BLUE} />
            <path d={curve(pb)} stroke={YEL} />
          </g>
          {(() => {
            const a = stag(f, p.peaksIn, 0, 10, 0);
            if (a <= 0) return null;
            const ya = CH.y + CH.h - 26 - bell(pa, pa) * 100;
            const yb = CH.y + CH.h - 26 - bell(pb, pb) * 100;
            return (
              <g opacity={a}>
                <line x1={pa} y1={ya} x2={pa} y2={CH.y + CH.h - 22} stroke="#fff" strokeWidth={2} strokeDasharray="6 4" />
                <line x1={pb} y1={yb} x2={pb} y2={CH.y + CH.h - 22} stroke="#fff" strokeWidth={2} strokeDasharray="6 4" />
                <circle cx={pa} cy={ya} r={5} fill={BLUE} />
                <circle cx={pb} cy={yb} r={5} fill={YEL} />
              </g>
            );
          })()}
        </svg>
        {/* legend */}
        <div style={{position: 'absolute', left: 436, top: 158, display: 'flex', gap: 40, fontFamily: CJK, fontWeight: 900, fontSize: 14, color: '#fff', opacity: stag(f, p.legendIn, 0, 10, 0), whiteSpace: 'nowrap'}}>
          {[BLUE, YEL].map((c, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 10}}>
              <div style={{width: 34, height: 10, borderRadius: 5, background: c}} />
              {p.legend[i]}
            </div>
          ))}
        </div>
        {/* tag */}
        {p.tag &&
          (() => {
            const a = stag(f, p.tag.in, 0, 10, 0) * (1 - stag(f, p.tag.out, 0, 8, 0));
            return a > 0 ? (
              <div style={{position: 'absolute', left: 120, top: 196, opacity: a, transform: `scale(${0.6 + 0.4 * a})`}}>
                <svg width={110} height={50} style={{position: 'absolute'}}>
                  <path d="M 4 0 L 106 0 Q 110 0 110 4 L 110 36 Q 110 40 106 40 L 60 40 L 52 50 L 46 40 L 4 40 Q 0 40 0 36 L 0 4 Q 0 0 4 0 Z" fill="#3f63c9" stroke="#fff" strokeWidth={1.6} />
                </svg>
                <div style={{position: 'absolute', width: 110, lineHeight: '40px', textAlign: 'center', fontFamily: CJK, fontWeight: 900, fontSize: 19, color: '#fff', whiteSpace: 'nowrap'}}>{p.tag.text}</div>
              </div>
            ) : null;
          })()}
        {bub && <BubbleBox key={bub.at} text={bub.text} f={f} at={bub.at} />}
      </div>
    </Stage>
  );
};
