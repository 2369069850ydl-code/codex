// Render several stills with ONE browser instance (cheaper than one CLI call per frame).
// usage: node scripts/stills.mjs <bundleDir> <compositionId> <outDir> <frame,frame,...> [propsJsonFile]
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const [bundleDir, id, outDir, framesArg, propsFile] = process.argv.slice(2);
const serveUrl = path.resolve(bundleDir);
const inputProps = propsFile ? JSON.parse(fs.readFileSync(propsFile, 'utf8')) : {};
const frames = framesArg.split(',').map(Number);
fs.mkdirSync(outDir, {recursive: true});

const t0 = Date.now();
const browser = await openBrowser('chrome');
const composition = await selectComposition({serveUrl, id, inputProps, puppeteerInstance: browser});
console.log(`browser+select: ${((Date.now() - t0) / 1000).toFixed(1)}s`);
for (const frame of frames) {
  const t = Date.now();
  const output = path.join(outDir, `${id}_f${String(frame).padStart(3, '0')}.png`);
  // v4: the component receives composition.props, so custom props must be set there too.
  await renderStill({composition: propsFile ? {...composition, props: inputProps} : composition, serveUrl, output, frame, inputProps, puppeteerInstance: browser, imageFormat: 'png'});
  console.log(`frame ${frame}: ${((Date.now() - t) / 1000).toFixed(2)}s -> ${output}`);
}
await browser.close({silent: true});
console.log(`total: ${((Date.now() - t0) / 1000).toFixed(1)}s`);
