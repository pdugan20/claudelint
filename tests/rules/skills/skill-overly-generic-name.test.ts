/**
 * Tests for skill-overly-generic-name rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-overly-generic-name';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-overly-generic-name', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-overly-generic-name', rule, {
      valid: [
        // Valid descriptive names
        {
          content: '---\nname: format-code\ndescription: Formats source code files\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },

        {
          content: '---\nname: validate-config\ndescription: Validates configuration files\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },

        {
          content: '---\nname: test-api\ndescription: Tests API endpoints\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },

        {
          content: '---\nname: build-docker\ndescription: Builds Docker containers\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },

        // Valid multi-word names with specificity
        {
          content: '---\nname: project-utils\ndescription: Utility functions for projects\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },

        {
          content: '---\nname: api-helper\ndescription: Helper functions for API calls\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },

        // Specific single-word names that aren't generic verbs or keywords
        {
          content: '---\nname: docker\ndescription: Docker container management\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },

        {
          content: '---\nname: kubernetes\ndescription: Kubernetes cluster operations\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },

        // No name field (not this rule's responsibility)
        {
          content: '---\ndescription: A test skill for validation\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },

        // No frontmatter (not this rule's responsibility)
        {
          content: '# Skill\n\nNo frontmatter',
          filePath: '/test/SKILL.md',
        },
      ],

      invalid: [
        // Single-word verbs (too generic)
        {
          content: '---\nname: format\ndescription: Formats files\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'too generic (single-word verb)',
            },
          ],
        },

        {
          content: '---\nname: validate\ndescription: Validates something\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'too generic (single-word verb)',
            },
          ],
        },

        {
          content: '---\nname: test\ndescription: Tests code\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'too generic (single-word verb)',
            },
          ],
        },

        {
          content: '---\nname: build\ndescription: Builds projects\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'too generic (single-word verb)',
            },
          ],
        },

        {
          content: '---\nname: deploy\ndescription: Deploys applications\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'too generic (single-word verb)',
            },
          ],
        },

        {
          content: '---\nname: check\ndescription: Checks things\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'too generic (single-word verb)',
            },
          ],
        },

        {
          content: '---\nname: generate\ndescription: Generates content\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'too generic (single-word verb)',
            },
          ],
        },

        // Generic keywords only
        {
          content: '---\nname: utils\ndescription: Utility functions\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'too generic',
            },
          ],
        },

        {
          content: '---\nname: helper\ndescription: Helper functions\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'too generic',
            },
          ],
        },

        {
          content: '---\nname: tools\ndescription: Tool collection\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'too generic',
            },
          ],
        },

        {
          content: '---\nname: manager\ndescription: Manages things\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'too generic',
            },
          ],
        },

        // Multiple generic keywords combined
        {
          content: '---\nname: helper-utils\ndescription: Helper utilities\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'too generic',
            },
          ],
        },

        {
          content: '---\nname: tool-manager\ndescription: Tool management\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'too generic',
            },
          ],
        },
      ],
    });
  });
});
