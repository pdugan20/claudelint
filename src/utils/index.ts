/**
 * Public utility API for custom rule authors.
 *
 * This barrel is the entry point for `claude-code-lint/utils`.
 * Only helpers that custom rules need are exported here.
 * Internal utilities (loader, factory, reporting, validators)
 * are intentionally excluded.
 *
 * Import in custom rules:
 * ```typescript
 * import { hasHeading, extractFrontmatter } from 'claude-code-lint/utils';
 * ```
 */

// Markdown utilities
export {
  extractFrontmatter,
  extractBodyContent,
  stripCodeBlocks,
  extractImports,
  extractImportsWithLineNumbers,
  getFrontmatterFieldLine,
  countLines,
} from './formats/markdown';
export type { FrontmatterResult, Import } from './formats/markdown';

// Custom rule helper functions
export {
  hasHeading,
  extractHeadings,
  matchesPattern,
  countOccurrences,
  findLinesMatching,
  validateSemver,
  parseJSON,
  parseYAML,
} from './rules/helpers';
export type { Heading, LineMatch } from './rules/helpers';

// Shared patterns and constants
export {
  ENV_VAR_PLACEHOLDER_RE,
  SEMVER_RE,
  HEADING_RE,
  escapeRegExp,
  containsEnvVar,
  isValidSemver,
  isImportPath,
} from './patterns';

// File system (async)
export { fileExists, readFileContent } from './filesystem/files';
