# Rule: skill-shell-script-no-error-handling

**Severity**: Warning
**Fixable**: Yes
**Validator**: Skills
**Category**: Skills

Shell scripts missing set -e or set -euo pipefail for error handling

## Rule Details

This rule warns when shell scripts in skills are missing proper error handling directives. Shell scripts without `set -e` (errexit) or `set -euo pipefail` will continue executing even when commands fail, potentially leading to unexpected behavior and silent failures.

The `set -euo pipefail` directive is considered best practice for shell scripts:

- `set -e` (errexit): Exit immediately if any command exits with a non-zero status
- `set -u` (nounset): Exit if an undefined variable is used
- `set -o pipefail`: Return exit status of the last command that exited with non-zero, even in a pipeline

Without these options, scripts may silently fail at critical points, making them unreliable in automated environments.

### Incorrect

Shell script without error handling:

```bash
#!/bin/bash
cd project
npm install
npm run build
npm run test
```

If `npm install` fails, the script continues to `npm run build` with incomplete dependencies.

Script with partial error handling:

```bash
#!/bin/bash
set -e
cd project
rm -rf dist
npm install
npm run build | grep "error"
```

The pipe to `grep` may hide the actual exit status of `npm run build`.

### Correct

Shell script with proper error handling:

```bash
#!/bin/bash
set -euo pipefail

cd project
npm install
npm run build
npm run test
```

Script with error handling and verbose output:

```bash
#!/bin/bash
set -euo pipefail

echo "Installing dependencies..."
npm install

echo "Building project..."
npm run build

echo "Running tests..."
npm run test
```

Script with safe pipeline handling:

```bash
#!/bin/bash
set -euo pipefail

cd project
npm run build
npm run build | tee build.log
exit "${PIPESTATUS[0]}"
```

## How To Fix

Add `set -euo pipefail` after the shebang line:

1. Open the shell script file in your skill
2. Add `set -euo pipefail` as the first line after `#!/bin/bash` or `#!/bin/sh`
3. Consider adding comments to explain why error handling is important

This rule provides automatic fixes that add `set -euo pipefail` after the shebang. To apply the fix:

- Run: `npm run lint -- --fix`
- Or use your editor's auto-fix on save if configured

## Options

This rule does not have any configuration options.

## When Not To Use It

Disable this rule only if:

- The script intentionally needs to continue after errors (rare and should be documented)
- The script is a simple one-liner that doesn't warrant error handling
- You're writing a wrapper script that needs custom error handling logic after specific failures

In these cases, add a comment explaining why error handling is not appropriate:

```bash
#!/bin/bash
# This script intentionally ignores failures to test error recovery
# shellcheck disable=SC2015
```

## Related Rules

- [skill-side-effects-without-disable-model](./skill-side-effects-without-disable-model.md) - Ensures scripts disable model invocation
- [skill-shell-script-hardcoded-paths](./skill-shell-script-hardcoded-paths.md) - Detects hardcoded paths in scripts

## Resources

- [Rule Implementation](../../src/rules/skills/skill-shell-script-no-error-handling.ts)
- [Rule Tests](../../tests/rules/skills/skill-shell-script-no-error-handling.test.ts)
- [Google Shell Style Guide](https://google.github.io/styleguide/shellguide.html)
- [Strict Mode in Bash](http://redsymbol.net/articles/unofficial-bash-strict-mode/)

## Version

Available since: v1.0.0
