---
description: "Schema reference for settings.json including permissions, attribution, and sandbox configuration."
---

# Settings

<SchemaRef
  validator="Settings" validator-link="/validators/settings"
  docs="Settings" docs-link="https://code.claude.com/docs/en/settings"
  schema="claude-code-settings.json" schema-link="https://json.schemastore.org/claude-code-settings.json"
/>

The `settings.json` file configures Claude Code behavior. It can be located at `~/.claude/settings.json` (global), `.claude/settings.json` (project), or `.claude/settings.local.json` (local, gitignored).

## Fields

### Permissions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `allow` | string[] | no | Permission patterns to auto-allow (e.g., `"Bash(npm run *)"`) |
| `deny` | string[] | no | Permission patterns to always deny |
| `ask` | string[] | no | Permission patterns to always prompt |
| `defaultMode` | string | no | `acceptEdits`, `bypassPermissions`, `default`, or `plan` |
| `disableBypassPermissionsMode` | string | no | Set to `"disable"` to prevent bypass |
| `additionalDirectories` | string[] | no | Extra directories to allow access to |

### Attribution

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `commit` | string | no | Commit message template |
| `pr` | string | no | PR description template |

### Sandbox

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `enabled` | boolean | no | Enable sandboxing |
| `autoAllowBashIfSandboxed` | boolean | no | Auto-allow bash in sandbox |
| `excludedCommands` | string[] | no | Commands excluded from sandbox |
| `allowUnsandboxedCommands` | string[] | no | Commands allowed outside sandbox |
| `network.allowedHosts` | string[] | no | Allowed network hosts |
| `network.allowedPorts` | number[] | no | Allowed network ports |
| `enableWeakerNestedSandbox` | boolean | no | Allow weaker nested sandbox |
| `ignoreViolations` | boolean | no | Ignore sandbox violations |

## Example

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(git *)",
      "Read",
      "Edit"
    ],
    "deny": [
      "Bash(rm -rf *)"
    ]
  },
  "sandbox": {
    "enabled": true,
    "network": {
      "allowedHosts": ["registry.npmjs.org"]
    }
  }
}
```
