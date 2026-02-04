#!/usr/bin/env bash
#
# Generate manual test protocol for all bundled skills
#
# This script generates a markdown checklist for manual testing
# based on skill descriptions and trigger phrases
#

set -e

output_file="docs/testing/manual-test-protocol.md"

echo "Generating manual test protocol..."
echo

# Create docs/testing directory if it doesn't exist
mkdir -p docs/testing

# Start the document
cat > "$output_file" <<'EOF'
# Manual Skill Testing Protocol

**Generated**: $(date +%Y-%m-%d)

This document provides manual testing checklists for all bundled skills.

## Testing Methodology

See [docs/skill-testing.md](../skill-testing.md) for complete testing methodology.

**Time estimate**: ~30 minutes per skill (~4.5 hours for all 9 skills)

---

EOF

# Process each skill
for skill_dir in .claude/skills/*/; do
  skill_name=$(basename "$skill_dir")
  skill_md="$skill_dir/SKILL.md"

  if [ ! -f "$skill_md" ]; then
    continue
  fi

  # Extract description (look for description: field in frontmatter)
  description=$(grep "^description:" "$skill_md" 2>/dev/null | cut -d: -f2- | xargs)

  cat >> "$output_file" <<EOF
## Skill: $skill_name

**Description**: $description

### Trigger Tests (5 min)

Test that skill loads when appropriate:

- [ ] TODO: Add trigger phrases from description
- [ ] TODO: Add non-trigger phrases (should NOT load)
- [ ] TODO: Add paraphrased requests

**How to test**:
1. Start fresh Claude Code session
2. Type each query above
3. Observe if skill loads automatically
4. Document: YES/NO/WRONG_SKILL

### Functional Tests (10 min)

Test that skill executes correctly:

- [ ] TODO: Test with valid input
- [ ] TODO: Test with invalid input (should detect issues)
- [ ] TODO: Test edge cases (empty files, huge files, etc.)

**Expected**:
- Skill runs correct claudelint command
- Output is parsed and explained clearly
- No error dumps, conversational explanations

### Quality Tests (5 min)

Test conversational quality and UX:

- [ ] Uses plain language (not jargon)
- [ ] Explains WHY violations matter
- [ ] Provides actionable next steps
- [ ] Shows examples when helpful

### Notes

---

EOF

done

echo "Manual test protocol generated: $output_file"
echo
echo "Next steps:"
echo "1. Review $output_file"
echo "2. Fill in TODO items with actual trigger phrases"
echo "3. Use this checklist when performing manual testing"
