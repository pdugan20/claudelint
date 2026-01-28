# Rule Implementation Difficulty Analysis (Schema-Based Approach)

**Revised**: 2026-01-27
**Approach**: Schema-first validation with Zod

This document categorizes all 207 missing rules by implementation difficulty using the **schema-based approach**.

## Key Insight

With Zod schemas, the difficulty profile changes dramatically:

### Traditional Approach (Manual Validation)

- **Easy**: 138 rules (67%) - 10-20 lines each
- **Moderate**: 48 rules (23%) - 20-50 lines each
- **Difficult**: 21 rules (10%) - 50+ lines each
- **Total effort**: ~5,000 lines of validation code

### Schema-Based Approach (This Plan)

- **Trivial**: 140 rules (68%) - **Schema definitions only** (1 line each)
- **Easy**: 45 rules (22%) - **Custom refinements** (5-10 lines each)
- **Moderate**: 22 rules (10%) - **Custom logic** (20-50 lines each)
- **Total effort**: ~1,500 lines of code (70% reduction)

---

## Summary

- **Trivial** (Schema): 140 rules (68%) - Just Zod schema definitions
- **Easy** (Refinements): 45 rules (22%) - Custom Zod refinements
- **Moderate** (Logic): 22 rules (10%) - Custom validation logic

---

##  TRIVIAL - Schema Definitions (140 rules - 68%)

These rules are **automatically handled by Zod schemas** with built-in validators.

### Skills Frontmatter (12 trivial)

Defined in `SkillFrontmatterSchema`:

-  `skill-frontmatter-name-max-length` - `z.string().max(64)`
-  `skill-frontmatter-description-empty` - `z.string().min(1)`
-  `skill-frontmatter-description-max-length` - `z.string().max(1024)`
-  `skill-frontmatter-context-invalid-value` - `z.enum(['fork'])`
-  `skill-frontmatter-model-invalid` - `z.enum(['sonnet', 'opus', 'haiku'])`
-  `skill-frontmatter-allowed-tools-invalid` - `z.array(z.string())`
-  `skill-body-too-long` - Line count check
-  `skill-reference-too-deep` - Path depth check
-  `skill-windows-paths` - Regex check
-  `skill-naming-not-gerund` - Info refinement
-  `skill-large-reference-no-toc` - Conditional check
-  `skill-invalid-substitution` - Regex refinement

### Settings (25 trivial)

Handled by enhanced `SettingsSchema`:

-  `settings-invalid-root-field` - `z.object().strict()`
-  `settings-invalid-field-type` - Zod type checking
-  `settings-permission-invalid-mode` - `z.enum(['acceptEdits', ...])`
-  `settings-attribution-invalid-field` - `z.object().strict()`
-  `settings-sandbox-invalid-field` - `z.object().strict()`
-  `settings-sandbox-invalid-port` - `z.number().min(1).max(65535)`
-  `settings-statusline-invalid-type` - `z.literal('command')`
-  `settings-statusline-missing-command` - `z.string()`
-  `settings-filesuggestion-invalid-type` - `z.literal('command')`
-  `settings-filesuggestion-missing-command` - `z.string()`
-  `settings-hooks-invalid-event` - Enum check
-  `settings-hooks-invalid-tool` - Tool check
-  `settings-mcp-server-invalid-name` - String validation
-  `settings-marketplace-missing-required` - Required fields
-  `settings-number-out-of-range` - `z.number().min().max()`
-  `settings-enum-invalid-value` - `z.enum()`
-  `settings-deprecated-field` - Schema check
-  `settings-scope-invalid` - `z.enum(['local', 'project', 'user'])`
-  `settings-path-not-relative` - Refinement
-  `settings-env-var-invalid-name` - Regex refinement
-  `settings-sandbox-invalid-network` - Object schema
-  `settings-permission-invalid-tool` - Array validation
-  All numeric range validations
-  All type checks
-  All enum validations

### Hooks (18 trivial)

Enhanced `HooksConfigSchema`:

