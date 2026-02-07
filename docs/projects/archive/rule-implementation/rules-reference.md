# Comprehensive Rules Reference

## Summary

**Total Rules**: 324 (105 implemented + 219 planned)

**Implementation Progress**: 32.4%

### Rules by Category

| Category | Implemented | Planned | Total | Progress |
|----------|------------|---------|-------|----------|
| CLAUDE.md | 14 | 10 | 24 | 58.3% |
| Skills | 28 | 31 | 59 | 47.5% |
| Settings | 5 | 35 | 40 | 12.5% |
| Hooks | 3 | 29 | 32 | 9.4% |
| MCP | 13 | 31 | 44 | 29.5% |
| Plugin | 12 | 36 | 48 | 25.0% |
| Agents | 13 | 25 | 38 | 34.2% |
| Commands | 2 | 3 | 5 | 40.0% |
| LSP | 8 | 22 | 30 | 26.7% |
| Output Styles | 7 | 12 | 19 | 36.8% |

### Rules with Options

**Implemented**: 10 rules have configurable options (9.5%)

**Planned with Options**: All rules will support configuration as appropriate

---

## Category 1: CLAUDE.md Files

### Implemented Rules (14)

| Rule ID | Status | Current Options | Suggested Options |
|---------|--------|----------------|-------------------|
| `claude-md-content-too-many-sections` | [Implemented] | `maxSections: number` (default: 20) | - |
| `claude-md-file-not-found` | [Implemented] | None | `ignorePatterns: string[]` - Patterns to exclude from validation |
| `claude-md-filename-case-sensitive` | [Implemented] | None | `strictCase: boolean` - Enforce exact case matching |
| `claude-md-glob-pattern-backslash` | [Implemented] | None | - |
| `claude-md-glob-pattern-too-broad` | [Implemented] | None | `allowedPatterns: string[]` - Whitelist of acceptable broad patterns |
| `claude-md-import-circular` | [Implemented] | None | `maxImportChain: number` - Max length of import chain before warning |
| `claude-md-import-depth-exceeded` | [Implemented] | `maxDepth: number` (default: 5) | - |
| `claude-md-import-in-code-block` | [Implemented] | None | `allowCodeBlockImports: boolean` - Allow imports in code examples |
| `claude-md-import-missing` | [Implemented] | None | `requireExistingFiles: boolean` - Treat missing as error vs warning |
| `claude-md-import-read-failed` | [Implemented] | None | `ignorePermissionErrors: boolean` - Skip files with permission issues |
| `claude-md-paths` | [Implemented] | None | `allowRelativePaths: boolean` - Allow relative vs absolute paths only |
| `claude-md-rules-circular-symlink` | [Implemented] | None | `followSymlinks: boolean` - Whether to follow symlinks at all |
| `claude-md-size-error` | [Implemented] | `maxSize: number` (default: 40000) | - |
| `claude-md-size-warning` | [Implemented] | `maxSize: number` (default: 35000) | - |

### Planned Rules (10)

| Rule ID | Status | Implementation | Suggested Options |
|---------|--------|----------------|-------------------|
| `claude-md-import-invalid-home-path` | [Planned] | Refinement | `allowHomeDirectory: boolean` - Whether to allow ~/ paths |
| `claude-md-frontmatter-unknown-field` | [Planned] | Schema | `strictMode: boolean` - Error on unknown fields vs warn |
| `claude-md-missing-description` | [Planned] | Schema | `minLength: number` - Minimum description length |
| `claude-md-invalid-tools` | [Planned] | Logic | `allowedTools: string[]` - Whitelist of permitted tools |
| `claude-md-duplicate-imports` | [Planned] | Logic | `allowDuplicates: boolean` - Whether duplicates are warnings |
| `claude-md-unused-imports` | [Planned] | Logic | `checkReferences: boolean` - Verify imported content is used |
| `claude-md-inconsistent-headings` | [Planned] | Logic | `enforceHierarchy: boolean` - Require proper heading levels |
| `claude-md-missing-examples` | [Planned] | Logic | `requireExamples: boolean` - Require code examples in rules |
| `claude-md-broken-links` | [Planned] | Logic | `validateUrls: boolean` - Check external URLs for 404s |
| `claude-md-outdated-syntax` | [Planned] | Logic | `syntaxVersion: string` - Target syntax version to validate against |

---

## Category 2: Skills (59 total)

### Implemented Rules (28)

