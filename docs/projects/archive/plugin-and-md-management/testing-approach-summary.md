# Testing Approach Summary

**Date**: 2026-02-04
**Context**: Clarifying how to test bundled skills in the claudelint plugin

## The Confusion

Initially misunderstood the purpose of Phase 3.8 and Phase 5 testing tasks, proposing to build a separate testing framework that would:

- Create declarative test specs for each skill
- Build a generic test runner
- Duplicate claudelint's skill validation logic
- Generate test fixtures and run them through claudelint

**This was wrong** because:

1. **This project IS claudelint** - a validator for Claude Code projects
2. We already have 28 implemented + 72 planned skill validation rules
3. Building a framework to test skills would duplicate our own validation logic
4. The correct approach is **dogfooding** - use claudelint to validate itself

## The Correct Approach

### Two Distinct Testing Concerns

#### 1. Skill Structure Validation (Automated)

**What**: Validate that skill files conform to Claude Code specification

**How**: Use claudelint itself (dogfooding)

**Commands**:

```bash
# Validate all bundled skills
claudelint validate-skills .claude/skills/

# This checks:
# - Frontmatter schema (name, description, version, allowed-tools)
# - File structure (no README.md in skill folders)
# - Security (dangerous commands, hardcoded secrets)
# - Referenced files exist
# - And 28+ other validation rules
```

**Why this works**: If our tool can't validate our own skills correctly, we have a problem with the tool itself.

**Automated in CI/CD**:

```yaml
- name: Validate bundled skills
  run: claudelint validate-skills .claude/skills/
```

#### 2. Skill Usage Testing (Manual)

**What**: Test that skills actually work when Claude uses them

**Why manual**: Per Anthropic's best practices, these aspects cannot be automated:

- - Trigger effectiveness (does Claude load the skill when appropriate?)
- - Conversational quality (does Claude explain things clearly?)
- - User experience (does the skill actually help users?)
- - Real-world edge cases (unpredictable scenarios)

**Quote from Anthropic**:

> "Automated benchmarks help, but real-world testing reveals issues that synthetic tests miss"
> — [Agent Skills Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

**Testing protocol**:

1. Start fresh Claude session
2. Test trigger phrases: "optimize my CLAUDE.md" → should load skill
3. Test functionality: Does it run the correct command?
4. Test quality: Does Claude explain issues clearly?
5. Test UX: Does the skill actually help the user?

**Two-Claude Testing** (Anthropic recommended):

- **Claude A** (you + Claude Code): Design and refine skill
- **Claude B** (separate session): Test skill in real tasks
- Observe and iterate

## What We Can Automate

Beyond dogfooding, we can automate supporting checks:

### 1. CLI Command Verification

```bash
# Verify commands referenced in skills exist
for skill in .claude/skills/*/SKILL.md; do
  cmd=$(grep "claudelint" "$skill" | head -1)
  $cmd --help >/dev/null || exit 1
done
```

### 2. Metadata Consistency

```typescript
// Test that skill metadata matches reality
test('skill versions match package.json', () => {
  const packageVersion = require('../package.json').version;
  for (const skill of skills) {
    const frontmatter = parseSkillFrontmatter(skill);
    expect(frontmatter.version).toBe(packageVersion);
  }
});
```

### 3. Test Fixtures

Create standard test cases for consistent manual testing:

```text
tests/fixtures/
├── claude-md/
│   ├── valid.md           # Should pass
│   ├── oversized.md       # >50KB, should fail
│   ├── circular-import.md # Circular imports
│   └── ...
```

## Documentation Created

1. **`docs/skill-testing.md`** - Comprehensive testing guide
   - Automated testing methodology (dogfooding)
   - Manual testing protocol (UX validation)
   - Test fixture structure
   - NPM scripts
   - CI/CD integration
   - Best practices summary

2. **Updated `docs/projects/plugin-and-md-management/tracker.md`**
   - Added "Testing Methodology" to Key Findings
   - Rewrote Task 3.8 with correct approach
   - Completely rewrote Phase 5 with hybrid testing strategy
   - Split Task 5.1 into automated (dogfooding) and manual (UX)
   - Added Task 4.5 for testing infrastructure
   - Updated acceptance criteria

3. **Updated `docs/projects/plugin-and-md-management/README.md`**
   - Added "Testing Methodology" section
   - Linked to skill-testing.md
   - Explained dogfooding approach

## NPM Scripts to Add

```json
{
  "scripts": {
    "test:skills:structure": "claudelint validate-skills .claude/skills/",
    "test:skills:cli": "bash scripts/test/skills/test-cli-commands.sh",
    "test:skills:metadata": "jest tests/skills/metadata.test.ts",
    "test:skills:automated": "npm run test:skills:structure && npm run test:skills:cli && npm run test:skills:metadata",
    "test:skills:manual": "echo 'See docs/skill-testing.md for manual test protocol'"
  }
}
```

## Tasks Added to Tracker

### Phase 4 (Documentation)

- **Task 4.5**: Add skill testing infrastructure
  - Create test scripts
  - Add npm scripts
  - Reference docs/skill-testing.md

### Phase 5 (Testing)

- **Task 5.1**: Automated Testing (6 subtasks)
  - 5.1.1: Self-validation script
  - 5.1.2: CLI command verification
  - 5.1.3: Metadata consistency tests
  - 5.1.4: Test fixtures
  - 5.1.5: CI/CD automation
  - 5.1.6: NPM scripts

- **Task 5.2**: Manual Testing Protocol (5 subtasks)
  - 5.2.1: Create manual test protocol documents
  - 5.2.2: Execute triggering tests (30 min/skill)
  - 5.2.3: Execute functional tests (20 min/skill)
  - 5.2.4: Execute quality tests (15 min/skill)
  - 5.2.5: Execute performance comparison (1 hour)

- **Task 5.3**: Integration Testing (5 subtasks)
  - 5.3.1: Test local plugin installation
  - 5.3.2: Test GitHub plugin installation
  - 5.3.3: Test dependency detection
  - 5.3.4: Test in both environments
  - 5.3.5: Verify npm package contents

## Key Takeaways

### DO

- - Use claudelint to validate bundled skills (dogfooding)
- - Automate CLI command verification
- - Create test fixtures for manual testing
- - Run automated tests in CI/CD
- - Perform manual UX testing before release
- - Document manual test results

### DON'T

- - Build a separate testing framework (use claudelint itself)
- - Try to automate conversational quality testing
- - Skip manual testing ("automated tests passed")
- - Test only perfect inputs (test edge cases)
- - Assume skills work just because structure is valid

## References

- [Anthropic Agent Skills Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills.md)
- [Two-Claude Testing Approach](https://platform.claude.com/docs/en/agent-sdk/skills)
- [Complete Guide to Building Skills for Claude](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf)
