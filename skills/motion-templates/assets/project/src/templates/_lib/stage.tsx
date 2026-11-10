import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {ensureFonts} from '../../fonts';
import {useFontsReady} from '../../fontGate';
import {ensureCjk} from '../../Lidar/cjk';

// Every template is authored in a fixed 852x480 design space (the size the references were measured
// at) and scaled to the composition size (1920x1080 by default). Vector content stays sharp.
export const DW = 852;
export const DH = 480;

/** `texts`: every string the template may draw (CJK subsets are loaded for them). Children are not
 * mounted until the fonts are ready. */
export const Stage: React.FC<{bg?: string; texts?: string[]; weights?: string[]; children: React.ReactNode}> = ({bg = '#f7f7f9', texts = [], weights = ['500', '900'], children}) => {
  ensureFonts(); // Montserrat must be loaded: it is the last fallback of the CJK stack
  ensureCjk([...texts, '0123456789'], weights);
  const ready = useFontsReady();
  const {width, height} = useVideoConfig();
  const s = Math.min(width / DW, height / DH);
  return (
    <AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: (width - DW * s) / 2, top: (height - DH * s) / 2, width: DW, height: DH, transform: `scale(${s})`, transformOrigin: '0 0'}}>
        {ready ? children : null}
      </div>
    </AbsoluteFill>
  );
};
