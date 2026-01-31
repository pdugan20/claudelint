/**
 * Rule Context Types
 *
 * Defines interfaces for rule execution context and resolved configuration.
 * These types enable validators to access rule-specific configuration and options.
 */

import { RuleId } from '../../rules/rule-ids';

/**
 * Context passed to validators for rule execution
 *
 * Similar to ESLint's context object, provides rule configuration
 * and options for the current file being validated.
 *
 * @example
 * ```typescript
 * const context: RuleContext = {
 *   ruleId: 'size-error',
 *   options: [{ maxSize: 60000 }],
 *   severity: 'error',
 *   filePath: 'CLAUDE.md'
 * };
 * ```
 */
export interface RuleContext {
  /** Rule ID being evaluated */
  ruleId: RuleId;

  /**
   * Configured options for this rule (excludes severity)
   *
   * Options are provided as an array following ESLint's convention.
   * The first element (index 0) typically contains the main options object.
   *
   * @example
   * ```typescript
   * // Config: { "size-error": { "severity": "error", "options": { "maxSize": 60000 } } }
   * // context.options = [{ maxSize: 60000 }]
   * const maxSize = context.options[0]?.maxSize || 50000;
   * ```
   */
  options: unknown[];

  /**
   * Effective severity for this rule in current file
   *
   * - "off": Rule is disabled, no violations reported
   * - "warn": Violations reported as warnings
   * - "error": Violations reported as errors
   */
  severity: 'off' | 'warn' | 'error';

  /** File being validated (optional, for context) */
  filePath?: string;
}

/**
 * Resolved rule configuration for a specific file
 *
 * Represents the effective configuration after applying base rules,
 * file-specific overrides, and default values.
 *
 * @example
 * ```typescript
 * const resolved: ResolvedRuleConfig = {
 *   ruleId: 'size-error',
 *   severity: 'warn',  // Overridden from default 'error'
 *   options: [{ maxSize: 60000 }]
 * };
 * ```
 */
export interface ResolvedRuleConfig {
  /** Rule ID */
  ruleId: RuleId;

  /**
   * Effective severity for this rule
   *
   * Result of merging:
   * 1. Rule's default severity (from registry)
   * 2. Base configuration rules
   * 3. File-specific overrides
   */
  severity: 'off' | 'warn' | 'error';

  /**
   * Resolved options for this rule
   *
   * Result of merging:
   * 1. Rule's default options (from registry)
   * 2. Configured options (from .claudelintrc.json)
   *
   * Wrapped in array following ESLint convention.
   */
  options: unknown[];
}
