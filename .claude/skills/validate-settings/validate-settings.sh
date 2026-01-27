#!/bin/bash
# Validate Claude settings

set -e

# Run claudelint validate-settings with provided arguments
claudelint validate-settings "$@"
