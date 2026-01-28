/**
 * Tests for skill frontmatter schema
 */

import {
  SkillFrontmatterSchema,
  SkillFrontmatterWithRefinements,
} from '../../src/schemas/skill-frontmatter.schema';

describe('SkillFrontmatterSchema', () => {
  describe('name validation', () => {
    it('should accept valid lowercase-hyphen names', () => {
      const result = SkillFrontmatterSchema.safeParse({
        name: 'my-skill',
        description: 'This skill does something useful',
      });
      expect(result.success).toBe(true);
    });

    it('should reject uppercase in name', () => {
      const result = SkillFrontmatterSchema.safeParse({
        name: 'My-Skill',
        description: 'This skill does something',
      });
      expect(result.success).toBe(false);
    });

    it('should reject XML tags in name', () => {
      const result = SkillFrontmatterSchema.safeParse({
        name: 'my-<tag>-skill',
        description: 'This skill does something',
      });
      expect(result.success).toBe(false);
    });

    it('should reject reserved words in name', () => {
      const result = SkillFrontmatterSchema.safeParse({
        name: 'claude-helper',
        description: 'This skill does something',
      });
      expect(result.success).toBe(false);
    });

    it('should reject names over 64 characters', () => {
      const result = SkillFrontmatterSchema.safeParse({
        name: 'a'.repeat(65),
        description: 'This skill does something',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('description validation', () => {
    it('should accept valid third-person descriptions', () => {
      const result = SkillFrontmatterSchema.safeParse({
        name: 'my-skill',
        description: 'This skill helps with testing',
      });
      expect(result.success).toBe(true);
    });

    it('should reject descriptions under 10 characters', () => {
      const result = SkillFrontmatterSchema.safeParse({
        name: 'my-skill',
        description: 'Short',
      });
      expect(result.success).toBe(false);
    });

    it('should reject first-person descriptions with "I"', () => {
      const result = SkillFrontmatterSchema.safeParse({
        name: 'my-skill',
        description: 'I help with testing things',
      });
      expect(result.success).toBe(false);
    });

    it('should reject second-person descriptions with "you"', () => {
      const result = SkillFrontmatterSchema.safeParse({
        name: 'my-skill',
        description: 'Helps you test things',
      });
      expect(result.success).toBe(false);
    });

    it('should reject XML tags in description', () => {
      const result = SkillFrontmatterSchema.safeParse({
        name: 'my-skill',
        description: 'This skill <em>helps</em> with testing',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('optional fields', () => {
    it('should accept valid model', () => {
      const result = SkillFrontmatterSchema.safeParse({
        name: 'my-skill',
        description: 'This skill does something',
        model: 'sonnet',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid model', () => {
      const result = SkillFrontmatterSchema.safeParse({
        name: 'my-skill',
        description: 'This skill does something',
        model: 'gpt-4',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid tools', () => {
      const result = SkillFrontmatterSchema.safeParse({
        name: 'my-skill',
        description: 'This skill does something',
        'allowed-tools': ['Bash', 'Read'],
      });
      expect(result.success).toBe(true);
    });

    it('should accept any string for tools (validation happens in validator)', () => {
      // Note: allowed-tools uses z.array(z.string()) to allow custom validation
      // with warnings instead of schema errors. The Skills validator validates
      // tool names and issues warnings for unknown tools.
      const result = SkillFrontmatterSchema.safeParse({
        name: 'my-skill',
        description: 'This skill does something',
        'allowed-tools': ['InvalidTool'],
      });
      expect(result.success).toBe(true);
    });
  });
});

describe('SkillFrontmatterWithRefinements', () => {
  it('should require agent when context is fork', () => {
    const result = SkillFrontmatterWithRefinements.safeParse({
      name: 'my-skill',
      description: 'This skill does something',
      context: 'fork',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('agent');
    }
  });

  it('should pass when agent provided with fork context', () => {
    const result = SkillFrontmatterWithRefinements.safeParse({
      name: 'my-skill',
      description: 'This skill does something',
      context: 'fork',
      agent: 'my-agent',
    });
    expect(result.success).toBe(true);
  });

  it('should reject both allowed-tools and disallowed-tools', () => {
    const result = SkillFrontmatterWithRefinements.safeParse({
      name: 'my-skill',
      description: 'This skill does something',
      'allowed-tools': ['Bash'],
      'disallowed-tools': ['Read'],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('both');
    }
  });

  it('should accept allowed-tools alone', () => {
    const result = SkillFrontmatterWithRefinements.safeParse({
      name: 'my-skill',
      description: 'This skill does something',
      'allowed-tools': ['Bash'],
    });
    expect(result.success).toBe(true);
  });

  it('should accept disallowed-tools alone', () => {
    const result = SkillFrontmatterWithRefinements.safeParse({
      name: 'my-skill',
      description: 'This skill does something',
      'disallowed-tools': ['Bash'],
    });
    expect(result.success).toBe(true);
  });
});
