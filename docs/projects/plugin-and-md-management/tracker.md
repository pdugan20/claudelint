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

**Status**: Not Started
**Duration**: 1 day
**Dependencies**: Phase 0 complete

### Tasks

- [ ] **Task 1.1**: Fix package.json files array bug
  - [ ] Change `"skills"` to `".claude"` in files array
  - [ ] Verify `.claude-plugin` is included
  - [ ] Test local npm pack to verify files included
  - [ ] **Critical**: Without this fix, npm users get ZERO skills

- [ ] **Task 1.2**: Create `.claude-plugin/plugin.json` manifest
  - [ ] Add required `name` field: "claudelint"
  - [ ] Add metadata (version, description, author)
  - [ ] No custom paths needed (use defaults)
  - [ ] Validate JSON syntax

- [ ] **Task 1.3**: Rename generic skills to specific names
  - [ ] Rename `validate-agents-md` → `validate-cc-md` (validates CLAUDE.md files)
  - [ ] Rename `validate` → `validate-all` (validates all project files)
  - [ ] Rename `format` → `format-cc` (formats Claude Code files)
  - [ ] Update SKILL.md name and description in each
  - [ ] Update any cross-references in other skills
  - [ ] Update documentation

- [ ] **Task 1.4**: Update E10 validation rule
  - [ ] Edit `src/rules/skills/overly-generic-name.ts` (or create if doesn't exist)
  - [ ] Add single-word verb detection: "format", "validate", "test", "build", etc.
  - [ ] Flag names that are only a verb without specificity
  - [ ] Add tests for new validation
  - [ ] Update rule documentation

- [ ] **Task 1.5**: Test plugin installation locally
  - [ ] Test: `claude /plugin install --source .`
  - [ ] Verify skills accessible with new names:
    - `/claudelint:validate-all`
    - `/claudelint:validate-cc-md`
    - `/claudelint:format-cc`
    - `/claudelint:optimize-cc-md`
  - [ ] Test skill invocation works

- [ ] **Task 1.6**: Update README and documentation
  - [ ] Add plugin installation section
  - [ ] Document skill namespace usage
  - [ ] Add comparison: npm CLI vs plugin
  - [ ] Update naming guidance with new rules

### Acceptance Criteria

- [ ] npm pack includes `.claude/` directory
- [ ] `plugin.json` validates successfully
- [ ] All 3 skills renamed with specific names (validate-all, validate-cc-md, format-cc)
- [ ] E10 rule updated to flag single-word verbs
- [ ] Plugin installable locally
- [ ] Skills accessible via `/claudelint:` namespace with new names
- [ ] Documentation updated with new naming guidance

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
