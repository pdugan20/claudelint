# skill-name-directory-mismatch

<RuleHeader description="Skill name must match parent directory name" severity="error" :fixable="true" category="Skills" />

## Rule Details

The skill name declared in SKILL.md frontmatter must match the directory the skill lives in. A mismatch between the two causes confusion when browsing skills on disk versus invoking them by name. This rule compares the `name` field against the parent directory name and reports an error if they differ. The rule provides an auto-fix that updates the frontmatter name to match the directory.

### Incorrect

Name does not match directory (directory is "deploy-app")

```yaml
---
name: deploy-application
description: Deploys the application
---
```

Name uses different casing than directory "my-tool"

```yaml
---
name: my-Tool
description: Runs the tool
---
```

### Correct

Name matches directory "deploy-app"

```yaml
---
name: deploy-app
description: Deploys the application
---
```

## How To Fix

Update the `name` field in SKILL.md frontmatter to exactly match the parent directory name, or rename the directory to match the desired skill name. The auto-fixer updates the frontmatter name.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-name`](/rules/skills/skill-name)
- [`skill-overly-generic-name`](/rules/skills/skill-overly-generic-name)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-name-directory-mismatch.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-name-directory-mismatch.test.ts)

## Version

Available since: v0.2.0
