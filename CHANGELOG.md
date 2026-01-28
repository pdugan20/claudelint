# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

#### BREAKING: Exit Code Standardization

Exit codes now follow POSIX/Unix standard conventions to improve compatibility with CI/CD systems and shell scripts.

**Previous behavior (v0.1.0):**

```bash
claudelint check-all
# Exit 2 if validation errors found
# Exit 1 if only warnings found
# Exit 0 if no issues
```

**New behavior (v1.0.0):**

```bash
claudelint check-all
# Exit 0 - Success (no issues)
# Exit 1 - Validation issues (errors OR warnings)
# Exit 2 - Fatal error (crash, invalid config, etc.)
```

**Rationale:**

This change aligns with standard linting tools (ESLint, Prettier, etc.) and POSIX conventions where:

- Exit 0 = success
- Exit 1 = expected failure (linting issues)
- Exit 2 = unexpected failure (program error)

Most CI systems treat any non-zero exit as failure, making this change transparent for typical setups.

**Migration Guide:**

**No changes needed** if you:

- Use standard CI checks: `if [ $? -ne 0 ]; then fail; fi`
- Check for non-zero exit: `claudelint check-all || exit 1`
- Run in CI with default failure behavior

**Changes required** if you:

1. **Explicitly check exit code 2 for errors:**

   ```bash
   # Before (v0.1.0)
   claudelint check-all
   if [ $? -eq 2 ]; then
     echo "Errors found!"
     exit 1
   fi

   # After (v1.0.0)
   claudelint check-all
   if [ $? -eq 1 ]; then
     echo "Issues found!"
     exit 1
   fi
   ```

2. **Differentiate warnings from errors in CI:**

   ```bash
   # Before (v0.1.0)
   claudelint check-all
   EXIT_CODE=$?
   if [ $EXIT_CODE -eq 2 ]; then
     echo "Errors - fail build"
     exit 1
   elif [ $EXIT_CODE -eq 1 ]; then
     echo "Warnings - continue but notify"
     # Post comment to PR
   fi

   # After (v1.0.0) - Use JSON output for detailed analysis
   claudelint check-all --format json > results.json
   ERRORS=$(jq '.summary.errors' results.json)
   WARNINGS=$(jq '.summary.warnings' results.json)

   if [ $ERRORS -gt 0 ]; then
     echo "Errors found - fail build"
     exit 1
   elif [ $WARNINGS -gt 0 ]; then
     echo "Warnings found - notify team"
     # Post comment to PR
   fi
   ```

3. **GitHub Actions workflow:**

   ```yaml
   # Before (v0.1.0)
   - name: Run claudelint
     run: |
       claudelint check-all
       if [ $? -eq 2 ]; then
         echo "::error::Validation errors found"
         exit 1
       fi

   # After (v1.0.0) - Simpler
   - name: Run claudelint
     run: claudelint check-all
     # Automatically fails on exit 1

   # Or with warning threshold
   - name: Run claudelint
     run: claudelint check-all --max-warnings 0
     # Fails if any warnings/errors
   ```

4. **Want old behavior? Use flags:**

   ```bash
   # Treat warnings as success (exit 0)
   claudelint check-all --quiet

   # Fail only on errors, allow warnings
   claudelint check-all --max-warnings 999

   # Strict mode: fail on everything including info
   claudelint check-all --strict
   ```

**Alternative: JSON output for detailed control:**

```bash
# Get structured results
claudelint check-all --format json > results.json

# Parse results in your script
ERROR_COUNT=$(jq '.summary.errors' results.json)
WARNING_COUNT=$(jq '.summary.warnings' results.json)

# Custom logic
if [ $ERROR_COUNT -gt 0 ]; then
  echo "Found $ERROR_COUNT errors - blocking deployment"
  exit 1
elif [ $WARNING_COUNT -gt 5 ]; then
  echo "Too many warnings ($WARNING_COUNT) - please fix"
  exit 1
fi
```

**Testing your migration:**

```bash
# Create a test file with known issues
echo "# Test" > CLAUDE.md
printf '%040000s' | tr ' ' 'x' >> CLAUDE.md  # 40KB+ file

# v1.0.0 behavior
claudelint check-claude-md
echo "Exit code: $?"  # Should be 1 (issues found)

# Verify CI compatibility
claudelint check-all || echo "Failed as expected"
```

For more details, see the [migration guide](./docs/MIGRATION.md).

### Added

