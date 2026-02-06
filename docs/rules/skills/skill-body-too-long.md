# Rule: skill-body-too-long

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: File System

SKILL.md body should not exceed 500 lines

## Rule Details

This rule triggers when the body content of a SKILL.md file (excluding frontmatter) exceeds 500 lines. Long SKILL.md files contradict Anthropic's guidance on progressive disclosure. According to their official guide, SKILL.md should be kept under 5,000 words with detailed documentation moved to the `references/` directory.

The rule counts body lines after the frontmatter delimiters (`---`). When a SKILL.md file exceeds this threshold, detailed documentation should be extracted to separate files in the `references/` directory and linked from the main SKILL.md file.

### Incorrect

SKILL.md with 500 lines of inline documentation:

```markdown
---
name: mega-skill
---

# Mega Skill

## Overview
...

## Detailed API Reference
[200 lines of API documentation]

## Advanced Examples
[150 lines of examples]

## Troubleshooting
[100 lines of troubleshooting]

[Total: 500+ lines - violates progressive disclosure]
```

### Correct

SKILL.md with progressive disclosure using references/:

```markdown
---
name: well-structured-skill
---

# Well-Structured Skill

## Overview

Core instructions and workflow (concise, focused).

## Usage

Basic usage pattern here.

## Additional Resources

For detailed information:
- See `references/api-guide.md` for complete API reference
- See `references/examples.md` for advanced examples
- See `references/troubleshooting.md` for common issues

[Total: ~150 lines in SKILL.md + detailed docs in references/]
```

## How To Fix

To reduce SKILL.md body length following Anthropic's progressive disclosure pattern:

1. **Move detailed documentation to `references/` directory**:
   - Create `references/api-guide.md` for API documentation
   - Create `references/examples.md` for detailed examples
   - Create `references/troubleshooting.md` for troubleshooting guides

2. **Keep SKILL.md focused on core instructions**:
   - Main workflow steps
   - Essential usage patterns
   - Links to detailed references

3. **Link to references from SKILL.md**:

   ```markdown
   For detailed API documentation, see `references/api-guide.md`
   ```

4. **Remove redundant or outdated sections**

This follows Anthropic's three-level progressive disclosure system:

- Level 1: YAML frontmatter (always loaded)
- Level 2: SKILL.md body (loaded when skill is relevant)
- Level 3: Linked reference files (loaded only as needed)

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

Consider increasing the threshold if your skill genuinely requires more inline documentation. However, Anthropic strongly recommends keeping SKILL.md concise and using the `references/` directory for detailed content.

## Related Rules

- [skill-time-sensitive-content](./skill-time-sensitive-content.md) - Avoid time-sensitive language

## Resources

- [Rule Implementation](../../src/rules/skills/skill-body-too-long.ts)
- [Rule Tests](../../tests/rules/skills/skill-body-too-long.test.ts)
- [Anthropic Skills Guide](https://www.anthropic.com/news/building-effective-agents) - Progressive disclosure pattern
- [Keep SKILL.md Under 5,000 Words](https://www.anthropic.com/news/building-effective-agents) - Official guidance

## Version

Available since: v1.0.0
