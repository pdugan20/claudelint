/**
 * Tests for skill-description-quality rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-description-quality';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-description-quality', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-description-quality', rule, {
      valid: [
        // Description starting with action verb and sufficient context
        {
          content: [
            '---',
            'name: my-skill',
            'description: Validate Claude Code project configuration files automatically',
            '---',
            '',
            '# My Skill',
          ].join('\n'),
          filePath: '/test/skills/my-skill/SKILL.md',
        },
        // Description starting with "Run"
        {
          content: [
            '---',
            'name: test-runner',
            'description: Run the complete test suite for the project',
            '---',
            '',
            '# Test Runner',
          ].join('\n'),
          filePath: '/test/skills/test-runner/SKILL.md',
        },
        // Description starting with "Generate"
        {
          content: [
            '---',
            'name: codegen',
            'description: Generate TypeScript types from API schema definitions',
            '---',
            '',
            '# Codegen',
          ].join('\n'),
          filePath: '/test/skills/codegen/SKILL.md',
        },
        // Unusual verb not in any allowlist (should pass with blocklist approach)
        {
          content: [
            '---',
            'name: scaffold',
            'description: Scaffold a new project with boilerplate and configuration files',
            '---',
            '',
            '# Scaffold',
          ].join('\n'),
          filePath: '/test/skills/scaffold/SKILL.md',
        },
        // Another unusual verb
        {
          content: [
            '---',
            'name: orchestrate',
            'description: Orchestrate multi-service deployments across cloud environments',
            '---',
            '',
            '# Orchestrate',
          ].join('\n'),
          filePath: '/test/skills/orchestrate/SKILL.md',
        },
        // No frontmatter (skipped)
        {
          content: '# Just a heading\n\nSome content.',
          filePath: '/test/skills/empty/SKILL.md',
        },
        // No description field (skipped)
        {
          content: ['---', 'name: no-desc', '---', '', '# No Desc'].join('\n'),
          filePath: '/test/skills/no-desc/SKILL.md',
        },
      ],

      invalid: [
        // Description starting with article "This"
        {
          content: [
            '---',
            'name: bad-skill',
            'description: This skill validates project configuration files and reports issues',
            '---',
            '',
            '# Bad Skill',
          ].join('\n'),
          filePath: '/test/skills/bad-skill/SKILL.md',
          errors: [{ message: 'Should start with action verb' }],
        },
        // Description starting with article "A"
        {
          content: [
            '---',
            'name: bad-skill',
            'description: A tool for validating project configuration files',
            '---',
            '',
            '# Bad Skill',
          ].join('\n'),
          filePath: '/test/skills/bad-skill/SKILL.md',
          errors: [{ message: 'Should start with action verb' }],
        },
        // Description starting with article "The"
        {
          content: [
            '---',
            'name: bad-skill',
            'description: The deployment pipeline for production server environments',
            '---',
            '',
            '# Bad Skill',
          ].join('\n'),
          filePath: '/test/skills/bad-skill/SKILL.md',
          errors: [{ message: 'Should start with action verb' }],
        },
        // Description starting with pronoun "My"
        {
          content: [
            '---',
            'name: bad-skill',
            'description: My custom script for running all project tests',
            '---',
            '',
            '# Bad Skill',
          ].join('\n'),
          filePath: '/test/skills/bad-skill/SKILL.md',
          errors: [{ message: 'Should start with action verb' }],
        },
        // Description starting with filler "Just"
        {
          content: [
            '---',
            'name: bad-skill',
            'description: Just runs the tests for this project quickly',
            '---',
            '',
            '# Bad Skill',
          ].join('\n'),
          filePath: '/test/skills/bad-skill/SKILL.md',
          errors: [{ message: 'Should start with action verb' }],
        },
        // Description too brief (under 6 words)
        {
          content: [
            '---',
            'name: brief-skill',
            'description: Run all project tests',
            '---',
            '',
            '# Brief Skill',
          ].join('\n'),
          filePath: '/test/skills/brief-skill/SKILL.md',
          errors: [{ message: 'Description has only 4 words' }],
        },
        // Description with both problems (non-verb start + too brief)
        {
          content: [
            '---',
            'name: bad-skill',
            'description: The deploy tool',
            '---',
            '',
            '# Bad Skill',
          ].join('\n'),
          filePath: '/test/skills/bad-skill/SKILL.md',
          errors: [
            { message: 'Should start with action verb' },
            { message: 'Description has only 3 words' },
          ],
        },
      ],
    });
  });

  it('should respect custom minWords option', async () => {
    await ruleTester.run('skill-description-quality', rule, {
      valid: [
        // 4 words passes with minWords: 4
        {
          content: [
            '---',
            'name: my-skill',
            'description: Deploy the staging app',
            '---',
            '',
            '# My Skill',
          ].join('\n'),
          filePath: '/test/skills/my-skill/SKILL.md',
          options: { minWords: 4 },
        },
      ],
      invalid: [
        // 4 words fails with minWords: 8
        {
          content: [
            '---',
            'name: my-skill',
            'description: Deploy the staging app',
            '---',
            '',
            '# My Skill',
          ].join('\n'),
          filePath: '/test/skills/my-skill/SKILL.md',
          options: { minWords: 8 },
          errors: [{ message: 'Description has only 4 words, minimum is 8' }],
        },
      ],
    });
  });
});
