#!/usr/bin/env bash
#
# Cleanup for Task 1: optimize-cc-md (Phase 1)
#
# Removes test workspace after testing is complete.
#

set -e

TEST_DIR="/tmp/claudelint-test-1"

echo "Cleaning up Task 1 test workspace..."

if [ -d "$TEST_DIR" ]; then
  rm -rf "$TEST_DIR"
  echo "✓ Removed $TEST_DIR"
else
  echo "⚠ Test directory not found (already cleaned?)"
fi

echo "Cleanup complete!"
