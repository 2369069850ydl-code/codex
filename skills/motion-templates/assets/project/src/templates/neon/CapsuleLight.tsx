import React from 'react';
import {useCurrentFrame} from 'remotion';
import {eased, K, keyed, stag} from '../_lib/anim';
import {Capsule, N, NeonGrid, Pointer} from '../_lib/neon';
import {Stage} from '../_lib/stage';

// One capsule: its outline traces in around faint text, the pointer clicks, it lights up blue with
// a glow pulse, then it blurs out.

export type CapsuleLightProps = {
  durationInFrames: number;
  label: string;
  draw: [number, number];
  clickAt: number;
  outAt: number;
  scale: K;
};

export const CapsuleLight: React.FC<CapsuleLightProps> = (p) => {
  const f = useCurrentFrame();
  const d = eased(f, [[p.draw[0], 0], [p.draw[1], 1]]);
  const fill = eased(f, [[p.clickAt, 0], [p.clickAt + 6, 1]]);
  const glow = stag(f, p.clickAt + 2, 0, 4, 0) * (1 - stag(f, p.clickAt + 8, 0, 10, 0));
  const out = stag(f, p.outAt, 0, 6, 0);
  const s = keyed(f, p.scale);
  const press = f >= p.clickAt - 2 && f < p.clickAt + 3 ? 0.85 : 1;
  return (
    <Stage bg={N.bg} texts={[p.label]}>
      <NeonGrid />
      <div style={{position: 'absolute', left: 0, top: 0, width: 852, height: 480, transform: `scale(${s})`, transformOrigin: '426px 240px', filter: out > 0 ? `blur(${out * 8}px)` : undefined, opacity: 1 - out * 0.5}}>
        <Capsule x={426} y={240} w={388} h={162} label={<span style={{opacity: 0.25 + 0.75 * fill, color: fill > 0.5 ? '#3b7bff' : '#1b2440', backgroundImage: fill > 0.5 ? 'linear-gradient(180deg,#2ff0ff,#1a4cff)' : 'none', WebkitBackgroundClip: fill > 0.5 ? 'text' : undefined, backgroundClip: fill > 0.5 ? 'text' : undefined, WebkitTextFillColor: fill > 0.5 ? 'transparent' : undefined}}>{p.label}</span>} size={126} fill={fill * 0.85} draw={d} glow={glow} />
      </div>
      <Pointer x={426 + 180 * s + (1 - eased(f, [[0, 0], [p.clickAt, 1]])) * 20} y={240 + 70 * s + (f > p.clickAt + 6 ? (f - p.clickAt - 6) * 2.5 : 0)} scale={2 * press} opacity={1 - out} />
    </Stage>
  );
};
