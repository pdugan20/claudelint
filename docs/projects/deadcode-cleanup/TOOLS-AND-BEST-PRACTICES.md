# Deadcode Detection Tools & Industry Best Practices

Comprehensive guide to automated deadcode detection for the claudelint project, based on 2026 industry standards.

## Executive Summary

**Recommended Stack**:
- **Knip** - Primary deadcode detector (unused exports, files, dependencies)
- **depcheck** - Backup dependency analyzer
- **TypeScript** - Native compiler options (noUnusedLocals, noUnusedParameters)
- **ESLint** - Runtime unused variable detection

**Quick Start**: Install Knip and run `npx knip` (works out of the box)

---

## Tool Comparison Matrix

| Tool | What It Finds | Speed | Accuracy | Maintenance | Best For |
|------|---------------|-------|----------|-------------|----------|
| **Knip** * | Exports, files, deps, class members | Fast | High | Active | Everything |
| **ts-prune** | Exports only | Fast | Medium | Archived | Legacy projects |
| **tsr** | Exports (auto-removes) | Fast | High | Active | Automated cleanup |
| **depcheck** | Dependencies | Fast | Medium | Active | Deps only |
| **ESLint** | Variables, params | Medium | High | Active | Runtime checks |
| **TypeScript** | Locals, params | Fast | High | Active | Compile-time |

* = Recommended

---

## 1. Knip (Primary Recommendation)

### What It Is

