#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';

interface PackageJson {
  version: string;
  name?: string;
  devDependencies?: Record<string, string>;
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
 * Validate that all version numbers are in sync
 */
function checkVersionSync(): boolean {
  const rootDir = path.resolve(__dirname, '../..');

  // Read primary version
  const packageJsonPath = path.join(rootDir, 'package.json');
  const packageJson: PackageJson = JSON.parse(
    fs.readFileSync(packageJsonPath, 'utf-8')
  );
  const primaryVersion = packageJson.version;
  const packageName = packageJson.name as string;

  console.log(`Primary version: ${primaryVersion}`);
  console.log(`Package name: ${packageName}\n`);

  let allInSync = true;

  // Check plugin.json
  const pluginJsonPath = path.join(rootDir, 'plugin.json');
  const pluginJson: PluginJson = JSON.parse(
    fs.readFileSync(pluginJsonPath, 'utf-8')
  );
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
  const marketplaceJson: MarketplaceJson = JSON.parse(
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
  const integrationPackageJson: PackageJson = JSON.parse(
    fs.readFileSync(integrationPackageJsonPath, 'utf-8')
  );
  const devDeps = integrationPackageJson.devDependencies || {};
  const depVersion = devDeps[packageName];
  const expectedDepVersion = `^${primaryVersion}`;

  if (depVersion !== expectedDepVersion) {
    console.error(
      `✗ integration example dependency mismatch: ${depVersion} (expected ${expectedDepVersion})`
    );
    allInSync = false;
  } else {
    console.log('✓ integration example dependency in sync');
  }

  console.log();
  if (allInSync) {
    console.log('✓ All versions are synchronized');
    process.exit(0);
  } else {
    console.error('✗ Version sync check failed');
    console.error('\nRun: npm run sync:versions');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  try {
    checkVersionSync();
  } catch (error) {
    console.error('Error checking version sync:', error);
    process.exit(1);
  }
}

export { checkVersionSync };
