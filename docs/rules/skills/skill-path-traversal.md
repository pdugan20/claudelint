# Rule: skill-path-traversal

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Security

Potential path traversal pattern detected

## Rule Details

Path traversal attacks manipulate file paths to access sensitive files, read outside application directories, bypass access controls, or execute arbitrary code. This rule triggers on `../` or `..\` patterns which attackers use to traverse directory structures.

The rule detects potential vulnerabilities when user-controlled input constructs file paths without validation. Hardcoded traversal sequences (e.g., `cd ../..`) are also flagged but may be legitimate. Path traversal can allow reading `/etc/passwd`, writing files to unauthorized locations, or deleting system files.

### Incorrect

Path traversal in file reading:

```bash
#!/usr/bin/env bash

# UNSAFE: User can specify path with ../
filename="$1"
cat "$filename"  # Attack: cat "../../etc/passwd"
```

Path traversal in file writing:

```python
#!/usr/bin/env python3

# UNSAFE: User can write to any location
import sys

filename = sys.argv[1]
with open(filename, 'w') as f:  # Attack: "../../../tmp/malicious.sh"
    f.write(get_content())
```

### Correct

Path validation with basename:

```bash
#!/usr/bin/env bash

# Safe: basename removes any directory components
filename=$(basename "$1")
cat "./uploads/$filename"
```

Python with path validation:

```python
#!/usr/bin/env python3

import os
import sys
from pathlib import Path

# Safe: Validate path is within allowed directory
allowed_dir = Path("/var/uploads").resolve()
user_path = Path(sys.argv[1]).resolve()

if not str(user_path).startswith(str(allowed_dir)):
    print("Error: Path outside allowed directory")
    sys.exit(1)

with open(user_path, 'r') as f:
    print(f.read())
```

## Options

This rule does not have configuration options.

## When Not To Use It

Consider disabling if scripts never handle user input for file paths, all paths are hardcoded, or you're writing system administration scripts that intentionally navigate directories. Better to use inline disable comments for specific lines than disable entirely.

## Related Rules

- [skill-dangerous-command](./skill-dangerous-command.md) - Dangerous shell command detection
- [skill-eval-usage](./skill-eval-usage.md) - Eval/exec security risk detection

## How To Fix

Validate and sanitize file paths:

1. Use `basename` to remove directory components
2. Validate paths stay within allowed directories
3. Use absolute paths with resolved canonicalization
4. Reject paths containing `../` or `..\`

Example fixes:

```bash
# Validate with basename
filename=$(basename "$user_input")
cat "./allowed-dir/$filename"

# Validate directory containment
realpath "$user_path" | grep -q "^/allowed/dir/" || exit 1
```

## Resources

- [Rule Implementation](../../src/rules/skills/skill-path-traversal.ts)
- [Rule Tests](../../tests/rules/skills/skill-path-traversal.test.ts)
- [OWASP Path Traversal](https://owasp.org/www-community/attacks/Path_Traversal)
- [CWE-22](https://cwe.mitre.org/data/definitions/22.html)

## Version

Available since: v0.2.0
