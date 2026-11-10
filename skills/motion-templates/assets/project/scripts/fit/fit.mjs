// Parameter fitting against a reference "purple mask" (card sides + borders + text).
// One browser instance; each evaluation renders stills and scores mean IoU vs the reference.
//
// usage: node scripts/fit/fit.mjs <job.json>
// job = {
//   bundle, comp, refMask (bin from refmask.py, 284x160 per frame), out (result json path),
//   base?: {path: value},                    // applied once before fitting
//   propsFile?: full props JSON to start from (else the composition defaults)
//   stages: [{name, frames: [..], params: [{path, step, min?, max?, int?}], rounds}]
// }
// path syntax: "tilt.rotateX", "card.gapX", "camera.4.x", "cards.<id>.enter.at", "cards.<id>.enter.from.0"
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const job = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const W = 284, H = 160, FW = 852, FH = 480;
const ref = fs.readFileSync(job.refMask);

// ---------- PNG decode (8-bit RGB/RGBA, non-interlaced) ----------
function decodePng(buf) {
  let p = 8, w = 0, h = 0, ct = 0;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    const type = buf.toString('latin1', p + 4, p + 8);
    const data = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); ct = data[9]; if (data[8] !== 8 || data[12] !== 0) throw new Error('unsupported png'); }
    if (type === 'IDAT') idat.push(data);
    p += 12 + len;
  }
  const bpp = ct === 6 ? 4 : ct === 2 ? 3 : (() => { throw new Error('color type ' + ct); })();
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * bpp;
  const out = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const ft = raw[y * (stride + 1)];
    const src = y * (stride + 1) + 1;
    const dst = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[dst + x - bpp] : 0;
      const b = y > 0 ? out[dst - stride + x] : 0;
      const c = x >= bpp && y > 0 ? out[dst - stride + x - bpp] : 0;
      let v = raw[src + x];
      if (ft === 1) v += a;
      else if (ft === 2) v += b;
      else if (ft === 3) v += (a + b) >> 1;
      else if (ft === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      out[dst + x] = v & 255;
    }
  }
  return {w, h, bpp, px: out};
}

function isPurple(r, g, b) {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  if (mx < 76 || mx > 205 || mx !== b) return false;
  const s = (mx - mn) / mx;
  if (s < 0.3 || s > 0.85) return false;
  const hdeg = 60 * ((r - g) / (mx - mn)) + 240;
  return hdeg >= 235 && hdeg <= 258;
}

function maskFromPng(buf) {
  const {w, h, bpp, px} = decodePng(buf);
  if (w !== FW || h !== FH) throw new Error(`unexpected size ${w}x${h}`);
  const m = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let r = 0, g = 0, b = 0;
    for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) {
      const i = ((y * 3 + dy) * FW + x * 3 + dx) * bpp;
      r += px[i]; g += px[i + 1]; b += px[i + 2];
    }
    m[y * W + x] = isPurple(r / 9, g / 9, b / 9) ? 1 : 0;
  }
  return m;
}

const dilate = (m) => {
  const o = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!m[y * W + x]) continue;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const yy = y + dy, xx = x + dx;
      if (yy >= 0 && yy < H && xx >= 0 && xx < W) o[yy * W + xx] = 1;
    }
  }
  return o;
};
const refCache = new Map();
const refMask = (f) => {
  if (!refCache.has(f)) refCache.set(f, dilate(ref.subarray(f * W * H, (f + 1) * W * H)));
  return refCache.get(f);
};
const iou = (a, b) => {
  let i = 0, u = 0;
  for (let k = 0; k < a.length; k++) { if (a[k] && b[k]) i++; if (a[k] || b[k]) u++; }
  return u === 0 ? 1 : i / u;
};

// ---------- props paths ----------
function resolve(obj, pth) {
  const parts = pth.split('.');
  let o = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (Array.isArray(o) && k !== '' && isNaN(Number(k))) o = o.find((c) => c.id === k);
    else o = o[Array.isArray(o) ? Number(k) : k];
    if (o === undefined) throw new Error('bad path ' + pth);
  }
  const last = parts[parts.length - 1];
  return [o, Array.isArray(o) ? Number(last) : last];
}
const getP = (obj, p) => { const [o, k] = resolve(obj, p); return o[k]; };
const setP = (obj, p, v) => { const [o, k] = resolve(obj, p); o[k] = v; };

