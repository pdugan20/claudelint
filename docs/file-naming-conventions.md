# File Naming Conventions

This document defines the file naming conventions used throughout the claude-code-lint project.

## Documentation Files

### Main Documentation (`docs/*.md`)

**Convention**: `lowercase-with-hyphens.md`

**Examples:**

- ✓ `getting-started.md`
- ✓ `custom-rules.md`
- ✓ `validator-development-guide.md`
- ✓ `rule-development-enforcement.md`
- ✗ `GettingStarted.md`
- ✗ `CUSTOM-RULES.md`
- ✗ `validator_development_guide.md`

**Exception**: `README.md` (uppercase for standard GitHub convention)

### Project Documentation (`docs/projects/*/`)

**Convention**: `lowercase-with-hyphens.md` (matches main documentation)

**Examples:**

- ✓ `implementation-tracker.md`
- ✓ `task-tracker.md`
- ✓ `api-design.md`
- ✗ `IMPLEMENTATION-TRACKER.md`
- ✗ `implementation_tracker.md`

**Exceptions**:

- `README.md` - Standard GitHub convention (uppercase)
- `CHANGELOG.md` - Standard convention for changelogs
- `CONTRIBUTING.md` - Standard convention for contribution guidelines

### Rule Documentation (`docs/rules/{validator}/{rule-id}.md`)

**Convention**: `{rule-id}.md` where rule-id matches the exact rule ID from code

**Examples:**

- ✓ `skill-missing-shebang.md` (matches rule ID: `skill-missing-shebang`)
- ✓ `agent-hooks-invalid-schema.md` (matches rule ID: `agent-hooks-invalid-schema`)
- ✓ `plugin-circular-dependency.md` (matches rule ID: `plugin-circular-dependency`)
- ✗ `skill_missing_shebang.md`
- ✗ `SkillMissingShebang.md`
- ✗ `missing-shebang.md` (missing validator prefix)

**Critical**: The filename MUST exactly match the rule ID defined in `src/rules/rule-ids.ts`

## Source Code Files

### Validators (`src/validators/`)

**Convention**: `lowercase-with-hyphens.ts`

**Examples:**

- ✓ `skills.ts`
- ✓ `claude-md.ts`
- ✓ `json-config-validator.ts`
- ✗ `Skills.ts`
- ✗ `claudeMd.ts`
- ✗ `json_config_validator.ts`

### Schemas (`src/schemas/`)

**Convention**: `lowercase-with-hyphens.ts`

**Examples:**

- ✓ `skill-frontmatter.schema.ts`
- ✓ `agent-frontmatter.schema.ts`
- ✓ `plugin-manifest.schema.ts`
- ✗ `SkillFrontmatter.schema.ts`
- ✗ `skill_frontmatter.schema.ts`

### Utilities (`src/utils/`)

**Convention**: `lowercase-with-hyphens.ts`

**Examples:**

- ✓ `validation-helpers.ts`
- ✓ `plugin-loader.ts`
- ✓ `validator-factory.ts`
- ✗ `ValidationHelpers.ts`
- ✗ `plugin_loader.ts`

### Tests (`tests/`)

**Convention**: `lowercase-with-hyphens.test.ts` (matches source file)

**Examples:**

- ✓ `skills.test.ts` (tests `src/validators/skills.ts`)
- ✓ `validation-helpers.test.ts` (tests `src/utils/validation-helpers.ts`)
- ✓ `skill-missing-shebang.test.ts` (tests specific rule)
- ✗ `Skills.test.ts`
- ✗ `skills_test.ts`

### Scripts (`scripts/`)

**Convention**: `lowercase-with-hyphens.ts`

**Examples:**

- ✓ `check-rule-ids.ts`
- ✓ `check-rule-docs.ts`
- ✓ `generate-quality-report.ts`
- ✗ `CheckRuleIds.ts`
- ✗ `check_rule_ids.ts`

## Directory Naming

### Documentation Directories

**Convention**: `lowercase-with-hyphens/`

**Examples:**

- ✓ `docs/rules/`
- ✓ `docs/projects/`
- ✓ `docs/projects/rule-implementation/`
- ✗ `docs/Rules/`
- ✗ `docs/rule_implementation/`

### Source Directories

**Convention**: `lowercase-with-hyphens/`

**Examples:**

- ✓ `src/validators/`
- ✓ `src/schemas/`
- ✓ `src/utils/`
- ✗ `src/Validators/`
- ✗ `src/schema_files/`

### Test Directories

**Convention**: Mirrors source structure with `lowercase-with-hyphens/`

**Examples:**

- ✓ `tests/validators/`
- ✓ `tests/utils/`
- ✓ `tests/integration/`
- ✗ `tests/Validators/`
- ✗ `tests/unit_tests/`

## Special Files

### Configuration Files (Root)

