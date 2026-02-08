# Skill Frontmatter Spec Comparison

**Last Updated:** 2026-02-06

Three-source comparison of recognized skill frontmatter fields.

---

## Field Matrix

| Field | code.claude.com | Skills Guide PDF | Our Schema | Our KNOWN_KEYS | Status |
|-------|:-:|:-:|:-:|:-:|--------|
| `name` | Optional | Required | Yes | Yes | OK |
| `description` | Recommended | Required | Yes | Yes | OK |
| `argument-hint` | Yes | - | Yes | **NO** | False positive |
| `disable-model-invocation` | Yes | - | Yes | **NO** | False positive |
| `user-invocable` | Yes | - | Yes | **NO** | False positive |
| `allowed-tools` | Yes | - | Yes | Yes | OK |
| `model` | Yes | - | Yes | Yes | OK |
| `context` | Yes | - | Yes | Yes | OK |
| `agent` | Yes | - | Yes | Yes | OK |
| `hooks` | Yes | - | Yes | **NO** | False positive |
| `license` | - | Yes | **NO** | **NO** | Missing from schema |
| `compatibility` | - | Yes (1-500 chars) | **NO** | **NO** | Missing from schema |
| `metadata` | - | Yes (key-value) | **NO** | **NO** | Missing from schema |
| `disallowed-tools` | - | - | Yes | **NO** | False positive (own extension) |
| `version` | - | Via metadata | Yes | Yes | Non-official top-level |
| `tags` | - | - | Yes | Yes | Non-official, Claude ignores |
| `dependencies` | - | - | Yes | Yes | Non-official, Claude ignores |

## Summary

- **5 official fields** produce false-positive "unknown key" warnings
- **3 official fields** missing from our schema entirely
- **3 non-official fields** accepted without warning

## Description Field Requirements

### code.claude.com

- Recommended (not required)
- "What the skill does and when to use it"
- If omitted, uses first paragraph of markdown content

### Skills Guide PDF (page 10-11)

- **Required**
- Must include BOTH what the skill does AND when to use it (trigger conditions)
- Under **1024 characters**
- No XML tags (< or >)
- Include specific tasks users might say
- Mention file types if relevant
- Structure: `[What it does] + [When to use it] + [Key capabilities]`

### Our linter

- Min 10 chars (OK)
- No XML tags (OK)
- Third-person enforcement (questionable - guide examples use mixed voice)
- Max 500 chars default (WRONG - should be 1024)

## Plugin Manifest Fields

All fields in our plugin.json are officially supported per code.claude.com/docs/en/plugins-reference:
`name`, `version`, `description`, `author` (name/email/url), `homepage`, `repository`, `license`, `keywords`

No changes needed to plugin manifest validation.
