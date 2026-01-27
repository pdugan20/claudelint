# Rule Reference

Complete catalog of all claudelint validation rules.

## Overview

Claudelint includes 27 rules organized into 6 categories:

- **CLAUDE.md Rules** (4 rules) - Validate CLAUDE.md files and imports
- **Skills Rules** (11 rules) - Validate Claude Code skills
- **Settings Rules** (3 rules) - Validate settings.json configuration
- **Hooks Rules** (3 rules) - Validate hooks.json configuration
- **MCP Rules** (3 rules) - Validate MCP server configuration
- **Plugin Rules** (3 rules) - Validate plugin manifests

## Rule Severity

- **error** - Must be fixed (exit code 1)
- **warning** - Should be fixed (exit code 0 by default)

## Fixable Rules

Rules marked with can be automatically fixed using `claudelint check-all --fix`.

---

## CLAUDE.md Rules

Validation rules for CLAUDE.md files and import system.

| Rule ID                                           | Description                                   | Severity | Fixable |
| ------------------------------------------------- | --------------------------------------------- | -------- | ------- |
| [size-error](./claude-md/size-error.md)           | CLAUDE.md file exceeds 40KB limit             | error    | No      |
| [size-warning](./claude-md/size-warning.md)       | CLAUDE.md file exceeds 35KB warning threshold | warning  | No      |
| [import-missing](./claude-md/import-missing.md)   | Imported file does not exist                  | error    | No      |
| [import-circular](./claude-md/import-circular.md) | Circular import dependency detected           | error    | No      |

---

## Skills Rules

Validation rules for Claude Code skills (SKILL.md files and skill directories).

| Rule ID                                                            | Description                                   | Severity | Fixable |
| ------------------------------------------------------------------ | --------------------------------------------- | -------- | ------- |
| [skill-missing-shebang](./skills/skill-missing-shebang.md)         | Shell script missing shebang                  | error    | Yes     |
| [skill-missing-changelog](./skills/skill-missing-changelog.md)     | Skill missing CHANGELOG.md                    | warning  | Yes     |
| [skill-missing-version](./skills/skill-missing-version.md)         | SKILL.md missing version in frontmatter       | warning  | Yes     |
| [skill-missing-comments](./skills/skill-missing-comments.md)       | Shell script lacks sufficient comments        | warning  | No      |
| [skill-dangerous-command](./skills/skill-dangerous-command.md)     | Dangerous command detected (rm -rf, etc.)     | error    | No      |
| [skill-eval-usage](./skills/skill-eval-usage.md)                   | Use of eval or exec detected                  | warning  | No      |
| [skill-path-traversal](./skills/skill-path-traversal.md)           | Path traversal pattern detected               | warning  | No      |
| [skill-missing-examples](./skills/skill-missing-examples.md)       | SKILL.md missing usage examples               | warning  | No      |
| [skill-too-many-files](./skills/skill-too-many-files.md)           | Skill directory has too many files at root    | warning  | No      |
| [skill-deep-nesting](./skills/skill-deep-nesting.md)               | Skill directory nesting exceeds maximum depth | warning  | No      |
| [skill-naming-inconsistent](./skills/skill-naming-inconsistent.md) | Inconsistent file naming conventions          | warning  | No      |

---

## Settings Rules

Validation rules for settings.json configuration files.

| Rule ID                                                                  | Description                                   | Severity | Fixable |
| ------------------------------------------------------------------------ | --------------------------------------------- | -------- | ------- |
| [settings-invalid-schema](./settings/settings-invalid-schema.md)         | Settings file does not match schema           | error    | No      |
| [settings-invalid-permission](./settings/settings-invalid-permission.md) | Permission rule configuration is invalid      | error    | No      |
| [settings-invalid-env-var](./settings/settings-invalid-env-var.md)       | Environment variable name or value is invalid | warning  | No      |

---

## Hooks Rules

Validation rules for hooks.json configuration files.

| Rule ID                                                 | Description                              | Severity | Fixable |
| ------------------------------------------------------- | ---------------------------------------- | -------- | ------- |
| [hooks-invalid-event](./hooks/hooks-invalid-event.md)   | Hook event name is not recognized        | error    | No      |
| [hooks-missing-script](./hooks/hooks-missing-script.md) | Hook references non-existent script file | error    | No      |
| [hooks-invalid-config](./hooks/hooks-invalid-config.md) | Hook configuration is malformed          | error    | No      |

---

## MCP Rules

Validation rules for MCP (Model Context Protocol) server configurations.

| Rule ID                                                 | Description                                        | Severity | Fixable |
| ------------------------------------------------------- | -------------------------------------------------- | -------- | ------- |
| [mcp-invalid-server](./mcp/mcp-invalid-server.md)       | MCP server configuration is invalid                | error    | No      |
| [mcp-invalid-transport](./mcp/mcp-invalid-transport.md) | MCP transport configuration is invalid             | error    | No      |
| [mcp-invalid-env-var](./mcp/mcp-invalid-env-var.md)     | Environment variable usage or expansion is invalid | warning  | No      |

---

## Plugin Rules

Validation rules for Claude Code plugin manifests.

| Rule ID                                                        | Description                           | Severity | Fixable |
| -------------------------------------------------------------- | ------------------------------------- | -------- | ------- |
| [plugin-invalid-manifest](./plugin/plugin-invalid-manifest.md) | Plugin manifest does not match schema | error    | No      |
| [plugin-invalid-version](./plugin/plugin-invalid-version.md)   | Plugin version is not valid semver    | error    | No      |
| [plugin-missing-file](./plugin/plugin-missing-file.md)         | Plugin references non-existent file   | error    | No      |

---

## Rule Statistics

- **Total Rules:** 27
- **Error Severity:** 19 rules
- **Warning Severity:** 8 rules
- **Fixable Rules:** 3 rules (skill-missing-shebang, skill-missing-changelog, skill-missing-version)

---

## Using Rules

### View All Rules

```bash
claudelint list-rules
```

### Configure Rule Severity

Disable a rule:

```json
{
  "rules": {
    "skill-missing-comments": "off"
  }
}
```

Change to warning:

```json
{
  "rules": {
    "size-error": "warning"
  }
}
```

Change to error:

```json
{
  "rules": {
    "settings-invalid-env-var": "error"
  }
}
```

### Auto-fix Rules

Fix all fixable issues:

```bash
claudelint check-all --fix
```

Preview fixes without applying:

```bash
claudelint check-all --fix-dry-run
```

Fix only errors:

```bash
claudelint check-all --fix --fix-type errors
```

---

## See Also

- [Configuration Guide](../configuration.md)
- [Auto-fix Documentation](../auto-fix.md)
- [Validator Documentation](../validators.md)
