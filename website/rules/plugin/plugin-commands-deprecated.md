---
description: "The commands field uses the legacy flat-file format"
---

# plugin-commands-deprecated

<RuleHeader description="The commands field uses the legacy flat-file format" severity="warn" :fixable="false" :configurable="false" category="Plugin" />

## Rule Details

The "commands" field in plugin.json remains supported for flat Markdown files. Skills add a directory for supporting files. This optional advisory warns when a non-empty commands path or array is found so that plugin authors can migrate to the skills-based approach.

### Incorrect

Plugin using the legacy commands field

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "A sample plugin",
  "commands": [
    "./commands/greet.md"
  ]
}
```

### Correct

Plugin using skills instead of commands

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "A sample plugin",
  "skills": [
    "./.claude/skills"
  ]
}
```

## How To Fix

Replace the "commands" field with "skills" and convert each command to the skills format. Skills support SKILL.md files with structured metadata, versioning, and usage examples.

## Options

This rule does not have any configuration options.

## When Not To Use It

Disable this advisory when intentionally retaining supported command files on current or older versions of Claude Code.

## Related Rules

- [`plugin-missing-file`](/rules/plugin/plugin-missing-file)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/plugin/plugin-commands-deprecated.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/plugin/plugin-commands-deprecated.test.ts)

## Version

Available since: v0.2.0
