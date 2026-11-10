import React from 'react';
import type {CardIcon} from './types';

// Self-drawn geometric badges (no real flags/logos). 150x100 viewBox.
export const Icon: React.FC<{icon: CardIcon}> = ({icon}) => {
  const [a, b = '#ffffff', c = '#222222'] = icon.colors;
  let body: React.ReactNode;
  switch (icon.kind) {
    case 'disc':
      body = <circle cx={75} cy={50} r={28} fill={b} />;
      break;
    case 'sun-corner':
      body = (
        <>
          <circle cx={30} cy={30} r={15} fill={b} />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={58 + (i % 2) * 6} cy={14 + i * 11} r={3.6} fill={b} />
          ))}
        </>
      );
      break;
    case 'bars':
      body = (
        <>
          <rect x={0} y={22} width={150} height={14} fill={b} />
          <rect x={0} y={64} width={150} height={14} fill={b} />
          <rect x={44} y={0} width={14} height={100} fill={b} />
        </>
      );
      break;
    case 'stripes-diag':
      body = (
        <>
          <polygon points="0,0 70,0 0,60" fill={a} />
          <polygon points="70,0 150,0 150,15 0,100 0,60" fill={b} />
          <polygon points="150,15 150,100 0,100" fill={c} />
        </>
      );
      break;
    case 'dots':
      body = (
        <>
          {[
            [30, 30, 9],
            [100, 22, 5],
            [118, 50, 6],
            [96, 76, 6],
            [126, 82, 4],
            [40, 74, 7],
          ].map(([x, y, r], i) => (
            <Star key={i} cx={x} cy={y} r={r} fill={b} />
          ))}
        </>
      );
      break;
    case 'bands-h':
      body = (
        <>
          <rect y={33.3} width={150} height={33.4} fill={b} />
          <rect y={66.7} width={150} height={33.3} fill={c} />
        </>
      );
      break;
    case 'bands-v':
      body = (
        <>
          <rect x={50} width={50} height={100} fill={b} />
          <rect x={100} width={50} height={100} fill={c} />
        </>
      );
      break;
    case 'plus':
      body = (
        <>
          <rect x={63} y={18} width={24} height={64} fill={b} />
          <rect x={43} y={38} width={64} height={24} fill={b} />
        </>
      );
      break;
    case 'wedge':
      body = <polygon points="0,0 70,50 0,100" fill={b} />;
      break;
    case 'diagonal':
      body = (
        <>
          <polygon points="0,100 150,0 150,100" fill={b} />
          <line x1={0} y1={100} x2={150} y2={0} stroke={c} strokeWidth={12} />
        </>
      );
      break;
    case 'corner-star':
      body = <Star cx={34} cy={32} r={18} fill={b} />;
      break;
    case 'quad':
      body = (
        <>
          <rect width={75} height={50} fill={b} />
          <rect x={75} y={50} width={75} height={50} fill={c} />
        </>
      );
      break;
    case 'chevron':
      body = <polygon points="0,0 60,50 0,100 0,72 26,50 0,28" fill={b} />;
      break;
  }
  return (
    <svg viewBox="0 0 150 100" width="100%" height="100%" preserveAspectRatio="none" style={{display: 'block'}}>
      <rect width={150} height={100} fill={a} />
      {body}
    </svg>
  );
};

const Star: React.FC<{cx: number; cy: number; r: number; fill: string}> = ({cx, cy, r, fill}) => {
  const pts = Array.from({length: 10}, (_, i) => {
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.42;
    return `${cx + rr * Math.cos(ang)},${cy + rr * Math.sin(ang)}`;
  }).join(' ');
  return <polygon points={pts} fill={fill} />;
};
