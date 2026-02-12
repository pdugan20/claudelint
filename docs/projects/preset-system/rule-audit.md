# Preset System — Rule Audit

**Last Updated**: 2026-02-11
**Status**: Not Started

This document records the recommended/not-recommended decision for every rule, along with rationale. Completed during Phase 1 of the [tracker](./tracker.md).

---

## Criteria

A rule is **recommended** if it meets ALL of these:

1. **Correctness-focused**: Catches real bugs, broken configs, missing files, or security issues
2. **Low false-positive rate**: Does not fire on valid, working configurations
3. **Stable**: Rule behavior won't change semantically between minor versions
4. **Broadly applicable**: Relevant to most Claude Code projects, not just niche setups

A rule is **not recommended** if ANY of these apply:

- Style/convention preference (naming, length limits, formatting)
- Requires project-specific context to be useful
- Has known false-positive edge cases that can't be resolved
- Newly added and not yet proven stable (must have shipped in at least one prior release)

---

## Severity Overrides

Rules in the recommended preset may have their severity adjusted from the source definition. Document overrides here:

| Rule ID | Source Severity | Recommended Severity | Rationale |
|---------|:-:|:-:|-----------|
| _(to be filled during audit)_ | | | |

---

## CLAUDE.md Rules (16)

| Rule ID | Recommended? | Rationale |
|---------|:---:|-----------|
| `claude-md-content-too-many-sections` | | |
| `claude-md-file-not-found` | | |
| `claude-md-file-reference-invalid` | | |
| `claude-md-filename-case-sensitive` | | |
| `claude-md-glob-pattern-backslash` | | |
| `claude-md-glob-pattern-too-broad` | | |
| `claude-md-import-circular` | | |
| `claude-md-import-depth-exceeded` | | |
| `claude-md-import-in-code-block` | | |
| `claude-md-import-missing` | | |
| `claude-md-import-read-failed` | | |
| `claude-md-npm-script-not-found` | | |
| `claude-md-paths` | | |
| `claude-md-rules-circular-symlink` | | |
| `claude-md-size-error` | | |
| `claude-md-size-warning` | | |

---

## Skills Rules (46)

| Rule ID | Recommended? | Rationale |
|---------|:---:|-----------|
| `skill-agent` | | |
| `skill-allowed-tools` | | |
| `skill-allowed-tools-not-used` | | |
| `skill-arguments-without-hint` | | |
| `skill-body-long-code-block` | | |
| `skill-body-missing-usage-section` | | |
| `skill-body-too-long` | | |
| `skill-body-word-count` | | |
| `skill-context` | | |
| `skill-cross-reference-invalid` | | |
| `skill-dangerous-command` | | |
| `skill-deep-nesting` | | |
| `skill-dependencies` | | |
| `skill-description` | | |
| `skill-description-max-length` | | |
| `skill-description-missing-trigger` | | |
| `skill-description-quality` | | |
| `skill-disallowed-tools` | | |
| `skill-eval-usage` | | |
| `skill-frontmatter-unknown-keys` | | |
| `skill-hardcoded-secrets` | | |
| `skill-mcp-tool-qualified-name` | | |
| `skill-missing-changelog` | | |
| `skill-missing-comments` | | |
| `skill-missing-examples` | | |
| `skill-missing-shebang` | | |
| `skill-missing-version` | | |
| `skill-model` | | |
| `skill-multi-script-missing-readme` | | |
| `skill-name` | | |
| `skill-name-directory-mismatch` | | |
| `skill-naming-inconsistent` | | |
| `skill-overly-generic-name` | | |
| `skill-path-traversal` | | |
| `skill-readme-forbidden` | | |
| `skill-reference-not-linked` | | |
| `skill-referenced-file-not-found` | | |
| `skill-shell-script-hardcoded-paths` | | |
| `skill-shell-script-no-error-handling` | | |
| `skill-side-effects-without-disable-model` | | |
| `skill-tags` | | |
| `skill-time-sensitive-content` | | |
| `skill-too-many-files` | | |
| `skill-unknown-string-substitution` | | |
| `skill-version` | | |
| `skill-xml-tags-anywhere` | | |

---

## Settings Rules (5)

| Rule ID | Recommended? | Rationale |
|---------|:---:|-----------|
| `settings-denied-tool-in-allowed` | | |
| `settings-duplicate-tool-entries` | | |
| `settings-invalid-mcp-scope` | | |
| `settings-invalid-permission` | | |
| `settings-unknown-permission-key` | | |

---

## Hooks Rules (3)

| Rule ID | Recommended? | Rationale |
|---------|:---:|-----------|
| `hooks-invalid-event-name` | | |
| `hooks-invalid-matcher` | | |
| `hooks-missing-command` | | |

---

## MCP Rules (13)

| Rule ID | Recommended? | Rationale |
|---------|:---:|-----------|
| `mcp-args-type` | | |
| `mcp-command-missing` | | |
| `mcp-duplicate-server-names` | | |
| `mcp-empty-args` | | |
| `mcp-env-contains-secret` | | |
| `mcp-env-type` | | |
| `mcp-missing-env` | | |
| `mcp-scope-key` | | |
| `mcp-server-has-name` | | |
| `mcp-server-type` | | |
| `mcp-shell-injection` | | |
| `mcp-url-format` | | |
| `mcp-url-localhost-only` | | |

---

## Plugin Rules (12)

| Rule ID | Recommended? | Rationale |
|---------|:---:|-----------|
| `plugin-agent-file-not-found` | | |
| `plugin-agent-invalid` | | |
| `plugin-command-file-not-found` | | |
| `plugin-command-invalid` | | |
| `plugin-duplicate-components` | | |
| `plugin-hook-file-not-found` | | |
| `plugin-hook-invalid` | | |
| `plugin-invalid-manifest` | | |
| `plugin-missing-manifest` | | |
| `plugin-missing-readme` | | |
| `plugin-skill-file-not-found` | | |
| `plugin-skill-invalid` | | |

---

## Commands Rules (2)

| Rule ID | Recommended? | Rationale |
|---------|:---:|-----------|
| `commands-invalid-frontmatter` | | |
| `commands-missing-description` | | |

---

## Agents Rules (12)

| Rule ID | Recommended? | Rationale |
|---------|:---:|-----------|
| `agent-body-too-short` | | |
| `agent-color-invalid` | | |
| `agent-description` | | |
| `agent-disallowed-tools` | | |
| `agent-duplicate-tools` | | |
| `agent-file-reference-not-found` | | |
| `agent-frontmatter-unknown-keys` | | |
| `agent-missing-body` | | |
| `agent-missing-description` | | |
| `agent-model-invalid` | | |
| `agent-name` | | |
| `agent-tool-format` | | |

---

## Output Styles Rules (3)

| Rule ID | Recommended? | Rationale |
|---------|:---:|-----------|
| `output-style-frontmatter-schema` | | |
| `output-style-missing-body` | | |
| `output-style-name` | | |

---

## LSP Rules (8)

| Rule ID | Recommended? | Rationale |
|---------|:---:|-----------|
| `lsp-diagnostics-range` | | |
| `lsp-handler-method` | | |
| `lsp-handler-params` | | |
| `lsp-initialize-capabilities` | | |
| `lsp-lifecycle-order` | | |
| `lsp-message-format` | | |
| `lsp-notification-no-response` | | |
| `lsp-response-id-match` | | |

---

## Audit Statistics

Updated after audit completion.

- **Total rules**: 120
- **Recommended**: _TBD_
- **Not recommended**: _TBD_
- **Severity overrides**: _TBD_
- **Target range**: 60-80 recommended (50-65%)
