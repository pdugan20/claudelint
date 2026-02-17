#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
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

interface MarketplaceJson {
  version: string;
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

  // 2. Update plugin.json
  const pluginJsonPath = path.join(rootDir, 'plugin.json');
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

  if (marketplaceJson.version !== primaryVersion) {
    log.info(
      `Updating marketplace.json: ${marketplaceJson.version} → ${primaryVersion}`
    );
    marketplaceJson.version = primaryVersion;
    fs.writeFileSync(
      marketplaceJsonPath,
      JSON.stringify(marketplaceJson, null, 2) + '\n'
    );
    filesUpdated++;
  } else {
    log.pass('marketplace.json already in sync');
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
