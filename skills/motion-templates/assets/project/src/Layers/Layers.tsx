import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, Freeze, useCurrentFrame} from 'remotion';
import {ensureFonts} from '../fonts';
import {CJK, ensureCjk} from '../Lidar/cjk';
import {lerp, ramp} from '../Lidar/util';
import {Mosaic} from './Mosaic';
import {Stack3D} from './Stack3D';
import {H, place, project, threeCamera, W} from './stack';
import type {LayersProps} from './types';

type R4 = [number, number, number, number];

const cardRect = (frame: number, p: LayersProps): R4 => {
  const t = ramp(frame, p.intro.at, p.intro.at + p.intro.frames, [0.3, 0.05, 0.15, 1]);
  return p.intro.card.map((v, i) => lerp(p.intro.cell[i], v, t)) as R4;
};

/** Light rays: from above into the lens, converging to the filter, recoloured below it. */
const Rays: React.FC<{frame: number; props: LayersProps}> = ({frame, props}) => {
  const {rays} = props;
  const show = ramp(frame, rays.at, rays.at + rays.frames, [0.4, 0, 0.6, 1]);
  const out = 1 - ramp(frame, rays.outAt, rays.outAt + 6);
  if (show <= 0 || out <= 0) return null;
  const cam = threeCamera(frame, props);
  const placed = place(frame, props);
  const L = placed.find((q) => q.layer.id === rays.lens)!;
  const F = placed.find((q) => q.layer.id === rays.filter)!;
  const S = placed.find((q) => q.layer.id === rays.sink)!;
  const lensTop = L.y0 + L.layer.height;
  const top = lensTop + 230;
  const filterTop = F.y0 + F.layer.height;
  const color = ramp(frame, rays.colorAt, rays.colorAt + 8);
  const lines: React.ReactNode[] = [];
  L.xs.forEach((x, c) => {
    [-11, 0, 11].forEach((o, k) => {
      // segment 1+2 as one polyline, revealed from the top down
      const yEnd = lerp(top, filterTop, show);
      const pts: [number, number][] = [];
      const yBend = L.y0 + L.layer.height * 0.6;
      pts.push(project(cam, x + o, top, 0));
      if (yEnd < yBend) {
        pts.push(project(cam, x + o, yBend, 0));
        const u = (yBend - yEnd) / (yBend - filterTop);
        pts.push(project(cam, x + lerp(o, o * 0.45, u), yEnd, 0));
      } else pts.push(project(cam, x + o, yEnd, 0));
      lines.push(
        <polyline key={`r${c}${k}`} points={pts.map((q) => q.join(',')).join(' ')} fill="none" stroke={props.palette.ray} strokeWidth={1.3} opacity={0.95 * out} />,
      );
      if (color > 0) {
        const a = project(cam, x + o * 0.5, F.y0, 0);
        const b = project(cam, x + o * 0.5, lerp(F.y0, S.y0 + S.layer.height, color), 0);
        lines.push(<line key={`c${c}${k}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={rays.colors[c % rays.colors.length]} strokeWidth={2} opacity={out} />);
      }
    });
  });
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      {lines}
    </svg>
  );
};

/** Leader-line labels anchored to column 0 of each layer. */
const Labels: React.FC<{frame: number; props: LayersProps}> = ({frame, props}) => {
  const cam = threeCamera(frame, props);
  const placed = place(frame, props);
  const nodes: React.ReactNode[] = [];
  for (const q of placed) {
    const lb = q.layer.label;
    if (!lb) continue;
    const grow = ramp(frame, lb.at, lb.at + 8);
    const fade = lb.outAt !== undefined ? 1 - ramp(frame, lb.outAt, lb.outAt + 5) : 1;
    if (grow <= 0 || fade <= 0) continue;
    const x0 = q.xs[0] - q.width / 2;
    const a = project(cam, x0 + lb.dx, q.y0 + q.layer.height + lb.dy, q.layer.depth / 2);
    const ty = a[1] - 26;
    const tx = a[0] - 100;
    const bendX = a[0] - 34;
    // polyline: text end -> bend -> anchor, drawn progressively
    const seg1 = bendX - (tx + 4);
    const seg2 = Math.hypot(a[0] - bendX, a[1] - ty);
    const total = seg1 + seg2;
    nodes.push(
      <g key={q.layer.id} opacity={fade}>
        <polyline points={`${tx + 4},${ty} ${bendX},${ty} ${a[0]},${a[1]}`} fill="none" stroke={props.palette.ink} strokeWidth={1.4}
          strokeDasharray={`${total * grow} ${total}`} />
        {grow > 0.9 ? <rect x={a[0] - 3.5} y={a[1] - 3.5} width={7} height={7} fill={props.palette.ink} /> : null}
        <text x={tx} y={ty + 4} textAnchor="end" fontFamily={CJK} fontWeight={900} fontSize={11} fill={props.palette.label} opacity={ramp(frame, lb.at + 3, lb.at + 9)}>
          {lb.text}
        </text>
      </g>,
    );
  }
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      {nodes}
    </svg>
  );
};

const Captions: React.FC<{frame: number; props: LayersProps}> = ({frame, props}) => {
  const c = props.captions.find((x) => frame >= x.from && frame <= x.to);
  if (!c) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 422, textAlign: 'center', fontFamily: CJK, fontWeight: 500, fontSize: 20.5,
      color: '#fff', textShadow: '0 0 1.5px #000, 0 0 3px rgba(0,0,0,0.85), 0 1px 4px rgba(0,0,0,0.5)', letterSpacing: 1}}>
      {c.text}
    </div>
  );
};

export const Layers: React.FC<LayersProps> = (props) => {
  ensureFonts();
  ensureCjk([...props.captions.map((c) => c.text), ...props.layers.map((l) => l.label?.text ?? '')]);
  const frame = useCurrentFrame();
  const r = cardRect(frame, props);
  const z = ramp(frame, props.intro.at, props.intro.at + props.intro.frames, [0.3, 0.05, 0.15, 1]);
  const {cell, card, bgScale, bgBlur} = props.intro;
  // Mosaic zooms about the cell centre while that centre travels to the card centre.
  const s = lerp(1, bgScale, z);
  const ccx = (cell[0] + cell[2]) / 2, ccy = (cell[1] + cell[3]) / 2;
  const tcx = lerp(ccx, (card[0] + card[2]) / 2, z), tcy = lerp(ccy, (card[1] + card[3]) / 2, z);
  const clip = `inset(${r[1]}px ${W - r[2]}px ${H - r[3]}px ${r[0]}px)`;
  return (
    <AbsoluteFill style={{background: props.palette.paper}}>
      <AbsoluteFill style={{transform: `translate(${tcx - ccx * s}px, ${tcy - ccy * s}px) scale(${s})`, transformOrigin: '0 0',
        filter: z > 0.02 ? `blur(${bgBlur * z}px)` : undefined}}>
        <Mosaic hole={cell} />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: r[0], top: r[1], width: r[2] - r[0], height: r[3] - r[1], background: props.palette.card,
        boxShadow: `0 0 0 1.5px ${props.palette.ink}`}} />
      <AbsoluteFill style={{clipPath: clip}}>
        <ThreeCanvas width={W} height={H} flat gl={{antialias: true, alpha: true, preserveDrawingBuffer: true}}>
          <Stack3D frame={frame} props={props} />
        </ThreeCanvas>
        <Rays frame={frame} props={props} />
        <Labels frame={frame} props={props} />
      </AbsoluteFill>
      <Captions frame={frame} props={props} />
    </AbsoluteFill>
  );
};

export const LayersProbe: React.FC<LayersProps & {probe: number[]}> = ({probe, ...props}) => {
  const f = useCurrentFrame();
  return (
    <Freeze frame={probe[Math.min(f, probe.length - 1)]}>
      <Layers {...props} />
    </Freeze>
  );
};
