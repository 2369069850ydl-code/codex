import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {AbsoluteFill, Freeze, useCurrentFrame} from 'remotion';
import {ensureFonts, FONT_FAMILY} from '../fonts';
import {CJK, ensureCjk} from '../Lidar/cjk';
import {keyed, ramp} from '../Lidar/util';
import type {FinProps} from './types';

const W = 852, H = 480;
const PANEL = {x0: 131, y0: 66, x1: 721, y1: 412};

const Rig: React.FC<{frame: number; p: FinProps}> = ({frame, p}) => {
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const az = (keyed(frame, p.camera.az) * Math.PI) / 180;
  const el = (keyed(frame, p.camera.el) * Math.PI) / 180;
  const d = keyed(frame, p.camera.dist);
  const target = new THREE.Vector3(0, 0.55, 0);
  cam.position.set(target.x + d * Math.cos(el) * Math.sin(az), target.y + d * Math.sin(el), target.z + d * Math.cos(el) * Math.cos(az));
  cam.fov = p.camera.fov;
  cam.aspect = W / H;
  cam.lookAt(target);
  // Screen-space shift of the object: move the projection centre (view offset).
  const sx = keyed(frame, p.camera.shiftX), sy = keyed(frame, p.camera.shiftY);
  cam.setViewOffset(W, H, -sx, -sy, W, H);
  cam.updateProjectionMatrix();
  return null;
};

// transparent must be fixed when the material is created (toggling it later is ignored), so any
// part that ever fades passes an opacity and is transparent from the start.
const Mat: React.FC<{color: string; metal?: number; rough?: number; opacity?: number}> = ({color, metal = 0.1, rough = 0.55, opacity}) => (
  <meshStandardMaterial color={color} metalness={metal} roughness={rough} transparent={opacity !== undefined} opacity={opacity ?? 1} />
);

const Box: React.FC<{c: [number, number, number]; s: [number, number, number]; color: string; metal?: number; rough?: number; opacity?: number}> = ({c, s, ...m}) =>
  s[0] <= 0.0001 || s[1] <= 0.0001 || s[2] <= 0.0001 ? null : (
    <mesh position={c}>
      <boxGeometry args={s} />
      <Mat {...m} />
    </mesh>
  );

const Scene: React.FC<{frame: number; p: FinProps}> = ({frame, p}) => {
  const {base, fin, gate, palette} = p;
  const top = base.height;
  // Fin stand-up: plate lying on the base rotates about the z axis through its right bottom edge.
  const stand = ramp(frame, fin.standAt, fin.standAt + fin.standFrames, [0.45, 0, 0.25, 1]);
  const ang = (1 - stand) * (Math.PI / 2);
  // Multiply: copies slide out from the centre.
  const split = ramp(frame, fin.splitAt, fin.splitAt + fin.splitFrames, [0.4, 0, 0.2, 1]);
  const half = (fin.count - 1) / 2;
  const finsX = frame < fin.splitAt ? [0] : Array.from({length: fin.count}, (_, i) => (i - half) * fin.pitch * split);
  // Gate: lift away (up + fade), later drop in.
  const lift = ramp(frame, gate.liftAt, gate.liftAt + gate.liftFrames, [0.4, 0, 0.6, 1]);
  const drop = ramp(frame, gate.dropAt, gate.dropAt + gate.dropFrames, [0.2, 0.6, 0.3, 1]);
  const gateUp = frame < gate.dropAt ? lift * 2.4 : (1 - drop) * 2.6;
  const gateOp = frame < gate.dropAt ? 1 - lift : Math.min(1, drop * 1.6);
  const planar = frame < gate.dropAt; // before the drop the gate is a plain slab on the flat channel
  const gy = top + 0.03 + gateUp;
  const gateParts: React.ReactNode[] = [];
  const gm = {color: palette.gate, metal: 0.45, rough: 0.35, opacity: gateOp};
  if (gateOp > 0.001) {
    if (planar) {
      gateParts.push(<Box key="pg" c={[0, gy + 0.18, gate.z]} s={[2.0, 0.36, 0.6]} {...gm} />);
    } else {
      // Wrap the fins: top bridge above the fins + pillars between / outside the fins.
      const gh = gate.height, w2 = gate.width / 2, t2 = fin.thickness / 2;
      gateParts.push(<Box key="top" c={[0, gy + fin.height + (gh - fin.height) / 2, gate.z]} s={[gate.width, gh - fin.height, gate.depth]} {...gm} />);
      const xs = [...finsX].sort((a, b) => a - b);
      let x = -w2;
      xs.forEach((fx, i) => {
        gateParts.push(<Box key={`p${i}`} c={[(x + fx - t2) / 2, gy + fin.height / 2, gate.z]} s={[Math.max(0, fx - t2 - x), fin.height, gate.depth]} {...gm} />);
        x = fx + t2;
      });
      gateParts.push(<Box key="pl" c={[(x + w2) / 2, gy + fin.height / 2, gate.z]} s={[Math.max(0, w2 - x), fin.height, gate.depth]} {...gm} />);
    }
  }
  return (
    <>
      <Rig frame={frame} p={p} />
      <hemisphereLight args={['#e8e4ff', '#1a1420', 1.2]} />
      <directionalLight position={[-4, 7, 5]} intensity={2.2} color="#fff3dd" />
      <directionalLight position={[5, 3, -4]} intensity={1.1} color="#d8c8ff" />
      {/* base: olive slab with a dark top coat */}
      <Box c={[0, top / 2, 0]} s={[base.width, top, base.depth]} color={palette.base} rough={0.7} />
      <Box c={[0, top + 0.012, 0]} s={[base.width - 0.06, 0.024, base.depth - 0.06]} color={palette.baseTop} rough={0.9} />
      {finsX.map((fx, i) => (
        <group key={i} position={[fx + fin.thickness / 2, top + 0.024, 0]} rotation={[0, 0, ang]}>
          <mesh position={[-fin.thickness / 2, fin.height / 2, 0]}>
            <boxGeometry args={[fin.thickness, fin.height, fin.length]} />
            <Mat color={palette.fin} rough={0.45} metal={0.2} />
          </mesh>
        </group>
      ))}
      {gateParts}
    </>
  );
};

