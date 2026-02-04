#!/usr/bin/env bash
#
# Cleanup for Task 4: Functional Testing
#

set -e

TEST_DIR="/tmp/claudelint-test-4"

echo "Cleaning up Task 4 test workspace..."

if [ -d "$TEST_DIR" ]; then
  rm -rf "$TEST_DIR"
  echo "✓ Removed $TEST_DIR"
else
  echo "⚠ Test directory not found (already cleaned?)"
fi

echo "Cleanup complete!"
