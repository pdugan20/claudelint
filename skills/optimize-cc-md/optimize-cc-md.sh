#!/bin/bash
# Interactive CLAUDE.md optimization skill
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

# This is an interactive skill - the script acknowledges invocation
# The actual work is done by Claude following SKILL.md instructions
echo "Starting interactive CLAUDE.md optimization..."
echo ""
echo "This skill will:"
echo "  1. Run validation to identify issues"
echo "  2. Explain problems conversationally"
echo "  3. Ask what you want to fix"
echo "  4. Make the changes"
echo "  5. Show results"
echo ""
echo "Let's analyze your CLAUDE.md file..."
