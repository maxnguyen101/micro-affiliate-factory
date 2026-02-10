#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/maxwellnguyen/.openclaw/workspace/affiliate-microsites"
cd "$ROOT"

TS="$(date '+%Y-%m-%d %H:%M:%S %Z')"
{
  echo ""
  echo "## Weekly automation review ($TS)"
  echo "- Ran: npm run gates"
} >> command_center/logs.md

if npm run gates >> logs/weekly-review.log 2>&1; then
  echo "- Result: PASS" >> command_center/logs.md
else
  echo "- Result: FAIL (see logs/weekly-review.log)" >> command_center/logs.md
fi
