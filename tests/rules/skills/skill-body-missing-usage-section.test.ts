/**
 * Tests for skill-body-missing-usage-section rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-body-missing-usage-section';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-body-missing-usage-section', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-body-missing-usage-section', rule, {
      valid: [
        // Has ## Usage section
        {
          content:
            '---\nname: my-skill\ndescription: Use this to test\n---\n\n# My Skill\n\n## Usage\n\nRun `/my-skill` to start.',
          filePath: '/test/skills/my-skill/SKILL.md',
        },
        // Has ## Usage with extra content
        {
          content:
            '---\nname: my-skill\ndescription: Use this to test\n---\n\n# My Skill\n\nOverview.\n\n## Usage\n\nInvoke with arguments.\n\n## Examples\n\nExample here.',
          filePath: '/test/skills/my-skill/SKILL.md',
        },
        // Case insensitive
        {
          content:
            '---\nname: my-skill\ndescription: Use this to test\n---\n\n# My Skill\n\n## usage\n\nDetails here.',
          filePath: '/test/skills/my-skill/SKILL.md',
        },
        // Has ## Instructions section (Anthropic recommended alternative)
        {
          content:
            '---\nname: my-skill\ndescription: Use this to test\n---\n\n# My Skill\n\n## Instructions\n\n### Step 1\nDo this first.',
          filePath: '/test/skills/my-skill/SKILL.md',
        },
        // Instructions case insensitive
        {
          content:
            '---\nname: my-skill\ndescription: Use this to test\n---\n\n# My Skill\n\n## instructions\n\nDo this.',
          filePath: '/test/skills/my-skill/SKILL.md',
        },
        // Quick Start section
        {
          content:
            '---\nname: my-skill\ndescription: Use this to test\n---\n\n# My Skill\n\n## Quick Start\n\nGet started here.',
          filePath: '/test/skills/my-skill/SKILL.md',
        },
        // Quick Workflow section
        {
          content:
            '---\nname: my-skill\ndescription: Use this to test\n---\n\n# My Skill\n\n## Quick Workflow\n\n1. Do this\n2. Then this.',
          filePath: '/test/skills/my-skill/SKILL.md',
        },
        // Getting Started section
        {
          content:
            '---\nname: my-skill\ndescription: Use this to test\n---\n\n# My Skill\n\n## Getting Started\n\nFirst, install the tool.',
          filePath: '/test/skills/my-skill/SKILL.md',
        },
        // How to Use section
        {
          content:
            '---\nname: my-skill\ndescription: Use this to test\n---\n\n# My Skill\n\n## How to Use\n\nFollow these steps.',
          filePath: '/test/skills/my-skill/SKILL.md',
        },
        // Examples section
        {
          content:
            '---\nname: my-skill\ndescription: Use this to test\n---\n\n# My Skill\n\n## Examples\n\nExample here.',
          filePath: '/test/skills/my-skill/SKILL.md',
        },
        // Non-SKILL.md file (skipped)
        {
          content: '# No usage section here',
          filePath: '/test/skills/my-skill/README.md',
        },
        // No body (skipped — handled by other rules)
        {
          content: '---\nname: my-skill\ndescription: Use this to test\n---\n',
          filePath: '/test/skills/my-skill/SKILL.md',
        },
      ],

      invalid: [
        // No Usage section at all
        {
          content:
            '---\nname: my-skill\ndescription: Use this to test\n---\n\n# My Skill\n\nThis skill does things.',
          filePath: '/test/skills/my-skill/SKILL.md',
          errors: [{ message: 'Missing usage/instructions section' }],
        },
        // Has other sections but no recognized usage heading
        {
          content:
            '---\nname: my-skill\ndescription: Use this to test\n---\n\n# My Skill\n\n## Overview\n\nOverview.\n\n## Notes\n\nNotes here.',
          filePath: '/test/skills/my-skill/SKILL.md',
          errors: [{ message: 'Missing usage/instructions section' }],
        },
      ],
    });
  });
});
