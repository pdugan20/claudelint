# Implementation Tracker

**Last Updated**: 2026-02-04 (Phase 2.6 and 2.7 complete - ready for Phase 3)

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

**Status**: COMPLETE (100% - 9/9 tasks done)
**Duration**: Completed
**Dependencies**: Phase 0 complete

**Completed**: All tasks 1.1-1.9 (package.json, plugin.json, skill renames, schema fix, E10 rule, testing, dependency checks, documentation, README trimming)

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
  1. Compare current schema with official docs: <https://code.claude.com/docs/en/plugins-reference#complete-schema>
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

     ```bash
     /claudelint:validate-all
     /claudelint:format-cc
     /claudelint:validate-cc-md
     ```

  5. Verify old names DON'T trigger:

     ```bash
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
  - [x] Trim README from 795 lines → 467 lines (41% reduction, close to 400 target)

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
  Users discovering plugin via marketplaces (<https://claudemarketplaces.com>, <https://skills.sh>) will install plugin first without seeing README. Skills need to fail gracefully when npm package isn't installed. Also, users installing via npm need clear guidance on how to enable skills.

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

```text
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

## Phase 2: Full Verification System (Future Work)

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

**Status**: COMPLETE (verified via Phase 2.1/2.2 work)

**Note**: Phase 2.3 tasks were defined before implementing comprehensive dual-schema verification. All objectives met through Phase 2.1/2.2 work. See `phase-2-3-verification.md` for detailed audit.

**Completed**:

- [x] **Task 2.3.1**: Plugin manifest verification
  - [x] PluginManifestSchema verified against official spec (no drift)
  - [x] All 15 fields verified (name, version, description, author, etc.)
  - [x] Component paths verified (skills, agents, commands)
  - [x] Config paths verified (hooks, mcpServers, lspServers)
  - [x] Union types handled (string | array | object)

- [x] **Task 2.3.2**: Hook events verification
  - [x] HookEvents constant verified (13 events match official spec)
  - [x] hooks-config.schema.json enum verified (13 events)
  - [x] hooks-invalid-event rule uses correct event list
  - [x] No drift detected between constant and schema

- [x] **Task 2.3.3**: MCP config verification
  - [x] MCPConfigSchema verified against official spec (no drift)
  - [x] Transport types verified (stdio, sse, http, websocket)
  - [x] Flat structure verified (no `transport` wrapper)
  - [x] Server names as object keys verified
  - [x] 13 validation rules updated for correct structure

- [x] **Task 2.3.4**: Create hybrid verification framework
  - [x] Manual extraction process (read docs → create JSON Schema)
  - [x] Automated generation (Zod → JSON Schema via zod-to-json-schema)
  - [x] Automated comparison (manual reference vs generated)
  - [x] Orchestration script (generate → compare → report)
  - [x] CI integration (runs on every PR, blocks if drift detected)
  - [x] Dual-schema system = hybrid verification framework

**Acceptance Criteria**:

- [x] All 3 specific verification tasks complete
- [x] Hybrid framework implemented (dual-schema system)
- [x] All 8 schemas verified with 0 drift
- [x] CI runs verification on every PR
- [x] Framework detects all drift types

**Deliverables**:

- Verification audit: `docs/projects/plugin-and-md-management/phase-2-3-verification.md`
- Evidence: All schemas show "No drift detected" in comparison output

#### Phase 2.4: Constants Verification (2-3 days) [COMPLETE]

**Goal**: Programmatically verify ToolNames and ModelNames constants against Claude Code CLI

**Sources of Truth:**

- **Primary**: Claude Code CLI (queries actual installed version)
- **Documentation Reference**:
  - ToolNames: <https://code.claude.com/docs/en/settings#tools-available-to-claude>
  - ModelNames: <https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields>

**Strategy:**

1. **Query Claude CLI** - Ask Claude to list its tools/models via CLI
2. **Supplemental Lists** - Maintain lists of valid values CLI doesn't return (e.g., `inherit`)
3. **Hybrid Verification** - Compare against CLI + supplemental, not hardcoded lists
4. **Settings.json** - Changed model to `z.string()` for arbitrary model names

**Implementation:**

**Tools Verification**:

- Runs: `claude -p "List all tool names..."`
- Returns: 17 tools from actual Claude Code
- Supplemental: 0 tools (currently empty)
- Compares: Against `VALID_TOOLS` constant
- **Current Status**: [DRIFT DETECTED] (missing TodoWrite, extra 5 tools)

**Models Verification**:

