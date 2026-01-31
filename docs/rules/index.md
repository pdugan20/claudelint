# Rule Index

This directory contains documentation for all 105 claude-code-lint rules.

## Rules by Category

### Agents (13 rules)

- [agent-body-too-short](./agents/agent-body-too-short.md) - Agent body content should meet minimum length requirements
- [agent-description](./agents/agent-description.md) - Agent description must be at least 10 characters, written in third person, with no XML tags
- [agent-disallowed-tools](./agents/agent-disallowed-tools.md) - Agent disallowed-tools must be an array of tool names
- [agent-events](./agents/agent-events.md) - Agent events must be an array of event names (max 3 items)
- [agent-hooks](./agents/agent-hooks.md) - Agent hooks must be an array of valid hook objects
- [agent-hooks-invalid-schema](./agents/agent-hooks-invalid-schema.md) - Hook configuration in agents.json violates schema requirements
- [agent-missing-system-prompt](./agents/agent-missing-system-prompt.md) - Agent should include a "System Prompt" section
- [agent-model](./agents/agent-model.md) - Agent model must be one of: sonnet, opus, haiku, inherit
- [agent-name](./agents/agent-name.md) - Agent name must be lowercase-with-hyphens, under 64 characters, with no XML tags
- [agent-name-directory-mismatch](./agents/agent-name-directory-mismatch.md) - Agent name must match parent directory name
- [agent-skills](./agents/agent-skills.md) - Agent skills must be an array of skill names
- [agent-skills-not-found](./agents/agent-skills-not-found.md) - Referenced skill does not exist in .claude/skills directory
- [agent-tools](./agents/agent-tools.md) - Agent tools must be an array of tool names, cannot be used with disallowed-tools

### CLAUDE.md (14 rules)

- [claude-md-content-too-many-sections](./claude-md/claude-md-content-too-many-sections.md) - CLAUDE.md has too many sections making it hard to navigate
- [claude-md-file-not-found](./claude-md/claude-md-file-not-found.md) - Specified CLAUDE.md file path does not exist
- [claude-md-filename-case-sensitive](./claude-md/claude-md-filename-case-sensitive.md) - Filename differs only in case from another file, causing conflicts on case-insensitive filesystems
- [claude-md-glob-pattern-backslash](./claude-md/claude-md-glob-pattern-backslash.md) - Path pattern uses backslashes instead of forward slashes
- [claude-md-glob-pattern-too-broad](./claude-md/claude-md-glob-pattern-too-broad.md) - Path pattern is overly broad
- [claude-md-import-circular](./claude-md/claude-md-import-circular.md) - Circular import detected between Claude.md files
- [claude-md-import-depth-exceeded](./claude-md/claude-md-import-depth-exceeded.md) - Import depth exceeds maximum, possible circular import
- [claude-md-import-in-code-block](./claude-md/claude-md-import-in-code-block.md) - Import statement found inside code block
- [claude-md-import-missing](./claude-md/claude-md-import-missing.md) - Imported file does not exist
- [claude-md-import-read-failed](./claude-md/claude-md-import-read-failed.md) - Failed to read imported file
- [claude-md-paths](./claude-md/claude-md-paths.md) - Claude MD paths must be a non-empty array with at least one path pattern
- [claude-md-rules-circular-symlink](./claude-md/claude-md-rules-circular-symlink.md) - Circular symlink detected in import path
- [claude-md-size-error](./claude-md/claude-md-size-error.md) - CLAUDE.md exceeds maximum file size limit
- [claude-md-size-warning](./claude-md/claude-md-size-warning.md) - CLAUDE.md file is approaching size limit

### Commands (2 rules)

- [commands-deprecated-directory](./commands/commands-deprecated-directory.md) - Commands directory is deprecated, migrate to Skills
- [commands-migrate-to-skills](./commands/commands-migrate-to-skills.md) - Migration guidance for deprecated Commands

### Hooks (3 rules)

- [hooks-invalid-config](./hooks/hooks-invalid-config.md) - Hook configuration must be valid
- [hooks-invalid-event](./hooks/hooks-invalid-event.md) - Hook events must be valid event names
- [hooks-missing-script](./hooks/hooks-missing-script.md) - Hook scripts must reference existing files

### LSP (8 rules)

