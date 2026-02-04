#!/usr/bin/env bash
#
# Cleanup for Task 6: Plugin Installation & Integration
#

set -e

echo "Cleaning up Task 6..."

# Remove temp file
if [ -f "/tmp/npm-pack-output.txt" ]; then
  rm /tmp/npm-pack-output.txt
  echo "✓ Removed temp files"
fi

echo "Cleanup complete!"
echo
echo "Note: Plugin remains installed. To uninstall:"
echo "  /plugin uninstall claudelint"
