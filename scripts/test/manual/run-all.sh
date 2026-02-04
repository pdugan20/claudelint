#!/usr/bin/env bash
#
# Run All Manual Tests
#
# Executes all 6 manual testing tasks with automated setup/verification.
# Manual testing steps still required - this just automates the scaffolding.
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "================================================"
echo "Manual Testing Suite - claudelint Skills"
echo "================================================"
echo
echo "This script sets up all 6 manual testing tasks."
echo "You will still need to perform manual testing steps."
echo
read -p "Press ENTER to continue..."

# Task 1: optimize-cc-md (Without Skill)
echo
echo "=== Task 1: optimize-cc-md (Without Skill Loaded) ==="
"$SCRIPT_DIR/task-1-optimize-without-skill/setup.sh"
echo
echo "Perform manual testing as described above."
read -p "Press ENTER when Task 1 is complete..."
"$SCRIPT_DIR/task-1-optimize-without-skill/verify.sh"
read -p "Press ENTER to cleanup and continue..."
"$SCRIPT_DIR/task-1-optimize-without-skill/cleanup.sh"

# Task 2: optimize-cc-md (With Skill)
echo
echo "=== Task 2: optimize-cc-md (With Skill Loaded) ==="
"$SCRIPT_DIR/task-2-optimize-with-skill/setup.sh"
echo
echo "Perform manual testing as described above."
read -p "Press ENTER when Task 2 is complete..."
"$SCRIPT_DIR/task-2-optimize-with-skill/verify.sh"
read -p "Press ENTER to cleanup and continue..."
"$SCRIPT_DIR/task-2-optimize-with-skill/cleanup.sh"

# Task 3: Trigger Phrases
echo
echo "=== Task 3: Trigger Phrases for All 9 Skills ==="
"$SCRIPT_DIR/task-3-triggers/setup.sh"
echo
echo "Perform manual testing as described above."
read -p "Press ENTER when Task 3 is complete..."
"$SCRIPT_DIR/task-3-triggers/verify.sh"
read -p "Press ENTER to cleanup and continue..."
"$SCRIPT_DIR/task-3-triggers/cleanup.sh"

# Task 4: Functional Testing
echo
echo "=== Task 4: Functional Testing for Key Skills ==="
"$SCRIPT_DIR/task-4-functional/setup.sh"
echo
echo "Perform manual testing as described above."
read -p "Press ENTER when Task 4 is complete..."
"$SCRIPT_DIR/task-4-functional/verify.sh"
read -p "Press ENTER to cleanup and continue..."
"$SCRIPT_DIR/task-4-functional/cleanup.sh"

# Task 5: Quality & UX
echo
echo "=== Task 5: Quality & UX Testing ==="
"$SCRIPT_DIR/task-5-quality/setup.sh"
echo
echo "Perform manual testing as described above."
read -p "Press ENTER when Task 5 is complete..."
"$SCRIPT_DIR/task-5-quality/verify.sh"
read -p "Press ENTER to cleanup and continue..."
"$SCRIPT_DIR/task-5-quality/cleanup.sh"

# Task 6: Plugin Installation
echo
echo "=== Task 6: Plugin Installation & Integration ==="
"$SCRIPT_DIR/task-6-install/setup.sh"
echo
echo "Perform manual testing as described above."
read -p "Press ENTER when Task 6 is complete..."
"$SCRIPT_DIR/task-6-install/verify.sh"
read -p "Press ENTER to cleanup and continue..."
"$SCRIPT_DIR/task-6-install/cleanup.sh"

echo
echo "================================================"
echo "All Manual Tests Complete!"
echo "================================================"
echo
echo "Next steps:"
echo "1. Review docs/testing/manual-testing-runbook.md"
echo "2. Fill out docs/testing/manual-test-results/YYYY-MM-DD.md"
echo "3. Fix any issues found"
echo "4. Re-test if needed"
echo "5. Proceed to Phase 5 Task 5.4 (Version Bump & Release)"
echo
