# Rule: commands-in-plugin-deprecated

**Severity**: Warning
**Fixable**: No
**Validator**: Plugin
**Category**: Deprecation

The commands field in plugin.json is deprecated

## Rule Details

The `commands` field in `plugin.json` is deprecated in favor of the `skills` field. While commands continue to work for backward compatibility, skills provide better structure, versioning, and documentation. Plugins should migrate from commands to skills for improved maintainability and feature support.

Skills offer several advantages over commands:

- **Better structure**: Skills use a dedicated directory with SKILL.md documentation
- **Versioning**: Skills can specify required versions and dependencies
- **Documentation**: Skills include inline documentation and usage examples
- **Arguments**: Skills support typed arguments with validation
- **Composition**: Skills can depend on other skills

This rule warns when `plugin.json` contains a non-empty `commands` array, suggesting migration to the `skills` field instead.

### Incorrect

Using deprecated commands field:

```json
{
  "name": "dev-tools",
  "version": "1.0.0",
  "description": "Development utilities",
  "commands": ["build", "test", "deploy"]
}
```

### Correct

Using recommended skills field:

```json
{
  "name": "dev-tools",
  "version": "1.0.0",
  "description": "Development utilities",
  "skills": ["build", "test", "deploy"]
}
```

Complete migration with skill structure:

```json
{
  "name": "dev-tools",
  "version": "1.0.0",
  "description": "Development utilities",
  "skills": ["build", "test", "deploy"]
}
```

```text
.claude/skills/build/SKILL.md
.claude/skills/test/SKILL.md
.claude/skills/deploy/SKILL.md
```

## How To Fix

To migrate from commands to skills:

1. **Check current commands** in plugin.json:

   ```bash
   cat plugin.json | jq '.commands'
   ```

2. **Create skill directories** for each command:

   ```bash
   # For each command, create a skill directory
   mkdir -p .claude/skills/build
   mkdir -p .claude/skills/test
   mkdir -p .claude/skills/deploy
   ```

3. **Create SKILL.md files** with documentation:

   ```bash
   # Create SKILL.md for each skill
   cat > .claude/skills/build/SKILL.md << 'EOF'
   ---
   name: build
   description: Build the project
   ---

   # Build

   Builds the project using the configured build system.

   ## Usage

   ```bash
   npm run build
   ```

   EOF

   ```

4. **Update plugin.json** to use skills field:

   ```json
   {
     "name": "dev-tools",
     "version": "1.0.0",
     "description": "Development utilities",
     "skills": ["build", "test", "deploy"]
   }
   ```

5. **Remove commands field**:

   ```bash
   # Use jq to remove commands field
   jq 'del(.commands)' plugin.json > plugin.json.tmp
   mv plugin.json.tmp plugin.json
   ```

6. **Run validation**:

   ```bash
   claude-code-lint check-plugin
   ```

## Options

This rule does not have configuration options.

## When Not To Use It

You may temporarily suppress this warning if:

- You need to maintain backward compatibility with older Claude Code versions
- You're in the middle of a gradual migration from commands to skills
- Your plugin specifically targets environments that don't support skills yet

However, all new plugins should use skills instead of commands, and existing plugins should plan migration to benefit from improved structure and documentation.

## Related Rules

- [plugin-invalid-manifest](./plugin-invalid-manifest.md) - Validates plugin manifest structure
- [plugin-missing-file](./plugin-missing-file.md) - Ensures referenced files exist

## Resources

- [Rule Implementation](../../src/rules/plugin/commands-in-plugin-deprecated.ts)
- [Rule Tests](../../tests/rules/plugin/commands-in-plugin-deprecated.test.ts)
- [Plugin Development Guide](https://github.com/anthropics/claude-code)

## Version

Available since: v1.0.0
