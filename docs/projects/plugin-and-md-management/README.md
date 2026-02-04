# Plugin & CLAUDE.md Management Project

**Status**: Phase 2.6 In Progress (90% complete)
**Priority**: High
**Last Updated**: 2026-02-03

## Overview

Transform claudelint from an npm CLI tool into a dual-purpose package: a CLI tool AND a proper Claude Code plugin. Add comprehensive CLAUDE.md validation and management capabilities.

## Quick Links

### Main Documents

- **[tracker.md](./tracker.md)** - Central task tracker with all phases
- **[phase-2-7-summary.md](./phase-2-7-summary.md)** - NEW: Summary of skill quality improvements
- **[skill-improvement-guidelines.md](./skill-improvement-guidelines.md)** - NEW: Reference for improving existing skills

### Supporting Documents

- [Plugin Manifest Spec](./plugin-manifest-spec.md) - plugin.json requirements
- [CLAUDE.md Best Practices](./claude-md-best-practices.md) - Extracted from official docs
- [Skill Specifications](./skill-specifications.md) - New skills to create
- [Validation Rules](./validation-rules.md) - New CLAUDE.md validation rules

### Phase 2 Documentation

- [Schema Verification Workflow](./schema-verification-workflow.md) - Dual-schema verification process
- [Truth Registry Proposal](./truth-registry-proposal.md) - Schema verification design
- [Phase 2.3 Verification](./phase-2-3-verification.md) - Verification audit results

## Goals

### Primary Goals

1. **Fix critical package.json bug**
   - **Bug**: `"files": ["skills"]` but skills are in `.claude/skills/`
   - **Impact**: npm users currently get ZERO skills
   - **Fix**: Change to `".claude"` in files array

2. **Make claudelint a proper Claude Code plugin**
   - Add `.claude-plugin/plugin.json` manifest
   - Enable installation via `/plugin install github:pdugan20/claudelint`
   - Skills become available as `/claudelint:validate-cc-md`, `/claudelint:optimize-cc-md`, etc.

3. **Rename generic skills to specific names**
   - `validate-agents-md` → `validate-cc-md` (validates CLAUDE.md files)
   - `validate` → `validate-all` (validates all project files)
   - `format` → `format-cc` (formats Claude Code files)
   - **Reason**: Generic single-word names cause triggering issues (Anthropic guide p11)

4. **Update E10 validation rule**
   - Add detection for single-word verb names
   - Flag names like "format", "validate", "test", "build" without specificity
   - Prevent future generic skill names

5. **Create optimize-cc-md skill**
   - **Interactive help**: When user runs `/optimize-cc-md`, Claude helps them fix their CLAUDE.md
   - Claude runs validation, reads their file, explains violations conversationally
   - Claude asks what to fix, then **actually makes the edits** using Edit/Write tools
   - Creates @import files if needed to split content
   - Shows before/after results
   - **Note**: NOT building init skill - `/init` already exists as built-in command

### Secondary Goals

- Document both installation methods (npm CLI vs plugin)
- Update README with plugin installation instructions

## Key Constraints

### Skill Naming Rules (Anthropic Guide p11)

**CRITICAL**: Skills CANNOT use "claude" or "anthropic" in their names (reserved by Anthropic)

**ALSO AVOID**: Generic names cause "wrong skill triggers" (guide p11)

**Good** **Good naming patterns:**

- Be specific about what the skill does
- Use suffixes to clarify scope:
  - `-all` for comprehensive actions (`validate-all`)
  - `-cc` for Claude Code operations (`format-cc`, `validate-cc-md`, `optimize-cc-md`)
  - Specific targets: `-hooks`, `-settings`, `-skills`
- Multi-word names preferred over single words

**Bad** **Forbidden patterns:**

- Reserved words: `claude`, `anthropic`
- Single-word verbs: `format`, `validate`, `test`, `build`, `deploy`
- Generic nouns only: `helper`, `utils`, `tool`, `manager`
- Made-up terms not from docs: `workspace-config-*`

**Good** **Examples:**

- `validate-all` (not `validate`)
- `format-cc` (not `format`)
- `validate-cc-md` (not `validate-agents-md` or `claude-md-validate`)
- `optimize-cc-md` (not `optimize`)

**Bad** **Bad examples:**

- `format` - Too generic, what does it format?
- `validate` - Too generic, what does it validate?
- `claude-md-init` - Uses reserved word "claude"

### Technical Requirements (FROM PDF)

- SKILL.md must be exactly that (case-sensitive)
- NO README.md inside skill folders
- Skill folder names must be kebab-case
- Folder name must match `name` field in frontmatter
- Description must include WHAT and WHEN (trigger phrases)
- Keep SKILL.md under 5,000 words
- No XML tags (< >) in frontmatter

## Success Metrics

