// "One voice becomes a crowd": a post card, then reply bubbles pop in one by one, the camera pulls
// back while the bubbles multiply across the screen, and they part to reveal a background scene.
// Design space 852x480 at 30 fps; bubble positions are in world px (camera scale 1 = screen px).

export type Key = [frame: number, value: number];

export type Bubble = {
  /** World position of the bubble's top-left corner, and width. */
  x: number;
  y: number;
  w: number;
  at: number;
  name: string;
  text: string;
  /** 0 = sharp foreground, 1 = far / dimmed. */
  depth: number;
  /** Tail on the bottom-left (default) or bottom-right. */
  tail?: 'left' | 'right';
  hue: number;
};

export type VoicesProps = {
  durationInFrames: number;
  post: {name: string; date: string; lines: string[]; highlight: string; poster: [string, string]; stats: [string, string, string]};
  bubbles: Bubble[];
  camera: {scale: Key[]; x: Key[]; y: Key[]};
  /** Background scene fade-in and parting of the bubbles (world px pushed apart from centre). */
  scene: {at: number; frames: number; planetAt: number; part: Key[]; /** screen x of the satellite */ satX: Key[]};
  palette: {name: string; accent: string};
  captions: {from: number; to: number; text: string}[];
};
