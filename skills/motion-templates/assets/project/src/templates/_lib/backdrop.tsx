import React from 'react';
import {rng} from './anim';

/** Light grey rounded backdrop panel with faint topographic contour lines (design space 852x480). */
export const Backdrop: React.FC<{x?: number; y?: number; w?: number; h?: number; fill?: string; contours?: boolean; seed?: number}> = ({
  x = 85,
  y = 58,
  w = 682,
  h = 364,
  fill = '#e4e4e7',
  contours = true,
  seed = 7,
}) => {
  const r = rng(seed);
  const lines = contours
    ? Array.from({length: 6}, () => {
        const y0 = y + r() * h;
        const pts = Array.from({length: 6}, (_, i) => [x + (w * i) / 5, y0 + (r() - 0.5) * 120]);
        let d = `M ${pts[0][0]} ${pts[0][1]}`;
        for (let i = 1; i < pts.length; i++) {
          const [px, py] = pts[i - 1];
          const [cx, cy] = pts[i];
          d += ` Q ${px + (cx - px) / 2} ${py + (r() - 0.5) * 80} ${cx} ${cy}`;
        }
        return d;
      })
    : [];
  return (
    <svg width={852} height={480} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        <clipPath id={`bd-${seed}`}>
          <rect x={x} y={y} width={w} height={h} rx={6} />
        </clipPath>
      </defs>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={fill} />
      <g clipPath={`url(#bd-${seed})`} fill="none" stroke="#d6d6da" strokeWidth={1}>
        {lines.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
};
