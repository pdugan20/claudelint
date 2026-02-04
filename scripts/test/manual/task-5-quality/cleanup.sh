#!/usr/bin/env bash
#
# Cleanup for Task 5: Quality & UX Testing
#

set -e

TEST_DIR="/tmp/claudelint-test-5"

echo "Cleaning up Task 5 test workspace..."

if [ -d "$TEST_DIR" ]; then
  rm -rf "$TEST_DIR"
  echo "✓ Removed $TEST_DIR"
else
  echo "⚠ Test directory not found (already cleaned?)"
fi

echo "Cleanup complete!"
