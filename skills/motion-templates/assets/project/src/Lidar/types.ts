// LiDAR explainer template: a title card zooms into a white clay 3D city, the camera dives to a car
// with a roof LiDAR, laser pulses hit a target, a pulse chart slides in, the camera orbits to a
// coordinate label, then to a side view with a distance line, and finally a far target and a
// higher peak on the chart. Design space 852x480 at 30 fps; 3D units are roughly half-metres.

export type Vec3 = [number, number, number];
export type Bezier = [number, number, number, number];
export type Key = [frame: number, value: number];

export type CamKey = {
  f: number;
  pos: Vec3;
  look: Vec3;
  fov: number;
  /** End a smooth segment here (the path stops at this key instead of passing through it). */
  stop?: boolean;
};

export type Caption = {from: number; to: number; text: string};

export type Target = {
  kind: 'bin' | 'stack';
  pos: Vec3;
};

export type LidarProps = {
  durationInFrames: number;
  palette: {
    paper: string;
    ink: string;
    blue: string;
    beam: string;
    target: string;
    chartLine: string;
    chartAccent: string;
    ground: string;
    sky: string;
  };
  title: {zh: string; en: string};
  captions: Caption[];
  /** Title card -> 3D window. */
  intro: {cityFadeAt: number; cityFadeFrames: number; zoomAt: number; zoomFrames: number; titleOpacity: Key[]};
  /** Left chart panel slides in. */
  panel: {at: number; frames: number};
  scene: {
    seed: number;
    car: {from: Vec3; to: Vec3; driveAt: number; driveFrames: number};
    targets: Target[];
    lamps: Vec3[];
    /** Directional light offset from the hero area (sets shadow direction). */
    sun: Vec3;
  };
  camera: CamKey[];
  /** Internal resolution of the 3D canvas (0.5..1); lower = softer and faster. */
  renderScale: number;
  beam: {
    /** LiDAR window lights up. */
    lightAt: number;
    /** Single pulses travel to target 0 and back. */
    pulseAt: number;
    pulseEvery: number;
    pulseCount: number;
    /** Steady out/return beam to target 0. */
    steadyAt: number;
    steadyEnd: number;
    /** Hologram scan grid on target 0. */
    scanAt: number;
    scanEnd: number;
    /** Particle stream towards the camera (close-up). */
    streamAt: number;
    streamEnd: number;
    /** LiDAR window goes dark. */
    darkAt: number;
    /** Beams to the far target (index 1). */
    farAt: number;
  };
  label: {at: number; text: string; outAt: number};
  distance: {at: number; frames: number; farAt: number; farFrames: number; outAt?: number};
  chart: {
    titleAt: number;
    gridAt: number;
    curveAt: number;
    curveFrames: number;
    badge: string;
    badgeAt: number;
    blinkAt: number[];
    fillAt: number;
    rescaleAt: number;
    rescaleFrames: number;
    peak2At: number;
    peak2Frames: number;
    tag: string;
    tagAt: number;
  };
};
