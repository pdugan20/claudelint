/**
 * Tests for the check-dependency SessionStart hook script.
 *
 * Tests the pure logic functions (compareSemver, checkVersions) without
 * any I/O. The script is self-contained JS with no external dependencies.
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const {
  compareSemver,
  checkVersions,
} = require('../../.claude-plugin/scripts/check-dependency');
/* eslint-enable @typescript-eslint/no-require-imports */

describe('check-dependency', () => {
  describe('compareSemver', () => {
    it('should return 0 for equal versions', () => {
      expect(compareSemver('1.0.0', '1.0.0')).toBe(0);
      expect(compareSemver('0.2.2', '0.2.2')).toBe(0);
    });

    it('should return 1 when a > b (major)', () => {
      expect(compareSemver('2.0.0', '1.0.0')).toBe(1);
    });

    it('should return -1 when a < b (major)', () => {
      expect(compareSemver('1.0.0', '2.0.0')).toBe(-1);
    });

    it('should return 1 when a > b (minor)', () => {
      expect(compareSemver('0.3.0', '0.2.0')).toBe(1);
    });

    it('should return -1 when a < b (minor)', () => {
      expect(compareSemver('0.2.0', '0.3.0')).toBe(-1);
    });

    it('should return 1 when a > b (patch)', () => {
      expect(compareSemver('0.2.2', '0.2.1')).toBe(1);
    });

    it('should return -1 when a < b (patch)', () => {
      expect(compareSemver('0.2.1', '0.2.2')).toBe(-1);
    });

    it('should treat release > pre-release for same core version', () => {
      expect(compareSemver('1.0.0', '1.0.0-beta.1')).toBe(1);
      expect(compareSemver('0.2.0', '0.2.0-alpha.1')).toBe(1);
    });

    it('should treat pre-release < release for same core version', () => {
      expect(compareSemver('1.0.0-beta.1', '1.0.0')).toBe(-1);
      expect(compareSemver('0.2.0-rc.1', '0.2.0')).toBe(-1);
    });

    it('should compare pre-release tags lexicographically', () => {
      expect(compareSemver('1.0.0-beta.1', '1.0.0-alpha.1')).toBe(1);
      expect(compareSemver('1.0.0-alpha.1', '1.0.0-beta.1')).toBe(-1);
    });

    it('should compare pre-release numeric segments numerically', () => {
      expect(compareSemver('1.0.0-beta.3', '1.0.0-beta.1')).toBe(1);
      expect(compareSemver('1.0.0-beta.1', '1.0.0-beta.3')).toBe(-1);
      expect(compareSemver('1.0.0-beta.10', '1.0.0-beta.2')).toBe(1);
    });

    it('should handle pre-release with different segment counts', () => {
      expect(compareSemver('1.0.0-beta', '1.0.0-beta.1')).toBe(-1);
      expect(compareSemver('1.0.0-beta.1', '1.0.0-beta')).toBe(1);
    });

    it('should handle equal pre-release versions', () => {
      expect(compareSemver('1.0.0-beta.3', '1.0.0-beta.3')).toBe(0);
    });
  });

  describe('checkVersions', () => {
    it('should suggest CLI upgrade when latest > installed', () => {
      const result = checkVersions({
        latestNpm: '0.3.0',
        installedCli: '0.2.2',
        isGlobal: true,
        pluginVersion: '0.2.2',
      });
      // Both CLI and plugin are outdated relative to latest
      expect(result.messages).toHaveLength(2);
      expect(result.messages[0]).toContain('npm install -g claude-code-lint@0.3.0');
      expect(result.messages[1]).toContain('plugin');
    });

    it('should suggest only CLI upgrade when plugin matches latest', () => {
      const result = checkVersions({
        latestNpm: '0.3.0',
        installedCli: '0.2.2',
        isGlobal: true,
        pluginVersion: '0.3.0',
      });
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]).toContain('npm install -g claude-code-lint@0.3.0');
    });

    it('should suggest plugin update when latest > plugin but CLI is current', () => {
      const result = checkVersions({
        latestNpm: '0.3.0',
        installedCli: '0.3.0',
        isGlobal: true,
        pluginVersion: '0.2.2',
      });
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]).toContain('plugin is outdated');
      expect(result.messages[0]).toContain('/plugin marketplace update');
      expect(result.messages[0]).toContain('Update now');
    });

    it('should suggest both when both are outdated', () => {
      const result = checkVersions({
        latestNpm: '0.3.0',
        installedCli: '0.2.2',
        isGlobal: true,
        pluginVersion: '0.2.0',
      });
      expect(result.messages).toHaveLength(2);
      expect(result.messages[0]).toContain('npm install -g claude-code-lint@0.3.0');
      expect(result.messages[1]).toContain('plugin');
    });

    it('should be silent when all in sync', () => {
      const result = checkVersions({
        latestNpm: '0.2.2',
        installedCli: '0.2.2',
        isGlobal: true,
        pluginVersion: '0.2.2',
      });
      expect(result.messages).toHaveLength(0);
    });

    it('should be silent when npm times out and versions match', () => {
      const result = checkVersions({
        latestNpm: null,
        installedCli: '0.2.2',
        isGlobal: true,
        pluginVersion: '0.2.2',
      });
      expect(result.messages).toHaveLength(0);
    });

    it('should suggest install when CLI not installed (npm available)', () => {
      const result = checkVersions({
        latestNpm: '0.2.2',
        installedCli: null,
        isGlobal: true,
        pluginVersion: '0.2.2',
      });
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]).toContain('not installed');
    });

    it('should suggest install when CLI not installed (npm unavailable)', () => {
      const result = checkVersions({
        latestNpm: null,
        installedCli: null,
        isGlobal: true,
        pluginVersion: '0.2.2',
      });
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]).toContain('not installed');
    });

    it('should suggest CLI upgrade in fallback when plugin > CLI', () => {
      const result = checkVersions({
        latestNpm: null,
        installedCli: '0.2.0',
        isGlobal: true,
        pluginVersion: '0.2.2',
      });
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]).toContain('npm install -g claude-code-lint@0.2.2');
    });

    it('should be silent in fallback when CLI >= plugin (never downgrade)', () => {
      const result = checkVersions({
        latestNpm: null,
        installedCli: '0.3.0',
        isGlobal: true,
        pluginVersion: '0.2.2',
      });
      expect(result.messages).toHaveLength(0);
    });

    it('should handle pre-release CLI vs release latest', () => {
      const result = checkVersions({
        latestNpm: '0.2.0',
        installedCli: '0.2.0-beta.3',
        isGlobal: true,
        pluginVersion: '0.2.0-beta.3',
      });
      expect(result.messages.length).toBeGreaterThanOrEqual(1);
      expect(result.messages[0]).toContain('0.2.0');
    });

    it('should use local install command when CLI is local', () => {
      const result = checkVersions({
        latestNpm: '0.3.0',
        installedCli: '0.2.2',
        isGlobal: false,
        pluginVersion: '0.2.2',
      });
      // Both CLI and plugin are outdated relative to latest
      expect(result.messages).toHaveLength(2);
      expect(result.messages[0]).toContain('npm install --save-dev claude-code-lint@0.3.0');
    });

    it('should use local install command in fallback when CLI is local', () => {
      const result = checkVersions({
        latestNpm: null,
        installedCli: '0.2.0',
        isGlobal: false,
        pluginVersion: '0.2.2',
      });
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]).toContain(
        'npm install --save-dev claude-code-lint@0.2.2'
      );
    });
  });
});
