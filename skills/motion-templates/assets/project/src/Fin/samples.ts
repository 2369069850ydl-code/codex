import type {FinProps} from './types';

// Planar transistor -> FinFET (two reference clips joined: 360 + 239 frames).
const B = 360;
export const finA: FinProps = {
  durationInFrames: 599,
  palette: {bg: '#0c0b1a', bgGlow: '#2a1238', panel: 'rgba(40,40,80,0.18)', border: 'rgba(210,210,230,0.55)', base: '#7a7746', baseTop: '#1c1c1e',
    fin: '#151517', gate: '#e2ba6c', text: '#ffffff', dim: 'rgba(255,255,255,0.35)'},
  header: {title: '平面型晶体管', titleTo: '鳍式场效应晶体管', titleSwapAt: B + 166, steps: ['01.竖起导电沟道', '02.插入栅极', '03.堆叠通道'], stepAt: [0, 112, B + 34], hideAt: B + 186},
  watermark: 'BUILD\nSTEP',
  bigTitle: {zh: '鳍式场效应晶体管', en: 'FinFET', at: B + 188},
  gate: {liftAt: 2, liftFrames: 20, dropAt: 150, dropFrames: 26, width: 2.7, height: 1.35, depth: 0.55, z: 0.75},
  fin: {standAt: 58, standFrames: 44, height: 1.05, thickness: 0.17, length: 2.5, count: 5, pitch: 0.42, splitAt: B + 62, splitFrames: 34},
  base: {width: 3.4, height: 0.55, depth: 3.1},
  camera: {
    az: [[0, 38], [150, 32], [200, 22], [300, 0], [B - 1, -22], [B + 36, -32], [B + 72, -55], [B + 90, -90], [B + 112, -125], [B + 170, -138], [B + 238, -140]],
    el: [[0, 30], [150, 28], [300, 14], [B - 1, 18], [B + 90, 16], [B + 112, 30], [B + 238, 32]],
    dist: [[0, 12], [150, 11.6], [300, 11], [B + 100, 11.2], [B + 170, 11.6], [B + 192, 12.6], [B + 238, 12.8]],
    shiftX: [[0, 0], [B + 168, 0], [B + 192, -150], [B + 238, -150]],
    shiftY: [[0, 0], [B + 168, 0], [B + 192, 32], [B + 238, 32]],
    fov: 28,
  },
  captions: [
    {from: 0, to: 112, text: '我们可以把底下这个包含源极和漏极的通道竖过来摆'},
    {from: 113, to: 206, text: '然后把栅极像鱼鳍一样插进来'},
    {from: 207, to: 292, text: '这样栅极不就变成三面环绕的通道了吗'},
    {from: 293, to: 338, text: '接触面积大大增加'},
    {from: 339, to: B + 28, text: '就不用担心失去控制了'},
    {from: B + 29, to: B + 98, text: '与此同时往纵向堆叠'},
    {from: B + 99, to: B + 138, text: '还有助于把晶体管给做小'},
    {from: B + 139, to: B + 186, text: '来提高它的密度'},
    {from: B + 187, to: B + 238, text: '这种新的技术叫做FinFET'},
  ],
};
