# Rule: skill-body-too-long

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Maintainability

Warns when SKILL.md body content exceeds 500 lines, making it difficult to maintain and navigate.

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

## Section 1
... (100 lines)

## Section 2
... (100 lines)

## Section 3
... (100 lines)

## Section 4
... (100 lines)

## Section 5
... (100 lines)

## Section 6
... (100 lines)
```

### Correct

Split into multiple focused files:

```markdown
---
name: mega-skill
---

# Mega Skill

## Overview

This skill provides comprehensive functionality.

import docs/advanced-usage.md
import docs/configuration.md
import docs/troubleshooting.md
```

Or reorganized with clear sections and TOC:

```markdown
---
name: mega-skill
---

# Mega Skill

## Table of Contents

- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Advanced Usage](#advanced-usage)

## Quick Start

... (concise essential information)
```

## How To Fix

1. Split the skill into multiple files using import statements
2. Move detailed examples to separate documentation files
3. Move reference material to external docs
4. Add a table of contents for better navigation
5. Remove redundant or outdated content
6. Consider creating a separate examples directory

## Options

This rule does not have any configuration options.

## When Not To Use It

Consider disabling this rule if your skill is genuinely complex and requires comprehensive inline documentation. However, most skills should be broken down into focused, digestible pieces rather than single large files.

## Related Rules

- [skill-large-reference-no-toc](./skill-large-reference-no-toc.md) - Large skills should have a table of contents
- [skill-time-sensitive-content](./skill-time-sensitive-content.md) - Avoid time-sensitive language

## Resources

- [Rule Implementation](../../src/validators/skills.ts#L532)
- [Rule Tests](../../tests/validators/skills.test.ts)

## Version

Available since: v1.0.0