| Rule ID | Status | Current Options | Suggested Options |
|---------|--------|----------------|-------------------|
| `skill-agent` | [Implemented] | None | `requireAgent: boolean` - Whether agent field is mandatory |
| `skill-allowed-tools` | [Implemented] | None | `defaultTools: string[]` - Default allowed tools list |
| `skill-body-too-long` | [Implemented] | `maxLines: number` (default: 500) | - |
| `skill-context` | [Implemented] | None | `validContexts: string[]` - List of valid context values |
| `skill-dangerous-command` | [Implemented] | None | `dangerousPatterns: string[]` - Custom dangerous command patterns<br>`severity: 'warn' \| 'error'` - How to treat dangerous commands |
| `skill-deep-nesting` | [Implemented] | `maxDepth: number` (default: 3) | - |
| `skill-dependencies` | [Implemented] | None | `allowedDependencies: string[]` - Whitelist of permitted dependencies |
| `skill-description` | [Implemented] | None | `minLength: number` - Minimum description length<br>`maxLength: number` - Maximum description length |
| `skill-disallowed-tools` | [Implemented] | None | `customDisallowed: string[]` - Additional tools to disallow |
| `skill-eval-usage` | [Implemented] | None | `allowEval: boolean` - Whether to allow eval in any context<br>`evalPatterns: string[]` - Custom eval-like patterns to detect |
| `skill-missing-changelog` | [Implemented] | None | `requireChangelog: boolean` - Make CHANGELOG.md mandatory |
| `skill-missing-comments` | [Implemented] | `minLines: number` (default: 10) | - |
| `skill-missing-examples` | [Implemented] | None | `minExamples: number` - Minimum number of examples required |
| `skill-missing-shebang` | [Implemented] | None | `requiredShebang: string` - Specific shebang to enforce |
| `skill-missing-version` | [Implemented] | None | - |
| `skill-model` | [Implemented] | None | `allowedModels: string[]` - Whitelist of permitted models |
| `skill-multi-script-missing-readme` | [Implemented] | `maxScripts: number` (default: 3) | - |
| `skill-name` | [Implemented] | None | `minLength: number` - Minimum name length<br>`maxLength: number` - Maximum name length |
| `skill-name-directory-mismatch` | [Implemented] | None | `enforceMatch: boolean` - Make name/directory match mandatory |
| `skill-naming-inconsistent` | [Implemented] | `minFiles: number` (default: 3) | `preferredConvention: 'kebab' \| 'snake' \| 'camel'` - Enforce specific naming |
| `skill-path-traversal` | [Implemented] | None | `allowTraversal: boolean` - Allow path traversal in specific contexts |
| `skill-referenced-file-not-found` | [Implemented] | None | `checkReferences: boolean` - Validate file references in docs |
| `skill-tags` | [Implemented] | None | `requiredTags: string[]` - Tags that must be present<br>`allowedTags: string[]` - Whitelist of valid tags |
| `skill-time-sensitive-content` | [Implemented] | None | `allowDates: boolean` - Whether date references are allowed<br>`datePatterns: string[]` - Custom date patterns to detect |
| `skill-too-many-files` | [Implemented] | `maxFiles: number` (default: 10) | - |
| `skill-unknown-string-substitution` | [Implemented] | None | `customSubstitutions: Record<string, string>` - User-defined substitutions |
| `skill-version` | [Implemented] | None | `requireSemver: boolean` - Enforce semantic versioning |

### Planned Rules (31)

| Rule ID | Status | Implementation | Suggested Options |
|---------|--------|----------------|-------------------|
| `skill-frontmatter-agent-invalid` | [Planned] | Refinement | `allowedAgents: string[]` - Valid agent names |
| `skill-invalid-substitution` | [Planned] | Refinement | `strictSubstitutions: boolean` - Error on unknown variables |
| `skill-reference-too-deep` | [Planned] | Logic | `maxReferenceDepth: number` - Max nesting level for references |
| `skill-windows-paths` | [Planned] | Refinement | `platform: 'unix' \| 'windows' \| 'both'` - Target platform |
| `skill-mcp-unqualified-tool` | [Planned] | Refinement | `requireQualifiedTools: boolean` - Require server:tool format |
| `skill-naming-not-gerund` | [Planned] | Refinement | `enforceGerund: boolean` - Make gerund naming mandatory |
| `skill-security-issue` | [Planned] | Logic | `securityPatterns: string[]` - Custom security anti-patterns |
| `skill-hardcoded-paths` | [Planned] | Logic | `allowedPaths: string[]` - Whitelist of acceptable hardcoded paths |
| `skill-missing-error-handling` | [Planned] | Logic | `requireErrorHandling: boolean` - Enforce error handling |
| `skill-timeout-missing` | [Planned] | Logic | `defaultTimeout: number` - Suggest timeout if missing |
| `skill-output-not-captured` | [Planned] | Logic | `requireOutputCapture: boolean` - Warn on uncaptured output |
| `skill-exit-code-ignored` | [Planned] | Logic | `checkExitCodes: boolean` - Validate exit code handling |
| `skill-permissions-too-broad` | [Planned] | Logic | `maxPermissions: number` - Limit permission count |
| `skill-unquoted-variables` | [Planned] | Logic | `requireQuotes: boolean` - Enforce quoted variables |
| `skill-deprecated-api` | [Planned] | Logic | `apiVersion: string` - Check against API version |
| `skill-missing-usage-docs` | [Planned] | Logic | `requireUsage: boolean` - Require usage section |
| `skill-duplicate-code` | [Planned] | Logic | `maxDuplication: number` - Percentage of allowed duplication |
| `skill-complexity-too-high` | [Planned] | Logic | `maxComplexity: number` - Cyclomatic complexity limit |
| `skill-missing-tests` | [Planned] | Logic | `requireTests: boolean` - Require test files |
| `skill-unlicensed` | [Planned] | Logic | `requireLicense: boolean` - Require LICENSE file |
| `skill-shell-check-failed` | [Planned] | Logic | `enableShellCheck: boolean` - Run shellcheck integration |
| `skill-python-lint-failed` | [Planned] | Logic | `enablePylint: boolean` - Run pylint integration |
| `skill-js-lint-failed` | [Planned] | Logic | `enableEslint: boolean` - Run eslint integration |
| `skill-inconsistent-indentation` | [Planned] | Logic | `indentStyle: 'spaces' \| 'tabs'`<br>`indentSize: number` |
| `skill-trailing-whitespace` | [Planned] | Logic | `allowTrailing: boolean` - Whether to allow |
| `skill-mixed-line-endings` | [Planned] | Logic | `lineEnding: 'lf' \| 'crlf' \| 'auto'` |
| `skill-non-ascii-characters` | [Planned] | Logic | `allowUnicode: boolean` - Allow non-ASCII |
| `skill-file-size-too-large` | [Planned] | Logic | `maxFileSize: number` - Max size for individual skill files |
| `skill-git-ignored` | [Planned] | Logic | `checkGitignore: boolean` - Warn if skill is ignored |
| `skill-dependencies-outdated` | [Planned] | Logic | `checkUpdates: boolean` - Check for newer versions |
| `skill-circular-dependency` | [Planned] | Logic | `allowCircular: boolean` - Whether to allow |

