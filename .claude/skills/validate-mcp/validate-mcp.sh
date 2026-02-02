#!/bin/bash
# Validate MCP server configuration
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

# Run claudelint validate-mcp
npx claude-code-lint validate-mcp "$@"
