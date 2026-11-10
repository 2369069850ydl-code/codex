// usage: node scripts/fit/camtarget.mjs <cross.json> <props.json>
// derive target camera per frame: new = s*(cam - C) + C + d, zoom' = s*zoom (from cross registration ours->ref)
import {interpolate, Easing} from 'remotion';
import fs from 'node:fs';
const [crossFile, propsFile] = process.argv.slice(2);
const cross = JSON.parse(fs.readFileSync(crossFile));
const P = JSON.parse(fs.readFileSync(propsFile));
const k = P.camera, e = P.cameraEasing ?? [0.6, 0, 0.3, 1];
const ez = Easing.bezier(...e);
const cam = (f, fld) => interpolate(f, k.map(x => x.frame), k.map(x => x[fld]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ez});
const C = [426, 240];
const rows = [];
for (let f = 24; f <= 272; f++) {
  const v = cross[f]; if (!v || v[3] < 0.75) continue;
  const [s, dx, dy] = v;
  const x = cam(f, 'x'), y = cam(f, 'y'), z = cam(f, 'zoom');
  rows.push({f, x: +x.toFixed(1), y: +y.toFixed(1), z: +z.toFixed(3), tx: +(s * (x - C[0]) + C[0] + dx).toFixed(1), ty: +(s * (y - C[1]) + C[1] + dy).toFixed(1), tz: +(s * z).toFixed(3), m: v[3]});
}
fs.writeFileSync(crossFile.replace('.json', '_camtarget.json'), JSON.stringify(rows));
for (const r of rows) if (r.f % 4 === 0) console.log(r.f, 'cur', r.x, r.y, r.z, '-> target', r.tx, r.ty, r.tz, 'match', r.m);
