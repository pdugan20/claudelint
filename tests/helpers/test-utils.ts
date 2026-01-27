/**
 * Shared test utilities
 */

import { mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

/**
 * Create a temporary test directory
 */
export async function createTestDir(prefix = 'claudelint-test'): Promise<string> {
  const testDir = join(tmpdir(), `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  await mkdir(testDir, { recursive: true });
  return testDir;
}

/**
 * Clean up a temporary test directory
 */
export async function cleanupTestDir(testDir: string): Promise<void> {
  await rm(testDir, { recursive: true, force: true });
}

/**
 * Create a test directory with beforeEach/afterEach setup
 * Usage in tests:
 *   const { getTestDir } = setupTestDir();
 *   // Use getTestDir() in your tests
 */
export function setupTestDir(prefix = 'claudelint-test'): {
  getTestDir: () => string;
} {
  let testDir: string;

  beforeEach(async () => {
    testDir = await createTestDir(prefix);
  });

  afterEach(async () => {
    await cleanupTestDir(testDir);
  });

  return {
    getTestDir: () => testDir,
  };
}
