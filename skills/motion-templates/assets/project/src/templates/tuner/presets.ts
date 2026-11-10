import type {TunerProps} from './Tuner';

export const frameTuner: TunerProps = {
  durationInFrames: 225,
  title: '帧率调节：',
  options: ['交流电频率', '曝光周期'],
  freqLabel: '交流电频率：50Hz',
  checkLabel: '修改帧率设置',
  value: [[0, 12], [100, 12], [116, 22], [130, 25]],
  target: 25,
  panelIn: -4,
  sliderIn: 30,
};
