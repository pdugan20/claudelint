/**
 * Tests for claude-md-glob-pattern-backslash rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/claude-md/claude-md-glob-pattern-backslash';

const ruleTester = new ClaudeLintRuleTester();

describe('claude-md-glob-pattern-backslash', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('claude-md-glob-pattern-backslash', rule, {
      valid: [
        // Correct forward slashes
        {
          content: `---
paths:
  - "src/**/*.ts"
  - "tests/**/*.test.ts"
---

# API Rules`,
          filePath: '/project/.claude/rules/api.md',
        },

        // Single path with forward slashes
        {
          content: `---
paths: ["lib/utils/*.js"]
---

Content here.`,
          filePath: '/project/.claude/rules/utils.md',
        },

        // No paths field (skipped)
        {
          content: `---
description: "Testing"
---

Content.`,
          filePath: '/project/.claude/rules/test.md',
        },

        // Not a rules file (should be ignored)
        {
          content: `---
paths: ["src\\\\bad\\\\path.ts"]
---

This is CLAUDE.md`,
          filePath: '/project/CLAUDE.md',
        },

        // Empty paths array
        {
          content: `---
paths: []
---

Content.`,
          filePath: '/project/.claude/rules/empty.md',
        },
      ],

      invalid: [
        // Single backslash in path
        {
          content: `---
paths: ["src\\\\api\\\\*.ts"]
---

Content.`,
          filePath: '/project/.claude/rules/api.md',
          errors: [
            {
              message: 'Path pattern uses backslashes',
            },
          ],
        },

        // Multiple paths with backslashes
        {
          content: `---
paths:
  - "src\\\\api\\\\*.ts"
  - "tests\\\\api\\\\*.test.ts"
---

Content.`,
          filePath: '/project/.claude/rules/api.md',
          errors: [
            {
              message: 'backslashes',
            },
            {
              message: 'backslashes',
            },
          ],
        },

        // Mixed slashes
        {
          content: `---
paths: ["src/api\\\\handlers/*.ts"]
---

Content.`,
          filePath: '/project/.claude/rules/handlers.md',
          errors: [
            {
              message: 'Use forward slashes',
            },
          ],
        },
      ],
    });
  });
});
