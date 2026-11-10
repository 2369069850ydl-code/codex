import type {FlickerProps} from './Flicker';

// One preset per reference clip of BV1ua4y127pk (frame numbers at 30 fps from clip start).
const base = {title: '频闪时间轴', yLabel: '亮度', xLabel: '时间', arcs: 8} as const;
const dark = {start: -100, stagger: 0, dur: 1};
const fps = (v: [number, number][]) => ({kind: 'fps' as const, from: -100, label: '当前帧率：', unit: 'FPS', value: v});
/** bars every 50/fps arcs (flicker drawn at 50 arcs per second of the timeline). */
const iv = (v: [number, number][]) => v.map(([f, x]) => [f, 50 / x] as [number, number]);

export const flickerAxes: FlickerProps = {
  ...base,
  durationInFrames: 248,
  intro: {start: 0, dur: 16},
  waveDraw: [[6, 0], [36, 1]],
  waveTone: {start: 126, stagger: 7, dur: 5},
  axisTags: {x: [38, 76], y: [78, 98], ring: [98, 118]},
  arcHi: {start: 123, perArc: 7, first: 0, count: 8},
};

export const flickerShutter: FlickerProps = {
  ...base,
  durationInFrames: 231,
  waveDraw: [[0, 1]],
  ticks: {label: '1F', inS: {start: -14, stagger: 7, dur: 8}, outS: {start: 42, stagger: 6, dur: 8}},
  header: [{kind: 'slider', from: 76, label: '快门速度', value: [[76, 0.18], [96, 0.1], [116, 0.68], [140, 0.68], [160, 0.38], [180, 0.08], [212, 0.08], [228, 0.48]]}],
  bars: {interval: [[0, 1]], phase: [[0, 0]], width: [[0, 0.02], [96, 0.03], [116, 0.75], [140, 0.75], [160, 0.42], [180, 0.03], [212, 0.03], [228, 0.7]], alpha: [[0, 0], [88, 0], [100, 1]]},
};

export const flickerHatch: FlickerProps = {
  ...base,
  durationInFrames: 330,
  waveDraw: [[0, 1]],
  header: [{kind: 'slider', from: -100, label: '快门速度', value: [[0, 0.48]]}],
  bars: {interval: [[0, 1]], phase: [[0, 0]], width: [[0, 0.7]], alpha: [[0, 1]], tone: [[200, 1], [226, 0.3]]},
  hatch: {start: 116, stagger: 7, dur: 18, at: {3: 46}},
  white: {start: 198, stagger: 3, dur: 14},
};

export const flickerSync: FlickerProps = {
  ...base,
  durationInFrames: 179,
  intro: {start: 0, dur: 16},
  waveDraw: [[10, 0], [42, 1]],
  header: [fps([[0, 25], [143, 25], [153, 50]])],
  bars: {
    interval: [[0, 1]],
    phase: [[0, 0.5]],
    width: [[0, 0.5]],
    alpha: [[0, 1]],
    reveal: [
      {start: 58, stagger: 9, dur: 14, every: 2},
      {start: 146, stagger: 3, dur: 12, every: 2, offset: 1},
    ],
  },
};

export const flickerSyncFill: FlickerProps = {
  ...base,
  durationInFrames: 239,
  waveDraw: [[0, 1]],
  header: [fps([[0, 50]])],
  bars: {interval: [[0, 1]], phase: [[0, 0.5]], width: [[0, 0.5], [86, 0.5], [100, 0.5], [116, 0.5]], alpha: [[0, 1]]},
  white: {start: 126, stagger: 4, dur: 14},
};

export const flickerPhase: FlickerProps = {
  ...base,
  durationInFrames: 344,
  intro: {start: 0, dur: 18},
  waveDraw: [[6, 0], [36, 1]],
  header: [fps([[0, 60]])],
  bars: {interval: iv([[0, 60]]), phase: [[0, 0]], width: [[0, 0.42]], alpha: [[0, 1]], reveal: [{start: 44, stagger: 1.5, dur: 6}], grow: {start: 70, stagger: 4, dur: 10}},
  white: {start: 186, stagger: 5, dur: 16},
};

const fps08: [number, number][] = [[0, 25], [20, 39], [44, 45], [66, 40], [90, 30]];
export const flickerRoll: FlickerProps = {
  ...base,
  arcs: 8.5,
  durationInFrames: 270,
  waveDraw: [[0, 1]],
  header: [fps(fps08)],
  footer: {text: '灯光闪烁频率： 100 Hz      快门速度： 1/100 S', from: -100},
  bars: {interval: iv(fps08), phase: [[0, 0]], width: [[0, 1]], alpha: [[0, 1]]},
  hatch: {start: 108, stagger: 6, dur: 16},
  white: {start: 150, stagger: 9, dur: 14},
};

export const flickerLevel: FlickerProps = {
  ...base,
  arcs: 8.5,
  durationInFrames: 179,
  waveDraw: [[0, 1]],
  header: [fps([[0, 30]])],
  footer: {text: '灯光闪烁频率： 100 Hz      快门速度： 1/100 S', from: -100},
  bars: {interval: [[0, 50 / 30]], phase: [[0, 0]], width: [[0, 1]], alpha: [[0, 1]]},
  white: dark,
  level: {start: 40, stagger: 5, dur: 14, height: 0.6},
};

export const flickerSplit: FlickerProps = {
  ...base,
  title: '频闪关系图',
  layout: 'split',
  arcs: 4.3,
  durationInFrames: 188,
  waveDraw: [[0, 1]],
  header: [
    {kind: 'slider', from: -100, to: 4, label: '快门速度', value: [[0, 0.48]]},
    {kind: 'text', from: 10, text: '电流频率：50HZ     快门速度：1/60 S'},
  ],
  media: {from: 6},
  pill: {label: '帧速率：', value: [[0, 50], [130, 50], [140, 44], [156, 30]], unit: 'FPS', from: 60},
  bars: {interval: iv([[0, 50], [130, 50], [140, 44], [156, 30]]), phase: [[0, 0]], width: [[0, 0.7]], alpha: [[0, 1]], tone: [[0, 0.45]]},
  white: dark,
};
