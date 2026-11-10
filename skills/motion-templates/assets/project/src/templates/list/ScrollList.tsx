import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, eased, K, stag} from '../_lib/anim';
import {Stage} from '../_lib/stage';

// Dark app window with a two-column list that scrolls; chosen entries get a glowing pill that
// sweeps in from the left.

export type ScrollListProps = {
  durationInFrames: number;
  title: string;
  rows: [string, string][];
  highlights: {row: number; col: 0 | 1; at: number}[];
  scroll: K; // first visible row (fractional)
  intro?: {start: number; dur: number}; // window grows from a short bar
  headerIn?: number; // frame the title bar fades in
  chat?: {in: number; question: string; qIn: number; answer: [string, string][]; aIn: number; growAt: number}; // Q&A panel sliding over the left column
};

const WIN = {x: 164, y: 87, w: 524, h: 294};
const ROW = 30;
const TOP = 140; // y of the first visible row centre
const COLX = [302, 547];

export const ScrollList: React.FC<ScrollListProps> = (p) => {
  const f = useCurrentFrame();
  const sc = eased(f, p.scroll);
  const it = p.intro ? eased(f, [[p.intro.start, 0], [p.intro.start + p.intro.dur, 1]]) : 1;
  const winH = 74 + (WIN.h - 74) * it;
  const winY = WIN.y + (WIN.h - winH);
  return (
    <Stage texts={[p.title, ...p.rows.flat(), '÷=', p.chat?.question ?? '', ...(p.chat?.answer.flat() ?? [])]}>
      <div style={{position: 'absolute', left: 85, top: 58, width: 682, height: 364, background: '#ececee', borderRadius: 6}} />
      <div style={{position: 'absolute', left: WIN.x, top: winY, width: WIN.w, height: winH, background: '#2b2b2f', borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.18)', fontFamily: CJK, fontWeight: 900, color: '#fff'}}>
        {/* list (under the header) */}
        <div style={{position: 'absolute', left: 0, top: 41, width: WIN.w, height: winH - 41, overflow: 'hidden'}}>
          {p.rows.map((r, i) =>
            r.map((txt, c) => {
              const y = TOP - WIN.y - 41 + (i - sc) * ROW + (WIN.h - winH);
              if (y < -ROW || y > winH) return null;
              const h = p.highlights.find((x) => x.row === i && x.col === c);
              const t = h ? stag(f, h.at, 0, 10, 0) : 0;
              return (
                <div key={`${i}-${c}`} style={{position: 'absolute', left: COLX[c] - WIN.x - 100, top: y - 13, width: 200, height: 26}}>
                  {t > 0 && (
                    <div style={{position: 'absolute', left: 0, top: 1, width: 198 * t, height: 24, borderRadius: 12, background: 'linear-gradient(90deg, #9b5cff, #6b3cf2)', boxShadow: '0 0 10px rgba(140,80,255,0.75)'}} />
                  )}
                  <div style={{position: 'relative', width: 200, textAlign: 'center', fontSize: 18.5, lineHeight: '26px', letterSpacing: 1.2, fontWeight: 500, whiteSpace: 'pre', fontVariantNumeric: 'tabular-nums'}}>{txt}</div>
                </div>
              );
            }),
          )}
        </div>
        {/* header */}
        <div style={{position: 'absolute', left: 0, top: 0, width: WIN.w, height: 40, background: '#2b2b2f', borderBottom: '1.5px solid #6a6a70', opacity: p.headerIn === undefined ? 1 : stag(f, p.headerIn, 0, 8, 0)}}>
          {['#ff4f6b', '#f5b52c', '#33c25a'].map((c, i) => (
            <div key={i} style={{position: 'absolute', left: 16 + i * 21, top: 17, width: 10, height: 10, borderRadius: 5, background: c}} />
          ))}
          <div style={{position: 'absolute', left: 87, top: 6, fontSize: 19.5, whiteSpace: 'nowrap'}}>{p.title}</div>
        </div>
      </div>
      {p.chat &&
        (() => {
          const c = p.chat;
          const a = eased(f, [[c.in, 0], [c.in + 12, 1]]);
          const q = stag(f, c.qIn, 0, 10, 0);
          const an = stag(f, c.aIn, 0, 10, 0);
          const gr = stag(f, c.growAt, 0, 10, 0);
          return (
            <div style={{position: 'absolute', left: 175 - (1 - a) * 260, top: 150, width: 251, height: 238, borderRadius: 10, background: 'linear-gradient(#f4f3fa, #dcdbe6)', boxShadow: '0 6px 16px rgba(0,0,0,0.25)', overflow: 'hidden', fontFamily: CJK, fontWeight: 900}}>
              <div style={{height: 28, background: '#c9c5ee'}} />
              <div style={{position: 'absolute', left: 14, top: 44, width: 150, padding: '6px 10px', borderRadius: 10, background: '#fff', color: '#8b3df0', fontSize: 12, lineHeight: '16px', opacity: q, transform: `translateY(${(1 - q) * 8}px)`}}>{c.question}</div>
              <div style={{position: 'absolute', left: 214, top: 52, width: 22, height: 22, borderRadius: 11, background: '#8b3df0', opacity: q}} />
              <div style={{position: 'absolute', left: 16, top: 108, width: 20, height: 20, borderRadius: 10, background: '#4b5df0', opacity: an}} />
              <div style={{position: 'absolute', left: 44, top: 108, width: 160, height: 110, borderRadius: 10, background: 'rgba(255,255,255,0.85)', opacity: an, transform: `translateY(${(1 - an) * 8}px)`}}>
                {c.answer.map(([l, r], i) => (
                  <div key={i} style={{position: 'absolute', left: 14, top: 22 + i * 44, color: '#4b4fd8', fontSize: 11, whiteSpace: 'pre', display: 'flex', alignItems: 'baseline', gap: 4}}>
                    <span>{l}</span>
                    <span style={{fontSize: 11 + 9 * gr}}>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
    </Stage>
  );
};
