#!/usr/bin/env bash
#
# Setup for Task 2: optimize-cc-md (With Skill Loaded)
#
# Creates test workspace with realistic React + TypeScript project
# and installs claudelint plugin for testing optimize-cc-md skill.
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
LIB_DIR="$SCRIPT_DIR/../lib"
TEST_DIR="/tmp/claudelint-test-2"

echo "Setting up Task 2: optimize-cc-md (With Skill Loaded)"
echo

# Step 1: Build and pack claudelint
source "$LIB_DIR/build-package.sh"

# Step 2: Clean up any existing test directory
if [ -d "$TEST_DIR" ]; then
  echo "Removing existing test directory..."
  rm -rf "$TEST_DIR"
fi

# Step 3: Copy fixture to test directory (exclude .expected/ test artifacts)
echo "Copying react-typescript-bloated fixture..."
rsync -a --exclude='.expected' "$REPO_ROOT/tests/fixtures/projects/react-typescript-bloated/" "$TEST_DIR/"

# Step 4: Install claudelint in test workspace
"$LIB_DIR/install-in-workspace.sh" "$TEST_DIR" "$PACKAGE_TGZ"

# Step 5: Verify setup
echo
echo "Setup complete!"
echo
echo "Test workspace: $TEST_DIR"
echo "CLAUDE.md size: $(wc -c < "$TEST_DIR/CLAUDE.md") bytes"
echo
echo "Next steps:"
echo "1. Start Claude Code with the plugin loaded:"
echo "   cd $TEST_DIR"
echo "   claude --plugin-dir $REPO_ROOT"
echo
echo "2. Verify skills are loaded:"
echo "   /skills list"
echo "   (Should see 9 claudelint skills)"
echo
echo "3. Trigger the optimize-cc-md skill:"
echo "   - 'optimize my CLAUDE.md'"
echo "   - 'can you help me improve my CLAUDE.md file?'"
echo "   - 'this config file is too long'"
echo
echo "4. Observe the skill behavior (should use @imports)"
echo
echo "5. Run verification:"
echo "   ./scripts/test/manual/task-2-optimize-with-skill/verify.sh"
echo
