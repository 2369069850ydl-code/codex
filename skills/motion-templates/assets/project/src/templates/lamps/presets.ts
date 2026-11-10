import type {LampTrioProps, Lamp} from './LampTrio';

// Reference timing (25 fps) x1.2. Lamps, camera menu and monitor are drawn.
const lamps: Lamp[] = [
  {label: 'A', value: '3000k', x: 155, color: '#fff1de', alt: '#ff9a3c'},
  {label: 'B', value: '5500k', x: 420, color: '#9cc0ff', alt: '#f6f2ea'},
  {label: 'C', value: '7000k', x: 664, color: '#5f9dff', alt: '#e4e8ff'},
];

export const lampReveal: LampTrioProps = {
  durationInFrames: 196,
  lamps,
  reveal: [{lamp: 1, at: 43, glow: true}, {lamp: 0, at: 96}, {lamp: 2, at: 130}],
  shots: [{kind: 'front', from: -10, to: 999}],
  captions: [[17, '公布答案'], [48, 'B的色温是5500K'], [96, '而A是3000K'], [130, 'C是7000K'], [163, '那大家是不是很好奇']],
};

const wb = Array.from({length: 26}, (_, i) => `${2500 + i * 100}K`);
export const lampWhiteBalance: LampTrioProps = {
  durationInFrames: 316,
  lamps,
  reveal: [],
  revealed: true,
  shots: [
    {kind: 'front', from: -10, to: 16},
    {kind: 'menu', from: 16, to: 152},
    {kind: 'side', from: 152, to: 232},
    {kind: 'front', from: 232, to: 999},
  ],
  menu: {title: '预设白平衡', values: wb, from: 40, to: 110, scroll: [19, 5]},
  title: {text: '此时摄影机的白平衡为3000K', at: 236},
  captions: [[0, '怎么可能是5500K呢'], [26, '那其实是因为我在这个时候'], [70, '把摄影机的白平衡'], [106, '调整到了3000K'], [158, '那当灯的色温'], [185, '和摄影机的白平衡数值一样的时候'], [264, '你所拍摄出来的画面自然也就是白光']],
};
