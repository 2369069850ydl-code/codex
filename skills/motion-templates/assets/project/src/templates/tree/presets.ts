import type {RelTreeProps} from './RelTree';

// Brand rows in the second group are what the reference shows legibly; other rows are placeholders
// to be replaced with your own content.
export const relTree: RelTreeProps = {
  durationInFrames: 243,
  z: [[0, 1.45], [22, 1.64], [44, 1.67], [95, 1.67], [110, 1.5], [132, 1.19], [154, 1.05], [176, 1]],
  sx: [[0, 634], [22, 652], [95, 652], [110, 606], [132, 476], [154, 444], [200, 430], [242, 426]],
  sy: [[0, 130], [22, 150], [95, 155], [110, 143], [132, 105], [154, 93], [242, 88]],
  groups: [
    {tag: 'HDR10', y: 88, left: [{y: 88, lines: ['支持HDR的所有设备']}], right: {h: 40, lines: ['支持HDR的所有平台']}, leftAt: 12, rightAt: 122, tagAt: -10, litAt: 80},
    {
      tag: 'HDR10+',
      y: 178,
      left: [
        {y: 155, icon: true, lines: ['三星 | Google | OPPO | Redmi', '荣耀 | vivo | 索尼 | 小米', '一加 | 真我realme']},
        {y: 203, icon: true, lines: ['三星 | 长虹 | 东芝 | 海信', 'Redmi | 松下 | TCL | 小米']},
      ],
      right: {h: 54, lines: ['平台 A | 平台 B', '平台 C | 平台 D', '平台 E']},
      leftAt: 20,
      rightAt: 138,
      tagAt: -10,
      litAt: 112,
    },
    {
      tag: '杜比视界',
      y: 288,
      left: [
        {y: 264, icon: true, lines: ['品牌 A | 品牌 B | 品牌 C', '品牌 D | 品牌 E']},
        {y: 314, icon: true, lines: ['品牌 F | 品牌 G | 品牌 H', '品牌 I | 品牌 J | 品牌 K']},
      ],
      right: {h: 84, lines: ['平台 A | 平台 B | 平台 C', '平台 D | 平台 E', '平台 F | 平台 G | 平台 H', '平台 I | 平台 J', '平台 K']},
      leftAt: 134,
      rightAt: 124,
      tagAt: -10,
      litAt: 128,
    },
    {
      tag: 'HDR Vivid',
      y: 396,
      left: [
        {y: 375, icon: true, lines: ['品牌 L | 品牌 M | 品牌 N', '品牌 O']},
        {y: 422, icon: true, lines: ['品牌 P | 品牌 Q | 品牌 R']},
      ],
      right: {h: 54, lines: ['平台 L | 平台 M', '平台 N | 平台 O']},
      leftAt: 150,
      rightAt: 186,
      tagAt: 146,
      litAt: 205,
    },
  ],
};
