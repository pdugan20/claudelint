/**
 * Tests for settings schema
 */

import {
  SettingsSchema,
  PermissionsSchema,
  AttributionSchema,
  SandboxSchema,
  SettingsHooksSchema,
} from '../../src/validators/schemas';

describe('SettingsSchema', () => {
  describe('valid configurations', () => {
    it('should accept empty settings object', () => {
      const result = SettingsSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should accept settings with all fields', () => {
      const result = SettingsSchema.safeParse({
        permissions: {
          allow: ['Read'],
          deny: ['Bash(rm *)'],
          ask: ['Write'],
        },
        env: {
          NODE_ENV: 'development',
        },
        model: 'sonnet',
        apiKeyHelper: 'get-api-key.sh',
        hooks: {},
        attribution: {
          enabled: true,
          name: 'John Doe',
        },
        statusLine: 'default',
        outputStyle: 'concise',
        sandbox: {
          enabled: true,
        },
        enabledPlugins: {
          'my-plugin': true,
        },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('model field', () => {
    it('should accept any string for model', () => {
      const result = SettingsSchema.safeParse({
        model: 'sonnet',
      });
      expect(result.success).toBe(true);
    });

    it('should accept model aliases', () => {
      const result = SettingsSchema.safeParse({
        model: 'claude-sonnet-4-5-20250929',
      });
      expect(result.success).toBe(true);
    });

    it('should accept custom model names', () => {
      const result = SettingsSchema.safeParse({
        model: 'my-custom-model',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('env field', () => {
    it('should accept env variables object', () => {
      const result = SettingsSchema.safeParse({
        env: {
          API_KEY: 'secret',
          DEBUG: 'true',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty env object', () => {
      const result = SettingsSchema.safeParse({
        env: {},
      });
      expect(result.success).toBe(true);
    });
  });

  describe('enabledPlugins field', () => {
    it('should accept plugin enable/disable map', () => {
      const result = SettingsSchema.safeParse({
        enabledPlugins: {
          'plugin-a': true,
          'plugin-b': false,
          'plugin-c': true,
        },
      });
      expect(result.success).toBe(true);
    });
  });
});

describe('PermissionsSchema', () => {
  describe('permission arrays', () => {
    it('should accept allow array', () => {
      const result = PermissionsSchema.safeParse({
        allow: ['Read', 'Bash(ls)'],
      });
      expect(result.success).toBe(true);
    });

    it('should accept deny array', () => {
      const result = PermissionsSchema.safeParse({
        deny: ['Bash(rm -rf /)', 'Write(.env)'],
      });
      expect(result.success).toBe(true);
    });

    it('should accept ask array', () => {
      const result = PermissionsSchema.safeParse({
        ask: ['Write', 'Edit'],
      });
      expect(result.success).toBe(true);
    });

    it('should accept all three arrays', () => {
      const result = PermissionsSchema.safeParse({
        allow: ['Read'],
        deny: ['Bash(rm *)'],
        ask: ['Write'],
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty arrays', () => {
      const result = PermissionsSchema.safeParse({
        allow: [],
        deny: [],
        ask: [],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('defaultMode field', () => {
    it('should accept acceptEdits mode', () => {
      const result = PermissionsSchema.safeParse({
        defaultMode: 'acceptEdits',
      });
      expect(result.success).toBe(true);
    });

    it('should accept bypassPermissions mode', () => {
      const result = PermissionsSchema.safeParse({
        defaultMode: 'bypassPermissions',
      });
      expect(result.success).toBe(true);
    });

    it('should accept default mode', () => {
      const result = PermissionsSchema.safeParse({
        defaultMode: 'default',
      });
      expect(result.success).toBe(true);
    });

    it('should accept plan mode', () => {
      const result = PermissionsSchema.safeParse({
        defaultMode: 'plan',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid mode', () => {
      const result = PermissionsSchema.safeParse({
        defaultMode: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('disableBypassPermissionsMode field', () => {
    it('should accept disable value', () => {
      const result = PermissionsSchema.safeParse({
        disableBypassPermissionsMode: 'disable',
      });
      expect(result.success).toBe(true);
    });

    it('should reject other values', () => {
      const result = PermissionsSchema.safeParse({
        disableBypassPermissionsMode: 'enable',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('additionalDirectories field', () => {
    it('should accept array of directory paths', () => {
      const result = PermissionsSchema.safeParse({
        additionalDirectories: ['/path/to/dir1', '/path/to/dir2'],
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty array', () => {
      const result = PermissionsSchema.safeParse({
        additionalDirectories: [],
      });
      expect(result.success).toBe(true);
    });
  });
});

describe('AttributionSchema', () => {
  it('should accept enabled flag', () => {
    const result = AttributionSchema.safeParse({
      enabled: true,
    });
    expect(result.success).toBe(true);
  });

  it('should accept name field', () => {
    const result = AttributionSchema.safeParse({
      enabled: true,
      name: 'John Doe',
    });
    expect(result.success).toBe(true);
  });

  it('should accept email field', () => {
    const result = AttributionSchema.safeParse({
      enabled: true,
      name: 'John Doe',
      email: 'john@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('should accept all fields optional', () => {
    const result = AttributionSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('SandboxSchema', () => {
  it('should accept enabled flag', () => {
    const result = SandboxSchema.safeParse({
      enabled: true,
    });
    expect(result.success).toBe(true);
  });

  it('should accept allowedCommands array', () => {
    const result = SandboxSchema.safeParse({
      enabled: true,
      allowedCommands: ['ls', 'cat', 'echo'],
    });
    expect(result.success).toBe(true);
  });

  it('should accept empty allowedCommands', () => {
    const result = SandboxSchema.safeParse({
      enabled: true,
      allowedCommands: [],
    });
    expect(result.success).toBe(true);
  });

  it('should accept all fields optional', () => {
    const result = SandboxSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('SettingsHooksSchema', () => {
  it('should accept PreToolUse hooks', () => {
    const result = SettingsHooksSchema.safeParse({
      PreToolUse: [
        {
          matcher: 'Write',
          hooks: [
            {
              type: 'command',
              command: 'echo before',
            },
          ],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('should accept PostToolUse hooks', () => {
    const result = SettingsHooksSchema.safeParse({
      PostToolUse: [
        {
          hooks: [
            {
              type: 'command',
              command: 'echo after',
            },
          ],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('should accept all hook event types', () => {
    const result = SettingsHooksSchema.safeParse({
      PreToolUse: [],
      PostToolUse: [],
      PostToolUseFailure: [],
      PermissionRequest: [],
      Notification: [],
      UserPromptSubmit: [],
      Stop: [],
      SubagentStart: [],
      SubagentStop: [],
      PreCompact: [],
      Setup: [],
      SessionStart: [],
      SessionEnd: [],
    });
    expect(result.success).toBe(true);
  });

  it('should accept empty hooks object', () => {
    const result = SettingsHooksSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should accept hooks with matcher pattern', () => {
    const result = SettingsHooksSchema.safeParse({
      PostToolUse: [
        {
          matcher: 'Write|Edit',
          hooks: [
            {
              type: 'command',
              command: 'prettier --write $FILE',
            },
          ],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('should accept hooks without matcher', () => {
    const result = SettingsHooksSchema.safeParse({
      PostToolUse: [
        {
          hooks: [
            {
              type: 'command',
              command: 'echo done',
            },
          ],
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});
