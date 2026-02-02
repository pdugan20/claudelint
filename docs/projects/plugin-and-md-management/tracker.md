# Implementation Tracker

**Last Updated**: 2026-02-02

Track progress across all phases. Mark tasks complete with `[x]` as you finish them.

## Phase 0: Research & Planning

**Status**: Complete
**Duration**: 1 day

- [x] Review Claude skills PDF best practices
- [x] Research plugin distribution model
- [x] Document skill naming constraints (no "claude"/"anthropic")
- [x] Create project structure in docs/projects/
- [x] Finalize skill names for CLAUDE.md management
- [x] Review existing skills for namespace compatibility
- [x] Confirmed 14 CLAUDE.md validation rules already exist in src/rules/claude-md/
- [x] Confirmed /init command is closed-source, not in public repo

## Key Findings

- **CLAUDE.md validation already implemented**: 14 rules exist covering imports, size, sections, etc.
- **/init is closed-source**: Built-in CLI command, not in github.com/anthropics/claude-code repo
- **Package.json bug**: `"files": ["skills"]` should be `".claude"` - npm users get zero skills
- **Skill naming**: Use `-cc-md` suffix (cc = Claude Code configuration)

## Phase 1: Critical Bug Fixes & Plugin Infrastructure

**Status**: In Progress
**Duration**: 1 day
**Dependencies**: Phase 0 complete

### Tasks

