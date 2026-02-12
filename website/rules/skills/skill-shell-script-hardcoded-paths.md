# skill-shell-script-hardcoded-paths

<RuleHeader description="Shell script contains hardcoded absolute paths that reduce portability" severity="warn" :fixable="false" :configurable="false" category="Skills" />

## Rule Details

Hardcoded absolute paths like `/Users/john/project` or `/home/deploy/app` make shell scripts non-portable across different systems, users, and environments. This rule scans `.sh` and `.bash` files for paths under `/Users`, `/home`, `/opt`, `/var`, `/etc`, and `/usr/local`. Standard system paths like `/dev/null`, `/tmp`, `/usr/bin/env`, and shell paths are excluded. Comments and shebang lines are also skipped. Only one warning per file is reported.

### Incorrect

Script with hardcoded home directory path

```bash
#!/bin/bash
set -euo pipefail
CONFIG="/Users/john/project/.config"
```

Script referencing a hardcoded /opt path

```bash
#!/bin/bash
set -euo pipefail
source /opt/mycompany/scripts/common.sh
```

### Correct

Script using environment variables for paths

```bash
#!/bin/bash
set -euo pipefail
CONFIG="$HOME/project/.config"
```

Script using relative paths

```bash
#!/bin/bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/common.sh"
```

## How To Fix

Replace hardcoded absolute paths with environment variables like `$HOME`, `$PWD`, or `$(dirname "$0")` for script-relative paths. Use relative paths when possible.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-shell-script-no-error-handling`](/rules/skills/skill-shell-script-no-error-handling)
- [`skill-path-traversal`](/rules/skills/skill-path-traversal)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-shell-script-hardcoded-paths.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-shell-script-hardcoded-paths.test.ts)

## Version

Available since: v0.2.0
