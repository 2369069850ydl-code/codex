import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT_FAMILY, ensureFonts} from '../fonts';
import {Icon} from './icons';
import type {Bezier, CameraKey, CardGridProps, CardSpec} from './types';

// Design canvas: every px value in props lives in this space; the output resolution just scales it.
export const DESIGN_W = 852;
export const DESIGN_H = 480;

// Default curves. They were fitted against reference frames, not taken from the original project.
const DEF_OUT: Bezier = [0.2, 0.8, 0.2, 1];
const DEF_IN_OUT: Bezier = [0.6, 0, 0.3, 1];
const DEF_FLY_POS: Bezier = [0.25, 0.55, 0.35, 1];

const bz = (b: Bezier) => Easing.bezier(b[0], b[1], b[2], b[3]);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ramp = (f: number, a: number, b: number, curve: Bezier = DEF_OUT) =>
  interpolate(f, [a, b], [0, 1], {...clamp, easing: bz(curve)});

// Monotone cubic (Fritsch-Carlson) interpolation: velocity is continuous across keys, never overshoots,
// and is zero at the first/last key and wherever neighbouring keys are equal (holds).
export const monotoneCubic = (t: number, xs: number[], ys: number[]): number => {
  const n = xs.length;
  if (t <= xs[0]) return ys[0];
  if (t >= xs[n - 1]) return ys[n - 1];
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  const m: number[] = [0];
  for (let i = 1; i < n - 1; i++) {
    const h0 = xs[i] - xs[i - 1], h1 = xs[i + 1] - xs[i];
    m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] * h1 + d[i] * h0) / (h0 + h1));
  }
  m.push(0);
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], h = a * a + b * b;
    if (h > 9) { const k = 3 / Math.sqrt(h); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; }
  }
  let i = 0;
  while (t > xs[i + 1]) i++;
  const h = xs[i + 1] - xs[i], u = (t - xs[i]) / h, u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * ys[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * ys[i + 1] + (u3 - u2) * h * m[i + 1];
};

// Split the keys at 'stop' keys; each piece is a spline (3+ keys) or an eased segment (2 keys).
const smoothPath = (frame: number, keys: CameraKey[], field: 'x' | 'y' | 'zoom', curve: (t: number) => number): number => {
  let a = 0;
  for (let i = 1; i < keys.length; i++) {
    if (i < keys.length - 1 && !keys[i].stop) continue;
    if (frame <= keys[i].frame || i === keys.length - 1) {
      const piece = keys.slice(a, i + 1);
      if (frame <= piece[0].frame) return piece[0][field];
      return piece.length === 2
        ? interpolate(frame, [piece[0].frame, piece[1].frame], [piece[0][field], piece[1][field]], {...clamp, easing: piece[1].easing ? bz(piece[1].easing) : curve})
        : monotoneCubic(frame, piece.map((k) => k.frame), piece.map((k) => k[field]));
    }
    a = i;
  }
  return keys[keys.length - 1][field];
};

