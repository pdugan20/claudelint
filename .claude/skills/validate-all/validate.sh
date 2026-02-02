#!/bin/bash
# Run comprehensive claudelint validation

set -e

# Parse arguments
ARGS=("$@")

# Run claudelint check-all with provided arguments
claudelint check-all "${ARGS[@]}"
