import type {ValueWordsProps} from './ValueWords';

export const valueWords: ValueWordsProps = {
  durationInFrames: 122,
  words: [{text: '更高效', at: 18}, {text: '更精准', at: 33}, {text: '更均匀', at: 55}],
  glitch: [3, 14],
  media: [{at: 0, kind: 'sparks', seed: 1}, {at: 75, kind: 'night', seed: 3}],
  gaugeAt: 82,
  gaugeDur: 38,
  count: [40, 100],
  segments: 22,
  captions: [[0, '更高效'], [30, '更精准'], [52, '更均匀'], [84, '实现真实场景的亮度提升']],
};
