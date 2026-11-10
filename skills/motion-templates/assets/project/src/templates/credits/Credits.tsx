import React from 'react';
import {Img, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {CJK, eased, stag, step} from '../_lib/anim';
import {Stage} from '../_lib/stage';

// End-credits board: a big media window, a music card, a crew card with window dots, a brand tab
// and a gear line with a progress bar. Groups of text swap at given frames.

type Group = {at: number; lines: string[]};
export type CreditsProps = {
  durationInFrames: number;
  introAt?: number; // frame the cards fly in (negative = already in place at frame 0)
  brand: string;
  crewTitle: string;
  music: Group[];
  crew: Group[];
  gearTitle: string;
  gear: {at: number; text: string}[];
  media: {at: number; src?: string; video?: boolean; label?: string; hue?: number}[];
};

const GridBg: React.FC = () => (
  <svg width={852} height={480} style={{position: 'absolute', left: 0, top: 0}}>
    {Array.from({length: 23}, (_, i) => (
      <line key={`v${i}`} x1={i * 38 + 8} y1={0} x2={i * 38 + 8} y2={480} stroke="#e3e3e8" strokeWidth={1} />
    ))}
    {Array.from({length: 14}, (_, i) => (
      <line key={`h${i}`} x1={0} y1={i * 38 + 4} x2={852} y2={i * 38 + 4} stroke="#e3e3e8" strokeWidth={1} />
    ))}
  </svg>
);

/** Swap a group of lines with a short fade + rise. */
const Swap: React.FC<{groups: Group[]; f: number; style: React.CSSProperties; gap?: number}> = ({groups, f, style}) => {
  const idx = groups.reduce((k, g, i) => (f >= g.at ? i : k), 0);
  const g = groups[idx];
  const t = stag(f, g.at, 0, 10, 0);
  return (
    <div style={{whiteSpace: 'nowrap', ...style, opacity: idx === 0 && g.at <= 0 ? 1 : t, transform: `translateY(${(1 - t) * 6}px)`}}>
      {g.lines.map((l, i) => (
        <div key={i} style={{minHeight: '1em'}}>
          {l}
        </div>
      ))}
    </div>
  );
};

const Placeholder: React.FC<{hue: number; label?: string; f: number}> = ({hue, label, f}) => (
  <div style={{position: 'absolute', inset: 0, background: `linear-gradient(135deg, hsl(${hue},38%,88%), hsl(${hue + 30},30%,70%))`}}>
    <div style={{position: 'absolute', left: '30%', top: '18%', width: '40%', height: '72%', borderRadius: '48% 48% 8px 8px', background: `hsl(${hue},20%,55%)`, opacity: 0.35, transform: `translateX(${Math.sin(f / 40) * 6}px)`}} />
    {label && <div style={{position: 'absolute', left: 16, bottom: 12, fontFamily: CJK, fontWeight: 900, fontSize: 14, color: 'rgba(0,0,0,0.45)'}}>{label}</div>}
  </div>
);

export const Credits: React.FC<CreditsProps> = (p) => {
  const f = useCurrentFrame();
  const texts = [p.brand, p.crewTitle, p.gearTitle, ...p.music.flatMap((g) => g.lines), ...p.crew.flatMap((g) => g.lines), ...p.gear.map((g) => g.text), ...p.media.map((m) => m.label ?? '')];
  const inL = eased(f, [[p.introAt ?? 0, 0], [(p.introAt ?? 0) + 16, 1]]);
  const inW = eased(f, [[(p.introAt ?? 0) + 2, 0], [(p.introAt ?? 0) + 18, 1]]);
  const m = step(f, p.media.map((x) => [x.at, x] as [number, (typeof p.media)[number]]));
  const prog = Math.min(1, f / p.durationInFrames);
  const font = {fontFamily: CJK, fontWeight: 900, color: '#fff'} as const;

  return (
    <Stage bg="#f3f3f6" texts={texts}>
      <GridBg />
      {/* green music card with its lower step */}
      <div style={{position: 'absolute', left: 88, top: 95, transform: `translateX(${(1 - inL) * -60}px)`, opacity: inL}}>
        <div style={{position: 'absolute', left: 108, top: 70, width: 157, height: 40, background: '#13a84c', borderRadius: '0 0 10px 10px'}} />
        <div style={{position: 'absolute', left: 0, top: 0, width: 265, height: 88, background: '#13a84c', borderRadius: 10}} />
        <Swap groups={p.music} f={f} style={{...font, position: 'absolute', left: 14, top: 9, fontSize: 8.6, lineHeight: '13.4px', fontWeight: 500}} />
      </div>
      {/* media window */}
      <div style={{position: 'absolute', left: 322, top: 113, width: 446, height: 227, borderRadius: 14, background: '#fff', boxShadow: '0 8px 22px rgba(30,30,60,0.16)', transform: `scale(${0.9 + 0.1 * inW})`, opacity: inW}}>
        <div style={{position: 'absolute', left: 5, top: 5, right: 5, bottom: 5, borderRadius: 10, overflow: 'hidden', background: '#eee'}}>
          {m.src ? (
            m.video ? <OffthreadVideo src={staticFile(m.src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <Img src={staticFile(m.src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          ) : (
            <Placeholder hue={m.hue ?? 30} label={m.label} f={f} />
          )}
        </div>
      </div>
      {/* brand tab */}
      <div style={{position: 'absolute', left: 570, top: 77, width: 196, height: 40, opacity: inW}}>
        <svg width={196} height={40} style={{position: 'absolute'}}>
          <path d="M 0 40 L 22 6 Q 26 0 34 0 L 186 0 Q 196 0 196 10 L 196 40 Z" fill="#1d3fa8" />
        </svg>
        <div style={{...font, position: 'absolute', left: 30, top: 0, width: 160, lineHeight: '36px', fontSize: 14.5, textAlign: 'center', whiteSpace: 'pre'}}>{p.brand}</div>
      </div>
      {/* crew card */}
      <div style={{position: 'absolute', left: 110, top: 232, transform: `translateX(${(1 - inL) * -60}px)`, opacity: inL}}>
        <svg width={250} height={150} style={{position: 'absolute', left: -3, top: -3}}>
          <path d="M 3 32 Q 3 25 10 25 L 128 25 L 146 5 Q 149 3 153 3 L 240 3 Q 247 3 247 10 L 247 137 Q 247 147 237 147 L 13 147 Q 3 147 3 137 Z" fill="#163e9e" stroke="#fff" strokeWidth={3} />
        </svg>
        <div style={{...font, position: 'absolute', left: 155, top: 4, fontSize: 10.5, whiteSpace: 'nowrap'}}>{p.crewTitle}</div>
        {['#ff4b4b', '#ffc93c', '#3ad06b'].map((c, i) => (
          <div key={i} style={{position: 'absolute', left: 210 + i * 11, top: 9, width: 7, height: 7, borderRadius: 4, background: c}} />
        ))}
        <Swap groups={p.crew} f={f} style={{...font, position: 'absolute', left: 18, top: 33, fontSize: 10.8, lineHeight: '17px'}} />
      </div>
      {/* gear line + progress */}
      <div style={{position: 'absolute', left: 431, top: 373, width: 245, opacity: inW}}>
        <div style={{fontFamily: CJK, fontWeight: 900, fontSize: 8.5, color: '#2a2a33'}}>{p.gearTitle}</div>
        <div style={{fontFamily: CJK, fontWeight: 500, fontSize: 7.5, color: '#9a9aa6', marginTop: 4, whiteSpace: 'nowrap'}}>{step(f, p.gear.map((g) => [g.at, g.text] as [number, string]))}</div>
        <svg width={22} height={16} style={{position: 'absolute', right: 0, top: 4}} viewBox="0 0 22 16">
          <rect x={0} y={5} width={14} height={10} rx={2} fill="#c9c9d1" />
          <circle cx={4} cy={3} r={3} fill="#c9c9d1" />
          <circle cx={10} cy={3} r={3} fill="#c9c9d1" />
          <path d="M 14 8 L 21 5 L 21 15 L 14 12 Z" fill="#c9c9d1" />
        </svg>
        <div style={{position: 'absolute', left: 0, top: 30, width: 245, height: 4, borderRadius: 2, background: '#dadae0'}}>
          <div style={{width: `${prog * 100}%`, height: 4, borderRadius: 2, background: '#b5b5c0'}} />
        </div>
      </div>
    </Stage>
  );
};
