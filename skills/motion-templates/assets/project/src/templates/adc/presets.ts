import type {ChannelScaleProps} from './ChannelScale';

// Reference is 29.97 fps: frames used as-is. Sensor, chips and cables are drawn.
export const adcScale: ChannelScaleProps = {
  durationInFrames: 156,
  cam: [
    {t: 0, x: 330, y: 170, z: 1.7, tilt: 18},
    {t: 3, x: 320, y: 190, z: 1.75, tilt: 18},
    {t: 18, x: 118, y: 572, z: 2.45, tilt: 6},
    {t: 82, x: 110, y: 578, z: 2.5, tilt: 6},
    {t: 98, x: 396, y: 552, z: 1.05, tilt: 14},
    {t: 104, x: 420, y: 520, z: 0.92, tilt: 12},
    {t: 124, x: 500, y: 425, z: 0.58, tilt: 2},
    {t: 156, x: 500, y: 430, z: 0.56, tilt: 0},
  ],
  titles: [{text: '普通相机', at: 12, out: 62}, {text: 'T4040', at: 66}],
  chip: 'ADC',
  few: 3,
  many: 24,
  fewAt: 12,
  manyAt: 86,
  sensorLabel: 'CMOS',
  blurAt: [102, 124],
  out: 'FPGA',
  outCount: 5,
  captions: [[0, '他们为它设计了更高并行度的'], [60, '一个叫做ADC的东西'], [112, '来进一步提高它的输出带宽']],
};
