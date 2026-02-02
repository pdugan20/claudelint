# Plugin & CLAUDE.md Management Project

**Status**: In Progress (Phase 1: 83% complete)
**Priority**: High
**Last Updated**: 2026-02-02

## Overview

Transform claudelint from an npm CLI tool into a dual-purpose package: a CLI tool AND a proper Claude Code plugin. Add comprehensive CLAUDE.md validation and management capabilities.

## Quick Links

- [Implementation Tracker](./tracker.md) - Central task tracker with phases
- [Plugin Manifest Spec](./plugin-manifest-spec.md) - plugin.json requirements
- [CLAUDE.md Best Practices](./claude-md-best-practices.md) - Extracted from official docs
- [Skill Specifications](./skill-specifications.md) - New skills to create
- [Validation Rules](./validation-rules.md) - New CLAUDE.md validation rules

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

- [x] Package.json bug fixed - npm users get CLI only (skills via plugin install)
- [x] Plugin.json created at repository root
- [x] All skills work with `/claudelint:` namespace
- [x] Generic skills renamed (validate-all, format-cc, validate-cc-md)
- [x] E10 rule created to flag single-word verbs (skill-overly-generic-name)
- [x] Plugin.json schema fixed to match official spec (deleted 2 invalid rules)
- [ ] Plugin tested locally with Claude Code
- [ ] optimize-cc-md skill catches common CLAUDE.md issues
- [ ] Documentation covers both distribution methods
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

1. **Phase 1**: Fix package.json bug and create plugin.json - **83% COMPLETE** (5/6 tasks done)
   - [x] Fixed package.json files array
   - [x] Created plugin.json manifest
   - [x] Renamed 3 generic skills
   - [x] Fixed plugin.json schema (aligned with official spec)
   - [x] Created E10 rule (skill-overly-generic-name)
   - [ ] Test plugin locally
   - [ ] Update documentation
2. **Phase 2**: Schema & constant verification system (9-14 days) **NEW - CRITICAL**
   - Includes Phase 2.6: Rule Deprecation System
3. **Phase 3**: Build optimize-cc-md skill (3-4 days)
4. **Phase 4**: Update documentation (1-2 days)
5. **Phase 5**: Test and release (1 day)

**Current Status**: Phase 1 nearly complete, 2 tasks remaining (test locally, docs)
**Total Estimated**: 15-22 days

See [tracker.md](./tracker.md) for detailed task breakdown.

### Phase 2 - New Critical Work

During Phase 1, discovered systematic issues with schema and constant verification:
- **19 sources of truth** need verification (10 schemas + 9 constants)
- **1 critical schema out of sync** (PluginManifestSchema)
- **No automation** for most sources
- **High risk** of validation drift

**Proposal**: [Truth Registry Proposal](./truth-registry-proposal.md)
**Details**: [Schema Audit](./schema-audit.md), [Constants Audit](./constants-audit.md)

## Related Projects

- [skills-quality-validation](../skills-quality-validation/) - Skill validation rules
- [npm-release-setup](../npm-release-setup/) - Release automation
