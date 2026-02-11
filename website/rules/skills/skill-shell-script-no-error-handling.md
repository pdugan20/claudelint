# Rule: skill-shell-script-no-error-handling

**Severity**: Warn
**Fixable**: Yes
**Validator**: Skills
**Recommended**: Yes

Shell script lacks error handling (set -e or set -euo pipefail)

## Rule Details

Without proper error handling, shell scripts continue executing after a command fails, which can cause cascading issues and data corruption. This rule checks `.sh` and `.bash` files for the presence of `set -e`, `set -euo pipefail`, or a `trap ... ERR` handler. If none are found, a warning is reported with an auto-fix that inserts `set -euo pipefail` after the shebang line.

### Incorrect

Script with no error handling

```bash
#!/bin/bash
echo "Building..."
npm run build
echo "Deploying..."
npm run deploy
```

### Correct

Script with set -euo pipefail

```bash
#!/bin/bash
set -euo pipefail
echo "Building..."
npm run build
echo "Deploying..."
npm run deploy
```

Script with trap-based error handling

```bash
#!/bin/bash
trap 'echo "Error on line $LINENO"; exit 1' ERR
npm run build
```

## How To Fix

Add `set -euo pipefail` immediately after the shebang line. This causes the script to exit on any command failure (`-e`), undefined variable usage (`-u`), and pipe failures (`-o pipefail`). The auto-fixer inserts this line automatically.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-shell-script-hardcoded-paths`](/rules/skills/skill-shell-script-hardcoded-paths)
- [`skill-missing-shebang`](/rules/skills/skill-missing-shebang)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-shell-script-no-error-handling.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-shell-script-no-error-handling.test.ts)

## Version

Available since: v1.0.0
