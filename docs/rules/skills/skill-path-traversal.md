# Rule: skill-path-traversal

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Security

Detects `../` or `..\` sequences in skill scripts that may indicate path traversal vulnerabilities allowing access to files outside intended scope.

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

## How To Fix

1. **Validate input**: Check for `..` sequences and reject paths containing them
2. **Use basename**: Strip all directory components with `basename "$filename"`
3. **Validate resolved paths**: Ensure absolute path is within allowed directory using `os.path.abspath`
4. **Use allowlist**: Only permit specific filenames, reject all others
5. **Canonicalize paths**: Resolve symlinks and `.` / `..` before validation

**Validation Example:**

```bash
if [[ "$filename" == *".."* ]]; then
  echo "Error: Path traversal detected"
  exit 1
fi
```

**Absolute Path Validation:**

```python
def is_safe_path(base_path, user_path):
    base = os.path.abspath(base_path)
    target = os.path.abspath(os.path.join(base_path, user_path))
    return target.startswith(base + os.sep)
```

**Legitimate Use Cases:**

Hardcoded traversal (not user-controlled) is usually safe:

- Relative imports: `source ../lib/common.sh`
- Build scripts: `cd ../.. && make`
- Repository navigation: `git add ../other-file.txt`

Use inline disable for intentional cases:

```bash
# claudelint-disable-next-line skill-path-traversal
cd ../..
make build
```

## Options

This rule does not have configuration options.

## When Not To Use It

Consider disabling if scripts never handle user input for file paths, all paths are hardcoded, or you're writing system administration scripts that intentionally navigate directories. Better to use inline disable comments for specific lines than disable entirely.

## Related Rules

- [skill-dangerous-command](./skill-dangerous-command.md) - Dangerous shell command detection
- [skill-eval-usage](./skill-eval-usage.md) - Eval/exec security risk detection

## Resources

- [Implementation](../../../src/validators/skills.ts)
- [Tests](../../../tests/validators/skills.test.ts)
- [OWASP Path Traversal](https://owasp.org/www-community/attacks/Path_Traversal)
- [CWE-22](https://cwe.mitre.org/data/definitions/22.html)

## Version

Available since: v1.0.0