- [lsp-command-not-in-path](./lsp/lsp-command-not-in-path.md) - LSP server commands should be in PATH or use absolute paths
- [lsp-config-file-not-json](./lsp/lsp-config-file-not-json.md) - LSP configFile should end with .json extension
- [lsp-config-file-relative-path](./lsp/lsp-config-file-relative-path.md) - LSP configFile should use absolute or explicit relative paths
- [lsp-extension-missing-dot](./lsp/lsp-extension-missing-dot.md) - LSP extension mappings must start with a dot
- [lsp-invalid-transport](./lsp/lsp-invalid-transport.md) - LSP transport type must be "stdio" or "socket"
- [lsp-language-id-empty](./lsp/lsp-language-id-empty.md) - LSP language IDs cannot be empty
- [lsp-language-id-not-lowercase](./lsp/lsp-language-id-not-lowercase.md) - LSP language IDs should be lowercase
- [lsp-server-name-too-short](./lsp/lsp-server-name-too-short.md) - LSP server names should be descriptive

### MCP (13 rules)

- [mcp-http-empty-url](./mcp/mcp-http-empty-url.md) - MCP HTTP transport URL cannot be empty
- [mcp-http-invalid-url](./mcp/mcp-http-invalid-url.md) - MCP HTTP transport URL must be valid
- [mcp-invalid-env-var](./mcp/mcp-invalid-env-var.md) - Environment variables must use proper expansion syntax
- [mcp-invalid-server](./mcp/mcp-invalid-server.md) - MCP server names must be unique
- [mcp-invalid-transport](./mcp/mcp-invalid-transport.md) - MCP transport type must be one of the supported values
- [mcp-server-key-mismatch](./mcp/mcp-server-key-mismatch.md) - Server key should match server name property
- [mcp-sse-empty-url](./mcp/mcp-sse-empty-url.md) - MCP SSE transport URL cannot be empty
- [mcp-sse-invalid-url](./mcp/mcp-sse-invalid-url.md) - MCP SSE transport URL must be valid
- [mcp-sse-transport-deprecated](./mcp/mcp-sse-transport-deprecated.md) - SSE transport is deprecated, use HTTP or WebSocket instead
- [mcp-stdio-empty-command](./mcp/mcp-stdio-empty-command.md) - MCP stdio transport command cannot be empty
- [mcp-websocket-empty-url](./mcp/mcp-websocket-empty-url.md) - MCP WebSocket transport URL cannot be empty
- [mcp-websocket-invalid-protocol](./mcp/mcp-websocket-invalid-protocol.md) - WebSocket URLs should use ws:// or wss:// protocol
- [mcp-websocket-invalid-url](./mcp/mcp-websocket-invalid-url.md) - MCP WebSocket transport URL must be valid

### OutputStyles (7 rules)

- [output-style-body-too-short](./output-styles/output-style-body-too-short.md) - Output style body content should meet minimum length requirements
- [output-style-description](./output-styles/output-style-description.md) - Output style description must be at least 10 characters, written in third person, with no XML tags
- [output-style-examples](./output-styles/output-style-examples.md) - Output style examples must be an array of strings
- [output-style-missing-examples](./output-styles/output-style-missing-examples.md) - Output style should include an "Examples" section
- [output-style-missing-guidelines](./output-styles/output-style-missing-guidelines.md) - Output style should include a "Guidelines" or "Format" section
- [output-style-name](./output-styles/output-style-name.md) - Output style name must be lowercase-with-hyphens, under 64 characters, with no XML tags
- [output-style-name-directory-mismatch](./output-styles/output-style-name-directory-mismatch.md) - Output style name must match parent directory name

### Plugin (12 rules)

- [commands-in-plugin-deprecated](./plugin/commands-in-plugin-deprecated.md) - The commands field in plugin.json is deprecated
- [plugin-circular-dependency](./plugin/plugin-circular-dependency.md) - Plugin must not have circular dependencies
- [plugin-components-wrong-location](./plugin/plugin-components-wrong-location.md) - Plugin components should be in .claude/ not .claude-plugin/
- [plugin-dependency-invalid-version](./plugin/plugin-dependency-invalid-version.md) - Plugin dependency versions must use valid semver ranges
- [plugin-description-required](./plugin/plugin-description-required.md) - Plugin description is required and cannot be empty
- [plugin-invalid-manifest](./plugin/plugin-invalid-manifest.md) - marketplace.json must be valid and reference existing files
- [plugin-invalid-version](./plugin/plugin-invalid-version.md) - Plugin version must follow semantic versioning format
- [plugin-json-wrong-location](./plugin/plugin-json-wrong-location.md) - plugin.json should be at repository root, not inside .claude-plugin/
- [plugin-marketplace-files-not-found](./plugin/plugin-marketplace-files-not-found.md) - Referenced marketplace file does not exist
- [plugin-missing-file](./plugin/plugin-missing-file.md) - Files referenced in plugin.json must exist
- [plugin-name-required](./plugin/plugin-name-required.md) - Plugin name is required and cannot be empty
- [plugin-version-required](./plugin/plugin-version-required.md) - Plugin version is required and cannot be empty

### Settings (5 rules)

