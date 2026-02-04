#!/bin/bash
#
# Check for manual formatting in logger calls
# Enforces consistent use of logger methods without manual \n, empty strings, or leading spaces

set -e

ERRORS=0

echo "Checking for manual formatting in logger calls..."

# Pattern 1: logger.method('  ...')
if grep -rn "logger\.\(log\|info\|warn\|error\)(['\"]  " src/cli/ --exclude-dir=node_modules --exclude=logger.ts; then
  echo "ERROR: Found logger calls with hardcoded 2+ spaces"
  echo "Use logger.detail() instead of logger.log('  ...')"
  ERRORS=$((ERRORS + 1))
fi

# Pattern 2: logger.method(\`  ...\`) - template literals with spaces
if grep -rn 'logger\.\(log\|info\|warn\|error\)(`  ' src/cli/ --exclude-dir=node_modules --exclude=logger.ts; then
  echo "ERROR: Found logger calls with hardcoded 2+ spaces in template literals"
  echo "Use logger.detail() instead of logger.log(\`  ...\`)"
  ERRORS=$((ERRORS + 1))
fi

# Pattern 3: Manual \n in logger calls
if grep -rn 'logger\.\(log\|info\|warn\|error\|success\|section\|detail\).*\\n' src/cli/ --exclude-dir=node_modules --exclude=logger.ts; then
  echo "ERROR: Found logger calls with manual \\n newlines"
  echo "Use logger.newline() instead of \\n"
  ERRORS=$((ERRORS + 1))
fi

# Pattern 4: Empty strings '' or "" in logger calls
if grep -rn "logger\.\(log\|info\|warn\|error\|success\|section\|detail\)(['\"]\"')" src/cli/ --exclude-dir=node_modules --exclude=logger.ts; then
  echo "ERROR: Found logger calls with empty strings"
  echo "Use logger.newline() instead of logger.log('')"
  ERRORS=$((ERRORS + 1))
fi

# Pattern 5: Manual \n in script logger (log.*) calls in scripts/
if grep -rn 'log\.\(info\|error\|success\|warn\|dim\|bold\).*\\n' scripts/ --include="*.ts" --exclude=logger.ts 2>/dev/null; then
  echo "ERROR: Found log calls with manual \\n newlines in scripts/"
  echo "Use log.blank() instead of \\n"
  ERRORS=$((ERRORS + 1))
fi

# Pattern 6: Hardcoded spacing in script logger calls in scripts/
if grep -rn "log\.\(info\|error\|success\|warn\|dim\|bold\)(['\"]  " scripts/ --include="*.ts" --exclude=logger.ts 2>/dev/null; then
  echo "ERROR: Found log calls with hardcoded 2+ spaces in scripts/"
  echo "Use log.dim() for indented output instead"
  ERRORS=$((ERRORS + 1))
fi

# Exceptions (allowed patterns):
# - logger.ts itself (contains the implementation and documentation)
# - Comments and documentation

if [ $ERRORS -eq 0 ]; then
  echo "No manual formatting found in logger calls"
  exit 0
else
  echo ""
  echo "Found $ERRORS violation(s)"
  echo ""
  echo "Fixes:"
  echo "  - Use logger.detail() for indented output (not '  ...')"
  echo "  - Use logger.newline() for blank lines (not \\n or '')"
  exit 1
fi
