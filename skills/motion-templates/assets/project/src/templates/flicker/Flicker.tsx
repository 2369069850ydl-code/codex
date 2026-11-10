import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, eased, ensureCjk, K, keyed, stag, step} from '../_lib/anim';
import {Stage} from '../_lib/stage';

// "Flicker timeline" panel family: a card with a tab title, an axis plot with a row of |sin| arcs
// (light flicker), and exposure bars (camera frames) that can be hatched, filled white, or levelled.
// Every number below is in the 852x480 design space.

export type Stagger = {start: number; stagger: number; dur: number; at?: Record<number, number>; every?: number; offset?: number};

/** Per-item progress: item i starts at start + rank*stagger, or at an explicit frame from `at`. */
const sv = (f: number, s: Stagger, i: number) => {
  if (s.at && s.at[i] !== undefined) return stag(f, s.at[i], 0, s.dur, 0);
  return stag(f, s.start, s.stagger, s.dur, i);
};
export type HeaderSeg =
  | {kind: 'slider'; from: number; to?: number; label: string; value: K}
  | {kind: 'fps'; from: number; to?: number; label: string; value: K; unit: string}
  | {kind: 'text'; from: number; to?: number; text: string};

export type FlickerProps = {
  durationInFrames: number;
  title: string;
  yLabel: string;
  xLabel: string;
  arcs: number; // how many arcs fit between the y axis and the right edge
  intro?: {start: number; dur: number}; // card grows out of a small document icon
  titleIn?: number; // frame the tab title slides in (default: right after the intro)
  waveDraw: K; // 0..1 left-to-right reveal of the arcs
  waveTone?: {from: number; to: number; base: number} | Stagger; // light -> dark, swept arc by arc
  axisTags?: {x?: [number, number]; y?: [number, number]; ring?: [number, number]}; // [in, out] frames
  arcHi?: {start: number; perArc: number; first: number; count: number; hold?: number};
  ticks?: {label: string; inS: Stagger; outS: Stagger};
  bars?: {interval: K; phase: K; width: K; alpha: K; reveal?: Stagger[]; grow?: Stagger; tone?: K};
  hatch?: Stagger;
  white?: Stagger;
  level?: Stagger & {height: number}; // flat white level as a fraction of the peak
  header?: HeaderSeg[];
  footer?: {text: string; from: number};
  layout?: 'full' | 'split'; // split: media window on the left, plot on the right
  media?: {from: number}; // self-drawn bulb in the media window
  pill?: {label: string; value: K; unit: string; from: number}; // rolling value pill under the plot
};

const C = {
  bg: '#f7f7f9',
  back: '#e4e4e7',
  card: '#ffffff',
  purple: '#4b4596',
  plot: '#e3e1f4',
  light: '#a7a2d8',
  barLight: '#d0cdee',
  teal: '#5fe3c8',
  pink: '#e8487f',
};

// plot geometry
type Geom = {OX: number; OY: number; PEAK: number; XR: number; PLOT: {x: number; y: number; w: number; h: number}; YTOP: number};
const FULL: Geom = {OX: 173, OY: 351, PEAK: 214, XR: 706, PLOT: {x: 143, y: 142, w: 565, h: 247}, YTOP: 177};
// plot on the right, media window on the left
const SPLIT: Geom = {OX: 435, OY: 325, PEAK: 190, XR: 706, PLOT: {x: 418, y: 142, w: 290, h: 247}, YTOP: 170};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const arcPath = (g: Geom, x0: number, P: number, amp = 1) => {
  // |sin| arc from x0 to x0+P, sampled
  let d = `M ${x0} ${g.OY}`;
  const n = 24;
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    d += ` L ${(x0 + P * t).toFixed(2)} ${(g.OY - (g.OY - g.PEAK) * amp * Math.pow(Math.sin(Math.PI * t), 0.7)).toFixed(2)}`;
  }
  return d;
};

