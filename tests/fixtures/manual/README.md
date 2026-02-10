# Manual Testing Fixtures

This directory contains realistic test cases for manual testing of the `optimize-cc-md` skill.

## Test Files

### bloated-realistic.md

A realistic bloated CLAUDE.md file (~12.7KB) that simulates common real-world problems.

**File size:** 12,679 bytes (well under limits but showing clear optimization opportunities)

**Issues present:**

1. **Generic Advice (Should be removed):**
   - "Always write clean, maintainable code" and similar platitudes
   - "Remember to commit often" and other obvious advice
   - "Security is important" without project-specific context
   - "Error handling is crucial" generic statements
   - "Write code for humans first" and other general wisdom
   - "Happy coding!" fluff at the end

2. **Content that should be @imports:**
   - **Code Style section** (~800 bytes) - Should move to `.claude/rules/code-style.md`
   - **Testing Guidelines section** (~900 bytes) - Should move to `.claude/rules/testing-guidelines.md`
   - **Git Workflow section** (~1,100 bytes) - Should move to `.claude/rules/git-workflow.md`

3. **Duplicated/Redundant Content:**
   - Code review guidelines repeat testing best practices
   - Security section repeats general coding guidelines
   - Performance section repeats general best practices
   - Debugging tips are generic, not project-specific

4. **Poor Organization:**
   - Too many top-level sections (20+ sections)
   - Mixing generic advice with project-specific config
   - "Additional Resources" section with generic links
   - "Code Examples" that aren't project-specific

5. **Content that adds no value:**
   - "General Coding Guidelines" - all generic
   - "General Best Practices" - duplicate of earlier advice
   - "Debugging Tips" - generic advice available in any tutorial
   - "Team Communication" - would be in team wiki, not CLAUDE.md
   - "Onboarding Checklist" - should be in team docs
   - "Final Notes" - fluff

### bloated-realistic-expected.md

The expected result after optimization (2.9KB).

**Changes made:**

1. **Removed all generic advice** (~4.8KB reduction)
   - Removed platitudes and obvious statements
   - Removed content available in any coding tutorial
   - Removed team process content (belongs in team wiki)

2. **Created @imports** (~5KB moved to separate files)
   - `@import .claude/rules/git-workflow.md` (Conventional Commits, branch naming)
   - `@import .claude/rules/testing-guidelines.md` (Unit/integration/e2e test standards)
   - `@import .claude/rules/code-style.md` (Language-specific formatting rules)

3. **Kept project-specific content:**
   - Build commands
   - Environment variables
   - Database setup instructions
   - Architecture overview
   - API guidelines specific to this project
   - Deployment process
   - Monitoring/logging setup
   - Troubleshooting for common project-specific issues

4. **Better organization:**
   - Reduced from 20+ sections to 8 focused sections
   - Removed redundant sections
   - Clearer hierarchy
   - Project-specific content is easy to find

**Size reduction:** 12.7KB → 2.9KB (77% reduction)

## How to Use These Fixtures

### For Manual Testing (Task #1 & #2)

1. **Copy the bloated file to a test directory:**

   ```bash
   cp tests/fixtures/manual/bloated-realistic.md /tmp/test-CLAUDE.md
   cd /tmp
   ```

2. **Start Claude Code session** in that directory

3. **Trigger optimize-cc-md skill:**
   - "Optimize my CLAUDE.md"
   - "My config is too long, help me fix it"
   - "Can you help me clean up CLAUDE.md?"

4. **Observe Claude's behavior:**
   - Does it run validation?
   - Does it read the file?
   - Does it identify the right problems?
   - Does it explain issues conversationally?
   - Does it suggest creating @import files?
   - Does it ask before making changes?
   - Does it use Edit/Write tools correctly?

5. **Compare result to expected:**
   - Check against `bloated-realistic-expected.md`
   - Verify generic advice was removed
   - Verify @imports were created
   - Verify project-specific content was kept
   - Verify final size is reasonable

### Expected Detection by optimize-cc-md

The skill should detect and explain:

- **File size is bloated:** "Your CLAUDE.md is 12.7KB and contains optimization opportunities"
- **Generic content bloat:** "I see a lot of generic coding advice that's not specific to your project"
- **Extractable sections:** "These sections could be moved to @import files: Code Style, Testing Guidelines, Git Workflow"
- **Redundant content:** "Some content is repeated across multiple sections"
- **Poor organization:** "You have many top-level sections that could be consolidated"

### Expected Suggestions

The skill should suggest:

1. Remove generic advice ("Always write clean code", etc.)
2. Create 3 @import files for reusable rules
3. Keep project-specific configuration
4. Consolidate redundant sections
5. Better organize remaining content

### Expected Workflow

1. **Validation:** Run `claudelint check-claude-md`
2. **Analysis:** Read CLAUDE.md with Read tool
3. **Explanation:** Explain issues in plain language
4. **Prioritization:** Ask user what to fix first
5. **Execution:** Use Edit tool to remove generic content
6. **Creation:** Use Write tool to create @import files
7. **Verification:** Show before/after comparison

## Notes for Skill Improvement

If manual testing reveals issues, update:

- `skills/optimize-cc-md/SKILL.md` - Core workflow instructions
- `skills/optimize-cc-md/references/size-optimization.md` - Optimization strategies
- `skills/optimize-cc-md/references/import-patterns.md` - Import best practices
- `skills/optimize-cc-md/references/organization-guide.md` - Organization tips

## Repeatability

These fixtures allow testing the same scenario multiple times:

- Copy bloated file to fresh location
- Run optimize-cc-md
- Verify results match expected output
- Document any deviations
- Iterate on skill improvements
- Test again with same fixture

This ensures consistent, repeatable manual testing as the skill evolves.
