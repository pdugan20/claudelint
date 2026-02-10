/**
 * Tests for skill-arguments-without-hint rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-arguments-without-hint';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-arguments-without-hint', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-arguments-without-hint', rule, {
      valid: [
        // Has $ARGUMENTS with argument-hint
        {
          content:
            '---\nname: my-skill\ndescription: Test\nargument-hint: "<path> [options]"\n---\n# Skill\nRun with $ARGUMENTS',
          filePath: '/test/SKILL.md',
        },
        // Has $0 with argument-hint
        {
          content:
            '---\nname: my-skill\ndescription: Test\nargument-hint: "<file>"\n---\n# Skill\nFirst arg: $0',
          filePath: '/test/SKILL.md',
        },
        // No argument references in body
        {
          content:
            '---\nname: my-skill\ndescription: Test\n---\n# Skill\nRun the validation',
          filePath: '/test/SKILL.md',
        },
        // No frontmatter
        {
          content: '# Skill\nRun with $ARGUMENTS',
          filePath: '/test/SKILL.md',
        },
        // Empty body
        {
          content: '---\nname: my-skill\ndescription: Test\n---\n',
          filePath: '/test/SKILL.md',
        },
      ],

      invalid: [
        // $ARGUMENTS without argument-hint
        {
          content:
            '---\nname: my-skill\ndescription: Test\n---\n# Skill\nRun with $ARGUMENTS',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'missing argument-hint',
            },
          ],
        },
        // $0 without argument-hint
        {
          content:
            '---\nname: my-skill\ndescription: Test\n---\n# Skill\nFirst arg is $0',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'missing argument-hint',
            },
          ],
        },
        // $1 without argument-hint
        {
          content:
            '---\nname: my-skill\ndescription: Test\n---\n# Skill\nSecond arg is $1',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'missing argument-hint',
            },
          ],
        },
      ],
    });
  });
});
