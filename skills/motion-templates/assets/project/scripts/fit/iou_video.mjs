// usage: node scripts/fit/iou_video.mjs <refMask.bin> <oursMask.bin>  (284x160 per frame, from refmask.py)
// Prints per-frame IoU (1px dilation) and the mean, so whole renders can be compared.
import fs from 'node:fs';
const W = 284, H = 160, N = W * H;
const [a, b] = process.argv.slice(2).map((f) => fs.readFileSync(f));
const n = Math.min(a.length, b.length) / N;
const dil = (m) => { const o = new Uint8Array(N); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (m[y * W + x]) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const yy = y + dy, xx = x + dx; if (yy >= 0 && yy < H && xx >= 0 && xx < W) o[yy * W + xx] = 1; } return o; };
const per = [];
for (let f = 0; f < n; f++) {
  const A = dil(a.subarray(f * N, (f + 1) * N)), B = dil(b.subarray(f * N, (f + 1) * N));
  let i = 0, u = 0; for (let k = 0; k < N; k++) { if (A[k] && B[k]) i++; if (A[k] || B[k]) u++; }
  per.push(u ? i / u : 1);
}
const mean = (s, e) => per.slice(s, e).reduce((x, y) => x + y, 0) / (e - s);
console.log('mean IoU all', mean(0, n).toFixed(3));
const seg = [[0, 13, 'intro'], [13, 30, 'tilt'], [30, 60, 'card2+pan'], [60, 100, 'cards3-5'], [100, 170, 'cards6-8'], [170, 200, 'focus'], [200, 273, 'hold+subtitle']];
console.log(seg.map(([s, e, nm]) => `${nm} ${mean(s, Math.min(e, n)).toFixed(3)}`).join(' | '));
if (process.env.PER_FRAME) console.log(per.map((v, f) => `${f}:${v.toFixed(2)}`).join(' '));
