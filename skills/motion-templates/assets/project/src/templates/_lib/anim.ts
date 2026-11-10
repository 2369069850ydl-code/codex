import {Easing, interpolate} from 'remotion';
export {ramp, keyed, lerp, rng, OUT, INOUT, bz} from '../../Lidar/util';
export {CJK, ensureCjk} from '../../Lidar/cjk';

export type K = [number, number][];
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Keys with easing between each pair (default ease in-out). */
export const eased = (f: number, keys: K, ease = Easing.bezier(0.45, 0, 0.2, 1)) => {
  if (keys.length === 1) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [a, va] = keys[i];
    const [b, vb] = keys[i + 1];
    if (f <= b || i === keys.length - 2) return interpolate(f, [a, b], [va, vb], {...clamp, easing: ease});
  }
  return keys[keys.length - 1][1];
};

/** Staggered 0..1 for item i: starts at start + i*stagger, lasts dur. */
export const stag = (f: number, start: number, stagger: number, dur: number, i: number, ease = Easing.bezier(0.2, 0.8, 0.2, 1)) =>
  interpolate(f, [start + i * stagger, start + i * stagger + dur], [0, 1], {...clamp, easing: ease});

/** Hold-step lookup: value of the last key at or before f. */
export const step = <T,>(f: number, keys: [number, T][]): T => {
  let v = keys[0][1];
  for (const [k, x] of keys) if (f >= k) v = x;
  return v;
};
