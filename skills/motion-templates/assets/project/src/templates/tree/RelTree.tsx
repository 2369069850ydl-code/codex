import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, eased, K, stag} from '../_lib/anim';
import {N, NeonFrame} from '../_lib/neon';
import {Stage} from '../_lib/stage';

// Relationship map: a centre column of tags; each tag gets source boxes on the left (one or two
// rows whose connector curves merge into the tag) and a target box on the right. Groups grow in
// one at a time, tags light up, and the camera starts close on the first rows then pulls back to
// show the whole map.

export type TreeGroup = {
  tag: string;
  y: number;
  left: {y: number; lines: string[]; icon?: boolean}[];
  right: {h: number; lines: string[]};
  leftAt: number;
  rightAt: number;
  tagAt: number;
  litAt: number;
};
export type RelTreeProps = {
  durationInFrames: number;
  groups: TreeGroup[];
  z: K; // camera zoom
  sx: K; // screen position of the anchor (first tag)
  sy: K;
};

const TAG = {x: 430, w: 150, h: 44};
const L = {x: 63, w: 237, h: 42};
const R = {x: 560, w: 204};

const Box: React.FC<{x: number; y: number; w: number; h: number; a: number; lines: string[]; icon?: boolean; center?: boolean}> = ({x, y, w, h, a, lines, icon, center}) =>
  a > 0 ? (
    <div style={{position: 'absolute', left: x, top: y - h / 2, width: w, height: h, borderRadius: 6, background: 'rgba(32,36,56,0.88)', opacity: a, transform: `translateX(${(1 - a) * -14}px)`, display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', boxSizing: 'border-box', justifyContent: center ? 'center' : 'flex-start'}}>
      {icon && <div style={{width: 11, height: 16, border: '1.4px solid rgba(200,210,240,0.8)', borderRadius: 3, flexShrink: 0}} />}
      <div style={{fontFamily: CJK, fontWeight: 500, fontSize: center ? 12 : 9.5, lineHeight: '12.5px', color: '#c8cee2', whiteSpace: 'pre', textAlign: center ? 'center' : 'left'}}>{lines.join('\n')}</div>
    </div>
  ) : null;

export const RelTree: React.FC<RelTreeProps> = (p) => {
  const f = useCurrentFrame();
  const z = eased(f, p.z);
  const ax = eased(f, p.sx);
  const ay = eased(f, p.sy);
  const anchor = p.groups[0];
  const texts = p.groups.flatMap((g) => [g.tag, ...g.left.flatMap((r) => r.lines), ...g.right.lines]);
  return (
    <Stage bg={N.bg} texts={texts}>
      <NeonFrame t={1} x={30} y={15} w={792} h={450} />
      <div style={{position: 'absolute', left: 0, top: 0, width: 852, height: 480, transformOrigin: '0 0', transform: `translate(${ax - TAG.x * z}px, ${ay - anchor.y * z}px) scale(${z})`}}>
        <svg width={852} height={480} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          {p.groups.map((g, gi) => {
            const tl = TAG.x - TAG.w / 2;
            const tr = TAG.x + TAG.w / 2;
            return (
              <g key={gi}>
                {g.left.map((r, ri) => {
                  const t = stag(f, g.leftAt + ri * 12 + 4, 0, 14, 0);
                  const mx = (L.x + L.w + tl) / 2;
                  return t > 0 ? <path key={ri} d={`M ${L.x + L.w} ${r.y} C ${mx} ${r.y}, ${mx} ${g.y}, ${tl} ${g.y}`} fill="none" stroke="#3550e0" strokeWidth={3.5} pathLength={1} strokeDasharray={`${t} 1`} style={{filter: 'drop-shadow(0 0 4px rgba(60,90,255,0.6))'}} /> : null;
                })}
                {(() => {
                  const t = stag(f, g.rightAt, 0, 12, 0);
                  return t > 0 ? <path d={`M ${tr} ${g.y} L ${R.x} ${g.y}`} fill="none" stroke="#3550e0" strokeWidth={3.5} pathLength={1} strokeDasharray={`${t} 1`} style={{filter: 'drop-shadow(0 0 4px rgba(60,90,255,0.6))'}} /> : null;
                })()}
              </g>
            );
          })}
        </svg>
        {p.groups.map((g, gi) => (
          <React.Fragment key={gi}>
            {g.left.map((r, ri) => (
              <Box key={ri} x={L.x} y={r.y} w={L.w} h={L.h} a={stag(f, g.leftAt + ri * 12, 0, 10, 0)} lines={r.lines} icon={r.icon} center={!r.icon} />
            ))}
            <Box x={R.x} y={g.y} w={R.w} h={g.right.h} a={stag(f, g.rightAt + 8, 0, 10, 0)} lines={g.right.lines} icon={g.right.h > 46} center={g.right.h <= 46} />
            {(() => {
              const a = stag(f, g.tagAt, 0, 10, 0);
              const lit = stag(f, g.litAt, 0, 8, 0);
              if (a <= 0) return null;
              return (
                <div
                  style={{
                    position: 'absolute',
                    left: TAG.x - TAG.w / 2,
                    top: g.y - TAG.h / 2,
                    width: TAG.w,
                    height: TAG.h,
                    borderRadius: 9,
                    opacity: a,
                    transform: `scale(${0.8 + 0.2 * a})`,
                    backgroundImage: `linear-gradient(180deg, rgba(60,80,230,${0.95 * lit}), rgba(30,30,150,${0.95 * lit}))`,
                    backgroundColor: '#17181f',
                    border: `1.4px solid rgba(${lit > 0.5 ? '150,170,255,0.85' : '255,255,255,0.3'})`,
                    boxShadow: lit > 0 ? `0 0 ${16 * lit}px rgba(70,90,255,${0.6 * lit})` : undefined,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: CJK,
                    fontWeight: 900,
                    fontSize: 22,
                    color: N.text,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {g.tag}
                </div>
              );
            })()}
          </React.Fragment>
        ))}
      </div>
    </Stage>
  );
};
