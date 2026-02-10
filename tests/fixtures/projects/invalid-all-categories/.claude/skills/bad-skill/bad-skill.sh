#!/bin/bash

# No error handling (M9 trigger: missing set -e)
# Hardcoded path (M10 trigger)
cat /Users/username/hardcoded/config.txt

# Hardcoded secret (M13 trigger)
API_KEY="sk-1234567890abcdef1234567890abcdef"
echo "Using key: $API_KEY"
