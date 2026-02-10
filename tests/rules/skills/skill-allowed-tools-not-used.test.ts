/**
 * Tests for skill-allowed-tools-not-used rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-allowed-tools-not-used';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-allowed-tools-not-used', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-allowed-tools-not-used', rule, {
      valid: [
        // All allowed tools referenced in body
        {
          content: [
            '---',
            'name: my-skill',
            'description: Validate project configuration',
            'allowed-tools:',
            '  - Bash',
            '  - Read',
            '---',
            '',
            '# My Skill',
            '',
            'Use the Bash tool to run validation.',
            'Use Read to examine files.',
          ].join('\n'),
          filePath: '/test/skills/my-skill/SKILL.md',
        },
        // Scoped tool referenced by base name
        {
          content: [
            '---',
            'name: my-skill',
            'description: Run linting commands',
            'allowed-tools:',
            '  - Bash(claudelint:*)',
            '---',
            '',
            '# My Skill',
            '',
            'Use the Bash tool to run claudelint commands.',
          ].join('\n'),
          filePath: '/test/skills/my-skill/SKILL.md',
        },
        // MCP tool referenced by short name
        {
          content: [
            '---',
            'name: my-skill',
            'description: Interact with Firebase',
            'allowed-tools:',
            '  - mcp__firebase__firebase_login',
            '---',
            '',
            '# My Skill',
            '',
            'Use firebase_login to authenticate.',
          ].join('\n'),
          filePath: '/test/skills/my-skill/SKILL.md',
        },
        // No allowed-tools (skipped)
        {
          content: [
            '---',
            'name: my-skill',
            'description: Simple skill with no tools',
            '---',
            '',
            '# My Skill',
            '',
            'This skill does not use any tools.',
          ].join('\n'),
          filePath: '/test/skills/my-skill/SKILL.md',
        },
        // No body content (skipped)
        {
          content: [
            '---',
            'name: my-skill',
            'description: A skill',
            'allowed-tools:',
            '  - Bash',
            '---',
          ].join('\n'),
          filePath: '/test/skills/my-skill/SKILL.md',
        },
      ],

      invalid: [
        // Tool listed but never referenced in body
        {
          content: [
            '---',
            'name: my-skill',
            'description: Validate project files',
            'allowed-tools:',
            '  - Bash',
            '  - Write',
            '---',
            '',
            '# My Skill',
            '',
            'Use the Bash tool to run validation.',
          ].join('\n'),
          filePath: '/test/skills/my-skill/SKILL.md',
          errors: [{ message: 'Write' }],
        },
        // Multiple unused tools
        {
          content: [
            '---',
            'name: my-skill',
            'description: Check files for issues',
            'allowed-tools:',
            '  - Bash',
            '  - Read',
            '  - Grep',
            '---',
            '',
            '# My Skill',
            '',
            'This skill checks files.',
          ].join('\n'),
          filePath: '/test/skills/my-skill/SKILL.md',
          errors: [{ message: 'Bash' }, { message: 'Read' }, { message: 'Grep' }],
        },
        // Scoped tool not referenced
        {
          content: [
            '---',
            'name: my-skill',
            'description: Run lint commands',
            'allowed-tools:',
            '  - Bash(claudelint:*)',
            '  - Edit',
            '---',
            '',
            '# My Skill',
            '',
            'This skill uses Edit to fix files.',
          ].join('\n'),
          filePath: '/test/skills/my-skill/SKILL.md',
          errors: [{ message: 'Bash(claudelint:*)' }],
        },
      ],
    });
  });
});