// ---------- main ----------
const serveUrl = path.resolve(job.bundle);
const browser = await openBrowser('chrome');
const composition = await selectComposition({serveUrl, id: job.comp, puppeteerInstance: browser});
let props = job.propsFile ? JSON.parse(fs.readFileSync(job.propsFile, 'utf8')) : structuredClone(composition.defaultProps);
for (const [p, v] of Object.entries(job.base ?? {})) setP(props, p, v);

let evals = 0;
if (job.sanity) {
  const m = async (pr) => { const {buffer} = await renderStill({composition: {...composition, props: pr}, serveUrl, frame: 270, inputProps: pr, puppeteerInstance: browser, imageFormat: 'png', output: null}); return maskFromPng(buffer); };
  const a = await m(props); const t = structuredClone(props); t.tilt.rotateX += 10; const b = await m(t);
  let diff = 0, na = 0, nr = 0; const r = ref.subarray(270 * W * H, 271 * W * H);
  for (let k = 0; k < a.length; k++) { if (a[k] !== b[k]) diff++; na += a[k]; nr += r[k]; }
  console.log(`sanity: ours purple px ${na}, ref purple px ${nr}, pixels changed by rotateX+10: ${diff}`);
}
async function score(pr, frames) {
  let s = 0;
  const per = {};
  for (const f of frames) {
    // v4: the component receives composition.props, so the trial props must go there.
    const {buffer} = await renderStill({composition: {...composition, props: pr}, serveUrl, frame: f, inputProps: pr, puppeteerInstance: browser, imageFormat: 'png', output: null});
    const v = iou(dilate(maskFromPng(buffer)), refMask(f));
    per[f] = Math.round(v * 1000) / 1000;
    s += v;
  }
  evals++;
  return {mean: s / frames.length, per};
}

const t0 = Date.now();
const report = {stages: []};
for (const st of job.stages) {
  let best = await score(props, st.frames);
  const start = best;
  console.log(`[${st.name}] start mean IoU ${best.mean.toFixed(4)}`, JSON.stringify(best.per));
  const steps = Object.fromEntries(st.params.map((q) => [q.path, q.step]));
  for (let round = 0; round < (st.rounds ?? 3); round++) {
    let improved = false;
    for (const q of st.params) {
      for (const dir of [1, -1]) {
        for (;;) {
          const cur = getP(props, q.path);
          let nv = cur + dir * steps[q.path];
          if (q.int) nv = Math.round(nv);
          if (q.min !== undefined && nv < q.min) break;
          if (q.max !== undefined && nv > q.max) break;
          const trial = structuredClone(props);
          setP(trial, q.path, Math.round(nv * 1000) / 1000);
          const r = await score(trial, st.frames);
          if (r.mean > best.mean + 1e-4) { props = trial; best = r; improved = true; } else break;
        }
      }
    }
    console.log(`[${st.name}] round ${round} mean IoU ${best.mean.toFixed(4)} evals ${evals} t=${((Date.now() - t0) / 1000).toFixed(0)}s`);
    if (!improved) for (const q of st.params) steps[q.path] = q.int ? Math.max(1, Math.round(steps[q.path] / 2)) : steps[q.path] / 2;
  }
  const vals = Object.fromEntries(st.params.map((q) => [q.path, getP(props, q.path)]));
  console.log(`[${st.name}] done ${start.mean.toFixed(4)} -> ${best.mean.toFixed(4)}`, JSON.stringify(vals));
  console.log(`[${st.name}] per-frame`, JSON.stringify(best.per));
  report.stages.push({name: st.name, start: start.mean, end: best.mean, perStart: start.per, perEnd: best.per, values: vals});
}
await browser.close({silent: true});
report.props = props;
report.evals = evals;
report.seconds = (Date.now() - t0) / 1000;
fs.writeFileSync(job.out, JSON.stringify(report, null, 2));
console.log(`evals ${evals}, ${report.seconds.toFixed(0)}s -> ${job.out}`);
