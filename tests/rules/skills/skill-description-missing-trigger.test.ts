/**
 * Tests for skill-description-missing-trigger rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-description-missing-trigger';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-description-missing-trigger', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-description-missing-trigger', rule, {
      valid: [
        // "Use when" trigger phrase
        {
          content:
            '---\nname: my-skill\ndescription: "Use when the user asks to validate their config"\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // "Use for" trigger phrase
        {
          content:
            '---\nname: my-skill\ndescription: "Use for running all validation checks"\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // "Use this skill for" trigger phrase
        {
          content:
            '---\nname: my-skill\ndescription: "Use this skill for code review"\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // Quoted trigger phrases
        {
          content:
            '---\nname: my-skill\ndescription: Triggered by "validate all" or "check everything"\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // Single-quoted trigger phrases
        {
          content:
            "---\nname: my-skill\ndescription: Responds to 'lint my project' command\n---\n# Skill",
          filePath: '/test/SKILL.md',
        },
        // "Use to" trigger phrase
        {
          content:
            '---\nname: my-skill\ndescription: "Use to validate skill files"\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // "Use this" trigger phrase
        {
          content:
            '---\nname: my-skill\ndescription: "Use this to run the full test suite"\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // No description field (handled by another rule)
        {
          content: '---\nname: my-skill\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // No frontmatter
        {
          content: '# Skill\nSome content',
          filePath: '/test/SKILL.md',
        },
      ],

      invalid: [
        // Generic description without trigger phrases
        {
          content:
            '---\nname: my-skill\ndescription: A skill that validates configuration\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'Skill description should include trigger phrases',
            },
          ],
        },
        // Very short description without triggers
        {
          content: '---\nname: my-skill\ndescription: Does stuff\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'trigger phrases',
            },
          ],
        },
        // Description that says what it is but not when to use it
        {
          content:
            '---\nname: my-skill\ndescription: The main validation skill for this project\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'trigger phrases',
            },
          ],
        },
      ],
    });
  });
});
