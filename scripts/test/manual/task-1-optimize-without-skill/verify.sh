#!/usr/bin/env bash
#
# Verify Task 1: optimize-cc-md (Phase 1 - Without Skill)
#
# Checks the test workspace after manual testing WITHOUT the skill.
# This establishes baseline behavior for comparison with Task 2 (with skill).
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
TEST_DIR="/tmp/claudelint-test-1"
FIXTURE_DIR="$REPO_ROOT/tests/fixtures/projects/react-typescript-bloated"

echo "Verifying Task 1 results (Baseline - Without Skill)..."
echo

# Check test directory exists
if [ ! -d "$TEST_DIR" ]; then
  echo "ERROR: Test directory not found: $TEST_DIR"
  echo "Run setup.sh first"
  exit 1
fi

# Check CLAUDE.md exists
if [ ! -f "$TEST_DIR/CLAUDE.md" ]; then
  echo "ERROR: CLAUDE.md not found in test directory"
  exit 1
fi

# Get sizes
ORIGINAL_SIZE=$(wc -c < "$FIXTURE_DIR/CLAUDE.md")
CURRENT_SIZE=$(wc -c < "$TEST_DIR/CLAUDE.md")

echo "File Size Analysis:"
echo "  Original size: $ORIGINAL_SIZE bytes (~13KB)"
echo "  Current size:  $CURRENT_SIZE bytes"

if [ "$CURRENT_SIZE" -eq "$ORIGINAL_SIZE" ]; then
  echo "  WARNING: File size unchanged - was CLAUDE.md modified?"
  echo
elif [ "$CURRENT_SIZE" -lt "$ORIGINAL_SIZE" ]; then
  REDUCTION=$(( ORIGINAL_SIZE - CURRENT_SIZE ))
  PERCENT=$(( REDUCTION * 100 / ORIGINAL_SIZE ))
  echo "  Size reduction: $REDUCTION bytes ($PERCENT%)"
  echo

  if [ "$PERCENT" -gt 70 ]; then
    echo "  ✓ Excellent reduction (>70%)"
  elif [ "$PERCENT" -gt 50 ]; then
    echo "  ✓ Good reduction (>50%)"
  else
    echo "  INFO: Modest reduction (<50%)"
  fi
  echo
fi

# Check for @import files
echo "@import Usage:"
if [ -d "$TEST_DIR/.claude/rules" ]; then
  IMPORT_COUNT=$(find "$TEST_DIR/.claude/rules" -name "*.md" 2>/dev/null | wc -l)
  echo "  Found $IMPORT_COUNT @import files in .claude/rules/"
  if [ "$IMPORT_COUNT" -gt 0 ]; then
    find "$TEST_DIR/.claude/rules" -name "*.md" | sed "s|$TEST_DIR/||" | sed 's/^/    - /'
  fi
else
  echo "  No .claude/rules/ directory created"
  echo "  NOTE: Natural workflow may not know about @imports"
fi
echo

# Check for @import directives in CLAUDE.md
IMPORT_LINES=$(grep -c "^@import" "$TEST_DIR/CLAUDE.md" 2>/dev/null || echo "0")
echo "  @import directives in CLAUDE.md: $IMPORT_LINES"
echo

# List modified files (excluding node_modules)
echo "Modified Files:"
find "$TEST_DIR" -type f \( -name "*.md" -o -name "*.json" -o -name "*.tsx" -o -name "*.ts" \) \
  ! -path "*/node_modules/*" ! -path "*/.expected/*" \
  | sed "s|$TEST_DIR/||" | sort | sed 's/^/  - /'

echo
echo "Verification complete!"
echo
echo "Baseline Behavior Documentation Checklist:"
echo "- [ ] Document what Claude did naturally (approach, steps, results)"
echo "- [ ] Note if Claude created @imports (natural workflow may not know about them)"
echo "- [ ] Record size reduction percentage achieved"
echo "- [ ] Document how many prompts were needed"
echo "- [ ] Note any issues or confusion in the workflow"
echo "- [ ] Save this as baseline for Task 2 comparison"
echo
echo "Key Finding from Previous Testing:"
echo "  Natural workflow achieved ~73% reduction but did NOT create @imports"
echo "  (Compare this with Task 2 which should use @imports for better organization)"
echo
