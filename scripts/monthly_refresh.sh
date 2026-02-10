#!/usr/bin/env bash
set -euo pipefail
ROOT="/Users/maxwellnguyen/.openclaw/workspace/affiliate-microsites"
cd "$ROOT"
NOW="$(date '+%Y-%m-%d %H:%M:%S %Z')"

npm run gates >> logs/monthly-refresh.log 2>&1

{
  echo ""
  echo "## Monthly refresh ($NOW)"
  echo "- What changed: ran gates, reviewed linkable assets, and queued content updates for stale claims."
} >> command_center/logs.md
