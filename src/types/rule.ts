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

  /** Whether this rule is deprecated */
  deprecated: boolean;

  /** If deprecated, list of replacement rule IDs */
  replacedBy?: RuleId[];

  /** Version when this rule was introduced */
  since: string;

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
 *     deprecated: false,
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
    'deprecated' in rule.meta &&
    typeof (rule.meta as Record<string, unknown>).deprecated === 'boolean' &&
    'since' in rule.meta &&
    typeof (rule.meta as Record<string, unknown>).since === 'string' &&
    typeof rule.validate === 'function'
  );
}
