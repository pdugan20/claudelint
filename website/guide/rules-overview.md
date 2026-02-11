# Rules Overview

claudelint includes 120 validation rules across 10 categories.

## Rule Categories

| Category | Rules | Description |
|----------|-------|-------------|
| Skills | 46 | Skill naming, security, versioning, structure |
| CLAUDE.md | 16 | File size, imports, paths, content |
| MCP | 13 | Server config, URLs, transport types |
| Plugin | 12 | Manifest, components, versioning |
| Agents | 12 | Names, descriptions, tools, models |
| LSP | 8 | Transport, language IDs, extensions |
| Settings | 5 | Permissions, environment variables |
| Hooks | 3 | Event types, script references |
| Output Styles | 3 | Name validation |
| Commands | 2 | Migration checks |

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
