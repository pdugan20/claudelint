#!/bin/bash
#
# Check for console and direct chalk usage in scripts
# Enforces consistent use of logger utility from scripts/util/logger.ts

set -e

ERRORS=0

echo "Checking for direct console/chalk usage in scripts..."

# Pattern 1: Check for console usage (excluding logger.ts)
if grep -rn "console\." scripts/ --include="*.ts" --exclude="logger.ts" 2>/dev/null; then
  echo ""
  echo "ERROR: Found console usage in scripts"
  echo "Import and use logger from scripts/util/logger.ts instead"
  echo ""
  echo "Example:"
  echo "  import { log } from '../util/logger';"
  echo "  log.success('All done!');"
  echo ""
  ERRORS=$((ERRORS + 1))
fi

# Pattern 2: Check for direct chalk wrapping (excluding logger.ts)
CHALK_MATCHES=$(grep -rn "chalk\.\(red\|green\|yellow\|blue\|gray\|bold\)(" scripts/ --include="*.ts" --exclude="logger.ts" 2>/dev/null || true)
if [ -n "$CHALK_MATCHES" ]; then
  echo "$CHALK_MATCHES"
  echo ""
  echo "ERROR: Found direct chalk usage in scripts"
  echo "Use logger methods instead (log.success, log.error, log.dim, etc.)"
  echo ""
  echo "Example:"
  echo "  // Bad:  console.log(chalk.green('Success'));"
  echo "  // Good: log.success('Success');"
  echo ""
  ERRORS=$((ERRORS + 1))
fi

if [ $ERRORS -eq 0 ]; then
  echo "No direct console or chalk usage found"
  exit 0
else
  echo "Found $ERRORS violation(s)"
  echo ""
  echo "Fixes:"
  echo "  - Replace console.log with log.info()"
  echo "  - Replace console.error with log.error()"
  echo "  - Replace chalk.green(...) with log.success(...)"
  echo "  - See scripts/util/logger.ts for full API"
  exit 1
fi
