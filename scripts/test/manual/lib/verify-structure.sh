#!/usr/bin/env bash
#
# Common verification checks for optimized CLAUDE.md
#
# Usage: verify-structure.sh <workspace-path>

set -e

WORKSPACE=$1

if [ -z "$WORKSPACE" ]; then
  echo "ERROR: Missing workspace path"
  echo "Usage: $0 <workspace-path>"
  exit 1
fi

if [ ! -d "$WORKSPACE" ]; then
  echo "ERROR: Workspace not found: $WORKSPACE"
  exit 1
fi

cd "$WORKSPACE"

# Check CLAUDE.md exists
if [ ! -f "CLAUDE.md" ]; then
  echo "✗ CLAUDE.md not found"
  exit 1
fi

echo "✓ CLAUDE.md exists"

# Check file size
FILE_SIZE=$(wc -c < "CLAUDE.md")
echo "  Size: $FILE_SIZE bytes"

# Check .claude/rules/ directory
if [ -d ".claude/rules" ]; then
  echo "✓ .claude/rules/ directory exists"
  IMPORT_COUNT=$(find .claude/rules -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
  echo "  Import files: $IMPORT_COUNT"
else
  echo "  (No .claude/rules/ directory)"
fi

# Validate CLAUDE.md syntax (basic check for @import)
if grep -q "@import" CLAUDE.md 2>/dev/null; then
  echo "✓ CLAUDE.md contains @import directives"
  IMPORT_REF_COUNT=$(grep -c "@import" CLAUDE.md)
  echo "  @import count: $IMPORT_REF_COUNT"
else
  echo "  (No @import directives found)"
fi

echo
echo "Verification complete!"
