/**
 * Tests for Reporter options builder
 */

import { buildReporterOptions } from '../../src/cli/utils/reporter-options';

describe('buildReporterOptions', () => {
  describe('CLI-only values', () => {
    it('passes CLI values through when no config', () => {
      const result = buildReporterOptions({
        verbose: true,
        quiet: true,
        warningsAsErrors: true,
        explain: true,
        format: 'json',
        color: false,
        showDocsUrl: true,
      });

      expect(result.verbose).toBe(true);
      expect(result.quiet).toBe(true);
      expect(result.warningsAsErrors).toBe(true);
      expect(result.explain).toBe(true);
      expect(result.format).toBe('json');
      expect(result.color).toBe(false);
      expect(result.showDocsUrl).toBe(true);
    });

    it('returns defaults for unset CLI values', () => {
      const result = buildReporterOptions({});

      expect(result.verbose).toBeUndefined();
      expect(result.quiet).toBeUndefined();
      expect(result.format).toBeUndefined();
      expect(result.color).toBeUndefined();
      // deprecatedWarnings defaults to true (--no-deprecated-warnings sets to false)
      expect(result.deprecatedWarnings).toBe(true);
      // collapseRepetitive defaults to true when not explicitly disabled
      expect(result.collapseRepetitive).toBe(true);
    });
  });

  describe('config fallback values', () => {
    it('uses config values when CLI values are undefined', () => {
      const result = buildReporterOptions(
        {},
        {
          output: {
            verbose: true,
            format: 'compact',
            color: true,
          },
        }
      );

      expect(result.verbose).toBe(true);
      expect(result.format).toBe('compact');
      expect(result.color).toBe(true);
    });

    it('handles missing config gracefully', () => {
      const result = buildReporterOptions({}, undefined);

      expect(result.verbose).toBeUndefined();
      expect(result.format).toBeUndefined();
    });

    it('handles empty config output gracefully', () => {
      const result = buildReporterOptions({}, {});

      expect(result.verbose).toBeUndefined();
      expect(result.format).toBeUndefined();
    });
  });

  describe('CLI override of config', () => {
    it('CLI verbose overrides config verbose', () => {
      const result = buildReporterOptions(
        { verbose: false },
        { output: { verbose: true } }
      );

      expect(result.verbose).toBe(false);
    });

    it('CLI format overrides config format', () => {
      const result = buildReporterOptions(
        { format: 'json' },
        { output: { format: 'compact' } }
      );

      expect(result.format).toBe('json');
    });

    it('CLI color overrides config color', () => {
      const result = buildReporterOptions(
        { color: false },
        { output: { color: true } }
      );

      expect(result.color).toBe(false);
    });
  });

  describe('--no-X negation flags', () => {
    it('--no-deprecated-warnings sets deprecatedWarnings to false', () => {
      // Commander sets deprecatedWarnings to false when --no-deprecated-warnings is used
      const result = buildReporterOptions({ deprecatedWarnings: false });

      expect(result.deprecatedWarnings).toBe(false);
    });

    it('deprecatedWarnings defaults to true when not explicitly false', () => {
      const result = buildReporterOptions({});

      expect(result.deprecatedWarnings).toBe(true);
    });

    it('--no-collapse sets collapseRepetitive to false', () => {
      // Commander sets collapse to false when --no-collapse is used
      const result = buildReporterOptions({ collapse: false });

      expect(result.collapseRepetitive).toBe(false);
    });

    it('collapseRepetitive respects both CLI and config', () => {
      // CLI collapse not set, but config disables it
      const result = buildReporterOptions(
        {},
        { output: { collapseRepetitive: false } }
      );

      expect(result.collapseRepetitive).toBe(false);
    });

    it('CLI --no-collapse wins over config collapseRepetitive: true', () => {
      const result = buildReporterOptions(
        { collapse: false },
        { output: { collapseRepetitive: true } }
      );

      expect(result.collapseRepetitive).toBe(false);
    });
  });

  describe('errorOnDeprecated', () => {
    it('passes through errorOnDeprecated from CLI', () => {
      const result = buildReporterOptions({ errorOnDeprecated: true });

      expect(result.errorOnDeprecated).toBe(true);
    });

    it('defaults to undefined when not set', () => {
      const result = buildReporterOptions({});

      expect(result.errorOnDeprecated).toBeUndefined();
    });
  });
});
