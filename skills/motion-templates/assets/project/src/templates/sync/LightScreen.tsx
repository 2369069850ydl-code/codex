import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, eased, K, keyed} from '../_lib/anim';
import {Backdrop} from '../_lib/backdrop';
import {FilmCamera} from '../_lib/icons';
import {Stage} from '../_lib/stage';

// Two labelled squares: a light that flickers as a whole and a screen refreshed by a rolling scan
// band; optionally a camera flies over them and the two squares merge into one extruded block.

type Pos = {x: K; y: K; s: K; a?: K};
export type LightScreenProps = {
  durationInFrames: number;
  lightLabel: string;
  screenLabel: string;
  lightPeriod: number; // frames per flicker cycle
  screenPeriod: number; // frames per scan pass
  light: Pos;
  screen: Pos;
  camera?: Pos & {r: K};
  extrude?: [number, number]; // frames: start, end of the block connection fade
};

const SIZE = 177;
const C = {dark: [0x29, 0x27, 0x3d], bright: [0x49, 0x45, 0x9f], screen: '#4645d6', band: '#2c2a5c', tag: '#2f3ef0'};
const mix = (a: number[], b: number[], t: number) => `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * t)).join(',')})`;

const Tag: React.FC<{label: string; right?: boolean}> = ({label, right}) => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      [right ? 'right' : 'left']: 0,
      width: 88,
      height: 32,
      background: C.tag,
      color: '#fff',
      fontFamily: CJK,
      fontWeight: 900,
      fontSize: 17,
      letterSpacing: 7,
      lineHeight: '32px',
      textAlign: 'center',
      borderRadius: right ? '0 8px 0 10px' : '8px 0 10px 0',
      textIndent: 7,
    }}
  >
    {label}
  </div>
);

export const LightScreen: React.FC<LightScreenProps> = (p) => {
  const f = useCurrentFrame();
  const at = (q: Pos) => ({x: eased(f, q.x), y: eased(f, q.y), s: eased(f, q.s), a: q.a ? keyed(f, q.a) : 1});
  const L = at(p.light);
  const S = at(p.screen);
  const b = 0.5 + 0.5 * Math.cos((2 * Math.PI * f) / p.lightPeriod);
  const band = ((f % p.screenPeriod) / p.screenPeriod) * (SIZE + 60) - 30;
  const ex = p.extrude ? eased(f, [[p.extrude[0], 0], [p.extrude[1], 1]]) : 0;

  const box = (q: {x: number; y: number; s: number}) => {
    const h = (SIZE * q.s) / 2;
    return {l: q.x - h, t: q.y - h, r: q.x + h, b: q.y + h};
  };
  const lb = box(L);
  const sb = box(S);

  return (
    <Stage texts={[p.lightLabel, p.screenLabel]}>
      <Backdrop />
      {/* light */}
      <div style={{position: 'absolute', left: lb.l, top: lb.t, width: SIZE, height: SIZE, transform: `scale(${L.s})`, transformOrigin: '0 0', opacity: L.a, borderRadius: 10, overflow: 'hidden', background: mix(C.dark, C.bright, b)}}>
        <Tag label={p.lightLabel} />
      </div>
      {/* block connection */}
      {ex > 0 && (
        <svg width={852} height={480} style={{position: 'absolute', left: 0, top: 0, opacity: ex}}>
          <path d={`M ${lb.r - 8} ${lb.t} L ${sb.r - 8} ${sb.t} L ${sb.r} ${sb.t + 8} L ${sb.l} ${sb.b} L ${lb.l} ${lb.b - 8} L ${lb.l + 8} ${lb.b} Z`} fill="rgba(70,66,150,0.55)" />
          <path d={`M ${lb.r - 6} ${lb.t} L ${sb.r - 6} ${sb.t} L ${sb.r} ${sb.t + 6} L ${lb.r} ${lb.t + 6} Z`} fill="rgba(70,66,150,0.7)" />
        </svg>
      )}
      {/* screen */}
      <div style={{position: 'absolute', left: sb.l, top: sb.t, width: SIZE, height: SIZE, transform: `scale(${S.s})`, transformOrigin: '0 0', opacity: S.a, borderRadius: 10, overflow: 'hidden', background: C.screen, boxShadow: ex > 0 ? `0 0 0 ${1.5 * ex}px rgba(255,255,255,0.7)` : undefined}}>
        <div style={{position: 'absolute', left: 0, top: band, width: SIZE, height: 18, background: C.band, filter: 'blur(1px)'}} />
        <div style={{position: 'absolute', left: 0, top: band + 18, width: SIZE, height: 20, background: 'linear-gradient(#3b39a8, rgba(70,69,214,0))'}} />
        <div style={{position: 'absolute', left: 0, top: band - 14, width: SIZE, height: 14, background: 'linear-gradient(rgba(70,69,214,0), #3d3bb0)'}} />
        <Tag label={p.screenLabel} right />
      </div>
      {/* camera */}
      {p.camera &&
        (() => {
          const c = at(p.camera);
          const r = keyed(f, p.camera.r);
          return c.a > 0 ? (
            <div style={{position: 'absolute', left: c.x - 85, top: c.y - 85, width: 170, height: 170, transform: `scale(${c.s}) rotate(${r}deg)`, opacity: c.a, filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.25))'}}>
              <FilmCamera />
            </div>
          ) : null;
        })()}
    </Stage>
  );
};
