import {rng} from '../Lidar/util';
import type {Bubble} from './types';

// Self-written sample replies (no real comments or user names).
const WISHES = [
  '希望有一天能亲眼看看极光', '想在海边开一家小书店', '明年一定要考上研究生', '想带爸妈去一次远方旅行', '希望世界和平，家人健康',
  '想成为一名独立游戏开发者', '今年要学会游泳', '希望自己的作品被更多人看到', '想在山里住一个夏天', '想把吉他练到能弹唱',
  '希望毕业后找到喜欢的工作', '想写完一本属于自己的小说', '能和朋友们一直这样走下去', '想去南极看企鹅', '希望每天都能睡个好觉',
  '想做一部自己的纪录片', '想学会做一桌年夜饭', '希望猫猫长命百岁', '有一天想去太空看看地球', '把每一天都过得认真一点',
  '想跑完一次全程马拉松', '希望努力都有回报', '想开一家只卖咖啡的小店', '想去看一场世界杯', '想学会一门新语言',
];
const NAMES = ['星河漫游', '小树苗', '晚风', '橘子汽水', '山野', '一颗柠檬', '阿远', '鲸落', '小满', '云朵收藏家', '北岛', '夏天的风', '路过的猫', '时间旅人', '青提'];

/** Scatter n bubbles in a rectangle, appearing between t0 and t1, avoiding heavy overlap. */
export const scatter = (seed: number, n: number, rect: [number, number, number, number], t0: number, t1: number, tail: 'left' | 'right' = 'left'): Bubble[] => {
  const r = rng(seed);
  const out: Bubble[] = [];
  let guard = 0;
  while (out.length < n && guard++ < n * 60) {
    const w = 150 + r() * 130;
    const x = rect[0] + r() * (rect[2] - rect[0] - w);
    const y = rect[1] + r() * (rect[3] - rect[1] - 52);
    if (out.some((b) => Math.abs(b.x + b.w / 2 - (x + w / 2)) < (b.w + w) / 2 - 30 && Math.abs(b.y - y) < 44)) continue;
    const i = out.length;
    out.push({x, y, w, at: Math.round(t0 + ((t1 - t0) * i) / n + r() * 6), name: NAMES[Math.floor(r() * NAMES.length)], text: WISHES[Math.floor(r() * WISHES.length)],
      depth: r() < 0.22 ? 0.6 + r() * 0.4 : r() * 0.15, tail, hue: Math.floor(r() * 360)});
  }
  return out;
};
