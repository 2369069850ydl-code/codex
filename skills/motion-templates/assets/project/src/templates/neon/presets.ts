import type {CapsuleLightProps} from './CapsuleLight';
import type {NeonTitleProps} from './NeonTitle';

export const hdrTitle: NeonTitleProps = {
  durationInFrames: 75,
  word: 'HDR',
  meaning: '高动态范围',
  parts: ['High', 'Dynamic', 'Range'],
  lettersIn: {start: -6, stagger: 5},
  smoothAt: 24,
  frameAt: 30,
  frameGrow: [40, 52],
  meaningAt: 46,
  partsAt: {start: 48, stagger: 7},
  swoosh: {start: 54, dur: 18},
};

export const capsuleLight: CapsuleLightProps = {
  durationInFrames: 44,
  label: 'HDR',
  draw: [-4, 10],
  clickAt: 18,
  outAt: 37,
  scale: [[0, 0.92], [8, 1], [16, 0.84], [24, 1], [44, 0.92]],
};
