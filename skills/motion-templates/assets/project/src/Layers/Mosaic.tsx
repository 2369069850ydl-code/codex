import React from 'react';
import {FONT_FAMILY} from '../fonts';

// Self-drawn mosaic board of small science illustrations (blue / black / white), 852x480.
// The cell at `hole` is left empty: the zoomed card is drawn there.

const K = '#0d0d0f', B = '#3c3ce6', Wt = '#f4f4f4';

export const Mosaic: React.FC<{hole: [number, number, number, number]}> = ({hole}) => {
  const rect = (x0: number, y0: number, x1: number, y1: number, fill: string, key: string) => (
    <rect key={key} x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={fill} stroke={K} strokeWidth={1.5} />
  );
  return (
    <svg width={852} height={480} viewBox="0 0 852 480" style={{position: 'absolute', left: 0, top: 0}}>
      {rect(0, 0, 165, 160, K, 'a')}
      <circle cx={82} cy={78} r={62} fill={Wt} />
      <line x1={82} y1={80} x2={82} y2={132} stroke={K} strokeWidth={2} />
      <circle cx={82} cy={80} r={17} fill={B} />
      <circle cx={82} cy={133} r={7} fill={K} />
      {rect(165, 0, 195, 100, Wt, 'b')}
      {rect(195, 0, 340, 100, K, 'c')}
      {rect(340, 0, 402, 100, B, 'd')}
      {rect(402, 0, 665, 100, Wt, 'e')}
      <g fill="none" stroke={K} strokeWidth={1.6}>
        <circle cx={533} cy={50} r={36} />
        <circle cx={533} cy={50} r={24} />
        <circle cx={533} cy={50} r={13} fill={K} />
        <path d="M455 33 H497 M570 92 H612 M455 92 H500" />
      </g>
      {[[494, 50], [516, 72], [556, 80], [549, 25]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={6} fill={B} />
      ))}
      {rect(665, 0, 852, 115, Wt, 'f')}
      <rect x={670} y={72} width={150} height={36} fill={K} />
      <rect x={706} y={36} width={112} height={62} fill={B} stroke={K} strokeWidth={2} />
      <rect x={740} y={50} width={28} height={4} fill={Wt} />
      {rect(165, 100, 340, 245, Wt, 'g')}
      <g stroke={K} strokeWidth={1.4}>
        <line x1={207} y1={147} x2={268} y2={147} />
        <line x1={207} y1={147} x2={238} y2={202} />
        <line x1={238} y1={202} x2={297} y2={195} />
        <line x1={268} y1={147} x2={297} y2={195} />
        <line x1={240} y1={170} x2={268} y2={147} />
      </g>
      <circle cx={207} cy={147} r={12} fill={B} />
      <circle cx={268} cy={147} r={18} fill={K} />
      <circle cx={238} cy={202} r={16} fill={B} />
      <circle cx={297} cy={195} r={22} fill={K} />
      <circle cx={240} cy={170} r={6} fill={K} />
      <path d="M300 107 H330 V117" stroke={K} strokeWidth={2} fill="none" />
      <rect x={178} y={231} width={84} height={6} fill={K} />
      {rect(0, 160, 165, 245, Wt, 'h')}
      {rect(340, 100, 610, 160, Wt, 'i')}
      {rect(340, 160, 610, 245, Wt, 'j')}
      {rect(610, 160, 665, 245, K, 'k')}
      {rect(665, 115, 852, 370, B, 'l')}
      <g fill="none" stroke={K} strokeWidth={2}>
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx={760} cy={235} rx={78 + i * 10} ry={30 + i * 5} transform="rotate(35 760 235)" />
        ))}
      </g>
      <circle cx={772} cy={243} r={22} fill={Wt} stroke={K} strokeWidth={3} />
      {[[700, 208], [745, 288], [812, 313], [836, 222]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={9 - i} fill={Wt} />
      ))}
      <ellipse cx={762} cy={337} rx={36} ry={9} fill={K} />
      {rect(0, 245, 225, 370, Wt, 'm')}
      {[[16, 262, 92, 'k'], [58, 262, 50, 'b'], [16, 291, 140, 'k'], [40, 291, 26, 'b'], [168, 291, 40, 'k'], [16, 318, 110, 'k'], [132, 318, 40, 'b'], [176, 318, 32, 'k']].map(([x, y, w, c], i) => (
        <rect key={i} x={x as number} y={y as number} width={w as number} height={16} fill={c === 'k' ? K : B} />
      ))}
      <rect x={57} y={342} width={108} height={18} fill={B} />
      <text x={111} y={356} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={700} fontSize={13} fill={Wt} letterSpacing={2}>
        LIDAR
      </text>
      {rect(340, 245, 428, 370, Wt, 'n')}
      {rect(428, 245, 665, 370, Wt, 'o')}
      <path d="M455 355 C470 300, 490 262, 505 265 C525 268, 560 330, 640 362" fill="none" stroke={B} strokeWidth={1.6} />
      <path d="M455 360 C472 315, 488 272, 503 276 C530 282, 565 342, 640 365" fill="none" stroke={K} strokeWidth={1.4} />
      <path d="M447 250 V368 H655" fill="none" stroke={K} strokeWidth={1} />
      {rect(0, 370, 225, 480, Wt, 'p')}
      <g fill="none" stroke={K} strokeWidth={1.6}>
        <path d="M15 450 L60 395 L120 420 L80 470 Z" />
        <path d="M110 402 l28 -14 l14 26 l-28 14 Z" fill={B} />
        <circle cx={185} cy={418} r={13} />
        <circle cx={175} cy={455} r={9} fill={B} />
      </g>
      <circle cx={20} cy={460} r={14} fill={B} />
      {rect(340, 370, 428, 425, K, 'q')}
      {rect(428, 370, 665, 425, Wt, 'r')}
      <path d={`M432 398 ${Array.from({length: 22}, (_, i) => `Q${438 + i * 10.4} ${i % 2 ? 386 : 410} ${443 + i * 10.4} 398`).join(' ')}`} fill="none" stroke="#9a6be0" strokeWidth={1.4} />
      {rect(665, 370, 735, 425, K, 's')}
      {rect(735, 370, 852, 425, Wt, 't')}
      {rect(225, 425, 340, 480, B, 'u')}
      {rect(340, 425, 665, 480, Wt, 'v')}
      {[[385, 5], [411, 7], [452, 13], [498, 15], [544, 14], [583, 9], [610, 5]].map(([x, r], i) => (
        <circle key={i} cx={x} cy={453} r={r} fill={B} />
      ))}
      {rect(665, 425, 735, 480, Wt, 'w')}
      {rect(735, 425, 852, 480, B, 'x')}
      {'LIDAR'.split('').map((ch, i) => (
        <text key={i} x={760 + i * 17} y={445 + (i % 2) * 18} fontFamily={FONT_FAMILY} fontWeight={700} fontSize={14} fill={K}
          transform={`rotate(${-40 + i * 25} ${760 + i * 17} ${445 + (i % 2) * 18})`}>
          {ch}
        </text>
      ))}
      <rect x={hole[0]} y={hole[1]} width={hole[2] - hole[0]} height={hole[3] - hole[1]} fill={Wt} stroke={K} strokeWidth={1.5} />
    </svg>
  );
};
