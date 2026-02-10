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
            'description: Validate Claude Code project configuration files',
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
            'description: Generate TypeScript types from API schemas',
            '---',
            '',
            '# Codegen',
          ].join('\n'),
          filePath: '/test/skills/codegen/SKILL.md',
        },
        // Description starting with "Interactively"
        {
          content: [
            '---',
            'name: optimizer',
            'description: Interactively helps users optimize their CLAUDE.md files',
            '---',
            '',
            '# Optimizer',
          ].join('\n'),
          filePath: '/test/skills/optimizer/SKILL.md',
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
        // Description not starting with action verb
        {
          content: [
            '---',
            'name: bad-skill',
            'description: This skill validates project configuration files',
            '---',
            '',
            '# Bad Skill',
          ].join('\n'),
          filePath: '/test/skills/bad-skill/SKILL.md',
          errors: [{ message: 'should start with an action verb' }],
        },
        // Description starting with article
        {
          content: [
            '---',
            'name: bad-skill',
            'description: A tool for validating project configs',
            '---',
            '',
            '# Bad Skill',
          ].join('\n'),
          filePath: '/test/skills/bad-skill/SKILL.md',
          errors: [{ message: 'should start with an action verb' }],
        },
        // Description too brief (under 4 words)
        {
          content: [
            '---',
            'name: brief-skill',
            'description: Run all tests',
            '---',
            '',
            '# Brief Skill',
          ].join('\n'),
          filePath: '/test/skills/brief-skill/SKILL.md',
          errors: [{ message: 'too brief' }],
        },
        // Description with both problems
        {
          content: [
            '---',
            'name: bad-skill',
            'description: I do it',
            '---',
            '',
            '# Bad Skill',
          ].join('\n'),
          filePath: '/test/skills/bad-skill/SKILL.md',
          errors: [{ message: 'should start with an action verb' }, { message: 'too brief' }],
        },
      ],
    });
  });
});
