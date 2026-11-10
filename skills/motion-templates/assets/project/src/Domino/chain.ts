// Domino chain geometry (2D, y down). Bar i stands on the ground with its right-bottom corner as
// pivot and falls clockwise (to the right). A falling bar rests its top-right corner on the left face
// of the next bar; that contact fixes every bar behind the chain front, so only the front bar needs
// a timing curve. Angles are radians from vertical.

export type ChainGeom = {slots: number[]; width: number; height: number};

const contact = (g: ChainGeom, i: number, phiI: number, phiN: number): number => {
  const pi = g.slots[i] + g.width / 2; // pivot x of bar i
  const cx = pi + g.height * Math.sin(phiI);
  const cy = -g.height * Math.cos(phiI);
  const pn = g.slots[i + 1] + g.width / 2;
  const ax = pn - g.width * Math.cos(phiN);
  const ay = -g.width * Math.sin(phiN);
  // distance of corner from the next bar's left face, along its outward normal
  return (cx - ax) * -Math.cos(phiN) + (cy - ay) * -Math.sin(phiN);
};

/** Smallest angle of bar i that touches bar i+1 (tilted by phiN); PI/2 if it never does. */
export const restAngle = (g: ChainGeom, i: number, phiN: number): number => {
  let lo = 0;
  let hi = Math.PI / 2;
  if (contact(g, i, hi, phiN) > 0) return hi;
  for (let k = 0; k < 40; k++) {
    const mid = (lo + hi) / 2;
    if (contact(g, i, mid, phiN) > 0) lo = mid;
    else hi = mid;
  }
  return lo;
};

/**
 * Angles of bars 0..stuck at time t. Bar `stuck` leans on bar stuck+1, which never falls.
 * starts[i] = frame bar i starts to fall; bar i reaches the next bar at starts[i+1].
 */
export const chainAngles = (g: ChainGeom, stuck: number, starts: number[], t: number, power: number): number[] => {
  const n = stuck + 1;
  const phi = new Array<number>(n).fill(0);
  if (t <= starts[0]) return phi;
  let front = 0;
  while (front < stuck && t >= starts[front + 1]) front++;
  const end = starts[front + 1];
  const q = Math.min(1, Math.max(0, (t - starts[front]) / (end - starts[front])));
  phi[front] = restAngle(g, front, 0) * Math.pow(q, power);
  for (let i = front - 1; i >= 0; i--) phi[i] = Math.max(restAngle(g, i, phi[i + 1]), 0);
  return phi;
};
