# Rule: skill-shell-script-hardcoded-paths

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Skills

Shell script contains hardcoded absolute paths that reduce portability

## Rule Details

This rule warns when shell scripts in skills contain hardcoded absolute paths like `/Users/me/project` or `/home/deploy/app`. These paths make scripts non-portable across different systems and user environments.

The rule checks for paths starting with `/Users`, `/home`, `/opt`, `/var`, `/etc`, and `/usr/local`. Common safe paths like `/dev/null`, `/tmp`, `/usr/bin/env`, `/bin/bash`, and `/bin/sh` are excluded.

Only one warning is reported per file, even if multiple hardcoded paths exist.

### Incorrect

Shell script with hardcoded user path:

```bash
#!/bin/bash
set -euo pipefail

source /Users/john/project/.env
cd /Users/john/project
npm run build
```

Shell script with hardcoded home directory:

```bash
#!/bin/bash
set -euo pipefail

CONFIG_DIR="/home/deploy/app/config"
cp "$CONFIG_DIR/settings.json" ./settings.json
```

### Correct

Shell script using environment variables:

```bash
#!/bin/bash
set -euo pipefail

source "$HOME/project/.env"
cd "$PWD"
npm run build
```

Shell script using relative paths:

```bash
#!/bin/bash
set -euo pipefail

CONFIG_DIR="./config"
cp "$CONFIG_DIR/settings.json" ./settings.json
```

Shell script using safe system paths (no warning):

```bash
#!/bin/bash
set -euo pipefail

output=$(command 2>/dev/null)
env_path="/usr/bin/env node"
```

## How To Fix

Replace hardcoded absolute paths with portable alternatives:

1. Use `$HOME` instead of `/Users/username` or `/home/username`
2. Use `$PWD` or relative paths instead of absolute project paths
3. Use environment variables for configurable paths
4. Use `$(dirname "$0")` to reference the script's own directory

## Options

This rule does not have any configuration options.

## When Not To Use It

Disable this rule only if:

- The script is specifically designed for a single deployment environment
- The hardcoded path is a system-wide configuration that is identical across all target systems
- You are writing a script that explicitly manages system paths (e.g., provisioning scripts)

## Related Rules

- [skill-shell-script-no-error-handling](./skill-shell-script-no-error-handling.md) - Ensures scripts have proper error handling
- [skill-hardcoded-secrets](./skill-hardcoded-secrets.md) - Detects hardcoded secrets in skill files

## Resources

- [Rule Implementation](../../src/rules/skills/skill-shell-script-hardcoded-paths.ts)
- [Rule Tests](../../tests/rules/skills/skill-shell-script-hardcoded-paths.test.ts)

## Version

Available since: v0.2.0
