# Manual Testing Runbook for Claude Code Skills

**Version:** 1.0.0
**Last Updated:** 2026-02-04
**Estimated Total Time:** 3.5-4 hours

This runbook provides step-by-step instructions for manually testing all 9 bundled skills in the claudelint plugin. It combines manual verification (for conversational quality and UX) with automated checks (for verifiable aspects like tool usage and file changes).

## Prerequisites

**Required:**

- Claude Code CLI installed and configured
- claudelint npm package installed locally (this repo)
- Plugin installed: `/plugin install --source .`
- Ability to open multiple Claude Code sessions/tabs
- Terminal with bash support

**Verify setup:**

```bash
# From repo root
npm run build
npm run test:skills:automated  # Should pass
/plugin list | grep claudelint  # Should show the plugin
```

## Quick Start

```bash
# Run all automated setup and verification
./scripts/test/manual/run-all-tests.sh

# Or run individual tests
./scripts/test/manual/setup-task-1.sh    # Setup
# ... perform manual testing ...
./scripts/test/manual/verify-task-1.sh  # Verify
./scripts/test/manual/cleanup-task-1.sh # Cleanup
```

## Test Environment

All tests use isolated temporary directories to avoid affecting the repo:

- Test fixtures: `tests/fixtures/projects/` (realistic projects)
- Deprecated fixtures: `tests/fixtures/manual/` (old approach)
- Test workspaces: `/tmp/claudelint-test-*`
- Results: `docs/testing/manual-test-results/YYYY-MM-DD.md`

## Understanding Fixture Projects

Starting with Task 2, tests use **realistic fixture projects** instead of standalone CLAUDE.md files.

### Why Fixture Projects?

The optimize-cc-md skill needs a real project to analyze:

- **CLAUDE.md references real code** - Can't optimize "React advice" without React code
- **Claude reads the codebase** - Determines what's generic vs project-specific
- **Plugin installation works** - Tests actual user workflow with npm install
- **Results are meaningful** - Representative of real usage

### Available Fixtures

**react-typescript-bloated** (`tests/fixtures/projects/react-typescript-bloated/`)

- React 18 + TypeScript 5.3+ project
- Minimal but realistic (App.tsx, index.tsx)
- Bloated CLAUDE.md: 13,380 bytes
- Expected after optimization: 2,856 bytes (78% reduction)
- 3 @import files created in `.expected/.claude/rules/`

Each fixture includes:

- Real code and dependencies
- Bloated CLAUDE.md
- Expected optimization outputs in `.expected/`
- README documenting issues present

See `tests/fixtures/projects/README.md` for details.

### npm pack Installation

Task 2 uses `npm pack` (not `npm link`) to test realistic package installation:

```bash
# Build and pack
npm run build && npm pack
# Creates: claude-code-lint-0.2.0-beta.1.tgz

# Install in test workspace
cd /tmp/test-workspace
npm install /path/to/claude-code-lint-*.tgz
```

This is exactly how users install the package - tests the real experience.

## Testing Tasks

### Task 1: optimize-cc-md Skill (Phase 1 - Without Skill)

**Objective:** Discover the natural workflow for optimizing CLAUDE.md files WITHOUT the skill loaded.

**Time Estimate:** 30-45 minutes

**Why this matters:** Following Anthropic's "single-task iteration" method (p15) - find the winning approach first, then verify the skill matches it.

#### Setup

```bash
./scripts/test/manual/setup-task-1.sh
```

This creates:

- `/tmp/claudelint-test-1/` with bloated CLAUDE.md
- Fresh directory with no plugin loaded

#### Manual Test Steps

1. **Open NEW Claude Code session in test directory:**

   ```bash
   cd /tmp/claudelint-test-1
   # Start Claude Code here (separate session from this one)
   ```

2. **Test WITHOUT skill loaded** (skill should NOT trigger):

   Try these prompts:
   - "Help me optimize my CLAUDE.md file"
   - "My CLAUDE.md is bloated, can you help fix it?"
   - "This config file is too long, what should I do?"

3. **Observe and iterate:**
   - What does Claude suggest?
   - Does Claude read the file?
   - Does Claude identify the right problems?
   - Does Claude suggest creating @import files?
   - Does Claude actually make edits?
   - What works well? What doesn't?

4. **Document the winning approach:**
   - Best prompt that worked
   - Steps Claude took
   - What felt natural
   - What was confusing
   - Final result (file size reduction, etc.)

