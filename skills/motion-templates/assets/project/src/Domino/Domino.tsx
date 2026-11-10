import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, interpolateColors, useCurrentFrame, useVideoConfig} from 'remotion';
import {monotoneCubic} from '../CardGrid/CardGrid';
import {chainAngles, type ChainGeom} from './chain';
import {NightPhoto} from './photos';
import type {Bezier, DominoProps, Key, PhotoCard} from './types';

export const DESIGN_W = 852;
export const DESIGN_H = 480;
const CX = DESIGN_W / 2;
const CY = DESIGN_H / 2;

const OUT: Bezier = [0.2, 0.8, 0.2, 1];
const IN_OUT: Bezier = [0.6, 0, 0.3, 1];
const bz = (b: Bezier) => Easing.bezier(b[0], b[1], b[2], b[3]);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ramp = (f: number, a: number, b: number, curve: Bezier = OUT) =>
  b <= a ? (f >= b ? 1 : 0) : interpolate(f, [a, b], [0, 1], {...clamp, easing: bz(curve)});
const keys = (f: number, k: Key[]) => (k.length === 1 ? k[0][1] : monotoneCubic(f, k.map((x) => x[0]), k.map((x) => x[1])));

const DIRS: Record<PhotoCard['from'], [number, number]> = {
  top: [0, -1],
  bottom: [0, 1],
  left: [-1, 0],
  right: [1, 0],
  'top-left': [-0.7, -0.7],
  'top-right': [0.7, -0.7],
  'bottom-left': [-0.7, 0.7],
  'bottom-right': [0.7, 0.7],
};

/** Slot centres (world x) of the chain bars, the accent bars and the trailing bars. */
export const layoutSlots = (b: DominoProps['bars']): number[] => {
  const s = [b.firstX];
  for (let i = 0; i < b.stuckIndex; i++) {
    const u = b.stuckIndex <= 1 ? 0 : i / (b.stuckIndex - 1);
    s.push(s[i] + b.pitchStart + (b.pitchEnd - b.pitchStart) * u);
  }
  s.push(s[b.stuckIndex] + b.stuckGap);
  for (let i = 1; i < b.accentCount + b.trailingCount; i++) s.push(s[s.length - 1] + b.pitchEnd);
  return s;
};

