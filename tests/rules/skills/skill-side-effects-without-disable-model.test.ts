/**
 * Tests for skill-side-effects-without-disable-model rule
 *
 * Only unscoped Bash (or Bash(*)) should trigger this rule.
 * Scoped Bash, Edit, Write, Read, Grep, Glob should NOT trigger.
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-side-effects-without-disable-model';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-side-effects-without-disable-model', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-side-effects-without-disable-model', rule, {
      valid: [
        // Unscoped Bash with disable-model-invocation: true
        {
          content:
            '---\nname: my-skill\ndescription: Test\ndisable-model-invocation: true\nallowed-tools:\n  - Bash\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // Bash(*) with disable-model-invocation: true
        {
          content:
            '---\nname: my-skill\ndescription: Test\ndisable-model-invocation: true\nallowed-tools:\n  - Bash(*)\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // Scoped Bash without disable-model-invocation (safe — command restricted)
        {
          content:
            '---\nname: my-skill\ndescription: Test\nallowed-tools:\n  - Bash(claudelint:*)\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // Scoped Bash with different pattern
        {
          content:
            '---\nname: my-skill\ndescription: Test\nallowed-tools:\n  - Bash(npm run *)\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // Scoped Bash with gh pattern (from Claude docs example)
        {
          content:
            '---\nname: pr-summary\ndescription: Summarize PR\nallowed-tools:\n  - Bash(gh *)\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // Edit and Write without disable-model-invocation (safe — working dir only)
        {
          content:
            '---\nname: my-skill\ndescription: Test\nallowed-tools:\n  - Edit\n  - Write\n  - Read\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // Scoped Bash + Edit + Write (all safe)
        {
          content:
            '---\nname: my-skill\ndescription: Test\nallowed-tools:\n  - Bash(claudelint:*)\n  - Read\n  - Edit\n  - Write\n  - Grep\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // Read-only tools (no approval required regardless)
        {
          content:
            '---\nname: my-skill\ndescription: Test\nallowed-tools:\n  - Read\n  - Grep\n  - Glob\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // NotebookEdit without disable-model-invocation (file mod, working dir only)
        {
          content:
            '---\nname: my-skill\ndescription: Test\nallowed-tools:\n  - NotebookEdit\n  - Read\n---\n# Skill',
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
        // Unscoped Bash without disable-model-invocation
        {
          content:
            '---\nname: my-skill\ndescription: Test\nallowed-tools:\n  - Bash\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'Unscoped Bash in allowed-tools without disable-model-invocation',
            },
          ],
        },
        // Bash(*) without disable-model-invocation (equivalent to unscoped)
        {
          content:
            '---\nname: my-skill\ndescription: Test\nallowed-tools:\n  - Bash(*)\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'Unscoped Bash in allowed-tools without disable-model-invocation',
            },
          ],
        },
        // Unscoped Bash mixed with safe tools
        {
          content:
            '---\nname: my-skill\ndescription: Test\nallowed-tools:\n  - Bash\n  - Read\n  - Edit\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'Unscoped Bash in allowed-tools without disable-model-invocation',
            },
          ],
        },
        // Unscoped Bash alongside scoped Bash
        {
          content:
            '---\nname: my-skill\ndescription: Test\nallowed-tools:\n  - Bash\n  - Bash(npm:*)\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'Unscoped Bash in allowed-tools without disable-model-invocation',
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
              message: 'Unscoped Bash in allowed-tools without disable-model-invocation',
            },
          ],
        },
      ],
    });
  });
});
