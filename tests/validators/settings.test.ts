import { SettingsValidator } from '../../src/validators/settings';
import { writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

describe('SettingsValidator', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), `claude-validator-settings-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  async function createSettingsFile(settings: unknown, filename = 'settings.json') {
    const claudeDir = join(testDir, '.claude');
    await mkdir(claudeDir, { recursive: true });

    const filePath = join(claudeDir, filename);
    await writeFile(filePath, JSON.stringify(settings, null, 2));
    return filePath;
  }

  describe('JSON validation', () => {
    it('should pass for valid minimal settings', async () => {
      const filePath = await createSettingsFile({
        model: 'sonnet',
      });

      const validator = new SettingsValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should error for invalid JSON syntax', async () => {
      const claudeDir = join(testDir, '.claude');
      await mkdir(claudeDir, { recursive: true });
      const filePath = join(claudeDir, 'settings.json');
      await writeFile(filePath, '{ invalid json }');

      const validator = new SettingsValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Invalid JSON syntax'))).toBe(true);
    });

    it('should error for invalid model', async () => {
      const filePath = await createSettingsFile({
        model: 'gpt-4',
      });

      const validator = new SettingsValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Permission rules validation', () => {
    it('should pass for valid permission rules', async () => {
      const filePath = await createSettingsFile({
        permissions: [
          {
            tool: 'Bash',
            action: 'allow',
            pattern: 'git *',
          },
          {
            tool: 'Write',
            action: 'ask',
          },
        ],
      });

      const validator = new SettingsValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should warn for unknown tools', async () => {
      const filePath = await createSettingsFile({
        permissions: [
          {
            tool: 'UnknownTool',
            action: 'allow',
          },
        ],
      });

      const validator = new SettingsValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.warnings.some((w) => w.message.includes('Unknown tool'))).toBe(true);
    });

    it('should allow wildcard tool', async () => {
      const filePath = await createSettingsFile({
        permissions: [
          {
            tool: '*',
            action: 'ask',
          },
        ],
      });

      const validator = new SettingsValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should error for invalid permission action', async () => {
      const filePath = await createSettingsFile({
        permissions: [
          {
            tool: 'Bash',
            action: 'invalid',
          },
        ],
      });

      const validator = new SettingsValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
    });
  });

  describe('Hooks validation', () => {
    it('should pass for valid command hook', async () => {
      const filePath = await createSettingsFile({
        hooks: [
          {
            event: 'PreToolUse',
            type: 'command',
            command: 'npm run lint',
            matcher: {
              tool: 'Write',
              pattern: '*.ts',
            },
          },
        ],
      });

      const validator = new SettingsValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should error when command hook missing command field', async () => {
      const filePath = await createSettingsFile({
        hooks: [
          {
            event: 'PreToolUse',
            type: 'command',
          },
        ],
      });

      const validator = new SettingsValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('must have "command" field'))).toBe(
        true
      );
    });

    it('should error when prompt hook missing prompt field', async () => {
      const filePath = await createSettingsFile({
        hooks: [
          {
            event: 'UserPromptSubmit',
            type: 'prompt',
          },
        ],
      });

      const validator = new SettingsValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('must have "prompt" field'))).toBe(true);
    });

    it('should warn for unknown tool in hook matcher', async () => {
      const filePath = await createSettingsFile({
        hooks: [
          {
            event: 'PreToolUse',
            type: 'command',
            command: 'echo test',
            matcher: {
              tool: 'UnknownTool',
            },
          },
        ],
      });

      const validator = new SettingsValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.warnings.some((w) => w.message.includes('Unknown tool'))).toBe(true);
    });
  });

  describe('Environment variables validation', () => {
    it('should pass for valid environment variables', async () => {
      const filePath = await createSettingsFile({
        env: {
          GITHUB_TOKEN: '${GITHUB_TOKEN}',
          API_KEY: '${API_KEY}',
        },
      });

      const validator = new SettingsValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should warn for non-uppercase environment variable names', async () => {
      const filePath = await createSettingsFile({
        env: {
          myApiKey: 'value',
        },
      });

      const validator = new SettingsValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.warnings.some((w) => w.message.includes('uppercase with underscores'))).toBe(
        true
      );
    });

    it('should warn for empty environment variable values', async () => {
      const filePath = await createSettingsFile({
        env: {
          EMPTY_VAR: '',
        },
      });

      const validator = new SettingsValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.warnings.some((w) => w.message.includes('Empty value'))).toBe(true);
    });

    it('should warn for possible hardcoded secrets', async () => {
      const filePath = await createSettingsFile({
        env: {
          API_SECRET: 'sk-1234567890abcdefghijklmnop',
        },
      });

      const validator = new SettingsValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.warnings.some((w) => w.message.includes('hardcoded secret'))).toBe(true);
    });
  });

  describe('Model validation', () => {
    it('should pass for valid models', async () => {
      const models = ['sonnet', 'opus', 'haiku', 'inherit'];

      for (const model of models) {
        const filePath = await createSettingsFile({ model });

        const validator = new SettingsValidator({ path: filePath });
        const result = await validator.validate();

        expect(result.valid).toBe(true);
      }
    });
  });

  describe('Complex settings validation', () => {
    it('should validate complete settings file', async () => {
      const filePath = await createSettingsFile({
        model: 'sonnet',
        permissions: [
          {
            tool: 'Bash',
            action: 'allow',
            pattern: 'git *',
          },
        ],
        env: {
          GITHUB_TOKEN: '${GITHUB_TOKEN}',
        },
        hooks: [
          {
            event: 'PreToolUse',
            type: 'command',
            command: 'npm run lint',
            matcher: {
              tool: 'Write',
            },
          },
        ],
        enabledPlugins: {
          'my-plugin': true,
        },
        attribution: {
          enabled: true,
          name: 'Test User',
        },
      });

      const validator = new SettingsValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });
  });

  describe('No settings found', () => {
    it('should warn when no settings files exist', async () => {
      // Don't create any settings files - validator will search from cwd
      // Since we're in a temp test directory with no .claude/, it won't find any

      // Change to test directory temporarily
      const originalCwd = process.cwd();
      process.chdir(testDir);

      try {
        const validator = new SettingsValidator();
        const result = await validator.validate();

        // Should have warnings but be valid
        expect(result.errors).toHaveLength(0);
        expect(result.warnings.some((w) => w.message.includes('No settings.json files found'))).toBe(
          true
        );
        expect(result.valid).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});
