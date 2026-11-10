import React, {useMemo} from 'react';
import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {rng} from './util';
import type {Vec3} from './types';

// Procedural white "clay" city on a square board. The hero street (car, targets, wall, lamps)
// is kept open around the origin; everything else is filled with blocks of simple buildings.
// All static geometry is merged into a few meshes so software GL stays fast.

export const BOARD = {x0: -60, x1: 80, z0: -48, z1: 52};
/** Open hero area: no generated buildings inside. */
const HERO = {x0: -16, x1: 30, z0: -12, z1: 12};
/** Wall line in generator space (+z); the built city is mirrored to -z. */
export const WALL_Z = 9.5;

type Tone = 'light' | 'mid' | 'dark';
type Part = {g: THREE.BufferGeometry; tone: Tone};

const box = (parts: Part[], [x, y, z]: Vec3, [w, h, d]: Vec3, dark: boolean | Tone = false) => {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y, z);
  parts.push({g, tone: dark === true ? 'dark' : dark === false ? 'light' : dark});
};

const shed = (parts: Part[], [x, z]: [number, number], w: number, d: number, h: number) => {
  // Arched warehouse roof: a half cylinder lying along x on a low box.
  box(parts, [x, h / 2, z], [w, h, d]);
  const c = new THREE.CylinderGeometry(d / 2, d / 2, w, 14, 1, false, 0, Math.PI);
  c.rotateZ(Math.PI / 2);
  c.rotateX(Math.PI / 2);
  c.translate(x, h, z);
  parts.push({g: c, tone: 'light'});
};

const building = (parts: Part[], r: () => number, x: number, z: number, w: number, d: number) => {
  const h = 1.2 + r() * r() * 6;
  box(parts, [x, h / 2, z], [w, h, d]);
  // Parapet + roof details.
  if (r() < 0.7) {
    const n = 1 + Math.floor(r() * 4);
    for (let i = 0; i < n; i++) {
      const s = 0.6 + r() * 1.6;
      box(parts, [x + (r() - 0.5) * (w - s), h + s * 0.25, z + (r() - 0.5) * (d - s)], [s, s * 0.5, s * (0.6 + r() * 0.6)]);
    }
  }
  if (r() < 0.35) box(parts, [x, h + 0.15, z - d / 2 + 0.1], [w, 0.3, 0.2]);
  // Windows: a few dark strips on the street side.
  if (r() < 0.5 && h > 3) {
    for (let k = 1; k < Math.min(4, h / 1.6); k++) box(parts, [x, k * 1.6, z - d / 2 - 0.02], [w * 0.7, 0.18, 0.05], true);
  }
};

/** Mirror z (non-indexed geometry): negate z of positions/normals and fix the triangle winding. */
const mirrorZ = (g: THREE.BufferGeometry) => {
  for (const name of ['position', 'normal']) {
    const a = g.attributes[name] as THREE.BufferAttribute;
    for (let i = 0; i < a.count; i++) a.setZ(i, -a.getZ(i));
  }
  for (const name of Object.keys(g.attributes)) {
    const a = g.attributes[name] as THREE.BufferAttribute;
    const n = a.itemSize;
    for (let t = 0; t < a.count; t += 3) {
      for (let k = 0; k < n; k++) {
        const v1 = a.array[(t + 1) * n + k];
        a.array[(t + 1) * n + k] = a.array[(t + 2) * n + k];
        a.array[(t + 2) * n + k] = v1;
      }
    }
    a.needsUpdate = true;
  }
  return g;
};

