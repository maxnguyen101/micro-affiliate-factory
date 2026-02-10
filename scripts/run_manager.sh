#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "[manager] Running lightweight checks..."
npm run build

echo "[manager] Build PASS"
echo "[manager] Reminder: publication requires citations + QA + duplication checks before deploy."
