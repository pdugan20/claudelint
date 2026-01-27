# Rule Validation Tracker

This document tracks the validation of claudelint rules against official Claude Code documentation. We're verifying that our rules match actual requirements and identifying missing validations.

## Progress

- [x] Category 1: CLAUDE.md files
- [x] Category 2: Skills
- [x] Category 3: Settings
- [x] Category 4: Hooks
- [x] Category 5: MCP Servers
- [x] Category 6: Plugins
- [x] Category 7: Agents
- [x] Category 8: Commands/Prompts (DEPRECATED)
- [x] Category 9: LSP Servers
- [x] Category 10: Output Styles

---

## Category 1: CLAUDE.md Files

**Official Documentation:**

- <https://code.claude.com/docs/en/memory>
- <https://code.claude.com/docs/en/memory#claude-md-imports>

### ✅ Current Rules (Keep)

| Rule ID           | Status | Notes                          |
| ----------------- | ------ | ------------------------------ |
| `size-warning`    | Keep   | 35KB limit - confirmed real    |
| `size-error`      | Keep   | 40KB limit - confirmed real    |
| `import-missing`  | Keep   | Validates imported files exist |
| `import-circular` | Keep   | Max depth of 5 hops            |

### ➕ Missing Rules (Add)

| Rule ID                     | Severity | Description                                 | Official Requirement                                                                                  |
| --------------------------- | -------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `import-in-code-block`      | warning  | Imports inside code blocks/spans won't work | "To avoid potential collisions, imports are not evaluated inside markdown code spans and code blocks" |
| `import-invalid-home-path`  | error    | `@~/...` syntax doesn't resolve             | Validate home directory imports                                                                       |
| `frontmatter-invalid-paths` | error    | Paths must be array with valid globs        | `.claude/rules/*.md` frontmatter validation                                                           |
| `frontmatter-unknown-field` | warning  | Only `paths` field is documented            | Warn about unknown frontmatter fields                                                                 |
| `rules-circular-symlink`    | error    | Circular symlinks in `.claude/rules/`       | "Circular symlinks are detected and handled gracefully"                                               |
| `filename-case-sensitive`   | warning  | Must be exactly `CLAUDE.md`                 | Case-sensitive requirement                                                                            |

### 🔍 Need to Verify Implementation

- Import parsing correctly ignores code blocks/spans
- Frontmatter `paths` field validation for glob patterns
- Brace expansion support: `{src,lib}/**/*.ts`

---

## Category 2: Skills

**Official Documentation:**

- <https://code.claude.com/docs/en/skills>
- <https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview>
- <https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices>

### ✅ Current Rules (Keep - Shell Script Quality)

| Rule ID                     | Status | Notes                       |
| --------------------------- | ------ | --------------------------- |
| `skill-missing-shebang`     | Keep   | Shell scripts need shebang  |
| `skill-missing-version`     | Keep   | Version tracking            |
| `skill-missing-comments`    | Keep   | Code documentation          |
| `skill-dangerous-command`   | Keep   | Security validation         |
| `skill-eval-usage`          | Keep   | Security validation         |
| `skill-path-traversal`      | Keep   | Security validation         |
| `skill-missing-examples`    | Keep   | Best practice               |
| `skill-deep-nesting`        | Keep   | Organization best practice  |
| `skill-missing-changelog`   | Keep   | Documentation best practice |
| `skill-naming-inconsistent` | Keep   | File naming consistency     |
| `skill-too-many-files`      | Keep   | Organization best practice  |

### ➕ Missing Rules (Add - SKILL.md Frontmatter Validation)

| Rule ID                                      | Severity | Description                           | Official Requirement                                                     |
| -------------------------------------------- | -------- | ------------------------------------- | ------------------------------------------------------------------------ |
| `skill-frontmatter-name-max-length`          | error    | Name max 64 characters                | "Maximum 64 characters"                                                  |
| `skill-frontmatter-name-invalid-chars`       | error    | Only lowercase, numbers, hyphens      | "Must contain only lowercase letters, numbers, and hyphens"              |
| `skill-frontmatter-name-reserved-words`      | error    | No "anthropic" or "claude"            | "Cannot contain reserved words: 'anthropic', 'claude'"                   |
| `skill-frontmatter-name-xml-tags`            | error    | No XML tags in name                   | "Cannot contain XML tags"                                                |
| `skill-frontmatter-description-empty`        | error    | Description required                  | "Recommended" field for discovery                                        |
| `skill-frontmatter-description-max-length`   | error    | Max 1024 characters                   | "Maximum 1024 characters"                                                |
| `skill-frontmatter-description-xml-tags`     | error    | No XML tags in description            | "Cannot contain XML tags"                                                |
| `skill-frontmatter-description-first-person` | warning  | Must be 3rd person                    | "Always write in third person" - not "I can" or "You can"                |
| `skill-frontmatter-context-invalid-value`    | error    | Must be "fork" if set                 | Only valid value is "fork"                                               |
| `skill-frontmatter-allowed-tools-invalid`    | error    | Tools must exist                      | Validate against known tools                                             |
| `skill-frontmatter-model-invalid`            | error    | Must be valid model name              | sonnet, opus, haiku, inherit                                             |
| `skill-frontmatter-agent-invalid`            | error    | Must be valid agent when context=fork | Validate agent type exists                                               |
| `skill-invalid-substitution`                 | error    | Invalid variable substitution         | Only: $ARGUMENTS, $N, $ARGUMENTS[N], ${CLAUDE_SESSION_ID}                |
| `skill-body-too-long`                        | warning  | SKILL.md >500 lines                   | "Keep SKILL.md under 500 lines for optimal performance"                  |
| `skill-reference-too-deep`                   | warning  | References nested >1 level            | "Keep references one level deep from SKILL.md"                           |
| `skill-windows-paths`                        | warning  | Use forward slashes                   | "Always use forward slashes in file paths, even on Windows"              |
| `skill-mcp-unqualified-tool`                 | warning  | MCP tools need ServerName: prefix     | "Always use fully qualified tool names"                                  |
| `skill-naming-not-gerund`                    | info     | Suggest gerund form                   | "We recommend using gerund form" (processing-pdfs, not process-pdfs)     |
| `skill-large-reference-no-toc`               | warning  | Reference file >100 lines needs TOC   | "For reference files longer than 100 lines, include a table of contents" |
| `skill-time-sensitive-content`               | warning  | Contains date-based conditionals      | "Avoid time-sensitive information"                                       |

