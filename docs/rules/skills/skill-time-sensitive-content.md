# Rule: skill-time-sensitive-content

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Best Practices

SKILL.md should avoid time-sensitive references

## Rule Details

This rule triggers when Claude Code detects time-sensitive references in your SKILL.md documentation. Time-sensitive content includes relative terms like "today", "yesterday", "this week", or specific dates like "January 15, 2026" that become inaccurate as time passes.

The rule scans the entire SKILL.md body (excluding frontmatter and title) for these patterns:
- Relative time references: today, yesterday, tomorrow
- Time period references: this week, last month, next year
- Specific dates: January 15, 2026, 2026-01-15

Documentation should remain accurate and useful over time. Time-sensitive language creates confusion when users read the documentation months or years after it was written.

### Incorrect

SKILL.md with time-sensitive content:

```markdown
---
name: deploy
---

# Deploy Skill

This skill was updated last week to support staging environments.
As of today, it supports three deployment targets.

The production deploy feature was added on January 15, 2026.
```

### Correct

SKILL.md with timeless language:

```markdown
---
name: deploy
---

# Deploy Skill

This skill supports staging environments (added in v2.0).
It currently supports three deployment targets.

The production deploy feature was introduced in version 2.0.
```

## Options

This rule does not have any configuration options.

## When Not To Use It

Consider disabling this rule if your skill documentation includes a dated changelog section where specific dates are appropriate. However, the main skill body should still avoid time-sensitive language.

## Related Rules

- [skill-body-too-long](./skill-body-too-long.md) - SKILL.md body should not exceed 500 lines
- [skill-missing-changelog](./skill-missing-changelog.md) - Skills should have CHANGELOG.md for version history

## Resources

- [Rule Implementation](../../src/validators/skills.ts#L503)
- [Rule Tests](../../tests/validators/skills.test.ts)

## Version

Available since: v1.0.0
