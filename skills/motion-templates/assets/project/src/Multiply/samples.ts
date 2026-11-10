import type {MultiplyProps} from './types';

// Transistor -> billions of transistors. Unit: olive base with dark contact slots + gold gate.
export const multiplyA: MultiplyProps = {
  durationInFrames: 210,
  palette: {bgTop: '#100c1c', bgBottom: '#0a0814', glow: '#3a1a3a', grid: 'rgba(120,110,160,0.10)'},
  unit: [
    {size: [1.0, 0.22, 0.8], pos: [0, 0.11, 0], color: '#5f5e38', metal: 0.1, rough: 0.6},
    {size: [0.98, 0.02, 0.78], pos: [0, 0.225, 0], color: '#2c2c2a', metal: 0.2, rough: 0.5},
    {size: [0.24, 0.025, 0.12], pos: [-0.28, 0.23, 0.35], color: '#151515', metal: 0, rough: 0.8},
    {size: [0.24, 0.025, 0.12], pos: [0.28, 0.23, 0.35], color: '#151515', metal: 0, rough: 0.8},
    {size: [0.55, 0.22, 0.28], pos: [0.05, 0.345, -0.04], color: '#e0b45e', metal: 0.35, rough: 0.38},
  ],
  grid: {n: 50, pitch: 2.0},
  camera: {
    distance: [[0, 3.3], [30, 7.2], [51, 9.4], [66, 10.5], [84, 15], [105, 26], [150, 72], [209, 160]],
    elevation: [[0, 20], [40, 30], [80, 38], [140, 44], [209, 50]],
    azimuth: [[0, 4], [40, 32], [90, 42], [209, 45]],
    fov: 30,
  },
  reveal: {radius: [[0, -1], [50, -0.2], [62, 0.7], [75, 2], [100, 7], [140, 28], [209, 80]], soft: 1.2},
  captions: [
    {from: 0, to: 60, text: '那这每个晶体管其实都是一个开关电路'},
    {from: 61, to: 136, text: '那我们的处理器能够完成各种复杂的运算'},
    {from: 137, to: 209, text: '就是得以于上亿个这样的开关电路来协同工作'},
  ],
};
