/**
 * Tests for claude-md-paths rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/claude-md/claude-md-paths';

const ruleTester = new ClaudeLintRuleTester();

describe('claude-md-paths', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('claude-md-paths', rule, {
      valid: [
        // Valid paths array
        {
          content: `---
paths:
  - "src/**/*.ts"
  - "tests/**/*.test.ts"
---

# API Rules`,
          filePath: '/project/.claude/rules/api.md',
        },

        // Single path
        {
          content: `---
paths: ["*.config.js"]
---

Config rules.`,
          filePath: '/project/.claude/rules/config.md',
        },

        // No paths field (optional)
        {
          content: `---
description: "General rules"
---

Content.`,
          filePath: '/project/.claude/rules/general.md',
        },

        // Not a rules file (should be ignored)
        {
          content: `---
paths: "not an array"
---

CLAUDE.md`,
          filePath: '/project/CLAUDE.md',
        },

        // Multiple valid paths
        {
          content: `---
paths:
  - "src/api/*.ts"
  - "src/utils/*.ts"
  - "lib/**/*.js"
---

Content.`,
          filePath: '/project/.claude/rules/src.md',
        },
      ],

      invalid: [
        // Paths is not an array
        {
          content: `---
paths: "src/**/*.ts"
---

Content.`,
          filePath: '/project/.claude/rules/api.md',
          errors: [
            {
              message: 'Paths field must be an array',
            },
          ],
        },

        // Empty paths array
        {
          content: `---
paths: []
---

Content.`,
          filePath: '/project/.claude/rules/empty.md',
          errors: [
            {
              message: 'Paths array must contain at least one path pattern',
            },
          ],
        },

        // Path is not a string
        {
          content: `---
paths:
  - 123
---

Content.`,
          filePath: '/project/.claude/rules/invalid.md',
          errors: [
            {
              message: 'Path at index 0 must be a string',
            },
          ],
        },

        // Empty string path
        {
          content: `---
paths:
  - ""
---

Content.`,
          filePath: '/project/.claude/rules/empty-string.md',
          errors: [
            {
              message: 'Path at index 0 cannot be empty',
            },
          ],
        },

        // Whitespace-only path
        {
          content: `---
paths:
  - "   "
---

Content.`,
          filePath: '/project/.claude/rules/whitespace.md',
          errors: [
            {
              message: 'cannot be empty',
            },
          ],
        },

        // Multiple invalid paths
        {
          content: `---
paths:
  - "src/**/*.ts"
  - 456
  - ""
---

Content.`,
          filePath: '/project/.claude/rules/mixed.md',
          errors: [
            {
              message: 'index 1 must be a string',
            },
            {
              message: 'index 2 cannot be empty',
            },
          ],
        },
      ],
    });
  });
});
