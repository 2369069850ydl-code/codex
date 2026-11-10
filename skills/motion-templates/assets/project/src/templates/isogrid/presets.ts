import {sampleA} from '../../CardGrid/samples';
import type {CardGridProps, CardSpec} from '../../CardGrid/types';

// Group swap: the previous grid (T026's end state) flies off to the upper left, then a new group
// flies in as a plus around a focus card, whose subtitle slides up last. Icons are self-drawn
// patterns, not real flags.
const old: CardSpec[] = sampleA.cards.map((c, i) => ({...c, hero: c.hero, enter: undefined, iconReveal: undefined, subtitle: c.title ? '25 FPS' : undefined, title: c.title ? 'PAL' : undefined, exit: {at: -14 + (i % 3) * 2, dur: 22, to: [0, -5], lift: 40}}));

const fly = (at: number, from: [number, number], lift = 120) => ({at, dur: 22, from, lift});

export const groupSwap: CardGridProps = {
  ...sampleA,
  durationInFrames: 166,
  card: {...sampleA.card, gapX: 120, gapY: 100},
  text: {...sampleA.text, titleTracking: 0.12},
  panel: {keys: [{frame: 0, width: 852, top: 0}], bottom: 480},
  tilt: {...sampleA.tilt, start: -2, end: -1},
  camera: [
    {frame: 0, x: 300, y: 118, zoom: 0.93},
    {frame: 165, x: 318, y: 102, zoom: 0.93},
  ],
  cameraPath: 'eased',
  cards: [
    ...old,
    {id: 'n-top', row: 0, col: 1, icon: {kind: 'bands-h', colors: ['#ffffff', '#d23a3a', '#2a3f8f']}, enter: fly(22, [0, -3])},
    {id: 'n-left', row: 1, col: 0, icon: {kind: 'disc', colors: ['#ffffff', '#e0262b']}, enter: fly(20, [-3, 0])},
    {id: 'n-right', row: 2, col: 1, icon: {kind: 'quad', colors: ['#ffffff', '#c8232c', '#22409a', '#222222']}, enter: fly(36, [0, 3])},
    {id: 'n-far', row: 1, col: 2, icon: {kind: 'bands-v', colors: ['#ffffff', '#e22a2a']}, enter: fly(52, [3, 0])},
    {id: 'n-focus', row: 1, col: 1, title: 'NTSC', subtitle: '29.97 FPS', enter: {at: 64, dur: 16, from: [0, -1.2], lift: 60}, subtitleReveal: [116, 132]},
  ],
};
