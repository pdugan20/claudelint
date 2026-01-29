# Rule Index

This directory contains documentation for all 66 claudelint rules.

## Rules by Category


### Agents (10 rules)

- [agent-description](./agents/agent-description.md) - Agent description must be at least 10 characters, written in third person, with no XML tags
- [agent-disallowed-tools](./agents/agent-disallowed-tools.md) - Agent disallowed-tools must be an array of tool names
- [agent-events](./agents/agent-events.md) - Agent events must be an array with maximum 3 event names
- [agent-hooks](./agents/agent-hooks.md) - Agent hooks must be an array of valid hook objects
- [agent-hooks-invalid-schema](./agents/agent-hooks-invalid-schema.md) - Hook configuration in agents.json violates schema requirements
- [agent-model](./agents/agent-model.md) - Agent model must be one of: sonnet, opus, haiku, inherit
- [agent-name](./agents/agent-name.md) - Agent name must be lowercase-with-hyphens, under 64 characters, with no XML tags
- [agent-skills](./agents/agent-skills.md) - Agent skills must be an array of skill names
- [agent-skills-not-found](./agents/agent-skills-not-found.md) - Referenced skill does not exist in .claude/skills directory
- [agent-tools](./agents/agent-tools.md) - Agent tools must be an array of tool names, cannot be used with disallowed-tools

### CLAUDE.md (11 rules)

- [claude-md-content-too-many-sections](./claude-md/claude-md-content-too-many-sections.md) - CLAUDE.md has too many sections making it hard to navigate
- [claude-md-filename-case-sensitive](./claude-md/claude-md-filename-case-sensitive.md) - Filename differs only in case from another file, causing conflicts on case-insensitive filesystems
- [claude-md-glob-pattern-backslash](./claude-md/claude-md-glob-pattern-backslash.md) - Path pattern uses backslashes instead of forward slashes
- [claude-md-glob-pattern-too-broad](./claude-md/claude-md-glob-pattern-too-broad.md) - Path pattern is overly broad
- [claude-md-import-circular](./claude-md/claude-md-import-circular.md) - Circular import detected between Claude.md files
- [claude-md-import-in-code-block](./claude-md/claude-md-import-in-code-block.md) - Import statement found inside code block
- [claude-md-import-missing](./claude-md/claude-md-import-missing.md) - Imported file does not exist
- [claude-md-paths](./claude-md/claude-md-paths.md) - Claude MD paths must be a non-empty array with at least one path pattern
- [claude-md-rules-circular-symlink](./claude-md/claude-md-rules-circular-symlink.md) - Circular symlink detected in .claude directory
- [claude-md-size-error](./claude-md/claude-md-size-error.md) - CLAUDE.md exceeds maximum file size limit
- [claude-md-size-warning](./claude-md/claude-md-size-warning.md) - CLAUDE.md file is approaching size limit

### Commands (2 rules)

- [commands-deprecated-directory](./commands/commands-deprecated-directory.md) - Commands directory is deprecated, migrate to Skills
- [commands-migrate-to-skills](./commands/commands-migrate-to-skills.md) - Migration guidance for deprecated Commands

### Hooks (3 rules)

- [hooks-invalid-config](./hooks/hooks-invalid-config.md) - Hook configuration must be valid
- [hooks-invalid-event](./hooks/hooks-invalid-event.md) - Hook events must be valid event names
- [hooks-missing-script](./hooks/hooks-missing-script.md) - Hook scripts must reference existing files

### MCP (3 rules)

- [mcp-invalid-env-var](./mcp/mcp-invalid-env-var.md) - Environment variables must use proper expansion syntax
- [mcp-invalid-server](./mcp/mcp-invalid-server.md) - MCP server names must be unique
- [mcp-invalid-transport](./mcp/mcp-invalid-transport.md) - MCP transport type must be one of the supported values

### OutputStyles (3 rules)

- [output-style-description](./output-styles/output-style-description.md) - Output style description must be at least 10 characters, written in third person, with no XML tags
- [output-style-examples](./output-styles/output-style-examples.md) - Output style examples must be an array of strings
- [output-style-name](./output-styles/output-style-name.md) - Output style name must be lowercase-with-hyphens, under 64 characters, with no XML tags

### Plugin (6 rules)

- [commands-in-plugin-deprecated](./plugin/commands-in-plugin-deprecated.md) - The commands field in plugin.json is deprecated
- [plugin-circular-dependency](./plugin/plugin-circular-dependency.md) - Plugin must not have circular dependencies
- [plugin-dependency-invalid-version](./plugin/plugin-dependency-invalid-version.md) - Plugin dependency versions must use valid semver ranges
- [plugin-invalid-manifest](./plugin/plugin-invalid-manifest.md) - marketplace.json must be valid and reference existing files
- [plugin-invalid-version](./plugin/plugin-invalid-version.md) - Plugin version must follow semantic versioning format
- [plugin-missing-file](./plugin/plugin-missing-file.md) - Files referenced in plugin.json must exist

### Settings (4 rules)

- [settings-invalid-env-var](./settings/settings-invalid-env-var.md) - Environment variables must follow naming conventions
- [settings-invalid-permission](./settings/settings-invalid-permission.md) - Permission rules must use valid action values
- [settings-permission-empty-pattern](./settings/settings-permission-empty-pattern.md) - Tool(pattern) syntax should not have empty patterns
- [settings-permission-invalid-rule](./settings/settings-permission-invalid-rule.md) - Permission rules must use valid Tool(pattern) syntax

### Skills (24 rules)

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
- [skill-name](./skills/skill-name.md) - Skill name must be lowercase-with-hyphens, under 64 characters, with no XML tags or reserved words
- [skill-naming-inconsistent](./skills/skill-naming-inconsistent.md) - Skill has inconsistent file naming conventions
- [skill-path-traversal](./skills/skill-path-traversal.md) - Potential path traversal pattern detected
- [skill-tags](./skills/skill-tags.md) - Skill tags must be an array of strings
- [skill-time-sensitive-content](./skills/skill-time-sensitive-content.md) - SKILL.md should avoid time-sensitive references
- [skill-too-many-files](./skills/skill-too-many-files.md) - Skill directory has too many files at root level
- [skill-version](./skills/skill-version.md) - Skill version must follow semantic versioning format (e.g., 1.0.0)

## Legend

- [FIXABLE] - Rule supports auto-fixing with `--fix`
- [DEPRECATED] - Rule is deprecated and may be removed in future versions

## Statistics

- **Total Rules**: 66
- **Fixable Rules**: 3
- **Deprecated Rules**: 0

## Categories

- [Agents](./agents/) - 10 rules
- [CLAUDE.md](./claude-md/) - 11 rules
- [Commands](./commands/) - 2 rules
- [Hooks](./hooks/) - 3 rules
- [MCP](./mcp/) - 3 rules
- [OutputStyles](./output-styles/) - 3 rules
- [Plugin](./plugin/) - 6 rules
- [Settings](./settings/) - 4 rules
- [Skills](./skills/) - 24 rules
