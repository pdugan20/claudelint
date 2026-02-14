/**
 * Reusable Zod refinements for Claude Code validation rules
 * These refinements can be composed with Zod schemas to create validation rules
 */
import { z } from 'zod';

/**
 * Validates no XML tags in string
 * Used by: skill-frontmatter-name-xml-tags, agent-name-xml-tags, etc.
 */
export function noXMLTags() {
  return {
    check: (val: string) => !/<[^>]+>/.test(val),
    message: 'Cannot contain XML tags',
  };
}

/**
 * Validates no reserved words (anthropic, claude)
 * Used by: skill-frontmatter-name-reserved-words
 */
export function noReservedWords(words: string[] = ['anthropic', 'claude']) {
  return {
    check: (val: string) => !words.some((w) => val.toLowerCase().includes(w)),
    message: `Cannot contain reserved words: ${words.join(', ')}`,
  };
}

/**
 * Validates third-person writing (no "I" or "you")
 * Used by: skill-frontmatter-description-first-person
 */
export function thirdPerson() {
  return {
    check: (val: string) => !/\b(I|you)\s/i.test(val),
    message: 'Must be written in third person',
  };
}

/**
 * Validates lowercase with hyphens only
 * Used by: skill-frontmatter-name-case, plugin-name-case
 */
export function lowercaseHyphens() {
  return z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Must contain only lowercase letters, numbers, and hyphens');
}

/**
 * Validates semantic versioning format
 * Used by: plugin-version-invalid
 */
export function semver() {
  return z
    .string()
    .regex(
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
      'Invalid semantic version format'
    );
}

/**
 * Validates absolute path
 * Used by: settings-path-relative, mcp-path-not-absolute
 */
export function absolutePath() {
  return {
    check: (val: string) => val.startsWith('/') || /^[A-Za-z]:\\/.test(val),
    message: 'Must be an absolute path',
  };
}

/**
 * Validates relative path
 * Used by: settings-plans-directory-absolute
 */
export function relativePath() {
  return {
    check: (val: string) => !val.startsWith('/') && !/^[A-Za-z]:\\/.test(val),
    message: 'Must be a relative path',
  };
}

/**
 * Validates no path traversal (..)
 * Used by: skill-path-traversal, hooks-path-traversal-risk
 */
export function noPathTraversal() {
  return {
    check: (val: string) => !val.includes('..'),
    message: 'Path cannot contain ".." (path traversal)',
  };
}

/**
 * Validates URL format
 * Used by: mcp-sse-url-invalid, plugin-homepage-invalid-url
 */
export function validURL() {
  return {
    check: (val: string) => {
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    },
    message: 'Must be a valid URL',
  };
}

/**
 * Validates UUID format
 * Used by: settings-installation-id-invalid
 */
export function validUUID() {
  return z
    .string()
    .regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      'Must be a valid UUID'
    );
}

/**
 * Validates environment variable name format
 * Used by: settings-env-invalid-name, mcp-env-invalid-name
 */
export function envVarName() {
  return z.string().regex(/^[A-Z_][A-Z0-9_]*$/, 'Must be uppercase with underscores');
}

/**
 * Helper to apply a refinement check to a schema
 */
export function applyRefinement<T extends z.ZodString>(
  schema: T,
  refinement: { check: (val: string) => boolean; message: string }
): z.ZodType<string> {
  return schema.refine(refinement.check, { message: refinement.message });
}
