import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CJK, ramp} from '../_lib/anim';
import {Media, MediaKind} from '../_lib/media';
import {Stage} from '../_lib/stage';

// End card: a tablet grows out of a dotted page and plays your clips; around it the outro kit
// builds up piece by piece — pixel squares, a credits panel sliding out from behind the device,
// a logo badge, a "follow" tag and a few small doodle icons.

export type EndCardProps = {
  durationInFrames: number;
  grow: [number, number]; // tablet grows from a point to full size
  media: {at: number; kind?: MediaKind; src?: string; seed?: number}[];
  pixelsAt: number;
  panelAt: number;
  credits: {role: string; names: string}[];
  creditsAt: number;
  logoAt: number;
  tag: string;
  tagAt: number;
  iconsAt: number;
  accent: {blue: string; yellow: string; red: string};
};

const TAB = {x: 426, y: 240, w: 360, h: 312};

const Logo: React.FC<{red: string}> = ({red}) => (
  <svg width={80} height={80} viewBox="-40 -40 80 80">
    <circle r={37} fill="#fff" stroke="#151515" strokeWidth={6} />
    <path d="M -20 -18 A 27 27 0 0 1 24 -12 L 14 -6 A 16 16 0 0 0 -12 -10 Z" fill="#151515" />
    <path d="M 20 18 A 27 27 0 0 1 -24 12 L -14 6 A 16 16 0 0 0 12 10 Z" fill="#151515" />
    <circle r={11} fill={red} />
  </svg>
);

export const EndCard: React.FC<EndCardProps> = (p) => {
  const f = useCurrentFrame();
  const g = ramp(f, p.grow[0], p.grow[1], [0.25, 0.9, 0.3, 1]);
  const m = p.media.filter((x) => f >= x.at).pop() ?? p.media[0];
  const panel = ramp(f, p.panelAt, p.panelAt + 16, [0.2, 0.8, 0.2, 1]);
  const logo = ramp(f, p.logoAt, p.logoAt + 10, [0.3, 1.6, 0.5, 1]);
  const tag = ramp(f, p.tagAt, p.tagAt + 14, [0.2, 0.8, 0.2, 1]);
  const tagText = ramp(f, p.tagAt + 14, p.tagAt + 22);
  const knobs = ramp(f, p.panelAt, p.panelAt + 10);
  const texts = [...p.credits.flatMap((c) => [c.role, c.names]), p.tag];
  const pixels: [number, number, number][] = [[0, 0, 0], [2, -1, 3], [1, 1, 6], [2, 1, 8], [0, 2, 10], [1, 2, 12], [1, 3, 14], [0, 3, 17]];
  const icons = [
    {x: 664, y: 288, rot: -15, d: 'M 0 6 L 16 6 L 16 2 L 26 -2 L 26 18 L 16 14 L 16 18 L 0 18 Z'},
    {x: 704, y: 290, rot: 18, d: 'M 0 0 L 22 0 L 22 14 L 0 14 Z M 4 7 L 18 7'},
    {x: 640, y: 340, rot: -40, d: 'M 0 0 L 20 0 L 26 4 L 20 8 L 0 8 Z'},
  ];
  return (
    <Stage bg="#efefef" texts={texts}>
      <svg width={852} height={480} style={{position: 'absolute', left: 0, top: 0}}>
        {Array.from({length: 16}, (_, i) =>
          Array.from({length: 30}, (_, j) => <circle key={`${i}-${j}`} cx={14 + j * 28.4} cy={8 + i * 28.4} r={1.9} fill="#d4d4d4" />),
        )}
      </svg>
      {/* pixel squares */}
      {pixels.map(([cx, cy, d], i) => {
        const a = ramp(f, p.pixelsAt + d, p.pixelsAt + d + 3);
        return a > 0 ? <div key={i} style={{position: 'absolute', left: 98 + cx * 16, top: 152 + cy * 16, width: 16, height: 16, background: p.accent.red, opacity: a}} /> : null;
      })}
      {/* credits panel: slides out leftwards from behind the tablet */}
      {panel > 0 && (
        <div style={{position: 'absolute', left: 84 + (1 - panel) * 150, top: 208, width: 160, height: 122, background: p.accent.blue, overflow: 'hidden'}}>
          {p.credits.map((c, i) => {
            const a = ramp(f, p.creditsAt + i * 5, p.creditsAt + i * 5 + 8);
            return (
              <div key={i} style={{position: 'absolute', left: 28, top: 18 + i * 29 - (1 - a) * 6, opacity: a, fontFamily: CJK, fontWeight: 500, fontSize: 7.5, lineHeight: '10px', color: '#dfe6ff', whiteSpace: 'nowrap'}}>
                {c.role}
                <br />
                {c.names}
              </div>
            );
          })}
        </div>
      )}
      {/* follow tag: slides out to the right from behind the tablet */}
      {tag > 0 && (
        <div style={{position: 'absolute', left: 596, top: 188, width: 187 * tag, height: 40, background: p.accent.yellow, overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 0, width: 187, top: 0, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'MontserratLocal'", fontWeight: 900, fontSize: 21, letterSpacing: 0.5, color: '#2b2b2b', opacity: tagText, transform: 'scaleX(0.85)'}}>{p.tag}</div>
        </div>
      )}
      {/* tablet */}
      <div style={{position: 'absolute', left: TAB.x, top: TAB.y, transform: `scale(${0.06 + 0.94 * g})`, opacity: Math.min(1, g * 4)}}>
        <div style={{position: 'absolute', left: -120, width: 240, top: -TAB.h / 2 - 16, height: 8, borderRadius: 4, background: '#fafafa', boxShadow: '0 1px 2px rgba(0,0,0,0.15)', opacity: knobs}} />
        {[-1, 1].map((s) => (
          <div key={s} style={{position: 'absolute', left: s * 122 - 11, top: TAB.h / 2 + 4, width: 22, height: 22, borderRadius: 11, background: 'radial-gradient(circle at 40% 35%, #e6e6e6, #9c9c9c)', opacity: knobs}} />
        ))}
        <div style={{position: 'absolute', left: -TAB.w / 2, top: -TAB.h / 2, width: TAB.w, height: TAB.h, borderRadius: 14, background: '#1a1a1a', boxShadow: '0 6px 18px rgba(0,0,0,0.18)'}}>
          <div style={{position: 'absolute', left: 10, top: 10, right: 10, bottom: 10, borderRadius: 4, overflow: 'hidden'}}>
            <Media w={TAB.w - 20} h={TAB.h - 20} kind={m.kind} src={m.src} seed={m.seed ?? 2} f={f} pan={(f - m.at) / 160} />
            <div style={{position: 'absolute', left: '42%', width: '16%', bottom: 5, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.85)'}} />
          </div>
        </div>
      </div>
      {logo > 0 && (
        <div style={{position: 'absolute', left: 652, top: 110, transform: `scale(${logo})`}}>
          <Logo red={p.accent.red} />
        </div>
      )}
      {icons.map((ic, i) => {
        const a = ramp(f, p.iconsAt + i * 5, p.iconsAt + i * 5 + 10, [0.3, 1.5, 0.5, 1]);
        return a > 0 ? (
          <svg key={i} width={40} height={30} style={{position: 'absolute', left: ic.x, top: ic.y, transform: `rotate(${ic.rot + (1 - a) * 40}deg) scale(${a})`}}>
            <path d={ic.d} fill={p.accent.blue} stroke={p.accent.blue} strokeWidth={2} strokeLinejoin="round" />
          </svg>
        ) : null;
      })}
    </Stage>
  );
};