- [x] **Task 1.1**: Fix package.json files array bug
  - [x] Remove invalid `"skills"` entry (directory doesn't exist)
  - [x] Remove `".claude"` (only needed for plugin install from GitHub, not npm)
  - [x] npm package should be CLI-only: `["dist", "bin", "README.md", "LICENSE"]`
  - [x] **Understanding**: npm and plugin are SEPARATE distribution channels

  **Distribution Model Clarification:**

  We have TWO separate distribution channels:

  1. **npm package** (CLI only):
     ```bash
     npm install -g claude-code-lint
     claudelint validate  # CLI works
     ```
     - Users get CLI tool
     - Skills NOT accessible in Claude Code
     - No need to include `.claude/` directory

  2. **Claude Code plugin** (skills only):
     ```bash
     claude /plugin install github:pdugan20/claudelint
     ```
     - Claude Code clones from GitHub
     - Reads `.claude/skills/` from Git repo
     - Skills available: `/claudelint:validate-all`
     - npm package is irrelevant

  **Verification Steps:**
  1. Before fix: `npm pack && tar -tzf claude-code-lint-*.tgz | grep "\.claude/"` (should be empty or shouldn't exist)
  2. Make change: Remove `"skills"` and `".claude"` from files array
  3. After fix: Verify only CLI files included:
     ```bash
     npm pack
     tar -tzf claude-code-lint-*.tgz | grep -E "^package/(dist|bin|README|LICENSE)" | head -10
     tar -tzf claude-code-lint-*.tgz | grep "\.claude" # should be empty
     ```
  4. Verify package is smaller (no skills bloat)
  5. Test CLI install: `npm install -g ./claude-code-lint-*.tgz && claudelint --version`
  6. Clean up: `rm claude-code-lint-*.tgz && npm uninstall -g claude-code-lint`

- [x] **Task 1.2**: Create `.claude-plugin/plugin.json` manifest
  - [x] Add required `name` field: "claudelint"
  - [x] Add metadata (version, description, author)
  - [x] No custom paths needed (use defaults)

  **Verification Steps:**
  1. Create `.claude-plugin/plugin.json` with minimal required fields
  2. Validate JSON syntax: `cat .claude-plugin/plugin.json | jq .` (should output formatted JSON)
  3. Verify required field: `jq -r '.name' .claude-plugin/plugin.json` (should output "claudelint")
  4. Verify in npm pack: `npm pack && tar -tzf claude-code-lint-*.tgz | grep "plugin.json"` (should see it)
  5. Clean up: `rm claude-code-lint-*.tgz`

- [ ] **Task 1.3**: Rename generic skills to specific names
  - [ ] Rename `validate-agents-md` → `validate-cc-md` (validates CLAUDE.md files)
  - [ ] Rename `validate` → `validate-all` (validates all project files)
  - [ ] Rename `format` → `format-cc` (formats Claude Code files)
  - [ ] Update SKILL.md name and description in each
  - [ ] Update any cross-references in other skills
  - [ ] Update documentation

  **Verification Steps (repeat for each skill):**

  For validate-agents-md → validate-cc-md:
  1. Before: `ls .claude/skills/validate-agents-md/SKILL.md` (should exist)
  2. Rename directory: `mv .claude/skills/validate-agents-md .claude/skills/validate-cc-md`
  3. Update frontmatter: Edit SKILL.md, change `name: validate-agents-md` to `name: validate-cc-md`
  4. Update description to mention "CLAUDE.md" not "agents"
  5. After: `ls .claude/skills/validate-agents-md` (should fail), `ls .claude/skills/validate-cc-md/SKILL.md` (should exist)
  6. Verify frontmatter: `grep "^name: validate-cc-md" .claude/skills/validate-cc-md/SKILL.md`

  For validate → validate-all:
  1. Before: `ls .claude/skills/validate/SKILL.md`
  2. Rename: `mv .claude/skills/validate .claude/skills/validate-all`
  3. Update SKILL.md name field
  4. After: Verify old dir gone, new dir exists, frontmatter correct

  For format → format-cc:
  1. Before: `ls .claude/skills/format/SKILL.md`
  2. Rename: `mv .claude/skills/format .claude/skills/format-cc`
  3. Update SKILL.md name field
  4. After: Verify old dir gone, new dir exists, frontmatter correct

  Check for stale references:
  ```bash
  grep -r "validate\"" .claude/skills/  # should find nothing with old name
  grep -r "format\"" .claude/skills/   # should find nothing with old name
  grep -r "validate-agents-md" docs/  # should find nothing
  ```

- [ ] **Task 1.4**: Update E10 validation rule
  - [ ] Locate rule file: Check if `src/rules/skills/overly-generic-name.ts` exists
  - [ ] Add single-word verb detection: "format", "validate", "test", "build", "deploy"
  - [ ] Flag names that are only a verb without specificity
  - [ ] Add tests for new validation
  - [ ] Update rule documentation

  **Verification Steps:**
  1. Find the rule: `find src -name "*generic*name*"`
  2. Write test first (should fail initially):
     ```typescript
     it('should flag single-word verb names', () => {
       const result = validateSkill({ name: 'format' });
       expect(result).toContainWarning('overly-generic-name');
     });
     ```
  3. Run test: `npm test -- --testNamePattern="overly-generic-name"` (should fail)
  4. Update rule to detect single-word verbs (format, validate, test, build, deploy)
  5. Run test again: `npm test -- --testNamePattern="overly-generic-name"` (should pass)
  6. Test on BEFORE renaming our skills:
     ```bash
     # Should flag these (before we rename them)
     claudelint validate-skills --path .claude/skills/validate 2>&1 | grep "generic"
     claudelint validate-skills --path .claude/skills/format 2>&1 | grep "generic"
     # Should NOT flag these
     claudelint validate-skills --path .claude/skills/validate-hooks 2>&1 | grep "generic" && echo "FAIL" || echo "PASS"
     ```
  7. Run full test suite: `npm test`

- [ ] **Task 1.5**: Test plugin installation locally
  - [ ] Test local plugin installation
  - [ ] Verify all skills accessible with namespaces
  - [ ] Verify old skill names don't work
  - [ ] Test skill invocation works

  **Verification Steps:**
  1. Build package: `npm pack`
  2. Install as plugin: `claude /plugin install --source .`
  3. In Claude Code session, verify skills are listed: `/skills` (should show claudelint:* skills)
  4. Test each renamed skill namespace:
     ```
     /claudelint:validate-all
     /claudelint:format-cc
     /claudelint:validate-cc-md
     ```
  5. Verify old names DON'T trigger:
     ```
     /claudelint:validate  # should not be found
     /claudelint:format    # should not be found
     /claudelint:validate-agents-md  # should not be found
     ```
  6. Test skill execution: Run `/claudelint:validate-all` and verify it actually executes
  7. Uninstall: `claude /plugin uninstall claudelint`
  8. Reinstall to ensure clean state: `claude /plugin install --source .`
  9. Clean up: `rm claude-code-lint-*.tgz`

- [ ] **Task 1.6**: Update README and documentation
  - [ ] Add plugin installation section
  - [ ] Document skill namespace usage
  - [ ] Add comparison: npm CLI vs plugin
  - [ ] Update naming guidance with new rules

  **Verification Steps:**
  1. Check main README has plugin installation section: `grep -A5 "plugin install" README.md`
  2. Verify all skill names updated in README: `grep "validate-all\|format-cc\|validate-cc-md" README.md`
  3. Check no old skill names remain: `grep -E "^/validate\"|^/format\"" README.md` (should be empty)
  4. Verify skill docs updated: Check `.claude/skills/*/SKILL.md` files have correct names
  5. Run markdownlint: `npm run lint:md` (should pass)
  6. Run full lint: `npm run lint` (should pass)

### Acceptance Criteria

- [ ] npm pack includes `.claude/` directory
- [ ] `plugin.json` validates successfully
- [ ] All 3 skills renamed with specific names (validate-all, validate-cc-md, format-cc)
- [ ] E10 rule updated to flag single-word verbs
- [ ] Plugin installable locally
- [ ] Skills accessible via `/claudelint:` namespace with new names
- [ ] Documentation updated with new naming guidance

### End-to-End Integration Test

**Run this complete test after all Phase 1 tasks:**

```bash
#!/bin/bash
set -e

echo "=== Phase 1 Integration Test ==="

echo "1. Testing package.json fix..."
npm pack
tar -tzf claude-code-lint-*.tgz | grep ".claude/skills/validate-all" || { echo "FAIL: skills not in package"; exit 1; }

echo "2. Testing plugin.json..."
tar -tzf claude-code-lint-*.tgz | grep "plugin.json" || { echo "FAIL: plugin.json not in package"; exit 1; }
cat .claude-plugin/plugin.json | jq . > /dev/null || { echo "FAIL: invalid JSON"; exit 1; }

echo "3. Testing skill renames..."
[ ! -d .claude/skills/validate ] || { echo "FAIL: old validate dir still exists"; exit 1; }
[ ! -d .claude/skills/format ] || { echo "FAIL: old format dir still exists"; exit 1; }
[ ! -d .claude/skills/validate-agents-md ] || { echo "FAIL: old validate-agents-md dir still exists"; exit 1; }
[ -d .claude/skills/validate-all ] || { echo "FAIL: validate-all dir missing"; exit 1; }
[ -d .claude/skills/format-cc ] || { echo "FAIL: format-cc dir missing"; exit 1; }
[ -d .claude/skills/validate-cc-md ] || { echo "FAIL: validate-cc-md dir missing"; exit 1; }

echo "4. Testing E10 rule..."
npm test -- --testNamePattern="overly-generic-name" || { echo "FAIL: E10 tests failed"; exit 1; }

echo "5. Testing frontmatter updates..."
grep "^name: validate-all" .claude/skills/validate-all/SKILL.md || { echo "FAIL: validate-all frontmatter"; exit 1; }
grep "^name: format-cc" .claude/skills/format-cc/SKILL.md || { echo "FAIL: format-cc frontmatter"; exit 1; }
grep "^name: validate-cc-md" .claude/skills/validate-cc-md/SKILL.md || { echo "FAIL: validate-cc-md frontmatter"; exit 1; }

echo "6. Running full test suite..."
npm test || { echo "FAIL: test suite failed"; exit 1; }

echo "7. Running linters..."
npm run lint || { echo "FAIL: linting failed"; exit 1; }

echo ""
echo "=== All Phase 1 Integration Tests PASSED ==="
echo ""
echo "Manual verification still needed:"
echo "  - Install plugin: claude /plugin install --source ."
echo "  - Test skills: /claudelint:validate-all, /claudelint:format-cc, /claudelint:validate-cc-md"
echo "  - Verify old names don't work: /claudelint:validate, /claudelint:format"

rm claude-code-lint-*.tgz
```

Save this as `scripts/test-phase-1.sh` and run after completing all tasks.

## Phase 2: Create optimize-cc-md Skill

**Status**: Not Started
**Duration**: 3-4 days
**Dependencies**: Phase 1 complete

**What This Skill Does**: Provides instructions for Claude to **interactively help users fix their CLAUDE.md files**. When user runs `/optimize-cc-md`, Claude reads the skill instructions and:
1. Runs `claudelint check-claude-md` to get violations
2. Reads user's CLAUDE.md file
3. Explains violations conversationally
4. Asks what they want to fix
5. **Actually edits the file** using Edit/Write tools
6. Creates new @import files if needed
7. Shows before/after results

**This is NOT**: A CLI script, automated tool, or non-interactive validator. It's instructions for Claude to work with the user.

### Tasks

- [ ] **Task 2.1**: Create skill directory structure
  - [ ] `.claude/skills/optimize-cc-md/`
  - [ ] `SKILL.md` with frontmatter
  - [ ] No README.md (forbidden in skills)
  - [ ] Optional: `references/` for best practices examples

- [ ] **Task 2.2**: Write SKILL.md frontmatter
  - [ ] Name: `optimize-cc-md`
  - [ ] Description: "Help users optimize their CLAUDE.md files interactively"
  - [ ] Trigger phrases: "optimize CLAUDE.md", "audit my config", "improve CLAUDE.md", "fix my CLAUDE.md"
  - [ ] Allowed tools: Bash, Read, Edit, Write, Grep
  - [ ] Keep under 1024 characters

- [ ] **Task 2.3**: Write skill instructions for Claude
  - [ ] Step 1: Run `claudelint check-claude-md --explain`
  - [ ] Step 2: Read user's CLAUDE.md file with Read tool
  - [ ] Step 3: Explain violations in conversational language (not just dump CLI output)
  - [ ] Step 4: Identify specific problems:
    - File too long (>200 lines)
    - Obvious content (generic advice)
    - Config duplication (.eslintrc, .prettierrc)
    - Poor organization (many sections)
  - [ ] Step 5: Ask user what to fix first
  - [ ] Step 6: Use Edit tool to make changes
  - [ ] Step 7: Use Write tool to create @import files if splitting content
  - [ ] Step 8: Show before/after comparison
  - [ ] Keep all instructions under 5,000 words

- [ ] **Task 2.4**: Add examples to skill
  - [ ] Example violation: "Line 45-52 say 'write clean code' - that's obvious, should I remove?"
  - [ ] Example fix: "I'll move your testing section to @docs/testing.md and replace with import"
  - [ ] Example workflow: User approves → Claude makes edits → Shows results

- [ ] **Task 2.5**: Test skill
  - [ ] Test on bloated CLAUDE.md (>300 lines)
  - [ ] Test on well-optimized CLAUDE.md
  - [ ] Verify trigger phrases work
  - [ ] Ensure skill doesn't trigger on "what is CLAUDE.md?" type questions
  - [ ] Test actual file editing works

### Acceptance Criteria

- [ ] Skill loads when user runs `/optimize-cc-md`
- [ ] Claude follows instructions to run validation
- [ ] Claude reads CLAUDE.md file
- [ ] Claude explains violations conversationally (not just CLI dump)
- [ ] Claude asks for confirmation before edits
- [ ] Claude actually makes edits using Edit/Write tools
- [ ] Claude creates @import files when needed
- [ ] Trigger phrases work without false positives

## Phase 3: Documentation & Polish

**Status**: Not Started
**Duration**: 1-2 days
**Dependencies**: Phase 2 complete

### Tasks

- [ ] **Task 3.1**: Update main README
  - [ ] Add plugin installation section
  - [ ] Document skill namespace usage (`/claudelint:optimize-cc-md`)
  - [ ] Update feature list
  - [ ] Add optimize-cc-md usage example

- [ ] **Task 3.2**: Document skill rename
  - [ ] Update any docs referencing validate-agents-md
  - [ ] Add migration note in CHANGELOG
  - [ ] Update skills list

- [ ] **Task 3.3**: Update skill documentation
  - [ ] Document optimize-cc-md usage
  - [ ] Add examples of violations it catches
  - [ ] Document trigger phrases

### Acceptance Criteria

- [ ] README reflects plugin installation
- [ ] Skill rename documented
- [ ] No broken references to old skill name

## Phase 4: Testing & Release

**Status**: Not Started
**Duration**: 1 day
**Dependencies**: Phase 3 complete

### Tasks

- [ ] **Task 4.1**: Integration testing
  - [ ] Test plugin installation: `claude /plugin install --source .`
  - [ ] Test skill namespace: `/claudelint:optimize-cc-md`
  - [ ] Test skill rename: `/claudelint:validate-cc-md`
  - [ ] Verify npm pack includes .claude/ directory

- [ ] **Task 4.2**: Test optimize-cc-md skill
  - [ ] Test on bloated CLAUDE.md file
  - [ ] Test on optimized CLAUDE.md file
  - [ ] Verify trigger phrases work
  - [ ] Ensure validation integration works

- [ ] **Task 4.3**: Version bump & release
  - [ ] Determine semver bump (likely minor: 0.2.x → 0.3.0)
  - [ ] Run `npm run release` (auto-generates CHANGELOG)
  - [ ] Verify `npm run sync:versions` runs
  - [ ] Push tags to GitHub

- [ ] **Task 4.4**: Publish
  - [ ] npm publish
  - [ ] Create GitHub release
  - [ ] Update release notes

### Acceptance Criteria

- [ ] All tests passing
- [ ] Plugin installable from GitHub
- [ ] npm package includes skills
- [ ] Release published

## Progress Summary

```
Phase 0: [██████████] 100% (Complete)
Phase 1: [░░░░░░░░░░]   0% (0/6 tasks)
Phase 2: [░░░░░░░░░░]   0% (0/5 tasks)
Phase 3: [░░░░░░░░░░]   0% (0/3 tasks)
Phase 4: [░░░░░░░░░░]   0% (0/4 tasks)

Overall: [██░░░░░░░░] 17% (Phase 0 complete, 18 total tasks)
```

## Estimated Timeline

- **Phase 0**: **Good** Complete
- **Phase 1**: 1.5 days (bug fixes + plugin setup + skill renames + E10 update)
- **Phase 2**: 3-4 days (optimize-cc-md skill)
- **Phase 3**: 1-2 days (documentation)
- **Phase 4**: 1 day (testing & release)

**Total**: 6.5-8.5 days (1.5 weeks)

**Phase 1 breakdown**:
- Package.json fix + plugin.json: 2 hours
- Rename 3 skills: 3 hours (1 hour each)
- Update E10 rule: 1-2 hours
- Testing: 2 hours
- Documentation: 1 hour

## Risks & Blockers

### Resolved

1. **Good** **Plugin distribution unclear** - Confirmed npm + plugin.json works
2. **Good** **Building redundant validation rules** - Discovered 14 rules already exist
3. **Good** **Building redundant init skill** - Confirmed /init is built-in (closed-source)

### Remaining Risks

1. **optimize-cc-md skill complexity**
   - Risk: Skill instructions might be too complex/long
   - Mitigation: Keep SKILL.md under 5,000 words, use progressive disclosure
   - Status: Design in progress

2. **Skill trigger phrase overtriggering**
   - Risk: Skill triggers on unrelated queries
   - Mitigation: Test trigger phrases carefully, use specific language
   - Status: Testing needed

### Active Blockers

None currently.

## Notes

### Skill Naming (Anthropic Guide p11)

- **Reserved words**: CANNOT use "claude" or "anthropic" in names
- **Avoid generic names**: Single-word verbs cause triggering issues (p11)
- **Be specific**: Use suffixes like `-all`, `-cc`, `-cc-md` to clarify scope
- **Examples of bad names**: `format`, `validate`, `test` (too generic)
- **Examples of good names**: `format-cc`, `validate-all`, `validate-cc-md`

### Skill Structure

- Skill folders MUST NOT contain README.md
- Keep SKILL.md under 5,000 words
- Description field triggers skill - be specific, include trigger phrases
- Use progressive disclosure - move details to references/

### Project-Specific Notes

- /init command is closed-source (not in public repo)
- 14 CLAUDE.md validation rules already exist in src/rules/claude-md/
- Package.json bug: `"skills"` should be `".claude"` - npm users get nothing
