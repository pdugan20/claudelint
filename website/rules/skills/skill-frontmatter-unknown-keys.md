---
description: "Unknown key in SKILL.md frontmatter"
---

# skill-frontmatter-unknown-keys

<RuleHeader description="Unknown key in SKILL.md frontmatter" severity="warn" :fixable="false" :configurable="false" category="Skills" />

## Rule Details

SKILL.md frontmatter supports a specific set of known keys: name, description, version, tags, dependencies, allowed-tools, disallowed-tools, model, context, agent, argument-hint, disable-model-invocation, user-invocable, hooks, license, compatibility, and metadata. This rule detects any top-level keys that are not in this set. Unknown keys are silently ignored at runtime, which means typos in field names (e.g., "dependecies" instead of "dependencies") go unnoticed and the intended configuration never takes effect.

### Incorrect

Frontmatter with a typo in a key name

```yaml
---
name: deploy
description: Deploys the application
dependecies:
  - build
---
```

Frontmatter with a completely unknown key

```yaml
---
name: deploy
description: Deploys the application
author: Jane Doe
---
```

### Correct

Frontmatter using only recognized keys

```yaml
---
name: deploy
description: Deploys the application
dependencies:
  - build
allowed-tools:
  - Bash
---
```

## How To Fix

Valid keys: name, description, version, tags, dependencies, allowed-tools, disallowed-tools, model, context, agent, argument-hint, disable-model-invocation, user-invocable, hooks, license, compatibility, metadata. Check for typos or place custom data under the `metadata` field.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-description`](/rules/skills/skill-description)
- [`skill-dependencies`](/rules/skills/skill-dependencies)
- [`skill-allowed-tools`](/rules/skills/skill-allowed-tools)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-frontmatter-unknown-keys.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-frontmatter-unknown-keys.test.ts)

## Version

Available since: v0.3.0
