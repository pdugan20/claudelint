# Rule Implementation Difficulty Analysis

This document categorizes all 207 missing rules by implementation difficulty.

## Summary

- **Easy**: 138 rules (67%) - Simple validation logic
- **Moderate**: 48 rules (23%) - Requires libraries/parsers
- **Difficult**: 21 rules (10%) - Complex logic required

---

## ✅ EASY (138 rules - 67%)

### Category 1: CLAUDE.md (4 easy)

- `frontmatter-unknown-field` - Check for unknown keys
- `filename-case-sensitive` - String comparison
- `import-invalid-home-path` - Path validation
- `rules-circular-symlink` - Can be moderate if doing full cycle detection, easy if just checking one level

### Category 2: Skills (15 easy)

- `skill-frontmatter-name-max-length` - String length check
- `skill-frontmatter-name-invalid-chars` - Regex validation
- `skill-frontmatter-name-reserved-words` - String includes check
- `skill-frontmatter-name-xml-tags` - Regex for `<>`
- `skill-frontmatter-description-empty` - Truthy check
- `skill-frontmatter-description-max-length` - String length check
- `skill-frontmatter-description-xml-tags` - Regex for `<>`
- `skill-frontmatter-description-first-person` - Regex for "I can", "You can"
- `skill-frontmatter-context-invalid-value` - Enum check
- `skill-frontmatter-model-invalid` - Enum check
- `skill-body-too-long` - Line count check
- `skill-reference-too-deep` - Path depth check
- `skill-windows-paths` - Check for backslashes
- `skill-naming-not-gerund` - Info level, simple heuristic
- `skill-large-reference-no-toc` - Line count + check for "# " headers

### Category 3: Settings (20 easy)

- `settings-invalid-root-field` - Check against known keys
- `settings-invalid-field-type` - typeof check
- `settings-permission-invalid-mode` - Enum check
- `settings-permission-invalid-tool` - Check tool exists
- `settings-attribution-invalid-field` - Check against "commit", "pr"
- `settings-sandbox-invalid-field` - Check against known keys
- `settings-sandbox-invalid-network` - Object structure check
- `settings-sandbox-invalid-port` - Number range check (1-65535)
- `settings-statusline-invalid-type` - Enum check
- `settings-statusline-missing-command` - Required field check
- `settings-filesuggestion-invalid-type` - Enum check
- `settings-filesuggestion-missing-command` - Required field check
- `settings-hooks-invalid-event` - Check against known events
- `settings-hooks-invalid-tool` - Check tool exists
- `settings-mcp-server-invalid-name` - String validation
- `settings-marketplace-missing-required` - Required field check
- `settings-number-out-of-range` - Number range check
- `settings-enum-invalid-value` - Enum check
- `settings-deprecated-field` - Check for "includeCoAuthoredBy"
- `settings-scope-invalid` - Enum check

### Category 4: Hooks (15 easy)

- `hooks-invalid-event-name` - Check against 12 known events
- `hooks-invalid-hook-type` - Enum check ("command" or "prompt")
- `hooks-missing-command` - Required field check
- `hooks-missing-prompt` - Required field check
- `hooks-both-command-and-prompt` - Mutual exclusivity check
- `hooks-prompt-type-deprecated-events` - Warning for non-Stop/SubagentStop
- `hooks-invalid-timeout` - Positive number check
- `hooks-invalid-matcher-type` - String type check
- `hooks-invalid-hooks-array` - Array type check
- `hooks-once-not-in-skill` - Context check
- `hooks-invalid-permission-decision` - Enum check
- `hooks-invalid-permission-behavior` - Enum check
- `hooks-block-without-reason` - Conditional field requirement
- `hooks-continue-false-without-reason` - Conditional field requirement
- `hooks-description-outside-plugin` - Context check

### Category 5: MCP Servers (15 easy)

- `mcp-invalid-root-field` - Check only "mcpServers" allowed
- `mcp-invalid-server-name` - String validation
- `mcp-missing-type` - Required field check
- `mcp-invalid-type` - Enum check (stdio/http/sse/websocket)
- `mcp-sse-deprecated` - Warning check
- `mcp-stdio-missing-command` - Conditional required field
- `mcp-http-missing-url` - Conditional required field
- `mcp-sse-missing-url` - Conditional required field
- `mcp-invalid-command-type` - String type check
- `mcp-invalid-args-type` - Array type check
- `mcp-invalid-env-type` - Object type check
- `mcp-invalid-headers-type` - Object type check
- `mcp-scope-invalid` - Enum check
- `mcp-invalid-timeout` - Positive number check
- `mcp-invalid-max-output` - Positive number check