---

## Category 3: Settings (40 total)

### Implemented Rules (5)

| Rule ID | Status | Current Options | Suggested Options |
|---------|--------|----------------|-------------------|
| `settings-file-path-not-found` | [Implemented] | None | `createIfMissing: boolean` - Auto-create missing paths<br>`pathPatterns: string[]` - Custom path patterns to validate |
| `settings-invalid-env-var` | [Implemented] | None | `requiredVars: string[]` - Env vars that must be defined<br>`allowUndefined: boolean` - Allow undefined variable references |
| `settings-invalid-permission` | [Implemented] | None | `defaultPermission: string` - Default permission mode<br>`strictPermissions: boolean` - Error on overly permissive settings |
| `settings-permission-empty-pattern` | [Implemented] | None | - |
| `settings-permission-invalid-rule` | [Implemented] | None | `allowWildcards: boolean` - Whether * patterns are allowed |

### Planned Rules (35)

| Rule ID | Status | Implementation | Suggested Options |
|---------|--------|----------------|-------------------|
| `settings-invalid-root-field` | [Planned] | Schema | `strictMode: boolean` - Error on unknown fields |
| `settings-invalid-field-type` | [Planned] | Schema | `coerceTypes: boolean` - Auto-convert compatible types |
| `settings-permission-invalid-mode` | [Planned] | Schema | `allowedModes: string[]` - Valid permission modes |
| `settings-permission-invalid-tool` | [Planned] | Logic | `toolRegistry: string[]` - Valid tool names |
| `settings-permission-legacy-syntax` | [Planned] | Refinement | `autoMigrate: boolean` - Auto-fix legacy syntax |
| `settings-attribution-invalid-field` | [Planned] | Schema | `requiredAttribution: boolean` - Make attribution mandatory |
| `settings-sandbox-invalid-field` | [Planned] | Schema | - |
| `settings-sandbox-invalid-network` | [Planned] | Schema | `allowNetwork: boolean` - Default network policy |
| `settings-sandbox-invalid-path` | [Planned] | Refinement | `allowRelativePaths: boolean` - Path style preference |
| `settings-sandbox-invalid-port` | [Planned] | Schema | `allowedPortRange: [number, number]` - Permitted port range |
| `settings-statusline-invalid-type` | [Planned] | Schema | - |
| `settings-statusline-missing-command` | [Planned] | Schema | - |
| `settings-filesuggestion-invalid-type` | [Planned] | Schema | - |
| `settings-filesuggestion-missing-command` | [Planned] | Schema | - |
| `settings-hooks-invalid-event` | [Planned] | Schema | `customEvents: string[]` - User-defined events |
| `settings-hooks-invalid-tool` | [Planned] | Logic | `toolWhitelist: string[]` - Allowed tools in hooks |
| `settings-mcp-server-invalid-name` | [Planned] | Schema | `namingConvention: string` - Regex for valid names |
| `settings-marketplace-invalid-source` | [Planned] | Refinement | `allowedSources: string[]` - Trusted marketplace sources |
| `settings-marketplace-missing-required` | [Planned] | Schema | - |
| `settings-marketplace-invalid-url` | [Planned] | Refinement | `allowedDomains: string[]` - Trusted domains |
| `settings-marketplace-invalid-path` | [Planned] | Refinement | - |
| `settings-plugin-invalid-format` | [Planned] | Refinement | `requireNamespace: boolean` - Enforce namespace@ format |
| `settings-uuid-invalid-format` | [Planned] | Refinement | `generateUuid: boolean` - Auto-generate if missing |
| `settings-number-out-of-range` | [Planned] | Schema | `ranges: Record<string, [number, number]>` - Custom ranges per field |
| `settings-enum-invalid-value` | [Planned] | Schema | - |
| `settings-path-not-relative` | [Planned] | Refinement | `enforceRelative: boolean` - Require relative paths |
| `settings-deprecated-field` | [Planned] | Refinement | `showMigrationPath: boolean` - Show upgrade instructions |
| `settings-env-var-invalid-name` | [Planned] | Refinement | `allowedPrefix: string` - Required env var prefix |
| `settings-env-var-unknown` | [Planned] | Refinement | `knownVars: string[]` - List of recognized variables |
| `settings-scope-invalid` | [Planned] | Schema | `allowedScopes: string[]` - Valid scope values |
| `settings-managed-only-field` | [Planned] | Logic | `managedMode: boolean` - Enable managed config mode |
| `settings-conflicting-options` | [Planned] | Logic | `conflicts: Record<string, string[]>` - Mutually exclusive options |
| `settings-missing-required` | [Planned] | Schema | `requiredFields: string[]` - Fields that must be present |
| `settings-performance-warning` | [Planned] | Logic | `maxComplexity: number` - Warn on complex configs |
| `settings-security-risk` | [Planned] | Logic | `securityChecks: boolean` - Enable security validation |

---

## Category 4: Hooks (32 total)

### Implemented Rules (3)

| Rule ID | Status | Current Options | Suggested Options |
|---------|--------|----------------|-------------------|
| `hooks-invalid-config` | [Implemented] | None | `strictSchema: boolean` - Error on schema violations vs warn<br>`allowCustomFields: boolean` - Permit user-defined fields |
| `hooks-invalid-event` | [Implemented] | None | `customEvents: string[]` - Register custom event types |
| `hooks-missing-script` | [Implemented] | None | `scriptExtensions: string[]` - Valid script file extensions<br>`searchPaths: string[]` - Additional directories to search |

