import React from 'react';
import {FONT_FAMILY} from '../fonts';
import {CJK} from './cjk';
import type {Layout} from './Frame';
import type {LidarProps} from './types';
import {lerp, ramp} from './util';

// Left panel: title, pulse-power chart (grid, peak/average lines, gaussian pulse, hatched area),
// duration badge, then a zoom-out with a second, higher peak and a power tag.
// Chart space = screen space of the panel before the zoom-out (panel right edge at x = 267).

const PW = 267;
const BASE = 365, PEAK = 184, AVG = 347, X0 = 55, CX = 162, SIG = 13.5;
const P2X = 343, P2TOP = 33;
const ZOOM_PIVOT: [number, number] = [-65, 365];
const ZOOM_TO = 0.63;
const GRID = 26.3;

const gauss = (cx: number, top: number, sig: number, grow = 1) => {
  const pts: string[] = [];
  for (let x = cx - 4 * sig; x <= cx + 4 * sig + 0.01; x += sig / 6) {
    const y = BASE - (BASE - top) * grow * Math.exp(-((x - cx) ** 2) / (2 * sig * sig));
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return `M${pts.join(' L')}`;
};

export const Chart: React.FC<{frame: number; props: LidarProps; layout: Layout}> = ({frame, props, layout}) => {
  const {chart, palette} = props;
  const r = layout.left;
  const ox = r[2] - PW;
  const s = lerp(1, ZOOM_TO, ramp(frame, chart.rescaleAt, chart.rescaleAt + chart.rescaleFrames, [0.4, 0, 0.2, 1]));
  const T = `translate(${ZOOM_PIVOT[0]} ${ZOOM_PIVOT[1]}) scale(${s}) translate(${-ZOOM_PIVOT[0]} ${-ZOOM_PIVOT[1]})`;
  const gh = ramp(frame, chart.gridAt, chart.gridAt + 6);
  const gv = ramp(frame, chart.gridAt + 3, chart.gridAt + 9);
  const lines = ramp(frame, chart.gridAt + 4, chart.gridAt + 8);
  const curve = ramp(frame, chart.curveAt, chart.curveAt + chart.curveFrames, [0.4, 0, 0.4, 1]);
  const fill = ramp(frame, chart.fillAt, chart.fillAt + 6);
  const p2 = ramp(frame, chart.peak2At, chart.peak2At + chart.peak2Frames, [0.3, 0, 0.2, 1]);
  const badgeW = ramp(frame, chart.badgeAt, chart.badgeAt + 4);
  const blink = chart.blinkAt.some((b) => frame >= b && frame < b + 2);
  const badgeText = frame >= chart.badgeAt + 2 && !blink;
  const tag = ramp(frame, chart.tagAt, chart.tagAt + 5, [0.3, 1.6, 0.5, 1]);
  const clipTop = 128;
  const xs: number[] = [];
  for (let x = X0 - GRID * 20; x < 900; x += GRID) xs.push(x);
  const ys: number[] = [];
  for (let y = BASE + 5; y > -400; y -= GRID) ys.push(y);
  const lineW = 2.4 / s;
  return (
    <div style={{position: 'absolute', left: r[0], top: r[1], width: Math.max(0, r[2] - r[0]), height: Math.max(0, 480 - r[1]), overflow: 'hidden'}}>
    <svg style={{position: 'absolute', left: ox - r[0], top: -r[1], width: PW, height: 480, overflow: 'hidden'}} viewBox={`0 0 ${PW} 480`}>
      <defs>
        <clipPath id="lc">
          <rect x={lerp(X0, 2, ramp(frame, chart.rescaleAt, chart.rescaleAt + chart.rescaleFrames))} y={clipTop} width={PW} height={372 - clipTop} />
        </clipPath>
        <pattern id="hatch" width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1={0} y1={0} x2={0} y2={6} stroke={palette.chartAccent} strokeWidth={1.4} />
        </pattern>
        <clipPath id="c1">
          <path d={`${gauss(CX, PEAK, SIG)} Z`} />
        </clipPath>
        <clipPath id="c2">
          <path d={`${gauss(P2X, P2TOP, SIG, p2)} Z`} />
        </clipPath>
      </defs>
      <text x={150} y={72} textAnchor="middle" fontFamily={CJK} fontWeight={900} fontSize={30} letterSpacing={8} fill="#111">
        {props.title.zh}
      </text>
      <text x={148} y={100} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={700} fontSize={16.5} fill="#5246d8">
        {props.title.en}
      </text>
      <g clipPath="url(#lc)">
        <g transform={T}>
          {ys.map((y, i) => (
            <line key={`h${i}`} x1={X0 - 600} x2={lerp(X0 - 600, 900, gh)} y1={y} y2={y} stroke="#9a9aa6" strokeWidth={0.9 / s} opacity={0.8} />
          ))}
          {xs.map((x, i) => (
            <line key={`v${i}`} x1={x} x2={x} y1={-600} y2={lerp(-600, BASE + 10, gv)} stroke="#9a9aa6" strokeWidth={0.9 / s} opacity={0.8} />
          ))}
          <rect x={X0 - 600} y={AVG} width={1500} height={BASE + 8 - AVG} fill={palette.chartLine} opacity={0.28 * lines} />
          <line x1={X0} x2={lerp(X0, 900, lines)} y1={PEAK} y2={PEAK} stroke={palette.chartLine} strokeWidth={lineW} />
          <line x1={X0} x2={lerp(X0, 900, lines)} y1={AVG} y2={AVG} stroke={palette.chartLine} strokeWidth={lineW} />
          <line x1={X0} x2={900} y1={PEAK} y2={PEAK} stroke={palette.chartAccent} strokeWidth={lineW} strokeDasharray="10 14" opacity={fill} />
          <rect x={CX - 4 * SIG} y={PEAK} width={8 * SIG * fill} height={BASE - PEAK} fill="url(#hatch)" clipPath="url(#c1)" />
          <path d={gauss(CX, PEAK, SIG)} fill="none" stroke={palette.chartLine} strokeWidth={lineW} pathLength={1} strokeDasharray={`${curve} 1`} />
          {p2 > 0 ? (
            <>
              <rect x={P2X - 4 * SIG} y={P2TOP} width={8 * SIG} height={BASE - P2TOP} fill="url(#hatch)" clipPath="url(#c2)" />
              <path d={gauss(P2X, P2TOP, SIG, p2)} fill="none" stroke={palette.chartLine} strokeWidth={lineW} />
              <line x1={X0 - 600} x2={900} y1={BASE - (BASE - P2TOP) * p2} y2={BASE - (BASE - P2TOP) * p2} stroke={palette.chartAccent}
                strokeWidth={lineW} opacity={0.8 * p2} />
            </>
          ) : null}
          {[PEAK, AVG].map((y) => (
            <circle key={y} cx={X0} cy={y} r={3.6 / s} fill={palette.chartAccent} opacity={lines} />
          ))}
          <g fontFamily={FONT_FAMILY} fontWeight={600} fill="#222" opacity={lines}>
            <text x={8} y={180} fontSize={9.5}>Peak</text>
            <text x={8} y={191} fontSize={9.5}>power</text>
            <text x={8} y={204} fontSize={9.5}>P<tspan fontSize={6.5} dy={1.5}>peak</tspan></text>
            <text x={5} y={342} fontSize={9.5}>Average</text>
            <text x={5} y={354} fontSize={9.5}>Power</text>
            <text x={8} y={367} fontSize={9.5}>P<tspan fontSize={6.5} dy={1.5}>av</tspan></text>
          </g>
        </g>
      </g>
      <g transform={`translate(55 386)`}>
        <rect x={0} y={0} width={183 * badgeW} height={34} fill={palette.chartLine} />
        {badgeText ? (
          <text x={91} y={27} textAnchor="middle" fontFamily={CJK} fontWeight={900} fontSize={27} letterSpacing={2} fill="#fff">
            {chart.badge}
          </text>
        ) : null}
      </g>
      {tag > 0 ? (
        <g transform={`translate(220 116) scale(${tag}) rotate(-4)`}>
          <rect x={-44} y={-13} width={88} height={26} fill={palette.chartLine} />
          <text x={0} y={8} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={700} fontSize={19} fill="#fff">
            {chart.tag}
          </text>
        </g>
      ) : null}
    </svg>
    </div>
  );
};
