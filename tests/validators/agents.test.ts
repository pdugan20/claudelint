import { AgentsValidator } from '../../src/validators/agents';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';

describe('AgentsValidator', () => {
  const { getTestDir } = setupTestDir();

  async function createAgent(
    agentName: string,
    frontmatter: Record<string, unknown>,
    content = '# System Prompt\n\nDetailed instructions for the agent.'
  ) {
    const agentDir = join(getTestDir(), '.claude', 'agents', agentName);
    await mkdir(agentDir, { recursive: true });

    const yamlLines = Object.entries(frontmatter)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          // Handle arrays of objects (like hooks) vs arrays of strings
          if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
            // Array of objects - serialize as YAML
            const items = value.map((item) => {
              const objLines = Object.entries(item as Record<string, unknown>)
                .map(([k, v]) => {
                  if (typeof v === 'object' && v !== null) {
                    // Nested object
                    const nestedLines = Object.entries(v as Record<string, unknown>)
                      .map(([nk, nv]) => `      ${nk}: ${JSON.stringify(nv)}`)
                      .join('\n');
                    return `    ${k}:\n${nestedLines}`;
                  }
                  return `    ${k}: ${JSON.stringify(v)}`;
                })
                .join('\n');
              return `  -\n${objLines}`;
            });
            return `${key}:\n${items.join('\n')}`;
          }
          // Array of simple values
          return `${key}:\n${value.map((v) => `  - ${v}`).join('\n')}`;
        }
        return `${key}: ${JSON.stringify(value)}`;
      })
      .join('\n');

    const agentContent = `---
${yamlLines}
---

${content}`;

    await writeFile(join(agentDir, 'AGENT.md'), agentContent);
    return agentDir;
  }

  describe('Required fields validation', () => {
    it('should pass for valid minimal agent', async () => {
      await createAgent('test-agent', {
        name: 'test-agent',
        description: 'A test agent for validation',
      });

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should error when name is missing', async () => {
      await createAgent('test-agent', {
        description: 'A test agent',
      });

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Required'))).toBe(true);
    });

    it('should error when description is missing', async () => {
      await createAgent('test-agent', {
        name: 'test-agent',
      });

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Required'))).toBe(true);
    });
  });

  describe('Name validation', () => {
    it('should error for invalid name format', async () => {
      await createAgent('test-agent', {
        name: 'TestAgent',
        description: 'Invalid name with uppercase',
      });

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) =>
          e.message.includes('Must contain only lowercase letters, numbers, and hyphens')
        )
      ).toBe(true);
    });

    it('should error when name does not match directory', async () => {
      await createAgent('test-agent', {
        name: 'different-name',
        description: 'Name mismatch',
      });

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('does not match directory name'))).toBe(
        true
      );
    });

    it('should error for name exceeding 64 characters', async () => {
      const longName = 'a'.repeat(65);
      await createAgent(longName, {
        name: longName,
        description: 'Too long name',
      });

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('64 characters or less'))).toBe(true);
    });
  });

  describe('Tools validation', () => {
    it('should pass for valid tools', async () => {
      await createAgent('test-agent', {
        name: 'test-agent',
        description: 'Test agent',
        tools: ['Bash', 'Read', 'Write'],
      });

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should warn for unknown tools', async () => {
      await createAgent('test-agent', {
        name: 'test-agent',
        description: 'Test agent',
        tools: ['Bash', 'UnknownTool'],
      });

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.warnings.some((w) => w.message.includes('Unknown tool: UnknownTool'))).toBe(
        true
      );
    });

    it('should error when both tools and disallowed-tools specified', async () => {
      await createAgent('test-agent', {
        name: 'test-agent',
        description: 'Test agent',
        tools: ['Bash'],
        'disallowed-tools': ['Write'],
      });

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.message.includes('Cannot specify both tools and disallowed-tools'))
      ).toBe(true);
    });
  });

  describe('Events validation', () => {
    it('should error when events array has more than 3 items', async () => {
      await createAgent('test-agent', {
        name: 'test-agent',
        description: 'Test agent',
        events: ['PreToolUse', 'PostToolUse', 'PrePromptSubmit', 'PostPromptSubmit'],
      });

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.message.includes('Events array cannot have more than 3 items'))
      ).toBe(true);
    });

    it('should pass for valid events array with 3 or fewer items', async () => {
      await createAgent('test-agent', {
        name: 'test-agent',
        description: 'Test agent',
        events: ['PreToolUse', 'PostToolUse', 'PrePromptSubmit'],
      });

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });
  });

  describe('Model validation', () => {
    it('should pass for valid model', async () => {
      await createAgent('test-agent', {
        name: 'test-agent',
        description: 'Test agent',
        model: 'sonnet',
      });

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should error for invalid model', async () => {
      await createAgent('test-agent', {
        name: 'test-agent',
        description: 'Test agent',
        model: 'gpt-4',
      });

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.message.includes('enum') || e.message.includes('gpt-4'))
      ).toBe(true);
    });
  });

  describe('Body content validation', () => {
    it('should warn when body content is too short', async () => {
      await createAgent('test-agent', {
        name: 'test-agent',
        description: 'Test agent',
      }, 'Short content');

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.warnings.some((w) => w.message.includes('body content is very short'))).toBe(
        true
      );
    });

    it('should warn when system prompt section is missing', async () => {
      await createAgent('test-agent', {
        name: 'test-agent',
        description: 'Test agent',
      }, 'This is the agent content without a system prompt section. It has more than 50 characters.');

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.warnings.some((w) => w.message.includes('System Prompt'))).toBe(true);
    });

    it('should pass when system prompt section is present', async () => {
      await createAgent('test-agent', {
        name: 'test-agent',
        description: 'Test agent',
      }, '# System Prompt\n\nDetailed instructions for the agent behavior.');

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.warnings.some((w) => w.message.includes('System Prompt'))).toBe(false);
    });
  });

  describe('Specific agent validation', () => {
    it('should validate only the specified agent', async () => {
      await createAgent('test-agent-1', {
        name: 'test-agent-1',
        description: 'Valid agent',
      });

      await createAgent('test-agent-2', {
        name: 'invalid',
        description: 'Invalid agent',
      });

      const validator = new AgentsValidator({ path: getTestDir(), agent: 'test-agent-1' });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });
  });

  describe('Hooks validation', () => {
    it('should pass for valid hooks', async () => {
      await createAgent('test-agent', {
        name: 'test-agent',
        description: 'Test agent',
        hooks: [
          {
            event: 'PreToolUse',
            type: 'prompt',
            prompt: 'Confirm before using this tool',
          },
        ],
      });

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should error for hooks with invalid schema', async () => {
      await createAgent('test-agent', {
        name: 'test-agent',
        description: 'Test agent',
        hooks: [
          {
            event: 'PreToolUse',
            type: 'prompt',
            // Missing required prompt field
          },
        ],
      });

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('prompt'))).toBe(true);
    });

    it('should warn for hooks with unknown event', async () => {
      await createAgent('test-agent', {
        name: 'test-agent',
        description: 'Test agent',
        hooks: [
          {
            event: 'UnknownEvent',
            type: 'prompt',
            prompt: 'Test prompt',
          },
        ],
      });

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('Unknown') && w.message.includes('event'))).toBe(true);
    });

    it('should pass for hooks with command type', async () => {
      await createAgent('test-agent', {
        name: 'test-agent',
        description: 'Test agent',
        hooks: [
          {
            event: 'PostToolUse',
            type: 'command',
            command: 'echo "Tool used"',
          },
        ],
      });

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should validate tool names in matchers', async () => {
      await createAgent('test-agent', {
        name: 'test-agent',
        description: 'Test agent',
        hooks: [
          {
            event: 'PreToolUse',
            type: 'prompt',
            prompt: 'Confirm',
            matcher: {
              tool: 'InvalidTool',
            },
          },
        ],
      });

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('Unknown tool'))).toBe(true);
    });
  });

  describe('No agents found', () => {
    it('should warn when no agent directories exist', async () => {
      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.warnings.some((w) => w.message.includes('No agent directories found'))).toBe(
        true
      );
    });
  });
});
