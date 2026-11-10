import React, {useMemo} from 'react';
import * as THREE from 'three';
import {rbox, taper} from './geom';
import type {Vec3} from './types';

// Car with roof LiDAR, targets (bin / stack), street lamps with light cones.

export const CAR = {
  /** LiDAR window centre in car space (car faces +x). */
  lidar: [0.96, 1.95, 0] as Vec3,
  /** Side marker for the distance line (front wheel hub height). */
  side: [0.5, 0.45, 1.05] as Vec3,
  /** Label anchor: right edge of the LiDAR box seen from the front (camera at +x). */
  labelAnchor: [0.9, 2.2, -0.4] as Vec3,
};

const white = new THREE.MeshStandardMaterial({color: '#f6f6f8', roughness: 0.9});
const grey = new THREE.MeshStandardMaterial({color: '#bfc0c6', roughness: 1});
const darkM = new THREE.MeshStandardMaterial({color: '#3a3b40', roughness: 0.8});

export const Car: React.FC<{pos: Vec3; lidarGlow: number; lidarColor: string}> = ({pos, lidarGlow, lidarColor}) => {
  const g = useMemo(() => {
    const body = rbox(4.4, 0.8, 2.0, 0.24);
    body.translate(0, 0.75, 0);
    // Cabin: 3.1 long at the base, 2.25 at the top, narrower on top (trapezoid seen from the front).
    const cab = taper(rbox(3.1, 1.15, 1.95, 0.2), 1.15, 0.73, 0.74, -0.225);
    cab.translate(-0.55, 1.725, 0);
    const lid = rbox(0.68, 0.66, 0.68, 0.05);
    const wheel = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 24);
    wheel.rotateX(Math.PI / 2);
    const hub = new THREE.CylinderGeometry(0.2, 0.2, 0.32, 18);
    hub.rotateX(Math.PI / 2);
    const lamp = new THREE.CylinderGeometry(0.13, 0.13, 0.05, 18);
    lamp.rotateZ(Math.PI / 2);
    const disc = new THREE.CircleGeometry(0.22, 32);
    disc.rotateY(Math.PI / 2);
    const mirror = rbox(0.22, 0.14, 0.36, 0.04);
    return {body, cab, lid, wheel, hub, lamp, disc, mirror};
  }, []);
  const glow = new THREE.Color('#2a2b30').lerp(new THREE.Color(lidarColor), lidarGlow);
  return (
    <group position={pos}>
      <mesh geometry={g.body} material={white} castShadow receiveShadow />
      <mesh geometry={g.cab} material={white} castShadow receiveShadow />
      <mesh geometry={g.lid} material={darkM} position={[CAR.lidar[0] - 0.35, CAR.lidar[1], 0]} castShadow />
      {[-1.12, 1.12].map((z) => (
        <mesh key={z} geometry={g.mirror} material={white} position={[0.85, 1.32, z]} castShadow />
      ))}
      <mesh geometry={g.disc} position={[CAR.lidar[0] + 0.015, CAR.lidar[1], 0]}>
        <meshBasicMaterial color={glow} toneMapped={false} />
      </mesh>
      {[-1.4, 1.4].map((x) =>
        [-0.92, 0.92].map((z) => (
          <group key={`${x}${z}`} position={[x, 0.4, z]}>
            <mesh geometry={g.wheel} material={white} castShadow />
            <mesh geometry={g.hub} material={grey} />
          </group>
        )),
      )}
      {[-0.68, 0.68].map((z) => (
        <mesh key={z} geometry={g.lamp} material={darkM} position={[2.2, 0.82, z]} />
      ))}
      {[-0.7, 0.7].map((z) => (
        <mesh key={z} material={darkM} position={[-2.21, 0.95, z]}>
          <boxGeometry args={[0.04, 0.16, 0.3]} />
        </mesh>
      ))}
    </group>
  );
};

export const Bin: React.FC<{pos: Vec3; color: string}> = ({pos, color}) => {
  const m = useMemo(() => new THREE.MeshStandardMaterial({color, roughness: 0.35, metalness: 0, transparent: true, opacity: 0.82}), [color]);
  const ribs = useMemo(() => {
    const out: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const b = new THREE.BoxGeometry(0.05, 1.1, 0.05);
      b.translate(Math.cos(a) * 0.45, 0.65, Math.sin(a) * 0.45);
      out.push(b);
    }
    return out;
  }, []);
  return (
    <group position={pos}>
      <mesh material={m} position={[0, 0.65, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.46, 0.4, 1.3, 28]} />
      </mesh>
      <mesh material={m} position={[0, 1.31, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.46, 0.04, 8, 28]} />
      </mesh>
      {ribs.map((g, i) => (
        <mesh key={i} geometry={g} material={m} />
      ))}
      {/* Lid leaning against the bin */}
      <group position={[0.3, 0.42, 0.6]} rotation={[-1.2, -0.35, 0]}>
        <mesh material={m} castShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.12, 28]} />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.17, 0.17, 0.02, 24]} />
          <meshStandardMaterial color="#3b3f9a" />
        </mesh>
      </group>
    </group>
  );
};

export const Stack: React.FC<{pos: Vec3; color: string}> = ({pos, color}) => {
  const m = useMemo(() => new THREE.MeshStandardMaterial({color, roughness: 0.4, transparent: true, opacity: 0.85}), [color]);
  return (
    <group position={pos}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} material={m} position={[i * 0.06, 0.25 + i * 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.45, 24]} />
        </mesh>
      ))}
      <mesh material={m} position={[0.2, 0.45, -0.6]} rotation={[1.1, 0, 0.2]}>
        <cylinderGeometry args={[0.42, 0.42, 0.12, 24]} />
      </mesh>
    </group>
  );
};

// Additive light cone with a soft edge (view-angle fade) and top-to-bottom falloff.
const coneMat = (color: string, strength: number) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {c: {value: new THREE.Color(color)}, k: {value: strength}},
    vertexShader: `varying vec2 vUv; varying float vF;
      void main(){ vUv=uv; vec4 mv=modelViewMatrix*vec4(position,1.0);
        vec3 n=normalize(normalMatrix*normal); vF=abs(dot(n,normalize(-mv.xyz)));
        gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 c; uniform float k; varying vec2 vUv; varying float vF;
      void main(){ float a=k*pow(vF,1.5)*(0.35+0.65*vUv.y); gl_FragColor=vec4(c,a); }`,
  });

export const Lamp: React.FC<{pos: Vec3}> = ({pos}) => {
  const mat = useMemo(() => coneMat('#eedcc2', 0.42), []);
  const h = 7.2;
  return (
    <group position={pos}>
      <mesh material={white} position={[0, h / 2, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, h, 12]} />
      </mesh>
      <mesh material={white} position={[0, h, 0.6]} castShadow>
        <boxGeometry args={[0.5, 0.25, 1.6]} />
      </mesh>
      <mesh material={mat} position={[0, (h - 0.15) / 2, 1.1]}>
        <cylinderGeometry args={[0.25, 1.6, h - 0.15, 32, 1, true]} />
      </mesh>
    </group>
  );
};
