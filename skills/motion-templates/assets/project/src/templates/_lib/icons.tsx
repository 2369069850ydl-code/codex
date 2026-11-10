import React from 'react';

/** Self-drawn vintage film camera (lens pointing left), about 170x170 at scale 1. */
export const FilmCamera: React.FC<{size?: number}> = ({size = 170}) => (
  <svg width={size} height={size} viewBox="0 0 170 170">
    <defs>
      <linearGradient id="cam-body" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#f2f1ee" />
        <stop offset="0.6" stopColor="#cfcdc8" />
        <stop offset="1" stopColor="#9d9b97" />
      </linearGradient>
      <linearGradient id="cam-lens" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f4f3f0" />
        <stop offset="0.55" stopColor="#c9c7c2" />
        <stop offset="1" stopColor="#8f8d89" />
      </linearGradient>
      <radialGradient id="cam-glass" cx="0.4" cy="0.4" r="0.6">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.5" stopColor="#c6ccd6" />
        <stop offset="1" stopColor="#6b707a" />
      </radialGradient>
    </defs>
    {/* grip */}
    <path d="M 70 98 L 112 98 L 116 160 Q 116 166 110 166 L 76 166 Q 70 166 70 160 Z" fill="#1d1d1f" />
    <rect x={74} y={104} width={36} height={4} rx={2} fill="#2c2c30" />
    {/* body */}
    <rect x={62} y={40} width={78} height={66} rx={8} fill="url(#cam-body)" stroke="#8c8a86" strokeWidth={1} />
    <rect x={62} y={40} width={78} height={10} rx={5} fill="#ffffff" opacity={0.5} />
    {/* side knobs */}
    <circle cx={112} cy={64} r={6} fill="#4a4a4e" />
    <circle cx={124} cy={80} r={5} fill="#4a4a4e" />
    <circle cx={110} cy={88} r={4} fill="#4a4a4e" />
    <circle cx={92} cy={46} r={4} fill="#5a5a5e" />
    <circle cx={106} cy={46} r={4} fill="#5a5a5e" />
    <rect x={70} y={56} width={18} height={6} rx={2} fill="#3c3c40" />
    {/* eyepiece */}
    <rect x={128} y={30} width={14} height={16} rx={3} fill="#2a2a2d" />
    <ellipse cx={150} cy={30} rx={13} ry={15} fill="#1a1a1c" />
    <ellipse cx={152} cy={30} rx={8} ry={10} fill="#333337" />
    {/* lens barrel */}
    <path d="M 64 66 L 22 82 L 22 118 L 64 104 Z" fill="url(#cam-lens)" stroke="#8c8a86" strokeWidth={1} />
    <rect x={30} y={78} width={6} height={38} fill="#b7b5b0" transform="skewY(-20) translate(0 12)" opacity={0.6} />
    <ellipse cx={22} cy={100} rx={13} ry={19} fill="#d9d7d3" stroke="#8c8a86" strokeWidth={1} />
    <ellipse cx={21} cy={100} rx={9} ry={14} fill="url(#cam-glass)" />
    <ellipse cx={18} cy={95} rx={3} ry={4} fill="#ffffff" opacity={0.8} />
  </svg>
);
