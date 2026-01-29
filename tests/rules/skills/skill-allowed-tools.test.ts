/**
 * Tests for skill-allowed-tools rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-allowed-tools';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-allowed-tools', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-allowed-tools', rule, {
      valid: [
        // Valid allowed-tools array
        {
          content: '---\nname: my-skill\ndescription: Test skill\nallowed-tools:\n  - Bash\n  - Read\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // No allowed-tools field (optional)
        {
          content: '---\nname: my-skill\ndescription: Test skill\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
      ],

      invalid: [
        // Both allowed-tools and disallowed-tools (mutually exclusive)
        {
          content: '---\nname: my-skill\ndescription: Test skill\nallowed-tools:\n  - Bash\ndisallowed-tools:\n  - Edit\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'both allowed-tools and disallowed-tools',
            },
          ],
        },
      ],
    });
  });
});
