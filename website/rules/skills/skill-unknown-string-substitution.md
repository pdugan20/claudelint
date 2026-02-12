# skill-unknown-string-substitution

<RuleHeader description="Unknown string substitution pattern detected" severity="warn" :fixable="false" :configurable="false" category="Skills" />

## Rule Details

Skills support a limited set of string substitution variables: `$ARGUMENTS`, positional parameters `$0` through `$9`, and `${VARIABLE}` syntax. Other `$UPPERCASE` patterns outside of code blocks may indicate typos or unsupported substitutions that will not be replaced at runtime. This rule strips fenced code blocks and inline code to avoid false positives on shell variables in examples, then scans for `$UPPERCASE_WORDS` patterns that are not in the allowed list.

### Incorrect

Unknown substitution variable in body text

```markdown
---
name: deploy-app
description: Deploys the application
---

Deploy to $ENVIRONMENT using the configured pipeline.
```

### Correct

Using the supported $ARGUMENTS substitution

```markdown
---
name: deploy-app
description: Deploys the application
---

Deploy using: ./deploy.sh $ARGUMENTS
```

Shell variables inside code blocks are not flagged

````markdown
---
name: deploy-app
description: Deploys the application
---

```bash
export ENVIRONMENT="staging"
```
````

## How To Fix

Use only supported substitution patterns: `$ARGUMENTS` for the full argument string, `$0`-`$9` for positional parameters, or `${VARIABLE}` for named variables. If the variable is part of a shell example, wrap it in a fenced code block.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-arguments-without-hint`](/rules/skills/skill-arguments-without-hint)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-unknown-string-substitution.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-unknown-string-substitution.test.ts)

## Version

Available since: v0.2.0
