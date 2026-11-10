import * as THREE from 'three';
import {keyed, lerp} from '../Lidar/util';
import type {Layer, LayersProps} from './types';

export const W = 852;
export const H = 480;

export type Placed = {layer: Layer; e: number; y0: number; pitch: number; xs: number[]; width: number};

/** Bottom y, column pitch and column x positions of every layer at a frame (layers bottom-first). */
export const place = (frame: number, p: LayersProps): Placed[] => {
  let y = 0;
  const out: Placed[] = [];
  for (const layer of p.layers) {
    const e = keyed(frame, layer.explode);
    y += layer.gap * e;
    const pitch = lerp(p.pitch[0], p.pitch[1], e);
    const xs = layer.perPixel ? Array.from({length: p.columns}, (_, i) => (i - (p.columns - 1) / 2) * pitch) : [0];
    const width = layer.perPixel ? layer.width : p.columns * p.pitch[0] + layer.width;
    out.push({layer, e, y0: y, pitch, xs, width});
    y += layer.kind === 'dome' ? layer.height : layer.height;
  }
  return out;
};

/** Perspective camera that shows world (x, y, 0) at the screen centre with `scale` px per unit. */
export const cameraAt = (frame: number, p: LayersProps) => {
  const cx = keyed(frame, p.camera.x);
  const cy = keyed(frame, p.camera.y);
  const s = keyed(frame, p.camera.scale);
  const D = H / 2 / Math.tan(((p.camera.fov / 2) * Math.PI) / 180) / s;
  const a = (p.camera.pitchDeg * Math.PI) / 180;
  return {pos: [cx, cy + D * Math.sin(a), D * Math.cos(a)] as [number, number, number], look: [cx, cy, 0] as [number, number, number], fov: p.camera.fov, far: D * 3 + 2000};
};

export const threeCamera = (frame: number, p: LayersProps) => {
  const c = cameraAt(frame, p);
  const cam = new THREE.PerspectiveCamera(c.fov, W / H, 1, c.far);
  cam.position.set(...c.pos);
  cam.lookAt(...c.look);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  return cam;
};

export const project = (cam: THREE.PerspectiveCamera, x: number, y: number, z: number): [number, number] => {
  const v = new THREE.Vector3(x, y, z).project(cam);
  return [((v.x + 1) / 2) * W, ((1 - v.y) / 2) * H];
};
