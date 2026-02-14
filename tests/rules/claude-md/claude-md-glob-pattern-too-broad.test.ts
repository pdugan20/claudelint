/**
 * Tests for claude-md-glob-pattern-too-broad rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/claude-md/claude-md-glob-pattern-too-broad';

const ruleTester = new ClaudeLintRuleTester();

describe('claude-md-glob-pattern-too-broad', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('claude-md-glob-pattern-too-broad', rule, {
      valid: [
        // Specific patterns
        {
          content: `---
paths:
  - "src/**/*.ts"
  - "tests/**/*.test.ts"
---

# API Rules`,
          filePath: '/project/.claude/rules/api.md',
        },

        // Directory-specific pattern
        {
          content: `---
paths: ["src/api/*.ts"]
---

Content here.`,
          filePath: '/project/.claude/rules/api.md',
        },

        // File extension pattern
        {
          content: `---
paths: ["*.config.js"]
---

Config rules.`,
          filePath: '/project/.claude/rules/config.md',
        },

        // No paths field
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
paths: ["**"]
---

CLAUDE.md`,
          filePath: '/project/CLAUDE.md',
        },
      ],

      invalid: [
        // Double star pattern
        {
          content: `---
paths: ["**"]
---

Content.`,
          filePath: '/project/.claude/rules/all.md',
          errors: [
            {
              message: 'Overly broad path pattern: **',
            },
          ],
        },

        // Single star pattern
        {
          content: `---
paths: ["*"]
---

Content.`,
          filePath: '/project/.claude/rules/all.md',
          errors: [
            {
              message: 'Overly broad path pattern: *',
            },
          ],
        },

        // Multiple broad patterns
        {
          content: `---
paths:
  - "**"
  - "*"
---

Content.`,
          filePath: '/project/.claude/rules/everything.md',
          errors: [
            {
              message: 'Overly broad path pattern: **',
            },
            {
              message: 'Overly broad path pattern: *',
            },
          ],
        },

        // Mixed specific and broad
        {
          content: `---
paths:
  - "src/**/*.ts"
  - "**"
---

Content.`,
          filePath: '/project/.claude/rules/mixed.md',
          errors: [
            {
              message: 'Overly broad path pattern: **',
            },
          ],
        },
      ],
    });
  });
});
