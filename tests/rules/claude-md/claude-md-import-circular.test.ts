/**
 * Tests for claude-md-import-circular rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/claude-md/claude-md-import-circular';
import { writeFileSync, unlinkSync, mkdirSync, rmdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const ruleTester = new ClaudeLintRuleTester();

describe('claude-md-import-circular', () => {
  const testDir = join(tmpdir(), 'claude-lint-test-import-circular');
  const rulesDir = join(testDir, '.claude', 'rules');

  beforeEach(() => {
    try {
      mkdirSync(rulesDir, { recursive: true });
    } catch {
      // Directory might already exist
    }
  });

  afterEach(() => {
    try {
      ['a.md', 'b.md', 'c.md', 'self.md', 'ignored.md'].forEach((file) => {
        try {
          unlinkSync(join(rulesDir, file));
        } catch {
          // File might not exist
        }
      });
      rmdirSync(rulesDir);
      rmdirSync(join(testDir, '.claude'));
      rmdirSync(testDir);
    } catch {
      // Cleanup errors are not critical
    }
  });

  it('should pass validation tests', async () => {
    const aFile = join(rulesDir, 'a.md');
    const bFile = join(rulesDir, 'b.md');
    const cFile = join(rulesDir, 'c.md');
    const selfFile = join(rulesDir, 'self.md');
    const ignoredFile = join(rulesDir, 'ignored.md');

    // Create files with circular imports: a -> b -> a
    writeFileSync(aFile, '@b.md\n\n# File A');
    writeFileSync(bFile, '@a.md\n\n# File B');
    writeFileSync(cFile, '# File C\n\nNo imports');
    writeFileSync(selfFile, '@self.md\n\n# Self Import');
    writeFileSync(ignoredFile, '@a.md\n\n# Ignored');

    await ruleTester.run('claude-md-import-circular', rule, {
      valid: [
        // No circular import
        {
          content: '@c.md\n\n# Main',
          filePath: aFile,
        },

        // No imports at all
        {
          content: '# No Imports',
          filePath: cFile,
        },

        // Self-reference with allowSelfReference option
        {
          content: '@self.md',
          filePath: selfFile,
          options: { allowSelfReference: true },
        },
      ],

      invalid: [
        // Direct circular import: a -> b -> a
        {
          content: '@b.md\n\n# File A',
          filePath: aFile,
          errors: [
            {
              message: 'Circular import detected',
            },
          ],
        },

        // Self-reference (default behavior)
        {
          content: '@self.md',
          filePath: selfFile,
          errors: [
            {
              message: 'File imports itself',
            },
          ],
        },
      ],
    });
  });
});
