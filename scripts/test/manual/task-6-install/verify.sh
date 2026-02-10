#!/usr/bin/env bash
#
# Verify Task 6: Plugin Installation & Integration
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

echo "Verifying Task 6 results..."
echo

cd "$REPO_ROOT"

# Check build exists
if [ ! -d "dist" ]; then
  echo "ERROR: dist/ directory not found"
  echo "Run: npm run build"
  exit 1
fi

echo "✓ Build exists"

# Check package contents
echo
echo "Checking package contents..."
npm pack --dry-run > /tmp/npm-pack-output.txt 2>&1

if grep -q "skills/" /tmp/npm-pack-output.txt; then
  echo "✓ skills/ directory included"
else
  echo "ERROR: skills/ directory not in package"
  exit 1
fi

if grep -q ".claude-plugin/" /tmp/npm-pack-output.txt; then
  echo "✓ .claude-plugin/ directory included"
else
  echo "ERROR: .claude-plugin/ directory not in package"
  exit 1
fi

if grep -q "bin/claudelint" /tmp/npm-pack-output.txt; then
  echo "✓ bin/claudelint included"
else
  echo "ERROR: bin/claudelint not in package"
  exit 1
fi

# Count SKILL.md files
SKILL_COUNT=$(grep -c "SKILL.md" /tmp/npm-pack-output.txt || true)
echo "SKILL.md files in package: $SKILL_COUNT"

if [ "$SKILL_COUNT" -eq 9 ]; then
  echo "✓ All 9 skills included"
else
  echo "WARNING: Expected 9 SKILL.md files, found $SKILL_COUNT"
fi

echo
echo "Manual verification checklist:"
echo "- [ ] Plugin installed successfully"
echo "- [ ] All 9 skills appear in /skills list"
echo "- [ ] Skills execute correctly"
echo "- [ ] Dependency error is helpful"
echo "- [ ] Package size is reasonable (<5MB)"
echo "- [ ] No unnecessary files in package"
echo
echo "Verification complete!"
