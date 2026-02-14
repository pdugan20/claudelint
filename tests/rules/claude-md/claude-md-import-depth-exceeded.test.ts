/**
 * Tests for claude-md-import-depth-exceeded rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/claude-md/claude-md-import-depth-exceeded';
import { writeFileSync, unlinkSync, mkdirSync, rmdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const ruleTester = new ClaudeLintRuleTester();

describe('claude-md-import-depth-exceeded', () => {
  const testDir = join(tmpdir(), 'claude-lint-test-import-depth');
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
      ['level1.md', 'level2.md', 'level3.md', 'level4.md'].forEach((file) => {
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
    const level1 = join(rulesDir, 'level1.md');
    const level2 = join(rulesDir, 'level2.md');
    const level3 = join(rulesDir, 'level3.md');
    const level4 = join(rulesDir, 'level4.md');

    // Create nested imports
    writeFileSync(level1, '@level2.md\n\n# Level 1');
    writeFileSync(level2, '@level3.md\n\n# Level 2');
    writeFileSync(level3, '@level4.md\n\n# Level 3');
    writeFileSync(level4, '# Level 4\n\nNo more imports');

    await ruleTester.run('claude-md-import-depth-exceeded', rule, {
      valid: [
        // Shallow import (1 level)
        {
          content: '@.claude/rules/level4.md',
          filePath: mainFile,
        },

        // No imports
        {
          content: '# No Imports',
          filePath: mainFile,
        },

        // Custom maxDepth option (higher threshold)
        {
          content: '@.claude/rules/level1.md',
          filePath: mainFile,
          options: { maxDepth: 10 },
        },
      ],

      invalid: [
        // Deep nesting exceeds default max (5 levels)
        // main -> level1 -> level2 -> level3 -> level4 (4 levels, within default)
        // Would need even deeper nesting to trigger with default

        // Custom low maxDepth
        {
          content: '@.claude/rules/level1.md',
          filePath: mainFile,
          options: { maxDepth: 1 },
          errors: [
            {
              message: 'Import depth exceeds maximum',
            },
          ],
        },

        // Another low maxDepth test
        {
          content: '@.claude/rules/level1.md',
          filePath: mainFile,
          options: { maxDepth: 2 },
          errors: [
            {
              message: 'exceeds maximum (2)',
            },
          ],
        },
      ],
    });
  });
});
