#!/usr/bin/env bash
#
# Verify Task 4: Functional Testing
#

set -e

TEST_DIR="/tmp/claudelint-test-4"

echo "Verifying Task 4 results..."
echo

if [ ! -d "$TEST_DIR" ]; then
  echo "ERROR: Test directory not found"
  echo "Run setup-task-4.sh first"
  exit 1
fi

echo "✓ Test workspaces exist"

echo
echo "Manual verification checklist:"
echo
echo "Test 4.1: validate-all"
echo "  - [ ] Command executed successfully"
echo "  - [ ] Output was conversational"
echo "  - [ ] No error dumps"
echo
echo "Test 4.2: validate-cc-md"
echo "  - [ ] Valid file passed"
echo "  - [ ] Oversized file detected"
echo "  - [ ] Circular import detected"
echo "  - [ ] Explanations were clear"
echo
echo "Test 4.3: optimize-cc-md"
echo "  - [ ] Bloat detected"
echo "  - [ ] Suggestions made sense"
echo "  - [ ] Changes actually made"
echo "  - [ ] Before/after shown"
echo
echo "Verification complete!"
