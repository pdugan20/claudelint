/**
 * Tests for skill-missing-examples rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-missing-examples';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-missing-examples', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-missing-examples', rule, {
      valid: [
        // Has code blocks
        {
          content: '---\nname: my-skill\n---\n# Skill\n\n```bash\necho "example"\n```',
          filePath: '/test/SKILL.md',
        },

        // Has Example section
        {
          content: '---\nname: my-skill\n---\n# Skill\n\n## Example\n\nUse it like this.',
          filePath: '/test/SKILL.md',
        },

        // Has Usage section
        {
          content: '---\nname: my-skill\n---\n# Skill\n\n## Usage\n\nRun the command.',
          filePath: '/test/SKILL.md',
        },

        // Not a SKILL.md file
        {
          content: '# README\n\nNo examples needed',
          filePath: '/test/README.md',
        },

        // Has Examples (plural) section
        {
          content: '---\nname: my-skill\n---\n# Skill\n\n## Examples\n\nHere are some examples.',
          filePath: '/test/SKILL.md',
        },
      ],

      invalid: [
        // No code blocks or example sections
        {
          content: '---\nname: my-skill\n---\n# Skill\n\nThis is a skill without examples.',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'Missing usage examples',
            },
          ],
        },

        // Only has description
        {
          content: '---\nname: my-skill\ndescription: Does something\n---\n# Skill\n\nDescription here.',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'Missing usage examples',
            },
          ],
        },

        // Empty body
        {
          content: '---\nname: my-skill\n---\n',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'Missing usage examples',
            },
          ],
        },
      ],
    });
  });
});