[Knip](https://knip.dev) is the **industry-leading deadcode detector** for JavaScript and TypeScript projects. It's the recommended successor to ts-prune and is actively maintained.

**Created by**: Lars Willighagen (webpro-nl)
**Status**: Active development (v5.81.0 as of Jan 2026)
**GitHub**: 6.8k+ stars

### What It Detects

- [x] Unused exports (functions, classes, types, interfaces)
- [x] Unused files (never imported)
- [x] Unused dependencies in package.json
- [x] Unused devDependencies
- [x] Unused class members and enum members
- [x] Duplicate exports
- [x] Missing dependencies
- [x] Circular dependencies

### Why Knip Over ts-prune

According to [Effective TypeScript](https://effectivetypescript.com/2023/07/29/knip/):

> ts-prune is now in maintenance mode. Use knip to find dead code instead.

Key advantages:
- **More comprehensive**: Detects mutually recursive dead code (A→B, B→A, nothing→A)
- **Better framework support**: 100+ plugins (Jest, Vite, Next.js, etc.)
- **Dependency analysis**: Reports unused packages
- **Active development**: Regular updates and bug fixes

See [comparison article](https://levelup.gitconnected.com/dead-code-detection-in-typescript-projects-why-we-chose-knip-over-ts-prune-8feea827da35) for detailed analysis.

### Installation

```bash
# Install as dev dependency
npm install --save-dev knip

# Or run directly without installation
npx knip
```

### Configuration

Knip works **zero-config** for most projects. For claudelint, create `knip.config.ts`:

```typescript
// knip.config.ts
import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  // Entry points (what's considered "used")
  entry: [
    'src/index.ts',              // Main export
    'src/cli/claudelint.ts',     // CLI entry
    'scripts/**/*.ts',           // Utility scripts
  ],

  // Project files to analyze
  project: [
    'src/**/*.ts',
    'tests/**/*.ts',
  ],

  // Files/patterns to ignore
  ignore: [
    'dist/**',                   // Build artifacts
    'coverage/**',               // Test coverage
    '**/*.test.ts',              // Test files (analyzed separately)
    'examples/**',               // Example code
    'docs/**',                   // Documentation
  ],

  // Dependencies that are used but Knip might miss
  ignoreDependencies: [
    // CLI dependencies used dynamically
    'commander',
    'inquirer',
  ],

  // Don't report these as unused exports (external API)
  ignoreExportsUsedInFile: true,

  // Plugin configuration
  jest: {
    config: ['jest.config.js'],
  },
};

export default config;
```

[Configuration reference](https://knip.dev/reference/configuration)

### Usage

```bash
# Basic analysis
npx knip

# Show production dependencies only
npx knip --production

# Include entry files in report
npx knip --include-entry-exports

# Export results as JSON
npx knip --reporter json > knip-report.json

# Show more details
npx knip --debug

# Fix auto-fixable issues
npx knip --fix
```

### Example Output

```text
Unused files (2)
  src/utils/old-helper.ts
  scripts/deprecated.ts

Unused dependencies (1)
  lodash

Unused exports (3)
  createValidator  src/validators/factory.ts:15
  parseOptions     src/utils/options.ts:42
  OldInterface     src/types/legacy.ts:8

Unused devDependencies (1)
  @types/unused-package
```

### CI/CD Integration

Add to GitHub Actions workflow:

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  deadcode:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Check for deadcode
        run: npx knip --production
```

### Integration with claudelint

Add to `package.json`:

```json
{
  "scripts": {
    "check:deadcode": "knip",
    "check:deadcode:production": "knip --production",
    "check:deadcode:fix": "knip --fix"
  }
}
```

Run quarterly or before major releases:

```bash
npm run check:deadcode
```

---

## 2. depcheck (Dependency Analysis)

### What It Is

[depcheck](https://github.com/depcheck/depcheck) is a specialized tool for finding unused dependencies in package.json.

**Why Use It**: Knip covers this too, but depcheck is more conservative and has fewer false positives for edge cases.

### Installation

```bash
npm install --save-dev depcheck
```

### Usage

```bash
# Basic check
npx depcheck

# With options
npx depcheck --ignores="@types/*,eslint-*"

# JSON output
npx depcheck --json > depcheck-report.json
```

### Configuration

Create `.depcheckrc`:

```json
{
  "ignores": [
    "@types/*",
    "typescript",
    "@typescript-eslint/*"
  ],
  "skip-missing": true
}
```

[Configuration guide](https://www.geeksforgeeks.org/node-js/depcheck-npm/)

### Best Practices

From [this cleanup guide](https://luisrangelc.medium.com/cleaning-up-unused-dependencies-af9654e270ad):

1. **Manual Verification**: Before deleting anything, verify that listed unused dependencies are not used (dynamic imports, config files)
2. **Test After Cleanup**: Run full test suite after removing dependencies
3. **Automation**: Integrate into CI/CD pipeline

---

## 3. TypeScript Compiler (Built-in)

### Native Detection

TypeScript has built-in deadcode detection via compiler options.

### Configuration

Enable in `tsconfig.json`:

```json
{
  "compilerOptions": {
    // Report errors on unused locals
    "noUnusedLocals": true,

    // Report errors on unused parameters
    "noUnusedParameters": true,

    // Report errors when not all code paths return a value
    "noImplicitReturns": true,

    // Report errors for fallthrough cases in switch statements
    "noFallthroughCasesInSwitch": true
  }
}
```

### What It Catches

- Unused variables within functions
- Unused function parameters
- Unused imports (partially)

### Limitations

According to [LogRocket](https://blog.logrocket.com/how-detect-dead-code-frontend-project/):

> TypeScript's noUnusedLocals only catches module-level unused code. It won't catch exported but unused code.

**Use with Knip**: TypeScript catches file-level issues, Knip catches project-level issues.

---

## 4. ESLint + typescript-eslint

### What It Is

[typescript-eslint](https://typescript-eslint.io/rules/no-unused-vars/) provides runtime deadcode detection integrated into your linting workflow.

### Configuration

Already configured in claudelint! Update `.eslintrc.json`:

```json
{
  "extends": [
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    // Enhanced unused variable detection
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",        // Allow _unused parameters
        "varsIgnorePattern": "^_",        // Allow _unused variables
        "caughtErrorsIgnorePattern": "^_" // Allow _err in catch blocks
      }
    ]
  }
}
```

### What It Catches

- Unused variables
- Unused function parameters
- Unused imports
- Unused catch bindings

### Best Practices

From [johnnyreilly](https://johnnyreilly.com/typescript-eslint-no-unused-vars):

- Prefix intentionally unused variables with `_` (e.g., `_unusedParam`)
- ESLint will ignore these per the pattern above

---

## 5. tsr (TypeScript Remove) - Automated Cleanup

### What It Is

[tsr](https://github.com/line/tsr) by LINE is a tool that **automatically removes** unused code.

**Warning**: Automated removal is risky! Use with caution.

### Installation

```bash
npm install --save-dev @line/tsr
```

### Usage

```bash
# Dry run (preview)
npx tsr --check

# Actually remove deadcode
npx tsr
```

[Setup guide](https://kazushikonosu.io/en/typescript-remove-tsr)

### When to Use

- After major refactoring
- During cleanup sprints
- With version control backup
- Never on production branches without review

### Safety Tips

1. **Always commit first**: `git commit -am "checkpoint before tsr"`
2. **Review changes**: `git diff` before committing removals
3. **Run tests**: Ensure nothing breaks
4. **Use CI**: Detect regressions immediately

---

## Recommended Workflow for claudelint

### Phase 1: Setup (One-time)

```bash
# Install tools
npm install --save-dev knip depcheck

# Create configuration
cat > knip.config.ts << 'EOF'
import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['src/index.ts', 'src/cli/claudelint.ts'],
  project: ['src/**/*.ts'],
  ignore: ['dist/**', 'coverage/**', 'examples/**'],
};

export default config;
EOF

# Add scripts to package.json
npm pkg set scripts.check:deadcode="knip"
npm pkg set scripts.check:deps="depcheck"
```

### Phase 2: Initial Scan

```bash
# Run Knip (comprehensive)
npm run check:deadcode > deadcode-report.txt

# Run depcheck (dependencies)
npm run check:deps > deps-report.txt

# Review reports
cat deadcode-report.txt
cat deps-report.txt
```

### Phase 3: Manual Cleanup

**DO NOT auto-remove!** Review each finding:

1. **Unused exports**: Check if part of public API
2. **Unused files**: Verify not dynamically imported
3. **Unused dependencies**: Check config files, scripts

```bash
# For each unused item:
# 1. Verify it's truly unused
# 2. Remove manually
# 3. Commit
git add .
git commit -m "chore: remove unused X"

# 4. Test
npm test

# 5. Repeat
```

### Phase 4: CI Integration

```yaml
# .github/workflows/deadcode.yml
name: Deadcode Check

on:
  pull_request:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday

jobs:
  deadcode:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run check:deadcode
      - run: npm run check:deps
```

### Phase 5: Ongoing Maintenance

**Quarterly Reviews**:

```bash
# Every 3 months
npm run check:deadcode
npm run check:deps

# Review findings
# Create cleanup tickets
# Schedule cleanup sprint
```

**Pre-release Checks**:

```bash
# Before every major release
npm run check:deadcode:production
npm run check:deps
```

---

## Industry Best Practices

### 1. Prevention Over Detection

From [BAM.tech](https://www.bam.tech/article/seek-and-destroy-dead-code-for-good-a-strategy-using-ts-prune):

**Strategies**:
- Code review: Flag new exports not imported anywhere
- Pre-commit hooks: Run quick deadcode check
- CI gates: Fail PR if deadcode increases

### 2. Gradual Cleanup

**Don't remove everything at once!**

1. **Week 1**: Remove unused dependencies (low risk)
2. **Week 2**: Remove unused utility functions (medium risk)
3. **Week 3**: Remove unused exports (higher risk)
4. **Week 4**: Remove unused files (highest risk)

Test thoroughly between each phase.

### 3. Document Intentional "Unused" Code

Some code appears unused but is part of public API:

```typescript
/**
 * Public API export - used by external plugins
 * @public
 */
export interface ValidatorOptions {
  // ...
}
```

Configure Knip to ignore:

```typescript
// knip.config.ts
export default {
  ignoreExportsUsedInFile: {
    interface: true,  // Keep all interfaces (public API)
    type: true,       // Keep all types (public API)
  },
};
```

### 4. Use Underscore Prefix for Intentionally Unused

```typescript
// Instead of:
function handler(event, context) { /* only use event */ }

// Use:
function handler(event, _context) { /* ignore context */ }
```

Both TypeScript and ESLint will ignore `_` prefixed variables.

### 5. False Positive Management

Some code is used but tools can't detect it:

**Dynamic imports**:
```typescript
const moduleName = getModuleName();
const module = await import(`./${moduleName}`);  // Can't detect statically
```

**Configuration files**:
```typescript
// Used in tsconfig.json but not imported
import 'some-polyfill';
```

**Solution**: Whitelist in configuration:

```typescript
// knip.config.ts
export default {
  ignoreDependencies: ['some-polyfill'],
  ignore: ['src/polyfills/**'],
};
```

---

## Tool Setup for claudelint

### Recommended Package.json Scripts

```json
{
  "scripts": {
    "check:deadcode": "knip",
    "check:deadcode:production": "knip --production",
    "check:deadcode:fix": "knip --fix",
    "check:deps": "depcheck",
    "check:all:quality": "npm run lint && npm run check:deadcode && npm run check:deps"
  },
  "devDependencies": {
    "knip": "^5.81.0",
    "depcheck": "^1.4.7"
  }
}
```

### Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Quick deadcode check (fails fast)
npm run check:deadcode:production || {
  echo "WARNING:  Deadcode detected! Run 'npm run check:deadcode' for details"
  exit 1
}
```

**Warning**: This might be too strict! Consider making it a warning instead:

```bash
npm run check:deadcode:production || {
  echo "WARNING:  Warning: Deadcode detected (not blocking commit)"
}
```

### GitHub Actions Workflow

```yaml
# .github/workflows/quality.yml
name: Code Quality

on:
  pull_request:
  push:
    branches: [main]

jobs:
  deadcode:
    name: Deadcode Detection
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Check for deadcode
        run: npm run check:deadcode

      - name: Check for unused dependencies
        run: npm run check:deps

      - name: Upload report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: deadcode-report
          path: |
            knip-report.json
            deps-report.txt
```

---

## Comparison: What Each Tool Should Be Used For

### Use Knip For:
- [x] Comprehensive project-wide deadcode analysis
- [x] Quarterly cleanup audits
- [x] Pre-release checks
- [x] Finding unused exports across files
- [x] Detecting unused dependencies
- [x] CI/CD gates

### Use depcheck For:
- [x] Focused dependency analysis
- [x] Second opinion on Knip's dependency findings
- [x] Conservative dependency cleanup
- [x] Quick dependency checks

### Use TypeScript Compiler For:
- [x] File-level unused variables
- [x] Compile-time checks
- [x] Development feedback (immediate)
- [x] Unused parameters

### Use ESLint For:
- [x] Runtime unused variable detection
- [x] Pre-commit hooks (fast)
- [x] IDE integration (immediate feedback)
- [x] Enforcing code style

### Use tsr For:
- [x] **NOT RECOMMENDED** for automated cleanup (too risky)
- WARNING:  Manual cleanup after verification only
- WARNING:  One-off major refactors with backups

---

## Migration Plan for claudelint

### Week 1: Setup & Baseline

```bash
# Install Knip
npm install --save-dev knip

# Create config
# (use config from "Recommended Workflow" above)

# Run initial scan
npx knip > baseline-report.txt

# Commit baseline
git add knip.config.ts package.json baseline-report.txt
git commit -m "chore: add Knip for deadcode detection"
```

### Week 2: Manual Review

```bash
# Review findings
cat baseline-report.txt

# Categorize findings:
# 1. Safe to remove (high confidence)
# 2. Needs investigation (medium confidence)
# 3. False positive / intentional (add to ignore)

# Update knip.config.ts with false positives
```

### Week 3: Cleanup Sprint

```bash
# Remove safe items one by one
# Test after each removal
# Commit frequently

# Example:
git rm src/utils/old-helper.ts
npm test
git commit -m "chore: remove unused helper"
```

### Week 4: CI Integration

```bash
# Add GitHub Actions workflow
# (use workflow from "GitHub Actions Workflow" above)

# Test locally
npm run check:deadcode

# Push and verify CI passes
git push
```

### Week 5: Documentation

```bash
# Add to CONTRIBUTING.md
# Add to package.json scripts
# Update README with quality badges
# Document ignored items in knip.config.ts
```

---

## Metrics & Goals

### Success Metrics

Track these over time:

```bash
# Unused exports
npx knip | grep "Unused exports" | wc -l

# Unused files
npx knip | grep "Unused files" | wc -l

# Unused dependencies
npx knip | grep "Unused dependencies" | wc -l
```

### Goal Setting

**Current State** (Jan 2026):
- Unused exports: TBD (run Knip to establish baseline)
- Unused files: 8 (orphaned build artifacts)
- Unused dependencies: 0

**Target State** (Mar 2026):
- Unused exports: <5
- Unused files: 0
- Unused dependencies: 0

### Quarterly Reviews

Add to calendar:
- **Q1 2026**: Initial cleanup
- **Q2 2026**: Review and cleanup
- **Q3 2026**: Review and cleanup
- **Q4 2026**: Review and cleanup

---

## Resources

### Official Documentation

- [Knip Documentation](https://knip.dev)
- [depcheck GitHub](https://github.com/depcheck/depcheck)
- [typescript-eslint no-unused-vars](https://typescript-eslint.io/rules/no-unused-vars/)
- [TypeScript Compiler Options](https://www.typescriptlang.org/tsconfig)

### Articles & Guides

- [Effective TypeScript: Use knip to detect dead code](https://effectivetypescript.com/2023/07/29/knip/)
- [Why We Chose Knip Over ts-prune](https://levelup.gitconnected.com/dead-code-detection-in-typescript-projects-why-we-chose-knip-over-ts-prune-8feea827da35)
- [Seek and destroy dead code with ts-prune](https://www.bam.tech/article/seek-and-destroy-dead-code-for-good-a-strategy-using-ts-prune)
- [How to detect dead code in frontend projects](https://blog.logrocket.com/how-detect-dead-code-frontend-project/)
- [Cleaning up unused dependencies](https://luisrangelc.medium.com/cleaning-up-unused-dependencies-af9654e270ad)

### Community

- [Knip Discord](https://discord.gg/knip) - Community support
- [GitHub Discussions](https://github.com/webpro-nl/knip/discussions) - Q&A

---

## Conclusion

**For claudelint, use this stack**:

1. **Knip** (primary) - Comprehensive analysis, quarterly reviews
2. **depcheck** (secondary) - Dependency verification
3. **TypeScript** (always on) - noUnusedLocals, noUnusedParameters
4. **ESLint** (always on) - Runtime checks in development

**Workflow**:
- Development: TypeScript + ESLint catch issues immediately
- Pre-commit: Quick ESLint check
- CI/CD: Full Knip scan on PRs
- Quarterly: Manual Knip review + cleanup sprint

**Next Steps**:
1. Install Knip: `npm install --save-dev knip`
2. Run initial scan: `npx knip > baseline.txt`
3. Review and categorize findings
4. Clean up high-confidence items
5. Add to CI/CD pipeline
6. Schedule quarterly reviews

Total setup time: 2-3 hours
Ongoing maintenance: 2-3 hours per quarter

This approach balances thoroughness with pragmatism, preventing deadcode accumulation while minimizing false positives and developer friction.
