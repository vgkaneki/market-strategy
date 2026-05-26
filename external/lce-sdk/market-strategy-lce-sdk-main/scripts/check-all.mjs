import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const roots = ['packages', 'examples', 'tests', 'scripts'];
const files = [];
function walk(dir){
  if(!fs.existsSync(dir)) return;
  for(const name of fs.readdirSync(dir)){
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if(st.isDirectory()) walk(p);
    else if(p.endsWith('.mjs')) files.push(p);
  }
}
for(const r of roots) walk(r);
let failed = false;
for(const file of files){
  const r = spawnSync(process.execPath, ['--check', file], {encoding:'utf8'});
  if(r.status !== 0){
    failed = true;
    console.error(`[FAIL] ${file}`);
    console.error(r.stderr || r.stdout);
  } else {
    console.log(`[PASS] ${file}`);
  }
}
if(failed) process.exit(1);
console.log(`[PASS] Checked ${files.length} module files.`);