const Rolling: React.FC<{v: number; h: number}> = ({v, h}) => {
  const n = Math.floor(v + 1e-6);
  const fr = v - n;
  return (
    <span style={{display: 'inline-block', height: h, overflow: 'hidden', verticalAlign: 'bottom', position: 'relative'}}>
      <span style={{display: 'block', transform: `translateY(${-fr * h}px)`}}>
        <span style={{display: 'block', height: h, lineHeight: `${h}px`}}>{n}</span>
        <span style={{display: 'block', height: h, lineHeight: `${h}px`}}>{n + 1}</span>
      </span>
    </span>
  );
};


/** Self-drawn incandescent bulb on a wooden block, dark room. */
const Bulb: React.FC<{f: number}> = ({f}) => {
  const glow = 0.85 + 0.15 * Math.sin(f * 0.9);
  return (
    <svg width={263} height={245} viewBox="0 0 263 245">
      <defs>
        <radialGradient id="bulb-room" cx="0.45" cy="0.5" r="0.75">
          <stop offset="0" stopColor="#2b241c" />
          <stop offset="1" stopColor="#0b0a09" />
        </radialGradient>
        <radialGradient id="bulb-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd27a" stopOpacity={0.55 * glow} />
          <stop offset="1" stopColor="#ffd27a" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="bulb-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b97a3c" />
          <stop offset="0.25" stopColor="#6b4325" />
          <stop offset="1" stopColor="#2a1a0f" />
        </linearGradient>
        <radialGradient id="bulb-glass" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#fff6dc" stopOpacity={0.35} />
          <stop offset="0.7" stopColor="#c8a15a" stopOpacity={0.12} />
          <stop offset="1" stopColor="#f3d79a" stopOpacity={0.5} />
        </radialGradient>
      </defs>
      <rect width={263} height={245} fill="url(#bulb-room)" />
      <circle cx={122} cy={120} r={95} fill="url(#bulb-glow)" />
      <path d="M 48 196 L 200 196 L 200 245 L 48 245 Z" fill="url(#bulb-wood)" />
      <path d="M 48 196 L 200 196 L 186 183 L 62 183 Z" fill="#e3a35a" opacity={0.9 * glow} />
      <rect x={108} y={160} width={30} height={26} rx={3} fill="#8a7a5c" />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={108} y1={164 + i * 6} x2={138} y2={166 + i * 6} stroke="#5d513d" strokeWidth={1.5} />
      ))}
      <path d="M 104 160 C 70 132 78 76 123 74 C 168 76 176 132 142 160 Z" fill="url(#bulb-glass)" stroke="#f1d8a0" strokeOpacity={0.55} strokeWidth={1.4} />
      <path d="M 116 158 L 114 118 M 130 158 L 132 118" stroke="#d9c39a" strokeWidth={1} />
      <path d="M 114 118 C 104 104 118 96 122 108 C 126 96 142 104 132 118" fill="none" stroke="#fff1b8" strokeWidth={2.2 * glow} />
      <path d="M 92 100 C 96 88 104 82 112 80" stroke="#fffaf0" strokeOpacity={0.5} strokeWidth={2} fill="none" />
    </svg>
  );
};

