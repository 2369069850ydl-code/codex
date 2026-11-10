import * as THREE from 'three';
import {rng} from '../Lidar/util';

// Procedural canvas textures: matcap for the glossy domes, maze for the pixel wells, glyph for the
// wiring layer. All drawn at runtime, no image files.

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

const toTex = (c: HTMLCanvasElement) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
};

/** Chrome-like matcap: white body, dark crescent on the right, grey reflection bands. */
export const domeMatcap = () => {
  const n = 256;
  const c = canvas(n, n);
  const g = c.getContext('2d')!;
  g.fillStyle = '#16161a';
  g.fillRect(0, 0, n, n);
  g.save();
  g.beginPath();
  g.arc(n / 2, n / 2, n / 2, 0, Math.PI * 2);
  g.clip();
  const body = g.createRadialGradient(n * 0.38, n * 0.4, 4, n * 0.45, n * 0.5, n * 0.62);
  body.addColorStop(0, '#ffffff');
  body.addColorStop(0.6, '#f1f1f3');
  body.addColorStop(1, '#bdbdc2');
  g.fillStyle = body;
  g.fillRect(0, 0, n, n);
  // grey bands
  g.strokeStyle = 'rgba(150,150,158,0.6)';
  g.lineWidth = n * 0.05;
  g.beginPath();
  g.moveTo(n * 0.36, n * 0.08);
  g.quadraticCurveTo(n * 0.25, n * 0.3, n * 0.28, n * 0.52);
  g.stroke();
  g.lineWidth = n * 0.035;
  g.beginPath();
  g.moveTo(n * 0.55, n * 0.06);
  g.quadraticCurveTo(n * 0.44, n * 0.3, n * 0.48, n * 0.5);
  g.stroke();
  // dark crescent on the right
  g.fillStyle = '#121216';
  g.beginPath();
  g.ellipse(n * 0.92, n * 0.42, n * 0.3, n * 0.62, -0.25, 0, Math.PI * 2);
  g.fill();
  g.restore();
  return toTex(c);
};

/** White maze bars on a dark block (pixel well / photodiode). */
export const mazeTexture = (seed: number, w: number, h: number, dark: string, light: string) => {
  const k = 4;
  const c = canvas(Math.round(w * k), Math.round(h * k));
  const g = c.getContext('2d')!;
  const r = rng(seed);
  g.fillStyle = dark;
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = light;
  // Serpentine bars (like the glyph 己): full-ish rows that alternate the open side, joined by
  // short vertical connectors; some rows are split in two.
  const bar = 9 * k, gap = 9.5 * k, m = 13 * k, notch = 22 * k;
  let y = 16 * k;
  let row = 0;
  while (y + bar < c.height - 8 * k) {
    const leftOpen = row % 2 === 0;
    const x0 = leftOpen ? m + notch * (0.4 + r() * 0.6) : m;
    const x1 = leftOpen ? c.width - m : c.width - m - notch * (0.4 + r() * 0.6);
    if (r() < 0.35) {
      const cut = x0 + (x1 - x0) * (0.35 + r() * 0.3);
      g.fillRect(x0, y, cut - x0 - gap / 2, bar);
      g.fillRect(cut + gap / 2, y, x1 - cut - gap / 2, bar);
    } else g.fillRect(x0, y, x1 - x0, bar);
    if (y + 2 * (bar + gap) < c.height - 8 * k) {
      const vx = leftOpen ? x1 - bar : x0;
      g.fillRect(vx, y, bar, bar + gap);
    }
    y += bar + gap;
    row++;
  }
  const t = toTex(c);
  // ExtrudeGeometry front-face uv = shape coords: x in [-w/2, w/2], y in [0, h].
  t.repeat.set(1 / w, 1 / h);
  t.offset.set(0.5, 0);
  return t;
};

/** Blue blocky glyphs on a dark band (wiring layer), one per column. */
export const glyphTexture = (cols: number, pitch: number, w: number, h: number, dark: string, color: string) => {
  const k = 4;
  const c = canvas(Math.round(w * k), Math.round(h * k));
  const g = c.getContext('2d')!;
  g.fillStyle = dark;
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = color;
  for (let i = 0; i < cols; i++) {
    const cx = (w / 2 + (i - (cols - 1) / 2) * pitch) * k;
    const top = h * 0.36 * k, u = 6.5 * k;
    const x0 = cx - 3.5 * u;
    g.fillRect(x0, top, 7 * u, u); // top bar
    g.fillRect(x0, top, u, 5 * u); // left bar
    g.fillRect(x0, top + 4 * u, 7 * u, u); // bottom bar
    g.fillRect(x0 + 2 * u, top + 2 * u, u, u);
    g.fillRect(x0 + 4 * u, top + 2 * u, u, u);
    g.fillRect(x0 + 6 * u, top + 2 * u, u, 2 * u);
  }
  const t = toTex(c);
  t.repeat.set(1 / w, 1 / h);
  t.offset.set(0.5, 0);
  return t;
};