### Category 6: Plugins (20 easy)

- `plugin-missing-manifest` - File exists check
- `plugin-manifest-not-in-subdir` - Path check
- `plugin-invalid-root-field` - Check against known keys
- `plugin-missing-name` - Required field check
- `plugin-missing-description` - Required field check
- `plugin-missing-version` - Required field check
- `plugin-name-too-long` - String length check (64 chars)
- `plugin-description-empty` - Truthy check
- `plugin-author-invalid-type` - Object type check
- `plugin-author-missing-name` - Required field check
- `plugin-components-at-root` - Directory location check
- `plugin-invalid-skills-path` - Array type check
- `plugin-invalid-agents-path` - Array type check
- `plugin-invalid-commands-path` - Array type check
- `plugin-invalid-hooks-path` - String type check
- `plugin-mcp-servers-in-wrong-location` - File location check
- `plugin-lsp-servers-in-wrong-location` - File location check
- `plugin-missing-readme` - File exists check
- `plugin-marketplace-missing-plugins` - Required field check
- `plugin-marketplace-missing-version` - Required field check

### Category 7: Agents (15 easy)

- `agent-missing-frontmatter` - Frontmatter exists check
- `agent-missing-name` - Required field check
- `agent-missing-description` - Required field check
- `agent-name-too-long` - String length check (64 chars)
- `agent-description-empty` - Truthy check
- `agent-invalid-frontmatter-field` - Check against known keys
- `agent-tools-invalid-type` - Array type check
- `agent-disallowed-tools-invalid-type` - Array type check
- `agent-model-invalid` - Enum check
- `agent-permission-mode-invalid` - Enum check
- `agent-skills-invalid-type` - Array type check
- `agent-hooks-invalid-event` - Check against 3 allowed events
- `agent-missing-body` - Body content check
- `agent-empty-body` - Body content check
- `agent-no-tools-specified` - Info message

### Category 8: Commands (3 easy)

- `commands-deprecated-directory` - Directory exists check
- `commands-migrate-to-skills` - Info message
- `commands-in-plugin-deprecated` - Directory exists check

### Category 9: LSP Servers (13 easy)

- `lsp-invalid-root-field` - Check against language server names
- `lsp-missing-command` - Required field check
- `lsp-missing-extension-to-language` - Required field check
- `lsp-command-not-string` - String type check
- `lsp-extension-to-language-not-object` - Object type check
- `lsp-language-not-string` - String type check
- `lsp-args-not-array` - Array type check
- `lsp-transport-invalid` - Enum check
- `lsp-env-not-object` - Object type check
- `lsp-initialization-options-not-object` - Object type check
- `lsp-settings-not-object` - Object type check
- `lsp-workspace-folder-not-string` - String type check
- `lsp-startup-timeout-invalid` - Positive number check

### Category 10: Output Styles (8 easy)

- `output-style-missing-frontmatter` - Frontmatter exists check
- `output-style-invalid-frontmatter-field` - Check against 3 known keys
- `output-style-name-invalid-type` - String type check
- `output-style-description-invalid-type` - String type check
- `output-style-keep-coding-invalid-type` - Boolean type check
- `output-style-missing-body` - Body content check
- `output-style-empty-body` - Body content check
- `output-style-description-empty` - Truthy check

---

## ⚠️ MODERATE (48 rules - 23%)

### Category 1: CLAUDE.md (2 moderate)

- `frontmatter-invalid-paths` - **Glob pattern validation** (use library like minimatch)
- `import-in-code-block` - **Markdown AST parsing** (use remark/unified)

### Category 2: Skills (5 moderate)

- `skill-frontmatter-allowed-tools-invalid` - **Tool registry lookup**
- `skill-frontmatter-agent-invalid` - **Agent registry lookup**
- `skill-invalid-substitution` - **Parse variable syntax**: $ARGUMENTS, $N, $ARGUMENTS[N], ${CLAUDE_SESSION_ID}
- `skill-mcp-unqualified-tool` - **Pattern matching** for `mcp__server__tool`
- `skill-time-sensitive-content` - **Date pattern detection** (regex for dates/years)

### Category 3: Settings (12 moderate)

