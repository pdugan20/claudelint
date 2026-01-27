# Path Traversal

Detects potential path traversal vulnerabilities in file operations.

## Rule Details

This rule detects the use of `../` or `..\` sequences in skill scripts, which may indicate path traversal vulnerabilities. Path traversal attacks allow attackers to access files and directories outside the intended scope by manipulating file paths.

A path traversal vulnerability occurs when user-controlled input is used to construct file paths without proper validation, allowing attackers to:

- Access sensitive files (passwords, configuration, source code)
- Read files outside the application directory
- Bypass access controls
- Potentially execute arbitrary code

This rule triggers when it detects `../` or `..\` patterns in script content, which are common indicators of path traversal operations.

**Category**: Skills
**Severity**: warning
**Fixable**: No
**Since**: v1.0.0

### Violation Examples

Path traversal in file reading:

```bash
#!/usr/bin/env bash

# UNSAFE: User can specify path with ../
filename="$1"
cat "$filename"  # Can access: cat "../../etc/passwd"
```

Path traversal in file writing:

```python
#!/usr/bin/env python3

# UNSAFE: User can write to any location
import sys

filename = sys.argv[1]
with open(filename, 'w') as f:  # Can write to: "../../../tmp/malicious.sh"
    f.write(get_content())
```

Path traversal in directory operations:

```bash
#!/usr/bin/env bash

# UNSAFE: Can delete files outside intended directory
user_file="$1"
rm -f "./uploads/$user_file"  # Can be exploited with: "../../important_file.txt"
```

Hardcoded path traversal (legitimate use but flagged):

```bash
#!/usr/bin/env bash

# Flagged but may be intentional
cd ../..
make build
```

### Correct Examples

Path validation before use:

```bash
#!/usr/bin/env bash

# Safe: Validate path doesn't contain traversal sequences
filename="$1"

if [[ "$filename" == *".."* ]] || [[ "$filename" == *"/"* ]]; then
  echo "Error: Invalid filename"
  exit 1
fi

cat "./data/$filename"
```

Use basename to strip path components:

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

Python with safe path joining:

```python
#!/usr/bin/env python3

import os

# Safe: Use os.path.join and validate result
base_dir = "/var/uploads"
filename = os.path.basename(input("Filename: "))  # Strip any path components
full_path = os.path.join(base_dir, filename)

# Verify path is still within base_dir
if not os.path.abspath(full_path).startswith(os.path.abspath(base_dir)):
    print("Error: Invalid path")
    exit(1)

with open(full_path, 'r') as f:
    print(f.read())
```

## Attack Examples

### Example 1: Reading /etc/passwd

```bash
# Vulnerable script
#!/usr/bin/env bash
cat "./data/$1"

# Attack
./script.sh "../../etc/passwd"
# Result: Reads /etc/passwd
```

### Example 2: Writing to unauthorized location

```python
# Vulnerable script
filename = user_input
with open(f"./uploads/{filename}", 'w') as f:
    f.write(data)

# Attack
filename = "../../../tmp/backdoor.sh"
# Result: Writes backdoor outside uploads directory
```

### Example 3: Deleting system files

```bash
# Vulnerable script
rm -f "./temp/$1"

# Attack
./script.sh "../../../important_file.txt"
# Result: Deletes file outside temp directory
```

## How To Fix

### Option 1: Validate input rigorously

```bash
# Check for traversal sequences
if [[ "$filename" == *".."* ]]; then
  echo "Error: Path traversal detected"
  exit 1
fi
```

### Option 2: Use basename

```bash
# Strip all directory components
safe_filename=$(basename "$filename")
cat "./data/$safe_filename"
```

### Option 3: Use absolute path validation

```python
import os

def is_safe_path(base_path, user_path):
    # Resolve to absolute paths
    base = os.path.abspath(base_path)
    target = os.path.abspath(os.path.join(base_path, user_path))

    # Check if target is within base
    return target.startswith(base + os.sep)

if not is_safe_path("/var/uploads", user_file):
    raise ValueError("Path traversal detected")
```

### Option 4: Use allowlist of filenames

```bash
# Only allow specific filenames
case "$filename" in
  config.json|data.csv|report.txt)
    cat "./data/$filename"
    ;;
  *)
    echo "Error: File not allowed"
    exit 1
    ;;
esac
```

## When Path Traversal is Legitimate

Some legitimate uses of `../`:

1. **Relative imports in scripts**: `source ../lib/common.sh`
2. **Build scripts**: `cd ../.. && make`
3. **Repository navigation**: `git add ../other-file.txt`

In these cases:

- The path is hardcoded, not user-controlled
- The script author intends to access parent directories
- No security risk exists

You can suppress the warning with an inline disable comment:

```bash
# claudelint-disable-next-line skill-path-traversal
cd ../..
make build
```

## Security Best Practices

1. **Never trust user input**: Always validate and sanitize file paths
2. **Use basename**: Strip directory components from user input
3. **Validate resolved paths**: Ensure final path is within allowed directory
4. **Use allowlists**: Prefer explicitly allowed files over blocklists
5. **Canonicalize paths**: Resolve symlinks and `.` / `..` before validation
6. **Principle of least privilege**: Run with minimal file access permissions

## Options

This rule does not have any configuration options.

## When Not To Use It

You might disable this rule if:

- Your scripts never handle user input for file paths
- All file paths are hardcoded by the developer
- You're writing system administration scripts that intentionally navigate directories

However, it's better to use inline disable comments for specific lines than disable the rule entirely.

## Configuration

To disable this rule:

```json
{
  "rules": {
    "skill-path-traversal": "off"
  }
}
```

To escalate to an error:

```json
{
  "rules": {
    "skill-path-traversal": "error"
  }
}
```

## Related Rules

- [skill-dangerous-command](./skill-dangerous-command.md) - Detects dangerous shell commands
- [skill-eval-usage](./skill-eval-usage.md) - Detects eval/exec security risks

## Resources

- [OWASP Path Traversal](https://owasp.org/www-community/attacks/Path_Traversal)
- [CWE-22: Path Traversal](https://cwe.mitre.org/data/definitions/22.html)
- [Python Path Security](https://docs.python.org/3/library/pathlib.html)

## Version

Available since: v1.0.0
