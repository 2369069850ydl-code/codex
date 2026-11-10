import {copyFileSync,existsSync,mkdirSync,readdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const target=process.argv[2];
if(!target) throw new Error('Usage: node create-project.mjs <new-project-directory>');
const dest=resolve(target);
if(existsSync(dest)&&readdirSync(dest).length) throw new Error('Destination is not empty; choose a new directory.');
const src=resolve(dirname(fileURLToPath(import.meta.url)),'../assets/project');
if(dest===src||dest.startsWith(src+'/')||dest.startsWith(src+'\\')) throw new Error('Choose a directory outside the installed Skill.');
function copyTree(from,to){mkdirSync(to,{recursive:true});for(const entry of readdirSync(from,{withFileTypes:true})){const a=resolve(from,entry.name),b=resolve(to,entry.name);if(entry.isDirectory())copyTree(a,b);else if(entry.isFile())copyFileSync(a,b);else throw new Error('Unsupported entry: '+a);}}
copyTree(src,dest);
console.log(`Created ${dest}\nNext: cd to that directory; npm ci; npm run typecheck; npm run studio`);
