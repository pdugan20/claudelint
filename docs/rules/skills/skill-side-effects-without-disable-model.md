# Rule: skill-side-effects-without-disable-model

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Security

Skill allows side-effect tools but does not set disable-model-invocation to true

## Rule Details

This rule warns when a skill's `allowed-tools` includes tools capable of side effects (such as `Bash`, `Write`, `Edit`, or `NotebookEdit`) but the frontmatter does not set `disable-model-invocation: true`. When a skill can write files or execute commands, disabling model invocation ensures the skill runs its predefined steps without the model making additional autonomous decisions that could cause unintended modifications.

Setting `disable-model-invocation: true` constrains the skill to execute only its explicit instructions, preventing the model from improvising additional tool calls beyond what the skill body specifies. This is a defense-in-depth measure for skills that perform destructive or irreversible operations.

### Incorrect

Bash allowed without disable-model-invocation:

````markdown
---
name: clean-build
description: Cleans build artifacts and rebuilds the project
allowed-tools:
  - Bash
  - Read
---

```bash
rm -rf dist/ && npm run build
```
````

Write allowed without disable-model-invocation:

```markdown
---
name: generate-config
description: Generates configuration files for the project
allowed-tools:
  - Read
  - Write
  - Glob
---

Generate the configuration file at `config.json`.
```

### Correct

Bash allowed with disable-model-invocation set:

````markdown
---
name: clean-build
description: Cleans build artifacts and rebuilds the project
allowed-tools:
  - Bash
  - Read
disable-model-invocation: true
---

```bash
rm -rf dist/ && npm run build
```
````

Write allowed with disable-model-invocation set:

```markdown
---
name: generate-config
description: Generates configuration files for the project
allowed-tools:
  - Read
  - Write
  - Glob
disable-model-invocation: true
---

Generate the configuration file at `config.json`.
```

Read-only skill (rule does not apply):

```markdown
---
name: code-analyzer
description: Analyzes code quality without modifications
allowed-tools:
  - Read
  - Grep
  - Glob
---

Analyze the codebase for quality issues.
```

## How To Fix

Add `disable-model-invocation: true` to the skill frontmatter:

1. Open the SKILL.md file
2. Add `disable-model-invocation: true` to the frontmatter
3. Verify the skill body contains all necessary instructions since the model will not improvise additional steps

If the skill requires model autonomy to function correctly, consider removing side-effect tools from `allowed-tools` and restructuring the skill to use read-only tools instead.

## Options

This rule does not have any configuration options.

## When Not To Use It

Disable this rule if the skill intentionally requires model autonomy to decide which files to write or which commands to run based on dynamic analysis. Some complex skills need the model to make judgment calls during execution. In those cases, ensure thorough review of the skill's behavior and consider using `disallowed-tools` to restrict the most dangerous tools instead.

## Related Rules

- [skill-allowed-tools](./skill-allowed-tools.md) - Tool access restrictions for skills
- [skill-dangerous-command](./skill-dangerous-command.md) - Detects destructive commands in skill scripts

## Resources

- [Rule Implementation](../../src/rules/skills/skill-side-effects-without-disable-model.ts)
- [Rule Tests](../../tests/rules/skills/skill-side-effects-without-disable-model.test.ts)

## Version

Available since: v0.2.0
