#!/usr/bin/env bash
# SessionStart hook: verify claudelint CLI is available and version-compatible.
# Outputs JSON with additionalContext so Claude is aware of issues and can
# naturally inform the user and offer to fix them.

PLUGIN_VERSION="0.2.0-beta.3"  # Updated by sync-versions

# Helper: output JSON with additionalContext (injected into Claude's context)
warn_json() {
  local ctx="$1"
  cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "$ctx"
  }
}
EOF
  exit 0
}

# Check global install
if command -v claudelint >/dev/null 2>&1; then
  CLI_VERSION=$(claudelint --version 2>/dev/null | sed 's/^claudelint v//' || echo "unknown")
  if [ "$CLI_VERSION" != "$PLUGIN_VERSION" ] && [ "$CLI_VERSION" != "unknown" ]; then
    warn_json "IMPORTANT: The claudelint plugin version ($PLUGIN_VERSION) does not match the installed CLI version ($CLI_VERSION). Before doing anything else, tell the user about this version mismatch and ask if they would like you to run this command to fix it: npm install -g claude-code-lint@$PLUGIN_VERSION"
  fi
  exit 0
fi

# Check local install
if npx --no-install claudelint --version >/dev/null 2>&1; then
  CLI_VERSION=$(npx --no-install claudelint --version 2>/dev/null | sed 's/^claudelint v//' || echo "unknown")
  if [ "$CLI_VERSION" != "$PLUGIN_VERSION" ] && [ "$CLI_VERSION" != "unknown" ]; then
    warn_json "IMPORTANT: The claudelint plugin version ($PLUGIN_VERSION) does not match the installed CLI version ($CLI_VERSION). Before doing anything else, tell the user about this version mismatch and ask if they would like you to run this command to fix it: npm install --save-dev claude-code-lint@$PLUGIN_VERSION"
  fi
  exit 0
fi

warn_json "IMPORTANT: The claude-code-lint npm package is not installed. The claudelint plugin skills will not work without it. Before doing anything else, tell the user and ask if they would like you to install it. The command is: npm install -g claude-code-lint (for all projects) or npm install --save-dev claude-code-lint (for this project only)"
