import {continueRender, delayRender} from 'remotion';
import {RANGES} from './cjkRanges';
import {trackFont} from '../fontGate';

// Noto Sans SC (OFL-1.1) from fontsource, split into unicode-range subsets. Only the subsets that
// contain characters of the given texts are registered and loaded; rendering waits for them.
// Montserrat (always loaded) is the fallback: a glyph that no loaded face covers must never fall back
// to a system font, because the headless browser crashes on system font fallback in this setup.
// So every string rendered with CJK must also be passed to ensureCjk().
export const CJK = "'NotoSansSCLocal', 'MontserratLocal'";

declare const require: {
  context: (dir: string, sub: boolean, re: RegExp) => {keys: () => string[]; (k: string): string | {default: string}};
};
const files = require.context('../../node_modules/@fontsource/noto-sans-sc/files', false, /noto-sans-sc-[a-z0-9-]+-(500|900)-normal\.woff2$/);
const url = (k: string) => {
  const m = files(k);
  return typeof m === 'string' ? m : m.default;
};

const parse = (r: string): [number, number][] =>
  r.split(',').map((p) => {
    const [a, b] = p.trim().replace(/^U\+/i, '').split('-');
    return [parseInt(a, 16), parseInt(b ?? a, 16)];
  });
const PARSED = Object.fromEntries(Object.entries(RANGES).map(([k, v]) => [k, parse(v)]));

const loaded = new Set<string>();
export const ensureCjk = (texts: string[], weights: string[] = ['500', '900']) => {
  if (typeof document === 'undefined') return;
  const cps = new Set<number>();
  for (const t of texts) for (const ch of t) cps.add(ch.codePointAt(0)!);
  const need: string[] = [];
  for (const [id, ranges] of Object.entries(PARSED)) {
    if ([...cps].some((c) => ranges.some(([a, b]) => c >= a && c <= b))) {
      for (const w of weights) if (!loaded.has(`${id}-${w}`)) need.push(`${id}-${w}`);
    }
  }
  if (need.length === 0) return;
  need.forEach((n) => loaded.add(n));
  const handle = delayRender('Loading Noto Sans SC subsets');
  const all = Promise.all(
    need.map((n) => {
      const w = n.slice(-3);
      const id = n.slice(0, -4);
      const key = files.keys().find((k) => k.endsWith(`noto-sans-sc-${id}-${w}-normal.woff2`));
      if (!key) return Promise.resolve();
      const face = new FontFace('NotoSansSCLocal', `url(${url(key)}) format('woff2')`, {weight: w, unicodeRange: RANGES[id]});
      return face.load().then((f) => {
        document.fonts.add(f);
      });
    }),
  );
  trackFont(all);
  all
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};
