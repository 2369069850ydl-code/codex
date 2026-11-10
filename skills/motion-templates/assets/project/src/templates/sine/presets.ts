import type {SinePanelProps} from './SinePanel';

export const acPanel: SinePanelProps = {
  durationInFrames: 201,
  tabs: ['交流电频率', '电视帧率'],
  tabsIn: 30,
  axesIn: 12,
  waveDraw: [[22, 0], [52, 1]],
  period: [[0, 155], [118, 155], [134, 112]],
  side: {in: 30, out: 116, screen: 'FRAME RATE', tvIn: 54},
  badgeIn: 114,
  big: {text: '60HZ', at: 140, stagger: 5},
};
