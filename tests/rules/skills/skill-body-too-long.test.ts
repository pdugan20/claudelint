/**
 * Tests for skill-body-too-long rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-body-too-long';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-body-too-long', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-body-too-long', rule, {
      valid: [
        // Short body (less than 500 lines)
        {
          content: '---\nname: my-skill\n---\n# Skill\n\n' + 'Line\n'.repeat(100),
          filePath: '/test/SKILL.md',
        },

        // Less than 500 lines (accounting for frontmatter)
        {
          content: '---\nname: my-skill\n---\n# Skill\n\n' + 'Line\n'.repeat(490),
          filePath: '/test/SKILL.md',
        },

        // Not a SKILL.md file
        {
          content: '# README\n\n' + 'Line\n'.repeat(1000),
          filePath: '/test/README.md',
        },

        // No frontmatter (no body to check)
        {
          content: '# Skill\n\n' + 'Line\n'.repeat(600),
          filePath: '/test/SKILL.md',
        },
      ],

      invalid: [
        // Body too long (more than 500 lines)
        {
          content: '---\nname: my-skill\n---\n# Skill\n\n' + 'Line\n'.repeat(600),
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'body is very long',
            },
          ],
        },

        // Very long body
        {
          content: '---\nname: my-skill\n---\n# Skill\n\n' + 'Content\n'.repeat(1000),
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'body is very long',
            },
          ],
        },

        // Custom maxLines option
        {
          content: '---\nname: my-skill\n---\n# Skill\n\n' + 'Line\n'.repeat(300),
          filePath: '/test/SKILL.md',
          options: { maxLines: 200 },
          errors: [
            {
              message: 'body is very long',
            },
          ],
        },
      ],
    });
  });
});
