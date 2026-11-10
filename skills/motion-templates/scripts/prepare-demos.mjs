import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
const dest=resolve(process.argv[2]||'shotcraft-demos.zip');
if(existsSync(dest))throw new Error('Destination exists; choose a new ZIP path.');
const data=readFileSync(new URL('../references/vendor/video-shotcraft/demo-source.zip.base64',import.meta.url),'utf8');
writeFileSync(dest,Buffer.from(data,'base64'),{flag:'wx'});
console.log(`Wrote ${dest}. Extract it to a new directory, then read demos/README.md.`);
