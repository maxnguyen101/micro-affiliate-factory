# QA Automation Checklist (CI Gates)

## Required Blocking Gates
1. Build PASS (`npm run build`)
2. Disclosure PASS (money page disclosure appears before first outbound link)
3. Citations PASS (heuristic for factual/comparative claims)
4. Duplication PASS (near-duplicate heuristic)
5. YMYL Drift PASS (blocked risky phrases)

## Scripts
- `scripts/check-disclosures.mjs`
- `scripts/check-citations.mjs`
- `scripts/check-duplication.mjs`
- `scripts/check-ymyl.mjs`
- Combined command: `npm run gates`

## CI
- GitHub Actions workflow: `.github/workflows/gates.yml`
- Runs on push to `main` and PRs.

## Notes
- This is v1 automation. Next hardening phase should add:
  - deterministic citation maps per page,
  - robust semantic duplication,
  - visual disclosure checks in headless browser,
  - link integrity against generated `dist` output.
