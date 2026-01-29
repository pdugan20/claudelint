/**
 * Tests for skill-name rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-name';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-name', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-name', rule, {
      valid: [
        // Valid lowercase-with-hyphens name
        {
          content: '---\nname: my-skill\ndescription: A test skill for validation\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },

        // Valid single word
        {
          content: '---\nname: api\ndescription: A test skill for validation\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },

        // Valid with numbers
        {
          content: '---\nname: api-v2\ndescription: A test skill for validation\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },

        // No name field (not this rule's responsibility)
        {
          content: '---\ndescription: A test skill for validation\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },

        // No frontmatter (not this rule's responsibility)
        {
          content: '# Skill\n\nNo frontmatter',
          filePath: '/test/SKILL.md',
        },
      ],

      invalid: [
        // Uppercase letters
        {
          content: '---\nname: MySkill\ndescription: A test skill for validation\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'lowercase letters, numbers, and hyphens',
            },
          ],
        },

        // Underscores instead of hyphens
        {
          content: '---\nname: my_skill\ndescription: A test skill for validation\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'lowercase letters, numbers, and hyphens',
            },
          ],
        },

        // Spaces
        {
          content: '---\nname: my skill\ndescription: A test skill for validation\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'lowercase letters, numbers, and hyphens',
            },
          ],
        },

        // Too long (over 64 characters)
        {
          content: '---\nname: this-is-a-very-long-skill-name-that-exceeds-sixty-four-characters-limit\ndescription: A test skill for validation\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: '64 characters',
            },
          ],
        },

        // Reserved word
        {
          content: '---\nname: claude-helper\ndescription: A test skill for validation\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'reserved words',
            },
          ],
        },
      ],
    });
  });
});
