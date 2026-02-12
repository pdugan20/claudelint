# skill-path-traversal

<RuleHeader description="Potential path traversal pattern detected" severity="warn" :fixable="false" category="Skills" />

## Rule Details

This rule scans skill script files (.sh, .py, .js, .ts) for path traversal sequences such as `../` or `..\`. These patterns can be exploited to escape the skill working directory and access or modify files elsewhere on the filesystem. Path traversal is a common attack vector in web applications and script-based tools. All file path references in skills should use absolute paths or resolve paths safely.

### Incorrect

Script that reads a file outside the skill directory

```bash
#!/bin/bash
cat ../../../etc/passwd
```

Script that copies files using relative path traversal

```bash
#!/bin/bash
cp ../../secrets/config.json ./output/
```

### Correct

Script that uses an absolute path within the project

```bash
#!/bin/bash
cat "$PROJECT_ROOT/config/settings.json"
```

Script that resolves paths safely before use

```bash
#!/bin/bash
REAL_PATH=$(realpath --relative-to="$SKILL_DIR" "$INPUT_PATH")
if [[ "$REAL_PATH" == ..* ]]; then
  echo "Error: path escapes skill directory"
  exit 1
fi
```

## How To Fix

Replace relative path traversals with absolute paths or use path resolution utilities (such as `realpath` or `path.resolve()`) and validate that the resolved path remains within the expected directory before accessing it.

## Options

This rule does not have any configuration options.

## When Not To Use It

Disable this rule only if your skill legitimately needs to reference parent directories and you have verified that the paths are safe and not influenced by external input.

## Related Rules

- [`skill-dangerous-command`](/rules/skills/skill-dangerous-command)
- [`skill-eval-usage`](/rules/skills/skill-eval-usage)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-path-traversal.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-path-traversal.test.ts)

## Version

Available since: v0.2.0
