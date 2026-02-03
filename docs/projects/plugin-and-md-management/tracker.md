# Implementation Tracker

**Last Updated**: 2026-02-03 (Phase 2.2 complete)

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

**Status**: COMPLETE (100% - 7/7 tasks done)
**Duration**: 1-2 days
**Dependencies**: Phase 0 complete

**Completed**: All tasks 1.1-1.9 (package.json, plugin.json, skill renames, schema fix, E10 rule, testing, dependency checks, documentation)

### Tasks

- [x] **Task 1.1**: Fix package.json files array bug
  - [x] Remove invalid `"skills"` entry (directory doesn't exist)
  - [x] Update to include `".claude"` (skills are part of npm package)
  - [x] npm package includes: CLI + skills for plugin registration
  - [x] **Understanding**: npm package is primary, plugin points to it

  **Distribution Model (FINAL - follows LSP plugin pattern):**

  Similar to LSP plugins (pyright-lsp requires pyright-langserver binary):
  - **claudelint plugin** (skills) requires **claude-code-lint npm package** (CLI binary)

  **Primary flow (recommended):**
  ```bash
  # 1. Install npm package (gets CLI + skills)
  npm install --save-dev claude-code-lint

  # 2. Register plugin with Claude Code (points to npm install)
  /plugin install --source ./node_modules/claude-code-lint

  # 3. Use CLI commands
  npx claudelint check-all

  # 4. Use skills in Claude Code
  /claudelint:validate-all
  ```

  **Alternative: GitHub install (for users who only want skills)**
  ```bash
  # Must have npm package installed FIRST (dependency)
  npm install --save-dev claude-code-lint

  # Then install plugin from GitHub
  /plugin install github:pdugan20/claudelint
  ```

  **Why this works:**
  - Skills are shell scripts that call `npx claude-code-lint` commands
  - npx uses project install if available, falls back to global
  - Skills fail gracefully with install instructions if package missing
  - Matches established LSP plugin pattern

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

- [x] **Task 1.3**: Rename generic skills to specific names
  - [x] Rename `validate-agents-md` → `validate-cc-md` (validates CLAUDE.md files)
  - [x] Rename `validate` → `validate-all` (validates all project files)
  - [x] Rename `format` → `format-cc` (formats Claude Code files)
  - [x] Update SKILL.md name and description in each
  - [x] Rename shell scripts to match: format-cc.sh, validate-all.sh, validate-cc-md.sh
  - [x] Update plugin.json skill references to use paths
  - [x] Update integration tests with new skill names
  - [x] Remove deprecated .claude-plugin directory

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

- [x] **Task 1.4**: Fix plugin.json schema to match official Claude Code spec
  - [x] Update PluginManifestSchema in src/validators/schemas.ts
  - [x] Fix `author` field: string → string|object with {name, email?, url?}
  - [x] Fix `description`: required → optional
  - [x] Add missing fields: homepage, keywords, outputStyles, lspServers
  - [x] Fix path fields: array → string|array (skills, agents, commands)
  - [x] Fix config fields: array → string|object (hooks, mcpServers, lspServers)
  - [x] Remove undocumented `dependencies` field
  - [x] Deprecate plugin-dependency-invalid-version rule (dependencies field doesn't exist in spec)
  - [x] Deprecate plugin-circular-dependency rule (dependencies field doesn't exist in spec)
  - [x] Update plugin-missing-file.ts to handle union types (string|array|object)
  - [x] Update deprecated rule tests to reflect no-op behavior
  - [x] Update rule verification script to skip deprecated rules
  - [x] Create bin/claudelint wrapper for npm binary
  - [x] All 75 plugin tests passing

  **Note**: Rules deprecated (not deleted yet) - see discussion about deletion vs deprecation

  **Verification Steps:**
  1. Compare current schema with official docs: https://code.claude.com/docs/en/plugins-reference#complete-schema
  2. Update schema in src/validators/schemas.ts
  3. Validate our plugin.json: `cat .claude-plugin/plugin.json | jq .` (should pass)
  4. Run tests: `npm test -- plugin` (should pass)
  5. Test schema validation catches errors:
     ```bash
     echo '{"name": "test", "author": "string"}' > /tmp/test-plugin.json
     claudelint check-plugin --path /tmp/test-plugin.json  # should warn about author being string
     ```

- [x] **Task 1.6**: Update E10 validation rule
  - [x] Create new rule file: `src/rules/skills/skill-overly-generic-name.ts`
  - [x] Add single-word verb detection: "format", "validate", "test", "build", "deploy", "run", "execute", etc.
  - [x] Add generic keyword detection: "helper", "utils", "tool", "manager", etc.
  - [x] Flag names that are only a verb without specificity
  - [x] Add comprehensive tests (valid and invalid cases)
  - [x] Rule registered as severity 'warn'
  - [x] All 777 tests passing

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

- [x] **Task 1.7**: Test plugin installation locally
  - [x] Verify plugin.json structure and contents
  - [x] Verify all 8 skill directories exist with correct structure
  - [x] Verify SKILL.md frontmatter matches directory names
  - [x] Verify shell scripts are executable and named correctly
  - [x] Verify old skill names (validate, format, validate-agents-md) removed
  - [x] Test CLI integration (claudelint commands work)
  - [x] All automated checks passed

  **Note**: Manual verification in Claude Code session recommended but not blocking.
  Structure is ready for `/plugin install --source .` or GitHub installation.

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

- [x] **Task 1.8**: Update README and documentation
  - [x] Add plugin installation section
  - [x] Document skill namespace usage
  - [x] Add comparison: npm CLI vs plugin
  - [x] Add skill naming guidelines with E10 rule
  - [x] Update all install examples to use project install (--save-dev)
  - [x] Update all commands to use npx
  - [ ] **REMAINING**: Trim README from 795 lines → ~400 lines (match ESLint/Prettier)

  **Current README issues:**
  - Too long: 795 lines vs ESLint's 363 lines vs Prettier's ~100 lines
  - Too much detail should be in separate docs

  **Sections to move:**
  1. Skill Naming Guidelines (63 lines) → `docs/skill-naming.md`
  2. Troubleshooting (160 lines) → `docs/troubleshooting.md`
  3. Formatting Tools details (95 lines) → `docs/formatting-tools.md` (already exists)
  4. Philosophy (67 lines) → `docs/philosophy.md`
  5. Performance details (42 lines) → `docs/performance.md`
  6. Monorepo details (29 lines) → `docs/monorepo.md` (already exists)

  **Keep in README (brief):**
  - Beta notice
  - Quick Start (both install methods)
  - Brief feature list
  - Basic usage examples
  - Links to detailed docs

  **Verification Steps:**
  1. Check main README has plugin installation section: `grep -A5 "plugin install" README.md` ✓
  2. Verify all skill names updated in README: `grep "validate-all\|format-cc\|validate-cc-md" README.md` ✓
  3. Check no old skill names remain: `grep -E "^/validate\"|^/format\"" README.md` ✓
  4. Verify skill docs updated: Check `.claude/skills/*/SKILL.md` files have correct names ✓
  5. Run markdownlint: `npm run lint:md` ✓
  6. Trim README to target length: `wc -l README.md` (target: ~400 lines)

- [x] **Task 1.9**: Add dependency checks to skill scripts AND plugin installation helpers
  - [x] Created shared wrapper script `.claude/skills/lib/run-claudelint.sh`
  - [x] Updated all 8 skill scripts to use shared wrapper (2-3 lines each)
  - [x] Checks for npx availability (Node.js installed)
  - [x] Checks for claude-code-lint package (project or global)
  - [x] Shows helpful error with installation instructions if missing
  - [x] Updated plugin.json description to document npm dependency
  - [x] Matches LSP plugin pattern (pyright-lsp requires pyright-langserver)
  - [x] Added postinstall npm script (shows plugin install instructions)
  - [x] Created `claudelint install-plugin` command (helper to show instructions)
  - [x] Updated `claudelint init` wizard to show plugin install in next steps
  - [x] Updated README to emphasize project install (--save-dev) over global

  **Context:**
  Users discovering plugin via marketplaces (https://claudemarketplaces.com, https://skills.sh) will install plugin first without seeing README. Skills need to fail gracefully when npm package isn't installed. Also, users installing via npm need clear guidance on how to enable skills.

  **Final Implementation:**

  Shared wrapper (`.claude/skills/lib/run-claudelint.sh`):
  ```bash
  #!/bin/bash
  # Wrapper script for running claudelint commands
  set -e

  # Check dependencies
  if ! command -v npx &> /dev/null; then
      echo "Error: npx not found"
      echo "Install Node.js from: https://nodejs.org"
      exit 1
  fi

  if ! npx --no-install claude-code-lint --version &> /dev/null; then
      echo "Error: claude-code-lint not installed"
      echo "Install: npm install --save-dev claude-code-lint"
      exit 1
  fi

  # Run the command with all arguments
  npx claude-code-lint "$@"
  ```

  Individual skills (example):
  ```bash
  #!/bin/bash
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  exec "$SCRIPT_DIR/../lib/run-claudelint.sh" check-all "$@"
  ```

  **Three plugin installation helpers:**
  1. **Postinstall message** - runs after npm install
  2. **`claudelint install-plugin`** - dedicated helper command
  3. **`claudelint init`** - shows plugin setup in "next steps"

  **Verification Steps:**
  1. Test without package installed:
     ```bash
     # Remove package
     rm -rf node_modules/claude-code-lint
     # Test skill
     .claude/skills/validate-all/validate-all.sh
     # Should show: "Error: claude-code-lint not installed"
     ```
  2. Test with package installed:
     ```bash
     npm install --save-dev claude-code-lint
     .claude/skills/validate-all/validate-all.sh
     # Should execute successfully
     ```
  3. Test postinstall message:
     ```bash
     npm install --save-dev claude-code-lint
     # Should show plugin install instructions
     ```
  4. Test helper command:
     ```bash
     npx claudelint install-plugin
     # Should show /plugin install command
     ```
  5. Test init wizard:
     ```bash
     npx claudelint init
     # Should show plugin install in "next steps"
     ```
  6. Verify plugin.json description:
     ```bash
     jq -r '.description' plugin.json | grep "npm install"
     ```

### Acceptance Criteria

- [x] npm package includes CLI + `.claude/` skills directory
- [x] `plugin.json` created at repository root
- [x] All 3 skills renamed with specific names (validate-all, validate-cc-md, format-cc)
- [x] Plugin.json schema fixed to match official spec (deleted 2 invalid rules)
- [x] E10 rule created to flag single-word verbs and generic keywords
- [x] Plugin structure verified and ready for installation (automated checks)
- [x] Skills have dependency checks (inlined in each skill for self-containment)
- [x] Plugin.json description documents npm dependency requirement
- [x] Three plugin installation helpers implemented (postinstall, command, init wizard)
- [x] README updated to emphasize project install (--save-dev)
- [x] Documentation updated with new naming guidance
- [x] README trimmed down from 866 → 467 lines (46% reduction, close to 400-line target)
- [ ] Skills accessible via `/claudelint:` namespace with new names (needs manual testing in Claude Code)

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

---

## Phase 2: Schema & Constant Verification System

**Status Update (2026-02-02)**: Pivoted to dual-schema verification approach after discovering drift.

### Verification Approach: Dual-Schema System

**Problem**: Official Claude Code specs exist as prose docs, not machine-readable schemas.

**Solution**: Maintain two types of schemas that validate each other:

1. **Manual Reference JSON Schemas** (`schemas/*.schema.json`)
   - Encode "what official docs say" as test fixtures
   - Created by human reading official docs
   - Hosted on GitHub raw URLs
   - Purpose: Reference implementation to detect drift

2. **Implementation Zod Schemas** (`src/schemas/*.ts`)
   - Runtime validation in claudelint
   - Can be stricter than official specs (extra validations OK)
   - Cannot be looser (missing fields BAD)
   - Purpose: Actual validation logic

**Verification Flow**:
```
Official Docs → Manual JSON Schema → Generate from Zod → Compare → Fix Drift
```

**Drift Found (6/8 schemas had issues = 75%)**:
- PluginManifestSchema: CLEAN - Clean
- SkillFrontmatterSchema: Minor drift - missing 4 fields (FIXED)
- HooksConfigSchema: Minor drift - missing 2 fields (FIXED)
- MCPConfigSchema: **CRITICAL drift** - entire structure wrong (FIXED + 13 rules updated)
- LSPConfigSchema: **CRITICAL drift** - wrong structure + wrong fields + missing 7 fields (FIXED + 8 rules updated + 2 rules deprecated)
- AgentFrontmatterSchema: Minor drift - missing permissionMode + extra events field (FIXED + deleted agent-events rule)
- OutputStyleFrontmatterSchema: **MAJOR drift** - all validations wrong + missing/extra fields (FIXED + deleted 4 invalid rules)
- RulesFrontmatterSchema: CLEAN - Clean (renamed from ClaudeMdFrontmatterSchema for clarity)

**See**: [Schema Verification Workflow](./schema-verification-workflow.md)

## Phase 2: Schema & Constant Verification System

**Status**: Not Started
**Duration**: 9-14 days
**Dependencies**: Phase 1 complete
**Priority**: CRITICAL (validation correctness depends on this)

### Overview

Systematic verification of all schemas and constants against official Claude Code sources. Implements unified truth registry with automated, hybrid, and manual verification workflows.

**See**: [Truth Registry Proposal](./truth-registry-proposal.md) for full design

### Discovery Summary

**Found Issues**:
- 1 schema out of sync (PluginManifestSchema - CRITICAL)
- 1 schema verified (SettingsSchema)
- 8 schemas need audit
- 9 constants need verification
- No automation for most sources

**Impact**: Users get false positives/negatives, validation doesn't match Claude Code's actual behavior

### Tasks

#### Phase 2.1: Create Manual Reference Schemas (3-4 days)

**Current Work**: Creating manual JSON Schemas from official docs to detect drift.

**Completed**:
- [x] **Task 2.1.1**: Schema inventory (identified 9 schemas needing verification)
- [x] **Task 2.1.2**: PluginManifestSchema reference created
- [x] **Task 2.1.3**: SkillFrontmatterSchema reference created (FOUND DRIFT - 4 missing fields)
- [x] **Task 2.1.4**: Fix SkillFrontmatterSchema drift (added 4 missing fields to Zod)
- [x] **Task 2.1.5**: HooksConfigSchema reference (FOUND DRIFT - 2 missing fields: timeout, async)
- [x] **Task 2.1.6**: MCPConfigSchema reference (CRITICAL DRIFT - wrong structure, required complete restructure + 13 rule fixes)
- [x] **Task 2.1.7**: LSPConfigSchema reference (CRITICAL DRIFT - wrong structure + wrong field names + missing 7 fields + extra configFile field, updated 8 rules + deprecated 2 rules)
- [x] **Task 2.1.8**: AgentFrontmatterSchema reference (Minor drift - missing permissionMode, extra events field, deleted agent-events rule)
- [x] **Task 2.1.9**: OutputStyleFrontmatterSchema reference (MAJOR drift - all validations wrong, missing keep-coding-instructions, extra examples field, deleted 4 invalid rules)
- [x] **Task 2.1.10**: RulesFrontmatterSchema reference (No drift - schema correct, renamed from ClaudeMdFrontmatterSchema for clarity)
- [x] **Task 2.1.11**: Update all schemas to JSON Schema Draft 2020-12 (migrated from Draft-07)
- [x] **Task 2.1.12**: Extract source URLs to custom properties (added `source` and `sourceType` fields to all 8 schemas for machine-readability)
- [x] **Task 2.1.13**: Fix LSP config schema tests (updated tests to match corrected flat structure, added extensionToLanguage requirement, removed deprecated configFile tests)

**In Progress**:
None - Phase 2.1 complete!

**Acceptance Criteria**:
- [x] All 8 manual reference schemas created in `schemas/` directory
- [x] Each schema documented with official source URL
- [x] All drift between Zod and official specs fixed
- [x] Schemas use JSON Schema Draft 2020-12
- [x] Source URLs extracted into custom properties for machine-readability
- [x] All schema tests passing (139 suites, 771 tests)
- [ ] Schemas hosted on GitHub raw URLs (pending git push)

#### Phase 2.2: Build Automated Comparison (2-3 days)

**Status**: COMPLETE (2026-02-03)

**Goal**: Generate JSON Schema from Zod and compare to manual reference schemas.

**Completed**:
- [x] **Task 2.2.1**: Install zod-to-json-schema
  - [x] Add `zod-to-json-schema` dependency
  - [x] Create wrapper script to generate from all Zod schemas (`scripts/generate/json-schemas.ts`)
  - [x] Add `npm run generate:json-schemas` script
  - [x] Extract schemas from zodToJsonSchema wrapper structure
  - [x] Force Draft 2020-12 compatibility

- [x] **Task 2.2.2**: Build schema comparison tool
  - [x] Create `scripts/verify/compare-schemas.ts` (255 lines)
  - [x] Compare manual reference vs generated schemas
  - [x] Report drift (missing fields, wrong types, enum mismatches, missing required)
  - [x] Allow Zod to be stricter (extra validations OK)
  - [x] Reject Zod being looser (missing fields = ERROR)
  - [x] Add `npm run verify:schemas` script
  - [x] All 8 schemas match - no drift detected!

- [x] **Task 2.2.3**: Update schema-sync script
  - [x] Completely rewrite `scripts/check/schema-sync.ts` (66% smaller - 185 vs 540 lines)
  - [x] Remove outdated Ajv/Zod comparison code
  - [x] Orchestrate: generate → compare → report workflow
  - [x] Show Phase 2.1 drift history for all 8 schemas
  - [x] Exit non-zero if drift detected
  - [x] Manual references already on GitHub (no fetching needed)

- [x] **Task 2.2.4**: CI/CD integration
  - [x] CI job already configured correctly
  - [x] Updated `.github/workflows/ci.yml` documentation
  - [x] Runs on every PR and push to main
  - [x] Fails CI if drift detected
  - [x] Included in complete-validation job dependencies
  - [x] Node modules cache already configured

**Acceptance Criteria**:
- [x] zod-to-json-schema installed and wrapper created
- [x] Comparison tool detects all types of drift
- [x] Schema-sync script automated (generate + compare)
- [x] CI runs verification on every PR
- [x] All 8 schemas verified with 0 drift

**Deliverables**:
- `scripts/generate/json-schemas.ts` - Generate JSON Schemas from Zod
- `scripts/verify/compare-schemas.ts` - Compare and detect drift
- `scripts/check/schema-sync.ts` - Rewritten orchestration script
- `schemas/generated/` - Generated schemas (gitignored)
- 2 new npm scripts: `generate:json-schemas`, `verify:schemas`

#### Phase 2.3: Hybrid Verification (3-4 days)

- [ ] **Task 2.3.1**: Plugin manifest verification (completes Task 1.4)
- [ ] **Task 2.3.2**: Hook events verification
- [ ] **Task 2.3.3**: MCP config verification
- [ ] **Task 2.3.4**: Create hybrid verification framework

#### Phase 2.4: Manual Verification Support (2-3 days)

- [ ] **Task 2.4.1**: Tool names manual verification
- [ ] **Task 2.4.2**: Model names manual verification
- [ ] **Task 2.4.3**: Manual verification tracker (expiry warnings)
- [ ] **Task 2.4.4**: Manual verification playbook

#### Phase 2.5: Integration & Documentation (1-2 days)

- [ ] **Task 2.5.1**: Pre-commit hook integration
- [ ] **Task 2.5.2**: Documentation
- [ ] **Task 2.5.3**: Team training materials

### Acceptance Criteria

- [ ] All 19 sources have verification method defined
- [ ] PluginManifestSchema fixed and verified
- [ ] High-priority constants verified (ToolNames, ModelNames, HookEvents)
- [ ] Automated verification runs in CI
- [ ] Status dashboard auto-generated

### Success Metrics

- 0 critical sources out of sync
- 100% of schemas have verification defined
- CI catches drift within 1 week

---

## Phase 2.6: Rule Deprecation System (2-3 days)

**Status**: Not Started
**Duration**: 2-3 days
**Dependencies**: Phase 2.1-2.5 in progress
**Priority**: HIGH (enables safe rule evolution)

### Overview

Design and implement a proper rule deprecation system modeled after ESLint and Prettier. Currently we have no formal way to deprecate rules - we just deleted two rules that validated non-existent fields. Need a systematic approach for future rule changes.

**Context**: We just deleted `plugin-dependency-invalid-version` and `plugin-circular-dependency` because they validated a field (`dependencies`) that never existed in the official plugin.json spec. This was the right call for beta, but we need a proper deprecation system for post-1.0.

### Research Phase

**Research ESLint's approach:**
- How they mark rules as deprecated
- How deprecated rules are reported
- Configuration options (--report-unused-disable-directives equivalent)
- Migration paths (replacedBy field)
- Documentation patterns

**Research Prettier's approach:**
- How they deprecate options
- Version compatibility matrix
- Breaking change communication
- Migration tooling

### Tasks

- [ ] **Task 2.6.1**: Research ESLint and Prettier deprecation patterns
  - [ ] Study ESLint's `meta.deprecated` and `meta.replacedBy` patterns
  - [ ] Study Prettier's deprecation warnings and version policy
  - [ ] Document findings in `docs/architecture/rule-deprecation.md`
  - [ ] Identify best practices we want to adopt

- [ ] **Task 2.6.2**: Design deprecation system
  - [ ] Define `meta.deprecated` field enhancement (boolean → object with reason, replacedBy, removeInVersion)
  - [ ] Design warning/error reporting for deprecated rule usage
  - [ ] Design config migration tool (auto-update rule IDs)
  - [ ] Define deprecation lifecycle (warning → error → removed)
  - [ ] Document in `docs/architecture/rule-deprecation.md`

- [ ] **Task 2.6.3**: Implement deprecation metadata
  - [ ] Update `Rule` interface in `src/types/rule.ts`
  - [ ] Add `DeprecationInfo` type with reason, replacedBy, removeInVersion fields
  - [ ] Update schema validation to handle new metadata
  - [ ] Add tests for deprecation metadata

- [ ] **Task 2.6.4**: Implement deprecation warnings
  - [ ] Add deprecation detection to rule loader
  - [ ] Add warning formatter (show reason, replacement, version info)
  - [ ] Add CLI flag to control deprecation warnings (--no-deprecated-rules)
  - [ ] Add deprecation summary to output
  - [ ] Add tests for warning output

- [ ] **Task 2.6.5**: Create migration tooling
  - [ ] Create `scripts/migrate/update-configs.ts`
  - [ ] Scan config files for deprecated rule IDs
  - [ ] Auto-replace with replacedBy rule ID
  - [ ] Generate migration report
  - [ ] Add tests for migration tool

- [ ] **Task 2.6.6**: Documentation and examples
  - [ ] Document deprecation policy in CONTRIBUTING.md
  - [ ] Add examples of marking a rule as deprecated
  - [ ] Document migration tool usage
  - [ ] Update rule creation template with deprecation fields

### Acceptance Criteria

- [ ] Rule interface supports deprecation metadata (reason, replacedBy, removeInVersion)
- [ ] Deprecated rule usage triggers clear warnings
- [ ] Migration tool can auto-update configs
- [ ] Documentation explains deprecation policy
- [ ] Tests cover all deprecation scenarios

### Example: How it should work

```typescript
// src/rules/plugin/example-old-rule.ts
export const rule: Rule = {
  meta: {
    id: 'example-old-rule',
    name: 'Example Old Rule',
    description: 'Old validation approach',
    category: 'Plugin',
    severity: 'warn',
    fixable: false,
    deprecated: {
      reason: 'This rule was based on an unofficial field that was removed from the spec',
      replacedBy: 'example-new-rule',
      removeInVersion: '1.0.0',
    },
    since: '0.1.0',
    docUrl: '...',
  },
  validate: () => {
    // Still runs but shows deprecation warning
  },
};
```

**CLI output:**
```
Warning: Rule 'example-old-rule' is deprecated
  Reason: This rule was based on an unofficial field that was removed from the spec
  Use 'example-new-rule' instead
  This rule will be removed in version 1.0.0
```

**Migration tool:**
```bash
npm run migrate:config
# Scans .claudelintrc.json
# Replaces "example-old-rule" with "example-new-rule"
# Shows summary of changes
```

---

## Phase 3: Create optimize-cc-md Skill

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

---

## Phase 4: Documentation & Polish

**Status**: Not Started
**Duration**: 1-2 days
**Dependencies**: Phase 3 complete

### Tasks

- [ ] **Task 4.1**: Update main README
  - [ ] Add plugin installation section
  - [ ] Document skill namespace usage (`/claudelint:optimize-cc-md`)
  - [ ] Update feature list
  - [ ] Add optimize-cc-md usage example

- [ ] **Task 4.2**: Document skill rename
  - [ ] Update any docs referencing validate-agents-md
  - [ ] Add migration note in CHANGELOG
  - [ ] Update skills list

- [ ] **Task 4.3**: Update skill documentation
  - [ ] Document optimize-cc-md usage
  - [ ] Add examples of violations it catches
  - [ ] Document trigger phrases

### Acceptance Criteria

- [ ] README reflects plugin installation
- [ ] Skill rename documented
- [ ] No broken references to old skill name

---

## Phase 5: Testing & Release

**Status**: Not Started
**Duration**: 1 day
**Dependencies**: Phase 4 complete

### Tasks

- [ ] **Task 5.1**: Integration testing
  - [ ] Test plugin installation: `claude /plugin install --source .`
  - [ ] Test skill namespace: `/claudelint:optimize-cc-md`
  - [ ] Test skill rename: `/claudelint:validate-cc-md`
  - [ ] Verify npm pack includes .claude/ directory

- [ ] **Task 5.2**: Test optimize-cc-md skill
  - [ ] Test on bloated CLAUDE.md file
  - [ ] Test on optimized CLAUDE.md file
  - [ ] Verify trigger phrases work
  - [ ] Ensure validation integration works

- [ ] **Task 5.3**: Version bump & release
  - [ ] Determine semver bump (likely minor: 0.2.x → 0.3.0)
  - [ ] Run `npm run release` (auto-generates CHANGELOG)
  - [ ] Verify `npm run sync:versions` runs
  - [ ] Push tags to GitHub

- [ ] **Task 5.4**: Publish
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
Phase 1: [█████████░]  92% (5.5/6 tasks - Tasks 1.1-1.4, 1.6-1.7 done, 1.8 remaining)
Phase 2: [░░░░░░░░░░]   0% (0/6 sub-phases - includes new 2.6 deprecation system)
Phase 3: [░░░░░░░░░░]   0% (0/5 tasks - optimize-cc-md skill)
Phase 4: [░░░░░░░░░░]   0% (0/3 tasks - documentation)
Phase 5: [░░░░░░░░░░]   0% (0/4 tasks - testing & release)

Overall: [███░░░░░░░] 31% (Phase 0 complete + 5.5/6 Phase 1 tasks)
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