#### Core Validators (6 validators, 27 rules)

**CLAUDE.md Validator** (4 rules)

- File size validation with Claude context window limits
  - Warning at 35KB (approaching limit)
  - Error at 40KB (exceeds recommended limit)
- `@import` statement validation and file existence checks
- Recursive import depth detection (max 5 levels)
- YAML frontmatter schema validation for `.claude/rules/*.md` files
- Glob pattern validation for `paths` fields

**Skills Validator** (11 rules)

- `SKILL.md` file existence and structure validation
- YAML frontmatter schema compliance
- Security checks: dangerous commands, eval usage, path traversal detection
- Best practices: shebang requirements, inline documentation
- Metadata validation: changelogs, examples, versioning
- String substitution syntax (`{{VAR}}`) validation
- `allowed-tools` and `allowed-prompts` validation

**Settings Validator** (3 rules)

- JSON schema validation using Zod
- Permission rule syntax validation
- Environment variable naming validation
- File path existence verification

**Hooks Validator** (3 rules)

- hooks.json schema compliance
- Event name validation against Claude Code events
- Script file existence and executability checks
- Matcher pattern syntax validation

**MCP Server Validator** (3 rules)

- .mcp.json schema validation
- Server name uniqueness enforcement
- Transport type validation (stdio, sse)
- Environment variable syntax validation

**Plugin Validator** (3 rules)

- plugin.json schema compliance
- Semantic versioning validation
- Directory structure verification
- Cross-reference validation (skills, agents)
- marketplace.json schema validation

**Total:** 27 validation rules covering all Claude Code configuration files

#### Architecture & Performance

**Rule Registry System**

- Centralized metadata for all 27 validation rules
- Single source of truth for rule definitions
- Config validation against known rules
- Documentation generation support
- IDE integration readiness
- Plugin rule registration

**Validator Registry & Factory**

- Self-registration pattern for validators
- Dynamic validator discovery
- Plugin validator integration
- Factory pattern for validator instantiation
- Metadata-driven validator management

**Composition Framework**

- Functional validator composition (inspired by FP patterns)
- Reusable validation primitives: `compose()`, `optional()`, `conditional()`, `all()`, `any()`
- Type-safe composable validators
- Reduced code duplication
- Enhanced testability
- Plugin-friendly validator building blocks

**Plugin System**

