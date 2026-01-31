# Rule: skill-unknown-string-substitution

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Best Practices

Unknown string substitution pattern detected

## Rule Details

This rule detects unknown or invalid string substitution patterns in SKILL.md files. Claude Code skills support specific substitution patterns for dynamic values, but using incorrect patterns can cause runtime errors or unexpected behavior.

Valid substitution patterns include `$ARGUMENTS` (all skill arguments), `$0`-`$9` (positional arguments), and `${VARIABLE}` (environment variables). Invalid patterns like `$UNKNOWN` or `$CUSTOM_VAR` (without braces) will not be recognized by Claude Code.

### Incorrect

SKILL.md with invalid substitution patterns:

```markdown
---
name: deploy
description: Deploys applications
---

# Deploy Skill

Usage:

```bash
./deploy.sh $ENVIRONMENT $REGION
```

The script will deploy to $ENVIRONMENT region $REGION.

```

Invalid substitutions:

```markdown
Run with: ./script.sh $INPUT_FILE
Output location: $OUTPUT_DIR
```

### Correct

Valid substitution patterns:

```markdown
---
name: deploy
description: Deploys applications
---

# Deploy Skill

Usage with all arguments:

```bash
./deploy.sh $ARGUMENTS
```

Usage with positional arguments:

```bash
./deploy.sh $1 $2
```

Usage with environment variables:

```markdown
Run with: ./script.sh ${INPUT_FILE}
Output location: ${OUTPUT_DIR}
```

## How To Fix

Replace invalid substitution patterns with valid ones:

1. For all arguments: Use `$ARGUMENTS`
2. For positional arguments: Use `$0`, `$1`, `$2`, etc.
3. For variables: Use `${VARIABLE_NAME}` with braces
4. For literal dollar signs: Escape with `\$`

Examples:

- `$CUSTOM` → `${CUSTOM}` (add braces)
- `$ALL_ARGS` → `$ARGUMENTS` (use standard pattern)
- `$first` → `$1` (use positional argument)

## Options

This rule does not have any configuration options.

## When Not To Use It

Consider disabling this rule if:

- Your SKILL.md contains shell code examples that use shell variables
- You're documenting external tools with their own substitution syntax
- The substitution pattern is in a code block showing example syntax

Use inline disable comments for specific cases rather than disabling entirely.

## Related Rules

- [skill-referenced-file-not-found](./skill-referenced-file-not-found.md) - Validate file references
- [skill-missing-examples](./skill-missing-examples.md) - Skills should have examples

## Resources

- [Rule Implementation](../../src/rules/skills/skill-unknown-string-substitution.ts)
- [Rule Tests](../../tests/rules/skills/skill-unknown-string-substitution.test.ts)

## Version

Available since: v1.0.0
