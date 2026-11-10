import type {BufferGridProps} from './BufferGrid';

// Reference is 29.97 fps: frames used as-is. Thumbnails are drawn flames; numbers are the frame index.
export const bufferFreeze: BufferGridProps = {
  durationInFrames: 318,
  cols: 10,
  rows: 5,
  countStart: 28,
  rate: 1,
  trigger: 181,
  panel: {right: '2560x768', rows: ['Res', 'Trigger']},
  panelOut: 250,
  zoom: [[0, 1], [250, 1], [266, 1.22]],
  select: {from: 112, to: [[262, 111], [268, 120], [300, 142]]},
  captions: [[0, '只要你启动它'], [10, '它就无时无刻不在记录素材'], [80, '到内存里面'], [104, '不断地刷新'], [130, '只有你按下录制键之后'], [188, '才会把这一小段素材给固定下来'], [250, '然后你再回看内存里素材的时候'], [305, '可以精确地打点']],
};
