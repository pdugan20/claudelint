#!/usr/bin/env bash
#
# Dogfood: Validate bundled skills using claudelint itself
#
# This script validates all skills bundled with the claudelint plugin
# using claudelint's own validation rules. If our tool can't validate
# our own skills correctly, we have a problem with the tool itself.
#

set -e

echo "Validating bundled skills (dogfooding)..."
echo

# Validate all bundled skills
./bin/claudelint validate-skills .claude/skills/

exit_code=$?

if [ $exit_code -eq 0 ]; then
  echo
  echo "[SUCCESS] All bundled skills pass validation"
  exit 0
else
  echo
  echo "[FAIL] Some bundled skills have validation errors"
  exit 1
fi
