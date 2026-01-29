import { AgentsValidator } from '../../src/validators/agents';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';

describe('AgentsValidator', () => {
  const { getTestDir } = setupTestDir();

  async function createAgent(agentName: string, frontmatter: Record<string, unknown>) {
    const agentDir = join(getTestDir(), '.claude', 'agents', agentName);
    await mkdir(agentDir, { recursive: true });

    const agentMd = join(agentDir, 'AGENT.md');
    const content = `---
${Object.entries(frontmatter)
  .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
  .join('\n')}
---

# ${frontmatter.name}

## System Prompt

This is the system prompt for the agent.
`;
    await writeFile(agentMd, content);
    return agentMd;
  }

  describe('Orchestration', () => {
    it('should validate valid agent', async () => {
      await createAgent('test-agent', {
        name: 'test-agent',
        description: 'Test agent for validation',
      });

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should aggregate results from multiple agents', async () => {
      await createAgent('agent-one', {
        name: 'agent-one',
        description: 'First agent',
      });

      await createAgent('agent-two', {
        name: 'agent-two',
        description: 'Second agent',
      });

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should validate only specified agent when path provided', async () => {
      await createAgent('agent-one', {
        name: 'agent-one',
        description: 'First agent',
      });

      await createAgent('agent-two', {
        name: 'agent-two',
        description: 'Second agent',
      });

      const agentOnePath = join(getTestDir(), '.claude', 'agents', 'agent-one');
      const validator = new AgentsValidator({ path: agentOnePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should handle missing agents directory', async () => {
      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      // No agents found is not an error - just an empty result
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle schema validation errors', async () => {
      const agentDir = join(getTestDir(), '.claude', 'agents', 'bad-agent');
      await mkdir(agentDir, { recursive: true });
      const agentMd = join(agentDir, 'AGENT.md');
      await writeFile(
        agentMd,
        `---
name: bad-agent
description: 123
---

Content here.
`
      );

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
