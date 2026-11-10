import React from 'react';
import {FONT_FAMILY} from '../fonts';
import {CJK} from './cjk';
import type {LidarProps} from './types';
import {keyed, lerp, ramp} from './util';

// Mondrian-style frame around the 3D window. Three layouts: A = title card, B = 3D window,
// C = 3D window + left chart panel. Every cell is interpolated between the layouts.

type R = [x0: number, y0: number, x1: number, y1: number];
type Cell = {id: string; fill: 'w' | 'k' | 'b' | 'view'; A: R; B: R; C: R};

const CELLS: Cell[] = [
  {id: 'k1', fill: 'k', A: [0, 0, 144, 100], B: [0, 0, 137, 28], C: [0, 0, 137, 28]},
  {id: 'b1', fill: 'b', A: [144, 0, 208, 100], B: [137, 0, 201, 28], C: [137, 0, 201, 28]},
  {id: 'w1', fill: 'w', A: [208, 0, 469, 100], B: [201, 0, 461, 28], C: [201, 0, 461, 28]},
  {id: 'w2', fill: 'w', A: [469, 0, 664, 100], B: [461, 0, 801, 28], C: [461, 0, 801, 28]},
  {id: 'w3', fill: 'w', A: [664, 0, 852, 115], B: [801, 0, 852, 120], C: [801, 0, 852, 28]},
  {id: 'left', fill: 'w', A: [0, 100, 144, 424], B: [0, 28, 48, 451], C: [0, 28, 267, 451]},
  {id: 'view', fill: 'view', A: [144, 100, 664, 412], B: [48, 28, 801, 451], C: [267, 28, 852, 451]},
  {id: 'orbit', fill: 'b', A: [664, 115, 852, 372], B: [801, 120, 852, 378], C: [852, 120, 920, 378]},
  {id: 'k2', fill: 'k', A: [664, 372, 736, 424], B: [801, 378, 852, 434], C: [852, 378, 920, 434]},
  {id: 'w4', fill: 'w', A: [736, 372, 852, 424], B: [801, 434, 852, 451], C: [852, 434, 920, 451]},
  {id: 'b2', fill: 'b', A: [0, 424, 144, 480], B: [0, 451, 48, 480], C: [0, 451, 267, 480]},
  {id: 'w5', fill: 'w', A: [144, 412, 608, 480], B: [48, 451, 662, 480], C: [267, 451, 662, 480]},
  {id: 'k3', fill: 'k', A: [608, 412, 664, 480], B: [662, 451, 664, 480], C: [662, 451, 664, 480]},
  {id: 'w6', fill: 'w', A: [664, 424, 736, 480], B: [664, 451, 735, 480], C: [664, 451, 735, 480]},
  {id: 'lidar', fill: 'b', A: [736, 424, 852, 480], B: [735, 451, 852, 480], C: [735, 451, 852, 480]},
];

export type Layout = Record<string, R>;

export const layoutAt = (frame: number, p: LidarProps): Layout => {
  const z = ramp(frame, p.intro.zoomAt, p.intro.zoomAt + p.intro.zoomFrames, [0.25, 0.1, 0.1, 1]);
  const c = ramp(frame, p.panel.at, p.panel.at + p.panel.frames, [0.3, 0.4, 0.1, 1]);
  const out: Layout = {};
  for (const cell of CELLS) {
    const ab = cell.A.map((v, i) => lerp(v, cell.B[i], z)) as R;
    out[cell.id] = ab.map((v, i) => lerp(v, cell.C[i], c)) as R;
  }
  return out;
};

const OrbitArt: React.FC<{r: R; scale: number; frame: number; ink: string}> = ({r, scale, frame, ink}) => {
  const a = frame * 0.035;
  return (
    <svg style={{position: 'absolute', left: r[0], top: r[1], width: r[2] - r[0], height: r[3] - r[1], overflow: 'hidden'}}>
      <g transform={`scale(${scale})`} fill="none" stroke={ink} strokeWidth={2}>
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx={95} cy={115} rx={88 + i * 12} ry={38 + i * 6} transform={`rotate(35 95 115)`} />
        ))}
        <ellipse cx={92} cy={213} rx={36} ry={9} fill={ink} stroke="none" />
        <circle cx={95 + Math.cos(a) * 34} cy={128 + Math.sin(a) * 6} r={22} fill="#fff" stroke={ink} strokeWidth={3} />
        {[0.4, 1.9, 3.6, 5.0].map((o, i) => {
          const t = a * 1.6 + o;
          return <circle key={i} cx={95 + Math.cos(t) * 95} cy={115 + Math.sin(t) * 60} r={10 - i} fill="#fff" stroke="none" />;
        })}
        <rect x={125} y={20} width={50} height={6} fill={ink} stroke="none" />
        <rect x={16} y={236} width={160} height={3} fill="#fff" stroke="none" />
        <rect x={8} y={226} width={6} height={6} fill={ink} stroke="none" />
      </g>
    </svg>
  );
};

