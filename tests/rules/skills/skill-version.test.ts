/**
 * Tests for skill-version rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-version';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-version', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-version', rule, {
      valid: [
        // Valid semver
        {
          content: '---\nname: my-skill\ndescription: Test skill\nversion: 1.0.0\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },

        // Valid semver with prerelease
        {
          content: '---\nname: my-skill\ndescription: Test skill\nversion: 1.0.0-beta.1\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },

        // No version field (optional)
        {
          content: '---\nname: my-skill\ndescription: Test skill\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
      ],

      invalid: [
        // Invalid semver format (missing patch version)
        {
          content: '---\nname: my-skill\ndescription: Test skill\nversion: "1.0"\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'semantic version',
            },
          ],
        },

        // Invalid semver format (text prefix)
        {
          content: '---\nname: my-skill\ndescription: Test skill\nversion: v1.0.0\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'semantic version',
            },
          ],
        },
      ],
    });
  });
});
