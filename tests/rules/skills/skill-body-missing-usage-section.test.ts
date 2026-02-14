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
          errors: [{ message: 'Missing "## Usage" section' }],
        },
        // Has Examples but no Usage
        {
          content:
            '---\nname: my-skill\ndescription: Use this to test\n---\n\n# My Skill\n\n## Examples\n\nExample here.',
          filePath: '/test/skills/my-skill/SKILL.md',
          errors: [{ message: 'Missing "## Usage" section' }],
        },
        // Has other sections but no Usage
        {
          content:
            '---\nname: my-skill\ndescription: Use this to test\n---\n\n# My Skill\n\n## Overview\n\nOverview.\n\n## Notes\n\nNotes here.',
          filePath: '/test/skills/my-skill/SKILL.md',
          errors: [{ message: 'Missing "## Usage" section' }],
        },
      ],
    });
  });
});
