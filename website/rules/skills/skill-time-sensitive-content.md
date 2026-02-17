---
description: "SKILL.md should avoid time-sensitive references"
---

# skill-time-sensitive-content

<RuleHeader description="SKILL.md should avoid time-sensitive references" severity="warn" :fixable="false" :configurable="false" category="Skills" />

## Rule Details

Skills should contain evergreen content that remains accurate over time. References to specific dates ("January 15, 2025"), relative time ("last week", "this month"), or ISO date strings ("2025-01-15") become stale and misleading. This rule scans the SKILL.md body (after frontmatter) for patterns like "today", "yesterday", "tomorrow", "this/last/next week/month/year", full date strings, and ISO date formats. Each matching line is reported.

### Incorrect

SKILL.md body with a specific date reference

```markdown
---
name: deploy-app
description: Deploys the application
---

Updated on January 15, 2025 to support the new API.
```

SKILL.md body with relative time reference

```markdown
---
name: deploy-app
description: Deploys the application
---

This week we migrated to the new deploy pipeline.
```

### Correct

SKILL.md body with evergreen language

```markdown
---
name: deploy-app
description: Deploys the application
---

Uses the current deploy pipeline with zero-downtime rollouts.
```

Version references instead of dates

```markdown
---
name: deploy-app
description: Deploys the application
---

Supports API v2 and later.
```

## How To Fix

Replace specific dates with version references or relative terms that age well. For example, use "recent versions" instead of "this month" and "API v2+" instead of "the January 2025 API update".

## Options

This rule does not have any configuration options.

## When Not To Use It

If the skill documentation intentionally tracks a changelog or release history with dates, you may disable this rule for that specific file.

## Related Rules

- [`skill-body-word-count`](/rules/skills/skill-body-word-count)
- [`skill-body-too-long`](/rules/skills/skill-body-too-long)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-time-sensitive-content.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-time-sensitive-content.test.ts)

## Version

Available since: v0.2.0
