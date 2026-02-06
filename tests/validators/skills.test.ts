import { SkillsValidator } from '../../src/validators/skills';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';

describe('SkillsValidator', () => {
  const { getTestDir } = setupTestDir();

  async function createSkill(skillName: string, frontmatter: Record<string, unknown>) {
    const skillDir = join(getTestDir(), '.claude', 'skills', skillName);
    await mkdir(skillDir, { recursive: true });

    const skillMd = join(skillDir, 'SKILL.md');
    const content = `---
${Object.entries(frontmatter)
  .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
  .join('\n')}
---

# ${frontmatter.name}

This is the skill body content.
`;
    await writeFile(skillMd, content);
    return skillMd;
  }

  async function createRootLevelSkill(skillName: string, frontmatter: Record<string, unknown>) {
    const skillDir = join(getTestDir(), 'skills', skillName);
    await mkdir(skillDir, { recursive: true });

    const skillMd = join(skillDir, 'SKILL.md');
    const content = `---
${Object.entries(frontmatter)
  .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
  .join('\n')}
---

# ${frontmatter.name}

This is the skill body content.
`;
    await writeFile(skillMd, content);
    return skillMd;
  }

  async function createDirectSkill(skillName: string, frontmatter: Record<string, unknown>) {
    const skillDir = join(getTestDir(), skillName);
    await mkdir(skillDir, { recursive: true });

    const skillMd = join(skillDir, 'SKILL.md');
    const content = `---
${Object.entries(frontmatter)
  .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
  .join('\n')}
---

# ${frontmatter.name}

This is the skill body content.
`;
    await writeFile(skillMd, content);
    return skillMd;
  }

  describe('Orchestration', () => {
    it('should validate valid skill', async () => {
      await createSkill('test-skill', {
        name: 'test-skill',
        description: 'Test skill for validation',
      });

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should aggregate results from multiple skills', async () => {
      await createSkill('skill-one', {
        name: 'skill-one',
        description: 'First skill',
      });

      await createSkill('skill-two', {
        name: 'skill-two',
        description: 'Second skill',
      });

      await createSkill('skill-three', {
        name: 'skill-three',
        description: 'Third skill',
      });

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should validate only specified skill when path provided', async () => {
      await createSkill('skill-one', {
        name: 'skill-one',
        description: 'First skill',
      });

      await createSkill('skill-two', {
        name: 'skill-two',
        description: 'Second skill',
      });

      const skillOnePath = join(getTestDir(), '.claude', 'skills', 'skill-one');
      const validator = new SkillsValidator({ path: skillOnePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should handle missing skills directory', async () => {
      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      // No skills found is not an error - just an empty result
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle schema validation errors', async () => {
      const skillDir = join(getTestDir(), '.claude', 'skills', 'bad-skill');
      await mkdir(skillDir, { recursive: true });
      const skillMd = join(skillDir, 'SKILL.md');
      await writeFile(
        skillMd,
        `---
name: bad-skill
description: 123
---

Content here.
`
      );

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should find skills in root-level skills/ directory', async () => {
      await createRootLevelSkill('root-skill', {
        name: 'root-skill',
        description: 'A root-level skill',
      });

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should find skills when --path points directly to a skills directory', async () => {
      await createDirectSkill('direct-skill', {
        name: 'direct-skill',
        description: 'A directly referenced skill',
      });

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
