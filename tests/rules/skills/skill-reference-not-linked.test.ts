/**
 * Tests for skill-reference-not-linked rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-reference-not-linked';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-reference-not-linked', () => {
  it('should pass when references are proper markdown links', async () => {
    await ruleTester.run('skill-reference-not-linked', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: Test skill
---

# Usage

See [size guide](./references/size-optimization.md) for details.
Check [example](./examples/basic.sh) for usage.`,
        },
      ],
      invalid: [],
    });
  });

  it('should pass for non-SKILL.md files', async () => {
    await ruleTester.run('skill-reference-not-linked', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/README.md',
          content: 'See `references/guide.md` for more info.',
        },
      ],
      invalid: [],
    });
  });

  it('should pass when backtick code does not reference supporting directories', async () => {
    await ruleTester.run('skill-reference-not-linked', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: Test skill
---

# Usage

Run \`npm install\` to get started.
Use \`config.json\` for settings.`,
        },
      ],
      invalid: [],
    });
  });

  it('should pass when backtick path is already inside a markdown link', async () => {
    await ruleTester.run('skill-reference-not-linked', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: Test skill
---

# Usage

See [guide](references/size-optimization.md) for details.`,
        },
      ],
      invalid: [],
    });
  });

  it('should warn when references/ path is in backticks without link', async () => {
    await ruleTester.run('skill-reference-not-linked', rule, {
      valid: [],
      invalid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: Test skill
---

# Usage

See \`references/size-optimization.md\` for details.`,
          errors: [
            {
              message: 'not linked',
            },
          ],
        },
      ],
    });
  });

  it('should warn when examples/ path is in backticks without link', async () => {
    await ruleTester.run('skill-reference-not-linked', rule, {
      valid: [],
      invalid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: Test skill
---

# Usage

Check \`examples/bar.sh\` for usage patterns.`,
          errors: [
            {
              message: 'not linked',
            },
          ],
        },
      ],
    });
  });

  it('should warn when scripts/ path is in backticks without link', async () => {
    await ruleTester.run('skill-reference-not-linked', rule, {
      valid: [],
      invalid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: Test skill
---

# Usage

Run \`scripts/deploy.sh\` to deploy.`,
          errors: [
            {
              message: 'not linked',
            },
          ],
        },
      ],
    });
  });

  it('should warn when templates/ path is in backticks without link', async () => {
    await ruleTester.run('skill-reference-not-linked', rule, {
      valid: [],
      invalid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: Test skill
---

# Usage

Use \`templates/config.yaml\` as a starting point.`,
          errors: [
            {
              message: 'not linked',
            },
          ],
        },
      ],
    });
  });
});
