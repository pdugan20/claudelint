/**
 * Tests for skill-cross-reference-invalid rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-cross-reference-invalid';

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

describe('skill-cross-reference-invalid', () => {
  afterEach(() => {
    mockExistsSync.mockReset();
  });

  it('should pass when cross-referenced skills exist', async () => {
    mockExistsSync.mockReturnValue(true);

    await ruleTester.run('skill-cross-reference-invalid', rule, {
      valid: [
        {
          filePath: '/test/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: A test skill
---

# My Skill

## See Also

- [other-skill](../other-skill/SKILL.md) - Does other things`,
        },
      ],
      invalid: [],
    });
  });

  it('should warn when cross-referenced skill does not exist', async () => {
    mockExistsSync.mockReturnValue(false);

    await ruleTester.run('skill-cross-reference-invalid', rule, {
      valid: [],
      invalid: [
        {
          filePath: '/test/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: A test skill
---

# My Skill

## See Also

- [deleted-skill](../deleted-skill/SKILL.md) - Was removed`,
          errors: [
            {
              message:
                'Cross-reference to non-existent skill: ../deleted-skill/SKILL.md',
            },
          ],
        },
      ],
    });
  });

  it('should skip non-SKILL.md files', async () => {
    await ruleTester.run('skill-cross-reference-invalid', rule, {
      valid: [
        {
          filePath: '/test/skills/my-skill/README.md',
          content: '- [bad](../nonexistent/SKILL.md)',
        },
      ],
      invalid: [],
    });
  });

  it('should skip non-skill links', async () => {
    await ruleTester.run('skill-cross-reference-invalid', rule, {
      valid: [
        {
          filePath: '/test/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: A test skill
---

# My Skill

See [docs](https://example.com) and [guide](./references/guide.md).`,
        },
      ],
      invalid: [],
    });
  });

  it('should detect multiple broken cross-references', async () => {
    mockExistsSync.mockReturnValue(false);

    await ruleTester.run('skill-cross-reference-invalid', rule, {
      valid: [],
      invalid: [
        {
          filePath: '/test/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: A test skill
---

# My Skill

## See Also

- [skill-a](../skill-a/SKILL.md)
- [skill-b](../skill-b/SKILL.md)`,
          errors: [
            {
              message:
                'Cross-reference to non-existent skill: ../skill-a/SKILL.md',
            },
            {
              message:
                'Cross-reference to non-existent skill: ../skill-b/SKILL.md',
            },
          ],
        },
      ],
    });
  });
});
