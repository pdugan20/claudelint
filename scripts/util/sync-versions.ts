#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { log } from './logger';

interface PackageJson {
  version: string;
  name?: string;
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
 * Sync version numbers across all project files
 */
function syncVersions(): void {
  const rootDir = path.resolve(__dirname, '../..');

  // 1. Read primary version from package.json
  const packageJsonPath = path.join(rootDir, 'package.json');
  const packageJson: PackageJson = JSON.parse(
    fs.readFileSync(packageJsonPath, 'utf-8')
  );
  const primaryVersion = packageJson.version;
  const packageName = packageJson.name as string;

  log.info(`Primary version: ${primaryVersion}`);
  log.info(`Package name: ${packageName}`);
  log.blank();

  let filesUpdated = 0;

  // 2. Update .claude-plugin/plugin.json
  const pluginJsonPath = path.join(rootDir, '.claude-plugin', 'plugin.json');
  const pluginJson: PluginJson = JSON.parse(
    fs.readFileSync(pluginJsonPath, 'utf-8')
  );

  if (pluginJson.version !== primaryVersion) {
    log.info(
      `Updating plugin.json: ${pluginJson.version} → ${primaryVersion}`
    );
    pluginJson.version = primaryVersion;
    fs.writeFileSync(
      pluginJsonPath,
      JSON.stringify(pluginJson, null, 2) + '\n'
    );
    filesUpdated++;
  } else {
    log.pass('plugin.json already in sync');
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

  let marketplaceUpdated = false;

  if (marketplaceJson.version !== primaryVersion) {
    log.info(
      `Updating marketplace.json version: ${marketplaceJson.version} → ${primaryVersion}`
    );
    marketplaceJson.version = primaryVersion;
    marketplaceUpdated = true;
  }

  // Also sync the first plugin entry version (claudelint)
  if (marketplaceJson.plugins?.[0]?.version !== primaryVersion) {
    const pluginEntry = marketplaceJson.plugins[0];
    log.info(
      `Updating marketplace.json plugins[0].version: ${pluginEntry.version} → ${primaryVersion}`
    );
    pluginEntry.version = primaryVersion;
    marketplaceUpdated = true;
  }

  if (marketplaceUpdated) {
    fs.writeFileSync(
      marketplaceJsonPath,
      JSON.stringify(marketplaceJson, null, 2) + '\n'
    );
    filesUpdated++;
  } else {
    log.pass('marketplace.json already in sync');
  }

  // 4. Update PLUGIN_VERSION in check-dependency.sh
  const checkDepPath = path.join(
    rootDir,
    '.claude-plugin',
    'scripts',
    'check-dependency.sh'
  );
  if (fs.existsSync(checkDepPath)) {
    const script = fs.readFileSync(checkDepPath, 'utf-8');
    const updated = script.replace(
      /^PLUGIN_VERSION="[^"]*"/m,
      `PLUGIN_VERSION="${primaryVersion}"`
    );
    if (updated !== script) {
      log.info(
        `Updating check-dependency.sh PLUGIN_VERSION → ${primaryVersion}`
      );
      fs.writeFileSync(checkDepPath, updated);
      filesUpdated++;
    } else {
      log.pass('check-dependency.sh already in sync');
    }
  }

  // 5. Run prettier on modified JSON files to preserve formatting
  if (filesUpdated > 0) {
    const jsonFiles = [pluginJsonPath, marketplaceJsonPath].join(' ');
    try {
      execSync(`npx prettier --write ${jsonFiles}`, {
        cwd: rootDir,
        stdio: 'ignore',
      });
      log.pass('Formatted JSON files with prettier');
    } catch {
      log.info('Prettier not available, skipping formatting');
    }
  }

  log.blank();
  log.divider();
  if (filesUpdated > 0) {
    log.pass(`${filesUpdated} file${filesUpdated > 1 ? 's' : ''} updated to version ${primaryVersion}`);
  } else {
    log.pass(`All versions already synchronized to ${primaryVersion}`);
  }
  log.divider();
}

// Run if executed directly
if (require.main === module) {
  try {
    syncVersions();
  } catch (error) {
    log.error(`Error syncing versions: ${error}`);
    process.exit(1);
  }
}

export { syncVersions };
