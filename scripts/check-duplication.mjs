import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.astro')) out.push(p);
  }
  return out;
}

const files = walk('src/pages');
const norm = (s) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
const texts = files.map((f) => [f, norm(readFileSync(f, 'utf8'))]);
let fail = false;

for (let i = 0; i < texts.length; i++) {
  for (let j = i + 1; j < texts.length; j++) {
    const [fa, a] = texts[i];
    const [fb, b] = texts[j];
    if (!a || !b) continue;
    const min = Math.min(a.length, b.length);
    const prefix = [...Array(min).keys()].find((k) => a[k] !== b[k]) ?? min;
    const sim = prefix / min;
    if (sim > 0.85 && min > 300) {
      console.error(`WARN potential duplication: ${fa} <> ${fb} (prefix-sim ${sim.toFixed(2)})`);
      fail = true;
    }
  }
}
if (!fail) console.log('PASS duplication heuristic');
if (fail) process.exit(1);
