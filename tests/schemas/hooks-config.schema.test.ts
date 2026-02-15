/**
 * Tests for hooks configuration schema
 */

import {
  HooksConfigSchema,
  SettingsHookSchema,
  SettingsHookMatcherSchema,
} from '../../src/validators/schemas';

describe('HooksConfigSchema', () => {
  describe('valid configurations', () => {
    it('should accept valid hooks config with single event', () => {
      const result = HooksConfigSchema.safeParse({
        hooks: {
          PreToolUse: [
            {
              hooks: [{ type: 'command', command: 'echo test' }],
            },
          ],
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept hooks config with multiple events', () => {
      const result = HooksConfigSchema.safeParse({
        hooks: {
          PreToolUse: [
            {
              hooks: [{ type: 'command', command: 'echo before' }],
            },
          ],
          PostToolUse: [
            {
              hooks: [{ type: 'command', command: 'echo after' }],
            },
          ],
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept config with description', () => {
      const result = HooksConfigSchema.safeParse({
        description: 'My hooks config',
        hooks: {
          SessionStart: [
            {
              hooks: [{ type: 'command', command: 'echo start' }],
            },
          ],
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept config with empty hooks object', () => {
      const result = HooksConfigSchema.safeParse({
        hooks: {},
      });
      expect(result.success).toBe(true);
    });

    it('should reject config without hooks object', () => {
      const result = HooksConfigSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should accept hooks with matcher', () => {
      const result = HooksConfigSchema.safeParse({
        hooks: {
          PreToolUse: [
            {
              matcher: 'Bash',
              hooks: [{ type: 'command', command: 'echo test' }],
            },
          ],
        },
      });
      expect(result.success).toBe(true);
    });
  });
});

describe('SettingsHookSchema', () => {
  describe('hook types', () => {
    it('should accept command type', () => {
      const result = SettingsHookSchema.safeParse({
        type: 'command',
        command: 'echo test',
      });
      expect(result.success).toBe(true);
    });

    it('should accept prompt type', () => {
      const result = SettingsHookSchema.safeParse({
        type: 'prompt',
        prompt: 'Review this code',
      });
      expect(result.success).toBe(true);
    });

    it('should accept agent type', () => {
      const result = SettingsHookSchema.safeParse({
        type: 'agent',
        agent: 'security-verifier',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid type', () => {
      const result = SettingsHookSchema.safeParse({
        type: 'invalid',
        command: 'echo test',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('optional fields', () => {
    it('should accept timeout', () => {
      const result = SettingsHookSchema.safeParse({
        type: 'command',
        command: 'echo test',
        timeout: 5000,
      });
      expect(result.success).toBe(true);
    });

    it('should accept statusMessage', () => {
      const result = SettingsHookSchema.safeParse({
        type: 'command',
        command: 'echo test',
        statusMessage: 'Running test...',
      });
      expect(result.success).toBe(true);
    });

    it('should accept once flag', () => {
      const result = SettingsHookSchema.safeParse({
        type: 'command',
        command: 'echo test',
        once: true,
      });
      expect(result.success).toBe(true);
    });

    it('should accept model', () => {
      const result = SettingsHookSchema.safeParse({
        type: 'prompt',
        prompt: 'Review this',
        model: 'sonnet',
      });
      expect(result.success).toBe(true);
    });

    it('should accept async flag on command hook', () => {
      const result = SettingsHookSchema.safeParse({
        type: 'command',
        command: 'echo test',
        async: true,
      });
      expect(result.success).toBe(true);
    });
  });
});

describe('SettingsHookMatcherSchema', () => {
  it('should accept matcher group with hooks', () => {
    const result = SettingsHookMatcherSchema.safeParse({
      hooks: [{ type: 'command', command: 'echo test' }],
    });
    expect(result.success).toBe(true);
  });

  it('should accept matcher group with matcher and hooks', () => {
    const result = SettingsHookMatcherSchema.safeParse({
      matcher: 'Bash',
      hooks: [{ type: 'command', command: 'echo test' }],
    });
    expect(result.success).toBe(true);
  });

  it('should reject matcher group without hooks', () => {
    const result = SettingsHookMatcherSchema.safeParse({
      matcher: 'Bash',
    });
    expect(result.success).toBe(false);
  });
});
