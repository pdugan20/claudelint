---
description: "Output style description must be at least 10 characters, written in third person, with no XML tags"
---

# output-style-description

<RuleHeader description="Output style description must be at least 10 characters, written in third person, with no XML tags" severity="error" :fixable="false" :configurable="false" category="Output Styles" />

## Rule Details

This rule validates the `description` field in output style frontmatter. The description must be at least 10 characters long, written in third person, and must not contain XML-style tags. This is enforced via the OutputStyleFrontmatterSchema which applies `min(10)`, `noXMLTags()`, and `thirdPerson()` validators.

### Incorrect

Description that is too short

```markdown
---
name: concise-prose
description: Brief
---
```

Description in first person

```markdown
---
name: concise-prose
description: I write concise prose with short sentences
---
```

### Correct

Valid third-person description with sufficient length

```markdown
---
name: concise-prose
description: Produces concise prose with short, direct sentences
---
```

## How To Fix

Write the description in third person (e.g., "Produces..." not "I produce..."), ensure it is at least 10 characters, and remove any XML tags.

## Options

This rule does not have any configuration options.

## Related Rules

- [`output-style-name`](/rules/output-styles/output-style-name)
- [`output-style-examples`](/rules/output-styles/output-style-examples)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/output-styles/output-style-description.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/output-styles/output-style-description.test.ts)

## Version

Available since: v0.2.0
