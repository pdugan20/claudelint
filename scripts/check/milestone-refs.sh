#!/bin/bash
#
# Check for stale milestone/phase references in source code and CI config.
#
# Flags internal project milestone identifiers that should not appear in
# source files, test files, or CI configuration:
#   - "Phase N" or "Phase N.N" (internal milestone phases)
#   - "M<number>" milestone shorthand (e.g., M2, M17)
#
# Legitimate uses of "Phase" (skill workflows, deployment strategies) live
# in docs/ and manual test scripts, which are excluded from this check.

set -euo pipefail

VIOLATIONS=0

# Check source code (.ts, .js) for milestone references
check_source_files() {
  local pattern="$1"
  local label="$2"

  local matches
  matches=$(grep -rn --include='*.ts' --include='*.js' \
    -E "$pattern" \
    src/ tests/ scripts/ \
    --exclude-dir=node_modules \
    --exclude-dir=dist \
    --exclude='milestone-refs.sh' \
    2>/dev/null \
    | grep -v 'scripts/test/manual/' \
    || true)

  if [ -n "$matches" ]; then
    echo "$label"
    echo "$matches" | while IFS= read -r line; do
      echo "  $line"
    done
    echo ""
    VIOLATIONS=$((VIOLATIONS + $(echo "$matches" | wc -l)))
  fi
}

# Check CI config for milestone references
check_ci_files() {
  local pattern="$1"
  local label="$2"

  local matches
  matches=$(grep -rn --include='*.yml' --include='*.yaml' \
    -E "$pattern" \
    .github/ \
    2>/dev/null || true)

  if [ -n "$matches" ]; then
    echo "$label"
    echo "$matches" | while IFS= read -r line; do
      echo "  $line"
    done
    echo ""
    VIOLATIONS=$((VIOLATIONS + $(echo "$matches" | wc -l)))
  fi
}

echo "Checking for stale milestone references..."

# Pattern 1: "Phase N" or "Phase N.N" (but not "Phase A/B/C" which are workflow steps)
check_source_files 'Phase [0-9]' "Milestone phase references in source/test/script files:"
check_ci_files 'Phase [0-9]' "Milestone phase references in CI config:"

# Pattern 2: Milestone shorthand like (M2), M17, etc. in comments
# Match M<digits> that appear to be milestone IDs, not variable names
check_source_files '\bM[0-9]+[^a-zA-Z_]' "Milestone ID references in source/test/script files:"
check_ci_files '\bM[0-9]+[^a-zA-Z_]' "Milestone ID references in CI config:"

if [ "$VIOLATIONS" -gt 0 ]; then
  echo "Found $VIOLATIONS stale milestone reference(s)."
  echo "Remove internal milestone identifiers (Phase N, M<number>) from code and CI."
  echo "Use descriptive labels instead (e.g., 'after validator-to-rule migration')."
  exit 1
fi

echo "No stale milestone references found."
exit 0