export const Flicker: React.FC<FlickerProps> = (p) => {
  const f = useCurrentFrame();
  const g = p.layout === 'split' ? SPLIT : FULL;
  ensureCjk([p.title, p.yLabel, p.xLabel, p.pill?.label ?? '', p.pill?.unit ?? '', p.ticks?.label ?? '', p.footer?.text ?? '', ...(p.header ?? []).map((h) => ('label' in h ? h.label + ('unit' in h ? h.unit : '') : h.text)), '0123456789：: '], ['500', '900']);

  // intro morph
  const it = p.intro ? eased(f, [[p.intro.start, 0], [p.intro.start + p.intro.dur, 1]]) : 1;
  const back = {x: lerp(326, 85, it), y: lerp(68, 58, it), w: lerp(218, 682, it), h: lerp(371, 364, it)};
  const card = {x: lerp(326, 128, it), y: lerp(213, 89, it), w: lerp(208, 593, it), h: lerp(188, 308, it)};
  const sx = card.w / 593;
  const sy = card.h / 308;
  const titleT = stag(f, p.titleIn ?? (p.intro ? p.intro.start + p.intro.dur - 4 : -100), 0, 12, 0);

  const P = (g.XR - g.OX) / p.arcs;
  const reveal = keyed(f, p.waveDraw);
  const revealX = g.OX + (g.XR - g.OX) * reveal;
  const nArcs = Math.ceil(p.arcs);

  const toneOf = (i: number) => {
    const w = p.waveTone;
    if (!w) return 1;
    if ('base' in w) return lerp(w.base, 1, keyed(f, [[w.from, 0], [w.to, 1]]));
    return lerp(0.45, 1, sv(f, w, i));
  };
  const mix = (t: number) => {
    // light -> purple
    const a = [0xa7, 0xa2, 0xd8];
    const b = [0x4b, 0x45, 0x96];
    return `rgb(${a.map((x, k) => Math.round(lerp(x, b[k], t))).join(',')})`;
  };

  // bars (camera frames)
  const bars: {x: number; w: number; a: number; i: number}[] = [];
  const slots: typeof bars = []; // every frame position, visible or not (ticks use these)
  if (p.bars) {
    const iv = keyed(f, p.bars.interval);
    const ph = keyed(f, p.bars.phase);
    const bw = keyed(f, p.bars.width);
    const al = keyed(f, p.bars.alpha);
    for (let i = 0; i < 40; i++) {
      const x = g.OX + (ph + i * iv) * P;
      if (x >= g.XR) break;
      const r = p.bars.reveal
        ? Math.max(0, ...p.bars.reveal.filter((g) => (i - (g.offset ?? 0)) % (g.every ?? 1) === 0 && i >= (g.offset ?? 0)).map((g) => sv(f, g, Math.floor((i - (g.offset ?? 0)) / (g.every ?? 1)))))
        : 1;
      slots.push({x, w: 0, a: 0, i});
      if (r <= 0 || al <= 0) continue;
      const gw = p.bars.grow ? lerp(0.025, 1, sv(f, p.bars.grow, i)) : 1;
      bars.push({x, w: Math.max(1.6, Math.min(bw * gw * P * r, g.XR - x)), a: al * Math.min(1, r * 3), i});
    }
  }
  const barTone = p.bars?.tone ? keyed(f, p.bars.tone) : 1;

  const underD = Array.from({length: nArcs}, (_, i) => {
    const x0 = g.OX + i * P;
    return arcPath(g, x0, P) + ` L ${x0 + P} ${g.OY} L ${x0} ${g.OY} Z`;
  }).join(' ');

  const ticks = p.ticks;
  const hdr = (p.header ?? []).filter((h) => f >= h.from - 12 && (h.to === undefined || f < h.to + 12));

  return (
    <Stage bg={C.bg}>
      {/* backdrop */}
      <div style={{position: 'absolute', left: back.x, top: back.y, width: back.w, height: back.h, background: C.back, borderRadius: 6, boxShadow: '0 1px 2px rgba(0,0,0,0.04)'}} />
      {/* card */}
      <div style={{position: 'absolute', left: card.x, top: card.y, width: card.w, height: card.h, background: C.card, borderRadius: 14 * Math.min(sx, 1), boxShadow: '0 6px 18px rgba(40,40,80,0.10)', overflow: 'hidden'}}>
        <svg width={card.w} height={card.h} viewBox="0 0 593 308" preserveAspectRatio="none" style={{position: 'absolute', left: 0, top: 0}}>
          <defs>
            <clipPath id="fl-plot">
              <rect x={g.PLOT.x} y={g.PLOT.y} width={g.PLOT.w} height={g.PLOT.h} rx={6} />
            </clipPath>
            <pattern id="fl-hatch" width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(-58)">
              <rect width={7} height={7} fill="none" />
              <line x1={0} y1={0} x2={0} y2={7} stroke="#ffffff" strokeWidth={2.2} />
            </pattern>
            <linearGradient id="fl-hi" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={C.teal} />
              <stop offset="1" stopColor={C.pink} />
            </linearGradient>
          </defs>
          {/* tab */}
          <path d="M 0 0 L 300 0 Q 304 0 304 4 L 304 24 Q 304 34 294 34 L 0 34 Z" fill={C.purple} />
          <rect x={16} y={42} width={562} height={4} fill={C.purple} />
          {/* plot */}
          <rect x={g.PLOT.x - 128} y={g.PLOT.y - 89} width={g.PLOT.w} height={g.PLOT.h} rx={6} fill={C.plot} stroke={C.purple} strokeWidth={2} />
          <g transform="translate(-128 -89)" clipPath="url(#fl-plot)">
            {/* bars */}
            {bars.map((b) => (
              <rect key={b.i} x={b.x} y={g.PEAK} width={b.w} height={g.OY - g.PEAK} fill={C.purple} opacity={b.a * lerp(0.35, 1, barTone)} />
            ))}
            {/* white exposure area */}
            {p.white &&
              bars.map((b) => {
                const t = sv(f, p.white!, b.i);
                return t > 0 ? <rect key={b.i} x={b.x} y={g.PEAK} width={b.w} height={g.OY - g.PEAK} fill="#fff" opacity={t} clipPath="url(#fl-under-abs)" /> : null;
              })}
            {/* hatch, wiped in left to right per bar */}
            {p.hatch &&
              bars.map((b) => {
                const t = sv(f, p.hatch!, b.i);
                const fade = p.white ? 1 - sv(f, p.white, b.i) : 1;
                return t > 0 ? (
                  <g key={b.i} clipPath="url(#fl-under-abs)" opacity={fade}>
                    <rect x={b.x} y={g.PEAK} width={b.w * t} height={g.OY - g.PEAK} fill="url(#fl-hatch)" />
                  </g>
                ) : null;
              })}
            {/* levelled flat area */}
            {p.level &&
              bars.map((b) => {
                const t = sv(f, p.level!, b.i);
                if (t <= 0) return null;
                const ly = g.OY - (g.OY - g.PEAK) * p.level!.height;
                const top = lerp(g.PEAK, ly, t);
                return (
                  <g key={b.i}>
                    <rect x={b.x} y={g.PEAK} width={b.w} height={Math.max(0, top - g.PEAK)} fill={C.purple} />
                    <rect x={b.x} y={top} width={b.w} height={g.OY - top} fill="#fff" opacity={t} />
                  </g>
                );
              })}
          </g>
          <defs>
            <clipPath id="fl-under-abs">
              <path d={underD} />
            </clipPath>
          </defs>
          <g transform="translate(-128 -89)">
            {/* arcs */}
            <g clipPath="url(#fl-reveal-abs)">
              {Array.from({length: nArcs}, (_, i) => (
                <path key={i} d={arcPath(g, g.OX + i * P, P)} fill="none" stroke={mix(toneOf(i))} strokeWidth={2.6} strokeLinejoin="round" />
              ))}
            </g>
            {/* arcs inside bars drawn light */}
            {bars.length > 0 && (
              <g clipPath="url(#fl-bars-abs)">
                {Array.from({length: nArcs}, (_, i) => (
                  <path key={i} d={arcPath(g, g.OX + i * P, P)} fill="none" stroke={C.barLight} strokeWidth={2.6} opacity={Math.max(...bars.map((b) => b.a)) * barTone} />
                ))}
              </g>
            )}
            {/* moving highlight along one arc */}
            {p.arcHi &&
              (() => {
                const h = p.arcHi;
                const k = Math.floor((f - h.start) / h.perArc);
                if (f < h.start || k >= h.count) return null;
                const t = ((f - h.start) % h.perArc) / h.perArc;
                const i = h.first + k;
                return <path d={arcPath(g, g.OX + i * P, P)} pathLength={1} fill="none" stroke="url(#fl-hi)" strokeWidth={3.4} strokeDasharray={`${Math.min(1, t * 1.6)} 2`} strokeLinecap="round" />;
              })()}
            {/* frame ticks */}
            {ticks &&
              slots.map((b) => {
                const a = sv(f, ticks.inS, b.i) * (1 - sv(f, ticks.outS, b.i));
                if (a <= 0) return null;
                return (
                  <g key={b.i} opacity={a}>
                    <line x1={b.x} y1={g.PEAK - 6} x2={b.x} y2={lerp(g.PEAK, g.OY, a)} stroke={C.purple} strokeWidth={1.6} />
                    <circle cx={b.x} cy={lerp(g.PEAK, g.OY, 0.62)} r={2.2} fill={C.pink} />
                    <circle cx={b.x} cy={lerp(g.PEAK, g.OY, 0.72)} r={2.2} fill={C.teal} />
                  </g>
                );
              })}
            {/* axes */}
            <g stroke={C.purple} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1={g.PLOT.x} y1={g.OY} x2={g.XR - 8} y2={g.OY} />
              <path d={`M ${g.XR - 18} ${g.OY - 7} L ${g.XR - 9} ${g.OY} L ${g.XR - 18} ${g.OY + 7}`} />
              <line x1={g.OX} y1={g.PLOT.y + g.PLOT.h} x2={g.OX} y2={g.YTOP} />
              <path d={`M ${g.OX - 7} ${g.YTOP + 9} L ${g.OX} ${g.YTOP} L ${g.OX + 7} ${g.YTOP + 9}`} />
            </g>
            {/* axis highlights */}
            {p.axisTags?.x &&
              (() => {
                const a = stag(f, p.axisTags.x[0], 0, 14, 0) * (1 - stag(f, p.axisTags.x[1], 0, 10, 0));
                const gr = stag(f, p.axisTags.x[0], 0, 22, 0);
                return a > 0 ? <line x1={g.PLOT.x + 2} y1={g.OY - 6} x2={lerp(g.PLOT.x + 2, 225, gr)} y2={g.OY - 6} stroke={C.pink} strokeWidth={2.4} opacity={a} /> : null;
              })()}
            {p.axisTags?.y &&
              (() => {
                const a = stag(f, p.axisTags.y[0], 0, 14, 0) * (1 - stag(f, p.axisTags.y[1], 0, 10, 0));
                const gr = stag(f, p.axisTags.y[0], 0, 22, 0);
                return a > 0 ? <line x1={g.OX} y1={g.OY + 36} x2={g.OX} y2={lerp(g.OY + 36, g.YTOP + 9, gr)} stroke={C.pink} strokeWidth={3} opacity={a} /> : null;
              })()}
            {p.axisTags?.ring &&
              (() => {
                const a = stag(f, p.axisTags.ring[0], 0, 10, 0) * (1 - stag(f, p.axisTags.ring[1], 0, 10, 0));
                const gr = stag(f, p.axisTags.ring[0], 0, 18, 0);
                return a > 0 ? <ellipse cx={176} cy={164} rx={18} ry={11} fill="none" stroke={C.teal} strokeWidth={1.6} strokeDasharray="3 2.5" opacity={a} pathLength={1} style={{}} transform={`rotate(${-180 * (1 - gr)} 176 164)`} /> : null;
              })()}
          </g>
        </svg>
        {/* text layer (not stretched) */}
        <div style={{position: 'absolute', left: 0, top: 0, width: card.w, height: card.h, fontFamily: CJK, fontWeight: 900, color: C.purple, opacity: it < 1 ? 0 : 1}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: 304, height: 34, lineHeight: '34px', textAlign: 'center', color: '#fff', fontSize: 19, letterSpacing: 0.5, opacity: titleT, transform: `translateX(${(1 - titleT) * -30}px)`}}>{p.title}</div>
          {(() => {
            const yt = p.axisTags?.y ? stag(f, p.axisTags.y[0], 0, 12, 0) * (1 - stag(f, p.axisTags.y[1], 0, 10, 0)) : 0;
            return (
              <div style={{position: 'absolute', left: g.OX - 18 - 128 - 3, top: g.YTOP - 30 - 89, fontSize: 18, padding: '0 3px', borderRadius: 2, background: `rgba(95,227,200,${yt})`}}>{p.yLabel}</div>
            );
          })()}
          {(() => {
            const xt = p.axisTags?.x ? stag(f, p.axisTags.x[0], 0, 12, 0) * (1 - stag(f, p.axisTags.x[1], 0, 10, 0)) : 0;
            return (
              <div style={{position: 'absolute', left: g.XR - 73 - 128 - 3, top: g.OY + 7 - 89, fontSize: 19, padding: '0 3px', borderRadius: 2, background: `rgba(95,227,200,${xt})`}}>{p.xLabel}</div>
            );
          })()}
          {ticks &&
            slots.map((b) => {
              const a = sv(f, ticks.inS, b.i) * (1 - sv(f, ticks.outS, b.i));
              return a > 0 ? (
                <div key={b.i} style={{position: 'absolute', left: b.x - 128 - 12, top: g.PEAK - 89 - 26 + (1 - a) * 6, width: 24, textAlign: 'center', fontSize: 10, opacity: a}}>
                  {ticks.label}
                </div>
              ) : null;
            })}
          {hdr.map((h, i) => {
            const a = stag(f, h.from, 0, 12, 0) * (h.to === undefined ? 1 : 1 - stag(f, h.to, 0, 10, 0));
            const base: React.CSSProperties = {position: 'absolute', top: 0, height: 34, display: 'flex', alignItems: 'center', opacity: a, transform: `translateX(${(1 - a) * 16}px)`};
            if (h.kind === 'slider') {
              const v = keyed(f, h.value);
              return (
                <div key={i} style={{...base, left: 314, width: 270}}>
                  <span style={{fontSize: 18}}>{h.label}</span>
                  <div style={{position: 'absolute', left: 90, top: 15, width: 173, height: 4, background: C.purple, borderRadius: 2}} />
                  <div style={{position: 'absolute', left: 90 + v * 173 - 9, top: 8, width: 18, height: 18, borderRadius: 9, background: C.purple}}>
                    <div style={{position: 'absolute', left: 5, top: 5, width: 8, height: 8, borderRadius: 4, background: '#fff'}} />
                  </div>
                </div>
              );
            }
            if (h.kind === 'fps') {
              const v = keyed(f, h.value);
              return (
                <div key={i} style={{...base, right: 60, fontSize: 19, gap: 8}}>
                  <span>{h.label}</span>
                  <Rolling v={v} h={24} />
                  <span>{h.unit}</span>
                </div>
              );
            }
            return (
              <div key={i} style={{...base, right: 28, fontSize: 16.5, whiteSpace: 'pre'}}>
                {h.text}
              </div>
            );
          })}
          {p.media && (
            <div style={{position: 'absolute', left: 147 - 128, top: 142 - 89, width: 263, height: 245, borderRadius: 4, overflow: 'hidden', opacity: stag(f, p.media.from, 0, 10, 0)}}>
              <Bulb f={f} />
            </div>
          )}
          {p.pill &&
            (() => {
              const a = stag(f, p.pill.from, 0, 12, 0);
              return (
                <div style={{position: 'absolute', left: 447 - 128, top: 345 - 89, width: 199, height: 25, borderRadius: 4, background: C.purple, color: '#fff', fontSize: 14.5, letterSpacing: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, opacity: a, transform: `scaleX(${0.6 + 0.4 * a})`}}>
                  <span>{p.pill.label}</span>
                  <span style={{display: 'flex', gap: 8}}>
                    <Rolling v={keyed(f, p.pill.value)} h={25} />
                    <span>{p.pill.unit}</span>
                  </span>
                </div>
              );
            })()}
          {p.footer && (
            <div style={{position: 'absolute', left: 168, top: 284, fontSize: 10.5, fontWeight: 900, opacity: stag(f, p.footer.from, 0, 12, 0), wordSpacing: 6}}>{p.footer.text}</div>
          )}
        </div>
      </div>
      {/* clip paths in absolute (design) coordinates, referenced by the translated groups */}
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <defs>
          <clipPath id="fl-reveal-abs">
            <rect x={g.OX - 3} y={0} width={revealX - g.OX + 3} height={480} />
          </clipPath>
          <clipPath id="fl-bars-abs">
            {bars.map((b) => (
              <rect key={b.i} x={b.x} y={g.PEAK - 4} width={b.w} height={g.OY - g.PEAK + 4} />
            ))}
          </clipPath>
        </defs>
      </svg>
    </Stage>
  );
};
