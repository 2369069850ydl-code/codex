import type {StepCardsProps} from './StepCards';

// Reference timing (25 fps) x1.2.
export const sixSteps: StepCardsProps = {
  durationInFrames: 108,
  steps: ['任务需求', '制定方案', '卫星研制', '采购火箭', '发射许可', '在轨测试'],
  cols: 3,
  start: 8,
  stagger: 6.4,
  openDur: 9,
  cell: {x0: 176, y0: 204, dx: 250, dy: 84, w: 208, h: 50},
  captions: [[0, '流程大概是这样的'], [48, '说复杂，其实也就六步']],
};
