import type {Tile} from './Bento';
import type {SpectrumBarProps} from './SpectrumBar';
import type {SpectrumChartProps} from './SpectrumChart';

// References are 29.97 fps: frames used as-is. Tiles and illustrations are drawn.
const barTiles: Tile[] = [
  {x: 0, y: 0, w: 142, h: 100, fill: 'k'}, {x: 142, y: 0, w: 64, h: 100, fill: 'b'}, {x: 206, y: 0, w: 260, h: 100, fill: 'w'}, {x: 466, y: 0, w: 202, h: 100, fill: 'w'}, {x: 668, y: 0, w: 184, h: 115, fill: 'w'},
  {x: 0, y: 100, w: 142, h: 108, fill: 'w'}, {x: 0, y: 208, w: 142, h: 215, fill: 'w'},
  {x: 142, y: 100, w: 526, h: 323, fill: 'w'},
  {x: 668, y: 115, w: 184, h: 258, fill: 'b', deco: 'planet'}, {x: 668, y: 373, w: 72, h: 50, fill: 'k'}, {x: 740, y: 373, w: 112, h: 50, fill: 'w'},
  {x: 0, y: 423, w: 142, h: 57, fill: 'b'}, {x: 142, y: 423, w: 470, h: 57, fill: 'w'}, {x: 612, y: 423, w: 56, h: 57, fill: 'k'}, {x: 668, y: 423, w: 72, h: 57, fill: 'k'}, {x: 740, y: 423, w: 112, h: 57, fill: 'w', deco: 'label', text: 'LIDAR'},
  {x: -220, y: -140, w: 220, h: 200, fill: 'k', deco: 'dot'}, {x: -220, y: 60, w: 220, h: 160, fill: 'w', deco: 'bars', text: 'LIDAR'}, {x: -220, y: 220, w: 220, h: 150, fill: 'w'}, {x: -220, y: 370, w: 220, h: 230, fill: 'b'},
  {x: 0, y: -140, w: 300, h: 140, fill: 'w'}, {x: 300, y: -140, w: 90, h: 140, fill: 'b'}, {x: 390, y: -140, w: 462, h: 140, fill: 'w'}, {x: 852, y: -140, w: 240, h: 255, fill: 'w'},
  {x: 852, y: 115, w: 240, h: 258, fill: 'w', deco: 'letters', text: 'GLIDAR'}, {x: 852, y: 373, w: 240, h: 227, fill: 'k'},
  {x: -220, y: 480, w: 520, h: 120, fill: 'w'}, {x: 300, y: 480, w: 130, h: 120, fill: 'k'}, {x: 430, y: 480, w: 422, h: 120, fill: 'b'},
];

export const spectrumBar: SpectrumBarProps = {
  durationInFrames: 133,
  tiles: barTiles,
  cam: [{t: 0, x: 400, y: 240, z: 0.95}, {t: 30, x: 405, y: 261, z: 1}, {t: 108, x: 405, y: 261, z: 1}, {t: 126, x: 560, y: 225, z: 0.78}, {t: 133, x: 570, y: 222, z: 0.77}],
  card: {x: 142, y: 100, w: 526, h: 323},
  table: [
    [{zh: '宇宙射线', en: 'Cosmic rays'}, {zh: 'X光', en: 'X-Rays'}, {zh: '微波炉', en: 'Microwaves'}, {zh: '收音机', en: 'Radio'}],
    [{zh: '伽马射线', en: 'Gamma rays'}, {zh: '紫外线', en: 'UV'}, {zh: '红外线', en: 'IR'}, {zh: '雷达', en: 'Radar'}, {zh: '广播频段', en: 'Broadcastband'}],
  ],
  expandAt: 40,
  ranges: [{text: '可见光范围', from: 0.046, to: 0.81, at: 64}, {text: '红外线', from: 0.81, to: 0.995, at: 72}],
  ticks: [{text: '400纳米', pos: 0.046, at: 70}, {text: '500纳米', pos: 0.265, at: 73}, {text: '600纳米', pos: 0.55, at: 76}, {text: '700纳米', pos: 0.8, at: 79}],
  tickAt: 70,
  irFrom: 0.81,
  captions: [[0, '因为它的波长并不在我们的可见光'], [56, '400-700 纳米这个范围之内'], [124, '那最有代表性的就是各式各样的激光雷达']],
};

const chartTiles: Tile[] = [
  {x: 20, y: 5, w: 540, h: 92, fill: 'w'}, {x: 560, y: 5, w: 118, h: 92, fill: 'k'}, {x: 678, y: 5, w: 112, h: 92, fill: 'w'}, {x: 790, y: -60, w: 70, h: 435, fill: 'b', deco: 'lines'},
  {x: -60, y: -60, w: 80, h: 157, fill: 'w'}, {x: 5, y: 100, w: 78, h: 295, fill: 'w'}, {x: 88, y: 100, w: 700, h: 295, fill: 'w'}, {x: 792, y: 378, w: 70, h: 110, fill: 'w'},
  {x: -60, y: 398, w: 260, h: 90, fill: 'k'}, {x: 200, y: 398, w: 475, h: 90, fill: 'w'}, {x: 675, y: 398, w: 115, h: 90, fill: 'k'}, {x: -60, y: 100, w: 65, h: 295, fill: 'k'},
];

export const spectrumChart: SpectrumChartProps = {
  durationInFrames: 155,
  tiles: chartTiles,
  cam: [{t: 0, x: 426, y: 240, z: 1}, {t: 14, x: 436, y: 240, z: 1.06}, {t: 155, x: 436, y: 240, z: 1.06}],
  card: {x: 88, y: 100, w: 700, h: 295},
  xDomain: [[0, [300, 1550]]],
  xTicks: [400, 600, 800, 1000, 1200, 1400, 1550],
  band: [370, 710],
  curves: [
    {pts: [[330, 8], [350, 18], [380, 40], [410, 62], [430, 72], [460, 76], [490, 78], [510, 79], [540, 75], [570, 68], [600, 62], [640, 52], [680, 44], [720, 36], [760, 28], [800, 22], [850, 16], [900, 11], [950, 7], [1000, 4], [1050, 2], [1100, 0.5], [1150, 0]], color: '#3d3cf2', at: -30, dur: 1, legend: 'CMOS感光范围', legendAt: 22},
    {pts: [[396, 0], [398, 40], [405, 62], [420, 74], [450, 80], [480, 81], [510, 79], [560, 70], [610, 55], [650, 40], [700, 25], [740, 14], [790, 8], [850, 6], [890, 7]], color: '#d42a3a', at: 140, dur: 14, legend: '红外截止滤镜范围', legendAt: 146},
  ],
  region: {from: 1100, to: 1545, at: 18, out: 48},
  marker: {x: 1540, at: 24},
  note: {text: ['1550 nm 激光的准直性更好，', '能量更集中，但容易被水吸收'], at: 50},
  captions: [[0, '这个波长要更长一些'], [40, '离可见光更远一些'], [80, 'CMOS 理论来说也不感光了'], [148, '红外截止滤镜保护不了那么远']],
};
