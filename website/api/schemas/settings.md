---
description: "Schema reference for settings.json including permissions, attribution, and sandbox configuration."
---

# Settings

<SchemaRef
  validator="Settings" validator-link="/validators/settings"
  docs="Settings" docs-link="https://code.claude.com/docs/en/settings"
  schema="claude-code-settings.json" schema-link="https://json.schemastore.org/claude-code-settings.json"
/>

The `settings.json` file can be located at:

- `~/.claude/settings.json` (global)
- `.claude/settings.json` (project)
- `.claude/settings.local.json` (local, gitignored)

claudelint validates the top-level structure and nested objects. Key sections include:

## Permissions

| Field | Type | Description |
|-------|------|-------------|
| `allow` | string[] | Permission patterns to auto-allow (e.g., `"Bash(npm run *)"`) |
| `deny` | string[] | Permission patterns to always deny |
| `ask` | string[] | Permission patterns to always prompt |
| `defaultMode` | string | `acceptEdits`, `bypassPermissions`, `default`, or `plan` |
| `disableBypassPermissionsMode` | string | Set to `"disable"` to prevent bypass |
| `additionalDirectories` | string[] | Extra directories to allow access to |

## Attribution

| Field | Type | Description |
|-------|------|-------------|
| `commit` | string | Commit message template |
| `pr` | string | PR description template |

## Sandbox

| Field | Type | Description |
|-------|------|-------------|
| `enabled` | boolean | Enable sandboxing |
| `autoAllowBashIfSandboxed` | boolean | Auto-allow bash in sandbox |
| `excludedCommands` | string[] | Commands excluded from sandbox |
| `allowUnsandboxedCommands` | string[] | Commands allowed outside sandbox |
| `network.allowedHosts` | string[] | Allowed network hosts |
| `network.allowedPorts` | number[] | Allowed network ports |
| `enableWeakerNestedSandbox` | boolean | Allow weaker nested sandbox |
| `ignoreViolations` | boolean | Ignore sandbox violations |
