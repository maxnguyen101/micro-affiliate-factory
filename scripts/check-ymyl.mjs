import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = 'src/pages';
const banned = [
  /diagnose|diagnosis|treat|treatment|cure|symptom/i,
  /legal advice|attorney|lawsuit/i,
  /investment advice|guaranteed returns|get rich/i
];

function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.astro')) out.push(p);
  }
  return out;
}

let fail = false;
for (const p of walk(root)) {
  const txt = readFileSync(p, 'utf8');
  for (const rx of banned) {
    if (rx.test(txt)) {
      console.error(`FAIL YMYL risky phrase (${rx}) in ${p}`);
      fail = true;
    }
  }
}
if (!fail) console.log('PASS YMYL scan');
if (fail) process.exit(1);
