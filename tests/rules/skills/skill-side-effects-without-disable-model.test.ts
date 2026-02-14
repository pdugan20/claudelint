/**
 * Tests for skill-side-effects-without-disable-model rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-side-effects-without-disable-model';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-side-effects-without-disable-model', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-side-effects-without-disable-model', rule, {
      valid: [
        // Bash with disable-model-invocation: true
        {
          content:
            '---\nname: my-skill\ndescription: Test\ndisable-model-invocation: true\nallowed-tools:\n  - Bash\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // Write with disable-model-invocation: true
        {
          content:
            '---\nname: my-skill\ndescription: Test\ndisable-model-invocation: true\nallowed-tools:\n  - Write\n  - Read\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // Scoped Bash with disable-model-invocation: true
        {
          content:
            '---\nname: my-skill\ndescription: Test\ndisable-model-invocation: true\nallowed-tools:\n  - Bash(claudelint:*)\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // No side-effect tools (Read only)
        {
          content:
            '---\nname: my-skill\ndescription: Test\nallowed-tools:\n  - Read\n  - Grep\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // No allowed-tools field
        {
          content: '---\nname: my-skill\ndescription: Test\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // Empty allowed-tools
        {
          content:
            '---\nname: my-skill\ndescription: Test\nallowed-tools: []\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // No frontmatter
        {
          content: '# Skill\nSome content',
          filePath: '/test/SKILL.md',
        },
      ],

      invalid: [
        // Bash without disable-model-invocation
        {
          content:
            '---\nname: my-skill\ndescription: Test\nallowed-tools:\n  - Bash\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'Side-effect tools without disable-model-invocation',
            },
          ],
        },
        // Write without disable-model-invocation
        {
          content:
            '---\nname: my-skill\ndescription: Test\nallowed-tools:\n  - Write\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'Side-effect tools without disable-model-invocation',
            },
          ],
        },
        // Edit without disable-model-invocation
        {
          content:
            '---\nname: my-skill\ndescription: Test\nallowed-tools:\n  - Edit\n  - Read\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'Side-effect tools without disable-model-invocation',
            },
          ],
        },
        // Scoped Bash without disable-model-invocation
        {
          content:
            '---\nname: my-skill\ndescription: Test\nallowed-tools:\n  - Bash(claudelint:*)\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'Side-effect tools without disable-model-invocation',
            },
          ],
        },
        // disable-model-invocation: false (explicitly false)
        {
          content:
            '---\nname: my-skill\ndescription: Test\ndisable-model-invocation: false\nallowed-tools:\n  - Bash\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'Side-effect tools without disable-model-invocation',
            },
          ],
        },
      ],
    });
  });
});
