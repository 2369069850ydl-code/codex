import React from 'react';

/** One animation frame of a bouncing ball (frame `idx` of `n`), drawn in a blue square. */
export const BallCard: React.FC<{idx: number; n: number; size: number; showNumber?: boolean; tint?: string}> = ({idx, n, size, showNumber, tint}) => {
  const ph = (((idx - 1) % n) + n) % n / n; // 0..1, bottom at 0
  const up = Math.sin(Math.PI * ph);
  const floor = 0.78;
  const r = 0.16;
  const squash = up < 0.15 ? 1 + (0.15 - up) * 3 : 1;
  const cy = floor - r / squash - up * 0.5;
  return (
    <svg width={size} height={size} viewBox="0 0 1 1" style={{display: 'block'}}>
      <rect width={1} height={1} rx={0.06} fill={tint ?? '#3131d3'} />
      {showNumber && (
        <text x={0.5} y={0.7} textAnchor="middle" fontFamily="MontserratLocal" fontWeight={700} fontSize={0.56} fill="#ffffff" opacity={0.16}>
          {String(idx).padStart(2, '0')}
        </text>
      )}
      <ellipse cx={0.5} cy={floor + 0.02} rx={0.2} ry={0.012} fill="#141470" opacity={0.6 - up * 0.4} />
      <ellipse cx={0.5} cy={cy} rx={r * squash} ry={r / squash} fill="#fff" />
    </svg>
  );
};
