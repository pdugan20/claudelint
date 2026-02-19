/**
 * API Surface Snapshot Test
 *
 * Captures the public API surface of claude-code-lint. If an export is added,
 * removed, or renamed in src/index.ts, this test will fail. Run
 * `npx jest --updateSnapshot` to accept intentional API surface changes.
 */

import * as api from '../../src/index';
import * as utils from '../../src/utils/index';

describe('Public API surface', () => {
  it('exports have not changed unexpectedly', () => {
    const exportNames = Object.keys(api).sort();
    expect(exportNames).toMatchSnapshot();
  });

  it('exports the expected value types', () => {
    // Classes
    expect(typeof api.ClaudeLint).toBe('function');
    expect(typeof api.BaseFormatter).toBe('function');

    // Functions
    expect(typeof api.lint).toBe('function');
    expect(typeof api.lintText).toBe('function');
    expect(typeof api.formatResults).toBe('function');
    expect(typeof api.resolveConfig).toBe('function');
    expect(typeof api.getFileInfo).toBe('function');
    expect(typeof api.loadFormatter).toBe('function');
    expect(typeof api.isBuiltinFormatter).toBe('function');
    expect(typeof api.findConfigFile).toBe('function');
    expect(typeof api.loadConfig).toBe('function');

    // Constants
    expect(Array.isArray(api.BUILTIN_FORMATTERS)).toBe(true);
    expect(api.BUILTIN_FORMATTERS).toContain('stylish');
    expect(api.BUILTIN_FORMATTERS).toContain('json');
    expect(api.BUILTIN_FORMATTERS).toContain('compact');
    expect(api.BUILTIN_FORMATTERS).toContain('sarif');
    expect(api.BUILTIN_FORMATTERS).toContain('github');
  });
});

describe('Utils API surface (claude-code-lint/utils)', () => {
  it('exports have not changed unexpectedly', () => {
    const exportNames = Object.keys(utils).sort();
    expect(exportNames).toMatchSnapshot();
  });

  it('exports the documented helper functions', () => {
    // Functions documented in website/development/helper-library.md
    expect(typeof utils.hasHeading).toBe('function');
    expect(typeof utils.extractHeadings).toBe('function');
    expect(typeof utils.matchesPattern).toBe('function');
    expect(typeof utils.countOccurrences).toBe('function');
    expect(typeof utils.findLinesMatching).toBe('function');
    expect(typeof utils.extractFrontmatter).toBe('function');
    expect(typeof utils.validateSemver).toBe('function');
    expect(typeof utils.fileExists).toBe('function');
    expect(typeof utils.readFileContent).toBe('function');
    expect(typeof utils.parseJSON).toBe('function');
    expect(typeof utils.parseYAML).toBe('function');
  });

  it('exports shared pattern constants and helpers', () => {
    expect(utils.ENV_VAR_PLACEHOLDER_RE).toBeInstanceOf(RegExp);
    expect(utils.SEMVER_RE).toBeInstanceOf(RegExp);
    expect(utils.HEADING_RE).toBeInstanceOf(RegExp);
    expect(typeof utils.escapeRegExp).toBe('function');
    expect(typeof utils.containsEnvVar).toBe('function');
    expect(typeof utils.isValidSemver).toBe('function');
    expect(typeof utils.isImportPath).toBe('function');
  });

  it('exports markdown utilities', () => {
    expect(typeof utils.extractBodyContent).toBe('function');
    expect(typeof utils.stripCodeBlocks).toBe('function');
    expect(typeof utils.extractImports).toBe('function');
    expect(typeof utils.extractImportsWithLineNumbers).toBe('function');
    expect(typeof utils.getFrontmatterFieldLine).toBe('function');
    expect(typeof utils.countLines).toBe('function');
  });

  it('does not expose internal utilities', () => {
    const keys = Object.keys(utils);
    // These are internal-only modules that should not be in the public API
    expect(keys).not.toContain('RuleRegistry');
    expect(keys).not.toContain('CustomRuleLoader');
    expect(keys).not.toContain('ConfigResolver');
    expect(keys).not.toContain('Fixer');
    expect(keys).not.toContain('AutoFix');
    expect(keys).not.toContain('createValidator');
    expect(keys).not.toContain('formatResults');
  });
});
