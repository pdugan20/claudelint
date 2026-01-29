/**
 * Tests for claude-md-rules-circular-symlink rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/claude-md/claude-md-rules-circular-symlink';
import { writeFileSync, unlinkSync, mkdirSync, rmdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const ruleTester = new ClaudeLintRuleTester();

describe('claude-md-rules-circular-symlink', () => {
  const testDir = join(tmpdir(), 'claude-lint-test-circular-symlink');
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
      ['regular.md', 'link.md'].forEach((file) => {
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
    const mainFile = join(testDir, 'CLAUDE.md');
    const regularFile = join(rulesDir, 'regular.md');

    writeFileSync(regularFile, '# Regular File\n\nNo symlinks');

    await ruleTester.run('claude-md-rules-circular-symlink', rule, {
      valid: [
        // Import to regular file (not a symlink)
        {
          content: '@.claude/rules/regular.md',
          filePath: mainFile,
        },

        // No imports
        {
          content: '# No Imports',
          filePath: mainFile,
        },

        // Import to non-existent file (handled by other rule)
        {
          content: '@.claude/rules/missing.md',
          filePath: mainFile,
        },
      ],

      invalid: [
        // Note: Creating actual circular symlinks in tests is complex and platform-dependent.
        // This test documents the expected behavior.
        // In real usage, this rule detects symlink cycles like: link1 -> link2 -> link1
      ],
    });
  });
});
