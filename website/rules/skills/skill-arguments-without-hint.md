---
description: "Skills using $ARGUMENTS or positional parameters should include an argument-hint in frontmatter"
---

# skill-arguments-without-hint

<RuleHeader description="Skills using $ARGUMENTS or positional parameters should include an argument-hint in frontmatter" severity="warn" :fixable="false" :configurable="false" category="Skills" />

## Rule Details

The `argument-hint` frontmatter field provides placeholder text that helps users understand what arguments a skill expects when invoked. This rule detects when the skill body references `$ARGUMENTS`, `$0`, `$1`, or other positional parameters but the frontmatter does not include an `argument-hint`. Without the hint, users have no guidance on what input the skill expects.

### Incorrect

Body uses $ARGUMENTS but frontmatter has no argument-hint

```markdown
---
name: greet
description: Greets a user by name
---

Say hello to $ARGUMENTS.
```

### Correct

argument-hint provided for skill that uses $ARGUMENTS

```markdown
---
name: greet
description: Greets a user by name
argument-hint: "<user name>"
---

Say hello to $ARGUMENTS.
```

Skill without argument references needs no hint

```markdown
---
name: status
description: Shows project status
---

Check the current project status.
```

## How To Fix

Add `argument-hint: "<description of expected arguments>"` to the SKILL.md frontmatter. Use angle brackets or descriptive placeholder text so users know what to provide, for example: `argument-hint: "<file path> [--verbose]"`.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-description`](/rules/skills/skill-description)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-arguments-without-hint.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-arguments-without-hint.test.ts)

## Version

Available since: v0.2.0
