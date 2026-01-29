/**
 * Tests for skill-description rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-description';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-description', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-description', rule, {
      valid: [
        // Valid third-person description
        {
          content: '---\nname: my-skill\ndescription: Validates Claude configuration files\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },

        // Valid longer description
        {
          content: '---\nname: my-skill\ndescription: This skill helps to validate and lint Claude Code configuration files for best practices\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },

        // No description field (not this rule's responsibility)
        {
          content: '---\nname: my-skill\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },

        // No frontmatter (not this rule's responsibility)
        {
          content: '# Skill\n\nNo frontmatter',
          filePath: '/test/SKILL.md',
        },
      ],

      invalid: [
        // Too short (less than 10 characters)
        {
          content: '---\nname: my-skill\ndescription: Too short\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'at least 10 characters',
            },
          ],
        },

        // First person ("I")
        {
          content: '---\nname: my-skill\ndescription: I validate Claude files\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'third person',
            },
          ],
        },

        // Second person ("you")
        {
          content: '---\nname: my-skill\ndescription: You can validate your files\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'third person',
            },
          ],
        },

        // Contains XML tags
        {
          content: '---\nname: my-skill\ndescription: Validates <config> files for Claude\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'XML tags',
            },
          ],
        },
      ],
    });
  });
});
