#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "[manager] Running release gates..."
npm run gates

echo "[manager] All gates PASS"
