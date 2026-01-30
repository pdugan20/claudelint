/**
 * Tests for skill-time-sensitive-content rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-time-sensitive-content';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-time-sensitive-content', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-time-sensitive-content', rule, {
      valid: [
        // No time-sensitive content
        {
          content: '---\nname: my-skill\n---\n# Skill\n\nThis is a skill for validating files.',
          filePath: '/test/SKILL.md',
        },

        // Time references in code blocks (acceptable)
        {
          content: '---\nname: my-skill\n---\n# Skill\n\nUse this in recent versions of the software.',
          filePath: '/test/SKILL.md',
        },

        // Not a SKILL.md file
        {
          content: 'Today we will learn about programming.',
          filePath: '/test/README.md',
        },

        // No frontmatter (no body to check)
        {
          content: '# Skill\n\nToday is a great day',
          filePath: '/test/SKILL.md',
        },
      ],

      invalid: [
        // Contains "today"
        {
          content: '---\nname: my-skill\n---\n# Skill\n\nToday we released version 2.0',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'Time-sensitive content detected',
            },
          ],
        },

        // Contains "yesterday"
        {
          content: '---\nname: my-skill\n---\n# Skill\n\nYesterday the bug was fixed',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'Time-sensitive content detected',
            },
          ],
        },

        // Contains "this week"
        {
          content: '---\nname: my-skill\n---\n# Skill\n\nThis week we are adding new features',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'Time-sensitive content detected',
            },
          ],
        },

        // Contains specific date
        {
          content: '---\nname: my-skill\n---\n# Skill\n\nReleased on January 15, 2024',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'Time-sensitive content detected',
            },
          ],
        },

        // Contains ISO date
        {
          content: '---\nname: my-skill\n---\n# Skill\n\nVersion 2.0 released 2024-01-15',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'Time-sensitive content detected',
            },
          ],
        },
      ],
    });
  });
});
