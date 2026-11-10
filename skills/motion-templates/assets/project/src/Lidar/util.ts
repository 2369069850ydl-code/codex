import {Easing, interpolate} from 'remotion';
import {monotoneCubic} from '../CardGrid/CardGrid';
import type {Bezier, CamKey, Key, Vec3} from './types';

export const bz = (b: Bezier) => Easing.bezier(b[0], b[1], b[2], b[3]);
export const OUT: Bezier = [0.2, 0.8, 0.2, 1];
export const INOUT: Bezier = [0.45, 0, 0.2, 1];

/** 0..1 between frames a and b with a bezier curve, clamped. */
export const ramp = (f: number, a: number, b: number, curve: Bezier = OUT) =>
  interpolate(f, [a, b], [0, 1], {easing: bz(curve), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/** Piecewise-linear keys, clamped. */
export const keyed = (f: number, keys: Key[]) =>
  keys.length === 1
    ? keys[0][1]
    : interpolate(
        f,
        keys.map((k) => k[0]),
        keys.map((k) => k[1]),
        {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
      );

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/** Deterministic PRNG. */
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * Camera at a frame: keys are split at `stop` keys; inside a piece every component of position,
 * look-at point and fov follows a monotone cubic (no overshoot, continuous velocity).
 */
export const cameraAt = (frame: number, keys: CamKey[]): {pos: Vec3; look: Vec3; fov: number} => {
  let a = 0;
  for (let i = 1; i < keys.length; i++) {
    if (i < keys.length - 1 && !keys[i].stop) continue;
    if (frame <= keys[i].f || i === keys.length - 1) {
      const p = keys.slice(a, i + 1);
      const xs = p.map((k) => k.f);
      const c = (g: (k: CamKey) => number) => monotoneCubic(frame, xs, p.map(g));
      return {
        pos: [c((k) => k.pos[0]), c((k) => k.pos[1]), c((k) => k.pos[2])],
        look: [c((k) => k.look[0]), c((k) => k.look[1]), c((k) => k.look[2])],
        fov: c((k) => k.fov),
      };
    }
    a = i;
  }
  const k = keys[keys.length - 1];
  return {pos: k.pos, look: k.look, fov: k.fov};
};
