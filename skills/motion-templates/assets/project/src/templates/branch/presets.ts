import type {BranchTreeProps} from './BranchTree';

// Reference timing (25 fps) x1.2. The card art is drawn placeholder; pass `src` for real images.
export const visualIllusions: BranchTreeProps = {
  durationInFrames: 186,
  title: '视觉错觉',
  stamp: 'YOUR BRAND',
  stampAt: 24,
  branchAt: 52,
  branchDur: 26,
  cards: [
    {label: '物理错觉', at: 89, art: 'stick'},
    {label: '生理错觉', at: 108, art: 'spiral'},
    {label: '认知错觉', at: 152, art: 'room'},
  ],
  captions: [[0, '我们根据自己的理解'], [26, '把视觉错觉分为了三类'], [90, '分别是物理错觉'], [138, '生理错觉还有认知错觉']],
};
