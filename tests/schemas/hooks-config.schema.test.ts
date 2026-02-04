/**
 * Tests for hooks configuration schema
 */

import { HooksConfigSchema, HookSchema } from '../../src/validators/schemas';

describe('HooksConfigSchema', () => {
  describe('valid configurations', () => {
    it('should accept valid hooks config with single hook', () => {
      const result = HooksConfigSchema.safeParse({
        hooks: [
          {
            event: 'PreToolUse',
            type: 'command',
            command: 'echo test',
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('should accept hooks config with multiple hooks', () => {
      const result = HooksConfigSchema.safeParse({
        hooks: [
          {
            event: 'PreToolUse',
            type: 'command',
            command: 'echo before',
          },
          {
            event: 'PostToolUse',
            type: 'command',
            command: 'echo after',
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('should reject config without hooks array', () => {
      const result = HooksConfigSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject empty hooks array', () => {
      const result = HooksConfigSchema.safeParse({
        hooks: [],
      });
      expect(result.success).toBe(true); // Empty array is valid
    });
  });
});

describe('HookSchema', () => {
  describe('required fields', () => {
    it('should require event field', () => {
      const result = HookSchema.safeParse({
        type: 'command',
        command: 'echo test',
      });
      expect(result.success).toBe(false);
    });

    it('should require type field', () => {
      const result = HookSchema.safeParse({
        event: 'PreToolUse',
        command: 'echo test',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid event as string', () => {
      const result = HookSchema.safeParse({
        event: 'PreToolUse',
        type: 'command',
        command: 'echo test',
      });
      expect(result.success).toBe(true);
    });

    it('should accept any event name string', () => {
      const result = HookSchema.safeParse({
        event: 'CustomEvent',
        type: 'command',
        command: 'echo test',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('hook types', () => {
    it('should accept command type with command field', () => {
      const result = HookSchema.safeParse({
        event: 'PreToolUse',
        type: 'command',
        command: 'echo test',
      });
      expect(result.success).toBe(true);
    });

    it('should accept prompt type with prompt field', () => {
      const result = HookSchema.safeParse({
        event: 'PreToolUse',
        type: 'prompt',
        prompt: 'Analyze this: $ARGUMENTS',
      });
      expect(result.success).toBe(true);
    });

    it('should accept agent type with agent field', () => {
      const result = HookSchema.safeParse({
        event: 'PreToolUse',
        type: 'agent',
        agent: 'security-verifier',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid type', () => {
      const result = HookSchema.safeParse({
        event: 'PreToolUse',
        type: 'invalid',
        command: 'echo test',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('matcher field', () => {
    it('should accept matcher with tool', () => {
      const result = HookSchema.safeParse({
        event: 'PreToolUse',
        type: 'command',
        command: 'echo test',
        matcher: {
          tool: 'Write',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept matcher with pattern', () => {
      const result = HookSchema.safeParse({
        event: 'PreToolUse',
        type: 'command',
        command: 'echo test',
        matcher: {
          pattern: '.*\\.ts$',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept matcher with both tool and pattern', () => {
      const result = HookSchema.safeParse({
        event: 'PreToolUse',
        type: 'command',
        command: 'echo test',
        matcher: {
          tool: 'Write',
          pattern: '.*\\.ts$',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept hook without matcher', () => {
      const result = HookSchema.safeParse({
        event: 'PreToolUse',
        type: 'command',
        command: 'echo test',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('optional fields', () => {
    it('should accept exitCodeHandling', () => {
      const result = HookSchema.safeParse({
        event: 'PreToolUse',
        type: 'command',
        command: 'echo test',
        exitCodeHandling: {
          0: 'continue',
          1: 'warn',
          2: 'error',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept timeout', () => {
      const result = HookSchema.safeParse({
        event: 'PreToolUse',
        type: 'command',
        command: 'echo test',
        timeout: 5000,
      });
      expect(result.success).toBe(true);
    });

    it('should reject negative timeout', () => {
      const result = HookSchema.safeParse({
        event: 'PreToolUse',
        type: 'command',
        command: 'echo test',
        timeout: -1,
      });
      expect(result.success).toBe(false);
    });

    it('should reject timeout over max', () => {
      const result = HookSchema.safeParse({
        event: 'PreToolUse',
        type: 'command',
        command: 'echo test',
        timeout: 700000,
      });
      expect(result.success).toBe(false);
    });

    it('should accept async flag', () => {
      const result = HookSchema.safeParse({
        event: 'PreToolUse',
        type: 'command',
        command: 'echo test',
        async: true,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('complete hooks', () => {
    it('should accept hook with all fields', () => {
      const result = HookSchema.safeParse({
        event: 'PostToolUse',
        type: 'command',
        command: 'prettier --write $FILE',
        matcher: {
          tool: 'Write',
          pattern: '.*\\.ts$',
        },
        exitCodeHandling: {
          0: 'continue',
          1: 'warn',
        },
        timeout: 30000,
        async: false,
      });
      expect(result.success).toBe(true);
    });
  });
});