#### Automated Verification

```bash
./scripts/test/manual/verify-task-1.sh
```

Checks:

- Test directory exists
- CLAUDE.md was modified
- File size changed
- No unexpected files created

#### Pass Criteria

- [ ] Found a natural workflow that optimizes CLAUDE.md
- [ ] Generic advice removed or @imports created
- [ ] File size reduced by >50%
- [ ] Workflow felt intuitive
- [ ] Documented winning approach for Task 2 comparison

#### Cleanup

```bash
./scripts/test/manual/cleanup-task-1.sh
```

### Task 2: optimize-cc-md Skill (With Skill Loaded)

**Objective:** Verify the skill works with a realistic project and produces expected optimization.

**Time Estimate:** 30-45 minutes

#### Setup

```bash
./scripts/test/manual/task-2-optimize-with-skill/setup.sh
```

This:

1. Builds and packs claudelint (`npm run build && npm pack`)
2. Copies react-typescript-bloated fixture to `/tmp/claudelint-test-2/`
3. Installs claudelint from .tgz package
4. Creates plugin.json for plugin loading

Result: Realistic React + TypeScript project with claudelint installed

#### Manual Test Steps

1. **Open NEW Claude Code session in test directory:**

   ```bash
   cd /tmp/claudelint-test-2
   # Start Claude Code - plugin auto-loads from plugin.json
   ```

2. **Trigger the skill:**

   Try these trigger phrases (should load optimize-cc-md skill):
   - "optimize my CLAUDE.md"
   - "can you help me improve my CLAUDE.md file? I want to ensure its under the size limit"
   - "this config file is too long"
   - "my CLAUDE.md is bloated"

3. **Observe skill execution:**
   - [ ] Skill loads automatically (check for skill name in response)
   - [ ] Reads CLAUDE.md with Read tool
   - [ ] Reads project files (App.tsx, index.tsx) to understand context
   - [ ] Explains issues conversationally
   - [ ] Identifies specific problems:
     - Generic React patterns (should be @import)
     - TypeScript style guide (should be @import)
     - Testing guidelines (should be @import)
   - [ ] Suggests creating @import files
   - [ ] Creates `.claude/rules/` directory structure
   - [ ] Uses Edit tool to update CLAUDE.md
   - [ ] Uses Write tool to create @import files
   - [ ] Shows before/after comparison

4. **Verify optimization quality:**
   - Does skill recognize project is React + TypeScript?
   - Does it identify the right content to extract?
   - Are @import files created with appropriate names?
   - Is CLAUDE.md focused on project-specific content?
   - Are explanations clear about WHY changes are needed?

#### Automated Verification

```bash
./scripts/test/manual/task-2-optimize-with-skill/verify.sh
```

Checks:

- CLAUDE.md size reduced significantly (should be ~2,856 bytes)
- `.claude/rules/` directory created
- @import files exist (react-patterns.md, typescript-style.md, testing.md)
- CLAUDE.md contains @import directives
- Size reduction ~75-80%
- Compares against expected outputs in fixture

#### Pass Criteria

- [ ] Skill triggers on appropriate prompts (90%+ success)
- [ ] Reads and understands the actual project code
- [ ] Creates @import files in `.claude/rules/`
- [ ] Extracts generic React, TypeScript, and testing advice
- [ ] CLAUDE.md reduced by >70%
- [ ] Final size within ±500 bytes of expected (2,856 bytes)
- [ ] Workflow feels natural and intuitive
- [ ] Explanations are conversational and clear

#### Cleanup

```bash
./scripts/test/manual/task-2-optimize-with-skill/cleanup.sh
```

#### Troubleshooting

**Plugin doesn't load:**

- Check plugin.json exists in test workspace
- Verify claudelint is in node_modules: `npm list claude-code-lint`
- Try restarting Claude Code session

**Skill doesn't trigger:**

- Check for typos in trigger phrases
- Try more explicit: "I want to optimize my CLAUDE.md file"
- Verify plugin loaded: look for skill registration in logs

**@import files not created:**

- Check if skill has Write tool permission
- Verify `.claude/rules/` directory was created
- Check for error messages in skill execution

### Task 3: Trigger Phrases for All 9 Skills

**Objective:** Verify trigger phrases activate the correct skills without false positives.

**Time Estimate:** 30 minutes

#### Setup

```bash
./scripts/test/manual/setup-task-3.sh
```

Creates test matrix with trigger phrases for all 9 skills.

