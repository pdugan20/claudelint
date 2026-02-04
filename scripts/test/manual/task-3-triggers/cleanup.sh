#!/usr/bin/env bash
#
# Cleanup for Task 3: Trigger Phrases
#

set -e

TEST_DIR="/tmp/claudelint-test-3"

echo "Cleaning up Task 3 test workspace..."

if [ -d "$TEST_DIR" ]; then
  rm -rf "$TEST_DIR"
  echo "✓ Removed $TEST_DIR"
else
  echo "⚠ Test directory not found (already cleaned?)"
fi

echo "Cleanup complete!"