- [x] Package.json fixed - includes CLI + skills for plugin registration
- [x] Plugin.json created at repository root
- [x] All skills work with `/claudelint:` namespace
- [x] Generic skills renamed (validate-all, format-cc, validate-cc-md)
- [x] E10 rule created to flag single-word verbs (skill-overly-generic-name)
- [x] Plugin.json schema fixed to match official spec (deleted 2 invalid rules)
- [x] Skills have dependency checks (shared wrapper, fail gracefully if npm missing)
- [x] Plugin.json description documents npm dependency requirement
- [x] Three plugin installation helpers (postinstall, command, init wizard)
- [x] README updated to emphasize project install over global
- [x] Plugin structure verified (automated checks, ready for manual testing)
- [ ] Plugin tested manually with Claude Code (needs human verification)
- [ ] optimize-cc-md skill catches common CLAUDE.md issues
- [ ] Documentation trimmed to ESLint/Prettier length (~300-400 lines)
- [ ] No more generic skill names that cause triggering issues

## Distribution Strategy

**IMPORTANT**: We have TWO SEPARATE distribution channels:

### For Skills (Claude Code Plugin) - Recommended for Interactive Use

```bash
claude /plugin install github:pdugan20/claudelint
```

**What happens:**

- Claude Code clones repo from GitHub
- Reads `.claude/skills/` from Git repo (not npm)
- Skills immediately available with namespace

**Skills available:**

- `/claudelint:validate-all` (renamed from validate)
- `/claudelint:format-cc` (renamed from format)
- `/claudelint:validate-cc-md` (renamed from validate-agents-md)
- `/claudelint:validate-skills`
- `/claudelint:validate-hooks`
- `/claudelint:validate-settings`
- `/claudelint:validate-mcp`
- `/claudelint:validate-plugin`
- `/claudelint:optimize-cc-md` (new)

**Note:** CLI also works if user runs `npm install` in cloned repo.

### For CLI Only (npm Package) - For CI/CD and Automation

```bash
npm install -g claude-code-lint
claudelint validate
```

**What happens:**

- npm installs CLI tool only
- CLI commands work: `claudelint validate`, `claudelint format`, etc.
- Skills NOT accessible in Claude Code sessions

**npm package contents:**

