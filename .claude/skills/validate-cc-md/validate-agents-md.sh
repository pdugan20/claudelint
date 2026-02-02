#!/bin/bash
# Validate CLAUDE.md files

set -e

# Parse arguments
ARGS=("$@")

# Run claudelint check-claude-md with provided arguments
claudelint check-claude-md "${ARGS[@]}"
