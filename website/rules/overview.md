# Rules Reference

claudelint includes <RuleCount category="total" /> validation rules across <RuleCount category="categories" /> categories. Each rule has detailed documentation with examples.

## Featured Rules

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin: 16px 0;">

<RuleCard
  rule-id="claude-md-size"
  description="CLAUDE.md exceeds the maximum allowed size (40KB default)"
  severity="warning"
  category="CLAUDE.md"
  link="/rules/claude-md/claude-md-size"
  :configurable="true"
/>

<RuleCard
  rule-id="skill-dangerous-command"
  description="Skill contains potentially dangerous commands"
  severity="error"
  category="Skills"
  link="/rules/skills/skill-dangerous-command"
/>

<RuleCard
  rule-id="mcp-invalid-transport"
  description="Unknown or invalid MCP transport type"
  severity="error"
  category="MCP"
  link="/rules/mcp/mcp-invalid-transport"
/>

<RuleCard
  rule-id="agent-body-too-short"
  description="Agent system prompt should have meaningful content"
  severity="warning"
  category="Agents"
  link="/rules/agents/agent-body-too-short"
/>

<RuleCard
  rule-id="plugin-invalid-manifest"
  description="Plugin manifest has structural errors"
  severity="error"
  category="Plugin"
  link="/rules/plugin/plugin-invalid-manifest"
/>

<RuleCard
  rule-id="skill-missing-shebang"
  description="Shell script missing shebang line"
  severity="warning"
  category="Skills"
  link="/rules/skills/skill-missing-shebang"
  :fixable="true"
/>

</div>

Browse the sidebar for the complete list of rules organized by category.

## By Category

- [**CLAUDE.md**](/validators/claude-md) (<RuleCount category="claude-md" /> rules) - File size, imports, paths, content
- [**Skills**](/validators/skills) (<RuleCount category="skills" /> rules) - Names, descriptions, security, versioning
- [**MCP**](/validators/mcp) (<RuleCount category="mcp" /> rules) - Server config, URLs, transport types
- [**Plugin**](/validators/plugin) (<RuleCount category="plugin" /> rules) - Manifest, components, versioning
- [**Agents**](/validators/agents) (<RuleCount category="agents" /> rules) - Names, descriptions, tools, models
- [**LSP**](/validators/lsp) (<RuleCount category="lsp" /> rules) - Transport, language IDs, extensions
- [**Settings**](/validators/settings) (<RuleCount category="settings" /> rules) - Permissions, environment variables
- [**Hooks**](/validators/hooks) (<RuleCount category="hooks" /> rules) - Event types, script references
- [**Output Styles**](/validators/output-styles) (<RuleCount category="output-styles" /> rules) - Name validation
- [**Commands**](/validators/commands) (<RuleCount category="commands" /> rules) - Migration checks

## Severity Levels

- **error** - Must be fixed. Causes non-zero exit code.
- **warning** - Should be fixed. Does not affect exit code.
- **info** - Informational suggestion.

## Auto-fixable Rules

Some rules support automatic fixing:

```bash
claudelint check-all --fix
```

## See Also

- [Validators Overview](/validators/overview) - How validators work
- [Configuration](/guide/configuration) - Customize rule severity
- [CLI Reference](/guide/cli-reference) - All CLI commands and flags
