# Manual Test Results

**Date:** YYYY-MM-DD
**Tester:** [Your Name]
**Version:** [claudelint version]
**Environment:** [macOS/Linux/Windows]
**Duration:** [Total time spent]

## Summary

- **Tests Completed:** X/6
- **Tests Passed:** X
- **Tests Failed:** X
- **Issues Found:** X

## Task 1: optimize-cc-md (Phase 1 - Without Skill)

**Status:** [ ] PASS / [ ] FAIL
**Time:** ___ minutes

### Prompts Tested

Best working prompt: "_________________"

### Observations

- What Claude did naturally:
- What worked well:
- What didn't work:
- Final result (file size reduction, etc.):

### Issues Found

None / [List issues]

## Task 2: optimize-cc-md (Phase 2 - With Skill)

**Status:** [ ] PASS / [ ] FAIL
**Time:** ___ minutes

### Trigger Success

- "optimize my CLAUDE.md" → [ ] YES / [ ] NO
- "fix my config" → [ ] YES / [ ] NO
- "my CLAUDE.md is too long" → [ ] YES / [ ] NO

### Workflow Comparison

- [ ] Matches Task 1 winning approach
- [ ] Ran claudelint check-claude-md first
- [ ] Read CLAUDE.md with Read tool
- [ ] Explained issues conversationally
- [ ] Used Edit/Write tools correctly
- [ ] Referenced references/ docs

### Observations

- What skill did well:
- What skill did poorly:
- UX compared to Task 1:

### Issues Found

None / [List issues]

## Task 3: Trigger Phrases for All 9 Skills

**Status:** [ ] PASS / [ ] FAIL
**Time:** ___ minutes

### Results by Skill

**validate-all:**

- Triggers tested: X/X successful
- Non-triggers: X/X successful

**validate-cc-md:**

- Triggers tested: X/X successful
- Non-triggers: X/X successful

**validate-skills:**

- Triggers tested: X/X successful
- Non-triggers: X/X successful

**validate-hooks:**

- Triggers tested: X/X successful
- Non-triggers: X/X successful

**validate-mcp:**

- Triggers tested: X/X successful
- Non-triggers: X/X successful

**validate-plugin:**

- Triggers tested: X/X successful
- Non-triggers: X/X successful

**validate-settings:**

- Triggers tested: X/X successful
- Non-triggers: X/X successful

**format-cc:**

- Triggers tested: X/X successful
- Non-triggers: X/X successful

**optimize-cc-md:**

- Triggers tested: X/X successful
- Non-triggers: X/X successful

### Overall Success Rate

- Triggers: ___% (target: >90%)
- Non-triggers: ___% (target: 100%)

### Issues Found

None / [List issues]

## Task 4: Functional Testing for Key Skills

**Status:** [ ] PASS / [ ] FAIL
**Time:** ___ minutes

### Test 4.1: validate-all

- [ ] Executed successfully
- [ ] Output was conversational
- [ ] No error dumps
- [ ] Actionable next steps

### Test 4.2: validate-cc-md

- [ ] Valid file passed
- [ ] Oversized file detected
- [ ] Circular import detected
- [ ] Explanations clear

### Test 4.3: optimize-cc-md

- [ ] Bloat detected
- [ ] Suggestions made sense
- [ ] Changes actually made
- [ ] Before/after shown

### Issues Found

None / [List issues]

## Task 5: Quality & UX Testing

**Status:** [ ] PASS / [ ] FAIL
**Time:** ___ minutes

### Plain Language

- [ ] Uses conversational tone
- [ ] Avoids jargon
- [ ] Clear and concise

### Explains WHY

- [ ] Doesn't just list violations
- [ ] Explains consequences
- [ ] Connects to real problems

### Actionable Next Steps

- [ ] Clear fix instructions
- [ ] Examples provided
- [ ] Prioritizes fixes

### Interactive Experience (optimize-cc-md)

- [ ] Asks before changes
- [ ] Shows previews
- [ ] Handles "no" gracefully

### Error Handling

- [ ] Missing claudelint: Clear error
- [ ] Missing file: Helpful message
- [ ] Invalid JSON: Points to error

### Issues Found

None / [List issues]

## Task 6: Plugin Installation & Integration

**Status:** [ ] PASS / [ ] FAIL
**Time:** ___ minutes

### Installation

- [ ] Plugin installed successfully
- [ ] No errors during install

### Skills Registration

- [ ] All 9 skills in `/skills list`
- [ ] Skill names correct
- [ ] Skills execute correctly

### Dependency Detection

- [ ] Error message helpful
- [ ] Shows install command
- [ ] Doesn't crash

### Package Contents

- [ ] .claude/ included
- [ ] All 9 SKILL.md files
- [ ] bin/claudelint included
- [ ] Size reasonable (<5MB)
- [ ] No unnecessary files

### Issues Found

None / [List issues]

## Overall Assessment

### What Worked Well

1.
2.
3.

### What Needs Improvement

1.
2.
3.

### Critical Issues

None / [List critical issues that block release]

### Recommendations

- [ ] Ready for release
- [ ] Minor fixes needed (list above)
- [ ] Major rework required (explain)

## Next Steps

Based on these results:

1.
2.
3.

## Notes

[Any additional observations, context, or comments]