export const buildCity = (seed: number) => {
  const r = rng(seed);
  const parts: Part[] = [];
  const cw = 12, cd = 11, road = 3;
  for (let cx = BOARD.x0 + 2; cx + cw <= BOARD.x1 - 2; cx += cw + road) {
    for (let cz = BOARD.z0 + 2; cz + cd <= BOARD.z1 - 2; cz += cd + road) {
      const bx0 = cx, bx1 = cx + cw, bz0 = cz, bz1 = cz + cd;
      if (bx1 > HERO.x0 && bx0 < HERO.x1 && bz1 > HERO.z0 && bz0 < HERO.z1) continue;
      // Block slab (pavement) slightly raised.
      box(parts, [(bx0 + bx1) / 2, 0.08, (bz0 + bz1) / 2], [cw, 0.16, cd], 'mid');
      const kind = r();
      if (kind < 0.18) {
        shed(parts, [(bx0 + bx1) / 2, (bz0 + bz1) / 2], cw - 3, cd - 5, 2.5 + r() * 2);
      } else if (kind < 0.3) {
        // Parking lot: rows of stall lines.
        for (let i = 0; i < 5; i++) box(parts, [bx0 + 1.5 + i * 2, 0.18, bz0 + 3], [0.1, 0.05, 2.6], true);
        for (let i = 0; i < 5; i++) box(parts, [bx0 + 1.5 + i * 2, 0.18, bz1 - 3], [0.1, 0.05, 2.6], true);
        box(parts, [bx1 - 1.8, 1.2, (bz0 + bz1) / 2], [2.4, 2.4, 3]);
      } else {
        // Split into 2x2 or 3x2 lots.
        const nx = r() < 0.5 ? 2 : 3, nz = r() < 0.5 ? 1 : 2;
        for (let i = 0; i < nx; i++) {
          for (let j = 0; j < nz; j++) {
            if (r() < 0.15) continue;
            const lw = cw / nx, ld = cd / nz;
            const w = lw * (0.55 + r() * 0.35), d = ld * (0.55 + r() * 0.35);
            building(parts, r, bx0 + lw * (i + 0.5), bz0 + ld * (j + 0.5), w, d);
          }
        }
      }
    }
  }
  // Hero street: back wall with bricks, a storefront, kerbs and paving seams.
  box(parts, [13, 4.5, WALL_Z + 2], [HERO.x1 - HERO.x0 - 4, 9, 4]);
  box(parts, [13, 9.2, WALL_Z + 1], [HERO.x1 - HERO.x0 - 4, 0.5, 2.4]);
  for (let i = 0; i < 26; i++) {
    const gx = HERO.x0 + 4 + r() * (HERO.x1 - HERO.x0 - 10), gy = 2.5 + r() * 5.5;
    const rows = 1 + Math.floor(r() * 3);
    for (let k = 0; k < rows; k++) {
      const n = 1 + Math.floor(r() * 3);
      for (let m = 0; m < n; m++) box(parts, [gx + m * 0.82 + (k % 2) * 0.4, gy - k * 0.36, WALL_Z - 0.02], [0.72, 0.26, 0.06], true);
    }
  }
  // Storefront with shutters.
  const sx = 21;
  box(parts, [sx, 2.6, WALL_Z - 1.2], [7, 5.2, 2.4]);
  box(parts, [sx, 5.4, WALL_Z - 1.6], [7.8, 0.4, 3.4]);
  for (let i = 0; i < 4; i++) box(parts, [sx - 2.4 + i * 1.6, 2.4, WALL_Z - 2.42], [0.35, 3.4, 0.05], true);
  box(parts, [sx, 0.9, WALL_Z - 2.43], [6.2, 0.12, 0.05], true);
  box(parts, [sx + 5.2, 1.0, WALL_Z - 1.8], [2.2, 2.0, 1.4]);
  // Sidewalk along the wall and a kerb towards the street.
  box(parts, [13, 0.1, WALL_Z - 3.5], [HERO.x1 - HERO.x0, 0.2, 5]);
  box(parts, [13, 0.12, -9], [HERO.x1 - HERO.x0, 0.24, 1.2]);
  // Paving seams (thin dark grooves).
  for (let x = HERO.x0; x <= HERO.x1; x += 6) box(parts, [x, 0.005, -1.5], [0.05, 0.01, 14], true);
  for (let z = -8; z <= 5; z += 6.5) box(parts, [13, 0.005, z], [HERO.x1 - HERO.x0, 0.01, 0.05], true);
  for (let x = HERO.x0; x <= HERO.x1; x += 4) box(parts, [x, 0.21, WALL_Z - 3.5], [0.06, 0.01, 5], true);
  // Parking stalls in front of the street (seen in the aerial dive).
  for (let i = 0; i < 12; i++) box(parts, [-18 + i * 3, 0.005, -13], [0.1, 0.01, 4], true);
  // Generated with the wall at +z, then mirrored so the street faces a camera on the +z side.
  const merged = (t: Tone) => mirrorZ(mergeGeometries(parts.filter((p) => p.tone === t).map((p) => p.g.toNonIndexed())));
  return {light: merged('light'), mid: merged('mid'), dark: merged('dark')};
};

export const City: React.FC<{seed: number; ground: string}> = ({seed, ground}) => {
  const {light, mid, dark} = useMemo(() => buildCity(seed), [seed]);
  const W = BOARD.x1 - BOARD.x0, D = BOARD.z1 - BOARD.z0;
  return (
    <group>
      {/* Board slab */}
      <mesh position={[(BOARD.x0 + BOARD.x1) / 2, -0.6, -(BOARD.z0 + BOARD.z1) / 2]} receiveShadow>
        <boxGeometry args={[W, 1.2, D]} />
        <meshStandardMaterial color={ground} roughness={1} />
      </mesh>
      {[
        [(BOARD.x0 + BOARD.x1) / 2, -BOARD.z0, W + 2, 1],
        [(BOARD.x0 + BOARD.x1) / 2, -BOARD.z1, W + 2, 1],
      ].map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, 0.6, z]} castShadow receiveShadow>
          <boxGeometry args={[w, 1.2, d]} />
          <meshStandardMaterial color="#f2f2f4" roughness={1} />
        </mesh>
      ))}
      {[BOARD.x0, BOARD.x1].map((x, i) => (
        <mesh key={`s${i}`} position={[x, 0.6, -(BOARD.z0 + BOARD.z1) / 2]} castShadow receiveShadow>
          <boxGeometry args={[1, 1.2, D]} />
          <meshStandardMaterial color="#f2f2f4" roughness={1} />
        </mesh>
      ))}
      <mesh geometry={light} castShadow receiveShadow>
        <meshStandardMaterial color="#f4f4f6" roughness={0.95} />
      </mesh>
      <mesh geometry={mid} receiveShadow>
        <meshStandardMaterial color="#d6d7dd" roughness={1} />
      </mesh>
      <mesh geometry={dark} receiveShadow>
        <meshStandardMaterial color="#8d8e96" roughness={1} />
      </mesh>
    </group>
  );
};