export const Fin: React.FC<FinProps> = (p) => {
  ensureFonts();
  ensureCjk([p.header.title, p.header.titleTo, ...p.header.steps, p.bigTitle.zh, ...p.captions.map((c) => c.text)]);
  const frame = useCurrentFrame();
  const {header, palette} = p;
  const step = header.stepAt.filter((s) => frame >= s).length - 1;
  const headerOp = 1 - ramp(frame, header.hideAt, header.hideAt + 6);
  const title = frame >= header.titleSwapAt ? header.titleTo : header.title;
  const titleOp = frame >= header.titleSwapAt - 4 && frame < header.titleSwapAt + 4 ? Math.abs(frame - header.titleSwapAt) / 4 : 1;
  const big = ramp(frame, p.bigTitle.at, p.bigTitle.at + 10, [0.2, 0.8, 0.2, 1]);
  const cap = p.captions.find((c) => frame >= c.from && frame <= c.to);
  return (
    <AbsoluteFill style={{background: palette.bg}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <defs>
          <radialGradient id="fg" cx="20%" cy="95%" r="80%">
            <stop offset="0" stopColor={palette.bgGlow} stopOpacity={0.9} />
            <stop offset="1" stopColor={palette.bgGlow} stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#fg)" />
        <g fill="none" stroke="rgba(150,140,200,0.08)">
          {[-1, 0, 1, 2].map((i) => (
            <circle key={i} cx={i * 300 + 120} cy={240} r={300} />
          ))}
        </g>
        <rect x={PANEL.x0} y={PANEL.y0} width={PANEL.x1 - PANEL.x0} height={PANEL.y1 - PANEL.y0} rx={6} fill={palette.panel} stroke={palette.border} strokeWidth={1} />
        {p.watermark.split('\n').map((line, i) => (
          <text key={i} x={(PANEL.x0 + PANEL.x1) / 2} y={215 + i * 120} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={700} fontSize={128}
            fill="rgba(120,120,170,0.07)">
            {line}
          </text>
        ))}
      </svg>
      <ThreeCanvas width={W} height={H} gl={{antialias: true, alpha: true, preserveDrawingBuffer: true}}>
        <Scene frame={frame} p={p} />
      </ThreeCanvas>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: headerOp}}>
        <line x1={148} x2={705} y1={80} y2={80} stroke={palette.border} strokeWidth={1} />
        <text x={148} y={104} fontFamily={CJK} fontWeight={900} fontSize={17} fill={palette.text} letterSpacing={1} opacity={titleOp}>
          {title}
        </text>
        {header.steps.map((s, i) => (
          <text key={i} x={308 + i * 106} y={103} fontFamily={CJK} fontWeight={900} fontSize={8.5} fill={i === step ? palette.text : palette.dim}>
            {s}
          </text>
        ))}
      </svg>
      {big > 0 ? (
        <div style={{position: 'absolute', right: W - 695, top: 88, textAlign: 'right', opacity: big, transform: `translateX(${(1 - big) * 30}px)`}}>
          <div style={{fontFamily: CJK, fontWeight: 900, fontSize: 38, color: palette.text, letterSpacing: 5}}>{p.bigTitle.zh}</div>
          <div style={{fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 44, color: palette.text, marginTop: -2}}>{p.bigTitle.en}</div>
        </div>
      ) : null}
      {cap ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 436, textAlign: 'center', fontFamily: CJK, fontWeight: 500, fontSize: 19, color: '#fff',
          textShadow: '0 0 2px #000, 0 1px 3px rgba(0,0,0,0.7)', letterSpacing: 1}}>
          {cap.text}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const FinProbe: React.FC<FinProps & {probe: number[]}> = ({probe, ...p}) => {
  const f = useCurrentFrame();
  return (
    <Freeze frame={probe[Math.min(f, probe.length - 1)]}>
      <Fin {...p} />
    </Freeze>
  );
};

