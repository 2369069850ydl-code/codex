import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';

// Adapters for the first replicas (made before the template registry):
// - slice(): play only part of a longer component (one long replica covering two reference clips)
// - scaled(): render an 852x480 DOM component at any composition size

export type SliceProps = {durationInFrames: number; inner: Record<string, unknown>};

export const slice = (Comp: React.FC<any>, offset: number): React.FC<SliceProps> => {
  const Sliced: React.FC<SliceProps> = ({inner}) => (
    <Sequence from={-offset} layout="none">
      <Comp {...inner} />
    </Sequence>
  );
  return Sliced;
};

export const scaled = (Comp: React.FC<any>): React.FC<any> => {
  const Scaled: React.FC<any> = (props) => {
    const {width, height} = useVideoConfig();
    const s = Math.min(width / 852, height / 480);
    return (
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: (width - 852 * s) / 2, top: (height - 480 * s) / 2, width: 852, height: 480, transform: `scale(${s})`, transformOrigin: '0 0'}}>
          <Comp {...props} />
        </div>
      </AbsoluteFill>
    );
  };
  return Scaled;
};
