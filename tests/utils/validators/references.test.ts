import { validateToolName, validateToolNames } from '../../../src/utils/validators/references';

describe('reference validators', () => {
  describe('validateToolName', () => {
    it('should return null for valid tool names', () => {
      expect(validateToolName('Bash')).toBeNull();
      expect(validateToolName('Read')).toBeNull();
      expect(validateToolName('Write')).toBeNull();
      expect(validateToolName('Edit')).toBeNull();
      expect(validateToolName('Glob')).toBeNull();
      expect(validateToolName('Grep')).toBeNull();
    });

    it('should return error for invalid tool name', () => {
      const result = validateToolName('InvalidTool');

      expect(result).not.toBeNull();
      expect(result!.severity).toBe('error');
      expect(result!.message).toContain('Unknown tool');
      expect(result!.message).toContain('InvalidTool');
    });

    it('should include valid tools in error message', () => {
      const result = validateToolName('BadTool');

      expect(result!.message).toContain('Valid tools:');
    });
  });

  describe('validateToolNames', () => {
    it('should return empty array for all valid tools', () => {
      const issues = validateToolNames(['Bash', 'Read', 'Write']);
      expect(issues).toEqual([]);
    });

    it('should return issues for invalid tools', () => {
      const issues = validateToolNames(['Bash', 'FakeTool', 'Read', 'AnotherFake']);
      expect(issues).toHaveLength(2);
      expect(issues[0].message).toContain('FakeTool');
      expect(issues[1].message).toContain('AnotherFake');
    });

    it('should return empty array for empty input', () => {
      expect(validateToolNames([])).toEqual([]);
    });
  });
});
