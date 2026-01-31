# Version Synchronization Strategy

Strategy and implementation for keeping version numbers synchronized across the claudelint codebase.

## Problem Statement

Version numbers are scattered across multiple files:

- `package.json` (main version: 0.2.0)
- `plugin.json` (plugin version: 0.1.0)
- `.claude-plugin/marketplace.json` (marketplace version: 0.1.0)
- `examples/integration/package.json` (dependency version: ^0.1.0)
- Documentation examples (various version references)

**Goal:** Single source of truth for version, automatically synced everywhere.

## Version Files

### Primary Version Source

**package.json** is the single source of truth:

```json
{
  "version": "0.2.0"
}
```

### Secondary Version Files

These should always match package.json:

1. **plugin.json** (line 3)
   ```json
   {
     "name": "claudelint",
     "version": "0.1.0",  // ← Must sync
     "description": "..."
   }
   ```

2. **.claude-plugin/marketplace.json** (line 4)
   ```json
   {
     "identifier": "claudelint",
     "version": "0.1.0",  // ← Must sync
     "category": "developer-tools"
   }
   ```

3. **examples/integration/package.json** (line 38)
   ```json
   {
     "devDependencies": {
       "@pdugan20/claudelint": "^0.1.0"  // ← Must sync
     }
   }
   ```

## Synchronization Script

### Implementation: scripts/sync-versions.ts

```typescript
#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';

interface PackageJson {
  version: string;
  [key: string]: unknown;
}

interface PluginJson {
  version: string;
  [key: string]: unknown;
}

interface MarketplaceJson {
  version: string;
  [key: string]: unknown;
}

/**
 * Sync version numbers across all project files
 */
function syncVersions(): void {
  const rootDir = path.resolve(__dirname, '..');

  // 1. Read primary version from package.json
  const packageJsonPath = path.join(rootDir, 'package.json');
  const packageJson: PackageJson = JSON.parse(
    fs.readFileSync(packageJsonPath, 'utf-8')
  );
  const primaryVersion = packageJson.version;

  console.log(`Primary version: ${primaryVersion}`);

  // 2. Update plugin.json
  const pluginJsonPath = path.join(rootDir, 'plugin.json');
  const pluginJson: PluginJson = JSON.parse(
    fs.readFileSync(pluginJsonPath, 'utf-8')
  );

  if (pluginJson.version !== primaryVersion) {
    console.log(
      `Updating plugin.json: ${pluginJson.version} → ${primaryVersion}`
    );
    pluginJson.version = primaryVersion;
    fs.writeFileSync(
      pluginJsonPath,
      JSON.stringify(pluginJson, null, 2) + '\n'
    );
  } else {
    console.log('plugin.json already in sync');
  }

  // 3. Update .claude-plugin/marketplace.json
  const marketplaceJsonPath = path.join(
    rootDir,
    '.claude-plugin',
    'marketplace.json'
  );
  const marketplaceJson: MarketplaceJson = JSON.parse(
    fs.readFileSync(marketplaceJsonPath, 'utf-8')
  );

  if (marketplaceJson.version !== primaryVersion) {
    console.log(
      `Updating marketplace.json: ${marketplaceJson.version} → ${primaryVersion}`
    );
    marketplaceJson.version = primaryVersion;
    fs.writeFileSync(
      marketplaceJsonPath,
      JSON.stringify(marketplaceJson, null, 2) + '\n'
    );
  } else {
    console.log('marketplace.json already in sync');
  }

  // 4. Update examples/integration/package.json dependency
  const integrationPackageJsonPath = path.join(
    rootDir,
    'examples',
    'integration',
    'package.json'
  );
  const integrationPackageJson: PackageJson = JSON.parse(
    fs.readFileSync(integrationPackageJsonPath, 'utf-8')
  );

  const packageName = packageJson.name as string;
  const devDeps = (integrationPackageJson.devDependencies || {}) as Record<
    string,
    string
  >;
  const currentDepVersion = devDeps[packageName];
  const newDepVersion = `^${primaryVersion}`;

  if (currentDepVersion !== newDepVersion) {
    console.log(
      `Updating integration example dependency: ${currentDepVersion} → ${newDepVersion}`
    );
    devDeps[packageName] = newDepVersion;
    integrationPackageJson.devDependencies = devDeps;
    fs.writeFileSync(
      integrationPackageJsonPath,
      JSON.stringify(integrationPackageJson, null, 2) + '\n'
    );
  } else {
    console.log('integration example dependency already in sync');
  }

  console.log('\n✓ All versions synchronized to', primaryVersion);
}

// Run if executed directly
if (require.main === module) {
  syncVersions();
}

export { syncVersions };
```

## Integration with release-it

### After Bump Hook

In `.release-it.json`:

```json
{
  "hooks": {
    "after:bump": [
      "npm run sync:versions"
    ]
  }
}
```

### Package.json Script

```json
{
  "scripts": {
    "sync:versions": "ts-node scripts/sync-versions.ts"
  }
}
```

## Workflow

