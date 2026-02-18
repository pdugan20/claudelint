/**
 * Tests for skill-name-directory-mismatch rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-name-directory-mismatch';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-name-directory-mismatch', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-name-directory-mismatch', rule, {
      valid: [
        {
          content: '---\nname: my-skill\ndescription: A test skill\n---\n# Skill',
          filePath: '/path/to/.claude/skills/my-skill/SKILL.md',
        },
        {
          content: '---\nname: test-runner\ndescription: Runs tests\n---\n# Skill',
          filePath: '.claude/skills/test-runner/SKILL.md',
        },
        {
          content: '---\nname: code-formatter\ndescription: Formats code\n---\n# Skill',
          filePath: '/Users/test/.claude/skills/code-formatter/SKILL.md',
        },
        // Template directories (prefixed with _) should be skipped
        {
          content: '---\nname: skill-name\ndescription: A template skill\n---\n# Skill',
          filePath: '/path/to/.claude/skills/_template/SKILL.md',
        },
        {
          content: '---\nname: my-custom-name\ndescription: A scaffold\n---\n# Skill',
          filePath: '.claude/skills/_scaffold/SKILL.md',
        },
      ],

      invalid: [
        {
          content: '---\nname: wrong-name\ndescription: A test skill\n---\n# Skill',
          filePath: '/path/to/.claude/skills/my-skill/SKILL.md',
          errors: [
            {
              message: 'Skill name "wrong-name" does not match directory name "my-skill"',
            },
          ],
        },
        {
          content: '---\nname: test_runner\ndescription: Runs tests\n---\n# Skill',
          filePath: '.claude/skills/test-runner/SKILL.md',
          errors: [
            {
              message: 'Skill name "test_runner" does not match directory name "test-runner"',
            },
          ],
        },
      ],
    });
  });
});
