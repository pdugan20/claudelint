#!/usr/bin/env bash
#
# Verify Task 2: optimize-cc-md (Phase 2 - With Skill)
#
# Checks that the skill executed correctly and made expected changes.
#

set -e

TEST_DIR="/tmp/claudelint-test-2"
ORIGINAL_SIZE=12679

echo "Verifying Task 2 results..."
echo

# Check test directory exists
if [ ! -d "$TEST_DIR" ]; then
  echo "ERROR: Test directory not found: $TEST_DIR"
  echo "Run setup-task-2.sh first"
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
  echo "Found $IMPORT_COUNT @import files"
fi

echo
echo "Verification complete!"
echo
echo "Manual checks:"
echo "- [ ] Skill triggered on appropriate prompts"
echo "- [ ] Ran claudelint check-claude-md first"
echo "- [ ] Read CLAUDE.md with Read tool"
echo "- [ ] Explained issues conversationally"
echo "- [ ] Used Edit/Write tools to make changes"
echo "- [ ] Referenced references/ docs when helpful"
echo "- [ ] Workflow matched Task 1 winning approach"
echo "- [ ] UX felt natural and helpful"
echo
