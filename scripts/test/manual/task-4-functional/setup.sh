#!/usr/bin/env bash
#
# Setup for Task 4: Functional Testing for Key Skills
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
TEST_DIR="/tmp/claudelint-test-4"

echo "Setting up Task 4: Functional Testing"
echo

# Clean up existing
if [ -d "$TEST_DIR" ]; then
  rm -rf "$TEST_DIR"
fi

# Create test workspaces
mkdir -p "$TEST_DIR/claude-md-tests"
mkdir -p "$TEST_DIR/optimize-test"
mkdir -p "$TEST_DIR/fixtures"

# Copy fixtures
echo "Copying test fixtures..."
cp -r "$REPO_ROOT/tests/fixtures/claude-md/"* "$TEST_DIR/fixtures/"
cp "$REPO_ROOT/tests/fixtures/manual/bloated-realistic.md" "$TEST_DIR/fixtures/"

echo "Test workspaces created:"
echo "  - $TEST_DIR/claude-md-tests (for validate-cc-md)"
echo "  - $TEST_DIR/optimize-test (for optimize-cc-md)"
echo "  - $TEST_DIR/fixtures (reference files)"

echo
echo "Next steps:"
echo
echo "Test 4.1: validate-all (from repo root)"
echo "  cd $REPO_ROOT"
echo "  /claudelint:validate-all"
echo
echo "Test 4.2: validate-cc-md with fixtures"
echo "  cd $TEST_DIR/claude-md-tests"
echo "  cp ../fixtures/valid.md CLAUDE.md"
echo "  Ask: 'validate my CLAUDE.md'"
echo "  Then test: oversized.md, circular-import.md"
echo
echo "Test 4.3: optimize-cc-md"
echo "  cd $TEST_DIR/optimize-test"
echo "  cp ../fixtures/bloated-realistic.md CLAUDE.md"
echo "  Ask: 'optimize my CLAUDE.md'"
echo
echo "Run: ./scripts/test/manual/verify-task-4.sh when done"
echo
