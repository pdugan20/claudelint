# Missing Shebang

Shell scripts must start with a shebang line.

## Rule Details

This rule enforces that all shell scripts (`.sh` files) in Claude Code skills begin with a shebang line. The shebang tells the operating system which interpreter to use when executing the script.

Without a shebang, the script may:

- Fail to execute when called directly
- Run with the wrong shell interpreter
- Produce unexpected results across different systems
- Cause confusion about which shell syntax is valid

**Category**: Skills
**Severity**: warning
**Fixable**: Yes (auto-fix available with `--fix`)
**Since**: v1.0.0

### Violation Example

Shell script without shebang:

```bash
# deploy.sh (missing shebang)

set -e
echo "Deploying application..."
./build.sh
```

### Correct Examples

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
```

```bash
#!/usr/bin/env sh
# POSIX shell (more portable)
```

## How To Fix

### Option 1: Auto-fix with claudelint

```bash
claudelint check-all --fix
```

This will automatically add `#!/usr/bin/env bash` to the beginning of all shell scripts.

### Option 2: Manual fix

Add the shebang as the very first line of your script:

```bash
#!/usr/bin/env bash
```

### Choosing the right shebang

- `#!/usr/bin/env bash` - Recommended, finds bash in PATH (portable)
- `#!/bin/bash` - Direct path, less portable across systems
- `#!/usr/bin/env sh` - POSIX shell, most portable but fewer features

## Why It Matters

The shebang line is critical for:

1. **Direct execution**: Allows `./script.sh` instead of `bash script.sh`
2. **Correct interpreter**: Ensures the script runs with the intended shell
3. **Portability**: Uses the system's preferred bash location
4. **IDE support**: Helps IDEs provide correct syntax highlighting

## Options

This rule does not have any configuration options.

## When Not To Use It

You might disable this rule if:

- Your scripts are always executed explicitly with `bash script.sh`
- You're working with included scripts that aren't directly executable
- You have a specific project requirement to avoid shebangs

However, it's generally best practice to include shebangs in all shell scripts.

## Configuration

To disable this rule:

```json
{
  "rules": {
    "skill-missing-shebang": "off"
  }
}
```

To escalate to an error:

```json
{
  "rules": {
    "skill-missing-shebang": "error"
  }
}
```

## Related Rules

- [skill-missing-comments](./skill-missing-comments.md) - Scripts should have explanatory comments
- [skill-dangerous-command](./skill-dangerous-command.md) - Dangerous shell commands

## Resources

- [Shebang (Unix)](https://en.wikipedia.org/wiki/Shebang_(Unix))
- [Bash Best Practices](https://google.github.io/styleguide/shellguide.html)

## Version

Available since: v1.0.0
