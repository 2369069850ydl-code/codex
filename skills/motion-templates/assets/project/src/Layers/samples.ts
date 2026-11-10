import type {LayersProps} from './types';

// CMOS pixel cross-section (5 layers, 3 colour pixels). Timings follow the reference clip.
export const layersA: LayersProps = {
  durationInFrames: 572,
  palette: {card: '#dcdcde', ink: '#111114', blue: '#3c3ce6', paper: '#f4f4f4', ray: '#efe8b4', label: '#111114'},
  columns: 3,
  pitch: [112, 162],
  layers: [
    {id: 'substrate', kind: 'slab', perPixel: false, height: 45, width: 0, depth: 110, front: ['#ec8448'], top: ['#b8653c'], pattern: 'none', gap: 0,
      explode: [[0, 0]], label: {text: '基板', at: 496, dx: 8, dy: -10}},
    {id: 'wiring', kind: 'chamfer', perPixel: false, height: 85, width: 0, depth: 100, chamfer: 22, front: ['#2f2a2b'], top: ['#211d1e'],
      pattern: 'glyph', patternColor: '#3b3bf0', gap: 62, explode: [[3, 0], [12, 1], [534, 1], [544, 0]], label: {text: '布线层', at: 488, dx: 12, dy: -14}},
    {id: 'photodiode', kind: 'chamfer', perPixel: true, height: 160, width: 112, depth: 100, chamfer: 14, front: ['#2e2829'], top: ['#211d1e'],
      pattern: 'maze', patternColor: '#ffffff', gap: 58, explode: [[3, 0], [12, 1], [538, 1], [548, 0]], label: {text: '光电二极管', at: 408, dx: 26, dy: -22}},
    {id: 'filter', kind: 'slab', perPixel: true, height: 38, width: 112, depth: 100, front: ['#8f878b', '#87968a', '#8c8e98'], top: ['#7b7478', '#748277', '#797b85'],
      recolorFront: ['#ef3b3d', '#33f03d', '#2e62ef'], recolorTop: ['#d23234', '#2bd336', '#2856d4'], recolorAt: 280, pattern: 'none', gap: 28,
      explode: [[3, 0], [12, 1], [544, 1], [553, 0]], label: {text: '色彩滤镜', at: 276, dx: 34, dy: -22}},
    {id: 'lens', kind: 'dome', perPixel: true, height: 44, width: 95, depth: 100, front: ['#ffffff'], top: ['#ffffff'], pattern: 'none', gap: 45,
      explode: [[3, 0], [12, 1], [548, 1], [557, 0]], label: {text: '微透镜', at: 104, dx: 32, dy: -14}},
  ],
  camera: {
    x: [[2, 480], [20, 0]],
    y: [[2, 503], [20, 543], [276, 543], [292, 429], [360, 429], [376, 281], [464, 281], [476, 175], [534, 175], [556, 172]],
    scale: [[2, 0.3], [20, 1.05], [534, 1.05], [556, 1.0]],
    pitchDeg: 11,
    fov: 20,
  },
  intro: {cell: [225, 245, 340, 425], card: [42, 22, 808, 455], at: 2, frames: 18, bgScale: 2.6, bgBlur: 5},
  rays: {lens: 'lens', filter: 'filter', sink: 'photodiode', at: 178, frames: 22, colorAt: 284, colors: ['#ef3b3d', '#33e83d', '#2e62ef'], outAt: 540},
  captions: [
    {from: 0, to: 88, text: '先看看 CMOS 的微观结构'},
    {from: 89, to: 140, text: '最上面是一层微透镜'},
    {from: 141, to: 180, text: '它负责把光收拢'},
    {from: 181, to: 272, text: '汇聚到每一个像素里'},
    {from: 273, to: 356, text: '下面是彩色滤镜'},
    {from: 357, to: 406, text: '再往下是隔开像素的小井'},
    {from: 407, to: 462, text: '最底下是光电二极管'},
    {from: 463, to: 544, text: '还有布线层和基板'},
    {from: 545, to: 571, text: '合起来就是一个完整的像素'},
  ],
};
