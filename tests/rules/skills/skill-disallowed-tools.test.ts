/**
 * Tests for skill-disallowed-tools rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-disallowed-tools';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-disallowed-tools', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-disallowed-tools', rule, {
      valid: [
        // Valid disallowed-tools array
        {
          content: '---\nname: my-skill\ndescription: Test skill\ndisallowed-tools:\n  - Bash\n  - Edit\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // No disallowed-tools field (optional)
        {
          content: '---\nname: my-skill\ndescription: Test skill\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
      ],

      invalid: [
        // Not an array
        {
          content: '---\nname: my-skill\ndescription: Test skill\ndisallowed-tools: Bash\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'array',
            },
          ],
        },
      ],
    });
  });
});