export const CardGrid: React.FC<CardGridProps> = (props) => {
  ensureFonts();
  const frame = useCurrentFrame();
  const {width} = useVideoConfig();
  const {palette, card, panel, tilt, camera, cards} = props;

  const pitchX = card.width + card.gapX;
  const pitchY = card.height + card.gapY;
  const hero = cards.find((c) => c.hero) ?? cards[0];
  const heroX = hero.col * pitchX + card.width / 2;
  const heroY = hero.row * pitchY + card.height / 2;

  const camCurve = bz(props.cameraEasing ?? DEF_IN_OUT);
  const keyFrames = camera.map((k) => k.frame);
  const cam = (field: 'x' | 'y' | 'zoom') =>
    camera.length === 1
      ? camera[0][field]
      : props.cameraPath === 'smooth'
        ? smoothPath(frame, camera, field, camCurve)
        : interpolate(frame, keyFrames, camera.map((k) => k[field]), {...clamp, easing: camCurve});
  const camX = cam('x');
  const camY = cam('y');
  const zoom = cam('zoom');

  const t = ramp(frame, tilt.start, tilt.end, tilt.easing ?? DEF_IN_OUT);
  const rotX = tilt.rotateX * t;
  const rotZ = tilt.rotateZ * t;

  const pk = panel.keys;
  const pFrames = pk.map((k) => k.frame);
  const panelW = pk.length === 1 ? pk[0].width : interpolate(frame, pFrames, pk.map((k) => k.width), {...clamp, easing: bz(DEF_OUT)});
  const panelTop = pk.length === 1 ? pk[0].top : interpolate(frame, pFrames, pk.map((k) => k.top), {...clamp, easing: bz(DEF_OUT)});
  const panelLeft = (DESIGN_W - panelW) / 2;

  return (
    <AbsoluteFill style={{background: palette.background, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: DESIGN_W,
          height: DESIGN_H,
          transform: `scale(${width / DESIGN_W})`,
          transformOrigin: '0 0',
          backgroundImage: `radial-gradient(circle, ${palette.dots} 0.9px, transparent 1.4px)`,
          backgroundSize: '22px 22px',
        }}
      >
        {/* Clip window */}
        <div
          style={{
            position: 'absolute',
            left: panelLeft,
            top: panelTop,
            width: panelW,
            height: panel.bottom - panelTop,
            background: palette.panel,
            overflow: 'hidden',
            borderRadius: 3,
          }}
        >
          {/* Stage keeps design coordinates inside the clip */}
          <div
            style={{
              position: 'absolute',
              left: -panelLeft,
              top: -panelTop,
              width: DESIGN_W,
              height: DESIGN_H,
              perspective: tilt.perspective,
              perspectiveOrigin: `${DESIGN_W / 2}px ${DESIGN_H / 2}px`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 0,
                height: 0,
                transformStyle: 'preserve-3d',
                transform: `translate(${camX}px, ${camY}px) rotateX(${rotX}deg) rotateZ(${rotZ}deg) scale3d(${zoom}, ${zoom}, ${zoom}) translate(${-heroX}px, ${-heroY}px)`,
              }}
            >
              {cards.map((c) => (
                <Card key={c.id} spec={c} frame={frame} props={props} pitchX={pitchX} pitchY={pitchY} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Card: React.FC<{spec: CardSpec; frame: number; props: CardGridProps; pitchX: number; pitchY: number}> = ({
  spec,
  frame,
  props,
  pitchX,
  pitchY,
}) => {
  const {card, palette} = props;
  const {enter} = spec;
  if (enter && frame < enter.at) return null;

  const lift0 = enter?.lift ?? 0;
  const lifted = lift0 > 0;
  const p = enter ? ramp(frame, enter.at, enter.at + enter.dur, enter.easing ?? (lifted ? DEF_FLY_POS : DEF_OUT)) : 1;
  const pz = enter && lifted ? ramp(frame, enter.at, enter.at + enter.dur, enter.liftEasing ?? DEF_IN_OUT) : 1;
  const ex = spec.exit;
  if (ex && frame > ex.at + ex.dur) return null;
  const q = ex ? ramp(frame, ex.at, ex.at + ex.dur, ex.easing ?? [0.5, 0, 0.9, 0.5]) : 0;
  const dx = (enter ? enter.from[0] * pitchX * (1 - p) : 0) + (ex ? ex.to[0] * pitchX * q : 0);
  const dy = (enter ? enter.from[1] * pitchY * (1 - p) : 0) + (ex ? ex.to[1] * pitchY * q : 0);
  const dz = lift0 * (1 - pz) + (ex?.lift ?? 0) * q;

  const W = card.width;
  const H = card.height;
  const T = card.thickness;
  const x = spec.col * pitchX;
  const y = spec.row * pitchY;

  // ~1.5px per slab keeps the extruded edge solid on screen.
  const layers = Math.max(1, Math.ceil(T / 1.5));
  let slab = 0;
  const side = (style: React.CSSProperties, color: string): React.ReactNode => (
    <div key={slab++} style={{position: 'absolute', background: color, ...style}} />
  );

  return (
    <>
      {props.flyShadow && lifted && dz > 0.5 ? (
        <div
          style={{
            position: 'absolute',
            left: x + dx - W * 0.08,
            top: y + dy - H * 0.04,
            width: W * 1.16,
            height: H * 1.2,
            transform: 'translateZ(0.5px)',
            background: `radial-gradient(closest-side, ${palette.shadow}, transparent)`,
            // builds up only as the card descends, so it never shows apart from an off-screen card
            opacity: (1 - dz / lift0) * Math.min(1, dz / 12) * 0.8,
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: W,
          height: H,
          transformStyle: 'preserve-3d',
          transform: `translate3d(${dx}px, ${dy}px, ${dz}px)`,
        }}
      >
        {/* Thickness as a stack of parallel slabs (z: 0 -> T). Perpendicular wall planes were
            mis-sorted by Chrome's 3D compositor and cut the top face in face-on frames. */}
        {Array.from({length: layers}, (_, i) =>
          side({inset: 0, borderRadius: card.radius, transform: `translateZ(${(i * T) / layers}px)`}, palette.sideDark),
        )}
        {/* Top face */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translateZ(${T}px)`,
            background: palette.face,
            border: `${card.border}px solid ${palette.border}`,
            borderRadius: card.radius,
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          {spec.icon ? <IconFace spec={spec} frame={frame} inset={card.inset * W} /> : null}
          {spec.title ? <TextFace spec={spec} frame={frame} H={H} props={props} /> : null}
        </div>
      </div>
    </>
  );
};

const IconFace: React.FC<{spec: CardSpec; frame: number; inset: number}> = ({spec, frame, inset}) => {
  const r = spec.iconReveal ? ramp(frame, spec.iconReveal[0], spec.iconReveal[1]) : 1;
  const clip =
    r >= 1
      ? undefined
      : spec.iconRevealMode === 'corner'
        ? `circle(${r * 125}% at 100% 0%)`
        : `inset(0 ${(1 - r) * 100}% 0 0)`;
  return (
    <div style={{position: 'absolute', left: inset, right: inset, top: inset * 0.85, bottom: inset * 0.85, clipPath: clip}}>
      <Icon icon={spec.icon!} />
    </div>
  );
};

const TextFace: React.FC<{spec: CardSpec; frame: number; H: number; props: CardGridProps}> = ({spec, frame, H, props}) => {
  const {text, palette} = props;
  const s = spec.subtitle && spec.subtitleReveal ? ramp(frame, spec.subtitleReveal[0], spec.subtitleReveal[1]) : spec.subtitle ? 1 : 0;
  const subSize = H * text.subtitleSize;
  const subBox = subSize * 1.5;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONT_FAMILY,
        fontWeight: text.weight,
        color: palette.text,
      }}
    >
      <div style={{fontSize: H * text.titleSize, letterSpacing: `${text.titleTracking}em`, marginRight: `-${text.titleTracking}em`, lineHeight: 1}}>
        {spec.title}
      </div>
      {spec.subtitle ? (
        <div style={{height: subBox * s, overflow: 'hidden', marginTop: subSize * 0.3 * s}}>
          <div
            style={{
              fontSize: subSize,
              letterSpacing: `${text.subtitleTracking}em`,
              marginRight: `-${text.subtitleTracking}em`,
              lineHeight: `${subBox}px`,
              transform: `translateY(${(1 - s) * subBox}px)`,
            }}
          >
            {spec.subtitle}
          </div>
        </div>
      ) : null}
    </div>
  );
};
