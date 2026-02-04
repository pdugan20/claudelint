#!/usr/bin/env bash
#
# Setup for Task 1: optimize-cc-md (Phase 1 - Without Skill)
#
# Creates test workspace with realistic project for testing
# the natural workflow WITHOUT the optimize-cc-md skill loaded.
#
# Key difference from Task 2: NO plugin installed, NO skill loaded
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
TEST_DIR="/tmp/claudelint-test-1"
FIXTURE_DIR="$REPO_ROOT/tests/fixtures/projects/react-typescript-bloated"

echo "Setting up Task 1: optimize-cc-md (Phase 1 - Without Skill)"
echo

# Clean up any existing test directory
if [ -d "$TEST_DIR" ]; then
  echo "Removing existing test directory..."
  rm -rf "$TEST_DIR"
fi

# Copy entire fixture project
echo "Copying react-typescript-bloated fixture..."
cp -r "$FIXTURE_DIR" "$TEST_DIR"

# Install fixture dependencies (makes it a real project)
echo "Installing fixture dependencies..."
cd "$TEST_DIR"
npm install --silent

# Verify setup
if [ ! -f "$TEST_DIR/CLAUDE.md" ]; then
  echo "ERROR: Failed to copy CLAUDE.md"
  exit 1
fi

if [ ! -d "$TEST_DIR/node_modules" ]; then
  echo "ERROR: npm install failed"
  exit 1
fi

FILE_SIZE=$(wc -c < "$TEST_DIR/CLAUDE.md")
echo "CLAUDE.md size: $FILE_SIZE bytes"

echo
echo "Setup complete!"
echo "Test workspace: $TEST_DIR"
echo
echo "What was set up:"
echo "  ✓ Real React + TypeScript project"
echo "  ✓ Bloated CLAUDE.md (~13KB)"
echo "  ✓ Project dependencies installed"
echo "  ✗ NO claudelint plugin (intentional - testing natural workflow)"
echo "  ✗ NO optimize-cc-md skill (intentional - baseline behavior)"
echo
echo "Next steps:"
echo "1. Open a NEW Claude Code session (separate from this one)"
echo "2. cd $TEST_DIR"
echo "3. Ask Claude to help optimize CLAUDE.md (WITHOUT triggering any skill)"
echo "4. Try prompts like:"
echo "   - 'Help me optimize my CLAUDE.md file'"
echo "   - 'My CLAUDE.md is bloated, can you help fix it?'"
echo "   - 'This config file is too long, what should I do?'"
echo "5. Document the winning approach and what Claude does naturally"
echo "6. Run: ./scripts/test/manual/task-1-optimize-without-skill/verify.sh"
echo
echo "Note: This tests the BASELINE (no skill). Compare with Task 2 (with skill)."
echo
