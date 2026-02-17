#!/bin/bash

# Setup git hooks for claudelint development
# Hooks are managed by Husky in .husky/ directory.
# This script ensures Husky is properly initialized.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Check if husky is installed
if [ ! -d "$PROJECT_ROOT/node_modules/husky" ]; then
  echo "Husky not installed yet (run npm install first). Skipping hook setup."
  exit 0
fi

# Initialize husky (sets core.hooksPath)
cd "$PROJECT_ROOT"
npx husky install .husky/_ 2>/dev/null || npx husky 2>/dev/null || true

echo "Git hooks configured via Husky."
echo ""
echo "Active hooks:"
echo "  .husky/pre-commit  - Smart pre-commit checks (lint-staged, build, dogfooding)"
echo "  .husky/commit-msg  - Conventional commit format validation (commitlint)"
echo "  .husky/pre-push    - Full test suite + claudelint dogfooding"
echo ""
echo "To skip hooks (not recommended): git commit --no-verify"
