# Rule: skill-body-word-count

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: File System

SKILL.md body should not exceed configured maximum word count

## Rule Details

This rule triggers when the body content of a SKILL.md file (excluding frontmatter) exceeds the configured maximum word count (default 5000 words). Anthropic recommends keeping SKILL.md concise following progressive disclosure principles.

According to Anthropic's official guidance on building effective agents, SKILL.md should be focused and comprehensive but not exhaustive. When documentation grows beyond 5000 words, detailed content should be moved to the `references/` directory and linked from the main SKILL.md file.

This follows a three-level information disclosure system:

1. **Level 1**: YAML frontmatter (always loaded) - metadata
2. **Level 2**: SKILL.md body (loaded when skill is relevant) - core instructions
3. **Level 3**: References (loaded on demand) - detailed documentation

### Incorrect

SKILL.md with excessive inline documentation:

```markdown
---
name: api-client
description: Provides utilities for interacting with external APIs
---

# API Client Skill

## Overview

Complete overview here...

## Detailed API Reference

[2000 words of API documentation covering every endpoint, parameter, response format, error codes, retry logic, rate limiting, authentication methods, etc.]

## Advanced Examples

[1500 words of examples covering basic usage, authentication, error handling, pagination, filtering, sorting, custom headers, caching, performance optimization, etc.]

## Troubleshooting

[1200 words covering common issues, debugging, logging, performance tuning, migration guides, FAQ, best practices, security considerations, etc.]

[Total: 5500+ words - exceeds recommended limit]
```

### Correct

SKILL.md with progressive disclosure using references/:

```markdown
---
name: api-client
description: Provides utilities for interacting with external APIs
---

# API Client Skill

## Overview

Core instructions for using the API client, focusing on the main workflow and common patterns.

## Usage

Basic usage examples and getting started guide.

## Authentication

Instructions for setting up and managing API keys.

## Additional Resources

For more detailed information:

- See `references/api-reference.md` for comprehensive endpoint documentation
- See `references/examples.md` for advanced usage examples and patterns
- See `references/troubleshooting.md` for debugging and common issues
- See `references/performance.md` for optimization and best practices

[Total: ~800 words in SKILL.md + detailed docs in references/]
```

## How To Fix

To reduce SKILL.md body word count following Anthropic's progressive disclosure pattern:

1. **Identify sections that exceed immediate need**:
   - Exhaustive API documentation
   - Advanced examples and edge cases
   - Troubleshooting and debugging guides
   - Performance optimization tips
   - Migration and compatibility information

2. **Move detailed content to `references/` directory**:
   - Create `references/api-reference.md` for detailed API docs
   - Create `references/examples.md` for advanced examples
   - Create `references/troubleshooting.md` for debugging
   - Create `references/performance.md` for optimization

3. **Keep SKILL.md focused on core instructions**:
   - Essential workflow steps
   - Basic getting started guide
   - Key concepts and terminology
   - Common usage patterns
   - Links to detailed references

4. **Link from SKILL.md to reference files**:

   ```markdown
   For detailed API documentation, see `references/api-reference.md`.
   For advanced examples, see `references/examples.md`.
   ```

Example restructuring:

```markdown
# SKILL.md (focused, ~1000 words)

---
name: api-client
---

## Getting Started

Basic setup and quick start guide.

## Common Operations

Most frequently used operations.

## See Also

- `references/api-reference.md` - Complete endpoint documentation
- `references/examples.md` - Advanced usage patterns

# references/api-reference.md (detailed, ~2000 words)

Comprehensive endpoint documentation with all parameters and response types.

# references/examples.md (detailed, ~1500 words)

Advanced examples including edge cases and complex scenarios.
```

## Options

This rule has the following configuration options:

### `maxWords`

Maximum number of words allowed in SKILL.md body content. Must be a positive integer.

**Type**: `number`
**Default**: `5000`

**Schema**:

```typescript
{
  maxWords: number // positive integer
}
```

**Example configuration**:

```json
{
  "rules": {
    "skill-body-word-count": ["warn", { "maxWords": 7000 }]
  }
}
```

## When Not To Use It

Consider increasing the threshold if your skill genuinely requires more inline documentation:

```json
{
  "rules": {
    "skill-body-word-count": ["warn", { "maxWords": 8000 }]
  }
}
```

However, Anthropic strongly recommends keeping SKILL.md concise and using the `references/` directory for detailed content. Progressive disclosure improves usability for users and efficiency of the system.

## Related Rules

- [skill-body-too-long](./skill-body-too-long.md) - SKILL.md line count validation
- [skill-referenced-file-not-found](./skill-referenced-file-not-found.md) - Validates reference file existence
- [skill-reference-not-linked](./skill-reference-not-linked.md) - Ensures references are linked

## Resources

- [Rule Implementation](../../src/rules/skills/skill-body-word-count.ts)
- [Rule Tests](../../tests/rules/skills/skill-body-word-count.test.ts)
- [Anthropic Skills Guide](https://www.anthropic.com/news/building-effective-agents) - Progressive disclosure pattern
- [Keep SKILL.md Under 5,000 Words](https://www.anthropic.com/news/building-effective-agents) - Official guidance

## Version

Available since: v0.3.0
