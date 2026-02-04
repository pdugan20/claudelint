#!/usr/bin/env bash
#
# Setup for Task 2: optimize-cc-md (Phase 2 - With Skill)
#
# Creates test workspace with bloated CLAUDE.md for testing
# the optimize-cc-md skill WITH the skill loaded.
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
TEST_DIR="/tmp/claudelint-test-2"

echo "Setting up Task 2: optimize-cc-md (Phase 2 - With Skill)"
echo

# Clean up any existing test directory
if [ -d "$TEST_DIR" ]; then
  echo "Removing existing test directory..."
  rm -rf "$TEST_DIR"
fi

# Create fresh test directory
echo "Creating test workspace: $TEST_DIR"
mkdir -p "$TEST_DIR"

# Copy bloated CLAUDE.md fixture
echo "Copying bloated CLAUDE.md fixture..."
cp "$REPO_ROOT/tests/fixtures/manual/bloated-realistic.md" "$TEST_DIR/CLAUDE.md"

# Verify setup
if [ ! -f "$TEST_DIR/CLAUDE.md" ]; then
  echo "ERROR: Failed to copy CLAUDE.md"
  exit 1
fi

FILE_SIZE=$(wc -c < "$TEST_DIR/CLAUDE.md")
echo "CLAUDE.md size: $FILE_SIZE bytes"

echo
echo "Setup complete!"
echo
echo "Next steps:"
echo "1. Verify plugin is installed: /plugin list | grep claudelint"
echo "2. Open a NEW Claude Code session WITH plugin enabled"
echo "3. cd $TEST_DIR"
echo "4. Trigger the optimize-cc-md skill with:"
echo "   - 'optimize my CLAUDE.md'"
echo "   - 'fix my config, it's too long'"
echo "   - 'help me clean up CLAUDE.md'"
echo "5. Compare workflow to Task 1 winning approach"
echo "6. Run: ./scripts/test/manual/verify-task-2.sh"
echo
