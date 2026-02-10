/**
 * Tests for skill-hardcoded-secrets rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-hardcoded-secrets';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-hardcoded-secrets', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-hardcoded-secrets', rule, {
      valid: [
        // Environment variable reference (safe)
        {
          content: '#!/bin/bash\ncurl -H "Authorization: Bearer $API_KEY" https://example.com',
          filePath: '/test/skills/my-skill/run.sh',
        },
        // Variable expansion (safe)
        {
          content: '#!/bin/bash\ntoken="${ANTHROPIC_API_KEY}"\ncurl -H "Bearer $token" url',
          filePath: '/test/skills/my-skill/run.sh',
        },
        // SKILL.md with no secrets
        {
          content:
            '---\nname: my-skill\ndescription: Use this to test\n---\n\n# My Skill\n\nRun the command.',
          filePath: '/test/skills/my-skill/SKILL.md',
        },
        // Non-skill file (skipped)
        {
          content: 'sk-ant-abcdefghijklmnopqrstuvwxyz1234567890',
          filePath: '/test/README.md',
        },
        // Comment with example pattern (skipped)
        {
          content: '#!/bin/bash\n# Example: sk-ant-your-key-here\necho "hello"',
          filePath: '/test/skills/my-skill/run.sh',
        },
        // Short strings that look like patterns but aren't
        {
          content: '#!/bin/bash\npassword=""\necho $password',
          filePath: '/test/skills/my-skill/run.sh',
        },
      ],

      invalid: [
        // Anthropic API key
        {
          content:
            '#!/bin/bash\ncurl -H "x-api-key: sk-ant-abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrst" url',
          filePath: '/test/skills/my-skill/run.sh',
          errors: [{ message: 'Anthropic API Key' }],
        },
        // GitHub token
        {
          content:
            '#!/bin/bash\nGH_TOKEN=ghp_abcdefghijklmnopqrstuvwxyz1234567890ab\ngit clone url',
          filePath: '/test/skills/my-skill/run.sh',
          errors: [{ message: 'GitHub Token' }],
        },
        // AWS access key
        {
          content: '#!/bin/bash\nexport AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE',
          filePath: '/test/skills/my-skill/run.sh',
          errors: [{ message: 'AWS Access Key' }],
        },
        // Hardcoded password
        {
          content: '#!/bin/bash\npassword="mysecretpassword123"',
          filePath: '/test/skills/my-skill/run.sh',
          errors: [{ message: 'Hardcoded Password' }],
        },
        // Private key in SKILL.md code block
        {
          content:
            '---\nname: my-skill\ndescription: Use this to test\n---\n\n```\n-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n```',
          filePath: '/test/skills/my-skill/SKILL.md',
          errors: [{ message: 'Private Key' }],
        },
        // Stripe live key
        {
          content: '#!/bin/bash\nSTRIPE_KEY=sk_live_abcdefghijklmnopqrstuvwx',
          filePath: '/test/skills/my-skill/run.sh',
          errors: [{ message: 'Stripe Live Key' }],
        },
        // Generic API key assignment
        {
          content: '#!/bin/bash\napi_key="abcdefghijklmnopqrstuvwxyz1234"',
          filePath: '/test/skills/my-skill/run.sh',
          errors: [{ message: 'Hardcoded API Key' }],
        },
      ],
    });
  });
});
