import type {EndCardProps} from './EndCard';

// Reference timing (25 fps) x1.2. Media are drawn placeholders; pass `src` for your clips/stills.
export const endCard: EndCardProps = {
  durationInFrames: 199,
  grow: [16, 70],
  media: [{at: 0, kind: 'landscape', seed: 2}, {at: 156, kind: 'landscape', seed: 5}],
  pixelsAt: 64,
  panelAt: 88,
  credits: [
    {role: '监制 / SUPERVISOR', names: '姓名 A'},
    {role: '制片 / EXECUTIVE PRODUCER', names: '姓名 B  姓名 C'},
    {role: '导演 / DIRECTOR', names: '姓名 D'},
    {role: '制片 / PRODUCER', names: '姓名 E'},
  ],
  creditsAt: 124,
  logoAt: 88,
  tag: 'FOLLOW US',
  tagAt: 122,
  iconsAt: 136,
  accent: {blue: '#20448f', yellow: '#f2c624', red: '#e02634'},
};
