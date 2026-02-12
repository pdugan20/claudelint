# skill-missing-examples

<RuleHeader description="SKILL.md lacks usage examples" severity="warn" :fixable="false" category="Skills" />

## Rule Details

Skills should include concrete usage examples so users understand how to invoke them and what to expect. This rule checks for the presence of fenced code blocks (```) or a markdown section titled "Example", "Examples", or "Usage". Without examples, users must read the entire skill to figure out how to use it, which slows adoption.

### Incorrect

SKILL.md with no code blocks or example section

```markdown
---
name: deploy-app
description: Deploys the application
---

This skill deploys the application to production.

It uses the deploy script to push changes.
```

### Correct

SKILL.md with a code block example

````markdown
---
name: deploy-app
description: Deploys the application
---

## Usage

```bash
/deploy-app staging
```
````

SKILL.md with an Example section heading

```markdown
---
name: deploy-app
description: Deploys the application
---

## Example

Run the skill with the target environment as the argument.
```

## How To Fix

Add a fenced code block showing how to invoke the skill, or add a section headed "## Example", "## Examples", or "## Usage" with usage instructions.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-body-missing-usage-section`](/rules/skills/skill-body-missing-usage-section)
- [`skill-body-word-count`](/rules/skills/skill-body-word-count)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-missing-examples.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-missing-examples.test.ts)

## Version

Available since: v0.2.0
