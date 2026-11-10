import {readFileSync} from 'node:fs';
const s=readFileSync(new URL('../src/templates/registry.ts',import.meta.url),'utf8');
const rows=[...s.matchAll(/(?:fx|def)\((\d+), '([^']+)', '([^']+)'/g)].map(m=>({id:`T${m[1].padStart(3,'0')}-${m[2]}`,name:m[3]}));
rows.sort((a,b)=>a.id.localeCompare(b.id)); console.log(JSON.stringify(rows,null,2));
