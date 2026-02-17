/**
 * Core types for the new ESLint-style rule system
 *
 * Rules are self-contained modules that export metadata and validation logic.
 * This enables:
 * - Auto-discovery from filesystem
 * - Single source of truth per rule
 * - Easy testing in isolation
 * - Plugin contributions
 */

import { z } from 'zod';
import { RuleId } from '../rules/rule-ids';
import { AutoFix } from '../validators/file-validator';
import { RuleDocumentation } from './rule-metadata';

/**
 * Rule category - used for organizing rules in documentation
 */
export type RuleCategory =
  | 'CLAUDE.md'
  | 'Skills'
  | 'Settings'
  | 'Hooks'
  | 'MCP'
  | 'Plugin'
  | 'Commands'
  | 'Agents'
  | 'OutputStyles'
  | 'LSP';

/**
 * Rule severity levels
 * - 'off': Rule is disabled
 * - 'warn': Rule reports warnings
 * - 'error': Rule reports errors
 */
export type RuleSeverity = 'off' | 'warn' | 'error';

/**
 * Deprecation information for a rule
 *
 * Provides rich metadata about why a rule is deprecated and how to migrate.
 * Modeled after ESLint's enhanced deprecation format.
 */
export interface DeprecationInfo {
  /** Required: Clear explanation of why this rule is deprecated */
  reason: string;

  /** Optional: Rule ID(s) that replace this deprecated rule */
  replacedBy?: RuleId | RuleId[];

  /** Optional: Version when this rule was deprecated (semver) */
  deprecatedSince?: string;

  /** Optional: Version when this rule will be removed (semver), or null if retained indefinitely */
  removeInVersion?: string | null;

  /** Optional: URL to migration guide with detailed instructions */
  url?: string;
}

/**
 * Metadata for a validation rule
 *
 * This replaces the manual RuleRegistry.register() calls.
 * All rule metadata is co-located with the rule implementation.
 */
export interface RuleMetadata {
  /** Unique rule identifier - must match filename */
  id: RuleId;

  /** Human-readable rule name */
  name: string;

  /** Brief description of what this rule validates */
  description: string;

  /** Category for organizing rules in docs and output */
  category: RuleCategory;

  /** Default severity level (can be overridden in config) */
  severity: RuleSeverity;

  /** Whether this rule can auto-fix issues */
  fixable: boolean;

  /**
   * Deprecation status
   * - false/undefined: Not deprecated
   * - true: Deprecated (simple, no details)
   * - DeprecationInfo: Deprecated with rich metadata (reason, replacements, versions, migration guide)
   *
   * Use the object form (DeprecationInfo) for new deprecations to provide clear migration guidance.
   * The boolean form is supported for backward compatibility.
   *
   * @example
   * // Simple deprecation (backward compatible)
   * deprecated: true
   *
   * @example
   * // Rich deprecation (recommended)
   * deprecated: {
   *   reason: 'This rule validates a field that does not exist in the official spec',
   *   replacedBy: 'new-rule-id',
   *   deprecatedSince: '0.3.0',
   *   removeInVersion: '1.0.0',
   *   url: 'https://github.com/pdugan20/claudelint/blob/main/docs/migrations/old-to-new.md'
   * }
   */
  deprecated?: boolean | DeprecationInfo;

  /** Version when this rule was introduced (optional for custom rules) */
  since?: string;

  /** Optional URL to detailed documentation */
  docUrl?: string;

  /**
   * Zod schema for rule options validation
   * Used to validate options from .claudelintrc.json
   */
  schema?: z.ZodType;

  /**
   * Default option values
   * Used when no options are specified in config
   */
  defaultOptions?: Record<string, unknown>;

  /**
   * Documentation metadata for auto-generating rule docs.
   * When present, the generation script produces a VitePress page
   * from this metadata instead of using manually-written docs.
   *
   * @see src/types/rule-metadata.ts for type definitions
   * @see scripts/generate/rule-docs.ts for the generation script
   */
  docs?: RuleDocumentation;
}

/**
 * Issue reported by a rule
 *
 * Keep messages concise and actionable. Detailed explanations belong in rule documentation.
 */
export interface RuleIssue {
  /** Error/warning message to display (keep concise and actionable) */
  message: string;

  /** Optional line number where issue occurs */
  line?: number;

  /** Optional quick fix suggestion */
  fix?: string;

  /** Optional automatic fix that can be applied */
  autoFix?: AutoFix;
}

/**
 * Context passed to rule validation function
 *
 * Provides all information needed to validate a file and report issues.
 * Pre-parsed fields (frontmatter, bodyContent, contentWithoutCode) are
 * lazy-computed on first access to avoid unnecessary work.
 */
