#!/bin/bash
set -euo pipefail

# Runs the test suite
npm test -- "$@"
