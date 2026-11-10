import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {Segment, ScanGrid, Stream} from './Beams';
import {City} from './City';
import {Bin, CAR, Car, Lamp, Stack} from './Props3D';
import type {LidarProps, Vec3} from './types';
import {cameraAt, lerp3, ramp, INOUT} from './util';

export const carPosAt = (frame: number, car: LidarProps['scene']['car']): Vec3 =>
  lerp3(car.from, car.to, ramp(frame, car.driveAt, car.driveAt + car.driveFrames, [0.3, 0.1, 0.25, 1]));

const add3 = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

const Rig: React.FC<{frame: number; props: LidarProps}> = ({frame, props}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const c = cameraAt(frame, props.camera);
  camera.position.set(...c.pos);
  camera.fov = c.fov;
  camera.near = 0.1;
  camera.far = 600;
  camera.lookAt(...c.look);
  camera.updateProjectionMatrix();
  return null;
};

/** Sun with a shadow frustum that follows the look-at point and scales with the camera distance. */
const Sun: React.FC<{frame: number; props: LidarProps}> = ({frame, props}) => {
  const c = cameraAt(frame, props.camera);
  const light = useMemo(() => {
    const l = new THREE.DirectionalLight('#ffffff', 1.5);
    l.castShadow = true;
    l.shadow.mapSize.set(2048, 2048);
    l.shadow.bias = -0.0004;
    l.shadow.normalBias = 0.03;
    l.shadow.radius = 4;
    return l;
  }, []);
  const dist = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]);
  const half = Math.max(14, dist * Math.tan((c.fov * Math.PI) / 360) * 1.6);
  const s = light.shadow.camera as THREE.OrthographicCamera;
  s.left = -half;
  s.right = half;
  s.top = half;
  s.bottom = -half;
  s.near = 1;
  s.far = 400;
  s.updateProjectionMatrix();
  light.position.set(...add3(c.look, props.scene.sun));
  light.target.position.set(...c.look);
  light.target.updateMatrixWorld();
  return (
    <>
      <primitive object={light} />
      <primitive object={light.target} />
    </>
  );
};

export const Scene3D: React.FC<{frame: number; props: LidarProps}> = ({frame, props}) => {
  const {scene, beam, palette} = props;
  const car = carPosAt(frame, scene.car);
  const lidar = add3(car, CAR.lidar);
  const t0 = scene.targets[0];
  // Out beam hits the target high, the return beam leaves it lower: two lines fanning from the LiDAR.
  const hit: Vec3 = add3(t0.pos, [-0.35, 1.05, 0]);
  const ret: Vec3 = add3(t0.pos, [-0.3, 0.45, 0.25]);
  const lidarR: Vec3 = add3(lidar, [0, -0.08, 0]);
  const glow = ramp(frame, beam.lightAt, beam.lightAt + 4) * (1 - ramp(frame, beam.darkAt, beam.darkAt + 12, INOUT));

  // Travelling pulses: out along lidar->hit, back along a parallel line.
  const pulses: React.ReactNode[] = [];
  const pulse = (start: number, a: Vec3, b: Vec3, key: string, strength: number, len = 0.28, frames = 10) => {
    const u = (frame - start) / frames;
    if (u < 0 || u > 1 + len) return;
    pulses.push(<Segment key={key} a={a} b={b} t0={Math.max(0, u - len)} t1={Math.min(1, u)} color={palette.beam} strength={strength} />);
  };
  const steady = ramp(frame, beam.steadyAt, beam.steadyAt + 6) * (1 - ramp(frame, beam.steadyEnd, beam.steadyEnd + 8));
  const end = Math.min(beam.steadyEnd, beam.streamAt);
  for (let i = 0; i < beam.pulseCount; i++) {
    const s = beam.pulseAt + i * beam.pulseEvery;
    if (s > end) break;
    pulse(s, lidar, hit, `o${i}`, 1);
    pulse(s + 9, ret, lidarR, `r${i}`, 0.8);
  }
  const far = scene.targets[1];
  const farHit: Vec3 | null = far ? add3(far.pos, [-0.3, 1.0, 0]) : null;
  const farRet: Vec3 | null = far ? add3(far.pos, [-0.3, 0.45, 0.25]) : null;
  const farOn = farHit ? ramp(frame, beam.farAt, beam.farAt + 8) : 0;
  if (farHit && frame >= beam.farAt) {
    for (let i = 0; i < 40; i++) {
      const s = beam.farAt + 4 + i * 9;
      pulse(s, lidar, farHit, `fo${i}`, 1, 0.3, 16);
      pulse(s + 14, farRet!, lidarR, `fr${i}`, 0.8, 0.3, 16);
    }
  }
  const scan = ramp(frame, beam.scanAt, beam.scanAt + 6) * (1 - ramp(frame, beam.scanEnd, beam.scanEnd + 8));
  const stream = ramp(frame, beam.streamAt, beam.streamAt + 6) * (1 - ramp(frame, beam.streamEnd, beam.streamEnd + 10));
  const lampsMemo = scene.lamps;

  return (
    <>
      <Rig frame={frame} props={props} />
      <color attach="background" args={[palette.sky]} />
      <hemisphereLight args={['#ffffff', '#c4c6d0', 2.2]} />
      <Sun frame={frame} props={props} />
      <City seed={scene.seed} ground={palette.ground} />
      {lampsMemo.map((p, i) => (
        <Lamp key={i} pos={p} />
      ))}
      <Car pos={car} lidarGlow={glow} lidarColor={palette.beam} />
      {scene.targets.map((t, i) =>
        t.kind === 'bin' ? <Bin key={i} pos={t.pos} color={palette.target} /> : <Stack key={i} pos={t.pos} color={palette.target} />,
      )}
      {pulses}
      <Segment a={lidar} b={hit} color={palette.beam} strength={steady * 0.9} />
      <Segment a={ret} b={lidarR} color={palette.beam} strength={steady * 0.7} />
      {farHit ? (
        <>
          <Segment a={lidar} b={farHit} color={palette.beam} strength={farOn * 0.55} />
          <Segment a={farRet!} b={lidarR} color={palette.beam} strength={farOn * 0.45} />
        </>
      ) : null}
      <ScanGrid pos={t0.pos} radius={0.66} height={1.5} color={palette.beam} strength={scan} sweep={ramp(frame, beam.scanAt, beam.scanAt + 16) * 1.05} />
      <Stream a={lidar} b={add3(lidar, [7, -1.9, 0])} frame={frame} color={palette.beam} strength={stream} spread={0.9} />
    </>
  );
};
