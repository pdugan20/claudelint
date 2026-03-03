---
description: Automatically fix claudelint validation issues using --fix. Preview changes with --fix-dry-run, apply fixes safely, and learn which rules are fixable.
---

# Auto-fix

claudelint can automatically fix certain validation issues. Fixes use atomic file writes and can be previewed before applying.

## Usage

### Preview Fixes

See what would be fixed without modifying files:

```bash
claudelint check-all --fix-dry-run
```

**Output:**

```text
 Previewing 3 fixes...

Proposed changes:
Index: .claude/skills/my-skill/test.sh
===================================================================
--- .claude/skills/my-skill/test.sh original
+++ .claude/skills/my-skill/test.sh fixed
@@ -1,1 +1,2 @@
+#!/usr/bin/env bash
 echo "Hello"

✓ 3 fixes would be applied to 3 files
```

### Apply Fixes

```bash
claudelint check-all --fix
```

### Fix by Severity

```bash
# Fix only errors
claudelint check-all --fix --fix-type errors

# Fix only warnings
claudelint check-all --fix --fix-type warnings

# Fix all (default)
claudelint check-all --fix --fix-type all
```

## Fixable Rules

Not all rules support auto-fix — only mechanical changes that don't require human judgment. To see which rules are fixable:

```bash
claudelint list-rules --fixable
```

You can also browse the [Rules Reference](/rules/overview) — fixable rules are tagged with a green "Fixable" badge.

## Recommended Workflow

```bash
claudelint check-all --fix-dry-run   # 1. Preview changes
claudelint check-all --fix            # 2. Apply fixes
claudelint check-all                  # 3. Verify remaining issues
```

## Tips

- **Preview first** — always use `--fix-dry-run` before `--fix`
- **Commit first** — ensure you can `git checkout .` to revert if needed
- **Fix in batches** — use `--fix-type warnings` or `--fix-type errors` for easier review
- **Re-validate** — always run `claudelint check-all` after fixing
- **Caching is disabled** during `--fix` runs (fix functions can't be serialized), so expect slightly slower runs

## Limitations

- Some rules require human judgment and can't be auto-fixed (e.g., `skill-missing-comments`, `import-circular`)
- Fixes are applied sequentially per file — later fixes see the result of earlier ones

For troubleshooting auto-fix issues, see [Troubleshooting](./troubleshooting.md#auto-fix-not-applying).

## See Also

- [Rules Reference](/rules/overview) - See which rules are fixable
- [Configuration](/guide/configuration) - Configure validation rules
- [CLI Reference](/guide/cli-reference) - All command-line options
- [CI/CD Integration](/integrations/ci) - Using auto-fix in CI pipelines
