#!/usr/bin/env node
'use strict';

const { execSync } = require('child_process');

const PLUGIN_VERSION = '0.3.0'; // Updated by sync-versions

/**
 * Compare two semver strings.
 * Returns -1 if a < b, 0 if a === b, 1 if a > b.
 * Handles X.Y.Z and X.Y.Z-pre.N formats.
 */
function compareSemver(a, b) {
  if (a === b) return 0;

  const [coreA, preA] = a.split('-');
  const [coreB, preB] = b.split('-');

  const partsA = coreA.split('.').map(Number);
  const partsB = coreB.split('.').map(Number);

  // Compare major.minor.patch
  for (let i = 0; i < 3; i++) {
    const va = partsA[i] || 0;
    const vb = partsB[i] || 0;
    if (va > vb) return 1;
    if (va < vb) return -1;
  }

  // Core versions equal — compare pre-release
  // No pre-release > has pre-release (1.0.0 > 1.0.0-beta.1)
  if (!preA && preB) return 1;
  if (preA && !preB) return -1;
  if (!preA && !preB) return 0;

  // Both have pre-release — compare segments
  const segsA = preA.split('.');
  const segsB = preB.split('.');
  const len = Math.max(segsA.length, segsB.length);

  for (let i = 0; i < len; i++) {
    const sa = segsA[i];
    const sb = segsB[i];
    if (sa === undefined) return -1;
    if (sb === undefined) return 1;

    const na = Number(sa);
    const nb = Number(sb);
    const aIsNum = !isNaN(na);
    const bIsNum = !isNaN(nb);

    if (aIsNum && bIsNum) {
      if (na > nb) return 1;
      if (na < nb) return -1;
    } else {
      // Lexicographic comparison for non-numeric segments
      if (sa > sb) return 1;
      if (sa < sb) return -1;
    }
  }

  return 0;
}

/**
 * Determine what action(s) to recommend based on version comparison.
 *
 * @param {object} params
 * @param {string|null} params.latestNpm - Latest published npm version, or null if unavailable
 * @param {string|null} params.installedCli - Installed CLI version, or null if not installed
 * @param {boolean} params.isGlobal - Whether the CLI install is global
 * @param {string} params.pluginVersion - Hardcoded plugin version
 * @returns {{ messages: string[] }}
 */
function checkVersions({ latestNpm, installedCli, isGlobal, pluginVersion }) {
  const messages = [];

  // CLI not installed
  if (!installedCli) {
    messages.push(
      'IMPORTANT: The claudelint CLI is not installed. Plugin skills will not work without it. ' +
        'Before doing anything else, tell the user and ask if they would like you to run: ' +
        'npm install -g claude-code-lint (for all projects) ' +
        'or npm install --save-dev claude-code-lint (for this project only)'
    );
    return { messages };
  }

  const installCmd = isGlobal
    ? 'npm install -g claude-code-lint'
    : 'npm install --save-dev claude-code-lint';

  // npm registry version available (online mode)
  if (latestNpm) {
    if (compareSemver(latestNpm, installedCli) > 0) {
      messages.push(
        `IMPORTANT: The claudelint CLI is outdated (${installedCli} installed, ${latestNpm} available). ` +
          `Before doing anything else, tell the user and ask if they would like you to run: ` +
          `${installCmd}@${latestNpm}`
      );
    }
    if (compareSemver(latestNpm, pluginVersion) > 0) {
      messages.push(
        `IMPORTANT: The claudelint plugin is outdated (${pluginVersion} installed, ${latestNpm} available). ` +
          `Tell the user to run: /plugin marketplace update pdugan20-plugins -- ` +
          `then run /plugin, go to Installed, select claudelint, and choose "Update now".`
      );
    }
    return { messages };
  }

  // npm unavailable (fallback) — only suggest upgrade, never downgrade
  if (compareSemver(pluginVersion, installedCli) > 0) {
    messages.push(
      `IMPORTANT: The claudelint CLI is outdated (${installedCli} installed, plugin expects ${pluginVersion}). ` +
        `Before doing anything else, tell the user and ask if they would like you to run: ` +
        `${installCmd}@${pluginVersion}`
    );
  }

  return { messages };
}

/**
 * Get the latest published npm version with a timeout.
 * Returns null on failure/timeout.
 */
function fetchLatestNpmVersion(timeoutMs) {
  if (timeoutMs === undefined) timeoutMs = 3000;
  try {
    const output = execSync('npm view claude-code-lint version', {
      encoding: 'utf-8',
      timeout: timeoutMs,
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    if (/^\d+\.\d+\.\d+/.test(output)) {
      return output;
    }
    return null;
  } catch (_e) {
    return null;
  }
}

/**
 * Get the installed CLI version.
 * Returns { version, isGlobal } or null if not installed.
 */
function getInstalledCliVersion() {
  // Try global install first
  try {
    const output = execSync('claudelint --version', {
      encoding: 'utf-8',
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    const version = output.replace(/^claudelint v/, '');
    if (version && version !== 'unknown') {
      return { version, isGlobal: true };
    }
  } catch (_e) {
    // Not installed globally
  }

  // Try local install
  try {
    const output = execSync('npx --no-install claudelint --version', {
      encoding: 'utf-8',
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    const version = output.replace(/^claudelint v/, '');
    if (version && version !== 'unknown') {
      return { version, isGlobal: false };
    }
  } catch (_e) {
    // Not installed locally
  }

  return null;
}

/**
 * Output JSON with additionalContext for Claude.
 */
function outputResult(context) {
  if (!context) return;
  const json = JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: context,
    },
  });
  process.stdout.write(json + '\n');
}

/**
 * Main entry point. Always exits 0.
 */
function main() {
  try {
    const latestNpm = fetchLatestNpmVersion();
    const cliInfo = getInstalledCliVersion();

    const result = checkVersions({
      latestNpm,
      installedCli: cliInfo ? cliInfo.version : null,
      isGlobal: cliInfo ? cliInfo.isGlobal : true,
      pluginVersion: PLUGIN_VERSION,
    });

    if (result.messages.length > 0) {
      outputResult(result.messages.join(' '));
    }
  } catch (_e) {
    // Never fail — hook errors block the session
  }
  process.exit(0);
}

// Export for testing
module.exports = {
  PLUGIN_VERSION,
  compareSemver,
  checkVersions,
  fetchLatestNpmVersion,
  getInstalledCliVersion,
};

// Run if executed directly
if (require.main === module) {
  main();
}
