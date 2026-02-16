/**
 * Tests for agent frontmatter schema
 */

import {
  AgentFrontmatterSchema,
  AgentFrontmatterWithRefinements,
} from '../../src/schemas/agent-frontmatter.schema';

describe('AgentFrontmatterSchema', () => {
  describe('name validation', () => {
    it('should accept valid lowercase-hyphen names', () => {
      const result = AgentFrontmatterSchema.safeParse({
        name: 'my-agent',
        description: 'This agent does something useful',
      });
      expect(result.success).toBe(true);
    });

    it('should reject uppercase in name', () => {
      const result = AgentFrontmatterSchema.safeParse({
        name: 'My-Agent',
        description: 'This agent does something',
      });
      expect(result.success).toBe(false);
    });

    it('should reject XML tags in name', () => {
      const result = AgentFrontmatterSchema.safeParse({
        name: 'my-<tag>-agent',
        description: 'This agent does something',
      });
      expect(result.success).toBe(false);
    });

    it('should reject names over 64 characters', () => {
      const result = AgentFrontmatterSchema.safeParse({
        name: 'a'.repeat(65),
        description: 'This agent does something',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('description validation', () => {
    it('should accept valid third-person descriptions', () => {
      const result = AgentFrontmatterSchema.safeParse({
        name: 'my-agent',
        description: 'This agent helps with testing',
      });
      expect(result.success).toBe(true);
    });

    it('should reject descriptions under 10 characters', () => {
      const result = AgentFrontmatterSchema.safeParse({
        name: 'my-agent',
        description: 'Short',
      });
      expect(result.success).toBe(false);
    });

    it('should accept descriptions with example XML tags', () => {
      const result = AgentFrontmatterSchema.safeParse({
        name: 'my-agent',
        description:
          'Use this agent when you need help.\n\n<example>\nuser: "Help me"\n</example>',
      });
      expect(result.success).toBe(true);
    });

    it('should accept descriptions with dialog containing I/you', () => {
      const result = AgentFrontmatterSchema.safeParse({
        name: 'my-agent',
        description: 'Use this agent when you need code review assistance',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('optional fields', () => {
    it('should accept valid model', () => {
      const result = AgentFrontmatterSchema.safeParse({
        name: 'my-agent',
        description: 'This agent does something',
        model: 'haiku',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid model', () => {
      const result = AgentFrontmatterSchema.safeParse({
        name: 'my-agent',
        description: 'This agent does something',
        model: 'invalid',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid tools', () => {
      const result = AgentFrontmatterSchema.safeParse({
        name: 'my-agent',
        description: 'This agent does something',
        tools: ['Bash', 'Read', 'Write'],
      });
      expect(result.success).toBe(true);
    });

    it('should accept any string for tools (validation happens in validator)', () => {
      // Note: tools uses z.array(z.string()) to allow custom validation
      // with warnings instead of schema errors. The Agents validator validates
      // tool names and issues warnings for unknown tools.
      const result = AgentFrontmatterSchema.safeParse({
        name: 'my-agent',
        description: 'This agent does something',
        tools: ['InvalidTool'],
      });
      expect(result.success).toBe(true);
    });

    it('should accept valid disallowedTools', () => {
      const result = AgentFrontmatterSchema.safeParse({
        name: 'my-agent',
        description: 'This agent does something',
        disallowedTools: ['Bash', 'Edit'],
      });
      expect(result.success).toBe(true);
    });

    it('should accept valid permissionMode', () => {
      const result = AgentFrontmatterSchema.safeParse({
        name: 'my-agent',
        description: 'This agent does something',
        permissionMode: 'acceptEdits',
      });
      expect(result.success).toBe(true);
    });

    it('should accept delegate permissionMode', () => {
      const result = AgentFrontmatterSchema.safeParse({
        name: 'my-agent',
        description: 'This agent does something',
        permissionMode: 'delegate',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid permissionMode', () => {
      const result = AgentFrontmatterSchema.safeParse({
        name: 'my-agent',
        description: 'This agent does something',
        permissionMode: 'invalid',
      });
      expect(result.success).toBe(false);
    });

    it('should accept maxTurns', () => {
      const result = AgentFrontmatterSchema.safeParse({
        name: 'my-agent',
        description: 'This agent does something',
        maxTurns: 10,
      });
      expect(result.success).toBe(true);
    });

    it('should reject non-positive maxTurns', () => {
      const result = AgentFrontmatterSchema.safeParse({
        name: 'my-agent',
        description: 'This agent does something',
        maxTurns: 0,
      });
      expect(result.success).toBe(false);
    });

    it('should accept mcpServers', () => {
      const result = AgentFrontmatterSchema.safeParse({
        name: 'my-agent',
        description: 'This agent does something',
        mcpServers: ['github', 'sentry'],
      });
      expect(result.success).toBe(true);
    });

    it('should accept memory config', () => {
      const result = AgentFrontmatterSchema.safeParse({
        name: 'my-agent',
        description: 'This agent does something',
        memory: 'project',
      });
      expect(result.success).toBe(true);
    });

    it('should accept valid color', () => {
      const result = AgentFrontmatterSchema.safeParse({
        name: 'my-agent',
        description: 'This agent does something',
        color: 'green',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid color', () => {
      const result = AgentFrontmatterSchema.safeParse({
        name: 'my-agent',
        description: 'This agent does something',
        color: 'purple',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('AgentFrontmatterWithRefinements', () => {
  it('should reject both tools and disallowedTools', () => {
    const result = AgentFrontmatterWithRefinements.safeParse({
      name: 'my-agent',
      description: 'This agent does something',
      tools: ['Bash'],
      disallowedTools: ['Read'],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('both');
    }
  });

  it('should accept tools alone', () => {
    const result = AgentFrontmatterWithRefinements.safeParse({
      name: 'my-agent',
      description: 'This agent does something',
      tools: ['Bash', 'Read'],
    });
    expect(result.success).toBe(true);
  });

  it('should accept disallowedTools alone', () => {
    const result = AgentFrontmatterWithRefinements.safeParse({
      name: 'my-agent',
      description: 'This agent does something',
      disallowedTools: ['Bash'],
    });
    expect(result.success).toBe(true);
  });
});