### 🔍 Verified Frontmatter Fields

All optional frontmatter fields ARE officially documented:

- `name`, `description` (required/recommended)
- `argument-hint`, `disable-model-invocation`, `user-invocable`
- `allowed-tools`, `model`, `context`, `agent`, `hooks`

---

## Category 3: Settings

**Official Documentation:**

- <https://code.claude.com/docs/en/settings>

### ✅ Current Rules (Verify Implementation)

| Rule ID                       | Status | Notes                                                |
| ----------------------------- | ------ | ---------------------------------------------------- |
| `settings-invalid-schema`     | Verify | Need to verify against comprehensive official schema |
| `settings-invalid-permission` | Verify | Need to verify permission rule syntax validation     |
| `settings-invalid-env-var`    | Verify | Need to verify env var name validation               |

### ➕ Missing Rules (Add - Schema Validation)

| Rule ID                                   | Severity | Description                            | Official Requirement                                                                                      |
| ----------------------------------------- | -------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `settings-invalid-root-field`             | error    | Unknown root-level field               | Validate against official schema                                                                          |
| `settings-invalid-field-type`             | error    | Field has wrong type                   | Type validation (string, number, boolean, object, array)                                                  |
| `settings-permission-invalid-mode`        | error    | Invalid defaultMode value              | Must be "acceptEdits" or other valid modes                                                                |
| `settings-permission-invalid-rule`        | error    | Malformed permission rule              | Tool(pattern) syntax validation                                                                           |
| `settings-permission-invalid-tool`        | error    | Unknown tool name                      | Validate tool exists                                                                                      |
| `settings-permission-legacy-syntax`       | warning  | Using deprecated `:*` syntax           | Should use `*` instead                                                                                    |
| `settings-attribution-invalid-field`      | error    | Unknown attribution field              | Only `commit` and `pr` allowed                                                                            |
| `settings-sandbox-invalid-field`          | error    | Unknown sandbox field                  | Validate against sandbox schema                                                                           |
| `settings-sandbox-invalid-network`        | error    | Invalid network config                 | Validate network object schema                                                                            |
| `settings-sandbox-invalid-path`           | error    | Unix socket path not absolute          | Must be absolute paths                                                                                    |
| `settings-sandbox-invalid-port`           | error    | Invalid proxy port                     | Must be 1-65535                                                                                           |
| `settings-statusline-invalid-type`        | error    | Invalid statusLine type                | Must be "command"                                                                                         |
| `settings-statusline-missing-command`     | error    | statusLine.command required            | Required when type="command"                                                                              |
| `settings-filesuggestion-invalid-type`    | error    | Invalid fileSuggestion type            | Must be "command"                                                                                         |
| `settings-filesuggestion-missing-command` | error    | fileSuggestion.command required        | Required when type="command"                                                                              |
| `settings-hooks-invalid-event`            | error    | Unknown hook event                     | Must be valid hook event name                                                                             |
| `settings-hooks-invalid-tool`             | error    | Unknown tool in hooks                  | Validate tool name exists                                                                                 |
| `settings-mcp-server-invalid-name`        | error    | Invalid MCP server name                | Validate serverName field                                                                                 |
| `settings-marketplace-invalid-source`     | error    | Invalid marketplace source type        | Must be: github, git, url, npm, file, directory, hostPattern                                              |
| `settings-marketplace-missing-required`   | error    | Missing required field                 | repo (github), url (git/url), package (npm), path (file/directory), hostPattern                           |
| `settings-marketplace-invalid-url`        | error    | Invalid URL format                     | Must be https:// or ssh://                                                                                |
| `settings-marketplace-invalid-path`       | error    | Path not absolute                      | file/directory paths must be absolute                                                                     |
| `settings-plugin-invalid-format`          | error    | Invalid plugin identifier              | Must be plugin-name@marketplace-name                                                                      |
| `settings-uuid-invalid-format`            | error    | forceLoginOrgUUID not valid UUID       | Must match UUID format                                                                                    |
| `settings-number-out-of-range`            | error    | Number outside valid range             | cleanupPeriodDays ≥0, max tokens 1-64000, etc.                                                            |
| `settings-enum-invalid-value`             | error    | Invalid enum value                     | forceLoginMethod, autoUpdatesChannel, language codes                                                      |
| `settings-path-not-relative`              | error    | plansDirectory must be relative        | Cannot be absolute path                                                                                   |
| `settings-deprecated-field`               | warning  | Using deprecated field                 | includeCoAuthoredBy is deprecated, use attribution                                                        |
| `settings-env-var-invalid-name`           | error    | Invalid env var name                   | Must match valid env var naming                                                                           |
| `settings-env-var-unknown`                | warning  | Unknown environment variable           | Not in documented list                                                                                    |
| `settings-scope-invalid`                  | error    | Field not allowed in this scope        | Some fields only in managed/user/project                                                                  |
| `settings-managed-only-field`             | error    | Field only allowed in managed settings | companyAnnouncements, allowManagedHooksOnly, allowedMcpServers, deniedMcpServers, strictKnownMarketplaces |

### 📝 Notes

- Settings has 31 root-level fields with complex nested object validation
- 7 different marketplace source types, each with unique required fields
- 60+ documented environment variables with specific validation requirements
- Permission rules support glob patterns with wildcards at any position
- Scope-based restrictions (managed/user/project/local)

---

## Category 4: Hooks

**Official Documentation:**

- <https://code.claude.com/docs/en/hooks>
- <https://code.claude.com/docs/en/hooks-guide>

### ✅ Current Rules (Verify Implementation)

| Rule ID                | Status | Notes                                        |
| ---------------------- | ------ | -------------------------------------------- |
| `hooks-invalid-event`  | Verify | Need to verify against 12 official events    |
| `hooks-missing-script` | Verify | Need to verify requirement for command hooks |
| `hooks-invalid-config` | Verify | Need to verify against complete schema       |

### ➕ Missing Rules (Add - Schema Validation)

