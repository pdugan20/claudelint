# Rule: skill-eval-usage

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Security

Script uses eval/exec which can execute arbitrary code

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
