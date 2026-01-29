/**
 * Tests for claude-md-filename-case-sensitive rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/claude-md/claude-md-filename-case-sensitive';
import { writeFileSync, unlinkSync, mkdirSync, rmdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const ruleTester = new ClaudeLintRuleTester();

describe('claude-md-filename-case-sensitive', () => {
  const testDir = join(tmpdir(), 'claude-lint-test-case-sensitive');
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
      ['api.md', 'API.md', 'git.md'].forEach((file) => {
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
    const apiLower = join(rulesDir, 'api.md');
    const gitFile = join(rulesDir, 'git.md');

    writeFileSync(apiLower, '# API Rules (lowercase)');
    writeFileSync(gitFile, '# Git Rules');

    await ruleTester.run('claude-md-filename-case-sensitive', rule, {
      valid: [
        // Imports with consistent casing
        {
          content: '@.claude/rules/api.md\n\n# Main',
          filePath: mainFile,
        },

        // No imports
        {
          content: '# No Imports',
          filePath: mainFile,
        },

        // Multiple imports, no collisions
        {
          content: `@.claude/rules/api.md
@.claude/rules/git.md`,
          filePath: mainFile,
        },
      ],

      invalid: [
        // Case collision: importing both api.md and API.md
        // Note: This test may behave differently on case-insensitive vs case-sensitive filesystems
        // On macOS/Windows, API.md and api.md refer to the same file
        // On Linux, they would be different files
        {
          content: `@.claude/rules/api.md
@.claude/rules/API.md`,
          filePath: mainFile,
          errors: [
            {
              message: 'Case-sensitive filename collision',
            },
          ],
        },
      ],
    });
  });
});
