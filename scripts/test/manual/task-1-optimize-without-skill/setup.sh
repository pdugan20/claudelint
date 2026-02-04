#!/usr/bin/env bash
#
# Setup for Task 1: optimize-cc-md (Phase 1 - Without Skill)
#
# Creates test workspace with bloated CLAUDE.md for testing
# the natural workflow WITHOUT the skill loaded.
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
TEST_DIR="/tmp/claudelint-test-1"

echo "Setting up Task 1: optimize-cc-md (Phase 1 - Without Skill)"
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
echo "1. Open a NEW Claude Code session (separate from this one)"
echo "2. cd $TEST_DIR"
echo "3. Ask Claude to help optimize CLAUDE.md (WITHOUT triggering the skill)"
echo "4. Try prompts like:"
echo "   - 'Help me optimize my CLAUDE.md file'"
echo "   - 'My CLAUDE.md is bloated, can you help fix it?'"
echo "   - 'This config file is too long, what should I do?'"
echo "5. Document the winning approach"
echo "6. Run: ./scripts/test/manual/verify-task-1.sh"
echo