- [settings-file-path-not-found](./settings/settings-file-path-not-found.md) - Referenced file path does not exist
- [settings-invalid-env-var](./settings/settings-invalid-env-var.md) - Environment variables must follow naming conventions
- [settings-invalid-permission](./settings/settings-invalid-permission.md) - Permission rules must use valid action values
- [settings-permission-empty-pattern](./settings/settings-permission-empty-pattern.md) - Tool(pattern) syntax should not have empty patterns
- [settings-permission-invalid-rule](./settings/settings-permission-invalid-rule.md) - Permission rules must use valid Tool(pattern) syntax

### Skills (28 rules)

- [skill-agent](./skills/skill-agent.md) - When skill context is "fork", agent field is required to specify which agent to use
- [skill-allowed-tools](./skills/skill-allowed-tools.md) - Skill allowed-tools must be an array of tool names, cannot be used with disallowed-tools
- [skill-body-too-long](./skills/skill-body-too-long.md) - SKILL.md body should not exceed 500 lines
- [skill-context](./skills/skill-context.md) - Skill context must be one of: fork, inline, auto
- [skill-dangerous-command](./skills/skill-dangerous-command.md) - Skill script contains dangerous commands that could cause system damage
- [skill-deep-nesting](./skills/skill-deep-nesting.md) - Skill directory has excessive directory nesting
- [skill-dependencies](./skills/skill-dependencies.md) - Skill dependencies must be an array of strings
- [skill-description](./skills/skill-description.md) - Skill description must be at least 10 characters, written in third person, with no XML tags
- [skill-disallowed-tools](./skills/skill-disallowed-tools.md) - Skill disallowed-tools must be an array of tool names
- [skill-eval-usage](./skills/skill-eval-usage.md) - Script uses eval/exec which can execute arbitrary code
- [skill-large-reference-no-toc](./skills/skill-large-reference-no-toc.md) - Large SKILL.md files should include a table of contents
- [skill-missing-changelog](./skills/skill-missing-changelog.md) [FIXABLE] - Skill directory lacks CHANGELOG.md
- [skill-missing-comments](./skills/skill-missing-comments.md) - Shell script lacks explanatory comments
- [skill-missing-examples](./skills/skill-missing-examples.md) - SKILL.md lacks usage examples
- [skill-missing-shebang](./skills/skill-missing-shebang.md) [FIXABLE] - Shell script lacks shebang line
- [skill-missing-version](./skills/skill-missing-version.md) [FIXABLE] - Skill frontmatter lacks version field
- [skill-model](./skills/skill-model.md) - Skill model must be one of: sonnet, opus, haiku, inherit
- [skill-multi-script-missing-readme](./skills/skill-multi-script-missing-readme.md) - Skills with multiple scripts should include a README.md
- [skill-name](./skills/skill-name.md) - Skill name must be lowercase-with-hyphens, under 64 characters, with no XML tags or reserved words
- [skill-name-directory-mismatch](./skills/skill-name-directory-mismatch.md) - Skill name must match parent directory name
- [skill-naming-inconsistent](./skills/skill-naming-inconsistent.md) - Skill has inconsistent file naming conventions
- [skill-path-traversal](./skills/skill-path-traversal.md) - Potential path traversal pattern detected
- [skill-referenced-file-not-found](./skills/skill-referenced-file-not-found.md) - Referenced file in markdown link does not exist
- [skill-tags](./skills/skill-tags.md) - Skill tags must be an array of strings
- [skill-time-sensitive-content](./skills/skill-time-sensitive-content.md) - SKILL.md should avoid time-sensitive references
- [skill-too-many-files](./skills/skill-too-many-files.md) - Skill directory has too many files at root level
- [skill-unknown-string-substitution](./skills/skill-unknown-string-substitution.md) - Unknown string substitution pattern detected
- [skill-version](./skills/skill-version.md) - Skill version must follow semantic versioning format (e.g., 1.0.0)

## Legend

- [FIXABLE] - Rule supports auto-fixing with `--fix`
- [DEPRECATED] - Rule is deprecated and may be removed in future versions

## Statistics

- **Total Rules**: 105
- **Fixable Rules**: 3
- **Deprecated Rules**: 0

## Categories

- [Agents](./agents/) - 13 rules
- [CLAUDE.md](./claude-md/) - 14 rules
- [Commands](./commands/) - 2 rules
- [Hooks](./hooks/) - 3 rules
- [LSP](./lsp/) - 8 rules
- [MCP](./mcp/) - 13 rules
- [OutputStyles](./output-styles/) - 7 rules
- [Plugin](./plugin/) - 12 rules
- [Settings](./settings/) - 5 rules
- [Skills](./skills/) - 28 rules