### Planned Rules (29)

| Rule ID | Status | Implementation | Suggested Options |
|---------|--------|----------------|-------------------|
| `hooks-invalid-event-name` | [Planned] | Schema | `allowedEvents: string[]` - Whitelist of valid events |
| `hooks-invalid-hook-type` | [Planned] | Schema | - |
| `hooks-missing-command` | [Planned] | Schema | - |
| `hooks-missing-prompt` | [Planned] | Schema | - |
| `hooks-both-command-and-prompt` | [Planned] | Refinement | - |
| `hooks-prompt-type-deprecated-events` | [Planned] | Refinement | `allowDeprecated: boolean` - Allow deprecated events |
| `hooks-invalid-timeout` | [Planned] | Schema | `defaultTimeout: number` - Default if not specified<br>`maxTimeout: number` - Maximum allowed timeout |
| `hooks-matcher-on-non-tool-event` | [Planned] | Refinement | - |
| `hooks-missing-matcher-array` | [Planned] | Schema | - |
| `hooks-invalid-matcher-type` | [Planned] | Schema | - |
| `hooks-invalid-hooks-array` | [Planned] | Schema | - |
| `hooks-once-not-in-skill` | [Planned] | Logic | `allowOnceOutsideSkill: boolean` - Permit once in other contexts |
| `hooks-mcp-tool-pattern` | [Planned] | Refinement | `requireMcpPrefix: boolean` - Enforce server:tool format |
| `hooks-json-output-schema` | [Planned] | Logic | `validateJson: boolean` - Validate JSON output structure |
| `hooks-exit-code-2-with-json` | [Planned] | Refinement | - |
| `hooks-deprecated-decision-fields` | [Planned] | Refinement | `autoMigrate: boolean` - Auto-convert old field names |
| `hooks-invalid-permission-decision` | [Planned] | Schema | `allowedDecisions: string[]` - Valid decision values |
| `hooks-invalid-permission-behavior` | [Planned] | Schema | `allowedBehaviors: string[]` - Valid behavior values |
| `hooks-block-without-reason` | [Planned] | Refinement | `requireReason: boolean` - Make reason mandatory |
| `hooks-continue-false-without-reason` | [Planned] | Refinement | - |
| `hooks-invalid-tool-name-in-matcher` | [Planned] | Logic | `knownTools: string[]` - Validate against tool registry |
| `hooks-description-outside-plugin` | [Planned] | Logic | - |
| `hooks-env-var-undefined` | [Planned] | Refinement | `requiredEnvVars: string[]` - Env vars that must exist |
| `hooks-command-not-quoted` | [Planned] | Refinement | `enforceQuoting: boolean` - Require proper shell quoting |
| `hooks-path-traversal-risk` | [Planned] | Refinement | `allowTraversal: boolean` - Allow ../ in paths |
| `hooks-sensitive-file-access` | [Planned] | Refinement | `sensitivePatterns: string[]` - Custom sensitive file patterns<br>`blockSensitive: boolean` - Error vs warn |
| `hooks-circular-dependency` | [Planned] | Logic | `maxHookChain: number` - Max hook calling depth |
| `hooks-performance-impact` | [Planned] | Logic | `maxHookDuration: number` - Warn on slow hooks |
| `hooks-async-not-awaited` | [Planned] | Logic | `requireAwait: boolean` - Enforce async handling |

---

## Category 5: MCP Servers (44 total)

### Implemented Rules (13)

| Rule ID | Status | Current Options | Suggested Options |
|---------|--------|----------------|-------------------|
| `mcp-http-empty-url` | [Implemented] | None | - |
| `mcp-http-invalid-url` | [Implemented] | None | `allowedProtocols: string[]` - Valid URL protocols<br>`allowedDomains: string[]` - Whitelist of trusted domains |
| `mcp-invalid-env-var` | [Implemented] | None | `requiredVars: string[]` - Env vars that must be defined |
| `mcp-invalid-server` | [Implemented] | None | `strictValidation: boolean` - Error on any server issues |
| `mcp-invalid-transport` | [Implemented] | None | `allowedTransports: string[]` - Valid transport types |
| `mcp-server-key-mismatch` | [Implemented] | None | `autoFixKeys: boolean` - Auto-correct mismatched keys |
| `mcp-sse-empty-url` | [Implemented] | None | - |
| `mcp-sse-invalid-url` | [Implemented] | None | `allowedProtocols: string[]` - Valid SSE protocols |
| `mcp-sse-transport-deprecated` | [Implemented] | None | `allowDeprecated: boolean` - Allow SSE transport<br>`suggestAlternative: boolean` - Show modern alternatives |
| `mcp-stdio-empty-command` | [Implemented] | None | - |
| `mcp-websocket-empty-url` | [Implemented] | None | - |
| `mcp-websocket-invalid-protocol` | [Implemented] | None | `requiredProtocol: string` - Enforce specific ws protocol |
| `mcp-websocket-invalid-url` | [Implemented] | None | `allowedDomains: string[]` - Trusted WebSocket domains |

### Planned Rules (31)