-  `hooks-invalid-event-name` - `z.enum([...12 events])`
-  `hooks-invalid-hook-type` - `z.enum(['command', 'prompt', 'agent'])`
-  `hooks-missing-command` - Conditional required
-  `hooks-missing-prompt` - Conditional required
-  `hooks-both-command-and-prompt` - Schema refinement
-  `hooks-invalid-timeout` - `z.number().positive()`
-  `hooks-invalid-matcher-type` - `z.string()`
-  `hooks-invalid-hooks-array` - `z.array()`
-  `hooks-invalid-permission-decision` - `z.enum(['allow', 'deny', 'ask'])`
-  `hooks-invalid-permission-behavior` - `z.enum(['allow', 'deny'])`
-  `hooks-block-without-reason` - Schema refinement
-  `hooks-continue-false-without-reason` - Schema refinement
-  All type checks
-  All enum validations
-  All required field checks
-  Warning-level validations
-  Info-level validations
-  Context-aware checks

### MCP Servers (20 trivial)

Enhanced `MCPConfigSchema`:

-  `mcp-invalid-root-field` - `z.object().strict()`
-  `mcp-invalid-server-name` - `z.string()`
-  `mcp-missing-type` - Required field
-  `mcp-invalid-type` - `z.enum(['stdio', 'http', 'sse', 'websocket'])`
-  `mcp-stdio-missing-command` - Conditional required
-  `mcp-http-missing-url` - Conditional required
-  `mcp-sse-missing-url` - Conditional required
-  `mcp-invalid-command-type` - `z.string()`
-  `mcp-invalid-args-type` - `z.array(z.string())`
-  `mcp-invalid-env-type` - `z.record(z.string())`
-  `mcp-invalid-headers-type` - `z.record(z.string())`
-  `mcp-scope-invalid` - `z.enum(['local', 'project', 'user'])`
-  `mcp-invalid-timeout` - `z.number().positive()`
-  `mcp-invalid-max-output` - `z.number().positive()`
-  `mcp-sse-deprecated` - Warning
-  All type checks
-  All enum validations
-  All required fields
-  Transport-specific schemas
-  Conditional validation

### Plugins (25 trivial)

Enhanced `PluginManifestSchema`:

-  `plugin-missing-manifest` - File check
-  `plugin-missing-name` - Required field
-  `plugin-missing-description` - Required field
-  `plugin-missing-version` - Required field
-  `plugin-name-too-long` - `z.string().max(64)`
-  `plugin-description-empty` - `z.string().min(1)`
-  `plugin-author-invalid-type` - `z.object()`
-  `plugin-author-missing-name` - Required field
-  `plugin-invalid-skills-path` - `z.array(z.string())`
-  `plugin-invalid-agents-path` - `z.array(z.string())`
-  `plugin-invalid-commands-path` - `z.array(z.string())`
-  `plugin-invalid-hooks-path` - `z.string()`
-  `plugin-marketplace-missing-plugins` - Required array
-  `plugin-marketplace-missing-version` - Required field
-  All type checks
-  All required fields
-  All array validations
-  All object validations
-  Location checks (simple)
-  Missing file checks
-  Invalid root field checks
-  Directory structure checks
-  README checks
-  Namespace checks (simple)
-  Schema validations

### Agents (20 trivial)

`AgentFrontmatterSchema`:

-  `agent-missing-frontmatter` - Frontmatter check
-  `agent-missing-name` - Required field
-  `agent-missing-description` - Required field
-  `agent-name-too-long` - `z.string().max(64)`
-  `agent-description-empty` - `z.string().min(1)`
-  `agent-invalid-frontmatter-field` - `z.object().strict()`
-  `agent-tools-invalid-type` - `z.array(z.string())`
-  `agent-disallowed-tools-invalid-type` - `z.array(z.string())`
-  `agent-model-invalid` - `z.enum()`
-  `agent-permission-mode-invalid` - `z.enum()`
-  `agent-skills-invalid-type` - `z.array(z.string())`
-  `agent-missing-body` - Body check
-  `agent-empty-body` - Body check
-  `agent-no-tools-specified` - Info message
-  `agent-bypass-permissions-warning` - Warning message
-  `agent-skills-not-inherited` - Info message
-  `agent-cannot-spawn-subagents` - Info message
-  All type checks
-  All enum validations
-  All required fields

### LSP Servers (15 trivial)

`LSPConfigSchema`:

