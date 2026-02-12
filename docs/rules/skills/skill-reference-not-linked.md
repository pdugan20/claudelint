# Rule: skill-reference-not-linked

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Cross-Reference

File reference in backticks should be a markdown link

## Rule Details

This rule triggers when a SKILL.md file contains backtick-enclosed file paths that reference skill supporting directories (`references/`, `examples/`, `scripts/`, `templates/`) but are not formatted as markdown links. Plain-text references prevent the `skill-referenced-file-not-found` rule from validating that the referenced files actually exist, which can lead to broken references going undetected.

### Incorrect

SKILL.md with plain-text file references:

```markdown
---
name: deploy
description: Deploys applications
---

# Deploy Skill

See `references/size-optimization.md` for size guidelines.

Check `examples/basic.sh` for usage patterns.

Run `scripts/deploy.sh` to deploy.

Use `templates/config.yaml` as a starting point.
```

### Correct

SKILL.md with properly linked file references:

```markdown
---
name: deploy
description: Deploys applications
---

# Deploy Skill

See [size optimization](./references/size-optimization.md) for size guidelines.

Check [basic example](./examples/basic.sh) for usage patterns.

Run [deploy script](./scripts/deploy.sh) to deploy.

Use [config template](./templates/config.yaml) as a starting point.
```

## How To Fix

Convert backtick file references to markdown links:

1. Replace `` `references/file.md` `` with `[descriptive text](./references/file.md)`
2. Replace `` `examples/file.sh` `` with `[descriptive text](./examples/file.sh)`
3. Replace `` `scripts/file.sh` `` with `[descriptive text](./scripts/file.sh)`
4. Replace `` `templates/file.yaml` `` with `[descriptive text](./templates/file.yaml)`

Using markdown links enables the `skill-referenced-file-not-found` rule to validate that the referenced files actually exist.

## Options

This rule does not have any configuration options.

## When Not To Use It

Consider disabling this rule if your skill references files that are generated at runtime or if backtick formatting is intentional for display purposes only.

## Related Rules

- [skill-referenced-file-not-found](./skill-referenced-file-not-found.md) - Validates that linked files exist

## Resources

- [Rule Implementation](../../src/rules/skills/skill-reference-not-linked.ts)
- [Rule Tests](../../tests/rules/skills/skill-reference-not-linked.test.ts)

## Version

Available since: v0.2.0
