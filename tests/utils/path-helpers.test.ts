/**
 * Tests for path-helpers utilities
 */

import {
  getOutputStyleName,
  getParentDirectoryName,
  isFlatOutputStyle,
} from '../../src/utils/filesystem/paths';

describe('path-helpers', () => {
  describe('getParentDirectoryName', () => {
    it('should extract parent directory from skill path', () => {
      const path = '/path/to/.claude/skills/my-skill/SKILL.md';
      expect(getParentDirectoryName(path)).toBe('my-skill');
    });

    it('should extract parent directory from agent path', () => {
      const path = '/path/to/.claude/agents/code-reviewer/AGENT.md';
      expect(getParentDirectoryName(path)).toBe('code-reviewer');
    });

    it('should extract parent directory from output-style path', () => {
      const path = '/path/to/.claude/output-styles/my-style/my-style.md';
      expect(getParentDirectoryName(path)).toBe('my-style');
    });

    it('should handle paths with hyphens', () => {
      const path = '/path/to/.claude/skills/test-runner-v2/SKILL.md';
      expect(getParentDirectoryName(path)).toBe('test-runner-v2');
    });

    it('should handle paths with underscores', () => {
      const path = '/path/to/.claude/output-styles/code_formatter/code_formatter.md';
      expect(getParentDirectoryName(path)).toBe('code_formatter');
    });

    it('should handle relative paths', () => {
      const path = '.claude/skills/my-skill/SKILL.md';
      expect(getParentDirectoryName(path)).toBe('my-skill');
    });
  });

  describe('getOutputStyleName', () => {
    it('should take the name from the filename for a flat style', () => {
      expect(getOutputStyleName('/path/to/.claude/output-styles/concise.md')).toBe('concise');
    });

    it('should take the name from the filename for a plugin style', () => {
      expect(getOutputStyleName('output-styles/signal-only.md')).toBe('signal-only');
    });

    it('should take the name from the directory for a directory-per-style layout', () => {
      expect(getOutputStyleName('/path/to/.claude/output-styles/concise/style.md')).toBe('concise');
    });

    it('should handle relative paths', () => {
      expect(getOutputStyleName('.claude/output-styles/concise.md')).toBe('concise');
    });
  });

  describe('isFlatOutputStyle', () => {
    it('should be true for a file directly in output-styles', () => {
      expect(isFlatOutputStyle('/path/to/.claude/output-styles/concise.md')).toBe(true);
    });

    it('should be false for a file one level deeper', () => {
      expect(isFlatOutputStyle('/path/to/.claude/output-styles/concise/style.md')).toBe(false);
    });
  });
});
