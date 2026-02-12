# Rules Reference

claudelint includes 120 validation rules across 10 categories. Each rule has detailed documentation with examples.

## Featured Rules

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin: 16px 0;">

<RuleCard
  rule-id="claude-md-size-error"
  description="CLAUDE.md exceeds the maximum allowed size"
  severity="error"
  category="CLAUDE.md"
  link="/rules/claude-md/claude-md-size-error"
/>

<RuleCard
  rule-id="skill-name"
  description="Skill must have a name in frontmatter"
  severity="error"
  category="Skills"
  link="/rules/skills/skill-name"
/>

<RuleCard
  rule-id="skill-dangerous-command"
  description="Skill contains potentially dangerous commands"
  severity="error"
  category="Skills"
  link="/rules/skills/skill-dangerous-command"
/>

<RuleCard
  rule-id="mcp-invalid-server"
  description="MCP server configuration is invalid"
  severity="error"
  category="MCP"
  link="/rules/mcp/mcp-invalid-server"
/>

<RuleCard
  rule-id="skill-missing-shebang"
  description="Shell script missing shebang line"
  severity="warning"
  category="Skills"
  link="/rules/skills/skill-missing-shebang"
  :fixable="true"
/>

<RuleCard
  rule-id="plugin-invalid-manifest"
  description="Plugin manifest has structural errors"
  severity="error"
  category="Plugin"
  link="/rules/plugin/plugin-invalid-manifest"
/>

</div>

Browse the sidebar for the complete list of rules organized by category.

## By Category

- **CLAUDE.md** (16 rules) - File size, imports, paths, content
- **Skills** (46 rules) - Names, descriptions, security, versioning
- **MCP** (13 rules) - Server config, URLs, transport types
- **Plugin** (12 rules) - Manifest, components, versioning
- **Agents** (12 rules) - Names, descriptions, tools, models
- **LSP** (8 rules) - Transport, language IDs, extensions
- **Settings** (5 rules) - Permissions, environment variables
- **Hooks** (3 rules) - Event types, script references
- **Output Styles** (3 rules) - Name validation
- **Commands** (2 rules) - Migration checks

## Severity Levels

- **error** - Must be fixed. Causes non-zero exit code.
- **warning** - Should be fixed. Does not affect exit code.
- **info** - Informational suggestion.

## Auto-fixable Rules

Some rules support automatic fixing:

```bash
claudelint check-all --fix
```
