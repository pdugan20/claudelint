/**
 * Tests for skill-time-sensitive-content rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-time-sensitive-content';

const ruleTester = new ClaudeLintRuleTester();

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Returns a named date string 30 days ago (e.g. "January 15, 2026") */
function getRecentDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** Returns an ISO date string 30 days ago (e.g. "2026-01-15") */
function getRecentISODate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

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

        // Recent date (within default 180-day threshold) should NOT be flagged
        {
          content: `---\nname: my-skill\n---\n# Skill\n\nUpdated on ${getRecentDateString()}`,
          filePath: '/test/SKILL.md',
        },

        // Recent ISO date should NOT be flagged
        {
          content: `---\nname: my-skill\n---\n# Skill\n\nVersion 3.0 released ${getRecentISODate()}`,
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
              message: 'Time-sensitive content:',
            },
          ],
        },

        // Contains "yesterday"
        {
          content: '---\nname: my-skill\n---\n# Skill\n\nYesterday the bug was fixed',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'Time-sensitive content:',
            },
          ],
        },

        // Contains "this week"
        {
          content: '---\nname: my-skill\n---\n# Skill\n\nThis week we are adding new features',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'Time-sensitive content:',
            },
          ],
        },

        // Contains specific date
        {
          content: '---\nname: my-skill\n---\n# Skill\n\nReleased on January 15, 2024',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'Time-sensitive content:',
            },
          ],
        },

        // Contains ISO date
        {
          content: '---\nname: my-skill\n---\n# Skill\n\nVersion 2.0 released 2024-01-15',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'Time-sensitive content:',
            },
          ],
        },
      ],
    });
  });
});
