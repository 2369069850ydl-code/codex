import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {cameraAt, place} from './stack';
import {domeMatcap, glyphTexture, mazeTexture} from './textures';
import type {Layer, LayersProps} from './types';

// Flat-coloured layers (no lights): front / top / side colours per face, textures on the front.

const shade = (c: string, k: number) => '#' + new THREE.Color(c).multiplyScalar(k).getHexString();

const chamferShape = (w: number, h: number, c: number) => {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(w / 2, 0);
  s.lineTo(w / 2, h - c);
  s.lineTo(w / 2 - c, h);
  s.lineTo(-w / 2 + c, h);
  s.lineTo(-w / 2, h - c);
  s.lineTo(-w / 2, 0);
  return s;
};

const Rig: React.FC<{frame: number; props: LayersProps}> = ({frame, props}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const c = cameraAt(frame, props);
  camera.position.set(...c.pos);
  camera.fov = c.fov;
  camera.near = 1;
  camera.far = c.far;
  camera.lookAt(...c.look);
  camera.updateProjectionMatrix();
  return null;
};

const Piece: React.FC<{layer: Layer; col: number; x: number; y0: number; width: number; frame: number; columns: number; pitch: number}> = ({
  layer,
  col,
  x,
  y0,
  width,
  frame,
  columns,
  pitch,
}) => {
  const recolor = layer.recolorAt !== undefined ? Math.min(1, Math.max(0, (frame - layer.recolorAt) / 10)) : 0;
  const pick = (arr: string[] | undefined, fallback: string[]) => (arr ?? fallback)[Math.min(col, (arr ?? fallback).length - 1)];
  const front = new THREE.Color(pick(layer.front, layer.front)).lerp(new THREE.Color(pick(layer.recolorFront, layer.front)), recolor);
  const top = new THREE.Color(pick(layer.top, layer.top)).lerp(new THREE.Color(pick(layer.recolorTop, layer.top)), recolor);
  const frontHex = '#' + front.getHexString();
  const topHex = '#' + top.getHexString();

  const geo = useMemo(() => {
    if (layer.kind === 'dome') {
      const g = new THREE.SphereGeometry(width / 2, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2);
      g.scale(1, layer.height / (width / 2), layer.depth / width);
      return g;
    }
    if (layer.kind === 'chamfer') {
      const g = new THREE.ExtrudeGeometry(chamferShape(width, layer.height, layer.chamfer ?? 10), {depth: layer.depth, bevelEnabled: false});
      g.translate(0, 0, -layer.depth / 2);
      return g;
    }
    const g = new THREE.BoxGeometry(width, layer.height, layer.depth);
    g.translate(0, layer.height / 2, 0);
    return g;
  }, [layer.kind, layer.height, layer.depth, layer.chamfer, width]);

  const tex = useMemo(() => {
    if (layer.pattern === 'maze') return mazeTexture(17 + col * 31, width, layer.height, layer.front[0], layer.patternColor ?? '#ffffff');
    if (layer.pattern === 'glyph') return glyphTexture(columns, pitch, width, layer.height, layer.front[0], layer.patternColor ?? '#3b3bf0');
    return null;
  }, [layer.pattern, col, width, layer.height, columns, pitch, layer.front[0], layer.patternColor]);
  const matcap = useMemo(() => (layer.kind === 'dome' ? domeMatcap() : null), [layer.kind]);

  if (layer.kind === 'dome') {
    return (
      <mesh geometry={geo} position={[x, y0, 0]}>
        <meshMatcapMaterial matcap={matcap!} />
      </mesh>
    );
  }
  if (layer.kind === 'chamfer') {
    return (
      <mesh geometry={geo} position={[x, y0, 0]}>
        {tex ? <meshBasicMaterial attach="material-0" map={tex} toneMapped={false} /> : <meshBasicMaterial attach="material-0" color={frontHex} toneMapped={false} />}
        <meshBasicMaterial attach="material-1" color={topHex} toneMapped={false} />
      </mesh>
    );
  }
  const side = shade(frontHex, 0.78);
  return (
    <mesh geometry={geo} position={[x, y0, 0]}>
      <meshBasicMaterial attach="material-0" color={side} toneMapped={false} />
      <meshBasicMaterial attach="material-1" color={side} toneMapped={false} />
      <meshBasicMaterial attach="material-2" color={topHex} toneMapped={false} />
      <meshBasicMaterial attach="material-3" color={side} toneMapped={false} />
      <meshBasicMaterial attach="material-4" color={frontHex} toneMapped={false} />
      <meshBasicMaterial attach="material-5" color={side} toneMapped={false} />
    </mesh>
  );
};

export const Stack3D: React.FC<{frame: number; props: LayersProps}> = ({frame, props}) => {
  const placed = place(frame, props);
  return (
    <>
      <Rig frame={frame} props={props} />
      {placed.map((p) =>
        p.xs.map((x, i) => (
          <Piece key={`${p.layer.id}-${i}`} layer={p.layer} col={i} x={x} y0={p.y0} width={p.width} frame={frame} columns={props.columns} pitch={props.pitch[0]} />
        )),
      )}
    </>
  );
};
