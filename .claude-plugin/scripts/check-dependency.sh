#!/usr/bin/env bash
# SessionStart hook: verify claudelint CLI is available and version-compatible.

PLUGIN_VERSION="0.2.0-beta.1"  # Updated by sync-versions

# Check global install
if command -v claudelint >/dev/null 2>&1; then
  CLI_VERSION=$(claudelint --version 2>/dev/null || echo "unknown")
  if [ "$CLI_VERSION" != "$PLUGIN_VERSION" ] && [ "$CLI_VERSION" != "unknown" ]; then
    echo "[claudelint] Version mismatch: plugin=$PLUGIN_VERSION, CLI=$CLI_VERSION"
    echo "[claudelint] Update with: npm install -g claude-code-lint@$PLUGIN_VERSION"
  fi
  exit 0
fi

# Check local install
if npx --no-install claudelint --version >/dev/null 2>&1; then
  CLI_VERSION=$(npx --no-install claudelint --version 2>/dev/null || echo "unknown")
  if [ "$CLI_VERSION" != "$PLUGIN_VERSION" ] && [ "$CLI_VERSION" != "unknown" ]; then
    echo "[claudelint] Version mismatch: plugin=$PLUGIN_VERSION, CLI=$CLI_VERSION"
    echo "[claudelint] Update with: npm install --save-dev claude-code-lint@$PLUGIN_VERSION"
  fi
  exit 0
fi

echo "[claudelint] The claude-code-lint package is not installed."
echo "[claudelint] Plugin skills require it. Install with:"
echo ""
echo "  All projects:      npm install -g claude-code-lint"
echo "  This project only: npm install --save-dev claude-code-lint"
echo ""
exit 0
