/**
 * Tests for skill-unknown-string-substitution rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-unknown-string-substitution';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-unknown-string-substitution', () => {
  it('should pass for valid substitutions', async () => {
    await ruleTester.run('skill-unknown-string-substitution', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
---

Use $ARGUMENTS for arguments.
Use $0 for first arg.
Use \${CLAUDE_SESSION_ID} for session ID.`,
        },
      ],
      invalid: [],
    });
  });

  it('should warn about unknown substitutions', async () => {
    await ruleTester.run('skill-unknown-string-substitution', rule, {
      valid: [],
      invalid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
---

Use $UNKNOWN_VAR for something.`,
          errors: [
            {
              message: 'Unknown string substitution: $UNKNOWN_VAR. Valid substitutions: $ARGUMENTS, $0-$9, ${VARIABLE}',
            },
          ],
        },
      ],
    });
  });

  it('should skip non-SKILL.md files', async () => {
    await ruleTester.run('skill-unknown-string-substitution', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/README.md',
          content: '$INVALID should be ignored',
        },
      ],
      invalid: [],
    });
  });

  it('should allow $0-$9 positional parameters', async () => {
    await ruleTester.run('skill-unknown-string-substitution', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
---

Use $0, $1, $2, $9 for positional args.`,
        },
      ],
      invalid: [],
    });
  });

  it('should skip substitutions inside inline code', async () => {
    await ruleTester.run('skill-unknown-string-substitution', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
---

Finds \`rm -rf $TEMP_DIR\` and flags it because \`$TEMP_DIR\` could be empty.`,
        },
      ],
      invalid: [],
    });
  });

  it('should skip substitutions inside fenced code blocks', async () => {
    await ruleTester.run('skill-unknown-string-substitution', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
---

Example:

\`\`\`bash
rm -rf $TEMP_DIR
echo $HOME
\`\`\``,
        },
      ],
      invalid: [],
    });
  });

  it('should allow ${VARIABLE} syntax', async () => {
    await ruleTester.run('skill-unknown-string-substitution', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
---

Use \${ANY_VARIABLE} syntax.`,
        },
      ],
      invalid: [],
    });
  });
});
