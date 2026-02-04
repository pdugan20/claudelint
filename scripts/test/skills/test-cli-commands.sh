#!/usr/bin/env bash
#
# Test that CLI commands referenced in skills exist and respond
#
# This script extracts claudelint commands from SKILL.md files
# and verifies each command exists and responds to --help
#

set -e

echo "Testing CLI commands referenced in skills..."
echo

failed=0

for skill_md in .claude/skills/*/SKILL.md; do
  skill_name=$(basename "$(dirname "$skill_md")")

  # Extract claudelint commands from skill (look for `claudelint <command>` patterns)
  commands=$(grep -o "claudelint [a-z-]*" "$skill_md" 2>/dev/null | awk '{print $2}' | sort -u)

  if [ -z "$commands" ]; then
    echo "  $skill_name: No CLI commands found (skipping)"
    continue
  fi

  echo "  $skill_name:"

  for cmd in $commands; do
    # Test command responds to --help
    if ./bin/claudelint "$cmd" --help >/dev/null 2>&1; then
      echo "    [PASS] claudelint $cmd"
    else
      echo "    [FAIL] claudelint $cmd (command not found or --help failed)"
      failed=1
    fi
  done
done

echo

if [ $failed -eq 0 ]; then
  echo "[SUCCESS] All CLI commands exist and respond"
  exit 0
else
  echo "[FAIL] Some CLI commands are missing or broken"
  exit 1
fi
