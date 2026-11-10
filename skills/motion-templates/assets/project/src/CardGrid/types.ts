// Props for the isometric card-grid scene. All times are in frames (at `fps`),
// grid offsets in "pitch" units (1 = one grid step), px values in the 852x480 design space.

export type IconKind =
  | 'disc'
  | 'sun-corner'
  | 'bands-h'
  | 'bands-v'
  | 'bars'
  | 'stripes-diag'
  | 'dots'
  | 'plus'
  | 'wedge'
  | 'diagonal'
  | 'corner-star'
  | 'quad'
  | 'chevron';

export type CardIcon = {
  kind: IconKind;
  /** Colors used by the pattern, background first. */
  colors: string[];
};

/** cubic-bezier control points [x1, y1, x2, y2] */
export type Bezier = [number, number, number, number];

export type CardEnter = {
  /** First frame of the move. */
  at: number;
  /** Frames the move lasts. */
  dur: number;
  /** Start offset from the slot, in grid pitches [cols, rows]. */
  from: [number, number];
  /** Start height above the plane in px (bigger = closer to camera, flies over other cards). */
  lift?: number;
  /** Position curve (defaults depend on lift). */
  easing?: Bezier;
  /** Height curve for lifted cards (default: hold, then drop late). */
  liftEasing?: Bezier;
};

export type CardSpec = {
  id: string;
  row: number;
  col: number;
  icon?: CardIcon;
  /** Text card instead of icon (used by the focus card). */
  title?: string;
  subtitle?: string;
  /** On screen from frame 0; the camera is anchored to this card. */
  hero?: boolean;
  /** Omit for the hero. */
  enter?: CardEnter;
  /** Optional exit: the card leaves toward `to` (grid pitches) from frame `at`. */
  exit?: {at: number; dur: number; to: [number, number]; lift?: number; easing?: Bezier};
  /** Optional reveal of the icon after landing: [startFrame, endFrame]. */
  iconReveal?: [number, number];
  /** 'wipe' = left to right, 'corner' = grows from the top-right corner. */
  iconRevealMode?: 'wipe' | 'corner';
  /** Frames over which the subtitle slides in under the title. */
  subtitleReveal?: [number, number];
};

export type CameraKey = {
  frame: number;
  /** Screen position (px) where the hero card centre sits. */
  x: number;
  y: number;
  zoom: number;
  /** Only with cameraPath 'smooth': the camera comes to rest at this key. The spline is split here;
   *  a piece with just two keys uses cameraEasing. */
  stop?: boolean;
  /** Only with cameraPath 'smooth': easing of a two-key piece that ends at this key (else cameraEasing). */
  easing?: Bezier;
};

export type PanelKey = {frame: number; width: number; top: number};

export type CardGridProps = {
  durationInFrames: number;
  palette: {
    background: string;
    dots: string;
    panel: string;
    face: string;
    border: string;
    sideDark: string;
    sideLight: string;
    text: string;
    shadow: string;
  };
  card: {
    width: number;
    height: number;
    thickness: number;
    gapX: number;
    gapY: number;
    radius: number;
    /** Border width of the top face in px. */
    border: number;
    /** Icon inset from the card edge, fraction of card width. */
    inset: number;
  };
  text: {
    /** Title size as a fraction of card height. */
    titleSize: number;
    subtitleSize: number;
    titleTracking: number;
    subtitleTracking: number;
    weight: number;
  };
  /** Draw a soft shadow under lifted cards. */
  flyShadow: boolean;
  /** Clip window: keys are interpolated with ease-out; bottom is fixed. */
  panel: {keys: PanelKey[]; bottom: number};
  /** Face-on -> isometric tilt. */
  tilt: {start: number; end: number; rotateX: number; rotateZ: number; perspective: number; easing?: Bezier};
  /** Hero position/zoom keys, interpolated between keys. */
  camera: CameraKey[];
  cameraEasing?: Bezier;
  /** 'smooth' = one continuous spline through all camera keys (no stop at each key; a key pair with
   *  equal values is a hold). 'eased' (default) = each key-to-key segment uses cameraEasing. */
  cameraPath?: 'eased' | 'smooth';
  cards: CardSpec[];
};
