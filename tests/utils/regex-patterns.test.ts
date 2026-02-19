/**
 * Tests for centralized regex patterns and helper functions.
 *
 * Covers src/utils/patterns.ts — the shared constants and functions
 * that rule files import instead of duplicating inline.
 */

import {
  ENV_VAR_PLACEHOLDER_RE,
  SEMVER_RE,
  HEADING_RE,
  escapeRegExp,
  containsEnvVar,
  isValidSemver,
  isImportPath,
} from '../../src/utils/patterns';

describe('Regex patterns', () => {
  describe('ENV_VAR_PLACEHOLDER_RE', () => {
    it('should match ${VAR_NAME} syntax', () => {
      expect(ENV_VAR_PLACEHOLDER_RE.test('${API_KEY}')).toBe(true);
      expect(ENV_VAR_PLACEHOLDER_RE.test('prefix ${HOME} suffix')).toBe(true);
    });

    it('should match $VAR_NAME syntax', () => {
      expect(ENV_VAR_PLACEHOLDER_RE.test('$HOME')).toBe(true);
      expect(ENV_VAR_PLACEHOLDER_RE.test('prefix $PATH suffix')).toBe(true);
    });

    it('should not match plain text', () => {
      expect(ENV_VAR_PLACEHOLDER_RE.test('just plain text')).toBe(false);
      expect(ENV_VAR_PLACEHOLDER_RE.test('')).toBe(false);
    });

    it('should not match lowercase variable names', () => {
      expect(ENV_VAR_PLACEHOLDER_RE.test('$home')).toBe(false);
      expect(ENV_VAR_PLACEHOLDER_RE.test('${api_key}')).toBe(false);
    });
  });

  describe('SEMVER_RE', () => {
    it('should match valid semver strings', () => {
      expect(SEMVER_RE.test('1.0.0')).toBe(true);
      expect(SEMVER_RE.test('0.0.1')).toBe(true);
      expect(SEMVER_RE.test('10.20.30')).toBe(true);
    });

    it('should match pre-release versions', () => {
      expect(SEMVER_RE.test('1.0.0-beta')).toBe(true);
      expect(SEMVER_RE.test('1.0.0-beta.1')).toBe(true);
      expect(SEMVER_RE.test('1.0.0-alpha.1.2')).toBe(true);
    });

    it('should match build metadata versions', () => {
      expect(SEMVER_RE.test('1.0.0+build.123')).toBe(true);
      expect(SEMVER_RE.test('1.0.0-beta+build.456')).toBe(true);
    });

    it('should reject invalid semver strings', () => {
      expect(SEMVER_RE.test('1.0')).toBe(false);
      expect(SEMVER_RE.test('v1.0.0')).toBe(false);
      expect(SEMVER_RE.test('1.0.0.')).toBe(false);
      expect(SEMVER_RE.test('not-a-version')).toBe(false);
      expect(SEMVER_RE.test('')).toBe(false);
    });

    it('should reject leading zeros', () => {
      expect(SEMVER_RE.test('01.0.0')).toBe(false);
      expect(SEMVER_RE.test('1.00.0')).toBe(false);
      expect(SEMVER_RE.test('1.0.00')).toBe(false);
    });
  });

  describe('HEADING_RE', () => {
    it('should match headings at levels 1-6', () => {
      expect(HEADING_RE.test('# H1')).toBe(true);
      expect(HEADING_RE.test('## H2')).toBe(true);
      expect(HEADING_RE.test('###### H6')).toBe(true);
    });

    it('should capture level and text', () => {
      const match = '## My Section'.match(HEADING_RE);
      expect(match).not.toBeNull();
      expect(match![1]).toBe('##');
      expect(match![2]).toBe('My Section');
    });

    it('should not match beyond level 6', () => {
      expect(HEADING_RE.test('####### H7')).toBe(false);
    });

    it('should not match headings without space after hashes', () => {
      expect(HEADING_RE.test('#NoSpace')).toBe(false);
    });

    it('should not match mid-line hashes', () => {
      expect(HEADING_RE.test('text ## heading')).toBe(false);
    });
  });

  describe('escapeRegExp', () => {
    it('should escape all regex metacharacters', () => {
      const metacharacters = '.*+?^${}()|[]\\';
      const escaped = escapeRegExp(metacharacters);
      // Every character should be preceded by a backslash
      const regex = new RegExp(escaped);
      expect(regex.test(metacharacters)).toBe(true);
    });

    it('should pass through regular strings unchanged', () => {
      expect(escapeRegExp('hello world')).toBe('hello world');
      expect(escapeRegExp('foo-bar_baz')).toBe('foo-bar_baz');
    });

    it('should handle empty string', () => {
      expect(escapeRegExp('')).toBe('');
    });

    it('should work in RegExp constructor', () => {
      const fieldName = 'metadata[0]';
      const pattern = new RegExp(`^\\s*${escapeRegExp(fieldName)}\\s*:`);
      expect(pattern.test('metadata[0]: value')).toBe(true);
      expect(pattern.test('metadata0: value')).toBe(false);
    });
  });

  describe('containsEnvVar', () => {
    it('should detect ${VAR} syntax', () => {
      expect(containsEnvVar('url: https://host/${API_KEY}')).toBe(true);
    });

    it('should detect $VAR syntax', () => {
      expect(containsEnvVar('path: $HOME/config')).toBe(true);
    });

    it('should return false for plain text', () => {
      expect(containsEnvVar('just plain text')).toBe(false);
    });
  });

  describe('isValidSemver', () => {
    it('should validate correct semver', () => {
      expect(isValidSemver('1.0.0')).toBe(true);
      expect(isValidSemver('1.0.0-beta.1')).toBe(true);
    });

    it('should reject invalid semver', () => {
      expect(isValidSemver('1.0')).toBe(false);
      expect(isValidSemver('v1.0.0')).toBe(false);
    });
  });

  describe('isImportPath', () => {
    it('should accept paths with slash separator', () => {
      expect(isImportPath('docs/guide')).toBe(true);
      expect(isImportPath('./path/file.md')).toBe(true);
      expect(isImportPath('.claude/rules/file.md')).toBe(true);
    });

    it('should accept paths with file extension', () => {
      expect(isImportPath('file.md')).toBe(true);
      expect(isImportPath('guide.txt')).toBe(true);
      expect(isImportPath('config.yaml')).toBe(true);
    });

    it('should reject decorator-style references', () => {
      expect(isImportPath('Injected')).toBe(false);
      expect(isImportPath('Component')).toBe(false);
      expect(isImportPath('Injectable')).toBe(false);
    });

    it('should reject JSDoc-style tags', () => {
      expect(isImportPath('param')).toBe(false);
      expect(isImportPath('returns')).toBe(false);
      expect(isImportPath('deprecated')).toBe(false);
      expect(isImportPath('ts-ignore')).toBe(false);
    });

    it('should accept extensions up to 5 chars', () => {
      expect(isImportPath('file.ts')).toBe(true);
      expect(isImportPath('file.html')).toBe(true);
      expect(isImportPath('file.xhtml')).toBe(true);
    });
  });
});
