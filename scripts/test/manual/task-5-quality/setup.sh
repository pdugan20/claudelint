#!/usr/bin/env bash
#
# Setup for Task 5: Quality & UX Testing
#

set -e

TEST_DIR="/tmp/claudelint-test-5"

echo "Setting up Task 5: Quality & UX Testing"
echo

# Create test directory
mkdir -p "$TEST_DIR"

# Create quality checklist
cat > "$TEST_DIR/quality-checklist.md" << 'EOF'
# Quality & UX Testing Checklist

## 5.1: Plain Language (validate-all, validate-cc-md)

- [ ] Avoids jargon or explains technical terms
- [ ] Uses "you" and "your" (conversational)
- [ ] Active voice over passive voice
- [ ] Short sentences, clear structure

## 5.2: Explains WHY (validate-skills, validate-hooks)

- [ ] Doesn't just list violations
- [ ] Explains why each issue matters
- [ ] Connects violations to real problems
- [ ] Helps user understand consequences

## 5.3: Actionable Next Steps (validate-mcp, validate-settings)

- [ ] Every issue has clear fix instructions
- [ ] Provides examples when helpful
- [ ] Links to documentation when relevant
- [ ] Prioritizes fixes (what to do first)

## 5.4: Interactive Experience (optimize-cc-md only)

- [ ] Asks before making changes
- [ ] Shows previews/diffs when editing
- [ ] Handles user saying "no" gracefully
- [ ] Iterative workflow (ask → execute → verify)

## 5.5: Error Handling (all skills)

### Missing claudelint:
- [ ] Clear error message
- [ ] Shows install instructions
- [ ] Doesn't crash

### Missing file:
- [ ] Explains file not found
- [ ] Suggests next steps
- [ ] Doesn't crash

### Invalid JSON:
- [ ] Detects JSON syntax error
- [ ] Shows where error is
- [ ] Suggests fix

## Notes

Record observations and specific examples here.
EOF

echo "Created quality checklist: $TEST_DIR/quality-checklist.md"
echo
echo "Next steps:"
echo "1. Review checklist: cat $TEST_DIR/quality-checklist.md"
echo "2. Test 3-4 skills for each quality dimension"
echo "3. Test error scenarios"
echo "4. Mark checklist items as you test"
echo "5. Run: ./scripts/test/manual/verify-task-5.sh"
echo
