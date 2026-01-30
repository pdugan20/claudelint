#!/bin/bash
#
# Check for hardcoded spaces at the start of logger calls
# Enforces use of logger.detail() instead of logger.log('  ...')

set -e

ERRORS=0

# Check for logger calls with 2+ spaces at the start
echo "Checking for hardcoded spaces in logger calls..."

# Pattern 1: logger.method('  ...')
if grep -rn "logger\.\(log\|info\|warn\|error\)(['\"]  " src/cli/ --exclude-dir=node_modules --exclude=logger.ts; then
  echo "ERROR: Found logger calls with hardcoded 2+ spaces"
  echo "Use logger.detail() instead of logger.log('  ...')"
  ERRORS=$((ERRORS + 1))
fi

# Pattern 2: logger.method(\`  ...\`) - template literals
if grep -rn 'logger\.\(log\|info\|warn\|error\)(`  ' src/cli/ --exclude-dir=node_modules --exclude=logger.ts; then
  echo "ERROR: Found logger calls with hardcoded 2+ spaces in template literals"
  echo "Use logger.detail() instead of logger.log(\`  ...\`)"
  ERRORS=$((ERRORS + 1))
fi

# Exceptions (allowed patterns):
# - logger.ts itself (contains the implementation and documentation)
# - Comments and documentation

if [ $ERRORS -eq 0 ]; then
  echo "No hardcoded spacing found in logger calls"
  exit 0
else
  echo ""
  echo "Found $ERRORS violation(s)"
  echo "Fix by using logger.detail() for indented output"
  exit 1
fi
