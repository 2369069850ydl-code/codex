import type {EraTagsProps} from './EraTags';

export const eraTags: EraTagsProps = {
  durationInFrames: 255,
  windowIn: 10,
  intro: {text: '早期的NTSC标准帧率是?', out: 8},
  tags: [
    {year: '1941', label: '30 FPS', at: 36, color: '#4a4a4f', side: 'right'},
    {year: '1953', label: '30 FPS', at: 84, color: '#3f63c9', side: 'left'},
  ],
  colorAt: 112,
};
