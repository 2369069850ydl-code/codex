import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, eased, K, ramp, rng} from '../_lib/anim';
import {Landscape} from '../_lib/landscape';
import {Stage} from '../_lib/stage';

// Chip chain: glowing white tiles (each holding a small chip glyph) enter one by one with a zoom blur,
// the camera re-frames the row as it grows, signal dots travel from one tile to the next and rest at
// the receiving edge, and the scene can leave with a zoom punch (tiles fly outward, blurred) that
// reveals a media card. Works for any "A drives B drives C" pipeline: chips, services, team roles.

export type ChipNode = {
  glyph: string; // text on the chip ("AI", "控制")
  label: string; // caption under the tile
  x: number; // tile centre in design space (852x480)
  y: number;
  size?: number; // tile edge, default 70
  at: number; // frame the tile starts entering (zoom blur in)
  labelAt?: number; // default: with the tile
};
export type ChipPulse = {from: number; to: number; at: number; dur: number; stop?: number /* 0..1 of the way, default 1 */};
export type ChipChainProps = {
  durationInFrames: number;
  nodes: ChipNode[];
  pulses: ChipPulse[];
  camX: K; // horizontal camera offset (px, design space)
  camY: K;
  zoom: K;
  introBlur?: K; // whole-scene blur (e.g. continuing a zoom transition)
  exitAt?: number; // zoom punch start; the reveal card lands ~8 frames later
  reveal?: {w: number; h: number; src?: string}; // src: your image; omitted = drawn landscape
  captions?: [number, string][]; // [start frame, text]
};

