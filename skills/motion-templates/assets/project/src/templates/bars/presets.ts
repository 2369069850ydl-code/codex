import type {BarMetaProps} from './BarMeta';

export const barMeta: BarMetaProps = {
  durationInFrames: 133,
  label: '杜比视界',
  hi: '亮部',
  lo: '暗部',
  bars: [[128, 321], [190, 353], [128, 321], [160, 321], [95, 321], [190, 353], [128, 321]],
  barsIn: {start: -8, stagger: 6},
  caption: '基于静态元数据',
  swap: {index: 2, to: '动', at: 66},
  bandFade: [36, 48],
  line: [[308, 128], [396, 330], [470, 240], [540, 195], [657, 350], [764, 128]],
  lineDraw: [56, 122],
  marker: [[0, 275], [12, 308], [24, 351], [36, 351], [48, 306], [60, 300], [72, 190], [84, 170], [96, 233], [108, 283], [120, 253], [132, 240]],
};
