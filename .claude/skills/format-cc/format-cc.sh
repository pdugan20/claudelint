#!/bin/bash
# Format Claude Code files

set -e

# Default to --fix mode if no arguments
if [ $# -eq 0 ]; then
  claudelint format --fix
else
  claudelint format "$@"
fi
