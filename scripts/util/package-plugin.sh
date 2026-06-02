#!/usr/bin/env bash
#
# Package the Claude Code plugin into a distributable .zip archive.
#
# The archive bundles `.claude-plugin/` and `skills/` at its root, which
# is the layout `claude --plugin-url <url>` expects. It is attached to
# each GitHub Release by .github/workflows/publish.yml so users can trial
# the plugin for a session without registering the marketplace.
#
# Note: the archived plugin's skills shell out to the `claudelint` CLI,
# so a --plugin-url trial still requires `npm install -g claude-code-lint`.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

OUT="claudelint-plugin.zip"

rm -f "$OUT"

# `.claude-plugin` is a dotfile but is included because it is named
# explicitly. `-x` drops macOS cruft so local runs match CI output.
zip -r -q "$OUT" .claude-plugin skills -x '*.DS_Store'

# Fail loudly if the archive is missing the manifest --plugin-url needs.
# `grep -c` (not -q) reads all input, so it can't SIGPIPE `unzip` under
# `pipefail`; `|| true` keeps a zero count from tripping `set -e`.
manifest_count=$(unzip -Z1 "$OUT" | grep -cx '\.claude-plugin/plugin\.json' || true)
if [[ "$manifest_count" -eq 0 ]]; then
  echo "ERROR: $OUT does not contain .claude-plugin/plugin.json" >&2
  exit 1
fi

echo "Created $OUT ($(du -h "$OUT" | cut -f1))"
