// Layer-stack explainer: a mosaic board zooms into one cell, a stack of layers (per-pixel columns
// and full-width layers) is shown exploded, the camera pans down layer by layer with labels and
// light rays, then the stack re-assembles. World units ~ px at scale 1; y up, stack bottom at y = 0.

export type Key = [frame: number, value: number];
export type Bezier = [number, number, number, number];

export type LayerKind = 'dome' | 'slab' | 'chamfer';
export type Pattern = 'maze' | 'glyph' | 'none';

export type Layer = {
  id: string;
  kind: LayerKind;
  /** true = one piece per pixel column, false = one piece spanning all columns. */
  perPixel: boolean;
  height: number;
  /** Width of a per-pixel piece (or extra width for a full-width layer, added to columns * pitch). */
  width: number;
  depth: number;
  /** Front / top colours, one per column for per-pixel layers (or one for all). */
  front: string[];
  top: string[];
  /** Colours after `recolorAt` (optional, per column). */
  recolorFront?: string[];
  recolorTop?: string[];
  recolorAt?: number;
  pattern: Pattern;
  patternColor?: string;
  /** Chamfer of the top corners (chamfer kind). */
  chamfer?: number;
  /** Extra vertical gap below this layer when exploded. */
  gap: number;
  /** Explode amount over time (0 = assembled, 1 = exploded): keys [frame, value]. */
  explode: Key[];
  label?: {text: string; at: number; outAt?: number; /** anchor offset from the left-front-top corner of column 0 */ dx: number; dy: number};
};

export type Caption = {from: number; to: number; text: string};

export type LayersProps = {
  durationInFrames: number;
  palette: {card: string; ink: string; blue: string; paper: string; ray: string; label: string};
  columns: number;
  /** Column pitch assembled / exploded. */
  pitch: [assembled: number, exploded: number];
  layers: Layer[];
  /** Camera: screen centre = world (x, y); scale = px per unit. */
  camera: {x: Key[]; y: Key[]; scale: Key[]; pitchDeg: number; fov: number};
  /** Mosaic -> card zoom. */
  intro: {cell: [number, number, number, number]; card: [number, number, number, number]; at: number; frames: number; bgScale: number; bgBlur: number};
  rays: {
    /** Layer ids: rays come from the top, bend through `lens`, recolour below `filter`, end at `sink`. */
    lens: string;
    filter: string;
    sink: string;
    at: number;
    frames: number;
    colorAt: number;
    colors: string[];
    outAt: number;
  };
  captions: Caption[];
};
