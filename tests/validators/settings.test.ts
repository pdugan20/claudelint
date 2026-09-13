import { SettingsValidator } from '../../src/validators/settings';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';

describe('SettingsValidator', () => {
  const { getTestDir } = setupTestDir();

  async function createSettingsFile(settings: Record<string, unknown>, filename = 'settings.json') {
    const settingsDir = join(getTestDir(), '.claude');
    await mkdir(settingsDir, { recursive: true });

    const filePath = join(settingsDir, filename);
    await writeFile(filePath, JSON.stringify(settings, null, 2));
    return filePath;
  }

  describe.each(['settings.json', 'settings.local.json'])('hooks in %s', (filename) => {
    const hooks = (handler: Record<string, unknown>, event = 'PreToolUse') => ({
      hooks: { [event]: [{ matcher: 'Bash', hooks: [handler] }] },
    });

    it('reports an unknown event once using the Hooks rule and its default warning severity', async () => {
      const path = await createSettingsFile(
        hooks({ type: 'command', command: 'echo ok' }, 'PoToolUse'),
        filename
      );
      const result = await new SettingsValidator({ path }).validate();

      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([
        expect.objectContaining({
          file: path,
          ruleId: 'hooks-invalid-event',
          message: 'Unknown hook event: PoToolUse',
        }),
      ]);
    });

    it('reports missing required handler fields once with a configurable rule ID', async () => {
      const path = await createSettingsFile(hooks({ type: 'command' }), filename);
      const result = await new SettingsValidator({ path }).validate();

      expect(result.warnings).toEqual([]);
      expect(result.errors).toEqual([
        expect.objectContaining({
          ruleId: 'hooks-invalid-config',
          message: 'Hook with type "command" must have "command" field',
        }),
      ]);
    });

    it('preserves valid agent hooks driven by a prompt', async () => {
      const path = await createSettingsFile(
        hooks({ type: 'agent', prompt: 'Verify tests pass.' }, 'Stop'),
        filename
      );
      const result = await new SettingsValidator({ path }).validate();
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
    });

    it('checks project-relative scripts rather than resolving them inside .claude', async () => {
      await mkdir(join(getTestDir(), 'scripts'));
      await writeFile(join(getTestDir(), 'scripts/check.sh'), '#!/bin/sh\n');
      const path = await createSettingsFile(
        hooks({ type: 'command', command: './scripts/check.sh' }),
        filename
      );
      const result = await new SettingsValidator({ path }).validate();
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
    });

    it('reports a missing project script with the Hooks rule', async () => {
      const path = await createSettingsFile(
        hooks({ type: 'command', command: './missing.sh' }),
        filename
      );
      const result = await new SettingsValidator({ path }).validate();
      expect(result.errors).toEqual([
        expect.objectContaining({
          file: path,
          ruleId: 'hooks-missing-script',
          message: 'Hook script not found: ./missing.sh',
        }),
      ]);
    });

    it.each(['off', 'warn', 'error'] as const)(
      'honors %s for hook semantics without helper duplicates',
      async (severity) => {
        const path = await createSettingsFile(
          {
            hooks: {
              PoToolUse: [{ hooks: [{ type: 'command', command: './missing.sh' }] }],
              PreToolUse: [{ hooks: [{ type: 'command' }] }],
            },
          },
          filename
        );
        const result = await new SettingsValidator({
          path,
          config: {
            rules: {
              'hooks-invalid-event': severity,
              'hooks-invalid-config': severity,
              'hooks-missing-script': severity,
            },
          },
        }).validate();
        expect(result.errors).toHaveLength(severity === 'error' ? 3 : 0);
        expect(result.warnings).toHaveLength(severity === 'warn' ? 3 : 0);
      }
    );

    it('still rejects malformed hook structure through the schema', async () => {
      const path = await createSettingsFile({ hooks: { PreToolUse: 'invalid' } }, filename);
      const result = await new SettingsValidator({ path }).validate();
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('hooks.PreToolUse');
    });

    it('handles malformed data under an unknown event without crashing rules', async () => {
      const path = await createSettingsFile(
        { hooks: { PoToolUse: [null, { hooks: [null] }] } },
        filename
      );
      const result = await new SettingsValidator({ path }).validate();
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([expect.objectContaining({ ruleId: 'hooks-invalid-event' })]);
    });

    it('runs Hooks rules on stdin content without a file on disk', async () => {
      const path = join(getTestDir(), '.claude', filename);
      const result = await new SettingsValidator({
        stdinFilename: path,
        stdinContent: JSON.stringify(hooks({ type: 'command', command: 'echo ok' }, 'PoToolUse')),
      }).validate();
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([
        expect.objectContaining({ file: path, ruleId: 'hooks-invalid-event' }),
      ]);
    });
  });

  describe('Orchestration', () => {
    it('should validate valid settings', async () => {
      const filePath = await createSettingsFile({
        permissions: {
          ask: ['Write'],
        },
      });

      const validator = new SettingsValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle invalid JSON syntax', async () => {
      const settingsDir = join(getTestDir(), '.claude');
      await mkdir(settingsDir, { recursive: true });
      const filePath = join(settingsDir, 'settings.json');
      await writeFile(filePath, '{ invalid json }');

      const validator = new SettingsValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle schema validation errors', async () => {
      const filePath = await createSettingsFile({
        permissions: 'not-an-array',
      });

      const validator = new SettingsValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should aggregate results from complex settings', async () => {
      const filePath = await createSettingsFile({
        permissions: {
          ask: ['Write'],
          allow: ['Bash'],
        },
        hooks: {
          PreToolUse: [
            {
              hooks: [
                {
                  type: 'command',
                  command: 'echo test',
                },
              ],
            },
          ],
        },
        env: {
          API_KEY: '${SECRET_KEY}',
        },
      });

      const validator = new SettingsValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should handle missing settings files', async () => {
      const originalCwd = process.cwd();
      process.chdir(getTestDir());

      try {
        const validator = new SettingsValidator();
        const result = await validator.validate();

        // No settings found is not an error - just an empty result
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
        expect(result.valid).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});