- `dist/` - Compiled CLI code
- `bin/` - Binary wrapper
- `README.md`, `LICENSE`
- **Does NOT include** `.claude/` directory (that's only in Git repo for plugin install)

### Why Two Channels?

**Plugin install (GitHub):**

- For interactive Claude Code sessions
- Skills work: `/claudelint:validate-all`
- Clone entire repo including `.claude/skills/`

**npm install:**

- For CI/CD pipelines, pre-commit hooks, automation
- CLI only: `claudelint validate`
- No need for skills directory

### Plugin Dependency Model

**CRITICAL**: Skills depend on npm package being installed.

Following the LSP plugin pattern (e.g., `pyright-lsp` plugin requires `pyright-langserver` binary), our plugin requires the npm CLI package:

**The dependency relationship:**

```text
claudelint plugin (skills) → depends on → claude-code-lint npm package (CLI binary)
```

**User flow via marketplace (skills.sh, claudemarketplaces.com):**

1. User discovers plugin in marketplace
2. Runs `/plugin install github:pdugan20/claudelint`
3. Tries `/claudelint:validate-all`
4. **Skill runs `claudelint check-all` internally**
5. If npm package not installed: "Error: claudelint CLI not installed"

**How we handle this:**

1. **plugin.json description** documents npm dependency requirement
2. **All skill scripts check** if `claudelint` command exists before running
3. **Show helpful error** with installation instructions if missing
4. **Matches LSP pattern** - users understand this model from other plugins

**Example dependency check in skill scripts:**

```bash
#!/usr/bin/env bash
if ! command -v claudelint &> /dev/null; then
    echo "Error: claudelint CLI not installed"
    echo ""
    echo "This skill requires the claudelint npm package."
    echo "Install it first:"
    echo "  npm install -g claude-code-lint"
    echo ""
    echo "Then try this skill again."
    exit 1
fi

claudelint check-all "$@"
```

**Why this is correct:**

- Matches established pattern (LSP plugins require binaries)
- Skills fail gracefully with clear instructions
- Separates concerns: npm = CLI tool, plugin = interactive skills
- Users can use either or both based on needs

### Current Bug

**package.json bug:** `"files": ["skills"]` - directory doesn't exist
**Fix:** Remove from files array - skills are only for plugin install from GitHub

## Key Research Findings

### Generic Skill Names Cause Issues

**Problem**: 3 of our skills have overly generic names (Anthropic guide p11)

- `validate` - Too generic, what does it validate?
- `format` - Too generic, what does it format?
- `validate-agents-md` - Misleading name (validates CLAUDE.md not AGENTS.md)

**Impact**: "Wrong skill triggers" - skills activate on unrelated queries

**Solution**:

- Rename to specific names: `validate-all`, `format-cc`, `validate-cc-md`
- Update E10 rule to catch single-word verbs
- Prevent future generic skill names

### CLAUDE.md Validation Already Exists

**Found 14 existing rules in `src/rules/claude-md/`:**

- claude-md-import-missing
- claude-md-import-circular
- claude-md-import-depth-exceeded
- claude-md-size-warning
- claude-md-size-error
- claude-md-content-too-many-sections
- And 8 more...

**Impact**: Don't build new validation rules. Build optimize-cc-md skill that wraps existing validators.

### /init Command is Closed-Source

Researched `/init` command implementation:

- **Not in public repo**: github.com/anthropics/claude-code is examples/plugins only
- **Built into CLI binary**: Distributed via curl/Homebrew/WinGet
- **Functionality**: Generates CLAUDE.md by analyzing project (from GitHub issues)
- **Can fail**: Token limit errors on large projects

**Impact**: Don't build init skill - /init already exists and works.

### Package.json Critical Bug

**Bug**: `"files": ["skills"]` but skills are in `.claude/skills/`
**Impact**: npm users get ZERO skills currently
**Fix**: Change to `".claude"` in files array

## Phase Status

### Completed Phases

1. **Phase 0**: Research & Planning - Complete (1 day)
2. **Phase 1**: Bug Fixes & Plugin Infrastructure - Complete (1.5 days)
   - Fixed package.json files array
   - Created plugin.json manifest
   - Renamed 3 generic skills (validate-all, format-cc, validate-cc-md)
   - Fixed plugin.json schema
   - Created E10 rule (skill-overly-generic-name)
   - Added dependency checks to skills
   - Updated documentation
3. **Phase 2.1-2.5**: Schema Verification System - Complete (9 days)
   - Created manual reference schemas for all 8 schemas
   - Built automated comparison tool
   - Fixed drift in 6/8 schemas (75% had issues!)
   - Integrated into CI/CD
4. **Phase 2.6**: Rule Deprecation System - 90% Complete (0.5 days remaining)
   - [x] Tasks 2.6.1-2.6.5 (Research, Design, Implementation, Tooling)
   - [ ] Task 2.6.6: Documentation (in progress)
5. **Phase 2.7**: Skill Quality Improvements - Complete (1 day)
   - Updated all 8 skill descriptions with trigger phrases
   - Added troubleshooting to top 3 skills (validate-all, validate-cc-md, validate-skills)
   - Added scenario-based examples with real problems (not generic)
   - Added standard fields (tags, dependencies) to all skills
   - Verified progressive disclosure not needed (largest skill: 862 words)
   - See [phase-2-7-summary.md](./phase-2-7-summary.md) for details

### Planned

1. **Phase 3**: Create optimize-cc-md Skill - Not Started (3-4 days)
   - Updated with progressive disclosure design
   - Create references/ for detailed strategies
   - Interactive CLAUDE.md optimization

2. **Phase 4**: Documentation & Polish - Not Started (2-3 days)
   - Expanded with plugin-specific README
   - Skill development standards documentation
   - Updated CONTRIBUTING.md

3. **Phase 5**: Testing & Release - Not Started (2-3 days)
   - Complete rewrite with Anthropic testing methodology
   - Triggering tests, functional tests, performance comparison
   - Integration testing
   - Version 0.3.0 release

**Current Status**: Phase 2.7 complete. Phase 2.6 documentation remaining (90% complete). Ready to start Phase 3.
**Total Progress**: 80% complete (12.5 / ~23 days)
**Total Remaining**: 8-12 days

See [tracker.md](./tracker.md) for detailed task breakdown.

## Recent Updates (2026-02-03)

### Added Phase 2.7: Skill Quality Improvements

After analyzing Anthropic's "Complete Guide to Building Skills for Claude" (Jan 2026), we identified critical improvements needed for our existing skills.

**Key Decision**: Keep current 8-skill structure (don't consolidate)

- Anthropic emphasizes composability, not consolidation (p5)
- validate-all already serves as orchestrator
- Individual skills have legitimate use cases

**5 Improvements** (see [skill-improvement-guidelines.md](./skill-improvement-guidelines.md)):

1. **Update descriptions with trigger phrases** (HIGH) - All 8 skills
2. **Add skill-specific troubleshooting** (HIGH) - Top 3 skills
3. **Add scenario-based examples** (MEDIUM) - Top 3 skills
4. **Add metadata fields** (LOW) - All 8 skills
5. **Check progressive disclosure** (LOW) - If any skill >5000 words

**Impact**:

- Adds 1-2 days to timeline
- Establishes quality standards before creating optimize-cc-md
- All skills benefit, not just new ones

**Why now?**

- Phase 2.6 (deprecation) nearly complete
- Better to establish standards before Phase 3
- optimize-cc-md will follow these standards from day 1

See [phase-2-7-summary.md](./phase-2-7-summary.md) for full details.

## Related Projects

- [skills-quality-validation](../skills-quality-validation/) - Skill validation rules
- [npm-release-setup](../npm-release-setup/) - Release automation
