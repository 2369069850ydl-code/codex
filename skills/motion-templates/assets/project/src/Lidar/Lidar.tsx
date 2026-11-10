import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {AbsoluteFill, Freeze, useCurrentFrame} from 'remotion';
import {ensureFonts, FONT_FAMILY} from '../fonts';
import {Chart} from './Chart';
import {CJK, ensureCjk} from './cjk';
import {Frame, layoutAt, TitleCard, ViewBorder} from './Frame';
import {CAR} from './Props3D';
import {carPosAt, Scene3D} from './Scene3D';
import type {LidarProps, Vec3} from './types';
import {cameraAt, lerp, ramp} from './util';

export const W = 852;
export const H = 480;

const project = (p: Vec3, cam: THREE.PerspectiveCamera): [number, number, number] => {
  const v = new THREE.Vector3(...p).project(cam);
  return [((v.x + 1) / 2) * W, ((1 - v.y) / 2) * H, v.z];
};

const camFor = (frame: number, props: LidarProps) => {
  const c = cameraAt(frame, props.camera);
  const cam = new THREE.PerspectiveCamera(c.fov, W / H, 0.1, 600);
  cam.position.set(...c.pos);
  cam.lookAt(...c.look);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  return cam;
};

const add3 = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

/** Coordinate label next to the LiDAR and the dashed distance line (2D, projected from 3D). */
const Overlays: React.FC<{frame: number; props: LidarProps}> = ({frame, props}) => {
  const cam = camFor(frame, props);
  const car = carPosAt(frame, props.scene.car);
  const out: React.ReactNode[] = [];
  const {label, distance, palette} = props;
  // Label: a bar grows out of the LiDAR box, then the text appears.
  const lo = ramp(frame, label.at, label.at + 6) * (1 - ramp(frame, label.outAt, label.outAt + 6));
  if (lo > 0) {
    const anchor = add3(car, CAR.labelAnchor);
    const a = project(anchor, cam);
    const b = project(add3(anchor, [0, 0.5, 0]), cam);
    const k = Math.hypot(a[0] - b[0], a[1] - b[1]) / 50; // label scale ~ apparent size of the box
    const grow = ramp(frame, label.at, label.at + 6);
    const txt = frame >= label.at + 7;
    out.push(
      <div key="lab" style={{position: 'absolute', left: a[0], top: a[1], transform: `scale(${k})`, transformOrigin: '0 0', opacity: lo}}>
        <div style={{position: 'absolute', left: 0, top: -6, width: 82 * grow, height: 19, background: palette.blue,
          transform: 'skewY(-6deg)', transformOrigin: '0 50%'}} />
        {txt ? (
          <div style={{position: 'absolute', left: 4, top: -7, fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 15, color: '#fff', whiteSpace: 'nowrap',
            transform: 'skewY(-6deg)'}}>
            {label.text.split(/(\d+)/).map((part, i) => (i % 2 ? <sub key={i} style={{fontSize: 10, verticalAlign: -2}}>{part}</sub> : part))}
          </div>
        ) : null}
        {txt ? (
          <>
            <div style={{position: 'absolute', left: 88, top: -14, width: 4, height: 7, background: palette.blue, transform: 'skewX(-15deg)'}} />
            <div style={{position: 'absolute', left: 85, top: 2, width: 4, height: 7, background: palette.blue, transform: 'skewX(-15deg)'}} />
          </>
        ) : null}
      </div>,
    );
  }
  // Distance line: start dot on the car side, dashed line to target 0, later to target 1.
  const d0 = ramp(frame, distance.at - 8, distance.at - 4);
  if (d0 > 0 && (distance.outAt === undefined || frame < distance.outAt)) {
    const p0 = add3(car, CAR.side);
    const t0 = props.scene.targets[0].pos;
    const p1: Vec3 = [t0[0] - 0.2, p0[1], p0[2]];
    const g1 = ramp(frame, distance.at, distance.at + distance.frames, [0.4, 0, 0.3, 1]);
    const far = props.scene.targets[1];
    const p2: Vec3 | null = far ? [far.pos[0] - 0.1, p0[1], p0[2]] : null;
    const g2 = p2 ? ramp(frame, distance.farAt, distance.farAt + distance.farFrames, [0.4, 0, 0.3, 1]) : 0;
    const endW: Vec3 = g2 > 0 && p2 ? [lerp(p1[0], p2[0], g2), p0[1], p0[2]] : [lerp(p0[0], p1[0], g1), p0[1], p0[2]];
    const A = project(p0, cam), B = project(endW, cam);
    const endDot = g2 > 0.98 || (g2 === 0 && g1 > 0.98);
    out.push(
      <svg key="dist" style={{position: 'absolute', inset: 0}} width={W} height={H}>
        {g1 > 0 ? <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={palette.blue} strokeWidth={2.6} strokeDasharray="7 5" /> : null}
        <circle cx={A[0]} cy={A[1]} r={5.2 * d0} fill={palette.blue} />
        {endDot ? <circle cx={B[0]} cy={B[1]} r={5.2} fill={palette.blue} /> : null}
      </svg>,
    );
  }
  return <>{out}</>;
};

const Captions: React.FC<{frame: number; props: LidarProps}> = ({frame, props}) => {
  const c = props.captions.find((x) => frame >= x.from && frame <= x.to);
  if (!c) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 422, textAlign: 'center', fontFamily: CJK, fontWeight: 500, fontSize: 20.5,
      color: '#fff', textShadow: '0 0 1.5px #000, 0 0 3px rgba(0,0,0,0.85), 0 1px 4px rgba(0,0,0,0.5)', letterSpacing: 1}}>
      {c.text}
    </div>
  );
};

export const Lidar: React.FC<LidarProps> = (props) => {
  ensureFonts();
  ensureCjk([props.title.zh, props.chart.badge, ...props.captions.map((c) => c.text)]);
  const frame = useCurrentFrame();
  const layout = layoutAt(frame, props);
  return (
    <AbsoluteFill style={{background: props.palette.paper}}>
      <AbsoluteFill>
        {/* Rendered below full resolution and upscaled: softer image (like the reference) and much
            cheaper than a CSS blur filter on the WebGL canvas. */}
        <ThreeCanvas width={W} height={H} shadows flat gl={{antialias: true, preserveDrawingBuffer: true}}>
          <Scene3D frame={frame} props={props} />
        </ThreeCanvas>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 70% at 55% 50%, rgba(0,0,0,0) 55%, rgba(30,30,40,0.16) 100%)'}} />
      <Overlays frame={frame} props={props} />
      <ViewBorder layout={layout} ink={props.palette.ink} />
      <Frame frame={frame} props={props} layout={layout} />
      <TitleCard frame={frame} props={props} layout={layout} />
      <Chart frame={frame} props={props} layout={layout} />
      <Captions frame={frame} props={props} />
    </AbsoluteFill>
  );
};

/** Debug: shows a list of frames (props.probe) one after another, for still comparisons. */
export const LidarProbe: React.FC<LidarProps & {probe: number[]}> = ({probe, ...props}) => {
  const f = useCurrentFrame();
  return <FrozenLidar at={probe[Math.min(f, probe.length - 1)]} props={props} />;
};

const FrozenLidar: React.FC<{at: number; props: LidarProps}> = ({at, props}) => (
  <Freeze frame={at}>
    <Lidar {...props} />
  </Freeze>
);
