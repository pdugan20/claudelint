#!/bin/bash
# Format Claude Code files
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

# Default to --fix mode if no arguments
if [ $# -eq 0 ]; then
    npx claude-code-lint format --fix
else
    npx claude-code-lint format "$@"
fi