#### Manual Test Steps

For each skill, test in a fresh Claude Code session:

#### 1. validate-all

Triggers (SHOULD activate):

- "check everything"
- "run all validators"
- "validate my entire project"
- "full audit of my claude code project"

Non-triggers (should NOT activate):

- "what is validation?" (informational)
- "check my JavaScript code" (not Claude Code specific)

#### 2. validate-cc-md

Triggers:

- "check my CLAUDE.md"
- "audit my config"
- "why is my CLAUDE.md too long"
- "validate imports"

Non-triggers:

- "what should go in CLAUDE.md?" (informational)
- "validate my code" (not CLAUDE.md specific)

#### 3. validate-skills

Triggers:

- "check my skills"
- "validate skill syntax"
- "why isn't my skill loading"
- "skill errors"

Non-triggers:

- "what is a skill?" (informational)
- "improve my skills" (ambiguous - could mean personal skills)

#### 4. validate-hooks

Triggers:

- "check my hooks"
- "validate hooks.json"
- "hook errors"
- "why isn't my hook firing"

Non-triggers:

- "what are hooks?" (informational)
- "add a new hook" (creation, not validation)

#### 5. validate-mcp

Triggers:

- "check my MCP config"
- "why isn't my MCP working"
- ".mcp.json errors"
- "validate MCP servers"

Non-triggers:

- "what is MCP?" (informational)
- "create MCP server" (creation, not validation)

#### 6. validate-plugin

Triggers:

- "check my plugin config"
- "validate plugin.json"
- "plugin errors"
- "why isn't my plugin loading"

Non-triggers:

- "what is a plugin?" (informational)
- "install a plugin" (installation, not validation)

#### 7. validate-settings

Triggers:

- "check my settings"
- "validate settings.json"
- "permission errors"
- "environment variable issues"

Non-triggers:

- "change my settings" (modification, not validation)
- "what settings are available?" (informational)

#### 8. format-cc

Triggers:

- "format my files"
- "fix markdown formatting"
- "clean up CLAUDE.md"
- "prettier my config"
- "check shell scripts"

Non-triggers:

- "what is formatting?" (informational)
- "format my JavaScript" (not Claude Code specific)

#### 9. optimize-cc-md

Triggers:

- "optimize my CLAUDE.md"
- "fix my config"
- "my CLAUDE.md is too long"
- "improve organization"
- "split my CLAUDE.md"

Non-triggers:

- "validate my CLAUDE.md" (should load validate-cc-md instead)
- "what is CLAUDE.md?" (informational)

#### Testing Protocol

For each skill:

1. Start fresh Claude Code session
2. Ask trigger phrase
3. Observe: Did skill load? (Check response for skill name)
4. Document: YES / NO / WRONG_SKILL
5. Repeat for non-triggers
6. Calculate success rate

#### Automated Verification

```bash
./scripts/test/manual/verify-task-3.sh
```

Generates trigger test matrix and checks coverage.

#### Pass Criteria

