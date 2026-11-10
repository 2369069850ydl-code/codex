import React, {useMemo} from 'react';
import * as THREE from 'three';
import {rng} from './util';
import type {Vec3} from './types';

// Laser visuals: glowing segments between two points, travelling pulses, a hologram scan grid on a
// target and a particle stream. All additive, no depth writes.

const add = (color: string, opacity: number) =>
  new THREE.MeshBasicMaterial({color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false});

const v = (a: Vec3) => new THREE.Vector3(a[0], a[1], a[2]);

/** A glowing segment from a to b (t0..t1 = fraction of the full a->b line that is lit). */
export const Segment: React.FC<{a: Vec3; b: Vec3; t0?: number; t1?: number; color: string; strength: number; width?: number}> = ({
  a,
  b,
  t0 = 0,
  t1 = 1,
  color,
  strength,
  width = 1,
}) => {
  const mats = useMemo(() => [add(color, 1), add(color, 1), add('#9ff3ff', 1)], [color]);
  if (strength <= 0.001 || t1 - t0 <= 1e-4) return null;
  const A = v(a).lerp(v(b), t0), B = v(a).lerp(v(b), t1);
  const mid = A.clone().add(B).multiplyScalar(0.5);
  const len = A.distanceTo(B);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  mats[0].opacity = 0.07 * strength;
  mats[1].opacity = 0.22 * strength;
  mats[2].opacity = 0.75 * strength;
  return (
    <group position={mid} quaternion={q}>
      <mesh material={mats[0]}>
        <cylinderGeometry args={[0.12 * width, 0.12 * width, len, 10, 1, true]} />
      </mesh>
      <mesh material={mats[1]}>
        <cylinderGeometry args={[0.045 * width, 0.045 * width, len, 8, 1, true]} />
      </mesh>
      <mesh material={mats[2]}>
        <cylinderGeometry args={[0.014 * width, 0.014 * width, len, 6, 1, true]} />
      </mesh>
    </group>
  );
};

/** Cyan grid wrapped around a cylinder (hologram scan on the target). */
export const ScanGrid: React.FC<{pos: Vec3; radius: number; height: number; color: string; strength: number; sweep: number}> = ({
  pos,
  radius,
  height,
  color,
  strength,
  sweep,
}) => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {c: {value: new THREE.Color(color)}, k: {value: 0}, s: {value: 0}},
        vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 c; uniform float k; uniform float s; varying vec2 vUv;
          void main(){ vec2 g=abs(fract(vUv*vec2(16.0,7.0))-0.5);
            float l=max(smoothstep(0.42,0.5,g.x),smoothstep(0.38,0.5,g.y));
            float band=smoothstep(s-0.15,s,vUv.y)*(1.0-smoothstep(s,s+0.04,vUv.y));
            float a=k*(0.12+0.75*l+0.6*band)*step(vUv.y,s+0.04);
            gl_FragColor=vec4(c*a,a); }`,
      }),
    [color],
  );
  if (strength <= 0.001) return null;
  mat.uniforms.k.value = strength;
  mat.uniforms.s.value = sweep;
  return (
    <mesh material={mat} position={[pos[0], pos[1] + height / 2, pos[2]]}>
      <cylinderGeometry args={[radius, radius * 0.92, height, 32, 1, true]} />
    </mesh>
  );
};

/** Dots streaming from a towards b inside a cone (close-up of the emitted light). */
export const Stream: React.FC<{a: Vec3; b: Vec3; frame: number; color: string; strength: number; spread: number}> = ({
  a,
  b,
  frame,
  color,
  strength,
  spread,
}) => {
  const base = useMemo(() => {
    const r = rng(7);
    return Array.from({length: 700}, () => ({o: r(), ang: r() * Math.PI * 2, rad: Math.sqrt(r()), sp: 0.6 + r() * 0.8}));
  }, []);
  const mat = useMemo(
    () => new THREE.PointsMaterial({color: new THREE.Color(color).multiplyScalar(0.8), size: 0.08, transparent: true, depthWrite: false, toneMapped: false}),
    [color],
  );
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  if (strength <= 0.001) return null;
  const A = v(a), B = v(b), dir = B.clone().sub(A);
  const len = dir.length();
  dir.normalize();
  const side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
  const up = new THREE.Vector3().crossVectors(side, dir).normalize();
  const pos = new Float32Array(base.length * 3);
  base.forEach((p, i) => {
    const t = (p.o + frame * 0.018 * p.sp) % 1;
    const r = p.rad * spread * (0.15 + t);
    const q = A.clone()
      .addScaledVector(dir, t * len)
      .addScaledVector(side, Math.cos(p.ang) * r)
      .addScaledVector(up, Math.sin(p.ang) * r);
    pos.set([q.x, q.y, q.z], i * 3);
  });
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  mat.opacity = strength;
  return <points geometry={geo} material={mat} />;
};
