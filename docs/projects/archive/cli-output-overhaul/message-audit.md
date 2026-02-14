# Message Audit

**Reference for**: Phase 2 (Message Content Cleanup)
**Scope**: 170 messages across 116 rules
**Verdict breakdown**: 96 Good (56%), 54 Needs Shortening (32%), 20 Needs Rewrite (12%)

---

## Authoring Guidelines

Every message should follow these rules:

1. **State the problem, not the solution** -- no "Add...", "Use...", "Consider..."
2. **No rationale** -- no "so that...", "to prevent...", "which means..."
3. **No examples** -- no "e.g.,", "for example", "such as"
4. **No data dumps** -- no listing all valid keys/tools/events inline
5. **Under 80 characters** -- ideally 40-60 chars
6. **Start with the issue** -- not a prefix like "Skill" or "CLAUDE.md"

Fix instructions go in the `fix` field. Rationale goes in `meta.docs.details`. Examples go in `meta.docs.examples`. Data dumps go in `meta.docs.howToFix`.

---

## Legend

- **GOOD** -- No changes needed
- **SHORTEN** -- Remove fix instructions / rationale / examples / data dumps
- **REWRITE** -- Fundamentally restructure the message

---

## Agents (12 rules, 2 to update)

| Rule | Verdict | Current | Proposed |
|------|---------|---------|----------|
| agent-body-too-short | SHORTEN | "Agent body content is very short (N characters). Consider adding more detailed instructions. (minimum: M)" | `Body too short (N/M characters)` |
| agent-description | GOOD | Zod pass-through | -- |
| agent-disallowed-tools | GOOD | Zod pass-through | -- |
| agent-hooks | GOOD | Zod pass-through | -- |
| agent-hooks-invalid-schema | GOOD | No messages (delegated) | -- |
| agent-missing-system-prompt | SHORTEN | 'Agent should include a "System Prompt" section with detailed instructions.' | `Missing "System Prompt" section` |
| agent-model | GOOD | Zod pass-through | -- |
| agent-name | GOOD | Zod pass-through | -- |
| agent-name-directory-mismatch | GOOD | 'Agent name "X" does not match directory name "Y"' | -- |
| agent-skills | GOOD | Zod pass-through | -- |
| agent-skills-not-found | GOOD | "Referenced skill not found: X" | -- |
| agent-tools | GOOD | Zod pass-through | -- |

## Claude-MD (16 rules, 5 to update)

| Rule | Verdict | Current | Proposed |
|------|---------|---------|----------|
| claude-md-content-too-many-sections | REWRITE | "CLAUDE.md has N sections (>M is hard to navigate). Consider organizing content into separate files in .claude/rules/ directory. For example: .claude/rules/git.md, .claude/rules/api.md..." (~220 chars) | `Too many sections (N, max M)` |
| claude-md-file-not-found | GOOD | "File not found: X" | -- |
| claude-md-file-reference-invalid | GOOD | 'File reference "X" does not exist' | -- |
| claude-md-filename-case-sensitive | SHORTEN | 'Case-sensitive filename collision detected: "X" and "Y" differ only in case. This may cause issues on case-insensitive filesystems (macOS, Windows).' | `Case collision: "X" vs "Y"` |
| claude-md-glob-pattern-backslash | SHORTEN | "Path pattern uses backslashes: X. Use forward slashes even on Windows." | `Path pattern uses backslashes: X` |
| claude-md-glob-pattern-too-broad | SHORTEN | "Path pattern is very broad: X. Consider being more specific." | `Overly broad path pattern: X` |
| claude-md-import-circular | GOOD | "Circular import detected: X" | -- |
| claude-md-import-depth-exceeded | SHORTEN | "Import depth exceeds maximum of N. Possible circular import." | `Import depth exceeds maximum (N)` |
| claude-md-import-in-code-block | REWRITE | "Import statement found inside code block: X. Imports in code blocks are not processed by Claude Code. Move the import outside of the code block." (~140 chars) | `Import inside code block: X` |
| claude-md-import-missing | GOOD | "Imported file not found: X" (already shortened in pre-project work) | -- |
| claude-md-import-read-failed | GOOD | "Failed to read imported file: X" | -- |
| claude-md-npm-script-not-found | GOOD | 'npm script "X" is referenced but does not exist in package.json' | -- |
| claude-md-paths | GOOD | Various short messages | -- |
| claude-md-rules-circular-symlink | GOOD | "Circular symlink detected: X" | -- |
| claude-md-size-error | GOOD | "File exceeds NKB limit (M bytes)" | -- |
| claude-md-size-warning | GOOD | "File approaching size limit (N bytes)" | -- |

