import React from 'react';
import {AbsoluteFill, Freeze, interpolate, useCurrentFrame} from 'remotion';
import {ensureFonts} from '../fonts';
import {CJK, ensureCjk} from '../Lidar/cjk';
import {keyed, ramp} from '../Lidar/util';
import type {Bubble, VoicesProps} from './types';

const W = 852, H = 480;

/** Pop-in with a small overshoot, scaling from the tail corner. */
const pop = (frame: number, at: number) =>
  interpolate(frame, [at, at + 5, at + 9], [0, 1.06, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const Avatar: React.FC<{hue: number; size: number}> = ({hue, size}) => (
  <div style={{width: size, height: size, borderRadius: '50%', flex: 'none',
    background: `radial-gradient(circle at 35% 35%, hsl(${hue} 80% 75%), hsl(${hue} 60% 45%))`, border: '1.5px solid #fff', boxShadow: '0 0 0 1px #ddd'}} />
);

const Tail: React.FC<{side: 'left' | 'right'; fill: string}> = ({side, fill}) => (
  <svg width={22} height={16} style={{position: 'absolute', bottom: -12, [side]: 14, transform: side === 'right' ? 'scaleX(-1)' : undefined}}>
    <path d="M1 0 L1 15 L18 0 Z" fill={fill} stroke="#111" strokeWidth={2} />
    <rect x={3} y={-2} width={13} height={3} fill={fill} />
  </svg>
);

const BubbleView: React.FC<{b: Bubble; frame: number; accent: string; nameColor: string}> = ({b, frame, accent, nameColor}) => {
  const s = pop(frame, b.at);
  if (s <= 0) return null;
  const dim = b.depth;
  const fill = dim > 0.5 ? `rgb(${Math.round(230 - dim * 90)},${Math.round(230 - dim * 90)},${Math.round(232 - dim * 90)})` : '#fff';
  const side = b.tail ?? 'left';
  return (
    <div style={{position: 'absolute', left: b.x, top: b.y, width: b.w, transform: `scale(${s})`, transformOrigin: side === 'left' ? '10% 100%' : '90% 100%',
      opacity: 1 - dim * 0.45}}>
      <div style={{position: 'relative', background: fill, borderRadius: 24, border: '2px solid #111', padding: '9px 16px 8px 13px', display: 'flex', gap: 9}}>
        <Avatar hue={b.hue} size={28} />
        <div style={{minWidth: 0}}>
          <div style={{fontFamily: CJK, fontWeight: 500, fontSize: 9, color: nameColor}}>
            {b.name} <span style={{background: accent, color: '#fff', fontSize: 6, padding: '0 2px', borderRadius: 2}}>LV6</span>
          </div>
          <div style={{fontFamily: CJK, fontWeight: 500, fontSize: 12.5, color: '#222', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden'}}>{b.text}</div>
          <div style={{fontFamily: CJK, fontSize: 6.5, color: '#999', marginTop: 3}}>2026-11-0{(b.hue % 8) + 1} 2{b.hue % 4}:{10 + (b.hue % 49)}   回复</div>
        </div>
        <Tail side={side} fill={fill} />
      </div>
    </div>
  );
};

const PostCard: React.FC<{p: VoicesProps}> = ({p}) => {
  const {post, palette} = p;
  return (
    <div style={{position: 'absolute', left: 85, top: 70, width: 226, height: 288, background: '#fff', borderRadius: 14, padding: '12px 14px', boxSizing: 'border-box'}}>
      <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
        <div style={{width: 26, height: 26, borderRadius: '50%', border: `4px solid #222`, boxSizing: 'border-box', background: palette.name}} />
        <div>
          <div style={{fontFamily: CJK, fontSize: 9, color: palette.name}}>{post.name}</div>
          <div style={{fontFamily: CJK, fontSize: 6.5, color: '#aaa'}}>{post.date}</div>
        </div>
      </div>
      <div style={{fontFamily: CJK, fontSize: 8.6, color: '#222', lineHeight: 1.55, marginTop: 6}}>
        {post.lines.map((l, i) => (
          <div key={i}>
            {l.split(post.highlight).map((part, k, arr) => (
              <React.Fragment key={k}>
                {part}
                {k < arr.length - 1 ? <span style={{color: palette.name}}>{post.highlight}</span> : null}
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
      <div style={{marginTop: 6, width: 136, height: 136, borderRadius: 2, background: `linear-gradient(160deg, #8b8fe6, ${palette.accent} 60%, #3c3fb8)`,
        position: 'relative', overflow: 'hidden', marginLeft: 30}}>
        <div style={{position: 'absolute', left: 10, top: 10, fontFamily: CJK, fontWeight: 900, fontSize: 22, lineHeight: 1.05, color: '#fff'}}>
          {post.poster[0]}
          <br />
          {post.poster[1]}
        </div>
        <div style={{position: 'absolute', right: 18, top: 0, width: 26, height: 136, background: 'linear-gradient(#fff6, #fff1)'}} />
        <div style={{position: 'absolute', left: 22, top: 74, width: 22, height: 22, borderRadius: '50%', background: '#fffa'}} />
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 10, fontFamily: CJK, fontSize: 7, color: '#888', padding: '0 4px'}}>
        <span>{post.stats[0]}</span>
        <span>{post.stats[1]}</span>
        <span style={{color: palette.accent}}>{post.stats[2]}</span>
      </div>
      <Tail side="left" fill="#fff" />
    </div>
  );
};

/** Self-drawn backdrop: planet limb with haze + a small satellite with gold panels. */
const Space: React.FC<{frame: number; p: VoicesProps}> = ({frame, p}) => {
  const o = ramp(frame, p.scene.at, p.scene.at + p.scene.frames);
  const planet = ramp(frame, p.scene.planetAt, p.scene.planetAt + 60, [0.3, 0, 0.3, 1]);
  const drift = frame * 0.15;
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: o}}>
      <defs>
        <radialGradient id="pl" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.9" stopColor="#6f9fd8" />
          <stop offset="0.97" stopColor="#d9ecff" />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="gp" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9a44a" />
          <stop offset="1" stopColor="#8a5a1c" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="#020204" />
      <g opacity={planet} transform={`translate(${120 * (1 - planet)} 0)`}>
        <circle cx={1180} cy={330} r={560} fill="url(#pl)" />
        <circle cx={1180} cy={330} r={545} fill="#4f7fbf" opacity={0.5} />
        {Array.from({length: 9}, (_, i) => (
          <ellipse key={i} cx={760 + i * 40 - drift} cy={150 + (i % 4) * 70} rx={60} ry={14} fill="#fff" opacity={0.25} transform={`rotate(${-50 + i * 3} 760 300)`} />
        ))}
      </g>
      <g transform={`translate(${keyed(frame, p.scene.satX)} 40)`}>
        <rect x={-6} y={60} width={150} height={300} fill="#1d1d22" />
        {[0, 1, 2].map((r) =>
          [0, 1].map((c) => <rect key={`${r}${c}`} x={6 + c * 68} y={70 + r * 52} width={62} height={46} rx={4} fill="url(#gp)" stroke="#5a3a10" strokeWidth={2} />),
        )}
        <rect x={6} y={232} width={130} height={70} fill="#2b2b33" stroke="#555" />
        <path d="M70 302 L60 420 M90 302 L110 420" stroke="#777" strokeWidth={2} />
      </g>
    </svg>
  );
};

export const Voices: React.FC<VoicesProps> = (p) => {
  ensureFonts();
  // Bubble text uses weight 500 only (many distinct characters -> many font subsets); 900 only for the poster.
  ensureCjk([p.post.name, p.post.date, ...p.post.lines, ...p.post.stats, ...p.bubbles.map((b) => b.name + b.text), 'LV60123456789-: 回复', ...p.captions.map((c) => c.text)], ['500']);
  ensureCjk(p.post.poster, ['900']);
  const frame = useCurrentFrame();
  const s = keyed(frame, p.camera.scale), cx = keyed(frame, p.camera.x), cy = keyed(frame, p.camera.y);
  const part = keyed(frame, p.scene.part);
  const midX = 640; // world x around which the crowd parts
  const cap = p.captions.find((c) => frame >= c.from && frame <= c.to);
  const sorted = [...p.bubbles].sort((a, b) => b.depth - a.depth || a.at - b.at);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Space frame={frame} p={p} />
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0',
        transform: `translate(${W / 2}px, ${H / 2}px) scale(${s}) translate(${-cx}px, ${-cy}px)`}}>
        <PostCard p={p} />
        {sorted.map((b, i) => {
          const dx = b.x + b.w / 2 < midX ? -part : part;
          return <BubbleView key={i} b={{...b, x: b.x + dx * (b.tail === 'right' ? 0.4 : 1)}} frame={frame} accent={p.palette.accent} nameColor={p.palette.name} />;
        })}
      </div>
      {cap ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 436, textAlign: 'center', fontFamily: CJK, fontWeight: 500, fontSize: 19, color: '#fff',
          textShadow: '0 0 2px #000, 0 1px 3px rgba(0,0,0,0.7)', letterSpacing: 1}}>
          {cap.text}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const VoicesProbe: React.FC<VoicesProps & {probe: number[]}> = ({probe, ...p}) => {
  const f = useCurrentFrame();
  return (
    <Freeze frame={probe[Math.min(f, probe.length - 1)]}>
      <Voices {...p} />
    </Freeze>
  );
};