-  `lsp-missing-command` - Required field
-  `lsp-missing-extension-to-language` - Required field
-  `lsp-command-not-string` - `z.string()`
-  `lsp-extension-to-language-not-object` - `z.object()`
-  `lsp-language-not-string` - `z.string()`
-  `lsp-args-not-array` - `z.array(z.string())`
-  `lsp-transport-invalid` - `z.enum(['stdio', 'socket'])`
-  `lsp-env-not-object` - `z.record(z.string())`
-  `lsp-initialization-options-not-object` - `z.object()`
-  `lsp-settings-not-object` - `z.object()`
-  `lsp-workspace-folder-not-string` - `z.string()`
-  `lsp-startup-timeout-invalid` - `z.number().positive()`
-  `lsp-shutdown-timeout-invalid` - `z.number().positive()`
-  `lsp-restart-on-crash-not-boolean` - `z.boolean()`
-  `lsp-max-restarts-invalid` - `z.number().positive().int()`

### Output Styles (10 trivial)

`OutputStyleFrontmatterSchema`:

-  `output-style-missing-frontmatter` - Frontmatter check
-  `output-style-invalid-frontmatter-field` - `z.object().strict()`
-  `output-style-name-invalid-type` - `z.string()`
-  `output-style-description-invalid-type` - `z.string()`
-  `output-style-keep-coding-invalid-type` - `z.boolean()`
-  `output-style-missing-body` - Body check
-  `output-style-empty-body` - Body check
-  `output-style-description-empty` - `z.string().min(1)`
-  `output-style-name-too-long` - `z.string().max()`
-  `output-style-invalid-file-extension` - File check

### Commands (3 trivial)

All deprecation warnings:

-  `commands-deprecated-directory` - Directory check
-  `commands-migrate-to-skills` - Info message
-  `commands-in-plugin-deprecated` - Warning message

### CLAUDE.md (2 trivial)

-  `filename-case-sensitive` - String comparison
-  `frontmatter-unknown-field` - `z.object().strict()`

---

##  EASY - Custom Refinements (45 rules - 22%)

These require **custom Zod refinements** but are straightforward.

### Implemented as Refinements in `src/schemas/refinements.ts`

#### String Pattern Refinements (15 rules)

- `skill-frontmatter-name-invalid-chars` → `lowercaseHyphens()`
- `skill-frontmatter-name-xml-tags` → `noXMLTags()`
- `skill-frontmatter-name-reserved-words` → `noReservedWords(['anthropic', 'claude'])`
- `skill-frontmatter-description-xml-tags` → `noXMLTags()`
- `skill-frontmatter-description-first-person` → `thirdPerson()`
- `agent-name-invalid-format` → `lowercaseHyphens()`
- `plugin-name-invalid-format` → `lowercaseHyphens()`
- `plugin-version-invalid-semver` → `semver()`
- `plugin-homepage-invalid-url` → `validURL()`
- `settings-uuid-invalid-format` → `validUUID()`
- `settings-env-var-invalid-name` → `envVarName()`
- `mcp-invalid-url-format` → `validURL()`
- `lsp-extension-invalid-format` → Starts with "." refinement
- `hooks-path-traversal-risk` → `noPathTraversal()`
- `hooks-sensitive-file-access` → Pattern matching refinement

#### Path Refinements (8 rules)

- `settings-sandbox-invalid-path` → `absolutePath()`
- `settings-marketplace-invalid-path` → `absolutePath()`
- `settings-path-not-relative` → `relativePath()`
- `mcp-invalid-path` → `absolutePath()`
- `skill-windows-paths` → Forward slash refinement
- `hooks-path-traversal-risk` → `noPathTraversal()`
- `output-style-invalid-location` → Directory check
- `output-style-plugin-location-wrong` → Directory check

#### Cross-Field Validations (12 rules)

- `skill-frontmatter-agent-invalid` → Schema refinement (if context=fork, agent required)
- `hooks-both-command-and-prompt` → Mutual exclusivity refinement
- `hooks-block-without-reason` → Conditional required refinement
- `hooks-continue-false-without-reason` → Conditional required refinement
- `agent-tools-conflict` → Array overlap refinement
- `agent-hooks-invalid-event` → Enum subset refinement
- `plugin-repository-invalid-format` → Union type refinement
- `settings-marketplace-invalid-source` → Discriminated union
- `mcp-managed-multiple-restriction-types` → Mutual exclusivity
- `hooks-matcher-on-non-tool-event` → Event-specific validation
- `mcp-both-managed-and-user` → File existence refinement
- `lsp-inline-conflicts-with-file` → Mutual exclusivity

