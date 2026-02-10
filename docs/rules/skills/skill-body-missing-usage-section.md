# Rule: skill-body-missing-usage-section

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Skills

SKILL.md body lacks a ## Usage section

## Rule Details

This rule warns when a SKILL.md file does not include a `## Usage` heading in its body content. A dedicated usage section helps users understand how to invoke the skill and what arguments it accepts.

The rule checks the body content (everything after the YAML frontmatter) for a level-2 heading matching `## Usage` (case-insensitive).

### Incorrect

SKILL.md without a usage section:

```markdown
---
name: my-skill
description: Does something useful
---

# My Skill

This skill does something useful.

## Examples

Run it like this.
```

### Correct

SKILL.md with a usage section:

```markdown
---
name: my-skill
description: Does something useful
---

# My Skill

This skill does something useful.

## Usage

Invoke with `/my-skill` or say "run my skill". Pass arguments after the command name.

## Examples

Run it like this.
```

## How To Fix

Add a `## Usage` section to the SKILL.md body. Include:

1. How to invoke the skill (slash command syntax)
2. What arguments or options it accepts
3. Any prerequisites or setup required

## Options

This rule does not have any configuration options.

## When Not To Use It

Disable this rule only if:

- The skill is internal and documentation is maintained elsewhere
- The skill's name and description are self-explanatory enough that no usage section is needed

## Related Rules

- [skill-description](./skill-description.md) - Ensures skills have a description
- [skill-missing-examples](./skill-missing-examples.md) - Ensures skills include examples

## Resources

- [Rule Implementation](../../src/rules/skills/skill-body-missing-usage-section.ts)
- [Rule Tests](../../tests/rules/skills/skill-body-missing-usage-section.test.ts)

## Version

Available since: v1.0.0
