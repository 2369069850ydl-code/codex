// Domino template: photo cards fly into a grid -> turn edge-on into bars -> one row of bars is
// re-queued -> the bars topple as a domino chain that stops at accent ("stuck") bars -> one accent
// bar opens into a window. All px values live in an 852x480 design space; frames are at 30 fps.

export type Bezier = [number, number, number, number];
export type Key = [frame: number, value: number];

export type PhotoKind = 'tunnel' | 'road' | 'amber' | 'corridor' | 'street' | 'neon' | 'highway' | 'garage';

export type PhotoCard = {
  /** Image URL (e.g. staticFile('x.jpg')). Without it a self-drawn night-scene SVG is used. */
  src?: string;
  kind?: PhotoKind;
  seed?: number;
  /** Final centre of the card in the grid (design px). */
  x: number;
  y: number;
  /** Fly-in: start frame and direction it comes from. */
  enterAt: number;
  from: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Frame at which the card starts turning edge-on. */
  flipAt: number;
  /** Row of the grid: cards in `keepRow` become domino bars, the others leave upward. */
  row: number;
};

export type DominoProps = {
  durationInFrames: number;
  palette: {
    background: string;
    dots: string;
    panel: string;
    bar: string;
    accent: string;
    /** Window colour once fully opened. */
    window: string;
  };
  panel: {
    left: number;
    right: number;
    top: number;
    bottom: number;
    /** Opening: start width (centred) and frames to reach full width. */
    startWidth: number;
    openFrames: number;
  };
  cards: PhotoCard[];
  card: {
    width: number;
    height: number;
    radius: number;
    /** Fly-in length (frames), start distance (px) and starting tilt (deg). */
    flyFrames: number;
    flyDistance: number;
    flyTilt: number;
    flipFrames: number;
    flipEasing: Bezier;
    /** CSS perspective (px) of the photo phase. */
    perspective: number;
  };
  /** Frame at which the edge-on cards are swapped for flat 2D bars (all flips must be done). */
  handoff: number;
  keepRow: number;
  bars: {
    /** Bar size in world px (= screen px once the camera zoom is 1). */
    width: number;
    height: number;
    /** Ground line (world y of bar bottoms). */
    baseline: number;
    /** World x of the first bar centre; kept-row cards land on every 2nd slot from here. */
    firstX: number;
    /** Slot pitch at the start and at the stuck bar (linear ramp in between). */
    pitchStart: number;
    pitchEnd: number;
    /** Index of the last bar that falls; it leans on the first accent bar. */
    stuckIndex: number;
    /** Distance between the stuck bar slot and the first accent bar. */
    stuckGap: number;
    accentCount: number;
    trailingCount: number;
    /** Kept-row lift before landing in the row: offset keys (world px, + = down). */
    liftKeys: Key[];
    /** Landing of the kept bars: first landing frame, stagger, duration. */
    landAt: number;
    landStagger: number;
    landFrames: number;
    /** New bars drop in from above: first landing frame, stagger, duration, drop height. */
    dropAt: number;
    dropStagger: number;
    dropFrames: number;
    dropHeight: number;
    /** Other rows leave upward: offset at the end (world px) and frames. */
    exitOffset: number;
    exitFrames: number;
    accentAt: number;
    accentFrames: number;
  };
  chain: {
    start: number;
    firstFrames: number;
    stepFrames: number;
    /** Fall time of the stuck bar (it has a wider gap, so it takes longer). */
    lastFrames: number;
    /** Exponent of the per-bar fall (1 = linear, 2 = gravity-like). */
    fallPower: number;
  };
  /** Camera keys after handoff. x/y = world point shown at the design centre. */
  camera: {
    zoom: Key[];
    x: Key[];
    y: Key[];
    /** Pan along the chain: keys of [frame, fraction of the full pan]. */
    pan: Key[];
    /** Screen x where the first accent bar ends after the pan. */
    panEndScreenX: number;
  };
  window: {
    at: number;
    frames: number;
    width: number;
    top: number;
    bottom: number;
    radius: number;
    easing: Bezier;
    colorFrames: number;
    /** Optional image shown inside the opened window. */
    src?: string;
  };
};