## Commands (2 rules, 2 to update)

| Rule | Verdict | Current | Proposed |
|------|---------|---------|----------|
| commands-deprecated-directory | REWRITE | "Commands directory (.claude/commands) is deprecated. Please migrate to Skills (.claude/skills). Skills provide better structure, versioning, and documentation. See: URL" (~200 chars) | `Commands directory is deprecated` |
| commands-migrate-to-skills | REWRITE | "To migrate: 1) Create skill directories in .claude/skills/... 2) Move command scripts... 3) Add SKILL.md... 4) Update plugin.json..." (~250 chars) | `Commands not yet migrated to skills` |

## Hooks (3 rules, 3 to update)

| Rule | Verdict | Current | Proposed |
|------|---------|---------|----------|
| hooks-invalid-config (type msg) | SHORTEN | "Invalid hook type: X. Must be one of: command, prompt, agent" | `Invalid hook type: X` |
| hooks-invalid-config (timeout msg) | SHORTEN | "Invalid timeout value: X. Must be positive" | `Invalid timeout: X` |
| hooks-invalid-event | SHORTEN | "Unknown hook event: X. Valid events: PreToolUse, PostToolUse, ..." | `Unknown hook event: X` |
| hooks-missing-script | GOOD | "Hook script not found: X" | -- |

## LSP (6 rules, 5 to update)

| Rule | Verdict | Current | Proposed |
|------|---------|---------|----------|
| lsp-command-not-in-path | SHORTEN | 'LSP server "X" command "Y" should be in PATH or use absolute path.' | `Command "Y" not found for server "X"` |
| lsp-extension-missing-dot | SHORTEN | 'Extension "X" in server "Y" must start with a dot (e.g., ".ts").' | `Extension "X" missing leading dot` |
| lsp-invalid-transport | SHORTEN | 'Invalid transport type "X" for server "Y". Must be "stdio" or "socket".' | `Invalid transport "X" for server "Y"` |
| lsp-language-id-empty | GOOD | 'Language ID for extension "X" cannot be empty' | -- |
| lsp-language-id-not-lowercase | SHORTEN | 'Language ID "X" for extension "Y" in server "Z" should be lowercase.' | `Language ID "X" is not lowercase` |
| lsp-server-name-too-short | REWRITE | 'LSP server name "X" is too short (N characters). Use descriptive names like "typescript-language-server". (minimum: M)' (~130 chars) | `Server name too short (N/M characters): "X"` |

## MCP (11 rules, 4 to update)

