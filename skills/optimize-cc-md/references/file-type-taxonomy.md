# Claude Code File Type Taxonomy

Complete reference for all configuration files in the Claude Code ecosystem. Use this to understand what each file does, where it lives, and how files relate to each other.

## Core Configuration

### CLAUDE.md (Project Instructions)

| Property | Value |
|----------|-------|
| **Location** | Project root, `.claude/CLAUDE.md`, `~/.claude/CLAUDE.md` |
| **Format** | Markdown with optional `@import` directives |
| **Purpose** | Project instructions and conventions for Claude |
| **Validated by** | `claudelint check-claude-md` |

**Precedence** (highest to lowest):

1. `.claude/CLAUDE.md` (project-level, most specific)
2. `CLAUDE.md` (project root)
3. `~/.claude/CLAUDE.md` (user-level, applies to all projects)

**Key features:**

- `@import` directives to include other files
- Glob-scoped rules via `.claude/rules/*.md` with frontmatter
- Size limits: 30KB warning, 50KB error (including imports)

### .claude/settings.json (Permissions & Config)

| Property | Value |
|----------|-------|
| **Location** | `.claude/settings.json` (shared), `.claude/settings.local.json` (personal) |
| **Format** | JSON |
| **Purpose** | Permissions, environment variables, hooks, MCP servers |
| **Validated by** | `claudelint check-settings` |

**Key sections:**

- `permissions` - Tool access rules (allow/deny patterns)
- `env` - Environment variables passed to Claude
- `hooks` - Event-triggered scripts
- `mcpServers` - MCP server configuration (alternative to .mcp.json)

### .mcp.json (MCP Server Configuration)

| Property | Value |
|----------|-------|
| **Location** | Project root |
| **Format** | JSON |
| **Purpose** | Model Context Protocol server definitions |
| **Validated by** | `claudelint check-mcp` |

**Server types:** stdio, sse, http, websocket

## Skills

### SKILL.md (Skill Definition)

| Property | Value |
|----------|-------|
| **Location** | `.claude/skills/<name>/SKILL.md` or `skills/<name>/SKILL.md` |
| **Format** | Markdown with YAML frontmatter |
| **Purpose** | Define reusable skill with instructions for Claude |
| **Validated by** | `claudelint validate-skills` |

**Required frontmatter:** `name`, `description`
**Optional frontmatter:** `version`, `tags`, `dependencies`, `allowed-tools`, `model`, `context`, `agent`

**Progressive disclosure hierarchy:**

1. YAML frontmatter (metadata only)
2. SKILL.md body (core instructions, under 500 lines)
3. `references/` directory (detailed content, templates, examples)

### Skill Reference Files

| Property | Value |
|----------|-------|
| **Location** | `<skill-dir>/references/*.md` |
| **Format** | Markdown |
| **Purpose** | Detailed supporting content for progressive disclosure |
| **Validated by** | Referenced via `skill-referenced-file-not-found` rule |

## Agents

### AGENT.md (Agent Definition)

| Property | Value |
|----------|-------|
| **Location** | `.claude/agents/<name>/AGENT.md` or `agents/<name>/AGENT.md` |
| **Format** | Markdown with YAML frontmatter |
| **Purpose** | Define autonomous agent with system prompt and tool access |
| **Validated by** | `claudelint check-agents` |

**Required frontmatter:** `name`, `description`
**Optional frontmatter:** `model`, `tools`, `skills`, `hooks`

## Output Styles

### OUTPUT_STYLE.md (Output Style Definition)

| Property | Value |
|----------|-------|
| **Location** | `.claude/output_styles/<name>/OUTPUT_STYLE.md` |
| **Format** | Markdown with YAML frontmatter |
| **Purpose** | Custom output formatting rules for Claude responses |
| **Validated by** | `claudelint check-output-styles` |

## Plugin

### plugin.json (Plugin Manifest)

| Property | Value |
|----------|-------|
| **Location** | Project root |
| **Format** | JSON |
| **Purpose** | Declare plugin components for Claude Code plugin system |
| **Validated by** | `claudelint check-plugin` |

**Declares:** skills, agents, hooks, commands, MCP servers

### Commands (Deprecated)

| Property | Value |
|----------|-------|
| **Location** | `.claude/commands/<name>.md` (deprecated) |
| **Format** | Markdown |
| **Purpose** | Legacy slash commands (migrate to skills) |
| **Validated by** | `claudelint check-commands` |

## Rules Files

### .claude/rules/*.md (Scoped Rules)

| Property | Value |
|----------|-------|
| **Location** | `.claude/rules/` |
| **Format** | Markdown with optional glob frontmatter |
| **Purpose** | Project-specific rules imported via `@import` in CLAUDE.md |
| **Validated by** | Part of `claudelint check-claude-md` |

**Frontmatter example:**

```yaml
---
glob: "**/*.{ts,tsx}"
---
```

Rules with glob frontmatter only apply when Claude is working on matching files.

## Configuration

### .claudelintrc.json (Linter Config)

| Property | Value |
|----------|-------|
| **Location** | Project root |
| **Format** | JSON |
| **Purpose** | Configure claudelint rule severity and options |
| **Validated by** | Self-validating |

**Example:**

```json
{
  "rules": {
    "skill-body-too-long": ["warn", { "maxLines": 600 }],
    "skill-missing-changelog": "off"
  }
}
```

## File Relationships

```text
CLAUDE.md
├── @import ──> .claude/rules/*.md (scoped rules)
├── references ──> .claude/settings.json (permissions, hooks)
└── references ──> .mcp.json (MCP servers)

plugin.json
├── declares ──> skills/*/SKILL.md
├── declares ──> agents/*/AGENT.md
├── declares ──> hooks (in settings or plugin)
└── declares ──> commands (deprecated)

SKILL.md
├── links ──> references/*.md (supporting content)
├── cross-refs ──> ../other-skill/SKILL.md (See Also)
└── declares ──> allowed-tools, dependencies

.claude/settings.json
├── configures ──> permissions (tool access)
├── configures ──> hooks (event triggers)
├── configures ──> env (environment variables)
└── alternative to ──> .mcp.json (MCP servers)
```

## Discovery Order

When Claude Code starts a session, it discovers configuration in this order:

1. `~/.claude/CLAUDE.md` (user global)
2. `CLAUDE.md` or `.claude/CLAUDE.md` (project)
3. `.claude/settings.json` (permissions and hooks)
4. `.mcp.json` or settings MCP section (MCP servers)
5. `plugin.json` (plugin components)
6. `.claude/skills/*/SKILL.md` and `skills/*/SKILL.md` (skills)
7. `.claude/agents/*/AGENT.md` and `agents/*/AGENT.md` (agents)
8. `.claude/output_styles/*/OUTPUT_STYLE.md` (output styles)
