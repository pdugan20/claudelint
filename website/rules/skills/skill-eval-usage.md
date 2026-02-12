# skill-eval-usage

<RuleHeader description="Script uses eval/exec which can execute arbitrary code" severity="warn" :fixable="false" :configurable="false" category="Skills" />

## Rule Details

This rule warns when shell scripts use the `eval` command or Python scripts use `eval()` or `exec()`. These functions dynamically execute strings as code, which poses serious security risks including code injection, privilege escalation, and unexpected side effects. Skill scripts should use explicit, predictable logic rather than dynamic code evaluation. The rule checks `.sh` files for shell eval and `.py` files for Python eval/exec.

### Incorrect

Shell script using eval to execute a constructed command

```bash
#!/bin/bash
cmd="ls -la $USER_INPUT"
eval $cmd
```

Python script using eval to parse user input

```bash
user_input = get_input()
result = eval(user_input)
```

Python script using exec to run dynamic code

```bash
code_string = read_file("plugin.py")
exec(code_string)
```

### Correct

Shell script using direct command execution

```bash
#!/bin/bash
ls -la "$SAFE_DIR"
```

Python script using safe parsing instead of eval

```bash
import json
data = json.loads(user_input)
```

## How To Fix

Replace eval/exec with explicit logic. For shell scripts, execute commands directly instead of constructing command strings. For Python, use safe parsers like `json.loads()`, `ast.literal_eval()`, or dedicated libraries for the data format you are processing.

## Options

This rule does not have any configuration options.

## When Not To Use It

Only disable this rule if you have a well-audited use case where dynamic code execution is strictly necessary and all inputs are thoroughly validated and sanitized.

## Related Rules

- [`skill-dangerous-command`](/rules/skills/skill-dangerous-command)
- [`skill-path-traversal`](/rules/skills/skill-path-traversal)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-eval-usage.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-eval-usage.test.ts)

## Version

Available since: v0.2.0