| Rule ID                               | Severity | Description                             | Official Requirement                                                                                        |
| ------------------------------------- | -------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `hooks-invalid-event-name`            | error    | Unknown hook event                      | Must be one of 12 valid events                                                                              |
| `hooks-invalid-hook-type`             | error    | Invalid hook type                       | Must be "command" or "prompt"                                                                               |
| `hooks-missing-command`               | error    | Missing command field                   | Required when type="command"                                                                                |
| `hooks-missing-prompt`                | error    | Missing prompt field                    | Required when type="prompt"                                                                                 |
| `hooks-both-command-and-prompt`       | error    | Both command and prompt specified       | Must specify only one                                                                                       |
| `hooks-prompt-type-deprecated-events` | warning  | Prompt hooks best for Stop/SubagentStop | "Most useful for Stop, SubagentStop"                                                                        |
| `hooks-invalid-timeout`               | error    | Invalid timeout value                   | Must be positive number (seconds)                                                                           |
| `hooks-matcher-on-non-tool-event`     | warning  | Matcher on event that doesn't use it    | Matchers only for PreToolUse, PermissionRequest, PostToolUse, Notification, PreCompact, Setup, SessionStart |
| `hooks-missing-matcher-array`         | error    | Event value not an array                | Each event must be array of matcher objects                                                                 |
| `hooks-invalid-matcher-type`          | error    | Matcher not string                      | Must be string (regex, exact match, or "\*")                                                                |
| `hooks-invalid-hooks-array`           | error    | hooks field not array                   | Must be array of hook objects                                                                               |
| `hooks-once-not-in-skill`             | error    | once=true outside skill                 | Only supported in skills, not settings/agents                                                               |
| `hooks-mcp-tool-pattern`              | info     | Suggest MCP tool pattern                | MCP tools use `mcp__<server>__<tool>` format                                                                |
| `hooks-json-output-schema`            | error    | Invalid JSON output schema              | Must match event-specific schema                                                                            |
| `hooks-exit-code-2-with-json`         | warning  | Exit code 2 ignores JSON                | JSON only processed on exit code 0                                                                          |
| `hooks-deprecated-decision-fields`    | warning  | Using deprecated decision/reason        | Use permissionDecision/permissionDecisionReason for PreToolUse                                              |
| `hooks-invalid-permission-decision`   | error    | Invalid permissionDecision value        | Must be "allow", "deny", or "ask"                                                                           |
| `hooks-invalid-permission-behavior`   | error    | Invalid PermissionRequest behavior      | Must be "allow" or "deny"                                                                                   |
| `hooks-block-without-reason`          | error    | decision=block without reason           | Must provide reason when blocking                                                                           |
| `hooks-continue-false-without-reason` | error    | continue=false without stopReason       | Should provide stopReason                                                                                   |
| `hooks-invalid-tool-name-in-matcher`  | warning  | Matcher references unknown tool         | Validate tool exists                                                                                        |
| `hooks-description-outside-plugin`    | warning  | description field outside plugin        | Only used in plugin hooks                                                                                   |
| `hooks-env-var-undefined`             | info     | Using undefined env var                 | CLAUDE_PROJECT_DIR, CLAUDE_ENV_FILE (SessionStart only), CLAUDE_PLUGIN_ROOT, CLAUDE_CODE_REMOTE             |
| `hooks-command-not-quoted`            | warning  | Shell command missing quotes            | Should quote variables: "$VAR" not $VAR                                                                     |
| `hooks-path-traversal-risk`           | warning  | Potential path traversal                | Check for ".." in paths                                                                                     |
| `hooks-sensitive-file-access`         | warning  | Accessing sensitive files               | .env, .git/, keys, etc.                                                                                     |

### 📝 Notes

**12 Hook Events:**

- SessionStart, UserPromptSubmit, PreToolUse, PermissionRequest
- PostToolUse, PostToolUseFailure, SubagentStart, SubagentStop
- Stop, PreCompact, SessionEnd, Notification

**Hook Types:**

- `command`: Bash command execution (most common)
- `prompt`: LLM-based evaluation (best for Stop/SubagentStop)

**Matcher Patterns:**

- Case-sensitive
- Simple strings (exact match), regex, or `*`/`""`(match all)
- Only for: PreToolUse, PermissionRequest, PostToolUse, Notification, PreCompact, Setup, SessionStart
- MCP tools: `mcp__<server>__<tool>` pattern

**Environment Variables:**

- `CLAUDE_PROJECT_DIR`: All hooks
- `CLAUDE_ENV_FILE`: SessionStart only (for persisting env vars)
- `CLAUDE_PLUGIN_ROOT`: Plugin hooks only
- `CLAUDE_CODE_REMOTE`: "true" for remote/web, not set for local

**Exit Codes:**

- 0: Success (JSON processed if present)
- 2: Blocking error (uses stderr, ignores JSON)
- Other: Non-blocking error (stderr shown in verbose mode)

**JSON Output Fields:**

- Common: `continue`, `stopReason`, `suppressOutput`, `systemMessage`
- PreToolUse: `permissionDecision`, `permissionDecisionReason`, `updatedInput`, `additionalContext`
- PermissionRequest: `decision.{behavior,updatedInput,message,interrupt}`
- PostToolUse: `decision`, `reason`, `hookSpecificOutput.additionalContext`
- UserPromptSubmit: `decision`, `reason`, `hookSpecificOutput.additionalContext`
- Stop/SubagentStop: `decision`, `reason`
- Setup/SessionStart: `hookSpecificOutput.additionalContext`

---

## Category 5: MCP Servers

**Official Documentation:**

- <https://code.claude.com/docs/en/mcp>

### ✅ Current Rules (Verify Implementation)

| Rule ID                 | Status | Notes                                  |
| ----------------------- | ------ | -------------------------------------- |
| `mcp-invalid-server`    | Verify | Need to verify against complete schema |
| `mcp-invalid-transport` | Verify | stdio, http, sse (deprecated)          |
| `mcp-invalid-env-var`   | Verify | Env var expansion syntax               |

### ➕ Missing Rules (Add - Schema Validation)

