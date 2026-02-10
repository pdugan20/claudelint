/**
 * Tests for skill-mcp-tool-qualified-name rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-mcp-tool-qualified-name';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-mcp-tool-qualified-name', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-mcp-tool-qualified-name', rule, {
      valid: [
        // Built-in tools only
        {
          content: [
            '---',
            'name: my-skill',
            'description: Validate project files',
            'allowed-tools:',
            '  - Bash',
            '  - Read',
            '  - Write',
            '---',
            '',
            '# My Skill',
          ].join('\n'),
          filePath: '/test/skills/my-skill/SKILL.md',
        },
        // Built-in tool with scope
        {
          content: [
            '---',
            'name: my-skill',
            'description: Run lint commands',
            'allowed-tools:',
            '  - Bash(claudelint:*)',
            '---',
            '',
            '# My Skill',
          ].join('\n'),
          filePath: '/test/skills/my-skill/SKILL.md',
        },
        // Qualified MCP tool
        {
          content: [
            '---',
            'name: my-skill',
            'description: Interact with Firebase',
            'allowed-tools:',
            '  - mcp__firebase__firebase_login',
            '  - mcp__firebase__firebase_get_project',
            '---',
            '',
            '# My Skill',
          ].join('\n'),
          filePath: '/test/skills/my-skill/SKILL.md',
        },
        // No allowed-tools (skipped)
        {
          content: [
            '---',
            'name: my-skill',
            'description: Simple skill',
            '---',
            '',
            '# My Skill',
          ].join('\n'),
          filePath: '/test/skills/my-skill/SKILL.md',
        },
        // Mix of built-in and qualified MCP tools
        {
          content: [
            '---',
            'name: my-skill',
            'description: Full-featured skill',
            'allowed-tools:',
            '  - Bash',
            '  - Read',
            '  - mcp__sentry__get_issues',
            '---',
            '',
            '# My Skill',
          ].join('\n'),
          filePath: '/test/skills/my-skill/SKILL.md',
        },
      ],

      invalid: [
        // Unqualified tool name (not built-in)
        {
          content: [
            '---',
            'name: my-skill',
            'description: Interact with custom tools',
            'allowed-tools:',
            '  - firebase_login',
            '---',
            '',
            '# My Skill',
          ].join('\n'),
          filePath: '/test/skills/my-skill/SKILL.md',
          errors: [{ message: 'firebase_login' }],
        },
        // Multiple unqualified tool names
        {
          content: [
            '---',
            'name: my-skill',
            'description: Use various external tools',
            'allowed-tools:',
            '  - Bash',
            '  - get_issues',
            '  - create_pr',
            '---',
            '',
            '# My Skill',
          ].join('\n'),
          filePath: '/test/skills/my-skill/SKILL.md',
          errors: [{ message: 'get_issues' }, { message: 'create_pr' }],
        },
        // Unqualified tool mixed with qualified
        {
          content: [
            '---',
            'name: my-skill',
            'description: Firebase and custom tools',
            'allowed-tools:',
            '  - mcp__firebase__firebase_login',
            '  - custom_tool',
            '---',
            '',
            '# My Skill',
          ].join('\n'),
          filePath: '/test/skills/my-skill/SKILL.md',
          errors: [{ message: 'custom_tool' }],
        },
      ],
    });
  });
});
