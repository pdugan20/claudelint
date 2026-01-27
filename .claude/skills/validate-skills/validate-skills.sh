#!/bin/bash
# Validate Claude skills

set -e

# Run claudelint validate-skills with provided arguments
claudelint validate-skills "$@"
