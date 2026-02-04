#!/bin/bash
#
# Check for console usage in library code and scripts
# Enforces consistent logging architecture:
#   - Library code (src/): Use DiagnosticCollector
#   - CLI layer (src/cli/, src/utils/reporting/): Can use console
#   - Scripts (scripts/): Use logger from scripts/util/logger.ts

set -e

ERRORS=0

echo "Checking for direct console usage..."

# Pattern 1: Check library code (src/) for console usage
# Allowed files: CLI logger and output formatting layer
# Filter out JSDoc comment lines (lines containing just whitespace and * before console)
CONSOLE_MATCHES=$(grep -rn "console\." src/ --include="*.ts" \
  --exclude="logger.ts" \
  --exclude="reporting.ts" \
  --exclude="progress.ts" 2>/dev/null | \
  grep -v ':\s*\*.*console\.' || true)

if [ -n "$CONSOLE_MATCHES" ]; then
  echo "$CONSOLE_MATCHES"
  echo ""
  echo "ERROR: Found console usage in library code (src/)"
  echo "Library code must not use console directly"
  echo ""
  echo "Use DiagnosticCollector instead:"
  echo "  import { DiagnosticCollector } from '../utils/diagnostics';"
  echo "  // In constructor:"
  echo "  constructor(private diagnostics?: DiagnosticCollector) {}"
  echo "  // To report warnings:"
  echo "  this.diagnostics?.warn('message', 'ComponentName', 'CODE');"
  echo ""
  echo "Allowed console usage:"
  echo "  - src/cli/utils/logger.ts (CLI logger implementation)"
  echo "  - src/utils/reporting/reporting.ts (output formatting)"
  echo "  - src/utils/reporting/progress.ts (progress display)"
  echo ""
  ERRORS=$((ERRORS + 1))
fi

# Pattern 2: Check scripts/ for console usage (excluding logger.ts)
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
  echo "✓ No inappropriate console or chalk usage found"
  exit 0
else
  echo ""
  echo "Found $ERRORS violation(s)"
  echo ""
  echo "Logging Architecture:"
  echo "  Library (src/)      → DiagnosticCollector (collect warnings/errors)"
  echo "  CLI (src/cli/)      → CLI Logger (format and print)"
  echo "  Scripts (scripts/)  → Script Logger (import from scripts/util/logger.ts)"
  echo ""
  echo "For library code fixes:"
  echo "  - Add diagnostics?: DiagnosticCollector parameter"
  echo "  - Replace console.warn with diagnostics?.warn('msg', 'Source', 'CODE')"
  echo "  - Replace console.error with diagnostics?.error('msg', 'Source', 'CODE')"
  echo ""
  echo "For script fixes:"
  echo "  - Replace console.log with log.info()"
  echo "  - Replace console.error with log.error()"
  echo "  - Replace chalk.green(...) with log.success(...)"
  echo "  - See scripts/util/logger.ts for full API"
  exit 1
fi
