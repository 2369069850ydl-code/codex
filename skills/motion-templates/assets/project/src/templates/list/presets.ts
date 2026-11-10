import type {ScrollListProps} from './ScrollList';

const div = [1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36, 40, 45, 60, 72, 90, 120, 180, 360];
const fmt = (d: number) => `360 ÷ ${String(360 / d).padStart(3, ' ')} = ${d}`;
export const factorList: ScrollListProps = {
  durationInFrames: 165,
  title: '360的因数有哪些?',
  rows: div.slice(0, 12).map((d, i) => [fmt(d), fmt(div[12 + i])] as [string, string]),
  highlights: [
    {row: 1, col: 1, at: 24},
    {row: 2, col: 1, at: 40},
    {row: 6, col: 1, at: 66},
    {row: 9, col: 1, at: 94},
  ],
  scroll: [[0, -4.5], [14, -0.2], [56, 0], [70, 1], [84, 3], [98, 4.2], [112, 4.2], [126, 3], [140, 2], [154, 1], [165, 0.8]],
  headerIn: 6,
};

export const factorChat: ScrollListProps = {
  ...factorList,
  durationInFrames: 93,
  scroll: [[0, 0]],
  highlights: factorList.highlights.map((h) => ({...h, at: -100})),
  headerIn: undefined,
  chat: {in: -2, question: '为什么没有看到25帧和50帧的档位?', qIn: 10, answer: [['360 ÷ 25 = ', '14.4'], ['360 ÷ 50 = ', '7.2']], aIn: 60, growAt: 74},
};