export interface RuleContext {
  /** Absolute path to file being validated */
  filePath: string;

  /** Content of file being validated */
  fileContent: string;

  /** Rule-specific options from config (validated against rule.meta.schema) */
  options: Record<string, unknown>;

  /**
   * Report a validation issue
   * Issues are collected and formatted for output
   */
  report: (issue: RuleIssue) => void;

  /**
   * Parsed YAML frontmatter (lazy-computed on first access).
   * Returns undefined if the file has no frontmatter or is not a Markdown file.
   * Use this instead of importing extractFrontmatter() directly.
   */
  readonly frontmatter?: Record<string, unknown>;

  /**
   * Body content after frontmatter (lazy-computed on first access).
   * Returns undefined if the file has no frontmatter.
   * Use this instead of importing extractBodyContent() directly.
   */
  readonly bodyContent?: string;

  /**
   * File content with code blocks stripped (lazy-computed on first access).
   * Preserves line count by replacing code lines with empty lines.
   * Use this instead of importing stripCodeBlocks() directly.
   */
  readonly contentWithoutCode?: string;
}

/**
 * A validation rule
 *
 * Rules export a single object with metadata and validation logic.
 * This is the core interface that enables ESLint-style auto-discovery.
 *
 * Example:
 * ```typescript
 * export const rule: Rule = {
 *   meta: {
 *     id: 'size-error',
 *     name: 'File Size Error',
 *     description: 'CLAUDE.md exceeds maximum file size limit',
 *     category: 'CLAUDE.md',
 *     severity: 'error',
 *     fixable: false,
 *     since: '1.0.0',
 *     schema: z.object({
 *       maxSize: z.number().positive().int().optional()
 *     }),
 *     defaultOptions: {
 *       maxSize: 40000
 *     }
 *   },
 *   validate: async (context) => {
 *     // Validation logic here
 *     if (someCondition) {
 *       context.report({
 *         message: 'Issue found',
 *         line: 10
 *       });
 *     }
 *   }
 * };
 * ```
 */
export interface Rule {
  /** Rule metadata */
  meta: RuleMetadata;

  /**
   * Validation function
   * Receives context with file info and reports issues
   * Can be async for I/O operations
   */
  validate: (context: RuleContext) => Promise<void> | void;
}

/**
 * Helper functions for working with rule deprecation
 */

/**
 * Check if a rule is deprecated
 */
export function isRuleDeprecated(rule: Rule): boolean {
  return (
    rule.meta.deprecated === true ||
    (typeof rule.meta.deprecated === 'object' && rule.meta.deprecated !== null)
  );
}

/**
 * Get deprecation info from a rule
 * Returns DeprecationInfo or null if not deprecated
 */
export function getDeprecationInfo(rule: Rule): DeprecationInfo | null {
  if (!rule.meta.deprecated) {
    return null;
  }

  if (rule.meta.deprecated === true) {
    // Simple boolean deprecation - return minimal info
    return {
      reason: 'This rule has been deprecated',
    };
  }

  return rule.meta.deprecated;
}

/**
 * Get replacement rule IDs for a deprecated rule
 * Returns empty array if no replacements specified
 */
export function getReplacementRuleIds(rule: Rule): RuleId[] {
  const info = getDeprecationInfo(rule);
  if (!info || !info.replacedBy) {
    return [];
  }

  return Array.isArray(info.replacedBy) ? info.replacedBy : [info.replacedBy];
}

/**
 * Type guard to check if a value is a valid Rule
 */
export function isRule(value: unknown): value is Rule {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const rule = value as Record<string, unknown>;

  return (
    rule.meta !== null &&
    rule.meta !== undefined &&
    typeof rule.meta === 'object' &&
    'id' in rule.meta &&
    typeof (rule.meta as Record<string, unknown>).id === 'string' &&
    'name' in rule.meta &&
    typeof (rule.meta as Record<string, unknown>).name === 'string' &&
    'description' in rule.meta &&
    typeof (rule.meta as Record<string, unknown>).description === 'string' &&
    'category' in rule.meta &&
    typeof (rule.meta as Record<string, unknown>).category === 'string' &&
    'severity' in rule.meta &&
    typeof (rule.meta as Record<string, unknown>).severity === 'string' &&
    'fixable' in rule.meta &&
    typeof (rule.meta as Record<string, unknown>).fixable === 'boolean' &&
    (!('since' in rule.meta) || typeof (rule.meta as Record<string, unknown>).since === 'string') &&
    typeof rule.validate === 'function'
  );
}
