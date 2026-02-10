/**
 * Tests for agent-hooks-invalid-schema rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/agents/agent-hooks-invalid-schema';

const ruleTester = new ClaudeLintRuleTester();

describe('agent-hooks-invalid-schema', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('agent-hooks-invalid-schema', rule, {
      valid: [
        // Any content
        {
          content: '{}',
          filePath: '/test/agents.json',
        },
      ],

      invalid: [
        // Note: This rule is a no-op placeholder. The actual validation is implemented
        // in AgentsValidator.validateFrontmatter() which uses the shared validateSettingsHooks() utility.
        // This rule exists to document the validation that occurs in the validator,
        // but the validate function itself does nothing as the work is done elsewhere
        // in the validation pipeline.
      ],
    });
  });
});