| Rule | Verdict | Current | Proposed |
|------|---------|---------|----------|
| mcp-http-empty-url | GOOD | "HTTP transport URL cannot be empty" | -- |
| mcp-http-invalid-url | GOOD | "Invalid URL in HTTP transport: X" | -- |
| mcp-invalid-env-var (name msg) | SHORTEN | 'Environment variable name "X" does not match pattern: REGEX' | `Invalid environment variable name: "X"` |
| mcp-invalid-env-var (expansion msg) | SHORTEN | "Simple variable expansion $X. Consider using ${X} format." | `Unbraced variable expansion: $X` |
| mcp-invalid-transport | SHORTEN | "Invalid MCP transport type: X. Must be one of: stdio, sse, http, websocket" | `Invalid transport type: X` |
| mcp-sse-transport-deprecated | SHORTEN | "SSE transport is deprecated. Consider using HTTP or WebSocket transport instead." | `SSE transport is deprecated` |
| mcp-sse-empty-url | GOOD | "SSE transport URL cannot be empty" | -- |
| mcp-sse-invalid-url | GOOD | "Invalid URL in SSE transport: X" | -- |
| mcp-stdio-empty-command | GOOD | "stdio transport command cannot be empty" | -- |
| mcp-websocket-empty-url | GOOD | "WebSocket transport URL cannot be empty" | -- |
| mcp-websocket-invalid-protocol | GOOD | "WebSocket URL should use ws:// or wss://" | -- |
| mcp-websocket-invalid-url | GOOD | "Invalid URL in WebSocket transport: X" | -- |

## Output Styles (3 rules, 2 to update)

| Rule | Verdict | Current | Proposed |
|------|---------|---------|----------|
| output-style-body-too-short | SHORTEN | "Output style body content is very short (N characters). Consider adding more examples. (minimum: M)" | `Body too short (N/M characters)` |
| output-style-missing-guidelines | SHORTEN | 'Output style should include a "Guidelines" or "Format" section.' | `Missing "Guidelines" or "Format" section` |
| output-style-name-directory-mismatch | GOOD | 'Name "X" does not match directory name "Y"' | -- |

## Plugin (13 rules, 4 to update)

| Rule | Verdict | Current | Proposed |
|------|---------|---------|----------|
| plugin-commands-deprecated | REWRITE | '"commands" field in plugin.json is deprecated. Please migrate to "skills" instead. Skills provide better structure...' (~155 chars) | `"commands" field is deprecated` |
| plugin-components-wrong-location | GOOD | "X directory should be in .claude/X, not .claude-plugin/X" | -- |
| plugin-description-required | GOOD | "Plugin description is required" | -- |
| plugin-hook-missing-plugin-root | SHORTEN | 'Plugin hooks path should use ${CLAUDE_PLUGIN_ROOT}: X' | `Hooks path missing ${CLAUDE_PLUGIN_ROOT}: X` |
| plugin-invalid-manifest | GOOD | Various structured messages | -- |
| plugin-invalid-version | SHORTEN | 'Invalid semantic version: X. Must follow semver format (e.g., 1.0.0, 2.1.3-beta)' | `Invalid semantic version: "X"` |
| plugin-json-wrong-location | GOOD | "plugin.json must be at .claude-plugin/plugin.json" | -- |
| plugin-marketplace-files-not-found | GOOD | "Icon/Screenshot/Readme/Changelog file not found: X" | -- |
| plugin-missing-component-paths | SHORTEN | 'Plugin X path "Y" should start with "./"' | `X path missing "./" prefix: "Y"` |
| plugin-missing-file | GOOD | "Referenced X path not found: Y" | -- |
| plugin-name-required | GOOD | "Plugin name is required" | -- |
| plugin-version-required | GOOD | "Plugin version is required" | -- |

## Settings (5 rules, 4 to update)

| Rule | Verdict | Current | Proposed |
|------|---------|---------|----------|
| settings-file-path-not-found | GOOD | "X file not found: Y" | -- |
| settings-invalid-env-var (name) | SHORTEN | "Environment variable name should be uppercase with underscores: X" | `Non-standard env var name: X` |
| settings-invalid-env-var (secret) | SHORTEN | "Possible hardcoded secret in environment variable: X. Consider using variable expansion." | `Possible hardcoded secret: X` |
| settings-invalid-permission | REWRITE | 'Invalid tool name in permissions.X: "Y". Valid tools: Bash, Read, Write, Edit, Glob, Grep, WebFetch, WebSearch, ..., or mcp__* for MCP servers' (~150+ chars) | `Invalid tool name: "Y"` |
| settings-permission-empty-pattern | SHORTEN | 'Empty inline pattern in permissions.X: "Y". Use "Z" instead of "Y"' | `Empty inline pattern in permissions.X: "Y"` |
| settings-permission-invalid-rule | GOOD | 'Invalid syntax in permissions.X: "Y". ERROR' | -- |

