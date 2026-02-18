---
description: "Schema reference for .claude/rules/*.md YAML frontmatter including path-scoping patterns."
---

# Rules File Frontmatter

<SchemaRef
  docs="Path-specific rules" docs-link="https://code.claude.com/docs/en/memory#path-specific-rules"
/>

Files in `.claude/rules/` can include frontmatter to scope rules to specific file paths:

```yaml
---
paths:
  - "src/**/*.ts"
  - "lib/**/*.js"
---
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `paths` | string[] | no | Glob patterns to scope the rule to (min 1 pattern if present) |

Without a `paths` field, the rule applies to all files in the project.
