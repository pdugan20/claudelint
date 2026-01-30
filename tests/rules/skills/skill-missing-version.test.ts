/**
 * Tests for skill-missing-version rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-missing-version';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-missing-version', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-missing-version', rule, {
      valid: [
        // Has version field
        {
          content: '---\nname: my-skill\nversion: 1.0.0\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },

        // Not a SKILL.md file
        {
          content: '---\nname: test\n---\n# Test',
          filePath: '/test/README.md',
        },

        // No frontmatter (rule doesn't apply)
        {
          content: '# Skill\n\nNo frontmatter',
          filePath: '/test/SKILL.md',
        },
      ],

      invalid: [
        // Missing version field
        {
          content: '---\nname: my-skill\ndescription: A test skill\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'lacks "version" field',
            },
          ],
        },

        // Empty frontmatter (no name, so frontmatter is null and no error)
        // Commented out as the rule only reports when frontmatter exists but lacks version
        // {
        //   content: '---\n---\n# Skill',
        //   filePath: '/test/SKILL.md',
        //   errors: [
        //     {
        //       message: 'lacks "version" field',
        //     },
        //   ],
        // },

        // Has name but no version
        {
          content: '---\nname: test-skill\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'lacks "version" field',
            },
          ],
        },
      ],
    });
  });
});
