import { AgentsValidator } from '../../src/validators/agents';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';

describe('AgentsValidator', () => {
  const { getTestDir } = setupTestDir();

  async function createAgent(agentName: string, frontmatter: Record<string, unknown>) {
    const agentsDir = join(getTestDir(), '.claude', 'agents');
    await mkdir(agentsDir, { recursive: true });

    const agentFile = join(agentsDir, `${agentName}.md`);
    const content = `---
${Object.entries(frontmatter)
  .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
  .join('\n')}
---

This is the system prompt for the agent with enough content to pass the body length check.
`;
    await writeFile(agentFile, content);
    return agentFile;
  }

  async function createAgentRaw(agentName: string, content: string) {
    const agentsDir = join(getTestDir(), '.claude', 'agents');
    await mkdir(agentsDir, { recursive: true });
    const agentFile = join(agentsDir, `${agentName}.md`);
    await writeFile(agentFile, content);
    return agentFile;
  }

  async function createPluginAgent(agentName: string, frontmatter: Record<string, unknown>) {
    const agentsDir = join(getTestDir(), 'agents');
    await mkdir(agentsDir, { recursive: true });

    const agentFile = join(agentsDir, `${agentName}.md`);
    const content = `---
${Object.entries(frontmatter)
  .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
  .join('\n')}
---

This is the system prompt for the agent with enough content to pass the body length check.
`;
    await writeFile(agentFile, content);
    return agentFile;
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

      const validator = new AgentsValidator({ path: getTestDir(), agent: 'agent-one' });
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
      const agentsDir = join(getTestDir(), '.claude', 'agents');
      await mkdir(agentsDir, { recursive: true });
      const agentFile = join(agentsDir, 'bad-agent.md');
      await writeFile(
        agentFile,
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

  describe('Agent with all optional fields', () => {
    it('should validate agent with all fields populated', async () => {
      await createAgent('full-agent', {
        name: 'full-agent',
        description: 'Agent with all optional fields for comprehensive testing',
        model: 'sonnet',
        tools: ['Bash', 'Read', 'Write'],
        permissionMode: 'acceptEdits',
        memory: 'project',
        maxTurns: 25,
        color: 'green',
      });

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Schema deduplication', () => {
    it('should not produce duplicate errors for fields with matching rules', async () => {
      await createAgentRaw(
        'dup-test',
        `---
name: INVALID_UPPERCASE
description: Agent for testing deduplication
---

This is the system prompt for the agent with enough content to pass the body length check.
`
      );

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      const nameErrors = [...result.errors, ...result.warnings].filter(
        (r) => r.ruleId === 'agent-name'
      );
      expect(nameErrors).toHaveLength(1);
    });

    it('should not produce duplicate errors for invalid model', async () => {
      await createAgentRaw(
        'dup-model',
        `---
name: dup-model
description: Agent for testing model deduplication
model: gpt-4
---

This is the system prompt for the agent with enough content to pass the body length check.
`
      );

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      const modelErrors = [...result.errors, ...result.warnings].filter(
        (r) => r.ruleId === 'agent-model'
      );
      expect(modelErrors).toHaveLength(1);
    });

    it('should still report schema-only errors for fields without matching rules', async () => {
      await createAgentRaw(
        'schema-only',
        `---
name: schema-only
description: Agent with invalid permissionMode
permissionMode: banana
---

This is the system prompt for the agent with enough content to pass the body length check.
`
      );

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      // permissionMode has no matching rule, so the schema error should still fire
      const allIssues = [...result.errors, ...result.warnings];
      const permissionError = allIssues.find((r) => r.message.includes('Invalid option'));
      expect(permissionError).toBeDefined();
    });
  });

  describe('Inline disable directives', () => {
    // Note: Disable comments must go AFTER frontmatter closing --- because
    // extractFrontmatter() requires ^--- at the start of the file.

    it('should suppress specific rule with claudelint-disable-file', async () => {
      await createAgentRaw(
        'disable-body',
        `---
name: disable-body
description: Agent with suppressed body length check
---
<!-- claudelint-disable-file agent-body-too-short -->

Short.
`
      );

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      const bodyShortWarnings = [...result.errors, ...result.warnings].filter(
        (r) => r.ruleId === 'agent-body-too-short'
      );
      expect(bodyShortWarnings).toHaveLength(0);
    });

    it('should suppress thin-wrapper rule errors with claudelint-disable-file', async () => {
      await createAgentRaw(
        'disable-name',
        `---
name: INVALID_UPPERCASE
description: Agent with suppressed name check
---
<!-- claudelint-disable-file agent-name -->

This is the system prompt for the agent with enough content to pass the body length check.
`
      );

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      const nameErrors = [...result.errors, ...result.warnings].filter(
        (r) => r.ruleId === 'agent-name'
      );
      expect(nameErrors).toHaveLength(0);
    });

    it('should still report non-disabled rules', async () => {
      // Name doesn't match filename — triggers agent-name-filename-mismatch
      // Body is short — triggers agent-body-too-short, but disabled
      await createAgentRaw(
        'partial-disable',
        `---
name: wrong-name
description: Agent with name mismatch and suppressed body check
---
<!-- claudelint-disable-file agent-body-too-short -->

Short.
`
      );

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      // agent-body-too-short suppressed
      const bodyErrors = [...result.errors, ...result.warnings].filter(
        (r) => r.ruleId === 'agent-body-too-short'
      );
      expect(bodyErrors).toHaveLength(0);

      // agent-name-filename-mismatch still fires (not disabled)
      const mismatchErrors = result.errors.filter(
        (r) => r.ruleId === 'agent-name-filename-mismatch'
      );
      expect(mismatchErrors.length).toBeGreaterThan(0);
    });
  });

  describe('Skill resolution', () => {
    it('should pass when referenced skill exists', async () => {
      // Create the skill directory and SKILL.md
      const skillDir = join(getTestDir(), '.claude', 'skills', 'test-skill');
      await mkdir(skillDir, { recursive: true });
      await writeFile(
        join(skillDir, 'SKILL.md'),
        '---\nname: test-skill\ndescription: Use this to test skill resolution\n---\n\n## Usage\n\n```bash\necho test\n```\n'
      );

      // Create agent referencing the skill
      await createAgent('skill-agent', {
        name: 'skill-agent',
        description: 'Agent that references an existing skill',
        skills: ['test-skill'],
      });

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      const skillErrors = result.errors.filter((r) => r.ruleId === 'agent-skills-not-found');
      expect(skillErrors).toHaveLength(0);
    });

    it('should report error when referenced skill does not exist', async () => {
      await createAgent('bad-skill-agent', {
        name: 'bad-skill-agent',
        description: 'Agent that references a nonexistent skill',
        skills: ['nonexistent-skill'],
      });

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      const skillErrors = result.errors.filter((r) => r.ruleId === 'agent-skills-not-found');
      expect(skillErrors.length).toBeGreaterThan(0);
      expect(skillErrors[0].message).toContain('nonexistent-skill');
    });
  });

  describe('Plugin-level agents/ discovery', () => {
    it('should discover agents at plugin root agents/ directory', async () => {
      await createPluginAgent('plugin-agent', {
        name: 'plugin-agent',
        description: 'Agent discovered from plugin-level agents directory',
      });

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });
  });
});