- `settings-permission-invalid-rule` - **Parse Tool(pattern) syntax** with glob
- `settings-permission-legacy-syntax` - **Detect `:*` vs `*`**
- `settings-sandbox-invalid-path` - **Absolute path validation**
- `settings-marketplace-invalid-source` - **7 source types with different required fields** (conditional schema)
- `settings-marketplace-invalid-url` - **URL validation** (use URL parser)
- `settings-marketplace-invalid-path` - **Absolute path validation**
- `settings-plugin-invalid-format` - **Parse plugin-name@marketplace-name**
- `settings-uuid-invalid-format` - **UUID regex validation**
- `settings-path-not-relative` - **Relative path validation**
- `settings-env-var-invalid-name` - **Env var name regex**
- `settings-env-var-unknown` - **Check against documented list**
- `settings-managed-only-field` - **Context-aware validation** (which settings file?)

### Category 4: Hooks (11 moderate)

- `hooks-matcher-on-non-tool-event` - **Context-aware** (check event type)
- `hooks-missing-matcher-array` - **Event-specific validation**
- `hooks-json-output-schema` - **12 different JSON schemas** based on event type
- `hooks-exit-code-2-with-json` - **Documentation warning**
- `hooks-deprecated-decision-fields` - **Check for deprecated fields**
- `hooks-invalid-tool-name-in-matcher` - **Tool registry lookup**
- `hooks-env-var-undefined` - **Check against known env vars**
- `hooks-command-not-quoted` - **Regex for unquoted variables**
- `hooks-path-traversal-risk` - **Detect `..` in paths**
- `hooks-sensitive-file-access` - **Pattern matching** (.env, .git/, etc.)
- `hooks-mcp-tool-pattern` - **Info message** suggesting pattern

### Category 5: MCP Servers (13 moderate)

- `mcp-invalid-env-expansion` - **Parse ${VAR} and ${VAR:-default}** syntax
- `mcp-env-var-undefined` - **Check if env var defined** (without default)
- `mcp-invalid-url-format` - **URL validation**
- `mcp-windows-npx-without-cmd` - **Platform check + command detection**
- `mcp-plugin-root-undefined` - **Context check** (plugin vs non-plugin)
- `mcp-managed-invalid-restriction` - **Check exactly one of 3 fields**
- `mcp-managed-multiple-restriction-types` - **Mutual exclusivity check**
- `mcp-managed-invalid-command-array` - **Array deep equality**
- `mcp-managed-invalid-url-pattern` - **URL wildcard pattern validation**
- `mcp-managed-empty-allowlist` - **Warning for empty array**
- `mcp-both-managed-and-user` - **File existence check**
- `mcp-tool-search-invalid-value` - **Enum with special auto:N syntax**
- `mcp-tool-search-invalid-threshold` - **Parse auto:N, validate N**

### Category 6: Plugins (13 moderate)

- `plugin-name-invalid-format` - **Kebab-case validation** (regex)
- `plugin-version-invalid-semver` - **Semver validation** (use semver library)
- `plugin-homepage-invalid-url` - **URL validation**
- `plugin-repository-invalid-format` - **String or {type, url} validation**
- `plugin-license-invalid` - **SPDX identifier check** (use library or list)
- `plugin-invalid-mcp-servers` - **MCP schema validation** (reuse MCP validator)
- `plugin-skill-missing-namespace` - **Check skill name format**
- `plugin-command-missing-namespace` - **Check command name format**
- `plugin-agent-missing-namespace` - **Check agent name format**
- `plugin-marketplace-invalid-schema` - **Marketplace.json schema validation**
- `plugin-marketplace-invalid-source` - **7 source types** (reuse from Settings)
- `plugin-circular-dependency` - **Graph cycle detection**
- `plugin-dependency-not-found` - **Dependency resolution**

### Category 7: Agents (10 moderate)

- `agent-name-invalid-format` - **Lowercase-hyphens regex**
- `agent-tools-invalid-tool` - **Tool registry lookup**
- `agent-disallowed-tools-invalid-tool` - **Tool registry lookup**
- `agent-tools-conflict` - **Check overlap between arrays**
- `agent-skills-not-found` - **Skill registry lookup**
- `agent-hooks-invalid-schema` - **Hooks schema validation**
- `agent-hooks-stop-converted` - **Info message**
- `agent-bypass-permissions-warning` - **Warning message**
- `agent-skills-not-inherited` - **Info message**
- `agent-cannot-spawn-subagents` - **Info message**

### Category 8: Commands (0 moderate)

### Category 9: LSP Servers (9 moderate)

