import { HooksValidator } from '../../src/validators/hooks';
import { writeFile, mkdir, chmod, rm } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';

describe('HooksValidator', () => {
  const { getTestDir } = setupTestDir();

  async function createHooksFile(hooks: unknown) {
    const hooksDir = join(getTestDir(), '.claude', 'hooks');
    await mkdir(hooksDir, { recursive: true });

    const filePath = join(hooksDir, 'hooks.json');
    await writeFile(filePath, JSON.stringify({ hooks }, null, 2));
    return filePath;
  }

  describe('JSON validation', () => {
    it('should pass for valid hooks configuration', async () => {
      const filePath = await createHooksFile([
        {
          event: 'PreToolUse',
          type: 'command',
          command: 'echo test',
          matcher: {
            tool: 'Write',
            pattern: '.*\\.ts$',
          },
        },
      ]);

      const validator = new HooksValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should error for invalid JSON syntax', async () => {
      const hooksDir = join(getTestDir(), '.claude', 'hooks');
      await mkdir(hooksDir, { recursive: true });
      const filePath = join(hooksDir, 'hooks.json');
      await writeFile(filePath, '{ invalid json }');

      const validator = new HooksValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Invalid JSON syntax'))).toBe(true);
    });

    it('should error when hooks array is missing', async () => {
      const hooksDir = join(getTestDir(), '.claude', 'hooks');
      await mkdir(hooksDir, { recursive: true });
      const filePath = join(hooksDir, 'hooks.json');
      await writeFile(filePath, JSON.stringify({ foo: 'bar' }));

      const validator = new HooksValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
    });
  });

  describe('Event validation', () => {
    it('should pass for valid hook events', async () => {
      const validEvents = [
        'PreToolUse',
        'PostToolUse',
        'PostToolUseFailure',
        'UserPromptSubmit',
        'Stop',
        'SessionStart',
      ];

      for (const event of validEvents) {
        const filePath = await createHooksFile([
          {
            event,
            type: 'command',
            command: 'echo test',
          },
        ]);

        const validator = new HooksValidator({ path: filePath });
        const result = await validator.validate();

        expect(result.valid).toBe(true);

        // Clean up for next iteration
        await rm(filePath);
      }
    });

    it('should warn for unknown hook events', async () => {
      const filePath = await createHooksFile([
        {
          event: 'UnknownEvent',
          type: 'command',
          command: 'echo test',
        },
      ]);

      const validator = new HooksValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.warnings.some((w) => w.message.includes('Unknown hook event'))).toBe(true);
    });
  });

  describe('Hook type validation', () => {
    it('should pass for command hook with command field', async () => {
      const filePath = await createHooksFile([
        {
          event: 'PreToolUse',
          type: 'command',
          command: 'npm run lint',
        },
      ]);

      const validator = new HooksValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should error when command hook missing command field', async () => {
      const filePath = await createHooksFile([
        {
          event: 'PreToolUse',
          type: 'command',
        },
      ]);

      const validator = new HooksValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('must have "command" field'))).toBe(
        true
      );
    });

    it('should error when prompt hook missing prompt field', async () => {
      const filePath = await createHooksFile([
        {
          event: 'UserPromptSubmit',
          type: 'prompt',
        },
      ]);

      const validator = new HooksValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('must have "prompt" field'))).toBe(true);
    });

    it('should error when agent hook missing agent field', async () => {
      const filePath = await createHooksFile([
        {
          event: 'SubagentStart',
          type: 'agent',
        },
      ]);

      const validator = new HooksValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('must have "agent" field'))).toBe(true);
    });

    it('should error for invalid hook type', async () => {
      const filePath = await createHooksFile([
        {
          event: 'PreToolUse',
          type: 'invalid',
          command: 'echo test',
        },
      ]);

      const validator = new HooksValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
    });
  });

  describe('Matcher validation', () => {
    it('should pass for valid matcher', async () => {
      const filePath = await createHooksFile([
        {
          event: 'PreToolUse',
          type: 'command',
          command: 'echo test',
          matcher: {
            tool: 'Write',
            pattern: '.*\\.ts$',
          },
        },
      ]);

      const validator = new HooksValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should warn for unknown tool in matcher', async () => {
      const filePath = await createHooksFile([
        {
          event: 'PreToolUse',
          type: 'command',
          command: 'echo test',
          matcher: {
            tool: 'UnknownTool',
          },
        },
      ]);

      const validator = new HooksValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.warnings.some((w) => w.message.includes('Unknown tool in matcher'))).toBe(
        true
      );
    });

    it('should error for invalid regex pattern', async () => {
      const filePath = await createHooksFile([
        {
          event: 'PreToolUse',
          type: 'command',
          command: 'echo test',
          matcher: {
            pattern: '[invalid(regex',
          },
        },
      ]);

      const validator = new HooksValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Invalid regex pattern'))).toBe(true);
    });

    it('should pass for valid regex pattern', async () => {
      const filePath = await createHooksFile([
        {
          event: 'PreToolUse',
          type: 'command',
          command: 'echo test',
          matcher: {
            pattern: '^src/.*\\.ts$',
          },
        },
      ]);

      const validator = new HooksValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });
  });

  describe('Command script validation', () => {
    it('should skip validation for inline commands', async () => {
      const filePath = await createHooksFile([
        {
          event: 'PreToolUse',
          type: 'command',
          command: 'npm run lint && npm test',
        },
      ]);

      const validator = new HooksValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should skip validation for commands with variables', async () => {
      const filePath = await createHooksFile([
        {
          event: 'PreToolUse',
          type: 'command',
          command: 'echo ${FILE_PATH}',
        },
      ]);

      const validator = new HooksValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should error for non-existent script file', async () => {
      const filePath = await createHooksFile([
        {
          event: 'PreToolUse',
          type: 'command',
          command: './scripts/missing-script.sh',
        },
      ]);

      const validator = new HooksValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Hook script not found'))).toBe(true);
    });

    it('should pass when referenced script exists', async () => {
      // Create hook script
      const hooksDir = join(getTestDir(), '.claude', 'hooks');
      const scriptsDir = join(hooksDir, 'scripts');
      await mkdir(scriptsDir, { recursive: true });
      const scriptPath = join(scriptsDir, 'test-script.sh');
      await writeFile(scriptPath, '#!/bin/bash\necho "test"');
      await chmod(scriptPath, 0o755);

      const filePath = await createHooksFile([
        {
          event: 'PreToolUse',
          type: 'command',
          command: './scripts/test-script.sh',
        },
      ]);

      const validator = new HooksValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });
  });

  describe('Complex hooks configuration', () => {
    it('should validate multiple hooks', async () => {
      const filePath = await createHooksFile([
        {
          event: 'PreToolUse',
          type: 'command',
          command: 'npm run lint',
          matcher: {
            tool: 'Write',
            pattern: '.*\\.ts$',
          },
        },
        {
          event: 'PostToolUse',
          type: 'prompt',
          prompt: 'Success!',
        },
        {
          event: 'Stop',
          type: 'command',
          command: 'echo "Done"',
        },
      ]);

      const validator = new HooksValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });
  });

  describe('No hooks found', () => {
    it('should warn when no hooks files exist', async () => {
      const originalCwd = process.cwd();
      process.chdir(getTestDir());

      try {
        const validator = new HooksValidator();
        const result = await validator.validate();

        expect(result.errors).toHaveLength(0);
        expect(result.warnings.some((w) => w.message.includes('No hooks.json files found'))).toBe(
          true
        );
        expect(result.valid).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});
