import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, eased, stag} from '../_lib/anim';
import {GradWord, N, NeonFrame, NeonGrid} from '../_lib/neon';
import {Stage} from '../_lib/stage';

// Big gradient acronym: letters rise in one by one with a dotted screen texture, settle into a
// smooth gradient, a frame grows behind it, then a bracketed meaning appears above and the spelled
// out words appear under each letter while a stroke sweeps along the baseline.

export type NeonTitleProps = {
  durationInFrames: number;
  word: string;
  meaning: string; // shown in brackets above, characters spaced
  parts: string[]; // one per letter, shown below
  lettersIn: {start: number; stagger: number};
  smoothAt: number; // dotted -> smooth
  frameAt: number;
  frameGrow?: [number, number]; // frame expands to near full screen
  meaningAt: number;
  partsAt: {start: number; stagger: number};
  swoosh?: {start: number; dur: number};
};

export const NeonTitle: React.FC<NeonTitleProps> = (p) => {
  const f = useCurrentFrame();
  const letters = [...p.word];
  const smooth = eased(f, [[p.smoothAt, 0], [p.smoothAt + 10, 1]]);
  const size = 300 - 50 * smooth;
  const fr = eased(f, [[p.frameAt, 0], [p.frameAt + 12, 1]]);
  const fg = p.frameGrow ? eased(f, [[p.frameGrow[0], 0], [p.frameGrow[1], 1]]) : 1;
  const fx = 150 - 100 * fg, fy = 88 - 55 * fg, fw = 555 + 208 * fg, fh = 310 + 122 * fg;
  const lw = size * 0.66;
  const x0 = 426 - (letters.length * lw) / 2;
  const sw = p.swoosh ? eased(f, [[p.swoosh.start, 0], [p.swoosh.start + p.swoosh.dur, 1]]) : 0;
  return (
    <Stage bg={N.bg} texts={[p.word, p.meaning, ...p.parts, '[]']}>
      <NeonGrid opacity={0.6} />
      <NeonFrame t={fr} x={fx} y={fy} w={fw} h={fh} />
      {p.meaning && (
        <div style={{position: 'absolute', left: 0, width: 852, top: 86, textAlign: 'center', fontFamily: CJK, fontWeight: 500, fontSize: 28, letterSpacing: 26, color: N.text, opacity: stag(f, p.meaningAt, 0, 12, 0), whiteSpace: 'pre'}}>
          [ {[...p.meaning].join(' ')} ]
        </div>
      )}
      {letters.map((ch, i) => {
        const t = stag(f, p.lettersIn.start, p.lettersIn.stagger, 14, i);
        if (t <= 0) return null;
        return (
          <div key={i} style={{position: 'absolute', left: x0 + i * lw, top: 245 - size * 0.52 + (1 - t) * 200, width: lw, textAlign: 'center', opacity: t}}>
            <GradWord text={ch} size={size} dots={smooth < 0.5} style={{opacity: smooth < 0.5 ? 1 : 1, filter: smooth > 0 && smooth < 1 ? `blur(${(1 - Math.abs(smooth - 0.5) * 2) * 3}px)` : smooth === 0 ? 'drop-shadow(0 0 10px rgba(60,140,255,0.6))' : undefined}} />
          </div>
        );
      })}
      {sw > 0 && (
        <svg width={852} height={480} style={{position: 'absolute', left: 0, top: 0}}>
          <path d={`M ${x0 + 10} 340 C ${x0 + 30} 250 ${x0 + lw * 0.8} 250 ${x0 + lw * 1.2} 320 S ${x0 + lw * 2.1} 360 ${x0 + lw * 1.9} 290`} fill="none" stroke="#5a7cff" strokeWidth={18} strokeLinecap="round" pathLength={1} strokeDasharray={`${sw} 1`} opacity={0.9} />
        </svg>
      )}
      {p.parts.map((t, i) => {
        const a = stag(f, p.partsAt.start, p.partsAt.stagger, 10, i);
        return (
          <div key={i} style={{position: 'absolute', left: x0 + i * lw - 40, width: lw + 80, top: 362, textAlign: 'center', fontFamily: CJK, fontWeight: 500, fontSize: 28, letterSpacing: 6, color: i === 0 ? N.text : N.dim, opacity: a}}>
            {t}
          </div>
        );
      })}
    </Stage>
  );
};
