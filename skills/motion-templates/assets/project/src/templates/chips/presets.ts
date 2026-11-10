import type {ChipChainProps, ChipNode} from './ChipChain';

// Demo content: a three-stage chip pipeline. Replace glyphs/labels with your own stages
// (e.g. 采集 → 处理 → 输出, or 前端 → 网关 → 数据库).
const row: ChipNode[] = [
  {glyph: 'AI', label: '感知 AI 芯片', x: 226, y: 222, size: 84, at: -1},
  {glyph: '控制', label: '背光控制芯片', x: 426, y: 222, at: 0},
  {glyph: '驱动', label: '背光驱动芯片', x: 625, y: 222, at: 46},
];

export const chipRow: ChipChainProps = {
  durationInFrames: 119,
  nodes: row,
  pulses: [
    {from: 0, to: 1, at: 74, dur: 22},
    {from: 1, to: 2, at: 94, dur: 18},
  ],
  camX: [[0, 165], [10, 102], [44, 90], [52, 80], [62, 6], [70, 0]],
  camY: [[0, 0]],
  zoom: [[0, 1.08], [10, 1]],
  captions: [[0, '其中背光控制芯片'], [38, '还有背光驱动芯片'], [76, '信号沿链路逐级传递，控光更高效']],
};

export const chipTier: ChipChainProps = {
  durationInFrames: 69,
  nodes: [
    ...row.map((n) => ({...n, at: -20})),
    {glyph: '图像', label: '图像控制芯片', x: 428, y: 89, at: -8, labelAt: 12},
  ],
  pulses: [
    {from: 0, to: 1, at: -40, dur: 10},
    {from: 1, to: 2, at: -40, dur: 10},
    {from: 0, to: 3, at: 20, dur: 26, stop: 0.75},
  ],
  camX: [[0, 0]],
  camY: [[0, 66]],
  zoom: [[0, 1.12], [6, 1]],
  introBlur: [[0, 7], [4, 0]],
  exitAt: 53,
  reveal: {w: 320, h: 178},
  captions: [[0, '图像控制芯片负责时序链路'], [58, '实现更精准的图像信号控制']],
};
