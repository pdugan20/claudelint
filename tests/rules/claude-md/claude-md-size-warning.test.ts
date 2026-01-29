/**
 * Tests for claude-md-size-warning rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/claude-md/claude-md-size-warning';
import { writeFileSync, unlinkSync, mkdirSync, rmdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const ruleTester = new ClaudeLintRuleTester();

describe('claude-md-size-warning', () => {
  const testDir = join(tmpdir(), 'claude-lint-test-size-warning');

  beforeEach(() => {
    try {
      mkdirSync(testDir, { recursive: true });
    } catch {
      // Directory might already exist
    }
  });

  afterEach(() => {
    try {
      const files = ['small.md', 'approaching.md', 'at-threshold.md'];
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
    const approachingFile = join(testDir, 'approaching.md');
    const atThresholdFile = join(testDir, 'at-threshold.md');

    writeFileSync(smallFile, 'Small content'.repeat(100)); // ~1.3KB
    writeFileSync(approachingFile, 'x'.repeat(36000)); // 36KB
    writeFileSync(atThresholdFile, 'x'.repeat(35000)); // Exactly 35KB

    await ruleTester.run('claude-md-size-warning', rule, {
      valid: [
        // Small file well under threshold
        {
          content: 'Small',
          filePath: smallFile,
        },

        // Custom maxSize option (higher threshold)
        {
          content: 'Content',
          filePath: approachingFile,
          options: { maxSize: 40000 },
        },
      ],

      invalid: [
        // File approaching default threshold (35KB)
        {
          content: 'Content',
          filePath: approachingFile,
          errors: [
            {
              message: 'approaching size limit',
            },
          ],
        },

        // File at exact threshold (should warn)
        {
          content: 'Content',
          filePath: atThresholdFile,
          errors: [
            {
              message: 'approaching',
            },
          ],
        },

        // Custom maxSize exceeded
        {
          content: 'Content',
          filePath: approachingFile,
          options: { maxSize: 30000 },
          errors: [
            {
              message: 'approaching size limit',
            },
          ],
        },
      ],
    });
  });
});
