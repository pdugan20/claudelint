# Package Name Migration Guide

Complete guide for migrating from `claudelint` (scoped) to `claudelint` (unscoped).

## Overview

**Current:** `claudelint`
**Target:** `claudelint`

**References to update:** 140+ across codebase

## Migration Strategy

### Phase 1: Pre-Migration Preparation

1. **Verify name availability**
2. **Create migration script**
3. **Test script on sample files**
4. **Review all files to be changed**
5. **Document migration for users**

### Phase 2: Execute Migration

1. **Run migration script**
2. **Review changes**
3. **Commit changes**
4. **Tag version**

### Phase 3: Publish

1. **Publish to npm**
2. **Verify package**
3. **Update documentation**

## Files to Update

### Package Configuration

- `package.json` - name field
- `plugin.json` - no references (uses short name)
- `.claude-plugin/marketplace.json` - no references

### Documentation

- `README.md` - 11 references (badges, install commands, examples)
- `CHANGELOG.md` - 2 references (import examples)
- `docs/getting-started.md` - 3 references
- `docs/cli-reference.md` - 1 reference
- `docs/formatting-tools.md` - 3 references
- `docs/auto-fix.md` - 1 reference
- `docs/plugin-usage.md` - 1 reference
- `docs/architecture.md` - 1 reference
- `docs/api/*.md` - 60+ references

### Examples

- `examples/*.js` - 5 files
- `examples/integration/package.json` - 1 reference
- `examples/integration/README.md` - 2 references
- `examples/strict/README.md` - 1 reference

### Source Code (JSDoc)

- `src/index.ts` - 5 import examples
- `src/api/*.ts` - 10+ import examples

### Archived Documentation

- `docs/projects/archive/programmatic-api/*.md` - 50+ references
- `docs/projects/vitepress-docs/plan.md` - 10+ references

## Migration Script

### Implementation: scripts/migrate-package-name.ts

```typescript
#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

const OLD_NAME = 'claudelint';
const NEW_NAME = 'claudelint';

interface MigrationResult {
  file: string;
  occurrences: number;
  changed: boolean;
}

/**
 * Migrate package name from scoped to unscoped
 */
async function migratePackageName(
  dryRun: boolean = false
): Promise<MigrationResult[]> {
  const rootDir = path.resolve(__dirname, '..');
  const results: MigrationResult[] = [];

  // File patterns to search
  const patterns = [
    'package.json',
    'plugin.json',
    '.claude-plugin/**/*.json',
    'src/**/*.ts',
    'examples/**/*.{js,json,md}',
    'docs/**/*.md',
    'packages/**/*.{json,md}',
    'README.md',
    'CHANGELOG.md',
  ];

  // Files to exclude
  const exclude = [
    '**/node_modules/**',
    '**/dist/**',
    '**/.git/**',
    '**/package-lock.json',
  ];

  console.log(`\n${'='.repeat(60)}`);
  console.log(
    dryRun
      ? 'DRY RUN - No files will be modified'
      : 'LIVE RUN - Files will be modified'
  );
  console.log(`${'='.repeat(60)}\n`);
  console.log(`Migrating: ${OLD_NAME} → ${NEW_NAME}\n`);

  for (const pattern of patterns) {
    const files = await glob(pattern, {
      cwd: rootDir,
      ignore: exclude,
      absolute: true,
    });

    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const occurrences = (content.match(new RegExp(OLD_NAME, 'g')) || [])
        .length;

      if (occurrences > 0) {
        const newContent = content.replaceAll(OLD_NAME, NEW_NAME);

        results.push({
          file: path.relative(rootDir, filePath),
          occurrences,
          changed: !dryRun,
        });

        if (!dryRun) {
          fs.writeFileSync(filePath, newContent, 'utf-8');
          console.log(
            `✓ ${path.relative(rootDir, filePath)} (${occurrences} occurrence${occurrences > 1 ? 's' : ''})`
          );
        } else {
          console.log(
            `  ${path.relative(rootDir, filePath)} (${occurrences} occurrence${occurrences > 1 ? 's' : ''})`
          );
        }
      }
    }
  }

  // Summary
  const totalFiles = results.length;
  const totalOccurrences = results.reduce(
    (sum, r) => sum + r.occurrences,
    0
  );

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Files affected: ${totalFiles}`);
  console.log(`Total occurrences: ${totalOccurrences}`);
  console.log(`${'='.repeat(60)}\n`);

  if (dryRun) {
    console.log('Run without --dry-run to apply changes');
  } else {
    console.log('✓ Migration complete');
    console.log('\nNext steps:');
    console.log('1. Review changes: git diff');
    console.log('2. Test build: npm run build');
    console.log('3. Test installation: npm pack && npm install -g claudelint-*.tgz');
    console.log('4. Commit: git add . && git commit -m "chore: migrate to unscoped package name"');
  }

  return results;
}

