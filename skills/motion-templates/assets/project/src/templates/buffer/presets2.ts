import type {TransferGridProps} from './TransferGrid';

// Reference is 29.97 fps: frames used as-is.
export const memToDisk: TransferGridProps = {
  durationInFrames: 232,
  cols: 10,
  rows: 10,
  source: '内存',
  target: '硬盘',
  capacity: '2TB',
  usedLabel: '已使用',
  fill: {start: 30, rate: 1.32},
  copied: [[118, 0], [147, 13], [168, 22], [189, 32], [210, 42], [232, 52]],
  pctPerCell: 0.088,
  barAt: 26,
  zoom: [{t: 0, z: 1.05, x: 425, y: 250}, {t: 50, z: 1.05, x: 425, y: 250}, {t: 84, z: 1, x: 428, y: 240}, {t: 232, z: 1, x: 428, y: 240}],
  captions: [[0, '叫做内存'], [14, '也就是说'], [36, '在录制停止之后'], [80, '我们可以从这个很快的内存'], [140, '把它拷到我们的硬盘'], [182, '也就是我们的卡里面'], [224, '所以一次能拍多长']],
};
