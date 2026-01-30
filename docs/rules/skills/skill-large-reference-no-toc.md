# Rule: skill-large-reference-no-toc

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Cross-Reference

Large SKILL.md files should include a table of contents

## Rule Details

This rule triggers when a SKILL.md file body exceeds 100 lines but does not include a table of contents section. Large documentation files without a TOC are difficult to navigate, forcing users to scroll through the entire document to find relevant information.

The rule checks for a heading containing "table of contents", "toc", or "contents" (case-insensitive). Adding a TOC improves the user experience by providing quick navigation to specific sections.

### Incorrect

SKILL.md with 150 lines but no TOC:

```markdown
---
name: complex-skill
---

# Complex Skill

... (150+ lines of content)
```

### Correct

Large SKILL.md with table of contents:

```markdown
---
name: complex-skill
description: Complex skill with extensive documentation
---

# Complex Skill

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## Installation

Instructions here...

## Configuration

Config details here...

... (rest of content with section headers)
```

## How To Fix

Add a table of contents to large SKILL.md files:

1. Add a "Table of Contents" section after the title
2. Link to all major sections using markdown anchor links
3. Keep TOC concise and well-organized
4. Use proper heading hierarchy

Example TOC:

```markdown
## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
  - [Basic Usage](#basic-usage)
  - [Advanced Usage](#advanced-usage)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
```

## Options

### `minLines`

Minimum number of body lines before TOC is required.

Type: `number`
Default: `100`

Example configuration:

```json
{
  "rules": {
    "skill-large-reference-no-toc": ["warn", { "minLines": 150 }]
  }
}
```

## When Not To Use It

Consider disabling this rule if your documentation tool automatically generates a table of contents, or if your skill files are structured in a way where sequential reading is expected (like a tutorial). However, most reference-style documentation benefits from an explicit TOC.

## Related Rules

- [skill-body-too-long](./skill-body-too-long.md) - SKILL.md body should not exceed 500 lines
- [skill-time-sensitive-content](./skill-time-sensitive-content.md) - Avoid time-sensitive language

## Resources

- [Rule Implementation](../../src/rules/skills/skill-large-reference-no-toc.ts)
- [Rule Tests](../../tests/rules/skills/skill-large-reference-no-toc.test.ts)

## Version

Available since: v1.0.0
