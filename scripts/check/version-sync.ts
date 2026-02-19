#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { log } from '../util/logger';

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

interface MarketplacePluginEntry {
  version: string;
  [key: string]: unknown;
}

interface MarketplaceJson {
  version: string;
  plugins: MarketplacePluginEntry[];
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

  log.info(`Primary version: ${primaryVersion}`);
  log.info(`Package name: ${packageName}`);
  log.blank();

  let allInSync = true;

  // Check .claude-plugin/plugin.json
  const pluginJsonPath = path.join(rootDir, '.claude-plugin', 'plugin.json');
  const pluginJson: PluginJson = JSON.parse(
    fs.readFileSync(pluginJsonPath, 'utf-8')
  );
  if (pluginJson.version !== primaryVersion) {
    log.fail(
      `plugin.json version mismatch: ${pluginJson.version} (expected ${primaryVersion})`
    );
    allInSync = false;
  } else {
    log.pass('plugin.json in sync');
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
    log.fail(
      `marketplace.json version mismatch: ${marketplaceJson.version} (expected ${primaryVersion})`
    );
    allInSync = false;
  } else {
    log.pass('marketplace.json in sync');
  }

  // Check marketplace.json plugins[0].version
  if (marketplaceJson.plugins?.[0]?.version !== primaryVersion) {
    log.fail(
      `marketplace.json plugins[0].version mismatch: ${marketplaceJson.plugins?.[0]?.version} (expected ${primaryVersion})`
    );
    allInSync = false;
  } else {
    log.pass('marketplace.json plugins[0].version in sync');
  }

  // Check hooks.json hook script resolves to the version-checking script
  const hooksJsonPath = path.join(rootDir, 'hooks', 'hooks.json');
  if (fs.existsSync(hooksJsonPath)) {
    const hooksJson = JSON.parse(fs.readFileSync(hooksJsonPath, 'utf-8'));
    const sessionStartHooks = hooksJson?.hooks?.SessionStart?.[0]?.hooks || [];
    for (const hook of sessionStartHooks) {
      if (hook.type === 'command' && hook.command.includes('check-dependency')) {
        const resolvedPath = hook.command.replace(
          '${CLAUDE_PLUGIN_ROOT}',
          rootDir
        );
        if (!fs.existsSync(resolvedPath)) {
          log.fail(`Hook script not found: ${resolvedPath}`);
          allInSync = false;
        } else {
          const scriptContent = fs.readFileSync(resolvedPath, 'utf-8');
          if (!scriptContent.includes('PLUGIN_VERSION=')) {
            log.fail(
              `Hook script missing PLUGIN_VERSION — wrong file? ${hook.command}`
            );
            allInSync = false;
          } else {
            log.pass('hooks.json SessionStart points to version-checking script');
          }
        }
      }
    }
  }

  // Check integration example (optional — may not exist yet)
  const integrationPackageJsonPath = path.join(
    rootDir,
    'examples',
    'integration',
    'package.json'
  );
  if (fs.existsSync(integrationPackageJsonPath)) {
    const integrationPackageJson: PackageJson = JSON.parse(
      fs.readFileSync(integrationPackageJsonPath, 'utf-8')
    );
    const devDeps = integrationPackageJson.devDependencies || {};
    const depVersion = devDeps[packageName];
    const expectedDepVersion = `^${primaryVersion}`;

    if (depVersion !== expectedDepVersion) {
      log.fail(
        `integration example dependency mismatch: ${depVersion} (expected ${expectedDepVersion})`
      );
      allInSync = false;
    } else {
      log.pass('integration example dependency in sync');
    }
  } else {
    log.pass('integration example not present (skipped)');
  }

  log.blank();
  if (allInSync) {
    log.pass('All versions are synchronized');
    process.exit(0);
  } else {
    log.fail('Version sync check failed');
    log.blank();
    log.info('Run: npm run sync:versions');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  try {
    checkVersionSync();
  } catch (error) {
    log.error(`Error checking version sync: ${error}`);
    process.exit(1);
  }
}

export { checkVersionSync };