#### Environment Variable Validations (5 rules)

- `settings-env-var-unknown` → Check against documented list
- `mcp-env-var-undefined` → Check for ${VAR} without default
- `hooks-env-var-undefined` → Check for known env vars
- `hooks-command-not-quoted` → Regex for `$VAR` vs `"$VAR"`
- `mcp-invalid-env-expansion` → Validate `${VAR}` and `${VAR:-default}` syntax

#### Warning/Info Level Refinements (5 rules)

- `mcp-sse-deprecated` → Simple warning
- `settings-deprecated-field` → Check for specific field
- `hooks-deprecated-decision-fields` → Check for old field names
- `lsp-socket-transport-deprecated` → Warning message
- `hooks-exit-code-2-with-json` → Info message

---

##  MODERATE - Custom Logic (22 rules - 10%)

These require **custom validation logic** beyond schemas.

### File System Operations (8 rules)

- `import-missing` - Check file exists at import path
- `import-circular` - Detect circular imports (graph traversal, max depth 5)
- `plugin-missing-file` - Verify referenced files exist
- `hooks-missing-script` - Verify command script exists
- `skill-frontmatter-allowed-tools-invalid` - Validate against VALID_TOOLS registry
- `agent-tools-invalid-tool` - Validate against VALID_TOOLS registry
- `agent-disallowed-tools-invalid-tool` - Validate against VALID_TOOLS registry
- `lsp-binary-not-in-path` - Check if executable in PATH (platform-aware)

### Content Analysis (6 rules)

- `import-in-code-block` - Parse markdown AST to detect imports in code blocks
- `frontmatter-invalid-paths` - Validate glob patterns in paths array
- `skill-time-sensitive-content` - Detect date/year patterns in content
- `skill-body-too-long` - Count lines in markdown body (>500 warning)
- `skill-reference-too-deep` - Check reference file nesting level
- `skill-large-reference-no-toc` - Check if >100 line file has TOC

### Cross-Reference Validation (4 rules)

- `agent-skills-not-found` - Resolve skill references
- `agent-hooks-invalid-schema` - Validate hooks object against HookSchema
- `plugin-circular-dependency` - Detect cycles in plugin dependencies
- `plugin-dependency-not-found` - Resolve plugin dependencies

### Complex Schema Logic (4 rules)

- `hooks-json-output-schema` - Validate JSON against event-specific schemas
- `settings-permission-invalid-rule` - Parse Tool(pattern) glob syntax
- `plugin-marketplace-invalid-source` - Discriminated union (7 source types)
- `mcp-tool-search-invalid-value` - Parse "auto", "auto:N", "true", "false"

---

## Implementation Effort Comparison

### Traditional Manual Validation

| Component | Rules/Items | Lines/Item | Total Lines |
|----------|-------|------------|-------------|
| Validation logic - Easy | 138 | 15 | 2,070 |
| Validation logic - Moderate | 48 | 40 | 1,920 |
| Validation logic - Difficult | 21 | 80 | 1,680 |
| Rule registry | 219 | 27 | 5,913 |
| Test fixtures | 6 files | 25 | 150 |
| Error reporting | 95 calls | 5 | 475 |
| Constants | - | - | 200 |
| **Total** | **207 rules** | **Avg 60** | **12,408** |

### Schema-Based Validation + Optimizations

| Component | Rules/Items | Lines/Item | Total Lines |
|-----------|-------|------------|-------------|
| Trivial (Schema) | 140 | 1 | 140 |
| Easy (Refinement) | 45 | 5 | 225 |
| Moderate (Logic) | 22 | 40 | 880 |
| Auto-generated registry | 1 script | 100 | 100 |
| Builder-based tests | All tests | - | 50 |
| Schema-driven errors | 1 helper | 20 | 20 |
| Schema constants | - | - | 100 |
| **Total** | **207 rules** | **Avg 7** | **1,515** |

**Overall Reduction: 88%** (12,408 → 1,515 lines)

---

## Implementation Phases

### Phase 1: Schema Infrastructure (Week 1)

**Effort**: 200 lines
**Deliverable**: Foundation for all trivial + easy rules

1. Create `src/schemas/refinements.ts` (all reusable refinements)
2. Create `src/utils/schema-helpers.ts` (validation helpers)
3. Set up testing infrastructure

