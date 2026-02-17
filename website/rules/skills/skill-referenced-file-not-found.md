---
description: "Referenced file in markdown link does not exist"
---

# skill-referenced-file-not-found

<RuleHeader description="Referenced file in markdown link does not exist" severity="error" :fixable="false" :configurable="false" category="Skills" />

## Rule Details

Skills may reference supporting files using relative markdown links like `[guide](./docs/guide.md)`. If those files are missing, the skill documentation is broken. This rule extracts all relative markdown links from SKILL.md (excluding URLs, anchors, absolute paths, and mailto links) and checks whether each referenced file exists on disk. Missing files indicate stale references that should be updated or removed.

### Incorrect

Link to a file that does not exist

```markdown
---
name: deploy-app
description: Deploys the application
---

See [setup guide](./docs/setup.md) for instructions.
```

### Correct

Link to an existing file

```markdown
---
name: deploy-app
description: Deploys the application
---

See [setup guide](./docs/setup.md) for instructions.

<!-- docs/setup.md exists on disk -->
```

External links are not checked

```markdown
---
name: deploy-app
description: Deploys the application
---

See [the docs](https://example.com/docs) for details.
```

## How To Fix

Verify that the referenced file exists at the specified path relative to the SKILL.md file. If the file was moved, update the link. If it was removed, delete the link.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-reference-not-linked`](/rules/skills/skill-reference-not-linked)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-referenced-file-not-found.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-referenced-file-not-found.test.ts)

## Version

Available since: v0.2.0
