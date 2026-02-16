# skill-side-effects-without-disable-model

<RuleHeader description="Skills with unscoped Bash should set disable-model-invocation to control auto-invocation" severity="warn" :fixable="false" :configurable="false" category="Skills" />

## Rule Details

Claude Code has three permission tiers: read-only tools (Read, Grep, Glob) require no approval; file modification tools (Edit, Write) require per-session approval; and Bash commands require explicit approval (permanent per project once granted). When a skill lists tools in `allowed-tools`, those tools are auto-approved without prompts while the skill is active.

Unscoped `Bash` (or `Bash(*)`) in `allowed-tools` means Claude can execute any shell command without asking — including commands that reach outside the project directory, modify system state, or make network requests. This is the only tool that can escape Claude Code's working directory sandbox.

Setting `disable-model-invocation: true` prevents Claude from auto-invoking the skill, requiring the user to explicitly type `/skill-name`. The official docs recommend this for "workflows with side effects or that you want to control timing, like /commit, /deploy, or /send-slack-message."

Scoped Bash like `Bash(claudelint:*)` or `Bash(npm run *)` already restricts which commands can run, so it does not trigger this rule. Edit, Write, and other built-in tools are confined to the working directory by Claude Code's security architecture.

### Incorrect

Unscoped Bash without disable-model-invocation

```yaml
---
name: deploy-app
description: Deploys the application
allowed-tools:
  - Bash
  - Read
---
```

Bash(*) is equivalent to unscoped Bash

```yaml
---
name: run-anything
description: Runs arbitrary commands
allowed-tools:
  - Bash(*)
---
```

### Correct

Unscoped Bash with disable-model-invocation

```yaml
---
name: deploy-app
description: Deploys the application
disable-model-invocation: true
allowed-tools:
  - Bash
  - Read
---
```

Scoped Bash — restricted to specific commands

```yaml
---
name: lint-code
description: Runs the linter
allowed-tools:
  - Bash(npm run lint*)
---
```

Edit and Write — confined to working directory by Claude Code

```yaml
---
name: optimize-config
description: Optimizes project config
allowed-tools:
  - Bash(claudelint:*)
  - Read
  - Edit
  - Write
---
```

Read-only tools — no approval required regardless

```yaml
---
name: analyze-code
description: Analyzes source code
allowed-tools:
  - Read
  - Glob
  - Grep
---
```

## How To Fix

Either scope Bash to specific commands (e.g., `Bash(npm run *)`) or add `disable-model-invocation: true` to require explicit user invocation with `/skill-name`.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-allowed-tools`](/rules/skills/skill-allowed-tools)
- [`skill-disallowed-tools`](/rules/skills/skill-disallowed-tools)
- [`skill-dangerous-command`](/rules/skills/skill-dangerous-command)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-side-effects-without-disable-model.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-side-effects-without-disable-model.test.ts)

## Version

Available since: v0.2.0
