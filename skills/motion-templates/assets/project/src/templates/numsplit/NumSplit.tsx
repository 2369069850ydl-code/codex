import React from 'react';
import {useCurrentFrame} from 'remotion';
import {eased, K, keyed} from '../_lib/anim';
import {Backdrop} from '../_lib/backdrop';
import {Stage} from '../_lib/stage';

// A number in a circle divides like a cell: the circle stretches, pinches and splits in two while
// the two halves count towards their final values.

export type NumSplitProps = {
  durationInFrames: number;
  total: number;
  finalLeft: number;
  split: K; // 0 = one circle, 1 = fully separated
  zoom: K; // overall scale
  backdropIn: number;
  color?: string;
};

export const NumSplit: React.FC<NumSplitProps> = (p) => {
  const f = useCurrentFrame();
  const s = keyed(f, p.split);
  const z = keyed(f, p.zoom);
  const color = p.color ?? '#4b4596';
  const bd = eased(f, [[p.backdropIn, 0], [p.backdropIn + 10, 1]]);
  const r = 94 - 36 * Math.min(1, s * 1.3);
  const d = 200 * s; // centre distance
  const left = Math.round(p.finalLeft * Math.min(1, s * 1.05));
  const right = p.total - left;
  const cx = 426;
  const cy = 240;
  const one = s < 0.04;
  return (
    <Stage>
      <div style={{position: 'absolute', left: 426 - 341 * bd, top: 58, width: 682 * bd, height: 364, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: -(426 - 341 * bd), top: -58}}>
          <Backdrop seed={3} />
        </div>
      </div>
      {bd < 1 && <div style={{position: 'absolute', left: 425, top: 70, width: 3, height: 340, background: color, opacity: 1 - bd}} />}
      <svg width={852} height={480} style={{position: 'absolute', left: 0, top: 0, opacity: Math.min(1, bd * 2)}}>
        <defs>
          <filter id="ns-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation={10} />
            <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -14" />
          </filter>
        </defs>
        <g transform={`translate(${cx} ${cy}) scale(${z}) translate(${-cx} ${-cy})`}>
          <g filter="url(#ns-goo)" fill={color}>
            <circle cx={cx - d / 2} cy={cy} r={r} />
            <circle cx={cx + d / 2} cy={cy} r={r} />
            {s > 0.15 && s < 0.6 && <rect x={cx - d / 2} y={cy - r * (0.55 - s * 0.7)} width={d} height={Math.max(0, 2 * r * (0.55 - s * 0.7))} />}
          </g>
          <g fill="#fff" fontFamily="MontserratLocal" fontWeight={700} textAnchor="middle">
            {one ? (
              <text x={cx} y={cy + r * 0.36} fontSize={r * 0.98}>{p.total}</text>
            ) : s < 0.22 ? (
              <text x={cx + d / 2} y={cy + r * 0.36} fontSize={r * 0.9}>{right}</text>
            ) : (
              <>
                <text x={cx - d / 2} y={cy + r * 0.36} fontSize={r * 0.82} opacity={Math.min(1, (s - 0.22) * 8)}>{left}</text>
                <text x={cx + d / 2} y={cy + r * 0.36} fontSize={r * 0.82}>{right}</text>
              </>
            )}
          </g>
        </g>
      </svg>
    </Stage>
  );
};
