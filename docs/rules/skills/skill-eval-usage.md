# Eval Usage

Detects use of `eval` in shell scripts and `eval()`/`exec()` in Python scripts.

## Rule Details

This rule detects the use of `eval` and `exec` functions in skill scripts. These functions execute arbitrary code and pose significant security risks when used with untrusted or user-provided input.

**Bash:** `eval` command executes strings as shell commands
**Python:** `eval()` and `exec()` execute strings as Python code

Security risks:

- **Command injection**: Attackers can inject malicious commands
- **Code injection**: Arbitrary code execution
- **Privilege escalation**: Running unintended commands with script privileges
- **Data exfiltration**: Stealing sensitive information
- **System compromise**: Full system access in worst cases

**Category**: Skills
**Severity**: warning
**Fixable**: No
**Since**: v1.0.0

### Violation Examples

Bash script using eval:

```bash
#!/usr/bin/env bash

# UNSAFE: User input passed to eval
user_input="$1"
eval "$user_input"  # Command injection vulnerability
```text
Bash eval with command construction:

```bash
#!/usr/bin/env bash

# UNSAFE: Dynamically constructing commands
command="ls $user_directory"
eval "$command"  # Can be exploited
```text
Python script using eval:

```python
#!/usr/bin/env python3

# UNSAFE: Evaluating user input
user_input = input("Enter expression: ")
result = eval(user_input)  # Code injection vulnerability
print(result)
```text
Python script using exec:

```python
#!/usr/bin/env python3

# UNSAFE: Executing arbitrary code
code = get_code_from_api()
exec(code)  # Executes arbitrary Python code
```text
### Correct Examples

Bash without eval - use arrays:

```bash
#!/usr/bin/env bash

# Safe: Use arrays instead of eval
commands=("ls" "-la" "$directory")
"${commands[@]}"
```text
Bash without eval - direct execution:

```bash
#!/usr/bin/env bash

# Safe: Execute commands directly
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
```text
Python without eval - use ast.literal_eval for data:

```python
#!/usr/bin/env python3

import ast

# Safe: Only evaluates Python literals (strings, numbers, lists, dicts, etc.)
user_input = "[1, 2, 3]"
try:
    data = ast.literal_eval(user_input)
    print(data)
except (ValueError, SyntaxError):
    print("Invalid input")
```text
Python without eval - use proper parsing:

```python
#!/usr/bin/env python3

import json

# Safe: Use JSON for structured data
config_string = '{"key": "value", "number": 42}'
config = json.loads(config_string)
```text
Python without exec - use importlib for dynamic imports:

```python
#!/usr/bin/env python3

import importlib

# Safe: Import modules properly
module_name = "math"
module = importlib.import_module(module_name)
result = module.sqrt(16)
```text
## Why Eval is Dangerous

### Command Injection Example

```bash
# Vulnerable code
user_input="$1"
eval "echo $user_input"

# Attack:
# ./script.sh "Hello; rm -rf /"
# Result: Deletes entire filesystem
```text
### Code Injection Example

```python
# Vulnerable code
expr = input("Enter calculation: ")
result = eval(expr)

# Attack:
# Input: __import__('os').system('rm -rf /')
# Result: Deletes entire filesystem
```text
## How To Fix

### Bash Scripts

#### Option 1: Use direct command execution
```bash
# Before
eval "$command"

# After
"$command_array[@]"
```text
#### Option 2: Use case statements for dispatch
```bash
# Before
eval "$action"

# After
case "$action" in
  start)
    start_service
    ;;
  stop)
    stop_service
    ;;
esac
```text
#### Option 3: Use functions instead of dynamic commands
```bash
# Before
cmd="process_$type"
eval "$cmd"

# After
case "$type" in
  json) process_json ;;
  xml) process_xml ;;
esac
```text
### Python Scripts

#### Option 1: Use ast.literal_eval for safe evaluation
```python
# Before
data = eval(user_input)

# After
import ast
data = ast.literal_eval(user_input)  # Only evaluates literals
```text
#### Option 2: Use proper parsers
```python
# Before
config = eval(config_string)

# After
import json
config = json.loads(config_string)
```text
#### Option 3: Use dictionaries for dispatch
```python
# Before
exec(f"{function_name}()")

# After
functions = {
    'start': start_function,
    'stop': stop_function,
}
if function_name in functions:
    functions[function_name]()
```text
## When Eval Might Be Acceptable

Very rare legitimate uses:

1. **Dynamic property access** (but prefer `getattr()`)
2. **Configuration DSLs** (but prefer YAML/JSON)
3. **Mathematical expression evaluation** (but prefer `ast.literal_eval` or expression libraries)

Even in these cases, safer alternatives usually exist.

## Security Best Practices

1. **Never use eval with user input**: Always validate and sanitize
2. **Use allowlists**: If eval is unavoidable, strictly limit what can be executed
3. **Use safer alternatives**: Arrays, case statements, dictionaries, proper parsers
4. **Validate input rigorously**: Check against expected patterns
5. **Principle of least privilege**: Run scripts with minimal permissions

## Options

This rule does not have any configuration options.

## When Not To Use It

You might disable this rule if:

- You're writing a REPL or code evaluation tool (the purpose is to execute code)
- You have rigorous input validation and sandboxing in place
- You're in a trusted environment with no untrusted input

However, even in these cases, eval should be used with extreme caution.

## Configuration

To disable this rule:

```json
{
  "rules": {
    "skill-eval-usage": "off"
  }
}
```text
To escalate to an error:

```json
{
  "rules": {
    "skill-eval-usage": "error"
  }
}
```text
## Related Rules

- [skill-dangerous-command](./skill-dangerous-command.md) - Detects dangerous shell commands
- [skill-path-traversal](./skill-path-traversal.md) - Detects path traversal vulnerabilities

## Resources

- [OWASP Code Injection](https://owasp.org/www-community/attacks/Code_Injection)
- [Python eval() considered harmful](https://nedbatchelder.com/blog/201206/eval_really_is_dangerous.html)
- [Bash eval alternatives](https://mywiki.wooledge.org/BashFAQ/048)
- [ast.literal_eval documentation](https://docs.python.org/3/library/ast.html#ast.literal_eval)

## Version

Available since: v1.0.0