### Automatic Sync (Recommended)

```bash
# release-it automatically bumps version and syncs
npm run release:beta

# Release process:
# 1. release-it bumps package.json version
# 2. after:bump hook runs sync:versions
# 3. All files updated automatically
# 4. Git commit includes all version changes
```

### Manual Sync

```bash
# Manually bump version
npm version 0.3.0-beta.0

# Then sync other files
npm run sync:versions

# Commit changes
git add .
git commit -m "chore: sync versions to 0.3.0-beta.0"
```

## Validation Script

### scripts/check/version-sync.ts

```typescript
#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';

/**
 * Validate that all version numbers are in sync
 */
function checkVersionSync(): boolean {
  const rootDir = path.resolve(__dirname, '../..');

  // Read primary version
  const packageJsonPath = path.join(rootDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const primaryVersion = packageJson.version;

  console.log(`Primary version: ${primaryVersion}`);

  let allInSync = true;

  // Check plugin.json
  const pluginJsonPath = path.join(rootDir, 'plugin.json');
  const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf-8'));
  if (pluginJson.version !== primaryVersion) {
    console.error(
      `✗ plugin.json version mismatch: ${pluginJson.version} (expected ${primaryVersion})`
    );
    allInSync = false;
  } else {
    console.log('✓ plugin.json in sync');
  }

  // Check marketplace.json
  const marketplaceJsonPath = path.join(
    rootDir,
    '.claude-plugin',
    'marketplace.json'
  );
  const marketplaceJson = JSON.parse(
    fs.readFileSync(marketplaceJsonPath, 'utf-8')
  );
  if (marketplaceJson.version !== primaryVersion) {
    console.error(
      `✗ marketplace.json version mismatch: ${marketplaceJson.version} (expected ${primaryVersion})`
    );
    allInSync = false;
  } else {
    console.log('✓ marketplace.json in sync');
  }

  // Check integration example
  const integrationPackageJsonPath = path.join(
    rootDir,
    'examples',
    'integration',
    'package.json'
  );
  const integrationPackageJson = JSON.parse(
    fs.readFileSync(integrationPackageJsonPath, 'utf-8')
  );
  const packageName = packageJson.name;
  const depVersion = integrationPackageJson.devDependencies?.[packageName];
  const expectedDepVersion = `^${primaryVersion}`;

  if (depVersion !== expectedDepVersion) {
    console.error(
      `✗ integration example dependency mismatch: ${depVersion} (expected ${expectedDepVersion})`
    );
    allInSync = false;
  } else {
    console.log('✓ integration example dependency in sync');
  }

  if (allInSync) {
    console.log('\n✓ All versions are synchronized');
    process.exit(0);
  } else {
    console.error('\n✗ Version sync check failed');
    console.error('Run: npm run sync:versions');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  checkVersionSync();
}

export { checkVersionSync };
```

### Package.json Script

```json
{
  "scripts": {
    "check:version-sync": "ts-node scripts/check/version-sync.ts"
  }
}
```

## Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Check version sync
npm run check:version-sync || {
  echo "Version sync check failed. Run: npm run sync:versions"
  exit 1
}

# Run other checks...
npm run lint-staged
```

## Pre-publish Hook

In `package.json`:

```json
{
  "scripts": {
    "prepublishOnly": "npm run check:version-sync && npm run build && npm test"
  }
}
```

## Edge Cases

### Beta Version Increment

```bash
# 0.2.0-beta.0 → 0.2.0-beta.1
npm run release:beta

# Syncs beta version everywhere automatically
```

### Promotion to Stable

```bash
# 0.2.0-beta.5 → 0.2.0
npm run release

# Removes prerelease suffix everywhere
```

### Manual Version Edit

If you manually edit `package.json`:

```bash
# Always run sync after manual edit
npm run sync:versions

# Or validate
npm run check:version-sync
```

## Testing

### Test Version Sync Script

```bash
# 1. Note current versions
cat package.json | grep version
cat plugin.json | grep version

# 2. Manually change package.json version
# Edit package.json: "version": "9.9.9-test.0"

# 3. Run sync
npm run sync:versions

# 4. Verify all files updated
cat plugin.json | grep version  # Should show 9.9.9-test.0
cat .claude-plugin/marketplace.json | grep version  # Should show 9.9.9-test.0

# 5. Restore original version
git checkout package.json plugin.json .claude-plugin/marketplace.json examples/integration/package.json
```

## Best Practices

1. **Never manually edit version in secondary files** - always sync from package.json
2. **Run check:version-sync before releases** - ensure everything is in sync
3. **Let release-it handle versioning** - don't use `npm version` manually
4. **Add version sync to CI** - fail builds if versions are out of sync
5. **Document the process** - ensure contributors know about version sync

## Next Steps

- [ ] Create `scripts/sync-versions.ts`
- [ ] Create `scripts/check/version-sync.ts`
- [ ] Add npm scripts to package.json
- [ ] Test sync script
- [ ] Integrate with release-it
- [ ] Add pre-commit validation
