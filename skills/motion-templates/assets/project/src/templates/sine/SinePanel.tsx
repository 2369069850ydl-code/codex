import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, eased, K, keyed, stag} from '../_lib/anim';
import {Stage} from '../_lib/stage';

// Two-tab card: an AC sine plot (two opposite-phase waves between +V / -V dashed limits) on the
// left, a purple side panel with a TV icon on the right; the side panel can collapse so the plot
// takes the full width, a badge appears on the tab bar and a big translucent label fades in.

export type SinePanelProps = {
  durationInFrames: number;
  tabs: [string, string];
  tabsIn: number;
  axesIn: number;
  waveDraw: K; // 0..1 reveal of the waves across the plot
  period: K; // px per cycle
  side: {in: number; out: number; screen: string; tvIn: number};
  badgeIn?: number;
  big?: {text: string; at: number; stagger: number};
};

const CARD = {x: 108, y: 79, w: 634, h: 331};
const PLOT = {x: 123, y: 135, w: 606, h: 265};
const OX = 162;
const ZERO = 263;
const AMP = 70;
const PURPLE = '#4b4596';

const sinePath = (x0: number, x1: number, period: number, phase: number) => {
  let d = '';
  for (let x = x0; x <= x1; x += 2) {
    const y = ZERO - AMP * Math.sin(((x - OX) / period) * Math.PI * 2 + phase);
    d += `${d ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return d;
};

const Tv: React.FC<{label: string}> = ({label}) => (
  <svg width={200} height={200} viewBox="0 0 200 200">
    <line x1={100} y1={70} x2={78} y2={10} stroke="#2a2550" strokeWidth={2.5} />
    <line x1={110} y1={70} x2={140} y2={14} stroke="#2a2550" strokeWidth={2.5} />
    <rect x={10} y={70} width={190} height={130} rx={4} fill="#f4f4f6" stroke="#1d1b2e" strokeWidth={5} />
    <rect x={22} y={82} width={130} height={104} rx={4} fill={PURPLE} stroke="#1d1b2e" strokeWidth={4} />
    <rect x={158} y={82} width={36} height={104} fill="#c9c9cf" />
    <circle cx={176} cy={104} r={11} fill={PURPLE} stroke="#1d1b2e" strokeWidth={2} />
    <line x1={170} y1={110} x2={182} y2={98} stroke="#fff" strokeWidth={2.4} />
    <circle cx={176} cy={140} r={11} fill={PURPLE} stroke="#1d1b2e" strokeWidth={2} />
    <line x1={176} y1={133} x2={176} y2={147} stroke="#fff" strokeWidth={2.4} />
    <text x={87} y={140} textAnchor="middle" fontFamily="MontserratLocal" fontWeight={700} fontSize={14} fill="#fff">
      {label}
    </text>
  </svg>
);

const Flag: React.FC = () => (
  <svg width={44} height={28} viewBox="0 0 44 28">
    {Array.from({length: 7}, (_, i) => (
      <rect key={i} x={0} y={i * 4} width={44} height={2} fill="#d22b3a" />
    ))}
    {Array.from({length: 6}, (_, i) => (
      <rect key={i} x={0} y={i * 4 + 2} width={44} height={2} fill="#fff" />
    ))}
    <rect x={0} y={0} width={19} height={14} fill="#2b3d8f" />
  </svg>
);

export const SinePanel: React.FC<SinePanelProps> = (p) => {
  const f = useCurrentFrame();
  const axes = stag(f, p.axesIn, 0, 12, 0);
  const tabs = stag(f, p.tabsIn, 0, 10, 0);
  const sideIn = eased(f, [[p.side.in, 0], [p.side.in + 14, 1]]);
  const sideOut = eased(f, [[p.side.out, 0], [p.side.out + 16, 1]]);
  const sideX = PLOT.x + PLOT.w - (PLOT.w - 297) * sideIn + (PLOT.w - 297 - 10) * sideOut; // left edge
  const tvT = eased(f, [[p.side.tvIn, 0], [p.side.tvIn + 30, 1]]);
  const period = keyed(f, p.period);
  const reveal = keyed(f, p.waveDraw);
  const x1 = Math.min(sideX, OX + (PLOT.x + PLOT.w - OX) * reveal);
  const single = sideOut; // tab bar morphs into one wide tab
  const tabW = 329 + (530 - 329) * single;
  const badge = p.badgeIn !== undefined ? stag(f, p.badgeIn, 0, 10, 0) : 0;

  return (
    <Stage texts={[...p.tabs, p.big?.text ?? '', p.side.screen, '+V-0']}>
      <div style={{position: 'absolute', left: 85, top: 58, width: 682, height: 364, background: '#ececee', borderRadius: 6}} />
      <div style={{position: 'absolute', left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, background: '#fff', borderRadius: 12, boxShadow: '0 6px 18px rgba(40,40,80,0.10)'}} />
      <svg width={852} height={480} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <clipPath id="sp-plot">
            <rect x={PLOT.x} y={PLOT.y} width={PLOT.w} height={PLOT.h} rx={4} />
          </clipPath>
          <clipPath id="sp-wave">
            <rect x={PLOT.x} y={PLOT.y} width={x1 - PLOT.x} height={PLOT.h} />
          </clipPath>
        </defs>
        <path d={`M ${CARD.x} ${CARD.y + 12} Q ${CARD.x} ${CARD.y} ${CARD.x + 12} ${CARD.y} L ${CARD.x + tabW - 8} ${CARD.y} Q ${CARD.x + tabW} ${CARD.y} ${CARD.x + tabW} ${CARD.y + 8} L ${CARD.x + tabW} ${CARD.y + 28} Q ${CARD.x + tabW} ${CARD.y + 36} ${CARD.x + tabW - 8} ${CARD.y + 36} L ${CARD.x} ${CARD.y + 36} Z`} fill={PURPLE} />
        <rect x={124} y={124} width={603} height={4} fill={PURPLE} />
        <rect x={PLOT.x} y={PLOT.y} width={PLOT.w} height={PLOT.h} rx={4} fill="#e3e1f4" stroke={PURPLE} strokeWidth={2} />
        <g clipPath="url(#sp-plot)">
          {/* big label behind the waves */}
          {p.big &&
            p.big.text.split('').map((ch, i) => {
              const a = stag(f, p.big!.at, p.big!.stagger, 12, i);
              return (
                <text key={i} x={248 + i * 112} y={ZERO + 50} textAnchor="middle" fontFamily="MontserratLocal" fontWeight={700} fontSize={140} fill="#8f8ccc" opacity={0.75 * a}>
                  {ch}
                </text>
              );
            })}
          <g opacity={axes} stroke={PURPLE} strokeWidth={1.4} strokeDasharray="5 4">
            <line x1={PLOT.x} y1={ZERO - AMP} x2={PLOT.x + PLOT.w} y2={ZERO - AMP} />
            <line x1={PLOT.x} y1={ZERO + AMP} x2={PLOT.x + PLOT.w} y2={ZERO + AMP} />
          </g>
          <g clipPath="url(#sp-wave)" fill="none" strokeWidth={2.4}>
            <path d={sinePath(OX, PLOT.x + PLOT.w, period, Math.PI)} stroke="#f6f5ff" />
            <path d={sinePath(OX, PLOT.x + PLOT.w, period, 0)} stroke="#1b1a2c" />
          </g>
          <g opacity={axes} stroke={PURPLE} strokeWidth={2.6} fill="none" strokeLinecap="round">
            <line x1={PLOT.x} y1={ZERO} x2={PLOT.x + PLOT.w - 10} y2={ZERO} />
            <path d={`M ${PLOT.x + PLOT.w - 20} ${ZERO - 7} L ${PLOT.x + PLOT.w - 11} ${ZERO} L ${PLOT.x + PLOT.w - 20} ${ZERO + 7}`} />
            <line x1={OX} y1={PLOT.y + PLOT.h} x2={OX} y2={146} />
            <path d={`M ${OX - 7} 155 L ${OX} 146 L ${OX + 7} 155`} />
          </g>
          {/* side panel */}
          {sideIn > 0 && sideX < PLOT.x + PLOT.w && <rect x={sideX} y={PLOT.y} width={PLOT.x + PLOT.w - sideX} height={PLOT.h} fill={PURPLE} />}
        </g>
      </svg>
      {/* tv */}
      {tvT > 0 && sideOut < 1 && (
        <div style={{position: 'absolute', left: 480 + (1 - tvT) * 60 + sideOut * 300, top: 170 + (1 - tvT) * 220, width: 200, height: 200, transform: `rotate(${(1 - tvT) * -18}deg)`, transformOrigin: '50% 100%'}}>
          <Tv label={p.side.screen} />
        </div>
      )}
      {/* text */}
      <div style={{fontFamily: CJK, fontWeight: 900}}>
        <div style={{position: 'absolute', left: CARD.x, top: CARD.y, width: tabW, lineHeight: '36px', textAlign: 'center', color: '#fff', fontSize: 20, letterSpacing: 2, opacity: tabs}}>{p.tabs[0]}</div>
        <div style={{position: 'absolute', left: CARD.x + 329, top: CARD.y, width: 305, lineHeight: '36px', textAlign: 'center', color: '#2d2860', fontSize: 20, letterSpacing: 2, opacity: tabs * (1 - single)}}>{p.tabs[1]}</div>
        <div style={{position: 'absolute', left: 129, top: 160, fontSize: 15, color: PURPLE, opacity: axes}}>+V</div>
        <div style={{position: 'absolute', left: 134, top: 243, fontSize: 15, color: PURPLE, opacity: axes}}>0</div>
        <div style={{position: 'absolute', left: 129, top: 327, fontSize: 15, color: PURPLE, opacity: axes}}>-V</div>
      </div>
      {badge > 0 && (
        <div style={{position: 'absolute', left: 673, top: 86, opacity: badge, transform: `scale(${0.6 + 0.4 * badge})`}}>
          <Flag />
        </div>
      )}
    </Stage>
  );
};