| Rule ID                                  | Severity | Description                          | Official Requirement                                                    |
| ---------------------------------------- | -------- | ------------------------------------ | ----------------------------------------------------------------------- |
| `mcp-invalid-root-field`                 | error    | Unknown root-level field             | Only `mcpServers` allowed                                               |
| `mcp-invalid-server-name`                | error    | Invalid server name format           | Must be valid identifier                                                |
| `mcp-missing-type`                       | error    | Missing type field                   | Required for server config                                              |
| `mcp-invalid-type`                       | error    | Invalid type value                   | Must be "stdio", "http", "sse", or "websocket"                          |
| `mcp-sse-deprecated`                     | warning  | Using deprecated SSE transport       | "SSE transport is deprecated. Use HTTP servers instead"                 |
| `mcp-stdio-missing-command`              | error    | stdio server missing command         | Required when type="stdio"                                              |
| `mcp-http-missing-url`                   | error    | HTTP server missing url              | Required when type="http"                                               |
| `mcp-sse-missing-url`                    | error    | SSE server missing url               | Required when type="sse"                                                |
| `mcp-invalid-command-type`               | error    | command not string                   | Must be string (executable path)                                        |
| `mcp-invalid-args-type`                  | error    | args not array                       | Must be array of strings                                                |
| `mcp-invalid-env-type`                   | error    | env not object                       | Must be object with string values                                       |
| `mcp-invalid-env-expansion`              | error    | Invalid env var expansion            | Must use ${VAR} or ${VAR:-default} syntax                               |
| `mcp-env-var-undefined`                  | warning  | Undefined env var without default    | ${VAR} without default and VAR not set                                  |
| `mcp-invalid-url-format`                 | error    | URL malformed                        | Must be valid URL (https:// or http://)                                 |
| `mcp-invalid-headers-type`               | error    | headers not object                   | Must be object with string values                                       |
| `mcp-windows-npx-without-cmd`            | warning  | npx without cmd /c on Windows        | "On native Windows, local MCP servers using npx require cmd /c wrapper" |
| `mcp-plugin-root-undefined`              | error    | ${CLAUDE_PLUGIN_ROOT} outside plugin | Only available in plugin MCP servers                                    |
| `mcp-managed-invalid-restriction`        | error    | Invalid allowlist/denylist entry     | Must have exactly one of serverName, serverCommand, serverUrl           |
| `mcp-managed-multiple-restriction-types` | error    | Entry has multiple restriction types | Cannot mix serverName, serverCommand, serverUrl in one entry            |
| `mcp-managed-invalid-command-array`      | error    | serverCommand not array              | Must be array of strings                                                |
| `mcp-managed-invalid-url-pattern`        | error    | serverUrl invalid pattern            | Must be valid URL pattern with \* wildcards                             |
| `mcp-managed-empty-allowlist`            | warning  | Empty allowedMcpServers array        | Completely locks down MCP access                                        |
| `mcp-scope-invalid`                      | error    | Invalid scope value                  | Must be "local", "project", or "user"                                   |
| `mcp-both-managed-and-user`              | warning  | managed-mcp.json with user config    | "managed-mcp.json takes exclusive control"                              |
| `mcp-invalid-timeout`                    | error    | Invalid MCP_TIMEOUT value            | Must be positive number (milliseconds)                                  |
| `mcp-invalid-max-output`                 | error    | Invalid MAX_MCP_OUTPUT_TOKENS        | Must be positive number                                                 |
| `mcp-tool-search-invalid-value`          | error    | Invalid ENABLE_TOOL_SEARCH           | Must be "auto", "auto:N", "true", or "false"                            |
| `mcp-tool-search-invalid-threshold`      | error    | Invalid threshold in auto:N          | N must be number 1-100                                                  |

### 📝 Notes

**Transport Types:**

- `stdio`: Local process communication (most common for local servers)
- `http`: HTTP-based servers (recommended for remote servers)
- `sse`: Server-Sent Events (deprecated, use HTTP instead)
- `websocket`: WebSocket-based servers

**Configuration Locations:**

- **User/Local scope**: `~/.claude.json` (mcpServers field or under project paths)
- **Project scope**: `.mcp.json` in project root (checked into git)
- **Managed**: `managed-mcp.json` in system directories (IT-deployed)
- **Plugin**: `.mcp.json` at plugin root or inline in `plugin.json`

**Scope Precedence:**
Local > Project > User (lower scope overrides higher)

**Environment Variable Expansion:**

- `${VAR}`: Expands to value of VAR
- `${VAR:-default}`: Expands to VAR if set, otherwise uses default
- Available in: command, args, env, url, headers
- Plugin-only: `${CLAUDE_PLUGIN_ROOT}`

**Managed MCP Options:**

1. **Exclusive control**: `managed-mcp.json` (users cannot add/modify servers)
2. **Policy-based**: `allowedMcpServers`/`deniedMcpServers` in managed settings

**Allowlist/Denylist Restrictions:**

- **By name**: `{ "serverName": "github" }`
- **By command**: `{ "serverCommand": ["npx", "-y", "package"] }` (exact match)
- **By URL**: `{ "serverUrl": "https://*.example.com/*" }` (wildcard support)
- Each entry must have exactly ONE restriction type
- Denylist takes precedence over allowlist

**Special Features:**

- OAuth 2.0 authentication for remote servers
- Dynamic tool updates via `list_changed` notifications
- MCP resources (@ mentions)
- MCP prompts as commands (`/mcp__server__prompt`)
- Tool search for large tool sets
- Claude Code as MCP server (`claude mcp serve`)

**Environment Variables:**

- `MCP_TIMEOUT`: Startup timeout (milliseconds)
- `MAX_MCP_OUTPUT_TOKENS`: Output limit (default 25,000)
- `ENABLE_TOOL_SEARCH`: "auto", "auto:N", "true", "false"

---

## Category 6: Plugins

**Official Documentation:**

- <https://code.claude.com/docs/en/plugins>
- <https://github.com/anthropics/claude-code/tree/main/plugins>

### ✅ Current Rules (Verify Implementation)

| Rule ID                   | Status | Notes                                              |
| ------------------------- | ------ | -------------------------------------------------- |
| `plugin-invalid-manifest` | Verify | Need to verify against complete plugin.json schema |
| `plugin-invalid-version`  | Verify | Semantic versioning requirement                    |
| `plugin-missing-file`     | Verify | Referenced file existence validation               |

### ➕ Missing Rules (Add - Schema & Structure Validation)

| Rule ID                                | Severity | Description                             | Official Requirement                                       |
| -------------------------------------- | -------- | --------------------------------------- | ---------------------------------------------------------- |
| `plugin-missing-manifest`              | error    | Missing .claude-plugin/plugin.json      | "Plugin manifest is required"                              |
| `plugin-manifest-not-in-subdir`        | error    | plugin.json not in .claude-plugin/      | Must be at .claude-plugin/plugin.json                      |
| `plugin-invalid-root-field`            | error    | Unknown root-level field in plugin.json | Validate against schema                                    |
| `plugin-missing-name`                  | error    | Missing name field                      | Required field                                             |
| `plugin-missing-description`           | error    | Missing description field               | Required field                                             |
| `plugin-missing-version`               | error    | Missing version field                   | Required field                                             |
| `plugin-name-invalid-format`           | error    | Invalid name format                     | Must be valid identifier (lowercase, hyphens)              |
| `plugin-name-too-long`                 | error    | Name too long                           | Max 64 characters                                          |
| `plugin-version-invalid-semver`        | error    | Version not valid semver                | Must be X.Y.Z format                                       |
| `plugin-description-empty`             | error    | Empty description                       | Must be non-empty string                                   |
| `plugin-author-invalid-type`           | error    | Author not object                       | Must be {name, email?, url?}                               |
| `plugin-author-missing-name`           | error    | Author missing name field               | name is required in author object                          |
| `plugin-homepage-invalid-url`          | error    | homepage not valid URL                  | Must be valid URL                                          |
| `plugin-repository-invalid-format`     | error    | repository invalid format               | Must be {type, url} or string                              |
| `plugin-license-invalid`               | warning  | Unknown license identifier              | Should use SPDX identifier                                 |
| `plugin-components-at-root`            | error    | Components inside .claude-plugin/       | skills/, agents/, commands/, hooks/ must be at plugin root |
| `plugin-invalid-skills-path`           | error    | skills field points to invalid path     | Must be array of valid paths                               |
| `plugin-invalid-agents-path`           | error    | agents field points to invalid path     | Must be array of valid paths                               |
| `plugin-invalid-commands-path`         | error    | commands field points to invalid path   | Must be array of valid paths                               |
| `plugin-invalid-hooks-path`            | error    | hooks field points to invalid path      | Must be valid path to hooks.json                           |
| `plugin-invalid-mcp-servers`           | error    | mcpServers invalid schema               | Must match MCP schema                                      |
| `plugin-mcp-servers-in-wrong-location` | error    | MCP servers not at root                 | .mcp.json must be at plugin root, not in .claude-plugin/   |
| `plugin-lsp-servers-in-wrong-location` | error    | LSP servers not at root                 | .lsp.json must be at plugin root, not in .claude-plugin/   |
| `plugin-missing-readme`                | warning  | Missing README.md                       | "Required for distribution"                                |
| `plugin-skill-missing-namespace`       | error    | Skill doesn't use plugin namespace      | Skills should use plugin-name: prefix                      |
| `plugin-command-missing-namespace`     | error    | Command doesn't use plugin namespace    | Commands should use plugin-name: prefix                    |
| `plugin-agent-missing-namespace`       | error    | Agent doesn't use plugin namespace      | Agents should use plugin-name: prefix                      |
| `plugin-marketplace-invalid-schema`    | error    | marketplace.json invalid schema         | Must match marketplace schema                              |
| `plugin-marketplace-missing-plugins`   | error    | marketplace.json missing plugins array  | Required field                                             |
| `plugin-marketplace-invalid-source`    | error    | Plugin source invalid format            | Must be {source: github/git/url/npm/file/directory, ...}   |
| `plugin-marketplace-missing-version`   | error    | Plugin entry missing version            | Required in marketplace entries                            |
| `plugin-circular-dependency`           | error    | Circular plugin dependencies            | Plugins cannot depend on each other circularly             |
| `plugin-dependency-not-found`          | error    | Referenced dependency not available     | All dependencies must be resolvable                        |

### 📝 Notes

**Directory Structure Rules:**

- `.claude-plugin/` contains ONLY `plugin.json` (required)
- `skills/`, `agents/`, `commands/`, `hooks/` at plugin root (optional)
- `.mcp.json`, `.lsp.json` at plugin root (optional)
- `README.md` at plugin root (recommended)

**Plugin Manifest Schema (plugin.json):**

````json
{
  "name": "string (required, lowercase, hyphens, max 64 chars)",
  "description": "string (required, non-empty)",
  "version": "string (required, semver X.Y.Z)",
  "author": {
    "name": "string (required)",
    "email": "string (optional)",
    "url": "string (optional)"
  },
  "homepage": "string (optional, valid URL)",
  "repository": "string | {type, url} (optional)",
  "license": "string (optional, SPDX identifier)",
  "skills": ["array of paths (optional)"],
  "agents": ["array of paths (optional)"],
  "commands": ["array of paths (optional)"],
  "hooks": "string path (optional)",
  "mcpServers": {object matching MCP schema (optional)}
}
```text
**Namespacing:**

- Skills: `/plugin-name:skill-name`
- Commands: `/plugin-name:command-name`
- Agents: `plugin-name:agent-name`
- Prevents conflicts between plugins

**Component Locations:**

- Inline in plugin.json (mcpServers)
- Separate files at root (.mcp.json, .lsp.json)
- Directories at root (skills/, agents/, commands/, hooks/)
- References via path arrays (skills, agents, commands fields)

**Version Management:**

- Must use semantic versioning (X.Y.Z)
- Breaking changes increment major version
- New features increment minor version
- Bug fixes increment patch version

**Marketplace Schema:**

```json
{
  "plugins": [
    {
      "source": {
        "source": "github|git|url|npm|file|directory",
        ...source-specific fields
      },
      "version": "semver (required)"
    }
  ]
}
```text
**Distribution Methods:**

1. Local development: `--plugin-dir ./my-plugin`
2. Marketplaces: Custom marketplace.json files
3. Official marketplace: Anthropic-curated plugins
4. Team repositories: Git-based distribution

---

## Category 7: Agents (Subagents)

**Official Documentation:**

- <https://code.claude.com/docs/en/sub-agents>

### ✅ Current Rules

(None currently - not yet implemented)

### ➕ Missing Rules (Add - Frontmatter & Schema Validation)

| Rule ID                               | Severity | Description                            | Official Requirement                                              |
| ------------------------------------- | -------- | -------------------------------------- | ----------------------------------------------------------------- |
| `agent-missing-frontmatter`           | error    | Missing YAML frontmatter               | Agents must have frontmatter                                      |
| `agent-missing-name`                  | error    | Missing name field                     | Required field                                                    |
| `agent-missing-description`           | error    | Missing description field              | Required field                                                    |
| `agent-name-invalid-format`           | error    | Invalid name format                    | Lowercase letters and hyphens only                                |
| `agent-name-too-long`                 | error    | Name too long                          | Max 64 characters                                                 |
| `agent-description-empty`             | error    | Empty description                      | Must be non-empty string                                          |
| `agent-invalid-frontmatter-field`     | error    | Unknown frontmatter field              | Only documented fields allowed                                    |
| `agent-tools-invalid-type`            | error    | tools not array                        | Must be array of tool names                                       |
| `agent-tools-invalid-tool`            | error    | Unknown tool in tools                  | Tool must exist                                                   |
| `agent-disallowed-tools-invalid-type` | error    | disallowedTools not array              | Must be array of tool names                                       |
| `agent-disallowed-tools-invalid-tool` | error    | Unknown tool in disallowedTools        | Tool must exist                                                   |
| `agent-tools-conflict`                | error    | Tool in both tools and disallowedTools | Cannot allow and disallow same tool                               |
| `agent-model-invalid`                 | error    | Invalid model value                    | Must be sonnet, opus, haiku, or inherit                           |
| `agent-permission-mode-invalid`       | error    | Invalid permissionMode                 | Must be default, acceptEdits, dontAsk, bypassPermissions, or plan |
| `agent-skills-invalid-type`           | error    | skills not array                       | Must be array of skill names                                      |
| `agent-skills-not-found`              | error    | Referenced skill not found             | All skills must exist                                             |
| `agent-hooks-invalid-schema`          | error    | Invalid hooks schema                   | Must match hooks configuration schema                             |
| `agent-hooks-invalid-event`           | error    | Invalid hook event for agents          | Only PreToolUse, PostToolUse, Stop allowed                        |
| `agent-hooks-stop-converted`          | info     | Stop hook converted to SubagentStop    | Automatic conversion happens                                      |
| `agent-missing-body`                  | warning  | Missing markdown body                  | Should have system prompt after frontmatter                       |
| `agent-empty-body`                    | warning  | Empty markdown body                    | System prompt should be non-empty                                 |
| `agent-no-tools-specified`            | info     | No tools restriction                   | Agent inherits all tools from parent                              |
| `agent-bypass-permissions-warning`    | warning  | Using bypassPermissions                | "Use with caution" - skips all permission checks                  |
| `agent-skills-not-inherited`          | info     | Skills must be explicit                | "Subagents don't inherit skills from parent"                      |
| `agent-cannot-spawn-subagents`        | info     | Subagents cannot nest                  | "Subagents cannot spawn other subagents"                          |
| `agent-cli-json-invalid`              | error    | Invalid --agents JSON                  | Must match schema with prompt, description, tools, model fields   |

### 📝 Notes

**Frontmatter Schema:**

```yaml
---
name: string (required, lowercase-hyphens, max 64 chars)
description: string (required, non-empty)
tools: array of tool names (optional)
disallowedTools: array of tool names (optional)
model: sonnet|opus|haiku|inherit (optional, default: inherit)
permissionMode: default|acceptEdits|dontAsk|bypassPermissions|plan (optional)
skills: array of skill names (optional)
hooks: object (optional, only PreToolUse, PostToolUse, Stop)
---
```text
**Built-in Agents:**

- `Explore`: Haiku, read-only, for codebase exploration
- `Plan`: Inherits model, read-only, for plan mode research
- `general-purpose`: Inherits model, all tools, for complex tasks
- `Bash`: For terminal commands in separate context
- `statusline-setup`: Sonnet, for /statusline configuration
- `Claude Code Guide`: Haiku, for help questions

**Model Values:**

- `sonnet`: Claude Sonnet
- `opus`: Claude Opus
- `haiku`: Claude Haiku
- `inherit`: Use same model as main conversation (default)

**Permission Modes:**

- `default`: Standard permission checking
- `acceptEdits`: Auto-accept file edits
- `dontAsk`: Auto-deny permission prompts
- `bypassPermissions`: Skip all permission checks (dangerous)
- `plan`: Plan mode (read-only exploration)

**Tool Restrictions:**

- `tools`: Allowlist (if specified, only these tools allowed)
- `disallowedTools`: Denylist (remove from inherited/allowed tools)
- Default: Inherit all tools from parent conversation
- MCP tools: Inherited from parent

**Hooks in Agents:**

- Only: `PreToolUse`, `PostToolUse`, `Stop`
- `Stop` hooks auto-converted to `SubagentStop` events
- Hooks only active while subagent is running
- Cleaned up when subagent finishes

**Skills Preloading:**

- Full skill content injected at startup
- Skills NOT inherited from parent
- Must list explicitly in frontmatter
- Different from `context: fork` in skills

**File Locations & Precedence:**

1. `--agents` CLI flag (highest, session-only)
2. `.claude/agents/` (project scope)
3. `~/.claude/agents/` (user scope)
4. Plugin `agents/` (lowest, plugin scope)

**CLI JSON Format:**

```json
{
  "agent-name": {
    "description": "When to use this agent",
    "prompt": "System prompt (equivalent to markdown body)",
    "tools": ["Read", "Grep"],
    "model": "sonnet"
  }
}
```text
**Execution Modes:**

- **Foreground**: Blocking, interactive prompts
- **Background**: Concurrent, pre-approved permissions, no MCP tools
- Ctrl+B to background running task

**Context Management:**

- Fresh context per invocation (unless resumed)
- Resume via agent ID preserves full history
- Transcripts: `~/.claude/projects/{project}/{sessionId}/subagents/agent-{agentId}.jsonl`
- Auto-compaction at ~95% capacity (configurable)
- Independent from main conversation compaction

**Limitations:**

- Cannot spawn other subagents
- Background agents: no MCP tools, no AskUserQuestion
- Skills not inherited (must specify explicitly)

---

## Category 8: Commands/Prompts (DEPRECATED)

**Official Documentation:**

- Commands have been merged into Skills (see Category 2)
- Legacy `.claude/commands/` structure is deprecated

### ✅ Current Rules

(None - commands are now part of Skills)

### ➕ Missing Rules (Add - Deprecation Warnings)

| Rule ID                         | Severity | Description                        | Official Requirement                                 |
| ------------------------------- | -------- | ---------------------------------- | ---------------------------------------------------- |
| `commands-deprecated-directory` | warning  | Using deprecated .claude/commands/ | "Custom slash commands have been merged into skills" |
| `commands-migrate-to-skills`    | info     | Suggest migration path             | Direct users to migrate commands/ to skills/         |
| `commands-in-plugin-deprecated` | warning  | Using commands/ in plugin          | Use skills/ directory instead                        |

### 📝 Notes

**Migration Path:**

- Old: `.claude/commands/my-command.md` → Invoked as `/my-command`
- New: `.claude/skills/my-command/SKILL.md` → Invoked as skill or `/my-command`

**Key Differences:**

- Commands were simple slash commands
- Skills support:
  - Frontmatter configuration
  - `disable-model-invocation` for command-like behavior
  - Progressive disclosure with reference files
  - Tool restrictions
  - Model selection
  - Hooks
  - Context forking to subagents

**Backward Compatibility:**

- Commands in `.claude/commands/` may still work
- But should migrate to skills for full feature support
- Plugin commands should use `skills/` not `commands/`

**Migration Steps:**

1. Create `skills/command-name/` directory
2. Move command content to `SKILL.md`
3. Add frontmatter with `disable-model-invocation: true` for command-like behavior
4. Remove old command file from `commands/`

**Example Migration:**

Old structure:

```text
.claude/commands/review.md
```text
New structure:

```text
.claude/skills/review/SKILL.md
```text
With frontmatter:

```yaml
---
name: review
description: Review code for quality and best practices
disable-model-invocation: true
---
Review the current changes...
```text
---

## Category 9: LSP Servers

**Official Documentation:**

- <https://code.claude.com/docs/en/plugins-reference#lsp-servers>
- <https://microsoft.github.io/language-server-protocol/>

### ✅ Current Rules

(None currently - not yet implemented)

### ➕ Missing Rules (Add - Schema Validation)

| Rule ID                                 | Severity | Description                           | Official Requirement                                     |
| --------------------------------------- | -------- | ------------------------------------- | -------------------------------------------------------- |
| `lsp-invalid-root-field`                | error    | Unknown root-level field in .lsp.json | Only language server names allowed as keys               |
| `lsp-missing-command`                   | error    | Missing command field                 | "Required field"                                         |
| `lsp-missing-extension-to-language`     | error    | Missing extensionToLanguage field     | "Required field"                                         |
| `lsp-command-not-string`                | error    | command not string                    | Must be string (executable path)                         |
| `lsp-extension-to-language-not-object`  | error    | extensionToLanguage not object        | Must be object mapping extensions to languages           |
| `lsp-extension-invalid-format`          | error    | File extension doesn't start with dot | Extensions must start with "." (e.g., ".go")             |
| `lsp-language-not-string`               | error    | Language identifier not string        | Must be string                                           |
| `lsp-args-not-array`                    | error    | args not array                        | Must be array of strings                                 |
| `lsp-transport-invalid`                 | error    | Invalid transport value               | Must be "stdio" or "socket"                              |
| `lsp-env-not-object`                    | error    | env not object                        | Must be object with string values                        |
| `lsp-initialization-options-not-object` | error    | initializationOptions not object      | Must be object                                           |
| `lsp-settings-not-object`               | error    | settings not object                   | Must be object                                           |
| `lsp-workspace-folder-not-string`       | error    | workspaceFolder not string            | Must be valid path string                                |
| `lsp-startup-timeout-invalid`           | error    | startupTimeout not positive number    | Must be positive number (milliseconds)                   |
| `lsp-shutdown-timeout-invalid`          | error    | shutdownTimeout not positive number   | Must be positive number (milliseconds)                   |
| `lsp-restart-on-crash-not-boolean`      | error    | restartOnCrash not boolean            | Must be true or false                                    |
| `lsp-max-restarts-invalid`              | error    | maxRestarts not positive number       | Must be positive integer                                 |
| `lsp-binary-not-in-path`                | warning  | LSP binary not found in PATH          | "You must install the language server binary separately" |
| `lsp-plugin-location-wrong`             | error    | .lsp.json inside .claude-plugin/      | Must be at plugin root, not in .claude-plugin/           |
| `lsp-inline-conflicts-with-file`        | warning  | Both inline lspServers and .lsp.json  | Choose one or the other                                  |
| `lsp-unknown-language-id`               | info     | Unknown language identifier           | Suggest common language IDs                              |
| `lsp-socket-transport-deprecated`       | warning  | Socket transport rarely needed        | "stdio is the default and works for most servers"        |

### 📝 Notes

**LSP Configuration Schema:**

```json
{
  "language-name": {
    "command": "string (required, executable name or path)",
    "extensionToLanguage": {
      ".ext": "language-id"
    },
    "args": ["array of strings (optional)"],
    "transport": "stdio | socket (optional, default: stdio)",
    "env": {
      "VAR_NAME": "value"
    },
    "initializationOptions": {},
    "settings": {},
    "workspaceFolder": "string (optional)",
    "startupTimeout": "number (optional, milliseconds)",
    "shutdownTimeout": "number (optional, milliseconds)",
    "restartOnCrash": "boolean (optional)",
    "maxRestarts": "number (optional)"
  }
}
```text
**Required Fields:**

- `command`: The LSP binary to execute (must be in PATH or absolute path)
- `extensionToLanguage`: Maps file extensions (e.g., ".py") to language IDs (e.g., "python")

**Transport Types:**

- `stdio`: Standard input/output communication (default, most common)
- `socket`: Socket-based communication (rarely needed)

**Common Language Identifiers:**

- `python`: Python files
- `javascript`: JavaScript files
- `typescript`: TypeScript files
- `go`: Go files
- `rust`: Rust files
- `java`: Java files
- `cpp`: C++ files
- `c`: C files
- See LSP spec for full list

**File Locations:**

- Standalone: `.lsp.json` at project root
- Plugin: `.lsp.json` at plugin root (NOT in .claude-plugin/)
- Plugin inline: `lspServers` field in plugin.json

**Official LSP Plugins Available:**

- `pyright-lsp`: Python (requires: `pip install pyright` or `npm install -g pyright`)
- `typescript-lsp`: TypeScript/JavaScript (requires: `npm install -g typescript-language-server typescript`)
- `rust-lsp`: Rust (requires: rust-analyzer installation)

**Important Notes:**

- LSP plugins configure the connection, they DON'T include the language server binary
- Users must install the language server separately (e.g., `npm install -g typescript-language-server`)
- Error "Executable not found in $PATH" means the binary is not installed
- Claude Code uses LSP 3.17 specification
- Communication uses JSON-RPC format

**LSP Features Provided:**

- Instant diagnostics (errors/warnings after edits)
- Go to definition
- Find references
- Hover information
- Code completion
- Symbol navigation
- Code actions/refactoring

**Environment Variables:**

- `${CLAUDE_PLUGIN_ROOT}`: Available in plugin LSP configs
- PATH must include the LSP binary location

**Validation Priorities:**

1. Check required fields present
2. Validate command executable exists (warn if missing)
3. Check extensionToLanguage maps valid extensions
4. Validate optional field types
5. Warn about common misconfigurations

---

## Category 10: Output Styles

**Official Documentation:**

- <https://code.claude.com/docs/en/output-styles>

### ✅ Current Rules

(None currently - not yet implemented)

### ➕ Missing Rules (Add - Frontmatter & File Validation)

| Rule ID                                  | Severity | Description                          | Official Requirement                                        |
| ---------------------------------------- | -------- | ------------------------------------ | ----------------------------------------------------------- |
| `output-style-missing-frontmatter`       | error    | Missing YAML frontmatter             | Output styles must have frontmatter                         |
| `output-style-invalid-frontmatter-field` | error    | Unknown frontmatter field            | Only name, description, keep-coding-instructions allowed    |
| `output-style-name-invalid-type`         | error    | name not string                      | Must be string                                              |
| `output-style-description-invalid-type`  | error    | description not string               | Must be string                                              |
| `output-style-keep-coding-invalid-type`  | error    | keep-coding-instructions not boolean | Must be true or false                                       |
| `output-style-missing-body`              | warning  | Missing markdown body                | Should have custom instructions after frontmatter           |
| `output-style-empty-body`                | warning  | Empty markdown body                  | Custom instructions should be non-empty                     |
| `output-style-name-too-long`             | warning  | Name too long                        | Keep names concise for UI display                           |
| `output-style-description-empty`         | warning  | Empty description                    | Description helps users understand the style                |
| `output-style-invalid-file-extension`    | error    | File not .md                         | Output styles must be markdown files                        |
| `output-style-invalid-location`          | error    | Output style in wrong directory      | Must be in .claude/output-styles or ~/.claude/output-styles |
| `output-style-plugin-location-wrong`     | error    | Plugin output style not at root      | Must be at plugin root in outputStyles/ directory           |

### 📝 Notes

**Output Style File Format:**

```markdown
---
name: My Custom Style
description: A brief description for the UI
keep-coding-instructions: false
---

# Custom Style Instructions

You are an interactive CLI tool...
[Your custom instructions here]
```text
**Frontmatter Fields:**

- `name`: Display name (optional, defaults to filename)
- `description`: Brief description shown in `/output-style` menu (optional)
- `keep-coding-instructions`: Keep software engineering instructions (optional, default: false)

**Built-in Output Styles:**

- **Default**: Standard software engineering system prompt
- **Explanatory**: Educational mode with "Insights" for learning
- **Learning**: Interactive mode with TODO(human) markers

**File Locations:**

- User level: `~/.claude/output-styles/`
- Project level: `.claude/output-styles/`
- Plugin level: `outputStyles/` at plugin root

**How Output Styles Work:**

1. Directly modify Claude Code's system prompt
2. Remove efficient output instructions (conciseness, etc.)
3. Remove coding instructions (unless keep-coding-instructions: true)
4. Add custom instructions from markdown body
5. Trigger reminders during conversation to adhere to style

**Configuration:**

- Set via `/output-style` command (interactive menu)
- Set via `/output-style [style-name]` (direct switch)
- Saved to `.claude/settings.local.json` in `outputStyle` field
- Can edit settings file directly

**Scope:**

- Applied at local project level by default
- Can configure at any settings level (user/project/local)

**Comparisons:**

- **vs. CLAUDE.md**: CLAUDE.md adds user message after system prompt, doesn't modify prompt
- **vs. --append-system-prompt**: Appends to system prompt, doesn't replace parts
- **vs. Agents**: Agents are for specific tasks with different models/tools, output styles affect main loop
- **vs. Skills**: Skills are task-specific, output styles are always active once selected

**Validation Priorities:**

1. Check file is markdown (.md)
2. Verify frontmatter present and valid YAML
3. Validate only documented fields used
4. Check field types
5. Warn if body is empty/missing
6. Verify file in correct location

---

## Summary Statistics

- **Categories completed:** 10/10
- **Current rules (need verification):** 12
- **Missing rules identified:** 207
- **Total rules after implementation:** 219

## Breakdown by Category

| Category              | Current Rules | Missing Rules | Total   |
| --------------------- | ------------- | ------------- | ------- |
| CLAUDE.md             | 4             | 6             | 10      |
| Skills                | 11            | 20            | 31      |
| Settings              | 3             | 32            | 35      |
| Hooks                 | 3             | 26            | 29      |
| MCP Servers           | 3             | 28            | 31      |
| Plugins               | 3             | 33            | 36      |
| Agents                | 0             | 25            | 25      |
| Commands (deprecated) | 0             | 3             | 3       |
| LSP Servers           | 0             | 22            | 22      |
| Output Styles         | 0             | 12            | 12      |
| **TOTAL**             | **12**        | **207**       | **219** |

---

## Notes

- Size limits (35KB/40KB) confirmed real despite not being in main docs
- Skills have two separate validation concerns: shell scripts (existing) and SKILL.md frontmatter (missing)
- Import syntax `@path` is officially documented and working
- `.claude/rules/*.md` frontmatter with `paths` field is official feature
````
