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

const files = walk('src/pages/money');
let fail = false;
for (const f of files) {
  const txt = readFileSync(f, 'utf8');
  // Simple guard: if using strong quantitative language, require at least one source link marker.
  const hasStrong = /(best|top|improves|increase|boost|faster|higher)/i.test(txt);
  const hasSource = /(source|Sources|Citations|href="https:\/\/)/i.test(txt);
  if (hasStrong && !hasSource) {
    console.error(`FAIL citations heuristic: ${f}`);
    fail = true;
  } else {
    console.log(`PASS citations heuristic: ${f}`);
  }
}
if (fail) process.exit(1);