- [ ] 90%+ trigger success rate for all skills
- [ ] No false positives (non-triggers don't activate)
- [ ] Paraphrased requests work
- [ ] Skills load within 1-2 messages
- [ ] No skills trigger on informational queries

#### Results Template

```markdown
## Skill: validate-all

Triggers tested: 4
- "check everything" → ✓ PASS
- "run all validators" → ✓ PASS
- "validate my entire project" → ✓ PASS
- "full audit" → ✓ PASS

Non-triggers tested: 2
- "what is validation?" → ✓ PASS (did not trigger)
- "check my JavaScript" → ✓ PASS (did not trigger)

Success rate: 100% (6/6)
```

### Task 4: Functional Testing for Key Skills

**Objective:** Test actual execution with real/fixture files for top 3 skills.

**Time Estimate:** 30 minutes

#### Setup

```bash
./scripts/test/manual/setup-task-4.sh
```

Creates test workspaces with various fixture files.

#### Manual Test Steps

##### Test 4.1: validate-all on our own project

1. From repo root, run: `/claudelint:validate-all`
2. Observe:
   - [ ] Command executes: `claudelint check-all`
   - [ ] Output is parsed and explained clearly
   - [ ] No error dumps
   - [ ] Actionable next steps provided
   - [ ] Exit code handled correctly

##### Test 4.2: validate-cc-md with fixtures

1. Setup:

   ```bash
   cd /tmp/claudelint-test-4/claude-md-tests
   ```

2. Test with valid CLAUDE.md:

   ```bash
   cp ../fixtures/valid.md CLAUDE.md
   # Ask: "validate my CLAUDE.md"
   ```

   - [ ] Should pass validation
   - [ ] Clear success message

3. Test with oversized CLAUDE.md:

   ```bash
   cp ../fixtures/oversized.md CLAUDE.md
   # Ask: "check my CLAUDE.md"
   ```

   - [ ] Should detect size violation
   - [ ] Explain why it matters
   - [ ] Suggest solutions

4. Test with circular import:

   ```bash
   cp -r ../fixtures/circular-import.md CLAUDE.md
   cp -r ../fixtures/.claude .
   # Ask: "audit my config"
   ```

   - [ ] Should detect circular import
   - [ ] Explain the cycle
   - [ ] Suggest fix

##### Test 4.3: optimize-cc-md with bloated file

1. Setup:

   ```bash
   cd /tmp/claudelint-test-4/optimize-test
   cp ../fixtures/bloated-realistic.md CLAUDE.md
   ```

2. Test: "optimize my CLAUDE.md"
   - [ ] Detects bloat
   - [ ] Explains issues conversationally
   - [ ] Suggests specific improvements
   - [ ] Asks permission before editing
   - [ ] Actually makes changes
   - [ ] Shows before/after

#### Automated Verification

```bash
./scripts/test/manual/verify-task-4.sh
```

Checks:

- All test workspaces created
- Correct fixtures copied
- Commands executed successfully
- Expected violations detected

#### Pass Criteria

- [ ] All 3 skills execute correct commands
- [ ] Output is conversational (not error dumps)
- [ ] Issues detected correctly
- [ ] Explanations include WHY issues matter
- [ ] Actionable next steps provided
- [ ] No crashes or hangs

### Task 5: Quality & UX Testing

**Objective:** Verify conversational quality and user experience across all skills.

**Time Estimate:** 20 minutes

#### Setup

```bash
./scripts/test/manual/setup-task-5.sh
```

#### Manual Test Steps

Test these quality dimensions across 3-4 skills:

##### 5.1: Plain Language (validate-all, validate-cc-md)

- [ ] Avoids jargon or explains technical terms
- [ ] Uses "you" and "your" (conversational)
- [ ] Active voice over passive voice
- [ ] Short sentences, clear structure

##### 5.2: Explains WHY (validate-skills, validate-hooks)

- [ ] Doesn't just list violations
- [ ] Explains why each issue matters
- [ ] Connects violations to real problems
- [ ] Helps user understand consequences

##### 5.3: Actionable Next Steps (validate-mcp, validate-settings)

- [ ] Every issue has clear fix instructions
- [ ] Provides examples when helpful
- [ ] Links to documentation when relevant
- [ ] Prioritizes fixes (what to do first)

##### 5.4: Interactive Experience (optimize-cc-md only)

- [ ] Asks before making changes
- [ ] Shows previews/diffs when editing
- [ ] Handles user saying "no" gracefully
- [ ] Iterative workflow (ask → execute → verify)

##### 5.5: Error Handling (all skills)

Test error scenarios:

1. **Missing claudelint:**

   ```bash
   # Temporarily rename binary
   mv bin/claudelint bin/claudelint.bak
   # Trigger a skill
   # Restore: mv bin/claudelint.bak bin/claudelint
   ```

   - [ ] Clear error message
   - [ ] Shows install instructions
   - [ ] Doesn't crash

2. **Missing file:**

   ```bash
   # Delete CLAUDE.md
   rm CLAUDE.md
   # Ask: "validate my CLAUDE.md"
   ```

   - [ ] Explains file not found
   - [ ] Suggests next steps
   - [ ] Doesn't crash

3. **Invalid JSON:**

   ```bash
   echo "invalid json" > settings.json
   # Ask: "validate my settings"
   ```

   - [ ] Detects JSON syntax error
   - [ ] Shows where error is
   - [ ] Suggests fix

#### Pass Criteria

- [ ] Uses plain language consistently
- [ ] Explains WHY for all violations
- [ ] Provides actionable next steps
- [ ] Interactive experience is natural (optimize-cc-md)
- [ ] Error states handled gracefully
- [ ] No jargon dumps or technical errors shown to user
- [ ] User always knows what to do next

### Task 6: Plugin Installation & Integration

**Objective:** Verify plugin installs correctly and skills load properly.

**Time Estimate:** 15 minutes

#### Setup

```bash
./scripts/test/manual/setup-task-6.sh
```

#### Manual Test Steps

##### 6.1: Local Plugin Install

1. Build package:

   ```bash
   npm run build
   ```

2. Install plugin:

   ```bash
   /plugin install --source .
   ```

   - [ ] Installation succeeds
   - [ ] No errors shown

3. Verify skills load:

   ```bash
   /skills list
   ```

   - [ ] Shows 9 claudelint skills
   - [ ] All skill names correct (validate-all, validate-cc-md, etc.)

4. Test one skill:

   ```bash
   /claudelint:validate-all
   ```

   - [ ] Skill executes
   - [ ] Shows expected output
   - [ ] No errors

##### 6.2: Dependency Detection

1. Uninstall npm package:

   ```bash
   npm uninstall claude-code-lint
   ```

2. Try using skill:

   ```bash
   /claudelint:validate-all
   ```

   - [ ] Shows helpful error
   - [ ] Mentions missing package
   - [ ] Shows install command
   - [ ] Doesn't crash

3. Reinstall:

   ```bash
   npm install
   ```

##### 6.3: Verify Package Contents

```bash
npm pack --dry-run
```

Check output:

- [ ] `.claude/` directory included
- [ ] All 9 SKILL.md files present
- [ ] `bin/claudelint` included
- [ ] Package size reasonable (<5MB)
- [ ] No unnecessary files (node_modules, tests, etc.)

#### Automated Verification

```bash
./scripts/test/manual/verify-task-6.sh
```

Checks:

- Plugin appears in `/plugin list`
- All 9 skills registered
- Package contents correct
- Dependency check works

#### Pass Criteria

- [ ] Plugin installs successfully from local source
- [ ] All 9 skills appear in `/skills list`
- [ ] Skills execute correctly
- [ ] Dependency errors are helpful and clear
- [ ] Package size is reasonable
- [ ] No extraneous files in package

## Recording Test Sessions (Optional)

For visual documentation and future reference, you can record test sessions using asciinema:

```bash
# Install asciinema (if not already installed)
brew install asciinema  # macOS
# or: apt-get install asciinema  # Linux

# Record a session
asciinema rec docs/testing/recordings/task-1-optimize.cast

# ... perform testing ...

# Stop recording: Ctrl+D

# Replay
asciinema play docs/testing/recordings/task-1-optimize.cast
```

Recordings are:

- Lightweight (JSON format)
- Version-controllable
- Shareable (can embed in docs)
- Good for demos and onboarding

## Troubleshooting

### Issue: Skill doesn't trigger

- Check plugin is installed: `/plugin list`
- Check skill exists: `/skills list | grep claudelint`
- Try explicit invocation: `/claudelint:skill-name`
- Check trigger phrase matches description field

### Issue: Automated verification fails

- Check test workspace exists: `ls /tmp/claudelint-test-*`
- Check fixtures copied: `ls /tmp/claudelint-test-*/`
- Run setup script again
- Check script permissions: `chmod +x scripts/test/manual/*.sh`

### Issue: Different results each time

- This is expected (LLM non-determinism)
- Focus on overall behavior, not exact wording
- Use pass/fail criteria, not perfect matching

## Reporting Results

After completing all tests, document results using the template:

```bash
cp docs/testing/manual-test-results-template.md \
   docs/testing/manual-test-results/$(date +%Y-%m-%d).md
```

Then fill in the template with your findings. See `docs/testing/manual-test-results-template.md` for format.

## Next Steps After Testing

Based on test results:

1. **All tests pass:** Ready for release (proceed to Phase 5 Task 5.4)
2. **Some tests fail:** Fix issues, update skills, run tests again
3. **UX improvements needed:** Update SKILL.md files, references, test again
4. **Trigger phrases don't work:** Update description fields, test again

## Continuous Improvement

This runbook should evolve:

- Update when you find better testing approaches
- Add new tests for new skills
- Improve automation scripts
- Document common failure patterns
- Share findings with team

## Estimated Time Breakdown

- Task 1: 30-45 min (optimize-cc-md Phase 1)
- Task 2: 30-45 min (optimize-cc-md Phase 2)
- Task 3: 30 min (trigger phrases)
- Task 4: 30 min (functional testing)
- Task 5: 20 min (quality & UX)
- Task 6: 15 min (plugin installation)

### Total: 2.5-3.5 hours

With breaks and documentation: **3.5-4 hours**