const BG: React.FC = () => (
  <>
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(120% 90% at 8% 100%, #2e0c26 0%, rgba(46,12,38,0) 55%), radial-gradient(90% 80% at 100% 80%, #0d0f3a 0%, rgba(13,15,58,0) 60%), linear-gradient(180deg, #17121d 0%, #120c1c 100%)'}} />
    <svg width={852} height={480} style={{position: 'absolute', left: 0, top: 0, opacity: 0.55}}>
      {Array.from({length: 22}, (_, i) => (
        <line key={`v${i}`} x1={i * 40 + 6} y1={0} x2={i * 40 + 6} y2={480} stroke="rgba(255,255,255,0.045)" strokeWidth={1} />
      ))}
      {Array.from({length: 13}, (_, i) => (
        <line key={`h${i}`} x1={0} y1={i * 40 + 2} x2={852} y2={i * 40 + 2} stroke="rgba(255,255,255,0.045)" strokeWidth={1} />
      ))}
    </svg>
  </>
);

const Chip: React.FC<{glyph: string; s: number}> = ({glyph, s}) => {
  const big = glyph.length <= 2 && /^[A-Za-z0-9]+$/.test(glyph);
  const c = s * (big ? 0.52 : 0.5);
  const pins = 5;
  const pin = (i: number) => c * 0.16 + (i * (c * 0.68)) / (pins - 1);
  return (
    <div style={{position: 'relative', width: c, height: c}}>
      <svg width={c + 12} height={c + 12} style={{position: 'absolute', left: -6, top: -6}}>
        {Array.from({length: pins}, (_, i) => (
          <g key={i} stroke="#2b2b30" strokeWidth={1.6} strokeLinecap="round">
            <line x1={6 + pin(i)} y1={1} x2={6 + pin(i)} y2={6} />
            <line x1={6 + pin(i)} y1={c + 6} x2={6 + pin(i)} y2={c + 11} />
            <line x1={1} y1={6 + pin(i)} x2={6} y2={6 + pin(i)} />
            <line x1={c + 6} y1={6 + pin(i)} x2={c + 11} y2={6 + pin(i)} />
          </g>
        ))}
      </svg>
      <div style={{position: 'absolute', inset: 0, borderRadius: c * 0.12, background: '#2d2d33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: CJK, fontWeight: 900, color: '#fff', fontSize: big ? c * 0.36 : c * 0.24, letterSpacing: big ? 1 : 0, whiteSpace: 'nowrap'}}>
        <div style={{position: 'absolute', inset: c * 0.1, border: '1px solid rgba(255,255,255,0.25)', borderRadius: c * 0.08}} />
        {glyph}
      </div>
    </div>
  );
};

export const ChipChain: React.FC<ChipChainProps> = (p) => {
  const f = useCurrentFrame();
  const cx = eased(f, p.camX);
  const cy = eased(f, p.camY);
  const z = eased(f, p.zoom);
  const ib = p.introBlur ? eased(f, p.introBlur) : 0;
  const ex = p.exitAt === undefined ? 0 : ramp(f, p.exitAt, p.exitAt + 8, [0.6, 0, 0.9, 0.6]);
  const texts = [...p.nodes.flatMap((n) => [n.glyph, n.label]), ...(p.captions ?? []).map((c) => c[1])];
  const cap = (p.captions ?? []).filter((c) => f >= c[0]).pop();
  const edge = (n: ChipNode, toward: ChipNode) => {
    const s = (n.size ?? 70) / 2 + 8;
    const dx = toward.x - n.x;
    const dy = toward.y - n.y;
    const l = Math.hypot(dx, dy) || 1;
    const k = Math.min(s / Math.abs(dx || 1e-6), s / Math.abs(dy || 1e-6)) * l; // leave the square border
    return [n.x + (dx / l) * k, n.y + (dy / l) * k];
  };
  const r = rng(5);
  return (
    <Stage bg="#130d1a" texts={texts} weights={['500', '900']}>
      <BG />
      <div style={{position: 'absolute', inset: 0, filter: ib > 0.05 ? `blur(${ib}px)` : undefined}}>
        <div style={{position: 'absolute', inset: 0, transformOrigin: '426px 240px', transform: `translate(${cx}px, ${cy}px) scale(${z})`}}>
          {p.pulses.map((q, i) => {
            const a = p.nodes[q.from];
            const b = p.nodes[q.to];
            const t = ramp(f, q.at, q.at + q.dur, [0.3, 0.1, 0.25, 1]) * (q.stop ?? 1);
            if (f < q.at || ex > 0.6) return null;
            const [x0, y0] = edge(a, b);
            const [x1, y1] = edge(b, a);
            const x = x0 + (x1 - x0) * t;
            const y = y0 + (y1 - y0) * t;
            const moving = f < q.at + q.dur;
            const ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
            return (
              <div key={i} style={{position: 'absolute', left: x - (moving ? 6 : 2.5), top: y - 2.5, width: moving ? 9 : 5, height: 5, borderRadius: 3, background: '#fff', boxShadow: '0 0 6px 1px rgba(255,255,255,0.7)', transform: `rotate(${ang}deg)`, opacity: 0.85 + 0.15 * Math.sin(f * 0.5 + i)}} />
            );
          })}
          {p.nodes.map((n, i) => {
            const s = n.size ?? 70;
            const a = ramp(f, n.at, n.at + 9, [0.15, 0.7, 0.25, 1]);
            if (f < n.at) return null;
            const la = ramp(f, n.labelAt ?? n.at + 2, (n.labelAt ?? n.at + 2) + 8);
            // zoom punch: every tile is pushed outward from the screen centre and smeared
            const dx = n.x - 426;
            const dy = n.y - 240;
            const push = ex * 2.4;
            const blur = (1 - a) * 6 + ex * 9;
            const jitter = r();
            return (
              <div key={i} style={{position: 'absolute', left: n.x + dx * push, top: n.y + dy * push, transform: `scale(${(1.35 - 0.35 * a) * (1 + ex * 1.6)})`, opacity: Math.min(1, a * 1.4) * (1 - ex * (0.6 + 0.3 * jitter)), filter: blur > 0.2 ? `blur(${blur}px)` : undefined}}>
                <div style={{position: 'absolute', left: -s / 2, top: -s / 2, width: s, height: s, borderRadius: s * 0.13, background: 'linear-gradient(160deg, #ffffff, #e9e9ee)', boxShadow: '0 0 18px rgba(255,255,255,0.35), inset 0 0 0 1px rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <Chip glyph={n.glyph} s={s} />
                </div>
                <div style={{position: 'absolute', left: -120, width: 240, top: 59, textAlign: 'center', fontFamily: CJK, fontWeight: 900, fontSize: 10.5, color: '#fff', opacity: la, transform: `translateY(${(1 - la) * 5}px)`, textShadow: '0 0 6px rgba(255,255,255,0.35)', whiteSpace: 'nowrap'}}>
                  {n.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {p.exitAt !== undefined && p.reveal && f >= p.exitAt + 4 && (() => {
        const t = ramp(f, p.exitAt + 4, p.exitAt + 12);
        const {w, h, src} = p.reveal;
        return (
          <div style={{position: 'absolute', left: 426 - w / 2, top: 238 - h / 2, width: w, height: h, overflow: 'hidden', opacity: t, transform: `scale(${1.25 - 0.25 * t})`, filter: t < 0.95 ? `blur(${(1 - t) * 6}px)` : undefined}}>
            {src ? <img src={src} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <Landscape w={w} h={h} seed={4} />}
          </div>
        );
      })()}
      {cap && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', fontFamily: CJK, fontWeight: 900, fontSize: 17, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.6)'}}>{cap[1]}</div>
      )}
    </Stage>
  );
};
