# claude-md-import-circular

<RuleHeader description="Circular import detected between Claude.md files" severity="warn" :fixable="false" category="CLAUDE.md" />

## Rule Details

When CLAUDE.md files use `@import` directives to include other files, it is possible to create circular dependencies where file A imports file B, which imports file A again. This would cause infinite recursion during import resolution. This rule walks the full import tree, tracking each file in the chain. If a file appears twice in the same import path, a circular dependency is reported. The rule also detects self-imports where a file imports itself.

### Incorrect

File A imports file B, which imports file A (circular)

```markdown
# .claude/rules/api.md

API guidelines.

@import .claude/rules/auth.md

# .claude/rules/auth.md

Auth guidelines.

@import .claude/rules/api.md
```

A file that imports itself

```markdown
# .claude/rules/style.md

Style guidelines.

@import .claude/rules/style.md
```

### Correct

A linear import chain with no cycles

```markdown
# CLAUDE.md

@import .claude/rules/api.md
@import .claude/rules/auth.md
```

## How To Fix

Remove the import that creates the cycle. Reorganize shared content into a separate file that both files can import independently, or merge the circularly dependent files into a single file.

## Options

This rule does not have any configuration options.

## When Not To Use It

There is no reason to disable this rule. Circular imports always indicate a structural problem that should be resolved.

## Related Rules

- [`claude-md-import-missing`](/rules/claude-md/claude-md-import-missing)
- [`claude-md-import-depth-exceeded`](/rules/claude-md/claude-md-import-depth-exceeded)
- [`claude-md-import-read-failed`](/rules/claude-md/claude-md-import-read-failed)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/claude-md/claude-md-import-circular.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/claude-md/claude-md-import-circular.test.ts)

## Version

Available since: v0.2.0