export const Domino: React.FC<DominoProps> = (p) => {
  const frame = useCurrentFrame();
  const {width} = useVideoConfig();
  const {panel, palette} = p;

  const full = panel.right - panel.left;
  const pw = panel.startWidth + (full - panel.startWidth) * ramp(frame, 0, panel.openFrames);
  const pl = (panel.left + panel.right) / 2 - pw / 2;

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
        <div
          style={{
            position: 'absolute',
            left: pl,
            top: panel.top,
            width: pw,
            height: panel.bottom - panel.top,
            background: palette.panel,
            overflow: 'hidden',
            borderRadius: 3,
          }}
        >
          <div style={{position: 'absolute', left: -pl, top: -panel.top, width: DESIGN_W, height: DESIGN_H}}>
            {frame < p.handoff ? <PhotoPhase p={p} frame={frame} /> : <BarPhase p={p} frame={frame} />}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------- photo phase: real CSS 3D, one perspective container per card ----------------

const PhotoPhase: React.FC<{p: DominoProps; frame: number}> = ({p, frame}) => {
  const {card, palette} = p;
  const W = card.width;
  const H = card.height;
  const T = sideThickness(p);
  return (
    <>
      {p.cards.map((c, i) => {
        if (frame < c.enterAt) return null;
        const q = ramp(frame, c.enterAt, c.enterAt + card.flyFrames);
        const qt = ramp(frame, c.enterAt, c.enterAt + card.flyFrames * 1.5);
        const [dx, dy] = DIRS[c.from];
        const left = c.x - W / 2 + dx * card.flyDistance * (1 - q);
        const top = c.y - H / 2 + dy * card.flyDistance * (1 - q);
        const tiltX = -dy * card.flyTilt * (1 - qt);
        const tiltY = dx * card.flyTilt * (1 - qt);
        const flip = 90 * ramp(frame, c.flipAt, c.flipAt + card.flipFrames, card.flipEasing);
        // top/bottom faces turn into long slanted slivers once the card is edge-on
        const tbOpacity = interpolate(flip, [45, 70], [1, 0], clamp);
        const face = (style: React.CSSProperties, key: string) => (
          <div key={key} style={{position: 'absolute', background: palette.bar, ...style}} />
        );
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left,
              top,
              width: W,
              height: H,
              perspective: card.perspective,
              // same projection as one global camera at the design centre
              perspectiveOrigin: `${CX - left}px ${CY - top}px`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transformStyle: 'preserve-3d',
                transform: `rotateX(${tiltX}deg) rotateY(${tiltY + flip}deg)`,
              }}
            >
              {/* box behind the photo (z from 0 to -T); each side face points outward and hides its back */}
              {face({left: -T, top: 0, width: T, height: H, transformOrigin: 'right center', transform: 'rotateY(-90deg)', backfaceVisibility: 'hidden'}, 'l')}
              {face({left: W, top: 0, width: T, height: H, transformOrigin: 'left center', transform: 'rotateY(90deg)', backfaceVisibility: 'hidden'}, 'r')}
              {face({left: 0, top: -T, width: W, height: T, transformOrigin: 'center bottom', transform: 'rotateX(90deg)', backfaceVisibility: 'hidden', opacity: tbOpacity}, 't')}
              {face({left: 0, top: H, width: W, height: T, transformOrigin: 'center top', transform: 'rotateX(-90deg)', backfaceVisibility: 'hidden', opacity: tbOpacity}, 'b')}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: card.radius,
                  overflow: 'hidden',
                  backfaceVisibility: 'hidden',
                  // near edge-on the photo would show as a perspective sliver next to the bar
                  opacity: interpolate(flip, [80, 88], [1, 0], clamp),
                  background: '#222',
                  boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.25)`,
                }}
              >
                {c.src ? (
                  <Img src={c.src} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                ) : (
                  <NightPhoto kind={c.kind ?? 'road'} seed={c.seed ?? i + 1} />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

// perspective magnification of an edge-on card's side face (it sits W/2 nearer the camera)
const sideScale = (p: DominoProps) => p.card.perspective / (p.card.perspective - p.card.width / 2);
// camera zoom at handoff so that an edge-on card is exactly one bar tall
const handoffZoom = (p: DominoProps) => (p.card.height * sideScale(p)) / p.bars.height;
// card thickness chosen so the edge-on card is exactly one bar wide
const sideThickness = (p: DominoProps) => (p.bars.width * handoffZoom(p)) / sideScale(p);

/** Screen centre of a card's edge-on side face at handoff. */
const edgeOnScreen = (p: DominoProps, c: PhotoCard): [number, number] => {
  const k = sideScale(p);
  const T = sideThickness(p);
  return [CX + (c.x - T / 2 - CX) * k, CY + (c.y - CY) * k];
};

// ---------------- bar phase: flat 2D bars in a world with a 2D camera ----------------

const BarPhase: React.FC<{p: DominoProps; frame: number}> = ({p, frame}) => {
  const {bars: b, palette, chain, camera} = p;
  const slots = layoutSlots(b);
  const kept = p.cards.filter((c) => c.row === p.keepRow).sort((a, z) => a.x - z.x);
  const others = p.cards.filter((c) => c.row !== p.keepRow);
  const barTopY = b.baseline - b.height;
  const centreY = b.baseline - b.height / 2;

  // Camera at handoff: kept bar 0 lands exactly on slot 0 (with its lift offset).
  const zH = handoffZoom(p);
  const [sx0, sy0] = edgeOnScreen(p, kept[0]);
  const lift0 = keys(p.handoff, b.liftKeys);
  const camXH = slots[0] - (sx0 - CX) / zH;
  const camYH = centreY + lift0 - (sy0 - CY) / zH;
  const after = (k: Key[]) => k.filter(([f]) => f > p.handoff);
  const zoom = keys(frame, [[p.handoff, zH], ...after(camera.zoom)]);
  const camYFinal = keys(1e9, [[p.handoff, camYH], ...after(camera.y)]);
  const camY = keys(frame, [[p.handoff, camYH], ...after(camera.y)]);
  const camXBase = keys(frame, [[p.handoff, camXH], ...after(camera.x)]);
  const camXEnd = keys(1e9, [[p.handoff, camXH], ...after(camera.x)]);
  const zoomEnd = keys(1e9, [[p.handoff, zH], ...after(camera.zoom)]);
  const accent0 = slots[b.stuckIndex + 1];
  const panTotal = accent0 - (camera.panEndScreenX - CX) / zoomEnd - camXEnd;
  const camX = camXBase + panTotal * keys(frame, camera.pan);
  void camYFinal;

  // world position of a card's edge-on face at handoff
  const toWorld = (c: PhotoCard): [number, number] => {
    const [sx, sy] = edgeOnScreen(p, c);
    return [(sx - CX) / zH + camXH, (sy - CY) / zH + camYH];
  };
  const blend = 1 - ramp(frame, p.handoff, p.handoff + 10, IN_OUT);

  // chain timing
  const starts = [chain.start, chain.start + chain.firstFrames];
  while (starts.length < b.stuckIndex + 1) starts.push(starts[starts.length - 1] + chain.stepFrames);
  starts.push(starts[starts.length - 1] + chain.lastFrames);
  const geom: ChainGeom = {slots, width: b.width, height: b.height};
  const phi = chainAngles(geom, b.stuckIndex, starts, frame, chain.fallPower);

  const accentMix = ramp(frame, b.accentAt, b.accentAt + b.accentFrames, IN_OUT);
  const accentColor = interpolateColors(accentMix, [0, 1], [palette.bar, palette.accent]);
  const lift = keys(frame, b.liftKeys);

  const win = p.window;
  const winIdx = b.stuckIndex + b.accentCount; // the last accent bar opens
  const winOn = frame >= win.at && winIdx < slots.length;

  const barEls: React.ReactNode[] = [];
  const bar = (key: string, x: number, offY: number, angle: number, color: string) =>
    barEls.push(
      <div
        key={key}
        style={{
          position: 'absolute',
          left: x - b.width / 2,
          top: barTopY + offY,
          width: b.width,
          height: b.height,
          background: color,
          transformOrigin: '100% 100%',
          transform: angle ? `rotate(${angle}rad)` : undefined,
        }}
      />,
    );

  // rows that leave
  others.forEach((c, i) => {
    const [wx, wy] = toWorld(c);
    const exit = b.exitOffset * ramp(frame, p.handoff, p.handoff + b.exitFrames, [0.5, 0, 0.9, 0.6]);
    bar(`o${i}`, wx, wy - centreY + exit, 0, palette.bar);
  });

  slots.forEach((x, i) => {
    if (winOn && i === winIdx) return;
    const isAccent = i > b.stuckIndex && i <= b.stuckIndex + b.accentCount;
    const color = isAccent ? accentColor : palette.bar;
    const angle = i <= b.stuckIndex ? phi[i] : 0;
    const keptIdx = i % 2 === 0 ? i / 2 : -1;
    if (keptIdx >= 0 && keptIdx < kept.length) {
      const land = b.landAt + keptIdx * b.landStagger;
      const qLand = ramp(frame, land - b.landFrames, land, IN_OUT);
      const [wx, wy] = toWorld(kept[keptIdx]);
      const designedY = lift; // designed offset before landing
      const dX = (wx - x) * blend;
      const dY = (wy - centreY - keys(p.handoff, b.liftKeys)) * blend;
      bar(`k${i}`, x + dX, (designedY + dY) * (1 - qLand), angle, color);
    } else {
      const land = b.dropAt + ((i - 1) / 2) * b.dropStagger;
      if (frame < land - b.dropFrames) return;
      const q = ramp(frame, land - b.dropFrames, land, OUT);
      bar(`s${i}`, x, -b.dropHeight * (1 - q), angle, color);
    }
  });

  let winEl: React.ReactNode = null;
  if (winOn) {
    const q = ramp(frame, win.at, win.at + win.frames, win.easing);
    const qc = ramp(frame, win.at, win.at + win.colorFrames, IN_OUT);
    const x = slots[winIdx];
    const w = b.width + (win.width - b.width) * q;
    const top = barTopY + (win.top - barTopY) * q;
    const bottom = b.baseline + (win.bottom - b.baseline) * q;
    winEl = (
      <div
        style={{
          position: 'absolute',
          left: x - w / 2,
          top,
          width: w,
          height: bottom - top,
          borderRadius: win.radius * q,
          background: interpolateColors(qc, [0, 1], [palette.accent, palette.window]),
          overflow: 'hidden',
        }}
      >
        {win.src ? (
          <Img src={win.src} style={{width: '100%', height: '100%', objectFit: 'cover', opacity: ramp(frame, win.at + win.colorFrames, win.at + win.frames)}} />
        ) : null}
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        transform: `translate(${CX}px, ${CY}px) scale(${zoom}) translate(${-camX}px, ${-camY}px)`,
        transformOrigin: '0 0',
      }}
    >
      {barEls}
      {winEl}
    </div>
  );
};
