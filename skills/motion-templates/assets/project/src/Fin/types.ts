// Step-by-step 3D build: a part lifts away, a flat plate stands up into a fin, a block drops in and
// wraps it, the fin multiplies, and the finished object moves aside for a big title. A step header
// ("01 / 02 / 03") tracks the story. Design space 852x480, 30 fps. World units ~ 1 = base depth / 3.2.

export type Key = [frame: number, value: number];

export type FinProps = {
  durationInFrames: number;
  palette: {bg: string; bgGlow: string; panel: string; border: string; base: string; baseTop: string; fin: string; gate: string; text: string; dim: string};
  header: {title: string; titleTo: string; titleSwapAt: number; steps: string[]; stepAt: number[]; hideAt: number};
  watermark: string;
  bigTitle: {zh: string; en: string; at: number};
  /** Gate block: lifts away at start, drops back in later. */
  gate: {liftAt: number; liftFrames: number; dropAt: number; dropFrames: number; width: number; height: number; depth: number; /** offset along the fins (0 = centre) */ z: number};
  fin: {standAt: number; standFrames: number; height: number; thickness: number; length: number;
    /** Fins after multiplying (odd), their pitch, and when they slide out. */
    count: number; pitch: number; splitAt: number; splitFrames: number};
  base: {width: number; height: number; depth: number};
  camera: {az: Key[]; el: Key[]; dist: Key[]; /** screen offset of the object, px */ shiftX: Key[]; shiftY: Key[]; fov: number};
  captions: {from: number; to: number; text: string}[];
};
