import {spawnSync} from 'node:child_process';
for (const [file,args] of [['node_modules/typescript/bin/tsc',['-p','.']],['scripts/catalog.mjs',[]]]) {const r=spawnSync(process.execPath,[file,...args],{stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);}
console.log('Typecheck and catalog passed. Render and visual review are separate checks.');
