---
description: 'Schema reference for SKILL.md YAML frontmatter fields, types, and constraints.'
---

# SKILL.md Frontmatter

<SchemaRef
  validator="Skills" validator-link="/validators/skills"
  docs="Skills frontmatter reference" docs-link="https://code.claude.com/docs/en/skills#frontmatter-reference"
/>

Skills are defined as `SKILL.md` files in skill directories. The YAML frontmatter controls the skill's behavior, visibility, and tool access.

All fields are optional. When omitted, `name` defaults to the directory name and `description` defaults to the first non-empty content line. An explicit description is recommended.

## Fields

| Field                      | Type               | Required | Description                                                                                                                            |
| -------------------------- | ------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                     | string             | no | Lowercase with hyphens, max 64 chars, no reserved words (`anthropic`, `claude`)                                                        |
| `description`              | string             | no | Min 10 chars, third-person voice                                                                                                       |
| `when_to_use`              | string             | no       | Additional context for when Claude should invoke the skill (trigger phrases, examples). Appended to `description` in the skill listing |
| `argument-hint`            | string             | no       | Hint text shown during autocomplete (e.g., `[issue-number]`)                                                                           |
| `arguments`                | string \| string[] | no       | Named positional arguments for `$name` substitution. Accepts a space-separated string or YAML list                                     |
| `disable-model-invocation` | boolean            | no       | Prevent model from invoking this skill                                                                                                 |
| `user-invocable`           | boolean            | no       | Whether users can invoke directly via `/skill-name`                                                                                    |
| `version`                  | string             | no       | Semantic version (e.g., `1.0.0`) (claudelint extension)                                                                                |
| `model`                    | string             | no       | Model alias, full model identifier, or `inherit`                                                     |
| `effort`                   | string             | no       | [Effort level](/api/schemas#effort-levels): `low`, `medium`, `high`, `xhigh`, or `max`                                                 |
| `context`                  | string             | no       | `fork` ([valid values](/api/schemas#context-modes))                                                                                    |
| `agent`                    | string             | no       | Which subagent type to use when `context: fork` is set                                                                                 |
| `allowed-tools`            | string \| string[] | no       | [Tool names](/api/schemas#tool-names) to allow. Accepts a space-separated string or YAML list                                          |
| `paths`                    | string \| string[] | no       | Glob patterns that limit when this skill is auto-activated. Accepts a comma-separated string or YAML list                              |
| `shell`                    | string             | no       | Shell to use for inline `` !`command` `` blocks: `bash` (default) or `powershell`                                                      |
| `tags`                     | string[]           | no       | Categorization tags (claudelint extension)                                                                                             |
| `hooks`                    | object             | no       | [Hooks configuration](/api/schemas/hooks)                                                                                              |
| `disallowed-tools` | string \| string[] | no | Tools removed from the available pool while the skill is active |
| `background` | boolean | no | With `context: fork`, run in the background (default: true) |
| `metadata` | object | no | Free-form metadata for other tooling |
| `license` | string | no | License for the skill |
| `compatibility` | string | no | Environment requirements, at most 500 characters |

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
