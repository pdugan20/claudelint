#!/usr/bin/env bash
#
# Build and pack claudelint for testing
#
# Usage: source build-package.sh
# Sets: PACKAGE_TGZ environment variable

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

echo "Building claudelint package..."
cd "$REPO_ROOT"

# Clean and build
npm run clean
npm run build

# Create package
echo "Creating package..."
PACKAGE_TGZ=$(npm pack 2>/dev/null | head -1)

if [ -z "$PACKAGE_TGZ" ]; then
  echo "ERROR: npm pack failed to create package"
  exit 1
fi

# Get absolute path
PACKAGE_TGZ="$REPO_ROOT/$PACKAGE_TGZ"

if [ ! -f "$PACKAGE_TGZ" ]; then
  echo "ERROR: Package file not found"
  echo "  Expected: $PACKAGE_TGZ"
  exit 1
fi

echo "Package created: $PACKAGE_TGZ"
export PACKAGE_TGZ
