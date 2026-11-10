import type {SearchTypeProps} from './SearchType';

export const searchLight: SearchTypeProps = {
  durationInFrames: 120,
  style: 'light',
  text: '360的因数有哪些?',
  typeStart: 4,
  typeEnd: 76,
  keys: 'DOYINUHBYONEI',
  open: 96,
};

export const searchCapsule: SearchTypeProps = {
  durationInFrames: 120,
  style: 'dark',
  text: '早期的NTSC标准帧率是?',
  typeStart: 56,
  typeEnd: 104,
  grow: {start: 6, dur: 14},
  pointer: {in: 36, click: 52},
  backdropIn: 0,
};
