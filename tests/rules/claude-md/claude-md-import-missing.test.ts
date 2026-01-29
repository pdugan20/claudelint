/**
 * Tests for claude-md-import-missing rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/claude-md/claude-md-import-missing';
import { writeFileSync, unlinkSync, mkdirSync, rmdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const ruleTester = new ClaudeLintRuleTester();

describe('claude-md-import-missing', () => {
  const testDir = join(tmpdir(), 'claude-lint-test-import-missing');
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
      ['api.md', 'git.md'].forEach((file) => {
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
    const claudeFile = join(testDir, 'CLAUDE.md');
    const apiFile = join(rulesDir, 'api.md');

    writeFileSync(apiFile, '# API Rules\n\nContent here.');

    await ruleTester.run('claude-md-import-missing', rule, {
      valid: [
        // Import to existing file
        {
          content: '@.claude/rules/api.md\n\n# Main File',
          filePath: claudeFile,
        },

        // No imports
        {
          content: '# No Imports\n\nJust content.',
          filePath: claudeFile,
        },
      ],

      invalid: [
        // Import to non-existent file
        {
          content: '@.claude/rules/does-not-exist.md\n\n# Main',
          filePath: claudeFile,
          errors: [
            {
              message: 'Imported file not found: .claude/rules/does-not-exist.md',
            },
          ],
        },

        // Multiple missing imports
        {
          content: `@.claude/rules/missing1.md
@.claude/rules/missing2.md

# Main`,
          filePath: claudeFile,
          errors: [
            {
              message: 'missing1.md',
            },
            {
              message: 'missing2.md',
            },
          ],
        },

        // One exists, one doesn't
        {
          content: `@.claude/rules/api.md
@.claude/rules/nonexistent.md`,
          filePath: claudeFile,
          errors: [
            {
              message: 'nonexistent.md',
            },
          ],
        },
      ],
    });
  });
});
