#!/usr/bin/env bash
# SessionStart hook: verify that the claudelint CLI is available.
# If not found, print install instructions.

if command -v claudelint >/dev/null 2>&1; then
  exit 0
fi

# Also check npx resolution (covers local devDependency installs)
if npx --no-install claudelint --version >/dev/null 2>&1; then
  exit 0
fi

echo "[claudelint] The claude-code-lint package is not installed."
echo "[claudelint] Plugin skills require it. Install with:"
echo ""
echo "  npm install --save-dev claude-code-lint"
echo ""
exit 0
