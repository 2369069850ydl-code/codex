import type {FrameSpriteProps} from './FrameSprite';

export const ballFrames: FrameSpriteProps = {
  durationInFrames: 186,
  n: 25,
  counter: [[0, 11], [80, 75]],
  gridAt: 100,
  spreadAt: 118,
  rowAt: 128,
  rowCount: 5,
  formulas: [
    {at: 132, text: '25 F x 0.7 S = 18 F'},
    {at: 154, text: '25 F x 0.2 S = 5 F'},
  ],
};

import type {FramePulldownProps} from './FramePulldown';
export const pulldown: FramePulldownProps = {
  durationInFrames: 519,
  device: '60 FPS',
  formula: '60 FPS x 0.2 S = 12 F',
  formulaUp: 14,
  slots: 12,
  slotsIn: 18,
  pattern: [3, 2, 3, 2, 2],
  cardsIn: 70,
  fillAt: 140,
  fillStagger: 3,
  labels: [210, 254, 290, 330, 350],
  highlights: [
    {group: 2, from: 296, to: 330},
    {group: 0, from: 384, to: 420},
  ],
};
