#!/usr/bin/env bash
#
# Cleanup for Task 2: optimize-cc-md (Phase 2)
#

set -e

TEST_DIR="/tmp/claudelint-test-2"

echo "Cleaning up Task 2 test workspace..."

if [ -d "$TEST_DIR" ]; then
  rm -rf "$TEST_DIR"
  echo "✓ Removed $TEST_DIR"
else
  echo "⚠ Test directory not found (already cleaned?)"
fi

echo "Cleanup complete!"
