#!/usr/bin/env bash
#
# Verify Task 5: Quality & UX Testing
#

set -e

TEST_DIR="/tmp/claudelint-test-5"

echo "Verifying Task 5 results..."
echo

if [ -f "$TEST_DIR/quality-checklist.md" ]; then
  echo "Quality checklist exists"
  echo
  echo "Review your completed checklist:"
  echo "  cat $TEST_DIR/quality-checklist.md"
  echo
  echo "Ensure all sections are tested:"
  echo "- [ ] Plain language checked"
  echo "- [ ] WHY explanations verified"
  echo "- [ ] Actionable next steps confirmed"
  echo "- [ ] Interactive experience tested (optimize-cc-md)"
  echo "- [ ] Error handling verified"
  echo
else
  echo "ERROR: Quality checklist not found"
  echo "Run setup-task-5.sh first"
  exit 1
fi

echo "Verification complete!"
