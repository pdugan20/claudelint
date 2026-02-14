/**
 * Tests for claude-md-content-too-many-sections rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/claude-md/claude-md-content-too-many-sections';

const ruleTester = new ClaudeLintRuleTester();

describe('claude-md-content-too-many-sections', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('claude-md-content-too-many-sections', rule, {
      valid: [
        // File with reasonable number of sections
        {
          content: `# Heading 1
## Section 1
Content here.

## Section 2
More content.

## Section 3
Even more content.`,
          filePath: '/project/CLAUDE.md',
        },

        // Exactly at threshold (20 sections)
        {
          content: Array(20)
            .fill(0)
            .map((_, i) => `## Section ${i + 1}\nContent.`)
            .join('\n\n'),
          filePath: '/project/CLAUDE.md',
        },

        // Rules file (should be ignored)
        {
          content: Array(30)
            .fill(0)
            .map((_, i) => `## Section ${i + 1}`)
            .join('\n\n'),
          filePath: '/project/.claude/rules/api.md',
        },

        // Non-CLAUDE.md file (should be ignored)
        {
          content: Array(30)
            .fill(0)
            .map((_, i) => `## Section ${i + 1}`)
            .join('\n\n'),
          filePath: '/project/README.md',
        },

        // Custom maxSections option
        {
          content: Array(15)
            .fill(0)
            .map((_, i) => `## Section ${i + 1}`)
            .join('\n\n'),
          filePath: '/project/CLAUDE.md',
          options: { maxSections: 15 },
        },
      ],

      invalid: [
        // Too many sections (default threshold 20)
        {
          content: Array(25)
            .fill(0)
            .map((_, i) => `## Section ${i + 1}\nContent.`)
            .join('\n\n'),
          filePath: '/project/CLAUDE.md',
          errors: [
            {
              message: 'Too many sections (25, max 20)',
            },
          ],
        },

        // Way too many sections
        {
          content: Array(50)
            .fill(0)
            .map((_, i) => `# Heading ${i + 1}`)
            .join('\n'),
          filePath: '/project/CLAUDE.md',
          errors: [
            {
              message: 'Too many sections (50, max 20)',
            },
          ],
        },

        // Custom maxSections exceeded
        {
          content: Array(11)
            .fill(0)
            .map((_, i) => `## Section ${i + 1}`)
            .join('\n\n'),
          filePath: '/project/CLAUDE.md',
          options: { maxSections: 10 },
          errors: [
            {
              message: 'Too many sections (11, max 10)',
            },
          ],
        },
      ],
    });
  });
});
