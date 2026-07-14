#!/bin/bash
#
# Guard the upstream-watch workflow against clobbering human-authored issues.
#
# On 2026-07-13 the "Open or update drift issue" step looked up its rolling
# report with:
#
#   gh issue list --state open --label upstream-drift --json number --jq '.[0].number'
#   gh issue edit "$EXISTING" --body "$BODY"
#
# `upstream-drift` is a shared TOPIC label -- humans apply it to hand-written
# backlogs too (#132 carried it). So the lookup resolved to a human's issue, and
# `gh issue edit --body` REPLACES the body rather than appending. The next drift
# detection would have silently destroyed the backlog.
#
# The workflow must therefore identify its own report by a marker it writes into
# the body, not by a label anyone can apply. The checks below pin that.

set -e

WORKFLOW=.github/workflows/upstream-watch.yml
MARKER='upstream-watch:auto-report'
ERRORS=0

if [[ ! -f "$WORKFLOW" ]]; then
  echo "ERROR: $WORKFLOW not found"
  exit 1
fi

echo "Checking $WORKFLOW for issue-clobbering patterns..."

# Strip comment-only lines so the explanatory comments in the workflow (which
# necessarily quote the bad pattern) don't trip the check on themselves.
NON_COMMENT=$(grep -vE "^\s*#" "$WORKFLOW")

# 1. The lookup that decides WHICH issue to overwrite must filter on the marker.
#    Without it, any issue matching the label is a candidate for destruction.
if ! echo "$NON_COMMENT" | grep -F "$MARKER" >/dev/null; then
  echo "ERROR: workflow does not reference the '$MARKER' marker"
  echo "  The rolling report must be identified by a body marker it writes itself,"
  echo "  so it can never edit an issue a human created."
  ERRORS=$((ERRORS + 1))
fi

# 2. `gh issue edit` must never be reachable from a lookup keyed on the shared
#    topic label. Catch a lookup that selects on `--label upstream-drift` without
#    the `-auto` suffix -- that is the exact 2026-07-13 bug.
if echo "$NON_COMMENT" | grep -E "gh issue list.*--label upstream-drift([^-]|$)" >/dev/null; then
  echo "ERROR: issue lookup keys on the shared 'upstream-drift' topic label"
  echo "  Humans apply that label to hand-written backlogs. Editing the result"
  echo "  overwrites their issue body. Use 'upstream-drift-auto' + the body marker."
  echo "$NON_COMMENT" | grep -nE "gh issue list.*--label upstream-drift([^-]|$)"
  ERRORS=$((ERRORS + 1))
fi

# 3. If the workflow edits an issue at all, the marker must be filtered on in the
#    same step. A marker written but never READ back is decoration, not a guard.
if echo "$NON_COMMENT" | grep -E "gh issue edit" >/dev/null; then
  if ! echo "$NON_COMMENT" | grep -E "select\(.*contains\(\\\$marker\)\)" >/dev/null; then
    echo "ERROR: workflow calls 'gh issue edit' without filtering candidates on the marker"
    echo "  Write the marker into the body AND select on it when looking the issue up."
    ERRORS=$((ERRORS + 1))
  fi
fi

if [[ $ERRORS -eq 0 ]]; then
  echo "[SUCCESS] $WORKFLOW cannot overwrite a human-authored issue"
  exit 0
else
  echo ""
  echo "[FAIL] Found $ERRORS issue-clobbering pattern(s) in $WORKFLOW"
  echo "The rolling drift report must only ever edit an issue it created itself."
  exit 1
fi