- Automatic plugin discovery (`claudelint-plugin-*` packages)
- PluginLoader for loading and validation
- Plugin API: `register(validatorRegistry, ruleRegistry, composition)`
- Custom validator support
- Custom rule registration
- Composition framework access for plugins
- Error isolation (plugin failures don't crash validation)

**Performance Optimizations**

- **Parallel Validation**: Concurrent validator execution using `Promise.all()`
  - ~3.5x speedup over sequential execution
  - Wall-clock time: ~128ms for full validation
- **Smart Caching**: mtime-based validation result caching
  - ~2.4x speedup on warm cache (cold: ~204ms, warm: ~84ms)
  - Cache hit rate: 90%+ on unchanged files
  - Automatic invalidation on file changes or version updates
- **Progress Indicators**: Real-time validation feedback
  - Automatic CI detection (disables spinners in CI)
  - Timing information per validator
  - Minimal overhead (<5%)

#### CLI Commands (13 commands)

**Validation Commands:**

- `check-all` - Run all validators
- `check-claude-md` - Validate CLAUDE.md files
- `check-skills` - Validate skills
- `check-settings` - Validate settings.json
- `check-hooks` - Validate hooks.json
- `check-mcp` - Validate MCP server configs
- `check-plugin` - Validate plugin manifests

**Configuration Commands:**

- `init` - Interactive configuration wizard (with `--yes` flag)
- `print-config` - Display resolved configuration
- `resolve-config <file>` - Show effective config for specific file
- `validate-config` - Validate configuration file schema

**Utility Commands:**

- `list-rules` - Browse and filter validation rules by category
- `cache-clear` - Clear validation cache

#### CLI Options & Flags

**Output Formats:**

- `--format <type>` - Output format: stylish (default), json, compact
- `--verbose` - Detailed validation output
- `--quiet` - Minimal output (only errors)
- `--show-docs-url` - Display documentation URLs for triggered rules

**Strictness & Thresholds:**

- `--strict` - Fail on any issues (errors, warnings, or info)
- `--max-warnings <number>` - Enforce warning count limits
- `--warnings-as-errors` - Treat all warnings as errors

**Auto-fix:**

- `--fix` - Automatically apply fixes to problems
- `--fix-dry-run` - Preview fixes without applying them
- `--fix-type <type>` - Fix only errors, warnings, or all issues

**Caching:**

- `--cache` / `--no-cache` - Enable/disable validation caching (default: enabled)
- `--cache-location <path>` - Custom cache directory (default: `.claudelint-cache/`)

**Path Options:**

- `--path <path>` - Custom path to validate
- `--ignore-pattern <pattern>` - Additional ignore patterns

#### Configuration Features

**Configuration Files:**

- `.claudelintrc.json` - Project configuration
- `.claudelintrc.js` - JavaScript configuration with logic
- `.claudelintrc.yaml` - YAML configuration
- `package.json` - `claudelint` field support
- `.claudelintignore` - Ignore patterns (gitignore-style)

**Inline Directives:**

- `<!-- claudelint-disable -->` - Disable all rules for block
- `<!-- claudelint-disable rule-name -->` - Disable specific rule
- `<!-- claudelint-enable -->` - Re-enable rules
- `<!-- claudelint-disable-next-line -->` - Disable for next line
- `<!-- claudelint-disable-line -->` - Disable for current line
- **Unused directive detection** with `reportUnusedDisableDirectives` option

**Rule Configuration:**

```json
{
  "rules": {
    "size-error": "error",
    "size-warning": "off",
    "import-missing": "warn"
  },
  "plugins": ["mycompany"],
  "extends": ["claudelint:recommended"]
}
```

#### Documentation (30+ pages)

**User Guides:**

- Getting Started guide
- CLI reference (13 commands documented)
- Configuration guide
- Auto-fix guide
- Caching guide
- Debugging guide
- Inline disables guide
- Formatting tools integration guide

**Developer Guides:**

- Architecture documentation (comprehensive system overview)
- Validator development guide
- Plugin development guide
- Composition framework guide

**Rule Documentation:**

- 27 individual rule pages (ESLint-style)
- Per-rule examples and explanations
- Fix suggestions for each rule
- When to disable guidance

**Integration Examples:**

- GitHub Actions workflows
- Pre-commit hooks
- npm scripts
- CI/CD pipeline examples

#### Claude Code Plugin Integration

**Skills (8 validation skills):**

- `validate-all` - Run all validators
- `validate-claude-md` - CLAUDE.md validation
- `validate-skills` - Skills validation
- `validate-settings` - Settings validation
- `validate-hooks` - Hooks validation
- `validate-mcp` - MCP validation
- `validate-plugin` - Plugin validation
- `check-rules` - Browse available rules

**Hooks:**

- `SessionStart` hook - Automatic validation on session start
- `PreToolUse` hook - Validate before file writes (optional)

**Plugin Manifest:**

- `.claude-plugin/plugin.json` - Claude Code plugin metadata
- `.claude-plugin/marketplace.json` - Marketplace listing

#### Development Infrastructure

**Testing:**

- 202+ test cases covering all validators
- Unit tests for individual validators
- Integration tests for CLI
- Composition framework tests
- Plugin system tests
- Helper utilities and custom matchers

**CI/CD:**

- GitHub Actions workflow for testing
- Automated npm publishing on release
- Pre-commit hooks (husky + lint-staged)
- Commitlint for conventional commits

**Code Quality:**

- TypeScript strict mode
- ESLint + Prettier configuration
- 100% TypeScript codebase
- Comprehensive JSDoc comments

#### Performance Benchmarks

Real-world performance on typical Claude Code projects:

```bash
# First run (cold cache)
$ time claudelint check-all
✓ All validation passed
204ms

# Second run (warm cache)
$ time claudelint check-all
✓ All validation passed (from cache)
84ms

# Speedup: ~2.4x with caching
```

Validator execution times (parallel):

- CLAUDE.md: ~13ms
- Skills: ~18ms
- Settings: ~10ms
- Hooks: ~7ms
- MCP: ~5ms
- Plugin: ~10ms
- **Total wall-clock:** ~128ms (includes overhead)

**vs. Sequential execution:** ~63ms total validator time → ~3.5x speedup with parallelization

## [0.1.0] - 2026-01-27

### Added

- Initial development version
- Core infrastructure and architecture
- Basic validation capabilities
- Test suite with 202+ tests

[Unreleased]: https://github.com/pdugan20/claudelint/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/pdugan20/claudelint/releases/tag/v0.1.0
