import type {TagActivateProps, TagCollapseProps} from './CornerTags';

// Positions in the 852x480 design space; labels are plain text (no brand logos).
export const tagActivate: TagActivateProps = {
  durationInFrames: 210,
  word: 'HDR',
  titleY: [[0, 312], [96, 312], [112, 240]],
  frameIn: [4, 18],
  tags: [
    {label: 'HDR10', appear: 8, click: 30, x: [[0, 434], [46, 434], [60, 358], [78, 280], [96, 270], [112, 220]], y: [[0, 140], [46, 140], [60, 145], [96, 143], [112, 110]], s: [[0, 1.15], [30, 1.15], [36, 1.25], [48, 1.25], [60, 0.85], [96, 0.95], [112, 1]]},
    {label: 'HDR10+', appear: 50, click: 70, x: [[50, 760], [66, 597], [96, 606], [112, 647]], y: [[50, 145], [96, 143], [112, 110]], s: [[50, 0.8], [66, 1.2], [84, 1.2], [96, 1], [112, 1]]},
    {label: '杜比视界', appear: 90, click: 125, x: [[90, 243]], y: [[90, 378]], s: [[90, 0.6], [114, 1]]},
    {label: 'HDR Vivid', appear: 128, click: 160, x: [[128, 614]], y: [[128, 378]], s: [[128, 0.8], [140, 1]]},
  ],
};

export const tagCollapse: TagCollapseProps = {
  durationInFrames: 155,
  word: 'HDR',
  titleOut: [0, 14],
  plainAt: [16, 30],
  drift: [28, 70],
  column: {x: 581, y0: 78, gap: 103},
  push: {from: 122, to: 155, zoom: 1.37, cx: 486, cy: -35},
  tags: [
    {label: 'HDR10', corner: [220, 110], grid: [278, 158], grid2: [293, 170], dimAt: 82, collapseAt: 90},
    {label: 'HDR10+', corner: [647, 110], grid: [601, 158], grid2: [591, 170], dimAt: 94, collapseAt: 98},
    {label: '杜比视界', corner: [243, 378], grid: [276, 326], grid2: [296, 301], dimAt: 102, collapseAt: 104},
    {label: 'HDR Vivid', corner: [614, 378], grid: [614, 321], grid2: [619, 306], dimAt: 110, collapseAt: 112},
  ],
};
