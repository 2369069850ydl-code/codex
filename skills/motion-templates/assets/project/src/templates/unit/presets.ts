import type {UnitCounterProps} from './UnitCounter';

// Reference timing (25 fps) x1.2.
export const colorTemp: UnitCounterProps = {
  durationInFrames: 226,
  unitName: '开尔文',
  unitLatin: 'Kelvin',
  unit: 'K',
  steps: [{at: 55, value: 0}, {at: 74, value: 1800}, {at: 94, value: 2800}, {at: 106, value: 3300}, {at: 154, value: 5300}, {at: 198, value: 7500}, {at: 216, value: 9000}],
  scale: [9000, 7500, 6500, 5300, 4000, 3300, 3000, 2800, 1800, 0],
  stops: [
    {value: 0, color: '#9a0000', bg: '#1a0303'},
    {value: 1800, color: '#e53a00', bg: '#2e0904'},
    {value: 3300, color: '#f7d400', bg: '#2c2a06'},
    {value: 5300, color: '#f4f4f4', bg: '#1c1c16'},
    {value: 6500, color: '#a8d4ff', bg: '#0f1b27'},
    {value: 9000, color: '#3f97ff', bg: '#08182c'},
  ],
  ranges: [{from: 0, to: 3300, word: '低色温'}, {from: 5300, to: 9000, word: '高色温'}],
  captions: [[0, '色温单位我们用开尔文 K 来表示'], [61, '我们把 3300K 以下称之为暖色'], [143, '低色温'], [163, '5300K 以上'], [204, '我们称之为冷色'], [222, '高色温']],
};
