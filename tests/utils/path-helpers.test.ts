/**
 * Tests for path-helpers utilities
 */

import { getParentDirectoryName } from '../../src/utils/filesystem/paths';

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
});
