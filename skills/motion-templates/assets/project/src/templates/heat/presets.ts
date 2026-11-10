import type {HeatCubeProps} from './HeatCube';

// Reference timing (25 fps) x1.2. Fire and block are drawn.
export const heatColor: HeatCubeProps = {
  durationInFrames: 239,
  fireIn: [8, 24],
  scalesIn: 150,
  colors: [[0, '#030202'], [160, '#050303'], [194, '#5a1414'], [214, '#d42a2a'], [232, '#de7a2a']],
  markers: [{at: 206, pos: 0.08, color: '#ff1a1a'}, {at: 232, pos: 0.32, color: '#e8e02a'}],
  scale: ['#c40000', '#ff3a00', '#ffb000', '#fff200', '#fffbe0', '#ffffff', '#bfe3ff', '#3a9cff'],
  captions: [[0, '但假设这里出现一团火'], [43, '我们对它不断进行加热'], [108, '它的颜色就会产生变化'], [173, '由黑变成红色'], [216, '接着又会变成黄色']],
};

import type {BalanceProps} from './Balance';

// Reference timing (25 fps) x1.2. The balance and weights are drawn.
export const balanceWB: BalanceProps = {
  durationInFrames: 384,
  names: ['色温', '白平衡'],
  namesAt: [60, 96],
  build: [0, 34],
  states: [
    {at: 125, left: {value: 4000, count: 2}},
    {at: 160, left: {value: 4000, count: 2}, right: {value: 4000, count: 2}},
    {at: 290, left: {value: 4000, count: 2}, right: {value: 6000, count: 3}},
    {at: 352, left: {value: 4000, count: 2}, right: {value: 2000, count: 1}},
  ],
  unit: 'K',
  glow: {even: 'rgba(255,255,255,0.95)', leftLess: 'rgba(255,170,60,0.95)', leftMore: 'rgba(120,180,255,0.95)', at: 200, lag: 34},
  captions: [[0, '这就相当于是一个天平'], [70, '右边是白平衡'], [104, '如果两边的数值都一样的话'], [174, '那这个颜色就被调平了'], [209, '你看到的就是白光'], [278, '那如果色温数值小于白平衡'], [313, '光就会偏黄'], [370, '色温大于白平衡']],
};
