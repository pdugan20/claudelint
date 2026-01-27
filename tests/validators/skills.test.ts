import { SkillsValidator } from '../../src/validators/skills';
import { writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

describe('SkillsValidator', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), `claude-validator-skills-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  async function createSkill(
    skillName: string,
    frontmatter: Record<string, unknown>,
    content = '# Skill Content'
  ) {
    const skillDir = join(testDir, '.claude', 'skills', skillName);
    await mkdir(skillDir, { recursive: true });

    const yamlLines = Object.entries(frontmatter)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}:\n${value.map((v) => `  - ${v}`).join('\n')}`;
        }
        return `${key}: ${JSON.stringify(value)}`;
      })
      .join('\n');

    const skillContent = `---
${yamlLines}
---

${content}`;

    await writeFile(join(skillDir, 'SKILL.md'), skillContent);
    return skillDir;
  }

  describe('Required fields validation', () => {
    it('should pass for valid minimal skill', async () => {
      await createSkill('test-skill', {
        name: 'test-skill',
        description: 'A test skill for validation',
      });

      const validator = new SkillsValidator({ path: testDir });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should error when name is missing', async () => {
      await createSkill('test-skill', {
        description: 'A test skill',
      });

      const validator = new SkillsValidator({ path: testDir });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Missing required field: name'))).toBe(
        true
      );
    });

    it('should error when description is missing', async () => {
      await createSkill('test-skill', {
        name: 'test-skill',
      });

      const validator = new SkillsValidator({ path: testDir });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Missing required field: description'))).toBe(
        true
      );
    });
  });

  describe('Name validation', () => {
    it('should error for invalid name format', async () => {
      await createSkill('test-skill', {
        name: 'TestSkill',
        description: 'Invalid name with uppercase',
      });

      const validator = new SkillsValidator({ path: testDir });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('lowercase with hyphens'))).toBe(true);
    });

    it('should error when name does not match directory', async () => {
      await createSkill('test-skill', {
        name: 'different-name',
        description: 'Name mismatch',
      });

      const validator = new SkillsValidator({ path: testDir });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('does not match directory name'))).toBe(
        true
      );
    });

    it('should error for name exceeding 64 characters', async () => {
      const longName = 'a'.repeat(65);
      await createSkill(longName, {
        name: longName,
        description: 'Too long name',
      });

      const validator = new SkillsValidator({ path: testDir });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('64 characters or less'))).toBe(true);
    });
  });

  describe('allowed-tools validation', () => {
    it('should pass for valid tools', async () => {
      await createSkill('test-skill', {
        name: 'test-skill',
        description: 'Test skill',
        'allowed-tools': ['Bash', 'Read', 'Write'],
      });

      const validator = new SkillsValidator({ path: testDir });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should error if allowed-tools is not an array', async () => {
      await createSkill('test-skill', {
        name: 'test-skill',
        description: 'Test skill',
        'allowed-tools': 'Bash',
      });

      const validator = new SkillsValidator({ path: testDir });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('must be an array'))).toBe(true);
    });

    it('should warn for unknown tools', async () => {
      await createSkill('test-skill', {
        name: 'test-skill',
        description: 'Test skill',
        'allowed-tools': ['Bash', 'UnknownTool'],
      });

      const validator = new SkillsValidator({ path: testDir });
      const result = await validator.validate();

      expect(result.warnings.some((w) => w.message.includes('Unknown tool: UnknownTool'))).toBe(
        true
      );
    });
  });

  describe('model validation', () => {
    it('should pass for valid model', async () => {
      await createSkill('test-skill', {
        name: 'test-skill',
        description: 'Test skill',
        model: 'sonnet',
      });

      const validator = new SkillsValidator({ path: testDir });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should error for invalid model', async () => {
      await createSkill('test-skill', {
        name: 'test-skill',
        description: 'Test skill',
        model: 'gpt-4',
      });

      const validator = new SkillsValidator({ path: testDir });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Invalid model'))).toBe(true);
    });
  });

  describe('Referenced files validation', () => {
    it('should error for non-existent referenced files', async () => {
      const content = `# Test Skill

See [template](./template.md) for examples.`;

      await createSkill('test-skill', {
        name: 'test-skill',
        description: 'Test skill',
      }, content);

      const validator = new SkillsValidator({ path: testDir });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Referenced file not found'))).toBe(
        true
      );
    });

    it('should pass when referenced files exist', async () => {
      const content = `# Test Skill

See [template](./template.md) for examples.`;

      const skillDir = await createSkill('test-skill', {
        name: 'test-skill',
        description: 'Test skill',
      }, content);

      // Create the referenced file
      await writeFile(join(skillDir, 'template.md'), '# Template');

      const validator = new SkillsValidator({ path: testDir });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });
  });

  describe('Specific skill validation', () => {
    it('should validate only the specified skill', async () => {
      await createSkill('skill-one', {
        name: 'skill-one',
        description: 'First skill',
      });

      await createSkill('skill-two', {
        name: 'wrong-name',
        description: 'Second skill with error',
      });

      const validator = new SkillsValidator({ path: testDir, skill: 'skill-one' });
      const result = await validator.validate();

      // Should only validate skill-one, which is valid
      expect(result.valid).toBe(true);
    });
  });

  describe('No skills found', () => {
    it('should warn when no skill directories exist', async () => {
      // Don't create any skills
      const validator = new SkillsValidator({ path: testDir });
      const result = await validator.validate();

      // No errors, but should warn about no skills found
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('No skill directories found'))).toBe(
        true
      );
    });
  });
});
