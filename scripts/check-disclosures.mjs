import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const moneyDir = 'src/pages/money';
const files = readdirSync(moneyDir).filter((f) => f.endsWith('.astro'));
let fail = false;

for (const f of files) {
  const p = join(moneyDir, f);
  if (!statSync(p).isFile()) continue;
  const txt = readFileSync(p, 'utf8');
  const disclosureIdx = txt.indexOf('AffiliateDisclosure');
  const linkIdx = txt.search(/<a\s+href=/);
  if (disclosureIdx === -1 || linkIdx === -1 || disclosureIdx > linkIdx) {
    console.error(`FAIL disclosure placement: ${p}`);
    fail = true;
  } else {
    console.log(`PASS disclosure placement: ${p}`);
  }
}

if (fail) process.exit(1);
