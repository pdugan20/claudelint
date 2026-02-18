---
description: "Schema reference for OUTPUTSTYLE.md YAML frontmatter fields."
---

# Output Style Frontmatter

<SchemaRef
  validator="Output Styles" validator-link="/validators/output-styles"
  docs="Output styles" docs-link="https://code.claude.com/docs/en/output-styles#frontmatter"
/>

Output styles are defined as `.md` files in `output-styles/` directories (e.g., `.claude/output-styles/concise/OUTPUTSTYLE.md`). The YAML frontmatter configures the style; the file body contains the style guidelines.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | no | Display name for the style |
| `description` | string | no | Description of the style |
| `keep-coding-instructions` | boolean | no | Preserve coding instructions in output |

## Example

```yaml
---
name: concise
description: Provides brief, direct responses without unnecessary explanation.
keep-coding-instructions: true
---
```
