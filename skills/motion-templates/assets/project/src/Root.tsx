import React from 'react';
import {Composition} from 'remotion';
import {CardGrid, DESIGN_H, DESIGN_W} from './CardGrid/CardGrid';
import {sampleA, sampleB} from './CardGrid/samples';
import type {CardGridProps} from './CardGrid/types';
import {Domino} from './Domino/Domino';
import {dominoA} from './Domino/samples';
import type {DominoProps} from './Domino/types';
import {Lidar, LidarProbe} from './Lidar/Lidar';
import {lidarA} from './Lidar/samples';
import {Layers, LayersProbe} from './Layers/Layers';
import {layersA} from './Layers/samples';
import {Multiply, MultiplyProbe} from './Multiply/Multiply';
import {multiplyA} from './Multiply/samples';
import {Fin, FinProbe} from './Fin/Fin';
import {finA} from './Fin/samples';
import {Voices, VoicesProbe} from './Voices/Voices';
import {voicesA} from './Voices/samples';
import type {LayersProps} from './Layers/types';
import type {LidarProps} from './Lidar/types';
import {TEMPLATES, compId} from './templates/registry';
import {TProbe} from './templates/Probe';

const calc = ({props}: {props: CardGridProps}) => ({durationInFrames: props.durationInFrames});
const calcL = ({props}: {props: LidarProps}) => ({durationInFrames: props.durationInFrames});
const calcP = ({props}: {props: LidarProps & {probe: number[]}}) => ({durationInFrames: Math.max(props.durationInFrames, props.probe.length)});
const calcLy = ({props}: {props: LayersProps}) => ({durationInFrames: props.durationInFrames});
const calcD = ({props}: {props: DominoProps}) => ({durationInFrames: props.durationInFrames});

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="TProbe" component={TProbe} width={1920} height={1080} fps={30} durationInFrames={1} defaultProps={{target: '', probe: [0]}} calculateMetadata={({props}) => ({durationInFrames: Math.max(props.probe.length, ...props.probe) + 1})} />
    {TEMPLATES.map((t) => (
      <Composition key={compId(t)} id={compId(t)} component={t.component} width={t.size?.[0] ?? 1920} height={t.size?.[1] ?? 1080} fps={30} durationInFrames={t.props.durationInFrames} defaultProps={t.props} calculateMetadata={({props}) => ({durationInFrames: Number(props.durationInFrames)})} />
    ))}
    <Composition
      id="CardGridA"
      component={CardGrid}
      width={DESIGN_W}
      height={DESIGN_H}
      fps={30}
      durationInFrames={sampleA.durationInFrames}
      defaultProps={sampleA}
      calculateMetadata={calc}
    />
    <Composition
      id="CardGridB"
      component={CardGrid}
      width={DESIGN_W}
      height={DESIGN_H}
      fps={30}
      durationInFrames={sampleB.durationInFrames}
      defaultProps={sampleB}
      calculateMetadata={calc}
    />
    <Composition
      id="DominoA"
      component={Domino}
      width={DESIGN_W}
      height={DESIGN_H}
      fps={30}
      durationInFrames={dominoA.durationInFrames}
      defaultProps={dominoA}
      calculateMetadata={calcD}
    />
    <Composition
      id="LidarA"
      component={Lidar}
      width={852}
      height={480}
      fps={30}
      durationInFrames={lidarA.durationInFrames}
      defaultProps={lidarA}
      calculateMetadata={calcL}
    />
    <Composition
      id="LidarProbe"
      component={LidarProbe}
      width={852}
      height={480}
      fps={30}
      durationInFrames={8}
      defaultProps={{...lidarA, probe: [0, 20, 40, 60, 112, 150, 220, 300, 400, 470]}}
      calculateMetadata={calcP}
    />
    <Composition id="LayersA" component={Layers} width={852} height={480} fps={30} durationInFrames={layersA.durationInFrames} defaultProps={layersA} calculateMetadata={calcLy} />
    <Composition id="LayersProbe" component={LayersProbe} width={852} height={480} fps={30} durationInFrames={layersA.durationInFrames}
      defaultProps={{...layersA, probe: [0, 12, 60, 200, 300, 380, 520, 568]}} />
    <Composition id="MultiplyA" component={Multiply} width={852} height={480} fps={30} durationInFrames={multiplyA.durationInFrames} defaultProps={multiplyA} />
    <Composition id="MultiplyProbe" component={MultiplyProbe} width={852} height={480} fps={30} durationInFrames={multiplyA.durationInFrames}
      defaultProps={{...multiplyA, probe: [0, 30, 66, 105, 150, 207]}} />
    <Composition id="FinA" component={Fin} width={852} height={480} fps={30} durationInFrames={finA.durationInFrames} defaultProps={finA} />
    <Composition id="FinProbe" component={FinProbe} width={852} height={480} fps={30} durationInFrames={finA.durationInFrames}
      defaultProps={{...finA, probe: [0]}} />
    <Composition id="VoicesA" component={Voices} width={852} height={480} fps={30} durationInFrames={voicesA.durationInFrames} defaultProps={voicesA} />
    <Composition id="VoicesProbe" component={VoicesProbe} width={852} height={480} fps={30} durationInFrames={voicesA.durationInFrames}
      defaultProps={{...voicesA, probe: [0]}} />
  </>
);
