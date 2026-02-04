#!/usr/bin/env bash
#
# Verify Task 3: Trigger Phrases
#

set -e

TEST_DIR="/tmp/claudelint-test-3"

echo "Verifying Task 3 results..."
echo

if [ -f "$TEST_DIR/trigger-test-matrix.md" ]; then
  echo "Test matrix exists: $TEST_DIR/trigger-test-matrix.md"
  echo
  echo "Manually verify:"
  echo "- [ ] Filled in all checkboxes in matrix"
  echo "- [ ] Calculated success rates"
  echo "- [ ] 90%+ trigger success rate achieved"
  echo "- [ ] No false positives (non-triggers)"
  echo
else
  echo "ERROR: Test matrix not found"
  echo "Run setup-task-3.sh first"
  exit 1
fi

echo "Verification complete!"
