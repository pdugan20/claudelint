# Skill Testing Guide

Best practices for testing Claude Code skills, both automated and manual.

## Overview

This project bundles 9 skills with the claudelint plugin:

- `validate-all` - Run all validators
- `validate-cc-md` - Validate CLAUDE.md files
- `validate-skills` - Validate skill files
- `validate-plugin` - Validate plugin manifests
- `validate-mcp` - Validate MCP configs
- `validate-settings` - Validate settings.json
- `validate-hooks` - Validate hooks.json
- `format-cc` - Format Claude Code files
- `optimize-cc-md` - Interactively optimize CLAUDE.md

Testing these skills involves **two distinct concerns**:

## 1. Skill Structure Validation (Automated)

**What**: Validate that skill files conform to Claude Code skill specification

**How**: Use claudelint itself (dogfooding)

**Tools**:

```bash
# Validate all bundled skills
npm run validate:skills

# Validate specific skill
claudelint validate-skills .claude/skills/optimize-cc-md

# Verbose output with all checks
claudelint validate-skills --verbose .claude/skills/
```

**What this checks**:

- - Frontmatter schema (name, description, version, allowed-tools)
- - File structure (no README.md in skill folders)
- - Security issues (dangerous commands, hardcoded secrets)
- - Referenced files exist
- - Shell script shebangs
- - Version fields
- - Name/directory match
- - Description quality (when quality rules implemented)
- - Progressive disclosure structure
- - And 28+ other validation rules

**Automated in CI/CD**:

```yaml
# .github/workflows/ci.yml
- name: Validate bundled skills
  run: npm run validate:skills
```

## 2. Skill Usage Testing (Manual)

**What**: Test that skills actually work when Claude uses them in real conversations

**Why manual**: According to Anthropic's best practices, automated tests miss critical real-world issues:

