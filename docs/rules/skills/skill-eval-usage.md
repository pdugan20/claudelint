# Rule: skill-eval-usage

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Security

Detects use of `eval` in bash scripts and `eval()`/`exec()` in Python scripts which pose significant security risks when handling untrusted input.

## Rule Details

This rule detects `eval` (bash) and `eval()`/`exec()` (Python) which execute arbitrary code from strings. These functions create severe security vulnerabilities: command injection (attackers inject malicious commands), code injection (arbitrary code execution), privilege escalation (running unintended commands with script privileges), and data exfiltration (stealing sensitive information).

In bash, `eval "$user_input"` executes the string as shell commands. In Python, `eval(expression)` evaluates Python expressions and `exec(code)` executes Python statements. Both bypass normal security controls and can lead to complete system compromise if input isn't rigorously validated.

### Incorrect

Bash eval with user input:

```bash
#!/usr/bin/env bash

# UNSAFE: User can inject arbitrary commands
user_input="$1"
eval "$user_input"  # Attack: ./script.sh "echo pwned; rm -rf /"
```

Python eval with user input:

```python
#!/usr/bin/env python3

# UNSAFE: User can execute arbitrary code
user_input = input("Enter expression: ")
result = eval(user_input)  # Attack: __import__('os').system('rm -rf /')
```

### Correct

Bash with arrays and case statements:

```bash
#!/usr/bin/env bash

# Safe: Use case statement for command dispatch
case "$action" in
  list)
    ls -la "$directory"
    ;;
  count)
    find "$directory" -type f | wc -l
    ;;
  *)
    echo "Unknown action: $action"
    exit 1
    ;;
esac
```

Python with ast.literal_eval and JSON:

```python
#!/usr/bin/env python3

import ast
import json

# Safe: ast.literal_eval only evaluates literals (no code execution)
try:
    data = ast.literal_eval(user_input)
except (ValueError, SyntaxError):
    print("Invalid input")

# Safe: Use JSON for structured data
config = json.loads(config_string)
```

## How To Fix

1. **Bash - Use direct execution**: Replace `eval "$command"` with `"${command_array[@]}"` using arrays
2. **Bash - Use case statements**: Replace dynamic command construction with explicit case statements that dispatch to known functions
3. **Python - Use ast.literal_eval**: For evaluating data structures, use `ast.literal_eval()` which only evaluates Python literals (strings, numbers, lists, dicts) without executing code
4. **Python - Use proper parsers**: Replace `eval(config_string)` with `json.loads()`, `yaml.safe_load()`, or `configparser`
5. **Python - Use dictionaries for dispatch**: Replace `exec(f"{function_name}()")` with dictionary mapping function names to actual function objects

**Bash Example:**

```bash
# Before
eval "$action"

# After
case "$action" in
  start) start_service ;;
  stop) stop_service ;;
esac
```

**Python Example:**

```python
# Before
exec(f"{function_name}()")

# After
functions = {'start': start_function, 'stop': stop_function}
if function_name in functions:
    functions[function_name]()
```

## Options

This rule does not have configuration options.

## When Not To Use It

Consider disabling if writing a REPL or code evaluation tool (where executing user code is the purpose), you have rigorous input validation and sandboxing, or you're in a trusted environment with no untrusted input. However, even in these cases eval should be used with extreme caution and safer alternatives should be preferred.

## Related Rules

- [skill-dangerous-command](./skill-dangerous-command.md) - Dangerous shell command detection
- [skill-path-traversal](./skill-path-traversal.md) - Path traversal vulnerability detection

## Resources

- [Implementation](../../../src/validators/skills.ts)
- [Tests](../../../tests/validators/skills.test.ts)
- [OWASP Code Injection](https://owasp.org/www-community/attacks/Code_Injection)
- [Python ast.literal_eval](https://docs.python.org/3/library/ast.html#ast.literal_eval)

## Version

Available since: v1.0.0
