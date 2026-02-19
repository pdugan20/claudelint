/**
 * Shared regex patterns and helper functions
 *
 * Centralized constants to prevent duplication across rule files.
 * All patterns are pure and stateless — safe to import from anywhere.
 *
 * Anti-pattern: Do not duplicate these patterns inline in rule files.
 * The rule-patterns check script enforces this.
 */

/**
 * Match environment variable placeholders: ${VAR_NAME} or $VAR_NAME
 *
 * Use `containsEnvVar()` for boolean checks. Use the regex directly
 * only when you need match positions or capture groups.
 */
export const ENV_VAR_PLACEHOLDER_RE = /\$\{[A-Z_]+\}|\$[A-Z_]+\b/;

/**
 * Full semantic versioning regex (major.minor.patch with optional pre-release and build metadata)
 *
 * Use `isValidSemver()` for boolean checks.
 */
export const SEMVER_RE =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

/**
 * Markdown heading at any level (1-6)
 *
 * Capture groups: [1] = hashes, [2] = heading text
 */
export const HEADING_RE = /^(#{1,6})\s+(.+)$/;

/**
 * Escape a string for safe use inside a RegExp constructor.
 *
 * @example
 * const pattern = new RegExp(`^\\s*${escapeRegExp(fieldName)}\\s*:`);
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if a string contains environment variable placeholders.
 *
 * Matches both `${VAR_NAME}` and `$VAR_NAME` forms.
 * Use this instead of inlining the env var regex in rule files.
 */
export function containsEnvVar(value: string): boolean {
  return ENV_VAR_PLACEHOLDER_RE.test(value);
}

/**
 * Validate semantic versioning format.
 *
 * @returns true if the string is valid semver (e.g., "1.0.0", "2.1.3-beta.1+build.42")
 */
export function isValidSemver(version: string): boolean {
  return SEMVER_RE.test(version);
}

/**
 * Check if a matched @-reference is a real import path vs a decorator/tag.
 *
 * Real imports: `@./path/file.md`, `@path/to/file`, `@file.md`
 * Not imports: `@Injected`, `@param`, `@Component`
 *
 * The distinguisher: real imports contain a path separator (`/`) or
 * end with a file extension (`.` followed by 1-5 word characters).
 */
export function isImportPath(path: string): boolean {
  if (path.includes('/')) return true;
  if (/\.\w{1,5}$/.test(path)) return true;
  return false;
}
