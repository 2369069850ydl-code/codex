// "One becomes countless": a single 3D unit is shown up close, the camera pulls back while copies
// fade in around it, until the grid reads as a texture. Design space 852x480, 30 fps.

export type Key = [frame: number, value: number];

/** A unit is a stack of boxes (x = width, y = height, z = depth), in unit-local coordinates. */
export type UnitBox = {size: [number, number, number]; pos: [number, number, number]; color: string; metal: number; rough: number};

export type MultiplyProps = {
  durationInFrames: number;
  palette: {bgTop: string; bgBottom: string; glow: string; grid: string};
  unit: UnitBox[];
  /** Grid half-size (copies per side = 2n+1) and pitch in world units. */
  grid: {n: number; pitch: number};
  camera: {
    /** Distance from the target (log-interpolated between keys). */
    distance: Key[];
    /** Elevation above the ground plane, degrees. */
    elevation: Key[];
    /** Azimuth around the vertical axis, degrees. */
    azimuth: Key[];
    fov: number;
  };
  /** Copies fade in: radius (in pitches) of fully visible copies over time, and fade width. */
  reveal: {radius: Key[]; soft: number};
  captions: {from: number; to: number; text: string}[];
};
