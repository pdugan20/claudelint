#!/usr/bin/env bash
# Checks that claudelint is installed and accessible.
# Called by the SessionStart hook when the plugin loads.

if command -v claudelint >/dev/null 2>&1; then
  exit 0
fi

if [ -x "./node_modules/.bin/claudelint" ]; then
  exit 0
fi

echo "[WARN] claudelint is not installed. Run: npm install -g claude-code-lint" >&2
exit 0
