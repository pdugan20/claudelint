---
description: Browse all claudelint validation rules by category, understand severity levels, learn about auto-fixable rules, and see how progressive disclosure output works.
---

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

## Understanding Output

claudelint uses a three-tier progressive disclosure model. Each tier shows more detail:

| Tier | Command | What you see |
|------|---------|--------------|
| 1 (Default) | `claudelint check-all` | Problem statement + rule ID in a table |
| 2 (Explain) | `claudelint check-all --explain` | Why: and Fix: lines under each issue |
| 3 (Full docs) | `claudelint explain <rule-id>` | Complete documentation, examples, metadata |

**Tier 1** keeps output scannable. Messages are short problem statements (under 100 characters) without fix instructions or rationale.

**Tier 2** adds context. The `Why:` line explains consequences (from `docs.rationale`) and the `Fix:` line shows how to resolve it (from the `fix` field or `docs.howToFix`).

**Tier 3** shows the full rule page: summary, detailed explanation, incorrect/correct examples, metadata, and related rules.

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