const RingText: React.FC<{r: R; text: string; ink: string}> = ({r, text, ink}) => {
  const cx = 58, cy = 58;
  const s = text.split('');
  return (
    <svg style={{position: 'absolute', left: r[0], top: r[1], width: r[2] - r[0], height: r[3] - r[1], overflow: 'hidden'}}>
      {s.concat(s).map((ch, i) => {
        const ang = (i / (s.length * 2)) * Math.PI * 2;
        return (
          <text key={i} x={cx + Math.cos(ang) * 40} y={cy + Math.sin(ang) * 40} fontFamily={FONT_FAMILY} fontWeight={700} fontSize={14} fill={ink}
            textAnchor="middle" transform={`rotate(${(ang * 180) / Math.PI + 90} ${cx + Math.cos(ang) * 40} ${cy + Math.sin(ang) * 40})`}>
            {ch}
          </text>
        );
      })}
    </svg>
  );
};

/** Frame cells drawn over the 3D canvas; the 'view' cell is a hole with a border. */
export const Frame: React.FC<{frame: number; props: LidarProps; layout: Layout}> = ({frame, props, layout}) => {
  const {palette} = props;
  const col = {w: palette.paper, k: palette.ink, b: palette.blue};
  const z = ramp(frame, props.intro.zoomAt, props.intro.zoomAt + props.intro.zoomFrames, [0.25, 0.1, 0.1, 1]);
  return (
    <>
      {Object.entries(layout).map(([id, r]) => {
        const cell = CELLS.find((c) => c.id === id)!;
        if (cell.fill === 'view') return null;
        return (
          <div key={id} style={{position: 'absolute', left: r[0], top: r[1], width: Math.max(0, r[2] - r[0]), height: Math.max(0, r[3] - r[1]),
            background: col[cell.fill], boxShadow: `0 0 0 1.5px ${palette.ink}`}} />
        );
      })}
      <OrbitArt r={layout.orbit} scale={lerp(1, 1.45, z)} frame={frame} ink={palette.ink} />
      <RingText r={layout.lidar} text="LIDAR" ink={palette.ink} />
    </>
  );
};

/** White cover over the 3D window (title card), then the flickering title. */
export const TitleCard: React.FC<{frame: number; props: LidarProps; layout: Layout}> = ({frame, props, layout}) => {
  const r = layout.view;
  const cover = 1 - ramp(frame, props.intro.cityFadeAt, props.intro.cityFadeAt + props.intro.cityFadeFrames, [0.4, 0, 0.6, 1]);
  const o = keyed(frame, props.intro.titleOpacity);
  if (cover <= 0.001 && o <= 0.001) return null;
  const w = r[2] - r[0];
  const k = w / 518;
  return (
    <div style={{position: 'absolute', left: r[0], top: r[1], width: w, height: r[3] - r[1], overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, background: props.palette.paper, opacity: cover}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: (r[3] - r[1]) / 2 - 64 * k, textAlign: 'center', opacity: o}}>
        <div style={{fontFamily: CJK, fontWeight: 900, fontSize: 64 * k, letterSpacing: 24 * k, marginRight: -24 * k, color: '#111', lineHeight: 1.15}}>
          {props.title.zh}
        </div>
        <div style={{fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 38 * k, color: '#5246d8', marginTop: 4 * k}}>{props.title.en}</div>
      </div>
    </div>
  );
};

export const ViewBorder: React.FC<{layout: Layout; ink: string}> = ({layout, ink}) => {
  const r = layout.view;
  return <div style={{position: 'absolute', left: r[0], top: r[1], width: r[2] - r[0], height: r[3] - r[1], boxShadow: `inset 0 0 0 2px ${ink}`}} />;
};
