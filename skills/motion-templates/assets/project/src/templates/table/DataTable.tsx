import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, eased, stag} from '../_lib/anim';
import {Stage} from '../_lib/stage';

// A bright table that grows row by row above a grey footer with a centred label, then a dark note
// card drops in from the top and pushes the table down.

export type DataTableProps = {
  durationInFrames: number;
  columns: string[];
  colX: number[]; // left edge of each column's text, relative to the table
  rows: {cells: string[][]}[]; // each cell is one or more lines
  footer: string;
  rowsIn: {start: number; stagger: number; dur: number};
  note?: {title: string; lines: string[]; in: number};
  color?: string;
};

const X = 133;
const W = 586;
const HEAD = 37;
const LINE = 15;
const PAD = 10;

export const DataTable: React.FC<DataTableProps> = (p) => {
  const f = useCurrentFrame();
  const color = p.color ?? '#2f3ff0';
  const texts = [...p.columns, ...p.rows.flatMap((r) => r.cells.flat()), p.footer, p.note?.title ?? '', ...(p.note?.lines ?? [])];

  const rowH = p.rows.map((r) => Math.max(...r.cells.map((c) => c.length)) * LINE + PAD * 1.6);
  const grow = p.rows.map((_, i) => stag(f, p.rowsIn.start, p.rowsIn.stagger, p.rowsIn.dur, i));
  const tableH = HEAD + rowH.reduce((s, h, i) => s + h * grow[i], 0);
  const noteT = p.note ? eased(f, [[p.note.in, 0], [p.note.in + 14, 1]]) : 0;
  const top = 82 + 21 * noteT;
  const footTop = top + tableH;

  let y = HEAD;
  return (
    <Stage bg="#ffffff" texts={texts}>
      <div style={{fontFamily: CJK, fontWeight: 900, color: '#fff'}}>
        {/* footer panel (behind the table) */}
        <div style={{position: 'absolute', left: X, top: footTop - 10, width: W, height: 86, background: '#e4e3ec', borderRadius: '0 0 10px 10px'}}>
          <div style={{position: 'absolute', left: W / 2 - 73, top: 31, width: 146, height: 27, background: '#fff', borderRadius: 4, color, fontSize: 12.5, lineHeight: '27px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.12)'}}>{p.footer}</div>
        </div>
        {/* table */}
        <div style={{position: 'absolute', left: X, top, width: W, height: tableH, background: color, borderRadius: noteT > 0 ? '0 0 6px 6px' : '10px 10px 6px 6px', overflow: 'visible'}}>
          {/* bottom notch */}
          <div style={{position: 'absolute', left: 212, top: tableH - 2, width: 162, height: 16, background: color, borderRadius: '0 0 8px 8px'}} />
          <div style={{position: 'absolute', left: 0, top: 0, width: W, height: tableH, overflow: 'hidden'}}>
            {p.columns.map((c, i) => (
              <div key={i} style={{position: 'absolute', left: p.colX[i], top: 9, fontSize: 16.5, letterSpacing: 0.5}}>{c}</div>
            ))}
            <div style={{position: 'absolute', left: 6, top: HEAD - 4, width: W - 12, height: 2.5, background: '#1c2580'}} />
            {p.colX.slice(1).map((cx, i) => (
              <div key={i} style={{position: 'absolute', left: cx - 14, top: 4, width: 0, height: tableH, borderLeft: '1.5px dashed rgba(20,25,110,0.75)'}} />
            ))}
            {p.rows.map((r, i) => {
              const h = rowH[i] * grow[i];
              const ry = y;
              y += h;
              return (
                <div key={i} style={{position: 'absolute', left: 0, top: ry, width: W, height: h, overflow: 'hidden'}}>
                  {r.cells.map((cell, k) => (
                    <div key={k} style={{position: 'absolute', left: p.colX[k], top: PAD * 0.8, fontSize: 11, lineHeight: `${LINE}px`, whiteSpace: 'pre'}}>
                      {cell.join('\n')}
                    </div>
                  ))}
                  <div style={{position: 'absolute', left: 6, bottom: 0, width: W - 12, height: 0, borderTop: '1.5px dashed rgba(20,25,110,0.75)'}} />
                </div>
              );
            })}
          </div>
        </div>
        {/* note card */}
        {p.note && noteT > 0 && (
          <div style={{position: 'absolute', left: X, top: 22 - (1 - noteT) * 110, width: W, height: 92, background: '#17171d', borderRadius: '10px 10px 0 0', padding: '10px 22px', boxSizing: 'border-box', opacity: Math.min(1, noteT * 2)}}>
            <div style={{fontSize: 12.5, letterSpacing: 2}}>{p.note.title}</div>
            {p.note.lines.map((l, i) => (
              <div key={i} style={{fontSize: 9.6, lineHeight: '14px', marginTop: i === 0 ? 4 : 2, paddingLeft: 12, textIndent: -10}}>
                •&nbsp;{l}
              </div>
            ))}
            <div style={{position: 'absolute', right: 16, top: 12, width: 11, height: 11, borderRadius: 6, background: '#fff'}} />
          </div>
        )}
      </div>
    </Stage>
  );
};
