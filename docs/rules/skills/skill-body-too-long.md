# Rule: skill-body-too-long

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: File System

SKILL.md body should not exceed 500 lines

## Rule Details

This rule triggers when the body content of a SKILL.md file (excluding frontmatter and title) exceeds 500 lines. Long documentation files become difficult to maintain, navigate, and understand. Users struggle to find relevant information in lengthy documents.

The rule counts only the body lines after the second frontmatter delimiter (`---`) and the H1 title. A skill with 500+ lines should be split into multiple focused files or reorganized with a clear table of contents.

### Incorrect

SKILL.md with 600 lines of content:

```markdown
---
name: mega-skill
---

# Mega Skill

[... 600 lines of documentation ...]

Too much content makes it hard to navigate and maintain.
```

### Correct

SKILL.md with focused documentation:

```markdown
---
name: focused-skill
---

# Focused Skill

## Overview

Clear, concise documentation under 500 lines.

## Usage

...

[Total: 200 lines - easy to read and maintain]
```

Split documentation with external references:

```markdown
---
name: complex-skill
---

# Complex Skill

## Overview

Core documentation here (< 500 lines).

## Additional Documentation

See REFERENCE.md for detailed examples.
See ARCHITECTURE.md for design decisions.
```

## How To Fix

To reduce SKILL.md body length:

1. **Extract detailed examples** to separate files
2. **Move reference material** to dedicated REFERENCE.md
3. **Add table of contents** for remaining content
4. **Link to external docs** for supplementary information
5. **Remove redundant** or outdated sections

## Options

This rule has the following configuration options:

### `maxLines`

Maximum number of lines in body content before triggering a warning. Must be a positive integer.

**Type**: `number`
**Default**: `500`

**Schema**:

```typescript
{
  maxLines: number // positive integer
}
```

**Example configuration**:

```json
{
  "rules": {
    "skill-body-too-long": ["warn", { "maxLines": 750 }]
  }
}
```

## When Not To Use It

Consider disabling this rule if your skill is genuinely complex and requires comprehensive inline documentation. However, most skills should be broken down into focused, digestible pieces rather than single large files.

## Related Rules

- [skill-large-reference-no-toc](./skill-large-reference-no-toc.md) - Large skills should have a table of contents
- [skill-time-sensitive-content](./skill-time-sensitive-content.md) - Avoid time-sensitive language

## Resources

- [Rule Implementation](../../src/rules/skills/skill-body-too-long.ts)
- [Rule Tests](../../tests/rules/skills/skill-body-too-long.test.ts)

## Version

Available since: v1.0.0