// CLI
const dryRun = process.argv.includes('--dry-run');
migratePackageName(dryRun);
```

### Package.json Script

```json
{
  "scripts": {
    "migrate:name": "ts-node scripts/migrate-package-name.ts",
    "migrate:name:dry": "ts-node scripts/migrate-package-name.ts --dry-run"
  }
}
```

## Usage

### Dry Run (Recommended First)

```bash
# Test migration without making changes
npm run migrate:name:dry

# Output:
# ==============================================================
# DRY RUN - No files will be modified
# ==============================================================
# Migrating: claudelint → claudelint
#
#   README.md (11 occurrences)
#   package.json (1 occurrence)
#   src/index.ts (5 occurrences)
#   ...
#
# ==============================================================
# Files affected: 45
# Total occurrences: 142
# ==============================================================
```

### Live Run

```bash
# Execute migration
npm run migrate:name

# Output:
# ==============================================================
# LIVE RUN - Files will be modified
# ==============================================================
# Migrating: claudelint → claudelint
#
# ✓ README.md (11 occurrences)
# ✓ package.json (1 occurrence)
# ✓ src/index.ts (5 occurrences)
# ...
#
# ==============================================================
# Files affected: 45
# Total occurrences: 142
# ==============================================================
#
# ✓ Migration complete
```

## Verification

### After Migration

```bash
# 1. Review all changes
git diff

# 2. Check for any missed references
grep -r "claudelint" . --exclude-dir=node_modules --exclude-dir=dist

# 3. Verify package.json
cat package.json | grep "name"
# Should show: "name": "claudelint",

# 4. Build and test
npm run build
npm test

# 5. Test local installation
npm pack
# Creates: claudelint-0.2.0-beta.0.tgz

npm install -g ./claudelint-0.2.0-beta.0.tgz
claudelint --version
# Should work

# 6. Test API import
node -e "const { ClaudeLint } = require('claudelint'); console.log('OK')"
# Should print: OK
```

## Special Cases

### README Badge

Before:

```markdown
[![npm version](https://badge.fury.io/js/%40pdugan20%2Fclaudelint.svg)](https://www.npmjs.com/package/claudelint)
```

After:

```markdown
[![npm version](https://badge.fury.io/js/claudelint.svg)](https://www.npmjs.com/package/claudelint)
```

### Import Examples

Before:

```typescript
import { ClaudeLint } from 'claudelint';
```

After:

```typescript
import { ClaudeLint } from 'claudelint';
```

### Installation Commands

Before:

```bash
npm install -g claudelint
npm install --save-dev claudelint
```

After:

```bash
npm install -g claudelint
npm install --save-dev claudelint
```

### Package Dependencies

Before (examples/integration/package.json):

```json
{
  "devDependencies": {
    "claudelint": "^0.2.0"
  }
}
```

After:

```json
{
  "devDependencies": {
    "claudelint": "^0.2.0"
  }
}
```

## Rollback Plan

If migration fails:

```bash
# Discard all changes
git checkout .

# Or revert specific files
git checkout package.json README.md src/
```

## Timing

### When to Migrate

**Before first npm publish** - ideally during Phase 5 (First Beta Release)

Reasons:

1. No published versions exist yet
2. No user migration needed
3. Clean slate for first release
4. Name claimed immediately

### When NOT to Migrate

- After package is published (causes breaking change for users)
- During active development (wait for release window)
- If scoped name is preferred (can stay scoped)

## Post-Migration Tasks

### Documentation Updates

- [ ] Update README badges
- [ ] Update installation instructions
- [ ] Update all code examples
- [ ] Update API documentation
- [ ] Update CONTRIBUTING.md
- [ ] Update CHANGELOG.md

### Verification

- [ ] Build succeeds
- [ ] Tests pass
- [ ] CLI works from packed tarball
- [ ] API imports work
- [ ] No references to old name remain

### Git

- [ ] Commit migration: `git commit -m "chore: migrate to unscoped package name"`
- [ ] Tag if needed: `git tag v0.2.0-beta.0`
- [ ] Push: `git push && git push --tags`

## User Migration (Future)

If we ever need to migrate from published scoped package:

### Deprecation Notice

```bash
# Deprecate old scoped package
npm deprecate claudelint "Package has moved to 'claudelint' (unscoped)"
```

### Migration Guide for Users

```markdown
## Migration from claudelint to claudelint

The package has moved to an unscoped name for easier installation.

### Uninstall old package

npm uninstall claudelint

### Install new package

npm install claudelint

### Update imports

-import { ClaudeLint } from 'claudelint';
+import { ClaudeLint } from 'claudelint';
```

## Checklist

- [ ] Run dry-run migration
- [ ] Review files to be changed
- [ ] Execute live migration
- [ ] Review git diff
- [ ] Verify no old references remain
- [ ] Build project
- [ ] Run tests
- [ ] Pack and test installation
- [ ] Commit changes
- [ ] Ready to publish

## Next Steps

- [ ] Create migration script
- [ ] Test with dry-run
- [ ] Execute migration before first publish
- [ ] Verify all references updated
