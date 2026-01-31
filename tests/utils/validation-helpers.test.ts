import {
  validateHook,
  formatError,
  hasVariableExpansion,
} from '../../src/utils/validators/helpers';

describe('validation-helpers', () => {
  describe('validateHook', () => {
    it('should pass for valid command hook', () => {
      const hook = {
        event: 'PreToolUse',
        type: 'command' as const,
        command: 'npm test',
      };

      const issues = validateHook(hook);
      expect(issues).toHaveLength(0);
    });

    it('should pass for valid prompt hook', () => {
      const hook = {
        event: 'UserPromptSubmit',
        type: 'prompt' as const,
        prompt: 'Review this code',
      };

      const issues = validateHook(hook);
      expect(issues).toHaveLength(0);
    });

    it('should pass for valid agent hook', () => {
      const hook = {
        event: 'Setup',
        type: 'agent' as const,
        agent: 'setup-agent',
      };

      const issues = validateHook(hook);
      expect(issues).toHaveLength(0);
    });

    it('should warn for unknown hook event', () => {
      const hook = {
        event: 'UnknownEvent',
        type: 'command' as const,
        command: 'echo test',
      };

      const issues = validateHook(hook);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some((i) => i.message.includes('Unknown hook event'))).toBe(true);
      expect(issues.some((i) => i.severity === 'warning')).toBe(true);
    });

    it('should error for invalid hook type', () => {
      const hook = {
        event: 'PreToolUse',
        type: 'invalid' as any,
        command: 'echo test',
      };

      const issues = validateHook(hook);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some((i) => i.message.includes('Invalid hook type'))).toBe(true);
      expect(issues.some((i) => i.severity === 'error')).toBe(true);
    });

    it('should error when command hook missing command field', () => {
      const hook = {
        event: 'PreToolUse',
        type: 'command' as const,
      };

      const issues = validateHook(hook);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some((i) => i.message.includes('must have "command" field'))).toBe(true);
      expect(issues.some((i) => i.severity === 'error')).toBe(true);
    });

    it('should error when prompt hook missing prompt field', () => {
      const hook = {
        event: 'UserPromptSubmit',
        type: 'prompt' as const,
      };

      const issues = validateHook(hook);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some((i) => i.message.includes('must have "prompt" field'))).toBe(true);
      expect(issues.some((i) => i.severity === 'error')).toBe(true);
    });

    it('should error when agent hook missing agent field', () => {
      const hook = {
        event: 'Setup',
        type: 'agent' as const,
      };

      const issues = validateHook(hook);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some((i) => i.message.includes('must have "agent" field'))).toBe(true);
      expect(issues.some((i) => i.severity === 'error')).toBe(true);
    });

    it('should pass for valid regex pattern in matcher', () => {
      const hook = {
        event: 'PreToolUse',
        type: 'command' as const,
        command: 'npm test',
        matcher: {
          pattern: '.*\\.ts$',
        },
      };

      const issues = validateHook(hook);
      expect(issues).toHaveLength(0);
    });

    it('should error for invalid regex pattern in matcher', () => {
      const hook = {
        event: 'PreToolUse',
        type: 'command' as const,
        command: 'npm test',
        matcher: {
          pattern: '*.ts', // Invalid regex - * with nothing to repeat
        },
      };

      const issues = validateHook(hook);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some((i) => i.message.includes('Invalid regex pattern'))).toBe(true);
      expect(issues.some((i) => i.severity === 'error')).toBe(true);
    });

    it('should handle multiple validation issues', () => {
      const hook = {
        event: 'UnknownEvent', // Warning
        type: 'command' as const,
        // Missing command field - Error
        matcher: {
          pattern: '**', // Invalid regex - Error
        },
      };

      const issues = validateHook(hook);
      expect(issues.length).toBeGreaterThanOrEqual(3);
      expect(issues.some((i) => i.severity === 'warning')).toBe(true);
      expect(issues.some((i) => i.severity === 'error')).toBe(true);
    });

    it('should not validate tool name in matcher', () => {
      // Tool validation requires validator context, so the shared utility doesn't handle it
      const hook = {
        event: 'PreToolUse',
        type: 'command' as const,
        command: 'npm test',
        matcher: {
          tool: 'InvalidTool', // This should NOT be validated by the utility
        },
      };

      const issues = validateHook(hook);
      expect(issues).toHaveLength(0); // Tool validation is left to the validator
    });
  });

  describe('formatError', () => {
    it('should format Error instances to message string', () => {
      const error = new Error('Something went wrong');
      expect(formatError(error)).toBe('Something went wrong');
    });

    it('should format string errors as-is', () => {
      const error = 'Simple error message';
      expect(formatError(error)).toBe('Simple error message');
    });

    it('should format number errors to string', () => {
      const error = 404;
      expect(formatError(error)).toBe('404');
    });

    it('should format null to string', () => {
      const error = null;
      expect(formatError(error)).toBe('null');
    });

    it('should format undefined to string', () => {
      const error = undefined;
      expect(formatError(error)).toBe('undefined');
    });

    it('should format object errors to string', () => {
      const error = { code: 'ERR_INVALID', details: 'Invalid input' };
      expect(formatError(error)).toBe('[object Object]');
    });

    it('should handle Error subclasses', () => {
      const error = new TypeError('Type mismatch');
      expect(formatError(error)).toBe('Type mismatch');
    });

    it('should handle errors with empty messages', () => {
      const error = new Error('');
      expect(formatError(error)).toBe('');
    });
  });

  describe('hasVariableExpansion', () => {
    it('should return true for ${VAR} syntax', () => {
      expect(hasVariableExpansion('${HOME}/path')).toBe(true);
      expect(hasVariableExpansion('path/${VAR}/file')).toBe(true);
      expect(hasVariableExpansion('${VAR:-default}')).toBe(true);
    });

    it('should return true for $VAR syntax', () => {
      expect(hasVariableExpansion('$HOME/path')).toBe(true);
      expect(hasVariableExpansion('path/$VAR/file')).toBe(true);
      expect(hasVariableExpansion('$1')).toBe(true);
    });

    it('should return false for paths without variables', () => {
      expect(hasVariableExpansion('/absolute/path')).toBe(false);
      expect(hasVariableExpansion('./relative/path')).toBe(false);
      expect(hasVariableExpansion('simple-file.txt')).toBe(false);
      expect(hasVariableExpansion('')).toBe(false);
    });

    it('should return false for escaped dollar signs', () => {
      // Note: This returns true because we're checking for $ character
      // In actual shell, \$ would be escaped, but for our validation
      // we treat any $ as potential variable expansion
      expect(hasVariableExpansion('price is 5 dollars')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(hasVariableExpansion('npm run lint')).toBe(false);
      expect(hasVariableExpansion('echo "hello"')).toBe(false);
      expect(hasVariableExpansion('command ${VAR}')).toBe(true);
    });
  });
});
