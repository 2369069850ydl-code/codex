import type {SignalProps} from './Signal';

const warn = '由于视频信号与音频信号过于接近，导致读取时发生错误干扰。';
export const signalClash: SignalProps = {
  durationInFrames: 270,
  alerts: [{at: 34, kind: 'warn', text: warn}],
  typeSpeed: 0.55,
  legend: ['声音信号', '电视信号'],
  legendIn: 40,
  chartIn: 14,
  peakA: [[0, 597]],
  peakB: [[0, 583]],
  peaksIn: 86,
  tag: {text: '30 FPS', in: 6, out: 104},
  bubbles: [
    {at: 112, text: '?'},
    {at: 248, text: '!'},
  ],
  glitches: [108],
  winIn: 0,
};

export const signalFix: SignalProps = {
  durationInFrames: 300,
  alerts: [
    {at: -200, kind: 'warn', text: warn},
    {at: 30, kind: 'ok', text: '将视频帧率放慢千分之一。'},
  ],
  typeSpeed: 1.2,
  legend: ['声音信号', '电视信号'],
  legendIn: -100,
  chartIn: -100,
  peakA: [[0, 597]],
  peakB: [[0, 583], [32, 583], [52, 527]],
  peaksIn: -100,
  bubbles: [
    {at: -100, text: '!'},
    {at: 140, text: '29.97 FPS'},
  ],
  glitches: [20],
  winIn: -100,
};