### Phase 2: Schema Definitions (Week 2)

**Effort**: 400 lines
**Deliverable**: 140 trivial rules implemented

1. `skill-frontmatter.schema.ts`
2. `agent-frontmatter.schema.ts`
3. `output-style-frontmatter.schema.ts`
4. `lsp-config.schema.ts`
5. `claude-md-frontmatter.schema.ts`
6. Enhance existing schemas (Settings, Hooks, MCP, Plugin)

### Phase 3: Refinements (Week 3)

**Effort**: 300 lines
**Deliverable**: 45 easy rules implemented

1. String pattern refinements
2. Path refinements
3. Cross-field validations
4. Environment variable validations
5. Warning/info refinements

### Phase 4: Custom Logic (Week 4-5)

**Effort**: 800 lines
**Deliverable**: 22 moderate rules implemented

1. File system operations
2. Content analysis
3. Cross-reference validation
4. Complex schema logic

### Phase 5: Testing & Documentation (Week 6)

**Effort**: N/A
**Deliverable**: Complete test coverage and docs

1. Schema tests
2. Integration tests
3. Generated documentation
4. Examples for each rule

---

## Success Metrics

### Code Quality

-  78% reduction in validation code
-  Schema-driven validation (140 rules = 140 lines)
-  Reusable refinements (45 rules share ~15 refinements)
-  Minimal custom logic (22 rules need custom code)

### Maintainability

-  Self-documenting schemas
-  Type-safe with TypeScript
-  Easy to test (schema testing is straightforward)
-  Clear separation of concerns

### Performance

-  Zod is fast (~microseconds per validation)
-  Lazy evaluation where possible
-  No performance degradation from manual approach

---

## Recommended Strategy

1. **Start with schemas** (Phases 1-2): Gets 140 rules done in 2 weeks
2. **Add refinements** (Phase 3): Gets 45 more rules in 1 week
3. **Custom logic last** (Phase 4): Final 22 rules in 2 weeks
4. **Ship incrementally**: Release after each phase

**Total timeline: 6 weeks for all 207 rules**

This is significantly faster than the 5-8 weeks estimated for manual validation, with much cleaner code.

---

## Additional Optimization Benefits

Beyond schema validation, we've identified 4 additional optimizations:

### 1. Auto-Generated Rule Registry (98% reduction)

Instead of manually registering 219 rules (5,913 lines), extract metadata from schemas and auto-generate the registry (100 lines).

**Impact**:

- Traditional: 219 rules × 27 lines = 5,913 lines
- Optimized: 1 script = 100 lines
- **Savings: 5,813 lines (98%)**

### 2. Standardized Test Fixtures (67% reduction)

Replace duplicate fixture creation functions across 6+ test files with consistent builder pattern.

**Impact**:

- Traditional: 6 files × 25 lines = 150 lines of duplication
- Optimized: Use existing builders = 50 lines
- **Savings: 100 lines (67%)**

### 3. Schema-Driven Error Reporting (96% reduction)

Replace 95 manual `reportError()` calls with automatic schema error conversion.

**Impact**:

- Traditional: 95 calls × 5 lines = 475 lines
- Optimized: 1 helper function = 20 lines
- **Savings: 455 lines (96%)**

### 4. Schema-Derived Constants (50% reduction)

Define enums once in Zod schemas, derive both schema validators and runtime constants.

**Impact**:

- Traditional: 200 lines (duplicated in constants.ts and schemas)
- Optimized: 100 lines (single source of truth)
- **Savings: 100 lines (50%)**

### 5. Composition Framework (75% reduction)

Adopt existing composition operators instead of manual if/else validation chains.

**Impact**:

- Traditional: ~2,000 lines of manual checks across validators
- Optimized: ~500 lines using composition operators
- **Savings: 1,500 lines (75%)**

---

## Combined Impact Summary

| Optimization | Savings | Priority |
|-------------|---------|----------|
| Schema validation | 4,425 lines (78%) |  Core |
| Auto-generated registry | 5,813 lines (98%) |  High |
| Builder fixtures | 100 lines (67%) |  Medium |
| Schema errors | 455 lines (96%) |  High |
| Schema constants | 100 lines (50%) |  Low |
| Composition framework | 1,500 lines (75%) |  Medium |
| **Total** | **10,893 lines saved** | **88% reduction** |

---
