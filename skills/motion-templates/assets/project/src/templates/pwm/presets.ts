import type {PwmProps} from './Pwm';

export const pwmA: PwmProps = {
  durationInFrames: 227,
  lamp: '灯珠',
  on: 'ON',
  off: 'OFF',
  dutyStart: 10,
  dutyStep: 10,
  periodFrames: 19,
  blinkFrames: 38,
  brightness: [[0, 0.3], [19, 0.35], [209, 0.9]],
  screen: [[0, 0], [120, 0.15], [171, 0.85], [227, 0.95]],
  intro: -2,
};