| Rule ID | Status | Implementation | Suggested Options |
|---------|--------|----------------|-------------------|
| `mcp-invalid-root-field` | [Planned] | Schema | `strictMode: boolean` - Error on unknown fields |
| `mcp-invalid-server-name` | [Planned] | Schema | `namingPattern: string` - Regex for valid names |
| `mcp-missing-type` | [Planned] | Schema | - |
| `mcp-invalid-type` | [Planned] | Schema | - |
| `mcp-sse-deprecated` | [Planned] | Refinement | `blockDeprecated: boolean` - Prevent use of deprecated |
| `mcp-stdio-missing-command` | [Planned] | Schema | - |
| `mcp-http-missing-url` | [Planned] | Schema | - |
| `mcp-sse-missing-url` | [Planned] | Schema | - |
| `mcp-invalid-command-type` | [Planned] | Schema | - |
| `mcp-invalid-args-type` | [Planned] | Schema | - |
| `mcp-invalid-env-type` | [Planned] | Schema | - |
| `mcp-invalid-env-expansion` | [Planned] | Refinement | `allowEnvExpansion: boolean` - Whether ${VAR} is allowed |
| `mcp-env-var-undefined` | [Planned] | Refinement | `requiredVars: string[]` - Must-exist env vars |
| `mcp-invalid-url-format` | [Planned] | Refinement | `enforceHttps: boolean` - Require HTTPS URLs |
| `mcp-invalid-headers-type` | [Planned] | Schema | - |
| `mcp-windows-npx-without-cmd` | [Planned] | Refinement | `platform: string` - Target platform |
| `mcp-plugin-root-undefined` | [Planned] | Logic | - |
| `mcp-managed-invalid-restriction` | [Planned] | Refinement | - |
| `mcp-managed-multiple-restriction-types` | [Planned] | Refinement | - |
| `mcp-managed-invalid-command-array` | [Planned] | Schema | - |
| `mcp-managed-invalid-url-pattern` | [Planned] | Refinement | `allowWildcards: boolean` - Permit * in URLs |
| `mcp-managed-empty-allowlist` | [Planned] | Refinement | `requireAllowlist: boolean` - Make allowlist mandatory |
| `mcp-scope-invalid` | [Planned] | Schema | `allowedScopes: string[]` - Valid scope values |
| `mcp-both-managed-and-user` | [Planned] | Logic | `preferManaged: boolean` - Which to prioritize |
| `mcp-invalid-timeout` | [Planned] | Schema | `defaultTimeout: number` - Default timeout value<br>`maxTimeout: number` - Maximum allowed |
| `mcp-invalid-max-output` | [Planned] | Schema | `maxOutputSize: number` - Max output buffer size |
| `mcp-tool-search-invalid-value` | [Planned] | Logic | - |
| `mcp-tool-search-invalid-threshold` | [Planned] | Logic | `defaultThreshold: number` - Default auto threshold |
| `mcp-server-not-installed` | [Planned] | Logic | `checkInstalled: boolean` - Verify server binaries exist |
| `mcp-duplicate-server-name` | [Planned] | Logic | `allowDuplicates: boolean` - Permit name reuse |
| `mcp-security-risk` | [Planned] | Logic | `securityChecks: boolean` - Enable security validation |

---

## Category 6: Plugins (48 total)

### Implemented Rules (12)

| Rule ID | Status | Current Options | Suggested Options |
|---------|--------|----------------|-------------------|
| `plugin-circular-dependency` | [Implemented] | None | `allowCircular: boolean` - Whether to permit circular deps<br>`maxDepth: number` - Max dependency chain depth |
| `plugin-components-wrong-location` | [Implemented] | None | `componentDirs: string[]` - Valid component directories |
| `plugin-dependency-invalid-version` | [Implemented] | None | `versionStrategy: 'exact' \| 'range' \| 'latest'` - Version spec style |
| `plugin-description-required` | [Implemented] | None | `minLength: number` - Minimum description length |
| `plugin-invalid-manifest` | [Implemented] | None | `strictSchema: boolean` - Error on schema violations |
| `plugin-invalid-version` | [Implemented] | None | `requireSemver: boolean` - Enforce semantic versioning |
| `plugin-json-wrong-location` | [Implemented] | None | `allowedPaths: string[]` - Valid plugin.json locations |
| `plugin-marketplace-files-not-found` | [Implemented] | None | `requiredFiles: string[]` - Files that must exist for marketplace |
| `plugin-missing-file` | [Implemented] | None | `requiredFiles: string[]` - Files that must be present |
| `plugin-name-required` | [Implemented] | None | `namingPattern: string` - Regex for valid plugin names |
| `plugin-version-required` | [Implemented] | None | - |
| `plugin-components-at-root` | [Implemented] | None | `allowRootComponents: boolean` - Whether to permit root-level |

### Planned Rules (36)

