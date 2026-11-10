import * as THREE from 'three';

/** Box with rounded edges, centred on the origin. */
export const rbox = (w: number, h: number, d: number, r: number, seg = 3): THREE.BufferGeometry => {
  const rr = Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
  const s = new THREE.Shape();
  const x0 = -w / 2 + rr, x1 = w / 2 - rr, y0 = -h / 2 + rr, y1 = h / 2 - rr;
  // Inner rect; the bevel adds rr on every side.
  s.moveTo(x0, y0);
  s.lineTo(x1, y0);
  s.lineTo(x1, y1);
  s.lineTo(x0, y1);
  s.lineTo(x0, y0);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: Math.max(1e-3, d - 2 * rr),
    bevelEnabled: true,
    bevelThickness: rr,
    bevelSize: rr,
    bevelSegments: seg,
    curveSegments: 4,
  });
  g.translate(0, 0, -(d - 2 * rr) / 2);
  g.computeVertexNormals();
  return g;
};

/** Narrow the top of a geometry (y > 0 side): x and z are scaled towards the axis, x shifted. */
export const taper = (g: THREE.BufferGeometry, h: number, topX: number, topZ: number, shiftX = 0) => {
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    const t = Math.min(1, Math.max(0, (y + h / 2) / h));
    p.setX(i, p.getX(i) * (1 + (topX - 1) * t) + shiftX * t);
    p.setZ(i, p.getZ(i) * (1 + (topZ - 1) * t));
  }
  p.needsUpdate = true;
  g.computeVertexNormals();
  return g;
};
