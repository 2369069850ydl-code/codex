import type {TvClockProps} from './TvClock';

// Reference is 29.97 fps: frames used as-is. The clock is drawn; pass your own subject later.
export const tvClock: TvClockProps = {
  durationInFrames: 251,
  lines: ['由于模拟时代 NTSC 制式交流电的频率影响，', '现代数字电视的基础帧率被规定在'],
  value: {text: '60', suffix: '帧/秒', end: '。', countFrom: 30, countTo: 60, at: -6, land: 16, suffixAt: 17, endAt: 28},
  tv: [
    [0, {x: 95, y: 30, w: 670, h: 410}],
    [46, {x: 95, y: 30, w: 670, h: 410}],
    [58, {x: 48, y: 122, w: 380, h: 232}],
    [126, {x: 48, y: 122, w: 380, h: 232}],
    [142, {x: 37, y: 87, w: 480, h: 294}],
  ],
  panelX: [[0, 852], [46, 852], [58, 451], [126, 451], [142, 545]],
  tag: '实际拍摄: 1S',
  playerAt: 126,
  playTime: [[126, 1], [190, 2], [251, 3]],
  total: '2:30',
  hand: [[0, 33], [251, 41]],
  captions: [[0, '那常规的电视每秒只能播放60帧画面'], [43, '它拍一秒钟素材'], [80, '你的电视上可以播2分半钟'], [139, '拍10秒钟就可以播放25分钟'], [226, '非常夸张']],
};
