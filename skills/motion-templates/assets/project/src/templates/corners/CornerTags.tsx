import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, eased, K, keyed, lerp, stag} from '../_lib/anim';
import {GradWord, N, NeonFrame, NeonGrid, Pointer, Spark} from '../_lib/neon';
import {Stage} from '../_lib/stage';

// Four tags around a big centre word.
//  - TagActivate: tags appear one by one as outlines, a pointer clicks each and it lights up blue.
//  - TagCollapse: lit tags drop their fill and turn into plain words, then one by one shrink into
//    small outlined pills stacked in a right-hand column while the view pushes in on the column.

type TagState = {x: number; y: number; s: number; fill: number; draw: number; plain: number; pill: number; dim: number; blur: number; a: number};

const CAP = {w: 215, h: 80, font: 34};
const PILL = {w: 130, h: 50, font: 21};

const TagView: React.FC<{t: TagState; label: string}> = ({t, label}) => {
  if (t.a <= 0) return null;
  const w = lerp(CAP.w, PILL.w, t.pill);
  const h = lerp(CAP.h, PILL.h, t.pill);
  const r = lerp(h / 2, 10, t.pill);
  const font = lerp(lerp(CAP.font, 46, t.plain), PILL.font, t.pill);
  const cap = 1 - t.plain;
  const border = 0.85 * cap * (1 - t.pill) + 0.3 * t.pill;
  const per = 2 * (w - h) + Math.PI * h;
  const fill = t.fill * cap;
  return (
    <div style={{position: 'absolute', left: t.x - w / 2, top: t.y - h / 2, width: w, height: h, transform: `scale(${t.s})`, opacity: t.a, filter: t.blur > 0.05 ? `blur(${t.blur}px)` : undefined}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: r,
          backgroundImage: `linear-gradient(180deg, rgba(70,110,255,${0.95 * fill}), rgba(25,45,190,${0.95 * fill}))`,
          backgroundColor: `rgba(23,24,31,${t.pill})`,
          boxShadow: fill > 0 ? `0 0 ${16 * fill}px rgba(60,100,255,${0.55 * fill}), inset 0 1px 0 rgba(255,255,255,${0.35 * fill})` : undefined,
        }}
      />
      {border > 0.01 && (
        <svg width={w + 4} height={h + 4} style={{position: 'absolute', left: -2, top: -2}}>
          <rect x={2} y={2} width={w} height={h} rx={r} fill="none" stroke={fill > 0.5 ? `rgba(170,195,255,${border})` : `rgba(220,226,240,${border})`} strokeWidth={1.4} strokeDasharray={t.pill > 0 ? undefined : `${per * t.draw} ${per}`} />
        </svg>
      )}
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: CJK, fontWeight: 900, fontSize: font, color: N.text, opacity: 1 - 0.6 * t.dim, whiteSpace: 'nowrap'}}>
        {fill > 0.5 && <Spark size={font * 0.6} />}
        {label}
      </div>
    </div>
  );
};

const Title: React.FC<{word: string; y: number; a: number; blur: number}> = ({word, y, a, blur}) =>
  a > 0 ? (
    <div style={{position: 'absolute', left: 0, width: 852, top: y - 70, display: 'flex', justifyContent: 'center', opacity: a, filter: blur > 0.05 ? `blur(${blur}px)` : undefined}}>
      <GradWord text={word} size={140} style={{backgroundImage: 'linear-gradient(180deg, #2a4ff0 0%, #3a5cf0 50%, #b7c3ef 100%)'}} />
    </div>
  ) : null;

// ---------------------------------------------------------------- activate

export type ActTag = {label: string; appear: number; click: number; x: K; y: K; s: K};
export type TagActivateProps = {
  durationInFrames: number;
  word: string;
  titleY: K;
  frameIn: [number, number];
  tags: ActTag[];
};

