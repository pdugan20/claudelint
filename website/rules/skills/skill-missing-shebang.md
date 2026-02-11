# Rule: skill-missing-shebang

**Severity**: Warn
**Fixable**: Yes
**Validator**: Skills
**Recommended**: Yes

Shell script lacks shebang line

## Rule Details

Shell scripts must start with a shebang line (e.g., `#!/bin/bash` or `#!/usr/bin/env bash`) to specify which interpreter should execute them. Without a shebang, the script may fail or run under an unexpected shell, leading to subtle bugs. This rule checks all `.sh` files within skill directories. This rule is auto-fixable and will prepend `#!/usr/bin/env bash` to scripts that lack a shebang.

### Incorrect

Shell script without shebang

```bash
echo "Hello, world!"
exit 0
```

### Correct

Shell script with env shebang

```bash
#!/usr/bin/env bash
echo "Hello, world!"
exit 0
```

Shell script with direct bash path

```bash
#!/bin/bash
echo "Hello, world!"
exit 0
```

## How To Fix

Add a shebang line as the very first line of your shell script. The recommended shebang is `#!/usr/bin/env bash` for portability. Alternatively, run the auto-fixer which will prepend it automatically.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-missing-version`](/rules/skills/skill-missing-version)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-missing-shebang.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-missing-shebang.test.ts)

## Version

Available since: v1.0.0