> "Automated benchmarks help, but real-world testing reveals issues that synthetic tests miss"
> — [Agent Skills Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

**What this tests**:

- - **Trigger effectiveness**: Does Claude load the skill when users ask?
- - **Conversational quality**: Does Claude explain violations clearly?
- - **User experience**: Does the skill actually help users?
- - **Edge cases**: Real-world scenarios we can't predict
- - **Integration**: Does the skill work well with other skills?

**These cannot be automated** because they depend on:

- Claude's natural language understanding
- Conversational context
- User experience quality
- Unpredictable edge cases

## Testing Methodology

### Phase 1: Automated Validation (CI/CD)

Run before every commit and in CI:

```bash
# Pre-commit hook
npm run validate:skills

# Full validation
npm run validate:all
```

**Exit criteria**:

- All skill structure checks pass
- No security issues detected
- All referenced files exist
- Frontmatter schema valid

### Phase 2: Manual Testing Protocol (Pre-Release)

Use the "Two-Claude Testing" approach recommended by Anthropic:

**Setup**:

1. Start fresh Claude Code session
2. Ensure claudelint plugin installed: `/plugin list`
3. Clear context: `/clear`

**For each skill, test**:

#### A. Trigger Phrase Testing

Test that skill loads when appropriate:

```markdown
## optimize-cc-md Trigger Tests

### Should Trigger
- [ ] "optimize my CLAUDE.md"
- [ ] "my config is too long"
- [ ] "help me organize my CLAUDE.md"
- [ ] "split my CLAUDE.md into imports"

### Should NOT Trigger
- [ ] "what is CLAUDE.md?" (informational)
- [ ] "validate my CLAUDE.md" (should trigger validate-cc-md)
- [ ] "help me write code" (unrelated)

### Paraphrased Requests
- [ ] "CLAUDE.md file is getting huge"
- [ ] "can you help clean up my config?"
```

**How to test**:

1. Type the query
2. Observe if skill loads automatically
3. Check that correct skill loads (not a different one)
4. Document: YES/NO/WRONG_SKILL

#### B. Functional Testing

Test that skill executes correctly:

```markdown
## optimize-cc-md Functional Tests

### Test Case 1: Oversized CLAUDE.md (>50KB)
**Setup**: Create CLAUDE.md with 60KB of content
**User says**: "My CLAUDE.md is too long"
**Expected**:
1. Skill loads automatically
2. Runs `claudelint check-claude-md`
3. Explains "File exceeds 50KB limit"
4. Suggests splitting into @imports
5. Offers to help create import files

**Result**: PASS/FAIL (notes: _______)

### Test Case 2: Circular Import Detected
**Setup**: CLAUDE.md with circular @import references
**User says**: "Check my config for issues"
**Expected**:
1. Detects circular import
2. Explains problem clearly (not just error dump)
3. Shows import chain: A → B → C → A
4. Suggests how to break the cycle

**Result**: PASS/FAIL (notes: _______)
```

#### C. Quality Testing

Test conversational quality and UX:

```markdown
## optimize-cc-md Quality Tests

### Explanation Clarity
- [ ] Uses conversational language (not technical jargon)
- [ ] Explains WHY violations matter (not just what)
- [ ] Provides actionable next steps
- [ ] Shows examples when helpful

### Interactive Experience
- [ ] Asks before making changes
- [ ] Shows diffs/previews
- [ ] Confirms user wants to proceed
- [ ] Handles "no" gracefully

### Error Handling
- [ ] Graceful when claudelint not installed
- [ ] Clear error messages
- [ ] Suggests how to fix issues
- [ ] Doesn't crash or give confusing output
```

#### D. Integration Testing

Test skill works with other skills:

```markdown
## Cross-Skill Integration

### optimize-cc-md + validate-cc-md
**Scenario**: User runs optimize, then validate
**Expected**: No conflicts, validation passes after optimization

### validate-all + individual validators
**Scenario**: Run validate-all, see error, run specific validator
**Expected**: Specific validator provides more detail
```

### Phase 3: Performance Comparison (Optional)

Compare with/without skill to measure improvement:

```markdown
## Performance Metrics

### Without Skill
**Scenario**: User wants to fix CLAUDE.md
1. User: "How do I check my CLAUDE.md?"
2. Claude: "You can use claudelint..."
3. User: "How do I run it?"
4. Claude: "Try: claudelint check-claude-md"
5. User: *runs command manually*
6. User: "What does this error mean?"
7. Claude: *explains error*

**Metrics**:
- Messages: 7
- Time: ~3 minutes
- Success: Depends on user following instructions

### With Skill
**Scenario**: User wants to fix CLAUDE.md
1. User: "Check my CLAUDE.md"
2. Skill loads, runs validation, explains results

**Metrics**:
- Messages: 1
- Time: ~30 seconds
- Success: 100% (automated)

**Improvement**: 75% reduction in user effort
```

## Manual Test Protocol Template

For each skill, create a checklist:

```markdown
# Skill: validate-cc-md

## Pre-Test Setup
- [ ] Fresh Claude session
- [ ] Plugin installed
- [ ] Test fixtures ready

## 1. Trigger Tests (5 min)
- [ ] "check my CLAUDE.md" → loads
- [ ] "validate my config" → loads
- [ ] "why is my CLAUDE.md too long" → loads
- [ ] "what is CLAUDE.md" → does NOT load

## 2. Functional Tests (10 min)
- [ ] Oversized file detected
- [ ] Circular imports detected
- [ ] Missing imports detected
- [ ] Valid file passes

## 3. Quality Tests (5 min)
- [ ] Explanations clear
- [ ] Error messages helpful
- [ ] CLI output formatted well

## 4. Edge Cases (10 min)
- [ ] Empty CLAUDE.md
- [ ] No CLAUDE.md file
- [ ] Permission errors
- [ ] Invalid UTF-8

**Total Time**: ~30 minutes per skill
**Total for 9 skills**: ~4.5 hours
```

## Automation Opportunities

While core UX testing must be manual, we can automate supporting checks:

### 1. Self-Validation (Dogfooding)

```bash
# Run our own validator on our own skills
claudelint validate-skills .claude/skills/

# This catches:
# - Structure issues
# - Security problems
# - Broken references
# - Schema violations
```

### 2. CLI Command Verification

```bash
# Verify commands referenced in skills exist
test_cli_commands() {
  for skill in .claude/skills/*/SKILL.md; do
    # Extract command from skill
    cmd=$(grep "claudelint" "$skill" | head -1 | awk '{print $1, $2}')

    # Test command exists
    if $cmd --help >/dev/null 2>&1; then
      echo "[PASS] $cmd"
    else
      echo "[FAIL] $cmd not found"
      exit 1
    fi
  done
}
```

### 3. Metadata Consistency

```typescript
// Test that skill metadata matches reality
test('validate-cc-md references correct command', () => {
  const skillMd = readFileSync('.claude/skills/validate-cc-md/SKILL.md', 'utf-8');
  expect(skillMd).toContain('claudelint check-claude-md');
  expect(skillMd).not.toContain('claudelint validate-claude-md'); // Old name
});

test('skill versions match package.json', () => {
  const packageVersion = require('../package.json').version;

  for (const skill of skills) {
    const frontmatter = parseSkillFrontmatter(skill);
    expect(frontmatter.version).toBe(packageVersion);
  }
});
```

### 4. Documentation Consistency

```bash
# Check that README documents all skills
check_readme_coverage() {
  skills=$(ls .claude/skills/ | grep -v "^\\.")

  for skill in $skills; do
    if ! grep -q "$skill" README.md; then
      echo "[FAIL] $skill not documented in README"
      exit 1
    fi
  done
}
```

### 5. Test Fixtures

Create standard test cases for functional testing:

```text
tests/fixtures/
├── claude-md/
│   ├── valid.md                # Should pass validation
│   ├── oversized.md            # >50KB, should fail
│   ├── circular-import.md      # Circular @import
│   ├── missing-import.md       # @import to non-existent file
│   └── invalid-frontmatter.md  # Bad frontmatter
├── skills/
│   ├── valid/                  # Well-formed skill
│   ├── no-version/            # Missing version field
│   └── dangerous-command/     # Has rm -rf
└── ...
```

Use these in manual testing for consistency.

## NPM Scripts

Add these to `package.json`:

```json
{
  "scripts": {
    "validate:skills": "claudelint validate-skills .claude/skills/",
    "test:skills:structure": "npm run validate:skills",
    "test:skills:cli": "bash scripts/test/skills/test-cli-commands.sh",
    "test:skills:metadata": "jest tests/skills/metadata.test.ts",
    "test:skills:automated": "npm run test:skills:structure && npm run test:skills:cli && npm run test:skills:metadata",
    "test:skills:manual": "echo 'See docs/skill-testing.md for manual test protocol'"
  }
}
```

## CI/CD Integration

```yaml
# .github/workflows/test-skills.yml
name: Test Skills

on: [push, pull_request]

jobs:
  automated-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Validate skill structure
        run: npm run test:skills:structure

      - name: Test CLI commands
        run: npm run test:skills:cli

      - name: Test metadata consistency
        run: npm run test:skills:metadata

      - name: Upload manual test checklist
        run: |
          echo "Manual testing required for release" > MANUAL_TESTS_REQUIRED.txt
          echo "See docs/skill-testing.md for protocol" >> MANUAL_TESTS_REQUIRED.txt

      - uses: actions/upload-artifact@v4
        with:
          name: manual-test-reminder
          path: MANUAL_TESTS_REQUIRED.txt
```

## Release Checklist

Before releasing a new version:

- [ ] Automated tests pass in CI
- [ ] Manual test protocol completed for all skills
- [ ] No regressions from previous version
- [ ] New features work as documented
- [ ] Performance is acceptable
- [ ] Documentation updated

## Best Practices Summary

### DO

- Use claudelint to validate skill structure (dogfooding)
- Automate CLI command verification
- Create consistent test fixtures
- Run automated tests in CI/CD
- Perform manual UX testing before release
- Document manual test results
- Test with real user scenarios
- Test both automatic and manual skill triggering

### DON'T

- Try to automate conversational quality testing
- Skip manual testing ("automated tests passed")
- Test only with perfect inputs (test edge cases)
- Forget to test skill triggering
- Assume skills work just because structure is valid
- Build a separate testing framework (use claudelint itself)

## References

- [Anthropic Agent Skills Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills.md)
- [Two-Claude Testing Approach](https://platform.claude.com/docs/en/agent-sdk/skills)
- [Complete Guide to Building Skills for Claude](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf)

## Appendix: Manual Test Protocol Generator

Script to generate manual test checklists:

```bash
#!/bin/bash
# scripts/generate-manual-test-protocol.sh

echo "# Manual Skill Testing Protocol"
echo "**Generated**: $(date)"
echo ""

for skill in .claude/skills/*/; do
  skill_name=$(basename "$skill")

  echo "## Skill: $skill_name"
  echo ""
  echo "### Trigger Tests"
  echo "- [ ] TODO: Add trigger phrases"
  echo ""
  echo "### Functional Tests"
  echo "- [ ] TODO: Add test cases"
  echo ""
  echo "### Quality Tests"
  echo "- [ ] Explanations clear"
  echo "- [ ] Error messages helpful"
  echo ""
  echo "---"
  echo ""
done
```

Run with: `bash scripts/generate-manual-test-protocol.sh > docs/testing/manual-protocol.md`
