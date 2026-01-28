# Rule: skill-large-reference-no-toc

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Maintainability

Warns when SKILL.md files over 100 lines lack a table of contents, making navigation difficult.

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

## Overview

This is a complex skill with many features...

## Installation

...

## Configuration

...

## Usage

...

## Advanced Features

...

## Troubleshooting

...

## Examples

...
```

### Correct

SKILL.md with TOC for navigation:

```markdown
---
name: complex-skill
---

# Complex Skill

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Advanced Features](#advanced-features)
- [Troubleshooting](#troubleshooting)
- [Examples](#examples)

## Overview

This is a complex skill with many features...

## Installation

...

## Configuration

...
```

## How To Fix

1. Add a "Table of Contents" heading near the top of your SKILL.md
2. List all major sections with markdown links to heading anchors
3. Use markdown's automatic heading anchor syntax: `[Section Name](#section-name)`
4. Keep TOC entries concise and at consistent heading levels
5. Update the TOC when you add or remove major sections

Example TOC format:

```markdown
## Table of Contents

- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Basic Usage](#basic-usage)
  - [Advanced Usage](#advanced-usage)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
```

## Options

This rule does not have any configuration options.

## When Not To Use It

Consider disabling this rule if your documentation tool automatically generates a table of contents, or if your skill files are structured in a way where sequential reading is expected (like a tutorial). However, most reference-style documentation benefits from an explicit TOC.

## Related Rules

- [skill-body-too-long](./skill-body-too-long.md) - SKILL.md body should not exceed 500 lines
- [skill-time-sensitive-content](./skill-time-sensitive-content.md) - Avoid time-sensitive language

## Resources

- [Rule Implementation](../../src/validators/skills.ts#L543)
- [Rule Tests](../../tests/validators/skills.test.ts)

## Version

Available since: v1.0.0
