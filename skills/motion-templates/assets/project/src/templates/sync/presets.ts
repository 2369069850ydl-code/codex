import type {LightScreenProps} from './LightScreen';

export const lightVsScreen: LightScreenProps = {
  durationInFrames: 165,
  lightLabel: '灯光',
  screenLabel: '屏幕',
  lightPeriod: 44,
  screenPeriod: 28,
  light: {x: [[0, 412], [80, 412], [98, 292]], y: [[0, 240]], s: [[0, 0.86], [80, 0.86], [98, 1]]},
  screen: {x: [[0, 980], [80, 980], [100, 558]], y: [[0, 240]], s: [[0, 1]]},
};

export const cameraMerge: LightScreenProps = {
  durationInFrames: 135,
  lightLabel: '灯光',
  screenLabel: '屏幕',
  lightPeriod: 44,
  screenPeriod: 28,
  light: {x: [[0, 292], [98, 292], [108, 345], [128, 381]], y: [[0, 240], [108, 240], [128, 196]], s: [[0, 1]]},
  screen: {x: [[0, 558], [98, 558], [108, 520], [128, 470]], y: [[0, 240], [108, 240], [128, 282]], s: [[0, 1]]},
  camera: {x: [[0, 440], [14, 430], [38, 430], [52, 612], [98, 612], [112, 700]], y: [[0, 520], [14, 250], [38, 250], [52, 318], [98, 318], [112, 540]], s: [[0, 0.9], [14, 1], [38, 1], [52, 0.62]], r: [[0, -14], [14, -4], [52, 0]], a: [[0, 1]]},
  extrude: [116, 132],
};
