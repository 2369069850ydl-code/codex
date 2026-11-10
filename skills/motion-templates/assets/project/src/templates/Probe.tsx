import React from 'react';
import {Freeze, useCurrentFrame} from 'remotion';
import {TEMPLATES, compId} from './registry';

// Renders chosen frames of any template, one per output frame (for quick reference comparisons).
export const TProbe: React.FC<{target: string; probe: number[]}> = ({target, probe}) => {
  const f = useCurrentFrame();
  const t = TEMPLATES.find((x) => compId(x) === target) ?? TEMPLATES[0];
  const C = t.component;
  return (
    <Freeze frame={probe[Math.min(f, probe.length - 1)] ?? 0}>
      <C {...t.props} />
    </Freeze>
  );
};
