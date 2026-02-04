#!/usr/bin/env bash
#
# Setup for Task 6: Plugin Installation & Integration
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

echo "Setting up Task 6: Plugin Installation & Integration"
echo

cd "$REPO_ROOT"

echo "Building package..."
npm run build

echo
echo "Setup complete!"
echo
echo "Next steps:"
echo
echo "6.1: Install plugin"
echo "  /plugin install --source ."
echo
echo "6.2: Verify skills load"
echo "  /skills list | grep claudelint"
echo "  (Should show 9 skills)"
echo
echo "6.3: Test one skill"
echo "  /claudelint:validate-all"
echo
echo "6.4: Test dependency detection"
echo "  npm uninstall claude-code-lint"
echo "  /claudelint:validate-all"
echo "  (Should show helpful error)"
echo "  npm install"
echo
echo "6.5: Verify package contents"
echo "  npm pack --dry-run"
echo "  (Check size and contents)"
echo
echo "Run: ./scripts/test/manual/verify-task-6.sh when done"
echo