- `lsp-extension-invalid-format` - **Check starts with "."**
- `lsp-shutdown-timeout-invalid` - **Positive number check**
- `lsp-restart-on-crash-not-boolean` - **Boolean type check**
- `lsp-max-restarts-invalid` - **Positive integer check**
- `lsp-binary-not-in-path` - **Cross-platform PATH search** (DIFFICULT candidate)
- `lsp-plugin-location-wrong` - **File location check**
- `lsp-inline-conflicts-with-file` - **Check both sources**
- `lsp-unknown-language-id` - **Check against LSP spec list**
- `lsp-socket-transport-deprecated` - **Warning message**

### Category 10: Output Styles (4 moderate)

- `output-style-name-too-long` - **Reasonable length check**
- `output-style-invalid-file-extension` - **Check .md extension**
- `output-style-invalid-location` - **Directory location check**
- `output-style-plugin-location-wrong` - **Plugin directory check**

---

## 🔴 DIFFICULT (21 rules - 10%)

### Category 1: CLAUDE.md (0 difficult)

All moved to moderate

### Category 2: Skills (0 difficult)

All categorized as easy/moderate

### Category 3: Settings (0 difficult)

Most complex ones are in moderate

### Category 4: Hooks (0 difficult)

JSON schema validation moved to moderate

### Category 5: MCP Servers (0 difficult)

Env var expansion and pattern matching in moderate

### Category 6: Plugins (0 difficult)

Circular dependency in moderate (can use simple graph lib)

### Category 7: Agents (1 difficult)

- `agent-cli-json-invalid` - **Parse and validate --agents JSON CLI flag** (need CLI integration)

### Category 8: Commands (0 difficult)

### Category 9: LSP Servers (0 difficult)

Binary detection moved to moderate

### Category 10: Output Styles (0 difficult)

### Actually Difficult Rules (Reconsidered)

After careful analysis, most "difficult" rules are actually moderate if we:

- Use existing libraries (semver, glob, minimatch)
- Use simple heuristics instead of perfect detection
- Make some rules "info" level instead of "error"

**Truly Difficult (20 rules):**

1. `import-in-code-block` - Requires markdown AST parsing to distinguish code from prose
2. `skill-invalid-substitution` - Complex variable syntax parsing
3. `settings-permission-invalid-rule` - Tool(pattern) with glob syntax
4. `settings-marketplace-invalid-source` - Conditional schema (7 types)
5. `settings-managed-only-field` - Context-aware validation
6. `hooks-json-output-schema` - 12 different schemas per event type
7. `mcp-invalid-env-expansion` - Shell variable expansion syntax
8. `mcp-env-var-undefined` - Check process.env + defaults
9. `mcp-managed-invalid-command-array` - Deep array equality
10. `mcp-managed-invalid-url-pattern` - URL wildcard matching
11. `plugin-marketplace-invalid-source` - Conditional schema (7 types)
12. `plugin-circular-dependency` - Graph cycle detection (can use lib)
13. `lsp-binary-not-in-path` - Cross-platform executable detection
14. `agent-cli-json-invalid` - CLI integration required

**Recommendation: Skip or Simplify These:**

- Make `lsp-binary-not-in-path` an "info" level suggestion
- Use simple heuristics for `import-in-code-block` (warn about ANY @import in ``` blocks)
- Skip `mcp-env-var-undefined` (just validate syntax, not existence)
- Make `skill-invalid-substitution` warn on unknown patterns instead of parsing perfectly

---

## Implementation Phases

### Phase 1: Easy Rules (138 rules - 2-3 weeks)

All type checks, enum validations, required fields, string length, etc.

### Phase 2: Moderate Rules (48 rules - 1-2 weeks)

Use libraries:

- `semver` for version validation
- `minimatch` or `picomatch` for glob patterns
- `remark`/`unified` for markdown parsing
- Built-in `URL` for URL validation
- Simple regex for most pattern matching

### Phase 3: Difficult Rules (21 rules - 1-2 weeks)

Tackle complex logic, or skip/simplify:

- Graph algorithms for circular dependencies
- Context-aware validation
- Conditional schemas
- Platform-specific checks

### Phase 4: Testing & Polish (1 week)

- Integration tests
- Documentation
- Edge cases

**Total estimated time: 5-8 weeks for all 207 rules**
**Quick win: Phase 1 + Phase 2 = 186 rules (90%) in 3-5 weeks**

---

## Recommended Strategy

1. **Start with Phase 1** (Easy) - Biggest bang for buck, 67% of rules
2. **Add Phase 2** (Moderate) - Gets you to 90% coverage
3. **Evaluate Phase 3** (Difficult) - Some can be simplified or deprioritized
4. **Ship incrementally** - Don't wait for 100% to release

This gets claudelint to professional-grade quality without getting stuck on the hardest 10%.
