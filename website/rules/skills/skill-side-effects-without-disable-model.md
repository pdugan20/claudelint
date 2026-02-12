# skill-side-effects-without-disable-model

<RuleHeader description="Skills with side-effect tools (Bash, Write) should set disable-model-invocation to control auto-invocation" severity="warn" :fixable="false" :configurable="false" category="Skills" />

## Rule Details

Skills that include side-effect tools (Bash, Write, Edit, NotebookEdit) in their `allowed-tools` list can potentially execute destructive operations. Setting `disable-model-invocation: true` prevents Claude from automatically invoking the skill, requiring explicit user action instead. This rule checks for the presence of side-effect tools in `allowed-tools` (including scoped variants like `Bash(scope:*)`) and verifies that `disable-model-invocation` is set to `true` when they are present.

### Incorrect

Side-effect tools without disable-model-invocation

```yaml
---
name: deploy-app
description: Deploys the application
allowed-tools:
  - Bash
  - Read
---
```

Scoped Bash tool without disable-model-invocation

```yaml
---
name: format-code
description: Formats source files
allowed-tools:
  - Bash(prettier:*)
  - Write
---
```

### Correct

Side-effect tools with disable-model-invocation enabled

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

No side-effect tools (disable-model-invocation not needed)

```yaml
---
name: analyze-code
description: Analyzes source code
allowed-tools:
  - Read
  - Glob
---
```

## How To Fix

Add `disable-model-invocation: true` to the SKILL.md frontmatter. This prevents the model from auto-invoking the skill, requiring explicit user confirmation for side-effect operations.

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
