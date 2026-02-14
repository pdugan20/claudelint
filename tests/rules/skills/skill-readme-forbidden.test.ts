/**
 * Tests for skill-readme-forbidden rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-readme-forbidden';

jest.mock('fs', () => {
  const actual = jest.requireActual('fs');
  return {
    ...actual,
    existsSync: jest.fn(),
  };
});

import * as fs from 'fs';
const mockExistsSync = fs.existsSync as jest.MockedFunction<typeof fs.existsSync>;

const ruleTester = new ClaudeLintRuleTester();

describe('skill-readme-forbidden', () => {
  afterEach(() => {
    mockExistsSync.mockReset();
  });

  it('should pass when no README.md exists', async () => {
    mockExistsSync.mockReturnValue(false);

    await ruleTester.run('skill-readme-forbidden', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: A test skill
---

# My Skill`,
        },
      ],
      invalid: [],
    });
  });

  it('should error when README.md exists in skill directory', async () => {
    mockExistsSync.mockReturnValue(true);

    await ruleTester.run('skill-readme-forbidden', rule, {
      valid: [],
      invalid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: A test skill
---

# My Skill`,
          errors: [
            {
              message:
                'README.md found; skills must use SKILL.md',
            },
          ],
        },
      ],
    });
  });

  it('should skip non-SKILL.md files', async () => {
    await ruleTester.run('skill-readme-forbidden', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/README.md',
          content: '# Some readme',
        },
      ],
      invalid: [],
    });
  });
});