| Rule ID | Status | Implementation | Suggested Options |
|---------|--------|----------------|-------------------|
| `plugin-missing-manifest` | [Planned] | Logic | - |
| `plugin-manifest-not-in-subdir` | [Planned] | Logic | `enforceSubdir: boolean` - Require plugin.json in subdir |
| `plugin-invalid-root-field` | [Planned] | Schema | `strictMode: boolean` - Error on unknown fields |
| `plugin-missing-name` | [Planned] | Schema | - |
| `plugin-missing-description` | [Planned] | Schema | - |
| `plugin-missing-version` | [Planned] | Schema | - |
| `plugin-name-invalid-format` | [Planned] | Refinement | `namingConvention: string` - Enforce naming style |
| `plugin-name-too-long` | [Planned] | Schema | `maxLength: number` - Maximum name length |
| `plugin-version-invalid-semver` | [Planned] | Refinement | - |
| `plugin-description-empty` | [Planned] | Schema | - |
| `plugin-author-invalid-type` | [Planned] | Schema | - |
| `plugin-author-missing-name` | [Planned] | Schema | - |
| `plugin-homepage-invalid-url` | [Planned] | Refinement | `requireHomepage: boolean` - Make homepage mandatory |
| `plugin-repository-invalid-format` | [Planned] | Refinement | `preferredFormat: 'url' \| 'object'` - Repository style |
| `plugin-license-invalid` | [Planned] | Refinement | `allowedLicenses: string[]` - Whitelist of permitted licenses<br>`requireLicense: boolean` - Make license mandatory |
| `plugin-invalid-skills-path` | [Planned] | Schema | - |
| `plugin-invalid-agents-path` | [Planned] | Schema | - |
| `plugin-invalid-commands-path` | [Planned] | Schema | - |
| `plugin-invalid-hooks-path` | [Planned] | Schema | - |
| `plugin-invalid-mcp-servers` | [Planned] | Logic | - |
| `plugin-mcp-servers-in-wrong-location` | [Planned] | Logic | `mcpServerPath: string` - Required MCP config location |
| `plugin-lsp-servers-in-wrong-location` | [Planned] | Logic | `lspServerPath: string` - Required LSP config location |
| `plugin-missing-readme` | [Planned] | Logic | `requireReadme: boolean` - Make README.md mandatory |
| `plugin-skill-missing-namespace` | [Planned] | Refinement | `enforceNamespace: boolean` - Require plugin: prefix |
| `plugin-command-missing-namespace` | [Planned] | Refinement | - |
| `plugin-agent-missing-namespace` | [Planned] | Refinement | - |
| `plugin-marketplace-invalid-schema` | [Planned] | Schema | - |
| `plugin-marketplace-missing-plugins` | [Planned] | Schema | - |
| `plugin-marketplace-invalid-source` | [Planned] | Refinement | `allowedSources: string[]` - Trusted sources |
| `plugin-marketplace-missing-version` | [Planned] | Schema | - |
| `plugin-dependency-not-found` | [Planned] | Logic | `checkDependencies: boolean` - Validate deps exist |
| `plugin-incompatible-version` | [Planned] | Logic | `minClaudeVersion: string` - Minimum Claude Code version |
| `plugin-size-too-large` | [Planned] | Logic | `maxPluginSize: number` - Max total plugin size |
| `plugin-missing-icon` | [Planned] | Logic | `requireIcon: boolean` - Make icon mandatory |
| `plugin-missing-screenshots` | [Planned] | Logic | `minScreenshots: number` - Minimum screenshots required |
| `plugin-malformed-json` | [Planned] | Logic | `strictJson: boolean` - Error on JSON syntax issues |

---

## Category 7: Agents (38 total)

### Implemented Rules (13)

| Rule ID | Status | Current Options | Suggested Options |
|---------|--------|----------------|-------------------|
| `agent-body-too-short` | [Implemented] | `minLength: number` (default: 50) | - |
| `agent-description` | [Implemented] | None | `minLength: number` - Minimum description length<br>`maxLength: number` - Maximum description length |
| `agent-disallowed-tools` | [Implemented] | None | `customDisallowed: string[]` - Additional disallowed tools |
| `agent-events` | [Implemented] | None | `allowedEvents: string[]` - Valid event types for agents |
| `agent-hooks` | [Implemented] | None | `requireHooks: boolean` - Make hooks mandatory |
| `agent-hooks-invalid-schema` | [Implemented] | None | `strictHookSchema: boolean` - Error on hook schema violations |
| `agent-missing-system-prompt` | [Implemented] | None | `requireSystemPrompt: boolean` - Make system prompt mandatory |
| `agent-model` | [Implemented] | None | `allowedModels: string[]` - Whitelist of permitted models<br>`defaultModel: string` - Default if not specified |
| `agent-name` | [Implemented] | None | `minLength: number` - Minimum name length<br>`maxLength: number` - Maximum name length |
| `agent-name-directory-mismatch` | [Implemented] | None | `enforceMatch: boolean` - Require name/dir match |
| `agent-skills` | [Implemented] | None | `requiredSkills: string[]` - Skills that must be included |
| `agent-skills-not-found` | [Implemented] | None | `checkSkillPaths: boolean` - Validate skill file paths |
| `agent-tools` | [Implemented] | None | `defaultTools: string[]` - Default tools if none specified<br>`maxTools: number` - Maximum allowed tools |

### Planned Rules (25)

| Rule ID | Status | Implementation | Suggested Options |
|---------|--------|----------------|-------------------|
| `agent-invalid-frontmatter-field` | [Planned] | Schema | `strictMode: boolean` - Error on unknown fields |
| `agent-permission-mode-invalid` | [Planned] | Schema | `allowedModes: string[]` - Valid permission modes |
| `agent-hooks-invalid-event` | [Planned] | Refinement | `validEvents: string[]` - Events valid for agents |
| `agent-hooks-stop-converted` | [Planned] | Refinement | `warnOnConversion: boolean` - Warn when Stop events converted |
| `agent-no-tools-specified` | [Planned] | Refinement | `requireTools: boolean` - Make tools field mandatory |
| `agent-bypass-permissions-warning` | [Planned] | Refinement | `allowBypass: boolean` - Whether permission bypass is allowed |
| `agent-skills-not-inherited` | [Planned] | Refinement | - |
| `agent-cannot-spawn-subagents` | [Planned] | Refinement | `allowSubagents: boolean` - Whether sub-agents permitted |
| `agent-cli-json-invalid` | [Planned] | Logic | - |
| `agent-missing-examples` | [Planned] | Logic | `minExamples: number` - Minimum usage examples required |
| `agent-body-too-long` | [Planned] | Logic | `maxLength: number` - Maximum body length |
| `agent-conflicting-tools` | [Planned] | Logic | `conflicts: Record<string, string[]>` - Mutually exclusive tools |
| `agent-deprecated-tool` | [Planned] | Logic | `showAlternatives: boolean` - Suggest modern tools |
| `agent-missing-permissions` | [Planned] | Logic | `requiredPermissions: string[]` - Permissions that must be set |
| `agent-overly-permissive` | [Planned] | Logic | `maxPermissionLevel: string` - Maximum permission level |
| `agent-no-error-handling` | [Planned] | Logic | `requireErrorHandling: boolean` - Require error handling docs |
| `agent-missing-limitations` | [Planned] | Logic | `requireLimitations: boolean` - Require limitations section |
| `agent-unsafe-operation` | [Planned] | Logic | `unsafePatterns: string[]` - Patterns indicating unsafe ops |
| `agent-missing-changelog` | [Planned] | Logic | `requireChangelog: boolean` - Make CHANGELOG mandatory |
| `agent-version-missing` | [Planned] | Logic | `requireVersion: boolean` - Require version in frontmatter |
| `agent-deprecated-field` | [Planned] | Refinement | `showMigration: boolean` - Show migration path |
| `agent-duplicate-name` | [Planned] | Logic | `allowDuplicates: boolean` - Permit duplicate agent names |
| `agent-complex-logic` | [Planned] | Logic | `maxComplexity: number` - Complexity threshold |
| `agent-missing-tests` | [Planned] | Logic | `requireTests: boolean` - Require test cases |
| `agent-unlicensed` | [Planned] | Logic | `requireLicense: boolean` - Make license mandatory |

