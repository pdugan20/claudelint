#!/bin/bash
# Validate CLAUDE.md files
set -e

# Check dependencies
if ! command -v npx &> /dev/null; then
    echo "Error: npx not found"
    echo "Install Node.js from: https://nodejs.org"
    exit 1
fi

if ! npx --no-install claude-code-lint --version &> /dev/null; then
    echo "Error: claude-code-lint not installed"
    echo "Install: npm install --save-dev claude-code-lint"
    exit 1
fi

# Run claudelint check-claude-md
npx claude-code-lint check-claude-md "$@"
