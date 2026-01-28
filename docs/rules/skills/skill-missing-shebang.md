# Rule: skill-missing-shebang

**Severity**: Warning
**Fixable**: Yes
**Validator**: Skills
**Category**: Security

Enforces that all shell scripts (.sh files) in Claude Code skills begin with a shebang line specifying the interpreter.

## Rule Details

This rule triggers when shell scripts lack a shebang line. The shebang tells the operating system which interpreter to use when executing the script. Without it, scripts may fail to execute when called directly, run with the wrong shell interpreter, produce unexpected results across different systems, and cause confusion about which shell syntax is valid.

The shebang is critical for direct execution (allows `./script.sh` instead of `bash script.sh`), correct interpreter selection (ensures script runs with intended shell), portability (uses system's preferred bash location), and IDE support (helps IDEs provide correct syntax highlighting). This rule is auto-fixable and will add `#!/usr/bin/env bash` to scripts missing shebangs.

### Incorrect

Shell script without shebang:

```bash
# deploy.sh (missing shebang)

set -e
echo "Deploying application..."
./build.sh
```

### Correct

Script with shebang:

```bash
#!/usr/bin/env bash

set -e
echo "Deploying application..."
./build.sh
```

Alternative shebangs:

```bash
#!/bin/bash
# Direct path (less portable)

#!/usr/bin/env sh
# POSIX shell (most portable but fewer features)
```

## How To Fix

1. **Auto-fix with claudelint**: Run `claudelint check-all --fix` to automatically add `#!/usr/bin/env bash` to all shell scripts
2. **Manual fix**: Add the shebang as the very first line of your script
3. **Choose the right shebang**: Use `#!/usr/bin/env bash` (recommended - finds bash in PATH, portable), `#!/bin/bash` (direct path, less portable), or `#!/usr/bin/env sh` (POSIX shell, most portable but fewer features)

**Recommended Shebang:**

```bash
#!/usr/bin/env bash
```

This uses `env` to find bash in the system's PATH, making scripts work across different Unix-like systems where bash might be installed in different locations.

## Options

This rule does not have configuration options.

## When Not To Use It

Consider disabling if your scripts are always executed explicitly with `bash script.sh`, you're working with included scripts that aren't directly executable, or you have a specific project requirement to avoid shebangs. However, it's generally best practice to include shebangs in all shell scripts.

## Related Rules

- [skill-missing-comments](./skill-missing-comments.md) - Scripts should have explanatory comments
- [skill-dangerous-command](./skill-dangerous-command.md) - Dangerous shell commands

## Resources

- [Implementation](../../../src/validators/skills.ts)
- [Tests](../../../tests/validators/skills.test.ts)
- [Google Shell Style Guide](https://google.github.io/styleguide/shellguide.html)

## Version

Available since: v1.0.0
