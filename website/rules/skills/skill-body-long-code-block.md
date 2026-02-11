# Rule: skill-body-long-code-block

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Content Quality

Long code blocks in SKILL.md should be moved to reference files

## Rule Details

This rule warns when a SKILL.md body contains code blocks exceeding a configurable line threshold (default: 20 lines). Long code blocks bloat the skill's context window footprint and should be moved to the `references/` directory for progressive disclosure.

Claude Code only loads reference files when the skill is invoked, so moving large examples there keeps the skill description lean while preserving the full content.

### Incorrect

SKILL.md with a long inline code block:

````markdown
---
name: deploy
description: Deploy the application
---

## Usage

```bash
#!/usr/bin/env bash
set -euo pipefail
# ... 30+ lines of deployment script
```
````

### Correct

SKILL.md with code moved to references:

````markdown
---
name: deploy
description: Deploy the application
---

## Usage

Run the deployment script:

```bash
./references/deploy.sh
```
````

With the actual script in `references/deploy.sh`.

## How To Fix

1. **Move the code block** to a file in the `references/` directory:

   ```bash
   mkdir -p references
   # Extract the code block content to a reference file
   ```

2. **Update SKILL.md** to reference the file instead of inlining the code.

3. **Adjust the threshold** if 20 lines is too strict for your use case:

   ```json
   {
     "rules": {
       "skill-body-long-code-block": ["warn", { "maxLines": 30 }]
     }
   }
   ```

## Options

This rule has the following configuration options:

### `maxLines`

Maximum number of lines in a code block before triggering a warning.

**Type**: `number`
**Default**: `20`

**Example configuration**:

```json
{
  "rules": {
    "skill-body-long-code-block": ["warn", { "maxLines": 30 }]
  }
}
```

## When Not To Use It

Disable this rule if your skills intentionally embed long code blocks that must be visible in the skill description without needing invocation.

```json
{
  "rules": {
    "skill-body-long-code-block": "off"
  }
}
```

## Related Rules

- [skill-body-too-long](./skill-body-too-long.md) - Overall skill body length limit
- [skill-body-word-count](./skill-body-word-count.md) - Skill body word count limit
- [skill-body-missing-usage-section](./skill-body-missing-usage-section.md) - Skills should have a Usage section

## Resources

- [Rule Implementation](../../src/rules/skills/skill-body-long-code-block.ts)
- [Rule Tests](../../tests/rules/skills/skill-body-long-code-block.test.ts)

## Version

Available since: v1.0.0
