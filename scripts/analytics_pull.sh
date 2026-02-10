#!/usr/bin/env bash
set -euo pipefail
ROOT="/Users/maxwellnguyen/.openclaw/workspace/affiliate-microsites"
cd "$ROOT"

if [ -f "$ROOT/.env.analytics" ]; then
  set -a
  source "$ROOT/.env.analytics"
  set +a
fi

node scripts/fetch_analytics.mjs >> logs/analytics-pull.log 2>&1