---

## Category 8: Commands (DEPRECATED) (5 total)

### Implemented Rules (2)

| Rule ID | Status | Current Options | Suggested Options |
|---------|--------|----------------|-------------------|
| `commands-deprecated-directory` | [Implemented] | None | `showMigrationGuide: boolean` - Display skill migration docs |
| `commands-in-plugin-deprecated` | [Implemented] | None | `blockPluginCommands: boolean` - Error instead of warn |

### Planned Rules (3)

| Rule ID | Status | Implementation | Suggested Options |
|---------|--------|----------------|-------------------|
| `commands-migrate-to-skills` | [Planned] | Refinement | `autoMigrate: boolean` - Auto-convert to skill format<br>`migrationPath: string` - Target directory for migration |
| `commands-namespace-required` | [Planned] | Logic | `enforceNamespace: boolean` - Require plugin: prefix |
| `commands-security-issue` | [Planned] | Logic | `securityPatterns: string[]` - Security anti-patterns |

---

## Category 9: LSP Servers (30 total)

### Implemented Rules (8)

| Rule ID | Status | Current Options | Suggested Options |
|---------|--------|----------------|-------------------|
| `lsp-command-not-in-path` | [Implemented] | None | `searchPaths: string[]` - Additional PATH directories<br>`checkInstalled: boolean` - Verify binary exists |
| `lsp-config-file-not-json` | [Implemented] | None | `allowComments: boolean` - Allow JSON with comments (JSON5) |
| `lsp-config-file-relative-path` | [Implemented] | None | `allowRelative: boolean` - Whether relative paths permitted |
| `lsp-extension-missing-dot` | [Implemented] | None | `autoFixExtensions: boolean` - Auto-add leading dot |
| `lsp-invalid-transport` | [Implemented] | None | `allowedTransports: string[]` - Valid transport types |
| `lsp-language-id-empty` | [Implemented] | None | - |
| `lsp-language-id-not-lowercase` | [Implemented] | None | `enforceCase: boolean` - Require lowercase language IDs |
| `lsp-server-name-too-short` | [Implemented] | `minLength: number` (default: 2) | - |

### Planned Rules (22)

| Rule ID | Status | Implementation | Suggested Options |
|---------|--------|----------------|-------------------|
| `lsp-invalid-root-field` | [Planned] | Schema | `strictMode: boolean` - Error on unknown fields |
| `lsp-missing-command` | [Planned] | Schema | - |
| `lsp-missing-extension-to-language` | [Planned] | Schema | - |
| `lsp-command-not-string` | [Planned] | Schema | - |
| `lsp-extension-to-language-not-object` | [Planned] | Schema | - |
| `lsp-extension-invalid-format` | [Planned] | Refinement | `extensionPattern: string` - Regex for valid extensions |
| `lsp-language-not-string` | [Planned] | Schema | - |
| `lsp-args-not-array` | [Planned] | Schema | - |
| `lsp-transport-invalid` | [Planned] | Schema | - |
| `lsp-env-not-object` | [Planned] | Schema | - |
| `lsp-initialization-options-not-object` | [Planned] | Schema | - |
| `lsp-settings-not-object` | [Planned] | Schema | - |
| `lsp-workspace-folder-not-string` | [Planned] | Schema | - |
| `lsp-startup-timeout-invalid` | [Planned] | Schema | `defaultTimeout: number` - Default startup timeout<br>`maxTimeout: number` - Maximum allowed |
| `lsp-shutdown-timeout-invalid` | [Planned] | Schema | `defaultTimeout: number` - Default shutdown timeout |
| `lsp-restart-on-crash-not-boolean` | [Planned] | Schema | - |
| `lsp-max-restarts-invalid` | [Planned] | Schema | `defaultMaxRestarts: number` - Default max restart count |
| `lsp-binary-not-in-path` | [Planned] | Logic | - |
| `lsp-plugin-location-wrong` | [Planned] | Logic | `lspConfigPath: string` - Required config location |
| `lsp-inline-conflicts-with-file` | [Planned] | Refinement | `preferInline: boolean` - Which config to prefer |
| `lsp-unknown-language-id` | [Planned] | Refinement | `knownLanguages: string[]` - Recognized language IDs |
| `lsp-socket-transport-deprecated` | [Planned] | Refinement | `allowDeprecated: boolean` - Allow socket transport |

---

## Category 10: Output Styles (19 total)

### Implemented Rules (7)

