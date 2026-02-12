# plugin-commands-deprecated

<RuleHeader description="The commands field in plugin.json is deprecated" severity="warn" :fixable="false" :configurable="false" category="Plugin" />

## Rule Details

The "commands" field in plugin.json is deprecated and has been replaced by "skills". Skills provide better structure, versioning, and documentation capabilities. This rule warns when a non-empty commands array is found so that plugin authors can migrate to the skills-based approach.

### Incorrect

Plugin using the deprecated commands field

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

Disable this rule if you are maintaining a legacy plugin that must support older versions of Claude Code that do not recognize the skills field.

## Related Rules

- [`plugin-missing-file`](/rules/plugin/plugin-missing-file)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/plugin/plugin-commands-deprecated.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/plugin/plugin-commands-deprecated.test.ts)

## Version

Available since: v0.2.0
