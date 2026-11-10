import type {ArrowFocusProps} from './ArrowFocus';

// Reference timing (25 fps) x1.2. The rocket is drawn; put your own footage behind the overlay.
export const arrowFocus: ArrowFocusProps = {
  durationInFrames: 186,
  target: [456, 262],
  arrows: [
    {from: [452, 120], bend: 0.12, at: 16},
    {from: [300, 200], bend: -0.28, at: 24},
    {from: [620, 215], bend: 0.28, at: 26},
    {from: [300, 340], bend: 0.3, at: 28},
    {from: [560, 372], bend: -0.12, at: 30},
  ],
  drawDur: 9,
  arrowsOut: 92,
  zoom: [[0, 1], [36, 1], [48, 1.75], [64, 0.86], [186, 0.86]],
  words: [
    {text: '长征2丁', x: 46, y: 14, at: 115, out: 164},
    {text: '遥七十一', x: 838, y: 288, at: 130, out: 164, align: 'right'},
    {text: '我们的', x: 62, y: 178, at: 164},
    {text: '卫星', x: 760, y: 178, at: 164, align: 'right'},
  ],
  subject: 'rocket',
  captions: [[62, '这枚正在飞出地球'], [88, '']],
};
