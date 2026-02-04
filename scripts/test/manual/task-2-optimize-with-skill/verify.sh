#!/usr/bin/env bash
#
# Verify Task 2: optimize-cc-md (With Skill Loaded)
#
# Checks that the skill executed correctly and made expected changes.
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
LIB_DIR="$SCRIPT_DIR/../lib"
TEST_DIR="/tmp/claudelint-test-2"
FIXTURE_DIR="$REPO_ROOT/tests/fixtures/projects/react-typescript-bloated"

echo "Verifying Task 2 results..."
echo

# Use common verification
"$LIB_DIR/verify-structure.sh" "$TEST_DIR"

# Task 2 specific checks
echo
echo "Task 2 Specific Checks:"

# Original size from fixture
ORIGINAL_SIZE=$(wc -c < "$FIXTURE_DIR/CLAUDE.md")
echo "  Original size: $ORIGINAL_SIZE bytes"

# Compare against expected
if [ -d "$FIXTURE_DIR/.expected" ]; then
  echo "  Comparing against expected output..."

  # Size comparison
  ACTUAL_SIZE=$(wc -c < "$TEST_DIR/CLAUDE.md")
  EXPECTED_SIZE=$(wc -c < "$FIXTURE_DIR/.expected/CLAUDE.md")
  SIZE_DIFF=$((ACTUAL_SIZE - EXPECTED_SIZE))
  REDUCTION=$((ORIGINAL_SIZE - ACTUAL_SIZE))
  PERCENT=$((REDUCTION * 100 / ORIGINAL_SIZE))

  echo "  Current size:  $ACTUAL_SIZE bytes"
  echo "  Expected size: $EXPECTED_SIZE bytes"
  echo "  Difference:    $SIZE_DIFF bytes"
  echo "  Reduction:     $REDUCTION bytes ($PERCENT%)"

  if [ ${SIZE_DIFF#-} -lt 500 ]; then
    echo "  ✓ Size within acceptable range (±500 bytes)"
  else
    echo "  ⚠ Size differs significantly from expected"
  fi

  # Check expected import files exist
  if [ -d "$TEST_DIR/.claude/rules" ]; then
    echo
    echo "  Expected @import files:"
    for expected_file in "$FIXTURE_DIR/.expected/.claude/rules/"*.md; do
      filename=$(basename "$expected_file")
      if [ -f "$TEST_DIR/.claude/rules/$filename" ]; then
        echo "    ✓ $filename"
      else
        echo "    ✗ $filename (missing)"
      fi
    done
  fi
fi

echo
echo "Verification complete!"
echo
echo "Manual verification checklist:"
echo "- [ ] @import files created in .claude/rules/"
echo "- [ ] Generic React advice removed"
echo "- [ ] TypeScript style rules extracted"
echo "- [ ] Testing guidelines extracted"
echo "- [ ] CLAUDE.md focuses on project-specific content"
echo "- [ ] Skill explained WHY changes were needed"
echo "- [ ] Workflow felt natural and intuitive"
echo
