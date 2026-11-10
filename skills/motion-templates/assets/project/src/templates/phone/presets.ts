import type {PhoneDemoProps} from './PhoneDemo';

export const phoneTurn: PhoneDemoProps = {
  durationInFrames: 255,
  x: [[0, 426], [70, 426], [88, 426], [140, 426], [154, 270], [200, 255], [240, 230]],
  y: [[0, 240], [88, 240], [140, 240], [154, 232], [240, 240]],
  scale: [[0, 0.9], [88, 1.0], [140, 1.0], [154, 0.62], [200, 0.58], [240, 0.5]],
  rot: [[0, 32], [70, 32], [88, 0], [140, 0], [154, -18], [240, -12]],
  flip: [[0, 0]],
  screens: [
    {from: 0, lines: ['不兼容', 'PAL']},
    {from: 146, lines: ['30', 'FPS']},
    {from: 168, lines: ['60', 'FPS']},
  ],
  formulas: [
    {from: 148, to: 196, text: '60 FPS', x: 470, y: 216, size: 40},
    {from: 196, to: 216, text: '60 FPS x 0.2', x: 390, y: 220, size: 34},
    {from: 216, to: 236, text: '60 FPS x 0.2 S', x: 330, y: 222, size: 32},
    {from: 236, text: '60 FPS x 0.2 S = 12 F', x: 312, y: 226, size: 28},
  ],
  row: {text: '25 F x 0.2 S = 5 F', out: 6},
};

export const phoneFlip: PhoneDemoProps = {
  durationInFrames: 195,
  x: [[0, 236], [17, 360], [34, 426]],
  y: [[0, 150], [17, 230], [34, 240]],
  scale: [[0, 0.5], [17, 0.95], [34, 1.0]],
  rot: [[0, -18], [17, -4], [34, 0]],
  flip: [[0, 0], [8, 70], [17, 90], [26, 140], [34, 180]],
  screens: [
    {from: 0, lines: ['60', 'FPS']},
    {from: 17, ball: {fps: 60, source: 25, n: 25}},
  ],
  formulas: [],
  trail: {out: 4},
};
