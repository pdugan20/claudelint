/**
 * Tests for claude-md-size-error rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/claude-md/claude-md-size-error';
import { writeFileSync, unlinkSync, mkdirSync, rmdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const ruleTester = new ClaudeLintRuleTester();

describe('claude-md-size-error', () => {
  const testDir = join(tmpdir(), 'claude-lint-test-size-error');

  beforeEach(() => {
    try {
      mkdirSync(testDir, { recursive: true });
    } catch {
      // Directory might already exist
    }
  });

  afterEach(() => {
    try {
      const files = ['small.md', 'large.md', 'exact-threshold.md'];
      files.forEach((file) => {
        try {
          unlinkSync(join(testDir, file));
        } catch {
          // File might not exist
        }
      });
      rmdirSync(testDir);
    } catch {
      // Cleanup errors are not critical
    }
  });

  it('should pass validation tests', async () => {
    // Create test files with specific sizes
    const smallFile = join(testDir, 'small.md');
    const largeFile = join(testDir, 'large.md');
    const exactThresholdFile = join(testDir, 'exact-threshold.md');

    writeFileSync(smallFile, 'Small content'.repeat(100)); // ~1.3KB
    writeFileSync(largeFile, 'x'.repeat(45000)); // 45KB
    writeFileSync(exactThresholdFile, 'x'.repeat(40000)); // Exactly 40KB

    await ruleTester.run('claude-md-size-error', rule, {
      valid: [
        // Small file under threshold
        {
          content: 'Small content',
          filePath: smallFile,
        },

        // Custom maxSize option (higher threshold)
        {
          content: 'Content',
          filePath: largeFile,
          options: { maxSize: 50000 },
        },
      ],

      invalid: [
        // File exceeds default threshold (40KB)
        {
          content: 'Large content',
          filePath: largeFile,
          errors: [
            {
              message: 'File exceeds 40KB limit',
            },
          ],
        },

        // File at exact threshold (should error)
        {
          content: 'Content',
          filePath: exactThresholdFile,
          errors: [
            {
              message: 'exceeds',
            },
          ],
        },

        // Custom maxSize exceeded
        {
          content: 'Content',
          filePath: largeFile,
          options: { maxSize: 30000 },
          errors: [
            {
              message: 'exceeds 30KB',
            },
          ],
        },
      ],
    });
  });
});
