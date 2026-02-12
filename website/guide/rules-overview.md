# Rules Overview

claudelint includes <RuleCount category="total" /> validation rules across <RuleCount category="categories" /> categories.

## Rule Categories

| Category | Rules | Description |
|----------|-------|-------------|
| Skills | <RuleCount category="skills" /> | Skill naming, security, versioning, structure |
| CLAUDE.md | <RuleCount category="claude-md" /> | File size, imports, paths, content |
| MCP | <RuleCount category="mcp" /> | Server config, URLs, transport types |
| Plugin | <RuleCount category="plugin" /> | Manifest, components, versioning |
| Agents | <RuleCount category="agents" /> | Names, descriptions, tools, models |
| LSP | <RuleCount category="lsp" /> | Transport, language IDs, extensions |
| Settings | <RuleCount category="settings" /> | Permissions, environment variables |
| Hooks | <RuleCount category="hooks" /> | Event types, script references |
| Output Styles | <RuleCount category="output-styles" /> | Name validation |
| Commands | <RuleCount category="commands" /> | Migration checks |

## Severity Levels

Rules can have three severity levels:

- <RuleBadge severity="error" /> Must be fixed. Causes non-zero exit code.
- <RuleBadge severity="warning" /> Should be fixed. Does not cause non-zero exit code.
- <RuleBadge severity="info" /> Informational. Suggestions for improvement.

## Auto-fixable Rules

Some rules support automatic fixing with the `--fix` flag:

```bash
claudelint check-all --fix
```

Auto-fixable rules include:

- `skill-missing-shebang` - Adds missing shebang line
- `skill-missing-version` - Adds version field to frontmatter
- `skill-missing-changelog` - Creates CHANGELOG.md

## Disabling Rules

### Per-project

In `.claudelintrc.json`:

```json
{
  "rules": {
    "skill-description": "off"
  }
}
```

### Inline

In CLAUDE.md or skill files:

```markdown
<!-- claudelint-disable skill-description -->
```
