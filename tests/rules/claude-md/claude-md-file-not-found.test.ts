/**
 * Tests for claude-md-file-not-found rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/claude-md/claude-md-file-not-found';
import { writeFileSync, unlinkSync, mkdirSync, rmdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const ruleTester = new ClaudeLintRuleTester();

describe('claude-md-file-not-found', () => {
  const testDir = join(tmpdir(), 'claude-lint-test-file-not-found');

  beforeEach(() => {
    try {
      mkdirSync(testDir, { recursive: true });
    } catch {
      // Directory might already exist
    }
  });

  afterEach(() => {
    try {
      const files = ['exists.md'];
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
    const existingFile = join(testDir, 'exists.md');
    const missingFile = join(testDir, 'does-not-exist.md');

    writeFileSync(existingFile, '# Existing File\n\nContent here.');

    await ruleTester.run('claude-md-file-not-found', rule, {
      valid: [
        // File exists
        {
          content: '# Existing File\n\nContent.',
          filePath: existingFile,
        },
      ],

      invalid: [
        // File does not exist
        {
          content: '# Missing File',
          filePath: missingFile,
          errors: [
            {
              message: 'File not found',
            },
          ],
        },

        // Another missing file
        {
          content: 'Content',
          filePath: join(testDir, 'another-missing.md'),
          errors: [
            {
              message: 'not found',
            },
          ],
        },
      ],
    });
  });
});