export const TagActivate: React.FC<TagActivateProps> = (p) => {
  const f = useCurrentFrame();
  const fr = eased(f, [[p.frameIn[0], 0], [p.frameIn[1], 1]]);
  const states = p.tags.map((g) => {
    const a = stag(f, g.appear, 0, 8, 0);
    const x = eased(f, g.x);
    const y = eased(f, g.y);
    // motion blur from per-frame speed
    const v = Math.hypot(x - eased(f - 1, g.x), y - eased(f - 1, g.y));
    return {
      x,
      y,
      s: keyed(f, g.s),
      a,
      blur: (1 - a) * 6 + Math.min(5, v * 0.35),
      draw: stag(f, g.appear, 0, 12, 0),
      fill: stag(f, g.click, 0, 6, 0),
      plain: 0,
      pill: 0,
      dim: 0,
    };
  });
  // pointer: arrives at each tag's lower-right corner a few frames before its click
  const at = (i: number, fr0: number) => {
    const g = p.tags[i];
    const s = keyed(fr0, g.s);
    return [eased(fr0, g.x) + (CAP.w / 2 - 22) * s, eased(fr0, g.y) + (CAP.h / 2 - 12) * s];
  };
  const keysX: K = [];
  const keysY: K = [];
  p.tags.forEach((g, i) => {
    const arrive = Math.max(g.click - 10, i === 0 ? 0 : p.tags[i - 1].click + 4);
    const [ax, ay] = at(i, g.click);
    keysX.push([arrive, ax], [g.click + 3, ax]);
    keysY.push([arrive, ay], [g.click + 3, ay]);
  });
  const px = eased(f, keysX);
  const py = eased(f, keysY);
  const pa = stag(f, p.tags[0].appear, 0, 8, 0);
  const press = p.tags.some((g) => f >= g.click - 2 && f < g.click + 3) ? 0.85 : 1;
  const ta = stag(f, 0, 0, 10, 0);
  return (
    <Stage bg={N.bg} texts={[p.word, ...p.tags.map((g) => g.label)]}>
      <NeonGrid opacity={1 - fr} />
      <NeonFrame t={fr} x={50} y={25} w={752} h={430} />
      <Title word={p.word} y={eased(f, p.titleY)} a={ta} blur={(1 - ta) * 8} />
      {states.map((t, i) => (
        <TagView key={i} t={t} label={p.tags[i].label} />
      ))}
      <Pointer x={px} y={py} scale={1.6 * press} opacity={pa} />
    </Stage>
  );
};

// ---------------------------------------------------------------- collapse

type Pt = [number, number];
export type ColTag = {label: string; corner: Pt; grid: Pt; grid2: Pt; dimAt: number; collapseAt: number};
export type TagCollapseProps = {
  durationInFrames: number;
  word: string;
  titleOut: [number, number];
  plainAt: [number, number];
  drift: [number, number];
  column: {x: number; y0: number; gap: number};
  push: {from: number; to: number; zoom: number; cx: number; cy: number};
  tags: ColTag[];
};

export const TagCollapse: React.FC<TagCollapseProps> = (p) => {
  const f = useCurrentFrame();
  const plain = eased(f, [[p.plainAt[0], 0], [p.plainAt[1], 1]]);
  const drift = eased(f, [[p.drift[0], 0], [p.drift[1], 1]]);
  const to = eased(f, [[p.titleOut[0], 0], [p.titleOut[1], 1]]);
  const z = 1 + (p.push.zoom - 1) * eased(f, [[p.push.from, 0], [p.push.to, 1]]);
  return (
    <Stage bg={N.bg} texts={[p.word, ...p.tags.map((g) => g.label)]}>
      <NeonFrame t={1} x={50} y={25} w={752} h={430} />
      <Title word={p.word} y={240} a={1 - to} blur={to * 10} />
      <div style={{position: 'absolute', left: 0, top: 0, width: 852, height: 480, transform: `scale(${z})`, transformOrigin: `${p.push.cx}px ${p.push.cy}px`}}>
        {p.tags.map((g, i) => {
          const col = eased(f, [[g.collapseAt, 0], [g.collapseAt + 14, 1]]);
          const gx = lerp(g.grid[0], g.grid2[0], drift);
          const gy = lerp(g.grid[1], g.grid2[1], drift);
          const bx = lerp(g.corner[0], gx, plain);
          const by = lerp(g.corner[1], gy, plain);
          const t: TagState = {
            x: lerp(bx, p.column.x, col),
            y: lerp(by, p.column.y0 + i * p.column.gap, col),
            s: 1 - 0.15 * Math.sin(Math.PI * col),
            fill: 1 - plain,
            draw: 1,
            plain: plain * (1 - col),
            pill: col,
            dim: eased(f, [[g.dimAt, 0], [g.dimAt + 6, 1]]) * (1 - col),
            blur: 2 * Math.sin(Math.PI * col),
            a: 1,
          };
          return <TagView key={i} t={t} label={g.label} />;
        })}
      </div>
    </Stage>
  );
};
