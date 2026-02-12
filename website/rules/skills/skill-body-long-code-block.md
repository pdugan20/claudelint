# skill-body-long-code-block

<RuleHeader description="Long code blocks in SKILL.md should be moved to reference files" severity="warn" :fixable="false" category="Skills" />

## Rule Details

This rule scans the body of SKILL.md files for fenced code blocks (triple backticks) and reports any that exceed the maximum line count. Long code blocks inflate the skill file size, slow down AI model processing, and make the skill harder to maintain. Large code examples and templates should be moved to separate files in the `references/` directory and linked from the main SKILL.md for progressive disclosure.

### Incorrect

Code block exceeding the default 20-line limit

````markdown
---
name: setup
description: Sets up the development environment
---

## Usage

```bash
# Line 1
# Line 2
# ...
# Line 25
```
````

### Correct

Short code block within the limit

````markdown
---
name: setup
description: Sets up the development environment
---

## Usage

```bash
npm install
npm run build
```
````

Long code moved to a reference file

```markdown
---
name: setup
description: Sets up the development environment
---

## Usage

See [full setup script](references/setup.sh) for the complete configuration.
```

## How To Fix

Move the long code block into a file under the `references/` directory and link to it from the SKILL.md body. Keep only short, illustrative snippets inline.

## Options

Default options:

```json
{
  "maxLines": 20
}
```

Allow up to 40 lines per code block:

```json
{
  "maxLines": 40
}
```

Enforce a strict 10-line limit:

```json
{
  "maxLines": 10
}
```

## When Not To Use It

Disable this rule if your skill requires inline code blocks that cannot be meaningfully extracted into separate reference files.

## Related Rules

- [`skill-body-too-long`](/rules/skills/skill-body-too-long)
- [`skill-body-word-count`](/rules/skills/skill-body-word-count)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-body-long-code-block.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-body-long-code-block.test.ts)

## Version

Available since: v0.2.0
