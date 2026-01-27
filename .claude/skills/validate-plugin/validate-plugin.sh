#!/bin/bash
# Validate Claude plugin manifests

set -e

# Run claudelint validate-plugin with provided arguments
claudelint validate-plugin "$@"
