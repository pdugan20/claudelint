import { PluginValidator } from '../../src/validators/plugin';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';

describe('PluginValidator', () => {
  const { getTestDir } = setupTestDir();

  async function createPluginManifest(manifest: unknown) {
    const filePath = join(getTestDir(), 'plugin.json');
    await writeFile(filePath, JSON.stringify(manifest, null, 2));
    return filePath;
  }

  async function createSkill(skillName: string) {
    const skillDir = join(getTestDir(), '.claude', 'skills', skillName);
    await mkdir(skillDir, { recursive: true });
    await writeFile(join(skillDir, 'SKILL.md'), '---\nname: test\ndescription: test\n---\n\n# Test');
  }

  describe('Schema validation', () => {
    it('should pass for valid minimal plugin manifest', async () => {
      const filePath = await createPluginManifest({
        name: 'test-plugin',
        version: '1.0.0',
        description: 'A test plugin',
      });

      const validator = new PluginValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should error for invalid JSON syntax', async () => {
      const filePath = join(getTestDir(), 'plugin.json');
      await writeFile(filePath, '{ invalid json }');

      const validator = new PluginValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Invalid JSON'))).toBe(true);
    });
  });

  describe('Required fields validation', () => {
    it('should error when name is missing', async () => {
      const filePath = await createPluginManifest({
        version: '1.0.0',
        description: 'A test plugin',
      });

      const validator = new PluginValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('name'))).toBe(true);
    });

    it('should error when version is missing', async () => {
      const filePath = await createPluginManifest({
        name: 'test-plugin',
        description: 'A test plugin',
      });

      const validator = new PluginValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('version'))).toBe(true);
    });

    it('should error when description is missing', async () => {
      const filePath = await createPluginManifest({
        name: 'test-plugin',
        version: '1.0.0',
      });

      const validator = new PluginValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('description'))).toBe(true);
    });
  });

  describe('Semantic versioning validation', () => {
    it('should pass for valid semver versions', async () => {
      const versions = ['1.0.0', '2.1.3', '0.0.1', '1.0.0-beta', '1.0.0-alpha.1', '1.0.0+build.123'];

      for (const version of versions) {
        const filePath = await createPluginManifest({
          name: 'test-plugin',
          version,
          description: 'A test plugin',
        });

        const validator = new PluginValidator({ path: filePath });
        const result = await validator.validate();

        expect(result.valid).toBe(true);
      }
    });

    it('should error for invalid semver versions', async () => {
      const versions = ['1.0', '1', 'v1.0.0', '1.0.0.0', 'latest', '1.0.x'];

      for (const version of versions) {
        const filePath = await createPluginManifest({
          name: 'test-plugin',
          version,
          description: 'A test plugin',
        });

        const validator = new PluginValidator({ path: filePath });
        const result = await validator.validate();

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.message.includes('Invalid semantic version'))).toBe(true);
      }
    });
  });

  describe('File reference validation', () => {
    it('should error when referenced skill does not exist', async () => {
      const filePath = await createPluginManifest({
        name: 'test-plugin',
        version: '1.0.0',
        description: 'A test plugin',
        skills: ['missing-skill'],
      });

      const validator = new PluginValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Referenced skill not found'))).toBe(true);
    });

    it('should pass when referenced skill exists', async () => {
      await createSkill('test-skill');

      const filePath = await createPluginManifest({
        name: 'test-plugin',
        version: '1.0.0',
        description: 'A test plugin',
        skills: ['test-skill'],
      });

      const validator = new PluginValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });
  });

  describe('Complex plugin manifest', () => {
    it('should validate complete plugin with all optional fields', async () => {
      await createSkill('skill-one');
      await createSkill('skill-two');

      const filePath = await createPluginManifest({
        name: 'complete-plugin',
        version: '2.1.0',
        description: 'A complete test plugin with all fields',
        author: 'Test Author',
        repository: 'https://github.com/test/plugin',
        license: 'MIT',
        skills: ['skill-one', 'skill-two'],
        agents: [],
        hooks: [],
        commands: [],
        mcpServers: [],
        dependencies: {
          'some-package': '^1.0.0',
        },
      });

      const validator = new PluginValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });
  });

  describe('No plugin manifests found', () => {
    it('should warn when no plugin.json files exist', async () => {
      const originalCwd = process.cwd();
      try {
        process.chdir(getTestDir());
        const validator = new PluginValidator();
        const result = await validator.validate();

        expect(result.valid).toBe(true);
        expect(result.warnings.some((w) => w.message.includes('No plugin.json files found'))).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});
