/**
 * Tests for claude-md-import-in-code-block rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/claude-md/claude-md-import-in-code-block';

const ruleTester = new ClaudeLintRuleTester();

describe('claude-md-import-in-code-block', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('claude-md-import-in-code-block', rule, {
      valid: [
        // Import outside code block
        {
          content: `# My Project

@.claude/rules/git.md

Some content here.`,
          filePath: 'CLAUDE.md',
        },

        // Multiple imports outside code blocks
        {
          content: `@.claude/rules/api.md

## Section

@.claude/rules/testing.md`,
          filePath: 'CLAUDE.md',
        },

        // Code block with no imports
        {
          content: `\`\`\`bash
echo "hello"
\`\`\``,
          filePath: 'CLAUDE.md',
        },

        // Import before and after code block
        {
          content: `@.claude/rules/before.md

\`\`\`bash
echo "code"
\`\`\`

@.claude/rules/after.md`,
          filePath: 'CLAUDE.md',
        },

        // Tilde code fence
        {
          content: `~~~bash
echo "test"
~~~

@.claude/rules/api.md`,
          filePath: 'CLAUDE.md',
        },

        // Email addresses in code blocks (not imports)
        {
          content: `\`\`\`yaml
author: user@example.com
\`\`\``,
          filePath: 'CLAUDE.md',
        },

        // Decorators in code blocks (not imports)
        {
          content: `\`\`\`typescript
@Component({ selector: 'app-root' })
export class AppComponent {}
\`\`\``,
          filePath: 'CLAUDE.md',
        },

        // JSDoc tags in code blocks (not imports)
        {
          content: `\`\`\`javascript
/**
 * @param name The user's name
 * @returns A greeting string
 */
function greet(name) {}
\`\`\``,
          filePath: 'CLAUDE.md',
        },
      ],

      invalid: [
        // Import inside code block
        {
          content: `\`\`\`markdown
@.claude/rules/api.md
\`\`\``,
          filePath: 'CLAUDE.md',
          errors: [
            {
              message: 'Import inside code block',
            },
          ],
        },

        // Import in bash code block
        {
          content: `\`\`\`bash
# This won't work
@.claude/rules/api.md
\`\`\``,
          filePath: 'CLAUDE.md',
          errors: [
            {
              message: '.claude/rules/api.md',
            },
          ],
        },

        // Multiple imports in code block
        {
          content: `\`\`\`
@.claude/rules/first.md
@.claude/rules/second.md
\`\`\``,
          filePath: 'CLAUDE.md',
          errors: [
            {
              message: 'first.md',
            },
            {
              message: 'second.md',
            },
          ],
        },

        // Import in tilde code fence
        {
          content: `~~~markdown
@.claude/rules/api.md
~~~`,
          filePath: 'CLAUDE.md',
          errors: [
            {
              message: 'inside code block',
            },
          ],
        },
      ],
    });
  });
});
