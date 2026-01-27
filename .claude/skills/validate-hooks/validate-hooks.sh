#!/bin/bash
# Validate Claude hooks

set -e

# Run claudelint validate-hooks with provided arguments
claudelint validate-hooks "$@"