| Rule ID | Status | Current Options | Suggested Options |
|---------|--------|----------------|-------------------|
| `output-style-body-too-short` | [Implemented] | `minLength: number` (default: 50) | - |
| `output-style-description` | [Implemented] | None | `minLength: number` - Minimum description length<br>`maxLength: number` - Maximum description length |
| `output-style-examples` | [Implemented] | None | `minExamples: number` - Minimum examples required |
| `output-style-missing-examples` | [Implemented] | None | `requireExamples: boolean` - Make examples mandatory |
| `output-style-missing-guidelines` | [Implemented] | None | `requireGuidelines: boolean` - Make guidelines mandatory |
| `output-style-name` | [Implemented] | None | `minLength: number` - Minimum name length<br>`maxLength: number` - Maximum name length |
| `output-style-name-directory-mismatch` | [Implemented] | None | `enforceMatch: boolean` - Require name/dir match |

### Planned Rules (12)

| Rule ID | Status | Implementation | Suggested Options |
|---------|--------|----------------|-------------------|
| `output-style-invalid-frontmatter-field` | [Planned] | Schema | `strictMode: boolean` - Error on unknown fields |
| `output-style-plugin-location-wrong` | [Planned] | Logic | `outputStylePath: string` - Required location |
| `output-style-keep-coding-invalid` | [Planned] | Schema | - |
| `output-style-name-too-long` | [Planned] | Schema | `maxLength: number` - Maximum name length |
| `output-style-description-empty` | [Planned] | Schema | - |
| `output-style-missing-body` | [Planned] | Logic | - |
| `output-style-body-too-long` | [Planned] | Logic | `maxLength: number` - Maximum body length |
| `output-style-duplicate-name` | [Planned] | Logic | `allowDuplicates: boolean` - Permit duplicate names |
| `output-style-conflicting-options` | [Planned] | Logic | `conflicts: Record<string, string[]>` - Mutually exclusive options |
| `output-style-missing-context` | [Planned] | Logic | `requireContext: boolean` - Require context section |
| `output-style-inconsistent-formatting` | [Planned] | Logic | `enforceLinting: boolean` - Run markdown linter |
| `output-style-deprecated-syntax` | [Planned] | Logic | `syntaxVersion: string` - Target syntax version |

---

## Implementation Priority Recommendations

### High Priority (Essential for Basic Functionality)

1. **Settings Schema Rules** (32 rules) - Core configuration validation
2. **Hooks Schema Rules** (26 rules) - Event system integrity
3. **MCP Schema Rules** (28 rules) - Server configuration validation
4. **Plugin Schema Rules** (33 rules) - Plugin system validation

### Medium Priority (Enhance User Experience)

1. **Skill Enhancement Rules** (7 rules) - Improve skill quality
2. **Agent Enhancement Rules** (7 rules) - Better agent validation
3. **LSP Schema Rules** (14 rules) - Language server validation
4. **Output Style Rules** (10 rules) - Style guide enforcement

### Low Priority (Nice to Have)

1. **CLAUDE.md Enhancement Rules** (6 rules) - Additional content checks
2. **Commands Migration** (3 rules) - Legacy support
3. **Advanced Security Rules** - Deep security scanning
4. **Performance Analysis Rules** - Complexity and optimization checks

---

## Options Design Patterns

### Common Option Patterns

1. **Threshold Options**: `maxSize`, `minLength`, `maxDepth` - Numeric limits
2. **Toggle Options**: `strictMode`, `requireX`, `allowY` - Boolean flags
3. **Whitelist Options**: `allowedTools`, `knownVars`, `trustedDomains` - String arrays
4. **Pattern Options**: `namingPattern`, `extensionPattern` - Regex strings
5. **Enum Options**: `platform`, `severity`, `lineEnding` - Constrained values

### Option Categories

1. **Validation Strictness**: Control error vs warning behavior
2. **Custom Patterns**: User-defined patterns and whitelists
3. **Auto-Fix Behavior**: Control automatic corrections
4. **Feature Toggles**: Enable/disable specific checks
5. **Default Values**: Provide sensible defaults when values missing

---

## Future Enhancements

### Cross-File Validation

Rules that validate relationships between files:

- `cross-skill-duplicate-name` - Detect duplicate skill names
- `cross-agent-dependency-cycle` - Find circular agent dependencies
- `cross-plugin-version-conflict` - Detect incompatible plugin versions
- `cross-import-unused` - Find imported but unused rules

### Integration Rules

Rules that integrate with external tools:

- `integration-shellcheck` - Shell script static analysis
- `integration-eslint` - JavaScript/TypeScript linting
- `integration-pylint` - Python code analysis
- `integration-markdownlint` - Markdown formatting
- `integration-yamllint` - YAML validation

### Performance Rules

Rules that analyze performance implications:

- `perf-large-file` - Warn on files that slow parsing
- `perf-complex-regex` - Detect expensive regular expressions
- `perf-deep-recursion` - Find excessive recursion depth
- `perf-hook-timeout` - Identify slow hook scripts

### Security Rules

Advanced security analysis:

- `security-credential-leak` - Detect exposed credentials
- `security-injection-risk` - Find injection vulnerabilities
- `security-unsafe-eval` - Detect dangerous eval usage
- `security-path-traversal` - Find directory traversal risks
- `security-privilege-escalation` - Detect privilege issues

---

## Notes

1. **Auto-Generated**: This document reflects the current state of the codebase
2. **Living Document**: Update as rules are implemented or specifications change
3. **Option Suggestions**: All suggested options should be validated against actual use cases
4. **Implementation Types**: From RULE-TRACKER.md (Schema/Refinement/Logic)
5. **Default Values**: All suggested numeric options should have sensible defaults
6. **Backward Compatibility**: New options should maintain compatibility with existing configs

---

**Document Version**: 1.0.0
**Generated**: 2026-01-29
**Total Rules**: 324 (105 implemented + 219 planned)
**Implementation Progress**: 32.4%