- Runs: `claude -p "What model values for Task tool..."`
- Returns: 3 models (sonnet, opus, haiku)
- Supplemental: 1 model (`inherit` - valid but CLI doesn't mention)
- Compares: Against `VALID_MODELS` constant
- **Current Status**: [VERIFIED] (matches expected 4 models)

**Tasks:**

- [x] **Task 2.4.1**: Create tool names verification script [DONE]
  - Script: `scripts/verify/tool-names.ts`
  - Method: Queries Claude CLI with `execSync`
  - Parses output, filters to PascalCase tool names
  - Supports supplemental tools list (currently 0)
  - Reports drift: missing TodoWrite, extra LSP/TaskCreate/TaskGet/TaskList/TaskUpdate
  - Exit 1 on drift, 0 on match
  - Includes error handling for missing CLI/API key

- [x] **Task 2.4.2**: Create model names verification script [DONE]
  - Script: `scripts/verify/model-names.ts`
  - Method: Queries Claude CLI for Task tool model parameter
  - Returns sonnet/opus/haiku from CLI
  - Supplements with `inherit` (valid in docs but CLI doesn't return)
  - Compares against `VALID_MODELS` constant
  - **Result**: [SUCCESS] - matches expected 4 models
  - Exit 0 (no drift)

- [x] **Task 2.4.3**: Fix settings.json model validation [DONE]
  - Changed `src/validators/schemas.ts` line 143
  - From: `model: ModelNames.optional()`
  - To: `model: z.string().optional()`
  - Reason: settings.json accepts arbitrary model names
  - Removed unused ModelNames import
  - All tests pass (822 passed)
  - ModelNames enum now ONLY for agents/skills

- [x] **Task 2.4.4**: Rewrite constants verification documentation [DONE]
  - Rewrote: `docs/constants-verification.md`
  - Documents CLI-based verification approach
  - Explains supplemental lists and why they exist
  - Includes manual verification fallback
  - Documents limitations and trade-offs
  - Current drift status for both constants

- [x] **Task 2.4.5**: Remove unused dependencies [DONE]
  - Removed jsdom and @types/jsdom
  - Freed 45 packages
  - No longer needed - CLI queries don't parse HTML

- [x] **Task 2.4.6**: Add NPM scripts [DONE]
  - `npm run verify:tool-names` - Queries CLI, compares tools
  - `npm run verify:model-names` - Queries CLI, compares models
  - `npm run verify:constants` - Runs both verifications
  - All scripts tested and working

**Key Learnings:**

- **Don't**: Maintain hardcoded lists that compare against themselves (useless)
- **Do**: Query actual Claude Code installation via CLI
- **Do**: Support supplemental lists for edge cases CLI misses
- **Do**: Document why each supplemental value exists
- **Limitation**: Requires Claude Code installed and API key configured
- **Cost**: ~$0.01 per verification run (2 API calls, ~1000 tokens total)

#### Phase 2.5: Integration & Documentation (1-2 days)

- [ ] **Task 2.5.1**: Pre-commit hook integration
  - Add `npm run verify:constants` to pre-commit hook
  - Fails commit if drift detected
  - Forces manual review of constant changes

- [ ] **Task 2.5.2**: Update project documentation
  - Add constants verification to README
  - Document verification workflow
  - Explain source of truth for each constant

- [ ] **Task 2.5.3**: CI integration
  - Add verification to GitHub Actions workflow
  - Run on every PR
  - Fail CI if constants are out of sync

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

**Status**: Complete
**Duration**: 2-3 days (completed)
**Dependencies**: Phase 2.1-2.5 complete
**Priority**: HIGH (enables safe rule evolution)

### Overview

Design and implement a proper rule deprecation system modeled after ESLint and Prettier. Currently we have no formal way to deprecate rules - we just deleted two rules that validated non-existent fields. Need a systematic approach for future rule changes.

**Context**: We just deleted `plugin-dependency-invalid-version` and `plugin-circular-dependency` because they validated a field (`dependencies`) that never existed in the official plugin.json spec. This was the right call for beta, but we need a proper deprecation system for post-1.0.

### Research Findings

**ESLint's Modern Approach**:

- Evolved from simple boolean `deprecated: true` to rich object format
- Modern format: `deprecated: { reason, replacedBy[], deprecatedSince, availableUntil, url }`
- Supports cross-plugin replacements with detailed metadata
- Backward compatible (boolean still works)
- **Key finding**: ESLint doesn't automatically warn about deprecated rules (GitHub Issue #20294)

**Prettier's Approach**:

- Shows warnings when deprecated options are used
- Keeps deprecated options for 1+ minor versions before removal
- Removes in next major version
- Unique versioning philosophy: formatting output changes aren't "breaking" (only API/CLI changes are)
- Proposed experimental/deprecated flags for transitional periods (RFC #14527)

**Our Design** (fully documented in `docs/architecture/rule-deprecation.md`):

- Backward-compatible metadata: `deprecated?: boolean | DeprecationInfo`
- `DeprecationInfo`: `{ reason, replacedBy?, deprecatedSince?, removeInVersion?, url? }`
- Warning system with CLI flags: `--no-deprecated-warnings`, `--error-on-deprecated`
- `claudelint migrate` command for auto-updating configs
- Lifecycle: Deprecate (minor) → Warn for 2+ minors → Remove (major)

### Tasks

- [x] **Task 2.6.1**: Research ESLint and Prettier deprecation patterns
  - [x] Study ESLint's `meta.deprecated` and `meta.replacedBy` patterns
  - [x] Study Prettier's deprecation warnings and version policy
  - [x] Document findings in `docs/architecture/rule-deprecation.md` (400+ lines)
  - [x] Identify best practices we want to adopt

- [x] **Task 2.6.2**: Design deprecation system
  - [x] Define `DeprecationInfo` interface (reason, replacedBy, deprecatedSince, removeInVersion, url)
  - [x] Design warning format and output
  - [x] Design CLI flags (--no-deprecated-warnings, --error-on-deprecated, check:deprecated)
  - [x] Design config migration tool (`claudelint migrate`)
  - [x] Define deprecation lifecycle (deprecate → warn → remove)
  - [x] Document in `docs/architecture/rule-deprecation.md`

- [x] **Task 2.6.3**: Implement deprecation metadata
  - [x] Added `DeprecationInfo` interface with all fields (reason, replacedBy, deprecatedSince, removeInVersion, url)
  - [x] Updated `Rule.meta.deprecated` to support `boolean | DeprecationInfo` (backward compatible)
  - [x] Added helper functions: `isRuleDeprecated()`, `getDeprecationInfo()`, `getReplacementRuleIds()`
  - [x] Updated `isRule()` type guard to work with optional deprecated field
  - [x] Updated `src/utils/config/types.ts` to use new helpers for config validation
  - [x] Created comprehensive test suite with 22 tests (all passing)

- [x] **Task 2.6.4**: Implement deprecation warnings
  - [x] Add deprecation detection to rule execution pipeline
    - Added tracking in `FileValidator.executeRule()` to detect deprecated rules
    - Track deprecated rules in `deprecatedRulesUsed` Map during validation
    - Convert Map to `DeprecatedRuleUsage[]` in `getResult()`
    - Added `deprecatedRulesUsed` field to `ValidationResult`
  - [x] Created comprehensive test suite for deprecation tracking
    - 10 tests covering boolean/object formats, multiple rules, disabled rules, etc.
    - All tests passing
  - [x] Add warning formatter (show reason, replacement, version info)
    - Added `deprecatedRulesUsed` field to `LintResult` type
    - Updated `buildLintResult()` to pass through deprecation info
    - Updated `mergeLintResults()` to deduplicate deprecated rules across files
    - Updated `StylishFormatter` to display deprecation warnings at end of output
    - Shows: rule ID, reason, replacements, removal version, migration guide URL
    - Created 7 formatter tests - all passing
  - [x] Add CLI flag to control deprecation warnings (--no-deprecated-warnings)
    - Added flag to `check-all` command
    - Updated `ReportingOptions` interface
    - Updated `Reporter` to show/hide deprecation warnings based on flag
    - Created `reportDeprecatedRules()` method in Reporter class
    - Default: true (warnings shown)
  - [x] Add CLI flag to error on deprecated rules (--error-on-deprecated)
    - Added flag to `check-all` command
    - Updated exit code logic to fail when deprecated rules detected
    - Updated `Reporter.getExitCode()` to handle errorOnDeprecated
    - Displays error message when exiting due to deprecated rules
  - [x] Create `claudelint check-deprecated` command to list deprecated rules in config
    - Created new command in `src/cli/commands/check-deprecated.ts`
    - Scans config file for deprecated rules
    - Shows detailed deprecation info for each rule
    - Provides migration guidance
    - Supports --format json output
    - Exits with code 1 if deprecated rules found, 0 otherwise

- [x] **Task 2.6.5**: Create migration tooling
  - [x] Create `src/utils/migrate/update-configs.ts` (migration logic)
  - [x] Create `src/cli/commands/migrate.ts` (CLI command)
  - [x] Scan config files for deprecated rule IDs
  - [x] Auto-replace with replacedBy rule ID (1:1 replacements)
  - [x] Handle multiple replacements (require manual intervention)
  - [x] Handle no replacement (suggest removal)
  - [x] Generate migration report with change summaries
  - [x] Support dry-run mode (--dry-run flag)
  - [x] Support JSON output (--format json)
  - [x] Add `claudelint migrate` CLI command
  - [x] Add 12 comprehensive tests (all passing)

- [x] **Task 2.6.6**: Documentation and examples
  - [x] Document deprecation policy in CONTRIBUTING.md
    - Added "Rule Deprecation Policy" section (180+ lines)
    - When to deprecate rules
    - How to mark rules as deprecated (boolean vs DeprecationInfo)
    - Deprecation lifecycle (deprecate → warn → remove)
    - Replacement scenarios (1:1, 1:many, none, indefinite)
    - User-facing commands
    - Testing deprecated rules
  - [x] Add examples of marking a rule as deprecated
    - Added "Deprecation Field" section to rule-development.md
    - 4 detailed examples: single replacement, multiple replacements, no replacement, retained indefinitely
    - All DeprecationInfo fields documented with usage
  - [x] Document migration tool usage
    - Added "Deprecation Management" section to cli-reference.md
    - Documented `check-deprecated` command (usage, options, examples, exit codes)
    - Documented `migrate` command (usage, options, how it works, examples, exit codes)
    - Example outputs for both commands
  - [x] Update rule creation template with deprecation fields
    - Updated rule structure template in rule-development.md
    - Added comment referencing Deprecation Field section
    - Clarified that deprecated field is optional for new rules
    - Added note in Required Fields section pointing to deprecation docs

### Acceptance Criteria

- [x] Rule interface supports deprecation metadata (reason, replacedBy, removeInVersion)
- [x] Deprecated rule usage triggers clear warnings
- [x] Migration tool can auto-update configs
- [x] Documentation explains deprecation policy
- [x] Tests cover all deprecation scenarios

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

```text
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

## Phase 2.7: Skill Quality Improvements (Anthropic Best Practices)

**Status**: Complete
**Duration**: 1-2 days (completed in 1 day)
**Dependencies**: Phase 2.6 complete
**Priority**: HIGH (needed before Phase 3 to establish quality standards)

**Goal**: Improve existing 8 skills to follow Anthropic's best practices from "Complete Guide to Building Skills for Claude" (Jan 2026).

**Reference**: See `docs/projects/plugin-and-md-management/skill-improvement-guidelines.md` for detailed patterns and examples.

### Key Improvements

Based on Anthropic guide analysis + schema verification:

1. **Keep current structure** (8 separate skills) - Anthropic emphasizes composability, not consolidation
2. **Improve skill descriptions** - Add trigger phrases users actually say
3. **Add troubleshooting** - Skill-specific (not generic boilerplate) - **Top 3 skills only**
4. **Add scenario examples** - User says → Actions → Result format - **Top 3 skills only**
5. **Add standard fields** - version, tags, dependencies (NOT custom metadata - schema forbids it)
6. **Verify required fields** - Ensure all skills have name + description
7. **Progressive disclosure** - Move detailed content to references/ if needed (check word counts)

### Tasks

#### Task 2.7.0: Audit Existing Skills for Required Fields

**Priority**: CRITICAL - Must do first before adding new fields

**Goal**: Verify all 8 skills have the 2 required fields from the schema.

**Required fields** (per official schema):

- `name` - Must be present (schema doesn't mark as required, but documentation says it's needed)
- `description` - Must be present and min 10 characters

**Check**:

```bash
# Verify all skills have name and description
for skill in .claude/skills/*/SKILL.md; do
  echo "Checking $skill..."

  # Check for name field
  if ! grep -q "^name:" "$skill"; then
    echo "  [MISSING] name field"
  else
    name=$(grep "^name:" "$skill" | head -1)
    echo "  [OK] Has name: $name"
  fi

  # Check for description field
  if ! grep -q "^description:" "$skill"; then
    echo "  [MISSING] description field"
  else
    desc_len=$(grep "^description:" "$skill" | cut -d: -f2- | wc -c)
    if [ "$desc_len" -lt 10 ]; then
      echo "  [WARNING] Description too short: $desc_len chars (min 10)"
    else
      echo "  [OK] Has description: $desc_len chars"
    fi
  fi
done
```

**Expected**: All 8 skills should have both fields (we created them with frontmatter)

**If missing**: Add missing required fields before proceeding to Task 2.7.1

#### Task 2.7.1: Update All Skill Descriptions with Trigger Phrases

**Priority**: HIGH - Descriptions control skill triggering (Anthropic p11)

For all 8 skills, update descriptions following pattern:
`[What it does] + [When to use it] + [Trigger phrases] + [Key capabilities]`

**Example (validate-cc-md)**:

```yaml
# Current (too technical)
description: Validate CLAUDE.md files for size, imports, and structure

# Improved (user-focused with triggers)
description: Validate CLAUDE.md files for size, imports, and structure. Use when you want to "check my CLAUDE.md", "audit my config", "why is my CLAUDE.md too long", or "validate imports". Checks file size limits (30KB warning, 50KB error), @import directives, frontmatter in .claude/rules/, and section organization.
```

**Skills to update**:

- [x] validate-all
- [x] validate-cc-md
- [x] validate-skills
- [x] validate-plugin
- [x] validate-mcp
- [x] validate-settings
- [x] validate-hooks
- [x] format-cc

**Reference**: See skill-improvement-guidelines.md section "Skill-by-Skill Improvement Plan" for each skill's improved description.

**Verification**:

```bash
# Check descriptions stay under 1024 character limit
for skill in .claude/skills/*/SKILL.md; do
  desc=$(grep "^description:" "$skill" | cut -d: -f2-)
  len=$(echo "$desc" | wc -c)
  echo "$skill: $len characters"
done
```

#### Task 2.7.2: Add Troubleshooting to Top 3 Skills

**Priority**: HIGH - Reduce user confusion (Anthropic p13, p26)

Add skill-specific troubleshooting sections to:

- [ ] **validate-all** - Installation issues, when to use specific validators
  - "claudelint command not found"
  - "Multiple validators failed"
  - Exit code meanings

- [ ] **validate-cc-md** - File size, imports, circular dependencies
  - "File exceeds 50KB"
  - "Import not found"
  - "Circular import detected"
  - "File exceeds 30KB" (warning vs error)

- [ ] **validate-skills** - Name mismatches, invalid tools, dangerous commands
  - "Skill name must match directory name"
  - "Unknown tool in allowed-tools"
  - "Dangerous command detected"
  - "Shell script missing shebang"
  - "Skill lacks version field"

**Format** (from Anthropic p13):

```markdown
## Common Issues

### Error: "[error message]"
**Cause**: [why it happens]
**Solution**: [how to fix]
**Example**: [code sample showing fix]
```

**Reference**: See skill-improvement-guidelines.md for full troubleshooting text for each skill.

**Note**: Other 5 skills (validate-plugin, validate-mcp, validate-settings, validate-hooks, format-cc) don't need troubleshooting - errors are self-explanatory. Can add later if users report confusion.

#### Task 2.7.3: Add Scenario-Based Examples to Top 3 Skills

**Priority**: MEDIUM - Helps users understand workflows (Anthropic p12)

Add examples section using Anthropic's pattern to:

- [ ] **validate-all**
- [ ] **validate-cc-md**
- [ ] **validate-skills**

**Format** (from Anthropic p12):

```markdown
## Examples

### Example 1: [scenario name]
**User says**: "[what user might say]"
**What happens**:
1. [step 1]
2. [step 2]
3. [step 3]
**Result**: [outcome]
```

**Reference**: See skill-improvement-guidelines.md for complete examples for each skill.

#### Task 2.7.4: Add Standard Fields to All Skills

**Priority**: MEDIUM - Important for discoverability and dependencies

**IMPORTANT DISCOVERY**: Official skill schema does NOT support custom `metadata` object. It has `"additionalProperties": false`. We must use standard fields only.

Add standard fields to all 8 skills:

```yaml
---
name: skill-name
description: [updated description]
version: 1.0.0  # Add this - semantic versioning
tags: [validation, claude-code, linting]  # Add this - for categorization
dependencies: ["npm:claude-code-lint"]  # Add this - document npm dependency
allowed-tools:  # Already present - verify correct
  - Bash
  - Read
---
```

**Tag Guidelines**:

- validate-* skills: `[validation, claude-code, linting]`
- format-cc: `[formatting, claude-code, quality]`
- optimize-cc-md: `[automation, claude-code, optimization]`

**Dependencies**:

- All skills depend on npm package: `["npm:claude-code-lint"]`
- This documents the dependency we already have in skill scripts

**Verification**:

```bash
# Check all skills have version field
for skill in .claude/skills/*/SKILL.md; do
  if ! grep -q "^version:" "$skill"; then
    echo "Missing version: $skill"
  fi
  if ! grep -q "^tags:" "$skill"; then
    echo "Missing tags: $skill"
  fi
  if ! grep -q "^dependencies:" "$skill"; then
    echo "Missing dependencies: $skill"
  fi
done
```

#### Task 2.7.5: Check Progressive Disclosure Needs

**Priority**: LOW - Only needed if SKILL.md >5000 words

Check word count for all skills:

```bash
for skill in .claude/skills/*/SKILL.md; do
  words=$(wc -w < "$skill")
  echo "$skill: $words words"
  if [ "$words" -gt 5000 ]; then
    echo "  [WARNING] Consider progressive disclosure"
  fi
done
```

If any skill exceeds 5000 words:

- [ ] Move detailed content to `references/` subdirectory
- [ ] Link from SKILL.md
- [ ] Keep core instructions focused

**Current assessment**: All skills appear under 5000 words, likely no changes needed.

### Acceptance Criteria

- [x] All 8 skills have descriptions with trigger phrases (under 1024 chars)
- [x] Top 3 skills have troubleshooting sections with skill-specific errors
- [x] Top 3 skills have scenario-based examples
- [x] All 8 skills have standard fields (version, tags, dependencies)
- [x] No skill exceeds 5000 words without progressive disclosure
- [x] Changes documented in skill-improvement-guidelines.md
- [x] All skills pass schema validation (required fields present)
- [ ] Test that trigger phrases work (manual testing in Claude Code)

### Verification Steps

After completing all tasks:

1. **Description validation**:

   ```bash
   npm run lint:md  # Check markdown format
   # Manually verify trigger phrases in each description
   ```

2. **Troubleshooting validation**:
   - Read each troubleshooting section
   - Verify errors match what that validator actually reports
   - Check examples are accurate

3. **Examples validation**:
   - Run each example scenario manually
   - Verify "User says" triggers the skill
   - Confirm actions/results are accurate

4. **Metadata validation**:

   ```bash
   # Check all skills have required fields
   for skill in .claude/skills/*/SKILL.md; do
     echo "Checking $skill"
     grep -q "^metadata:" "$skill" || echo "  Missing metadata"
     grep -q "category:" "$skill" || echo "  Missing category"
   done
   ```

---

## Phase 3: Create optimize-cc-md Skill

**Status**: In Progress (Task 3.1 complete)
**Duration**: 3-4 days
**Dependencies**: Phase 2.7 complete (establishes quality standards)

**What This Skill Does**: Provides instructions for Claude to **interactively help users fix their CLAUDE.md files**. When user runs `/optimize-cc-md`, Claude reads the skill instructions and:

1. Runs `claudelint check-claude-md` to get violations
2. Reads user's CLAUDE.md file
3. Explains violations conversationally
4. Asks what they want to fix
5. **Actually edits the file** using Edit/Write tools
6. Creates new @import files if needed
7. Shows before/after results

**This is NOT**: A CLI script, automated tool, or non-interactive validator. It's instructions for Claude to work with the user.

**Design Principle**: Use progressive disclosure from the start (Anthropic p5, p13, p27).

### Directory Structure

Based on Anthropic recommendations for managing large context:

```text
optimize-cc-md/
├── SKILL.md (core instructions, <5000 words)
├── references/
│   ├── size-optimization.md (strategies for reducing file size)
│   ├── import-patterns.md (best practices for @import)
│   └── organization-guide.md (section organization tips)
└── examples/ (optional)
    ├── before-optimization.md
    └── after-optimization.md
```

### Tasks

- [x] **Task 3.1**: Design progressive disclosure structure
  - [x] Map out what goes in SKILL.md (core workflow)
  - [x] Map out what goes in references/ (detailed strategies)
  - [x] Ensure SKILL.md stays under 5000 words (targeting <3000)
  - [x] Document design in optimize-cc-md-structure-design.md

- [x] **Task 3.2**: Create skill directory structure
  - [x] `.claude/skills/optimize-cc-md/`
  - [x] `SKILL.md` with frontmatter
  - [x] No README.md (forbidden in skills)
  - [x] Optional: `references/` for best practices examples

- [x] **Task 3.3**: Write SKILL.md frontmatter (following Phase 2.7 standards)
  - [x] Name: `optimize-cc-md`
  - [x] Description with trigger phrases: "Interactively help users optimize their CLAUDE.md files. Use when you want to 'optimize my CLAUDE.md', 'fix my config', 'my CLAUDE.md is too long', 'improve organization', or 'split my CLAUDE.md'. Runs validation, explains issues conversationally, and helps create @import files to reduce size and improve structure."
  - [x] Allowed tools: Bash, Read, Edit, Write, Grep
  - [x] Metadata: author, category (automation), documentation
  - [x] Version: 1.0.0
  - [x] Keep under 1024 characters

- [x] **Task 3.4**: Write core workflow in SKILL.md
  - [x] Core workflow (keep concise):
    - Step 1: Run `claudelint check-claude-md --explain`
    - Step 2: Read user's CLAUDE.md file with Read tool
    - Step 3: Explain violations in conversational language
    - Step 4: Identify specific problems (link to references/ for details)
    - Step 5: Ask user what to fix first
    - Step 6: Use Edit tool to make changes
    - Step 7: Use Write tool to create @import files if splitting
    - Step 8: Show before/after comparison
  - [x] Link to references for detailed strategies
  - [x] Keep SKILL.md under 3,000 words (target for interactive skill)

- [x] **Task 3.5**: Create reference documents
  - [x] `references/size-optimization.md`:
    - Strategies for reducing file size
    - What content to move to @imports
    - How to identify bloat (obvious advice, config duplication)
  - [x] `references/import-patterns.md`:
    - Best practices for organizing @imports
    - Directory structure recommendations
    - Common patterns (git workflow, testing, linting)
  - [x] `references/organization-guide.md`:
    - Section organization tips
    - When to split vs consolidate
    - Naming conventions for .claude/rules/ files

- [x] **Task 3.6**: Add examples to SKILL.md (following Phase 2.7 pattern)
  - [x] Example 1: Fix size violations
    - User says: "My CLAUDE.md is too long"
    - Actions: Validate → Identify bloat → Suggest splits
    - Result: Content moved to @imports
  - [x] Example 2: Create import structure
    - User says: "Help me organize my config"
    - Actions: Analyze sections → Create .claude/rules/ files → Replace with @imports
    - Result: Well-organized, modular config
  - [x] Example 3: Remove obvious content
    - User says: "Is my CLAUDE.md too generic?"
    - Actions: Scan for generic advice → Suggest removals
    - Result: Focused, project-specific config

- [ ] **Task 3.7**: Add troubleshooting section
  - [ ] Common issues when using the skill
  - [ ] Not issues the skill helps fix (those are in examples)
  - [ ] Example: "Skill creates @import but file path is wrong"

- [ ] **Task 3.8**: Test skill following Anthropic iterative methodology (manual - automated testing in Phase 5)
  - [ ] **Phase 1: Single-task iteration (Anthropic p15 pro tip)**
    - [ ] Pick ONE challenging CLAUDE.md problem (e.g., 52KB file with bloat, circular imports)
    - [ ] Work with Claude to solve it WITHOUT the skill first
    - [ ] Iterate conversation until perfect solution found
    - [ ] Document the winning approach (what worked, what didn't)
    - [ ] Verify skill instructions match the winning approach
    - [ ] If skill doesn't match, update SKILL.md before expanding tests
  - [ ] **Phase 2: Expanded testing**
    - [ ] Test on bloated CLAUDE.md (>300 lines, obvious content)
    - [ ] Test on well-optimized CLAUDE.md (should suggest minimal changes)
    - [ ] Test on CLAUDE.md with import issues (circular, missing files)
    - [ ] Test on CLAUDE.md with organization problems (too many sections)
  - [ ] **Phase 3: Trigger validation**
    - [ ] Verify trigger phrases work ("optimize my CLAUDE.md", "my config is too long")
    - [ ] Ensure doesn't trigger on informational questions ("what is CLAUDE.md?")
    - [ ] Test paraphrased requests ("help me fix my config", "CLAUDE.md too big")
  - [ ] **Phase 4: Tool execution**
    - [ ] Test actual file editing works (Edit tool creates clean diffs)
    - [ ] Test @import file creation (Write tool creates valid files)
    - [ ] Test references/ documents are helpful when Claude reads them
    - [ ] Verify error handling for edge cases
  - [ ] **Phase 5: Final checks**
    - [ ] Verify SKILL.md stays under 3,000 words
    - [ ] Confirm all acceptance criteria met
    - [ ] Document any issues found for Phase 5 formal testing

### Acceptance Criteria

- [ ] Skill directory follows progressive disclosure structure (SKILL.md + references/)
- [ ] SKILL.md under 3,000 words with core workflow
- [ ] References contain detailed strategies (size-optimization, import-patterns, organization-guide)
- [ ] Description follows Phase 2.7 standards (trigger phrases, under 1024 chars)
- [ ] Metadata includes author, category, documentation
- [ ] Skill loads when user runs `/optimize-cc-md`
- [ ] Claude follows instructions to run validation
- [ ] Claude reads CLAUDE.md file
- [ ] Claude explains violations conversationally (not just CLI dump)
- [ ] Claude asks for confirmation before edits
- [ ] Claude actually makes edits using Edit/Write tools
- [ ] Claude creates @import files when needed
- [ ] Claude references references/ docs when user needs details
- [ ] Trigger phrases work without false positives
- [ ] Examples follow scenario format (User says → Actions → Result)

---

## Phase 4: Documentation & Polish

**Status**: Not Started
**Duration**: 2-3 days
**Dependencies**: Phase 3 complete

### Tasks

- [ ] **Task 4.1**: Create plugin-specific README
  - [ ] NOT the same as npm package README.md
  - [ ] Create `.claude-plugin/README.md` for GitHub plugin users
  - [ ] Focus on plugin capabilities (skill descriptions)
  - [ ] Installation for Claude.ai users (non-npm flow)
  - [ ] Positioning: "Focus on outcomes, not features" (Anthropic p20)
  - [ ] Clear value proposition for plugin installation
  - [ ] Link to npm package README for CLI users

**Example structure**:

```markdown
# claudelint Plugin for Claude Code

Validate and format your Claude Code project files directly in Claude.

## Skills Included

- **validate-all** - Run all validators in one command
- **validate-cc-md** - Check CLAUDE.md size and imports
- **optimize-cc-md** - Interactively improve your CLAUDE.md [NEW]
- [etc.]

## Installation

### For Claude.ai Users
/plugin install github:pdugan20/claudelint

### For npm Users (CLI + Skills)
npm install --save-dev claude-code-lint
/plugin install --source ./node_modules/claude-code-lint

## Usage

Simply ask Claude to validate your files:
- "Check my Claude Code project"
- "Validate my CLAUDE.md"
- "Optimize my config"

## Requirements

Requires `claude-code-lint` npm package for CLI commands.
```

- [ ] **Task 4.2**: Update main npm README
  - [ ] Add optimize-cc-md to skills list
  - [ ] Document skill namespace usage (`/claudelint:optimize-cc-md`)
  - [ ] Update feature list
  - [ ] Add optimize-cc-md usage example
  - [ ] Link to plugin README for plugin-only users

- [ ] **Task 4.3**: Update skill quality standards documentation
  - [ ] Create `docs/skill-development.md` or update existing
  - [ ] Document trigger phrase requirements (Phase 2.7)
  - [ ] Document troubleshooting requirements
  - [ ] Document progressive disclosure guidelines
  - [ ] Include examples from skill-improvement-guidelines.md
  - [ ] Reference for future skill development

- [ ] **Task 4.4**: Update CONTRIBUTING.md
  - [ ] Add skill quality standards section
  - [ ] Link to skill-improvement-guidelines.md
  - [ ] Document skill PR requirements
  - [ ] Require trigger phrases in descriptions
  - [ ] Require troubleshooting for complex skills

### Acceptance Criteria

- [ ] Plugin README created for GitHub users
- [ ] Plugin README focuses on outcomes, not implementation
- [ ] npm README updated with optimize-cc-md
- [ ] Skill development standards documented
- [ ] CONTRIBUTING.md has skill quality requirements
- [ ] No broken references to old skill names
- [ ] All documentation follows markdown linting rules

---

## Phase 5: Testing & Release

**Status**: Not Started
**Duration**: 2-3 days
**Dependencies**: Phase 4 complete

**Testing Strategy**: Based on Anthropic Chapter 3 (p14-17) - systematic skill testing at three levels: triggering, functional, and performance.

### Tasks

#### Task 5.1: Create Skill Test Suite (Anthropic p15-17)

**Goal**: Systematic testing for all 9 skills (8 existing + optimize-cc-md).

**Reference**: See `docs/projects/plugin-and-md-management/skill-improvement-guidelines.md` section "Testing Checklist"

- [ ] **5.1.1**: Create triggering test suite
  - [ ] Create `tests/skills/triggering-tests.md` with test cases
  - [ ] For EACH skill, define:
    - [x] Queries that should trigger (obvious + paraphrased)
    - [ ] Queries that should NOT trigger (unrelated)
  - [ ] Document expected behavior
  - [ ] Create test protocol for manual validation

**Example test suite for validate-cc-md**:

```markdown
# validate-cc-md Triggering Tests

## Should Trigger
- [x] "check my CLAUDE.md"
- [x] "validate my config file"
- [x] "why is my CLAUDE.md too long"
- [x] "audit my CLAUDE.md"
- [x] "fix my imports"

## Should NOT Trigger
- [ ] "what is CLAUDE.md?" (informational)
- [ ] "help me write code" (unrelated)
- [ ] "validate my Python code" (wrong domain)

## Test Protocol
1. Start new Claude Code session
2. Enable claudelint plugin
3. For each query above, check if skill loads
4. Document: triggered (yes/no), time to load
```

- [ ] **5.1.2**: Create functional test suite
  - [ ] Create `tests/skills/functional-tests.md`
  - [ ] For top 4 skills (validate-all, validate-cc-md, validate-skills, optimize-cc-md):
    - Define expected claudelint command
    - Define expected tool usage (Bash, Read, Edit, Write)
    - Define expected output format
  - [ ] Create test fixtures (sample CLAUDE.md files with known issues)
  - [ ] Document expected results

**Example for validate-cc-md**:

```markdown
# validate-cc-md Functional Tests

## Test Case 1: Oversized File
**Fixture**: tests/fixtures/claude-md/oversized.md (51KB)
**Expected**:
1. Skill executes `claudelint check-claude-md`
2. Reports "File exceeds 50KB (ERROR)"
3. Suggests splitting into @imports
4. Exit code: 2 (error)

## Test Case 2: Missing Import
**Fixture**: tests/fixtures/claude-md/missing-import.md
**Expected**:
1. Detects @import directive to non-existent file
2. Reports "Import not found: .claude/rules/missing.md"
3. Suggests checking path
4. Exit code: 2 (error)
```

- [ ] **5.1.3**: Create performance comparison test
  - [ ] Create `tests/skills/performance-comparison.md`
  - [ ] Document baseline (without skills) vs with skills
  - [ ] Track metrics (Anthropic p16):
    - Tool calls required
    - User messages needed
    - Tokens consumed
    - Task completion success rate

**Example comparison for validate-all**:

```markdown
# validate-all Performance Comparison

## Without Skill
**Scenario**: User wants to validate entire project

Workflow:
1. User: "How do I validate my Claude Code project?"
2. Claude: "You can use claudelint. What do you want to validate?"
3. User: "Everything"
4. Claude: "Try running: claudelint check-all"
5. User: *runs command manually*

**Metrics**:
- User messages: 3
- Tool calls: 0 (Claude doesn't run it)
- Time: ~2 minutes
- Success: Depends on user following instructions

## With Skill
**Scenario**: User wants to validate entire project

Workflow:
1. User: "check my entire Claude Code project"
2. Skill triggers automatically
3. Claude runs: `claudelint check-all`
4. Reports results

**Metrics**:
- User messages: 1
- Tool calls: 1 (Bash)
- Time: ~30 seconds
- Success: 100% (automated execution)

**Improvement**: 75% reduction in user effort, automated execution
```

#### Task 5.2: Execute Manual Testing

- [ ] **5.2.1**: Run triggering tests
  - [ ] Test all 9 skills with queries from triggering test suite
  - [ ] Document trigger success rate (target: 90%+)
  - [ ] Document false positives (skill triggers when it shouldn't)
  - [ ] Update descriptions if needed to improve triggering

- [ ] **5.2.2**: Run functional tests
  - [ ] Test each skill executes correct commands
  - [ ] Verify dependency checks work (npm package required)
  - [ ] Test error messages are clear
  - [ ] Verify examples in SKILL.md are accurate
  - [ ] Test optimize-cc-md actually edits files correctly

- [ ] **5.2.3**: Run performance comparison
  - [ ] Execute validate-all with/without skill
  - [ ] Execute optimize-cc-md with/without skill
  - [ ] Document improvements
  - [ ] Use for release notes

#### Task 5.3: Integration Testing

- [ ] Test plugin installation from local source: `/plugin install --source .`
- [ ] Test plugin installation from GitHub (after publishing)
- [ ] Test all skill namespaces: `/claudelint:validate-all`, `/claudelint:optimize-cc-md`, etc.
- [ ] Verify npm pack includes .claude/ directory
- [ ] Test dependency detection (skill fails gracefully when npm package missing)
- [ ] Test in both Claude.ai and Claude Code

#### Task 5.4: Version Bump & Release

- [ ] Determine semver bump (likely minor: 0.2.x → 0.3.0)
  - Breaking changes? (No - all additions)
  - New features? (Yes - optimize-cc-md, skill improvements)
  - Bug fixes? (Yes - better descriptions, troubleshooting)
- [ ] Run `npm run release` (auto-generates CHANGELOG)
- [ ] Verify `npm run sync:versions` runs
- [ ] Review generated CHANGELOG
- [ ] Push tags to GitHub

#### Task 5.5: Publish & Announce

- [ ] npm publish
- [ ] Create GitHub release with highlights:
  - NEW: optimize-cc-md skill (interactive CLAUDE.md optimization)
  - IMPROVED: All 8 skills now follow Anthropic best practices
  - IMPROVED: Better trigger phrases for skill activation
  - IMPROVED: Troubleshooting sections for complex skills
  - IMPROVED: Scenario-based examples
- [ ] Update release notes with performance comparison
- [ ] Announce on relevant channels (if applicable)

### Acceptance Criteria

- [ ] All 3 test types documented (triggering, functional, performance)
- [ ] Test fixtures created for functional tests
- [ ] Triggering success rate >90% for all skills
- [ ] No false positives in triggering tests
- [ ] All functional tests pass
- [ ] Performance comparison shows improvement
- [ ] Plugin installable from both GitHub and npm
- [ ] All skills work correctly via namespace
- [ ] npm package published successfully
- [ ] GitHub release created with highlights
- [ ] CHANGELOG auto-generated correctly

### Success Metrics (from Anthropic p9)

**Quantitative**:

- Skills trigger on 90%+ of relevant queries
- 0 failed API calls per workflow (dependency checks work)
- Reduced token consumption vs baseline

**Qualitative**:

- Users don't need to prompt Claude about next steps
- Workflows complete without user correction
- Consistent results across sessions
- New users can accomplish tasks on first try

## Progress Summary

```text
Phase 0: [██████████] 100% (Complete - research & planning)
Phase 1: [██████████] 100% (Complete - bug fixes & plugin infrastructure)
Phase 2: [██████████] 100% (Complete - schema verification, deprecation system, skill improvements)
  2.6:   [██████████] 100% (Complete - rule deprecation system)
  2.7:   [██████████] 100% (Complete - skill quality improvements)
Phase 3: [░░░░░░░░░░]   0% (0/8 tasks - optimize-cc-md skill with progressive disclosure)
Phase 4: [░░░░░░░░░░]   0% (0/4 tasks - documentation & polish)
Phase 5: [░░░░░░░░░░]   0% (0/5 tasks - testing & release)

Overall: [██████░░░░] 65% (Phases 0-2 complete, Phase 3-5 remaining)
```

## Estimated Timeline

### Completed

- **Phase 0**: Complete (1 day - research & planning)
- **Phase 1**: Complete (1.5 days - bug fixes + plugin setup + skill renames + E10 update)
- **Phase 2.1-2.5**: Complete (9 days - schema verification system)
- **Phase 2.6**: Complete (2.5 days - rule deprecation system)
- **Phase 2.7**: Complete (1 day - skill quality improvements)

### Remaining

- **Phase 3**: 3-4 days (optimize-cc-md skill with progressive disclosure)
  - Task 3.1: Design structure (1 hour)
  - Task 3.2: Create directories (30 min)
  - Task 3.3: Write frontmatter (1 hour)
  - Task 3.4: Write core workflow (4-6 hours)
  - Task 3.5: Create reference docs (6-8 hours)
  - Task 3.6: Add examples (2 hours)
  - Task 3.7: Add troubleshooting (1 hour)
  - Task 3.8: Manual testing (3-4 hours)
- **Phase 4**: 2-3 days (documentation & polish - expanded)
  - Task 4.1: Plugin README (3-4 hours)
  - Task 4.2: Update npm README (2 hours)
  - Task 4.3: Skill development standards (3-4 hours)
  - Task 4.4: Update CONTRIBUTING (1-2 hours)
- **Phase 5**: 2-3 days (testing & release - comprehensive)
  - Task 5.1: Create test suite (6-8 hours)
  - Task 5.2: Execute manual testing (6-8 hours)
  - Task 5.3: Integration testing (2-3 hours)
  - Task 5.4: Version bump (1 hour)
  - Task 5.5: Publish & announce (1-2 hours)

**Total Remaining**: 7-10 days (~1.5-2 weeks)

**Total Project**: 22-25 days (~4-5 weeks)

### Current Status

- **Days completed**: ~15 days
- **Days remaining**: ~7-10 days
- **Completion**: 65%

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
