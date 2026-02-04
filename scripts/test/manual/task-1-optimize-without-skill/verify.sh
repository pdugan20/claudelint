#!/usr/bin/env bash
#
# Verify Task 1: optimize-cc-md (Phase 1 - Without Skill)
#
# Checks that the test workspace shows expected changes after manual testing.
#

set -e

TEST_DIR="/tmp/claudelint-test-1"
ORIGINAL_SIZE=12679  # Size of bloated-realistic.md

echo "Verifying Task 1 results..."
echo

# Check test directory exists
if [ ! -d "$TEST_DIR" ]; then
  echo "ERROR: Test directory not found: $TEST_DIR"
  echo "Run setup-task-1.sh first"
  exit 1
fi

# Check CLAUDE.md exists
if [ ! -f "$TEST_DIR/CLAUDE.md" ]; then
  echo "ERROR: CLAUDE.md not found in test directory"
  exit 1
fi

# Check file size
CURRENT_SIZE=$(wc -c < "$TEST_DIR/CLAUDE.md")
echo "Original size: $ORIGINAL_SIZE bytes"
echo "Current size:  $CURRENT_SIZE bytes"

if [ "$CURRENT_SIZE" -eq "$ORIGINAL_SIZE" ]; then
  echo "WARNING: File size unchanged - was CLAUDE.md modified?"
fi

if [ "$CURRENT_SIZE" -lt "$ORIGINAL_SIZE" ]; then
  REDUCTION=$(( ORIGINAL_SIZE - CURRENT_SIZE ))
  PERCENT=$(( REDUCTION * 100 / ORIGINAL_SIZE ))
  echo "Size reduction: $REDUCTION bytes ($PERCENT%)"

  if [ "$PERCENT" -gt 50 ]; then
    echo "✓ Good reduction (>50%)"
  else
    echo "⚠ Modest reduction (<50%)"
  fi
fi

# Check for @import files
if [ -d "$TEST_DIR/.claude/rules" ]; then
  IMPORT_COUNT=$(find "$TEST_DIR/.claude/rules" -name "*.md" | wc -l)
  echo "Found $IMPORT_COUNT @import files in .claude/rules/"
fi

# List all files
echo
echo "Files in test directory:"
find "$TEST_DIR" -type f | sed "s|$TEST_DIR/||" | sort

echo
echo "Verification complete!"
echo
echo "Manual checks:"
echo "- [ ] Generic advice removed or moved to @imports"
echo "- [ ] File is more focused on project-specific content"
echo "- [ ] Workflow felt natural and intuitive"
echo "- [ ] Documented winning approach for Task 2 comparison"
echo
