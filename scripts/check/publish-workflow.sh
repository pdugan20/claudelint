#!/bin/bash
#
# Guard the publish workflow against known-broken configurations.
#
# Each pattern below caused a real publish failure between 2026-03-23
# and 2026-05-04 and is documented in docs/releasing.md. If any of these
# reappear in publish.yml, fail the check and tell the reader where to
# look before "fixing" the workflow.

set -e

WORKFLOW=.github/workflows/publish.yml
ERRORS=0

if [[ ! -f "$WORKFLOW" ]]; then
  echo "ERROR: $WORKFLOW not found"
  exit 1
fi

echo "Checking $WORKFLOW for known-broken patterns..."

# Strip comment-only lines so warning comments referencing the bad
# patterns don't trigger the check on themselves.
NON_COMMENT=$(grep -nvE "^\s*#" "$WORKFLOW")

# 1. registry-url on setup-node injects a placeholder NODE_AUTH_TOKEN that
#    npm tries to authenticate with instead of falling back to OIDC.
if echo "$NON_COMMENT" | grep -E "^\s*[0-9]+:\s*registry-url:" >/dev/null; then
  echo "ERROR: setup-node has 'registry-url:' set"
  echo "  This injects a placeholder NODE_AUTH_TOKEN that breaks OIDC publishing."
  echo "$NON_COMMENT" | grep -E "^\s*[0-9]+:\s*registry-url:"
  echo "  See docs/releasing.md section #3."
  ERRORS=$((ERRORS + 1))
fi

# 2. `npm install -g npm@...` crashes the GitHub Actions runner with
#    "Cannot find module 'promise-retry'" mid-bootstrap. Don't self-upgrade.
if echo "$NON_COMMENT" | grep -E "npm install -g npm" >/dev/null; then
  echo "ERROR: workflow tries to self-upgrade npm"
  echo "  npm self-upgrade currently crashes on the runner image."
  echo "$NON_COMMENT" | grep -E "npm install -g npm"
  echo "  See docs/releasing.md section #2."
  ERRORS=$((ERRORS + 1))
fi

# 3. Node 22 ships npm 10.x, which only does provenance-signing — not
#    trusted-publishing auth (added in npm 11.5+). Need Node 24+.
if echo "$NON_COMMENT" | grep -E "^\s*[0-9]+:\s*node-version:\s*['\"]?(20|21|22|23)['\"]?" >/dev/null; then
  echo "ERROR: node-version is below 24"
  echo "  npm < 11.5 does not auto-fetch the OIDC token for trusted publishing."
  echo "$NON_COMMENT" | grep -E "^\s*[0-9]+:\s*node-version:"
  echo "  See docs/releasing.md section #4."
  ERRORS=$((ERRORS + 1))
fi

if [[ $ERRORS -eq 0 ]]; then
  echo "[SUCCESS] No known-broken patterns found in $WORKFLOW"
  exit 0
else
  echo ""
  echo "[FAIL] Found $ERRORS known-broken pattern(s) in $WORKFLOW"
  echo "Read docs/releasing.md before changing the workflow."
  exit 1
fi