**Convention**: Standard configuration file names (various cases)

**Examples:**

- ✓ `package.json` (lowercase)
- ✓ `tsconfig.json` (lowercase)
- ✓ `.eslintrc.json` (lowercase with dot prefix)
- ✓ `README.md` (uppercase)
- ✓ `CHANGELOG.md` (uppercase)
- ✓ `CONTRIBUTING.md` (uppercase)
- ✓ `LICENSE` (uppercase, no extension)

### Markdown Files (Root)

**Convention**: `UPPERCASE.md` for important project files

**Examples:**

- ✓ `README.md`
- ✓ `CHANGELOG.md`
- ✓ `CONTRIBUTING.md`
- ✗ `readme.md`
- ✗ `ChangeLog.md`

## Enforcement

### Automated Checks

Create `scripts/check-file-naming.ts` to enforce:

1. **Rule documentation filenames match rule IDs**
   - Extract rule IDs from `src/rules/rule-ids.ts`
   - Check `docs/rules/{validator}/{rule-id}.md` exists
   - Verify exact filename match (case-sensitive)

2. **Documentation follows conventions**
   - `docs/*.md` uses lowercase-with-hyphens
   - `docs/projects/*/*.md` uses lowercase-with-hyphens
   - Exceptions: README.md, CHANGELOG.md, CONTRIBUTING.md

3. **Source files follow conventions**
   - All `.ts` files use lowercase-with-hyphens
   - All `.test.ts` files match source filename + `.test`

4. **Directory naming follows conventions**
   - All directories use lowercase-with-hyphens
   - No underscores, no camelCase, no PascalCase

### Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
npm run check:file-naming
```

### NPM Script

Add to `package.json`:

```json
{
  "scripts": {
    "check:file-naming": "ts-node scripts/check-file-naming.ts"
  }
}
```

## Rationale

### Why lowercase-with-hyphens?

1. **Cross-platform compatibility**: Works on all operating systems (case-sensitive and case-insensitive)
2. **URL-friendly**: Hyphens work well in URLs and documentation links
3. **Consistency**: Matches npm package naming convention
4. **Readability**: Hyphens are easier to read than underscores or no separators

### Why lowercase for all documentation?

1. **Consistency**: All documentation follows the same convention
2. **Simplicity**: No need to remember different conventions for different folders
3. **Standards**: Matches npm package naming and URL-friendly conventions
4. **Exceptions**: Only standard files (README, CHANGELOG, CONTRIBUTING) use uppercase

### Why match rule IDs exactly?

1. **Traceability**: Easy to find documentation for a rule ID
2. **Automation**: Scripts can automatically link code to docs
3. **Consistency**: No confusion about which file documents which rule

## Migration Guide

If you find files not following these conventions:

1. **Rename the file** to match the convention
2. **Update all imports** in source code
3. **Update all links** in documentation
4. **Update git history** if needed:

   ```bash
   git mv old-name.md new-name.md
   ```

5. **Run checks**:

   ```bash
   npm run check:file-naming
   npm run check:all
   ```

## Common Mistakes

### Using underscores instead of hyphens

```text
✗ validation_helpers.ts
✓ validation-helpers.ts
```

### Using camelCase or PascalCase

```text
✗ validationHelpers.ts
✗ ValidationHelpers.ts
✓ validation-helpers.ts
```

### Inconsistent rule doc naming

```text
✗ missing-shebang.md (missing validator prefix)
✗ skill_missing_shebang.md (underscore instead of hyphen)
✓ skill-missing-shebang.md (matches rule ID exactly)
```

### Wrong case in project docs

```text
✗ IMPLEMENTATION-TRACKER.md (should be lowercase to match main docs)
✓ implementation-tracker.md
```

## Exceptions

The following files are exempt from standard conventions:

- `README.md` - Standard GitHub convention (uppercase)
- `CHANGELOG.md` - Standard convention for changelogs
- `CONTRIBUTING.md` - Standard convention for contribution guidelines
- `LICENSE` - Standard convention (no extension, uppercase)
- `package.json` - NPM standard
- `.eslintrc.json` - Tool-specific naming
- `.prettierrc.json` - Tool-specific naming
- `tsconfig.json` - TypeScript standard

## Summary

| Location | Convention | Example |
| --- | --- | --- |
| `docs/*.md` | lowercase-with-hyphens.md | getting-started.md |
| `docs/projects/*/*.md` | lowercase-with-hyphens.md | implementation-tracker.md |
| `docs/rules/{validator}/` | {rule-id}.md | skill-missing-shebang.md |
| `src/**/*.ts` | lowercase-with-hyphens.ts | validation-helpers.ts |
| `tests/**/*.test.ts` | lowercase-with-hyphens.test.ts | validation-helpers.test.ts |
| Root project files | UPPERCASE.md or standard | README.md, CHANGELOG.md, package.json |
