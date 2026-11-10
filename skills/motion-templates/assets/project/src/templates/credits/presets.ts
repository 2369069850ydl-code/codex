import type {CreditsProps} from './Credits';

// Sample content is invented; swap in your own names, songs and footage (public/ files via `src`).
export const creditsA: CreditsProps = {
  durationInFrames: 360,
  introAt: -20,
  brand: '你的频道名  |  搜索关键词',
  crewTitle: '制作人员',
  music: [
    {at: 0, lines: ['Music:', 'Morning Grid——Studio A', 'Paper Planes——Lin Studio', 'Slow Signal——Northfield', 'Glass City——Unit 9']},
    {at: 150, lines: ['Music:', 'Night Bus——Harbor', '', 'Other:', 'Field Notes——Tape Club']},
    {at: 290, lines: ['Artist:', 'Window Seat——Kite', 'Low Tide——Mori', 'Blue Hour——Signal 7']},
  ],
  crew: [
    {at: 20, lines: ['监制/EXECUTIVE PRODUCER', '林一', '编导/DIRECTOR', '周二  吴三', '制片/PRODUCER', '郑四']},
    {at: 90, lines: ['录音/SOUND RECORDIST', '王五  冯六', '', '摄影/CAMERAMAN', '陈七  褚八', '卫九  蒋十']},
    {at: 150, lines: ['DIT', '沈一', '剪辑/EDITOR', '韩二', '特效/SPECIAL EFFECTS', '杨三']},
    {at: 240, lines: ['调色/COLOR GRADING', '朱四', '', '混音/SOUND MIXING', '秦五  尤六']},
    {at: 300, lines: ['封面/COVER', '许七', '字幕/SUBTITLE', '何八', '运营/OPERATOR', '吕九  施十']},
  ],
  gearTitle: '本期使用设备',
  gear: [
    {at: 0, text: 'CAMERA A  CAMERA B'},
    {at: 150, text: 'CAMERA C  GIMBAL D'},
    {at: 290, text: 'POCKET CAM  DRONE E'},
  ],
  media: [
    {at: 0, label: '画面 1', hue: 40},
    {at: 30, label: '画面 2', hue: 30},
    {at: 180, label: '画面 3', hue: 20},
    {at: 240, label: '画面 4', hue: 35},
    {at: 300, label: '画面 5', hue: 28},
  ],
};
