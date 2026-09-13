---
description: "Permission rules must use valid tool names"
---

# settings-invalid-permission

<RuleHeader description="Permission rules must use valid tool names" severity="error" :fixable="false" :configurable="false" category="Settings" />

## Rule Details

This rule validates that tool names used in the permissions.allow, permissions.deny, and permissions.ask arrays in settings.json and settings.local.json are recognized Claude Code tools. Valid tools include Bash, Edit, Glob, Grep, Read, Write, and others, as well as MCP server references prefixed with mcp__. Deny and ask lists also accept tool-name globs; allow globs must name a literal MCP server. Cd is accepted as the permission target for /cd. Using an invalid tool name means the permission rule will have no effect, which can leave unintended access open or block expected functionality.

### Incorrect

Permission referencing a non-existent tool name

```json
{
  "permissions": {
    "allow": ["Bassh(npm run build)"]
  }
}
```

### Correct

Permission using valid tool names

```json
{
  "permissions": {
    "allow": ["Bash(npm run build)", "Read", "mcp__myserver"]
  }
}
```

## How To Fix

Check the tool name against the list of valid tools: Agent, Artifact, AskUserQuestion, Bash, CronCreate, CronDelete, CronList, Edit, EndConversation, EnterPlanMode, EnterWorktree, ExitPlanMode, ExitWorktree, Glob, Grep, ListAgents, ListMcpResourcesTool, LSP, Monitor, NotebookEdit, PowerShell, PushNotification, Read, ReadMcpResourceTool, RemoteTrigger, ReportFindings, ScheduleWakeup, SendFeedback, SendMessage, SendUserFile, ShareOnboardingGuide, Skill, TaskCreate, TaskGet, TaskList, TaskOutput, TaskStop, TaskUpdate, TodoWrite, ToolSearch, WaitForMcpServers, WebFetch, WebSearch, Workflow, Write, Task, SlashCommand. For MCP servers, use the mcp__ prefix followed by the server name.

## Options

This rule does not have any configuration options.

## Related Rules

- [`settings-permission-invalid-rule`](/rules/settings/settings-permission-invalid-rule)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/settings/settings-invalid-permission.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/settings/settings-invalid-permission.test.ts)

## Version

Available since: v0.2.0
