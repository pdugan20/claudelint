/**
 * Tests for skill-referenced-file-not-found rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-referenced-file-not-found';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-referenced-file-not-found', () => {
  it('should pass when no markdown links present', async () => {
    await ruleTester.run('skill-referenced-file-not-found', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: Test skill
---

# Usage

This skill has no file references.`,
        },
      ],
      invalid: [],
    });
  });

  it('should skip non-SKILL.md files', async () => {
    await ruleTester.run('skill-referenced-file-not-found', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/README.md',
          content: '[broken link](./does-not-exist.md)',
        },
      ],
      invalid: [],
    });
  });

  // Note: Testing actual file existence requires integration tests with real filesystem
  // or complex mocking. The rule logic is tested here, filesystem interaction tested separately.
});
