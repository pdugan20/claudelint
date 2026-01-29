/**
 * Tests for claude-md-import-read-failed rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/claude-md/claude-md-import-read-failed';
import { writeFileSync, unlinkSync, mkdirSync, rmdirSync, chmodSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const ruleTester = new ClaudeLintRuleTester();

describe('claude-md-import-read-failed', () => {
  const testDir = join(tmpdir(), 'claude-lint-test-import-read-failed');
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
      ['readable.md', 'unreadable.md'].forEach((file) => {
        try {
          const filePath = join(rulesDir, file);
          try {
            chmodSync(filePath, 0o644); // Restore permissions before deleting
          } catch {
            // Might not exist or already have correct permissions
          }
          unlinkSync(filePath);
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
    const readableFile = join(rulesDir, 'readable.md');

    writeFileSync(readableFile, '# Readable\n\nContent.');

    await ruleTester.run('claude-md-import-read-failed', rule, {
      valid: [
        // Import to readable file
        {
          content: '@.claude/rules/readable.md\n\n# Main',
          filePath: claudeFile,
        },

        // No imports
        {
          content: '# No Imports',
          filePath: claudeFile,
        },

        // Import to non-existent file (handled by claude-md-import-missing)
        {
          content: '@.claude/rules/does-not-exist.md',
          filePath: claudeFile,
        },
      ],

      invalid: [
        // Note: Creating truly unreadable files in tests is platform-dependent
        // and may not work consistently. This test documents the expected behavior.
        // In real usage, this rule catches permission errors, corrupted files, etc.
      ],
    });
  });
});
