import { REQUIRED_ENGINE_IDS, registeredEngines } from '../packages/lce-engines/src/index.mjs';
const registered = new Set(registeredEngines.map(e => e.id));
const missing = REQUIRED_ENGINE_IDS.filter(id => !registered.has(id));
const duplicates = registeredEngines.map(e => e.id).filter((id, i, arr) => arr.indexOf(id) !== i);
const report = { required: REQUIRED_ENGINE_IDS.length, registered: registeredEngines.length, missing, duplicates, ok: missing.length === 0 && duplicates.length === 0 };
console.log(JSON.stringify(report, null, 2));
if(!report.ok) process.exit(1);
