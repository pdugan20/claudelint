/**
 * Minimal update checker
 *
 * Checks npm registry for newer versions. Non-blocking, cached,
 * and respects NO_UPDATE_NOTIFIER and CI environment variables.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import https from 'https';

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCachePaths(): { dir: string; file: string } {
  // Use process.env.HOME when available (respects test overrides),
  // fall back to os.homedir() which reads from the OS environment
  const home = process.env.HOME || homedir();
  const dir = join(home, '.claudelint');
  return { dir, file: join(dir, 'update-check.json') };
}
const PACKAGE_NAME = 'claude-code-lint';

interface CacheData {
  lastCheck: number;
  latestVersion: string | null;
}

/**
 * Check for available updates (non-blocking)
 *
 * Returns a message string if a newer version is available, null otherwise.
 * The actual HTTP check runs in the background and results are cached.
 *
 * @param currentVersion - Current package version
 * @returns Update message or null
 */
export function checkForUpdate(currentVersion: string): string | null {
  // Respect environment variables
  if (process.env.NO_UPDATE_NOTIFIER || process.env.CI) {
    return null;
  }

  try {
    // Read cache
    const cache = readCache();

    if (cache) {
      const age = Date.now() - cache.lastCheck;

      // If cache is fresh and we have a version, compare
      if (age < CHECK_INTERVAL_MS && cache.latestVersion) {
        if (isNewer(cache.latestVersion, currentVersion)) {
          return formatMessage(currentVersion, cache.latestVersion);
        }
        return null;
      }
    }

    // Trigger background check (fire and forget)
    fetchLatestVersion().catch(() => {
      // Silently ignore network errors
    });

    return null;
  } catch {
    // Never let update check errors affect the main tool
    return null;
  }
}

function readCache(): CacheData | null {
  try {
    const { file } = getCachePaths();
    if (!existsSync(file)) return null;
    const raw = readFileSync(file, 'utf-8');
    return JSON.parse(raw) as CacheData;
  } catch {
    return null;
  }
}

function writeCache(data: CacheData): void {
  try {
    const { dir, file } = getCachePaths();
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(file, JSON.stringify(data), 'utf-8');
  } catch {
    // Ignore write errors
  }
}

async function fetchLatestVersion(): Promise<void> {
  const version = await new Promise<string>((resolve, reject) => {
    const req = https.get(
      `https://registry.npmjs.org/${PACKAGE_NAME}/latest`,
      { timeout: 3000 },
      (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          res.resume();
          return;
        }

        let data = '';
        res.on('data', (chunk: Buffer) => {
          data += chunk.toString();
        });
        res.on('end', () => {
          try {
            const json = JSON.parse(data) as { version: string };
            resolve(json.version);
          } catch (e) {
            reject(e instanceof Error ? e : new Error(String(e)));
          }
        });
      }
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('timeout'));
    });
  });

  writeCache({ lastCheck: Date.now(), latestVersion: version });
}

/**
 * Compare semver versions (basic: major.minor.patch)
 */
function isNewer(latest: string, current: string): boolean {
  const latestParts = latest.replace(/^v/, '').split('-')[0].split('.').map(Number);
  const currentParts = current.replace(/^v/, '').split('-')[0].split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const l = latestParts[i] || 0;
    const c = currentParts[i] || 0;
    if (l > c) return true;
    if (l < c) return false;
  }
  return false;
}

function formatMessage(current: string, latest: string): string {
  return `Update available: ${current} -> ${latest}. Run \`npm update ${PACKAGE_NAME}\` to update.`;
}
