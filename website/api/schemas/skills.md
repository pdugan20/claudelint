---
description: "Schema reference for SKILL.md YAML frontmatter fields, types, and constraints."
---

# SKILL.md Frontmatter

<SchemaRef
  validator="Skills" validator-link="/validators/skills"
  docs="Skills frontmatter reference" docs-link="https://code.claude.com/docs/en/skills#frontmatter-reference"
/>

Skills are defined as `SKILL.md` files in skill directories. The YAML frontmatter controls the skill's behavior, visibility, and tool access.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Lowercase with hyphens, max 64 chars, no reserved words (`anthropic`, `claude`) |
| `description` | string | yes | Min 10 chars, third-person voice |
| `argument-hint` | string | no | Hint text for skill arguments |
| `disable-model-invocation` | boolean | no | Prevent model from invoking this skill |
| `user-invocable` | boolean | no | Whether users can invoke directly via `/skill-name` |
| `version` | string | no | Semantic version (e.g., `1.0.0`) |
| `model` | string | no | `sonnet`, `opus`, `haiku`, or `inherit` ([valid values](/api/schemas#model-names)) |
| `context` | string | no | `fork`, `inline`, or `auto` ([valid values](/api/schemas#context-modes)) |
| `agent` | string | no | Agent name (required when `context: fork`) |
| `allowed-tools` | string[] | no | [Tool names](/api/schemas#tool-names) to allow |
| `disallowed-tools` | string[] | no | [Tool names](/api/schemas#tool-names) to disallow |
| `tags` | string[] | no | Categorization tags |
| `dependencies` | string[] | no | Required skill dependencies |
| `hooks` | object | no | [Hooks configuration](/api/schemas/hooks) |
| `license` | string | no | License identifier |
| `compatibility` | string | no | Compatibility notes, max 500 chars |
| `metadata` | object | no | Arbitrary key-value metadata |

**Cross-field validations:**

- When `context` is `fork`, the `agent` field is required
- `allowed-tools` and `disallowed-tools` are mutually exclusive

## Example

```yaml
---
name: deploy-staging
description: Deploys the current branch to the staging environment using the project's CI pipeline.
user-invocable: true
version: 1.0.0
model: sonnet
allowed-tools:
  - Bash
  - Read
tags:
  - deployment
  - ci
---
```
