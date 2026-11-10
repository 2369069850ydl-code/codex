import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, eased, rng, stag} from '../_lib/anim';
import {Backdrop} from '../_lib/backdrop';
import {Stage} from '../_lib/stage';

// A search field that types a question. Light style: white box, floating keystroke letters, then
// the box fills and opens into a panel. Dark style: black capsule grows, a pointer clicks it, the
// text types in purple and turns white when done.

export type SearchTypeProps = {
  durationInFrames: number;
  style: 'light' | 'dark';
  text: string;
  typeStart: number;
  typeEnd: number;
  keys?: string; // letters that float up while typing (light style)
  open?: number; // light: frame the box fills and opens into a panel
  grow?: {start: number; dur: number}; // dark: capsule grows
  pointer?: {in: number; click: number};
  backdropIn?: number; // backdrop grows from a vertical line
};

export const SearchType: React.FC<SearchTypeProps> = (p) => {
  const f = useCurrentFrame();
  const n = [...p.text].length;
  const shown = Math.max(0, Math.min(n, Math.floor(((f - p.typeStart) / (p.typeEnd - p.typeStart)) * n + 1e-6)));
  const txt = [...p.text].slice(0, f < p.typeStart ? 0 : Math.max(shown, 0)).join('');
  const blink = Math.floor(f / 8) % 2 === 0;
  const bd = p.backdropIn !== undefined ? eased(f, [[p.backdropIn, 0], [p.backdropIn + 14, 1]]) : 1;
  const bdW = 682 * Math.max(0.02, bd);
  const dark = p.style === 'dark';

  let box: React.ReactNode;
  if (!dark) {
    const op = p.open !== undefined ? eased(f, [[p.open, 0], [p.open + 8, 1]]) : 0;
    const ex = p.open !== undefined ? eased(f, [[p.open + 8, 0], [p.open + 18, 1]]) : 0;
    const x = 303 + (213 - 303) * ex;
    const y = 228 + (145 - 228) * ex;
    const w = 263 + (426 - 263) * ex;
    const h = 35 + (201 - 35) * ex;
    box = (
      <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 6 + 4 * ex, background: ex > 0 ? '#2b3270' : '#fff', border: ex > 0 ? 'none' : '1.5px solid #4b4596', boxSizing: 'border-box', boxShadow: '0 2px 6px rgba(40,40,80,0.12)'}}>
        {op > 0 && ex === 0 && <div style={{position: 'absolute', left: 8, top: 7, width: (w - 16) * op, height: h - 14, borderRadius: 3, background: '#4b4596'}} />}
        {ex === 0 && (
          <div style={{position: 'absolute', left: 14, top: 0, lineHeight: '33px', fontSize: 19, color: '#3d3a8c', whiteSpace: 'pre', opacity: 1 - op}}>
            {txt}
            <span style={{opacity: blink && f < (p.open ?? 1e9) ? 1 : 0, fontWeight: 500}}>|</span>
          </div>
        )}
      </div>
    );
  } else {
    const g = p.grow ? eased(f, [[p.grow.start, 0], [p.grow.start + p.grow.dur, 1]]) : 1;
    const w = 50 + (293 - 50) * g;
    const done = f >= p.typeEnd + 4;
    box = (
      <div style={{position: 'absolute', left: 434 - w / 2, top: 213, width: w, height: 42, borderRadius: 9, background: '#1f1f23', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, width: w, textAlign: 'center', lineHeight: '42px', fontSize: 18, color: done ? '#fff' : '#a855f7', whiteSpace: 'pre'}}>
          {txt}
          {f >= p.typeStart && <span style={{opacity: blink && !done ? 1 : 0, fontWeight: 500}}>|</span>}
        </div>
      </div>
    );
  }

  // floating keystroke letters (light style)
  const letters: React.ReactNode[] = [];
  if (p.keys && !dark) {
    const keys = [...p.keys];
    const r = rng(11);
    keys.forEach((k, i) => {
      const at = p.typeStart + ((p.typeEnd - p.typeStart) * i) / keys.length;
      const lx = 190 + r() * 470;
      const ly = 290 + r() * 90;
      const a = stag(f, at, 0, 5, 0) * (1 - stag(f, at + 10, 0, 8, 0));
      if (a > 0) letters.push(<div key={i} style={{position: 'absolute', left: lx, top: ly - (f - at) * 0.6, fontSize: 13, color: '#6b6894', opacity: a, fontFamily: 'MontserratLocal', fontWeight: 600}}>{k}</div>);
    });
  }

  const pt = p.pointer;
  const ptT = pt ? eased(f, [[pt.in, 0], [pt.click, 1]]) : 0;
  return (
    <Stage texts={[p.text, p.keys ?? '', '|']}>
      <div style={{position: 'absolute', left: 426 - bdW / 2, top: 58, width: bdW, height: 364, overflow: 'hidden', opacity: bd < 0.05 ? 0.6 : 1}}>
        <div style={{position: 'absolute', left: -(426 - bdW / 2) + 0, top: -58}}>
          <Backdrop seed={5} />
        </div>
      </div>
      <div style={{fontFamily: CJK, fontWeight: 900}}>
        {box}
        {letters}
      </div>
      {pt && f >= pt.in && f < pt.click + 12 && (
        <svg width={22} height={22} viewBox="0 0 22 22" style={{position: 'absolute', left: 300 + 90 * ptT, top: 320 - 70 * ptT, transform: `scale(${f >= pt.click && f < pt.click + 4 ? 0.8 : 1})`, opacity: 1 - stag(f, pt.click + 4, 0, 8, 0)}}>
          <path d="M 3 2 L 19 9 L 11 11 L 8 19 Z" fill="#9b5cff" stroke="#6b2fe0" strokeWidth={1.2} strokeLinejoin="round" />
        </svg>
      )}
    </Stage>
  );
};