## Skills (46 rules, 41 to update)

This is the largest category. Only the rules needing changes are listed.

| Rule | Verdict | Current (abbreviated) | Proposed |
|------|---------|----------------------|----------|
| skill-allowed-tools-not-used | SHORTEN | 'Tool "X" is listed in allowed-tools but never referenced in the skill body. Remove unused tools or add usage instructions.' | `Unused tool in allowed-tools: "X"` |
| skill-arguments-without-hint | SHORTEN | "Skill uses $ARGUMENTS or positional parameters but is missing argument-hint in frontmatter" | `Uses $ARGUMENTS but missing argument-hint` |
| skill-body-long-code-block | SHORTEN | "Code block is N lines (max M). Move long code examples to the references/ directory." | `Code block too long (N/M lines)` |
| skill-body-missing-usage-section | SHORTEN | 'SKILL.md body lacks a "## Usage" section. Add a usage section to help users understand...' | `Missing "## Usage" section` |
| skill-body-too-long | REWRITE | "SKILL.md body is very long (N lines). Consider moving detailed documentation to references/ for progressive disclosure." | `Body too long (N lines)` |
| skill-body-word-count | SHORTEN | "SKILL.md body is N words (max: M). Move detailed content to reference files for progressive disclosure." | `Body too long (N/M words)` |
| skill-dangerous-command | SHORTEN | 'Dangerous command detected in "X": MSG. This command could cause data loss or system damage.' | `Dangerous command in "X": MSG` |
| skill-deep-nesting | SHORTEN | "Skill directory has N levels of nesting (>M is hard to navigate). Consider flattening..." | `Nesting too deep (N/M levels)` |
| skill-description-max-length | SHORTEN | "Skill description is N characters (max: M). Shorten the description for better readability in skill listings." | `Description too long (N/M characters)` |
| skill-description-missing-trigger | REWRITE | 'Skill description should include trigger phrases (e.g., "Use when...", "Use for...") so the model knows when to load the skill' | `Description missing trigger phrases` |
| skill-description-quality (verb) | SHORTEN | 'Description should start with an action verb (e.g., "Validate", "Generate", "Run"). Found: "X"' | `Should start with action verb, found: "X"` |
| skill-description-quality (brief) | REWRITE | "Description is too brief (N words). Include what the skill does and what domain/technology it targets (at least M words)." | `Description too brief (N/M words)` |
| skill-eval-usage (shell) | SHORTEN | 'Shell script "X" uses "eval" command. Avoid eval as it can execute arbitrary code and poses security risks.' | `"eval" used in "X"` |
| skill-eval-usage (python) | SHORTEN | 'Python script "X" uses eval() or exec(). These functions can execute arbitrary code and pose security risks.' | `eval()/exec() used in "X"` |
| skill-frontmatter-unknown-keys | SHORTEN | 'Unknown frontmatter key "X". Valid keys: agent, allowed-tools, argument-hint, ..., version' | `Unknown frontmatter key: "X"` |
| skill-hardcoded-secrets | SHORTEN | "Hardcoded secret detected: X. Use environment variables instead." | `Hardcoded secret: X` |
| skill-mcp-tool-qualified-name | REWRITE | 'Tool "X" is not a recognized built-in tool. If this is an MCP tool, use the qualified format: mcp__server__tool' | `Unrecognized tool: "X"` |
| skill-missing-comments | REWRITE | 'Shell script "X" has N lines but no explanatory comments. Add comments to explain what the script does.' | `No comments in "X" (N lines)` |
| skill-missing-examples | SHORTEN | "SKILL.md lacks usage examples. Add code blocks or an 'Example' section to help users..." | `Missing usage examples` |
| skill-missing-shebang | SHORTEN | 'Shell script "X" lacks shebang line. Add "#!/bin/bash" or "#!/usr/bin/env bash" as the first line.' | `Missing shebang in "X"` |
| skill-multi-script-missing-readme | REWRITE | "Skill has N scripts but no README.md. Complex skills should include a README with setup and usage instructions. (threshold: M)" | `N scripts but no README.md` |
| skill-naming-inconsistent | SHORTEN | "Inconsistent file naming conventions detected: X. Choose one naming convention (kebab-case recommended)..." | `Inconsistent naming: X` |
| skill-overly-generic-name (verb) | REWRITE | 'Skill name "X" is too generic (single-word verb). Use descriptive names like "X-files" or "X-config"...' | `Name "X" is too generic` |
| skill-overly-generic-name (general) | REWRITE | 'Skill name "X" is too generic. Use descriptive names that indicate specific functionality (e.g., ...)' | `Name "X" is too generic` |
| skill-path-traversal | SHORTEN | 'Potential path traversal detected in "X" (../ or ..\\). Ensure file paths are properly validated...' | `Path traversal in "X"` |
| skill-readme-forbidden | SHORTEN | "Skills must use SKILL.md, not README.md. Remove README.md from the skill directory." | `README.md found; skills must use SKILL.md` |
| skill-reference-not-linked | SHORTEN | 'File reference `X` should be a markdown link. Use [X](./X) instead.' | `File reference \`X\` not linked` |
| skill-shell-script-hardcoded-paths | SHORTEN | 'Hardcoded path "X" reduces portability. Use environment variables ($HOME, $PWD) or relative paths instead.' | `Hardcoded path: "X"` |
| skill-shell-script-no-error-handling | SHORTEN | 'Shell script "X" lacks error handling. Add "set -euo pipefail" near the top of the script...' | `Missing error handling in "X"` |
| skill-side-effects-without-disable-model | SHORTEN | "Skill has side-effect tools in allowed-tools but disable-model-invocation is not set to true" | `Side-effect tools without disable-model-invocation` |
| skill-time-sensitive-content | REWRITE | 'Time-sensitive content detected: "X". Avoid using specific dates or time references that become outdated. Use relative terms...' | `Time-sensitive content: "X"` |
| skill-too-many-files | REWRITE | "Skill directory has N files at root level (>M is hard to maintain). Consider organizing scripts into subdirectories like: bin/, lib/, tests/" | `Too many root files (N/M)` |
| skill-unknown-string-substitution | SHORTEN | "Unknown string substitution: X. Valid substitutions: $ARGUMENTS, $0-$9, ${VARIABLE}" | `Unknown string substitution: X` |
| skill-xml-tags-anywhere | REWRITE | 'XML tag <X> found in SKILL.md. XML tags can cause prompt injection since Claude interprets them as structural delimiters. Remove the tag or move it inside a code block.' | `XML tag <X> outside code block` |

### Skills rules with GOOD messages (no changes needed)

skill-agent, skill-allowed-tools, skill-context, skill-cross-reference-invalid, skill-dangerous-command (pattern msgs), skill-dependencies, skill-description (Zod), skill-disallowed-tools, skill-missing-changelog, skill-missing-version, skill-model, skill-name (Zod), skill-name-directory-mismatch, skill-referenced-file-not-found, skill-tags, skill-version

## Zod Schema Messages (refinements.ts, 2 to update)

| Message | Verdict | Current | Proposed |
|---------|---------|---------|----------|
| Third person check | SHORTEN | 'Must be written in third person (avoid "I" and "you")' | `Must be written in third person` |
| Semver check | SHORTEN | 'Must be valid semantic version (e.g., 1.0.0, 2.1.3-beta)' | `Invalid semantic version format` |

All other Zod messages (15+) are already GOOD.
