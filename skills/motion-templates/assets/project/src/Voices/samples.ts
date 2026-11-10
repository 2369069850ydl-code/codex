import {scatter} from './gen';
import type {VoicesProps} from './types';

const first = [
  {x: 275, y: 253, w: 248, at: 22, name: '星河漫游', text: '探索未知，希望有一天能亲眼看看太空', depth: 0, hue: 330},
  {x: 318, y: 178, w: 205, at: 86, name: '小树苗', text: '想在海边开一家小书店', depth: 0.7, hue: 200},
  {x: 330, y: 150, w: 210, at: 100, name: '晚风', text: '希望世界和平，家人健康', depth: 0, hue: 40},
  {x: 290, y: 330, w: 230, at: 120, name: '橘子汽水', text: '明年一定要考上研究生', depth: 0, hue: 15},
  {x: 520, y: 300, w: 220, at: 142, name: '山野', text: '想带爸妈去一次远方旅行', depth: 0.8, hue: 120},
];

export const voicesA: VoicesProps = {
  durationInFrames: 510,
  post: {
    name: '我的频道',
    date: '2026-11-08',
    lines: ['如果有一个机会，能把你的「心愿」', '带到很远很远的地方', '你最想说的一句话是什么？', '无论多天马行空', '请写下来', '也许我们能在你实现梦想的过程中', '帮到你'],
    highlight: '梦想',
    poster: ['写下', '心愿'],
    stats: ['256', '5037', '4232'],
  },
  bubbles: [
    ...first,
    ...scatter(3, 44, [90, 40, 1030, 690], 200, 300),
    ...scatter(9, 22, [1150, 60, 1500, 690], 366, 440, 'right'),
  ],
  camera: {
    scale: [[0, 1], [150, 1], [215, 0.8], [509, 0.8]],
    x: [[0, 426], [150, 426], [215, 630], [300, 650], [509, 900]],
    y: [[0, 240], [150, 240], [215, 370], [509, 370]],
  },
  scene: {at: 214, frames: 40, planetAt: 300, part: [[0, 0]], satX: [[214, 760], [300, 735], [509, 410]]},
  palette: {name: '#e2557a', accent: '#5462e8'},
  captions: [
    {from: 0, to: 196, text: '我们收到了很多很多的回复'},
    {from: 197, to: 450, text: '每一条都是一个具体的愿望'},
    {from: 451, to: 509, text: '这是我们自己也没有想到的'},
  ],
};
