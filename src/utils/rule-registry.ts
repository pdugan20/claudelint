/**
 * Rule Registry
 *
 * Central registry for all validation rules in claudelint.
 * Provides metadata about rules for documentation, config validation,
 * and future extensibility.
 */

import { z } from 'zod';
import { RuleId } from '../rules/rule-ids';

export interface RuleMetadata {
  /** Unique rule identifier (e.g., 'size-error', 'skill-missing-shebang') */
  id: RuleId;

  /** Human-readable rule name */
  name: string;

  /** Brief description of what the rule checks */
  description: string;

  /** Category this rule belongs to */
  category: 'CLAUDE.md' | 'Skills' | 'Settings' | 'Hooks' | 'MCP' | 'Plugin';

  /** Default severity level */
  severity: 'error' | 'warning';

  /** Whether the rule supports auto-fixing */
  fixable: boolean;

  /** Whether the rule is deprecated */
  deprecated: boolean;

  /** Rule ID(s) that replace this rule (if deprecated) */
  replacedBy?: string[];

  /** Version when rule was added */
  since: string;

  /** URL to rule documentation (optional) */
  docUrl?: string;

  /**
   * Zod schema for validating rule options
   *
   * If provided, options will be validated against this schema
   * before being passed to the rule. Validation errors will be
   * reported at config load time.
   *
   * @example
   * ```typescript
   * schema: z.object({
   *   maxSize: z.number().positive().optional(),
   *   reportZeroSize: z.boolean().optional()
   * })
   * ```
   */
  schema?: z.ZodType<any>;

  /**
   * Default options for this rule
   *
   * Used when rule is enabled but no options are configured.
   * Should match the schema if one is provided.
   *
   * @example
   * ```typescript
   * defaultOptions: {
   *   maxSize: 50000,
   *   reportZeroSize: false
   * }
   * ```
   */
  defaultOptions?: Record<string, unknown>;
}

export class RuleRegistry {
  private static rules = new Map<RuleId, RuleMetadata>();

  /**
   * Register a new rule in the registry
   */
  static register(rule: RuleMetadata): void {
    if (this.rules.has(rule.id)) {
      throw new Error(`Rule '${rule.id}' is already registered`);
    }
    this.rules.set(rule.id, rule);
  }

  /**
   * Get metadata for a specific rule
   * Accepts string to allow validation of external rule IDs
   */
  static get(ruleId: string): RuleMetadata | undefined {
    return this.rules.get(ruleId as RuleId);
  }

  /**
   * Get all registered rules
   */
  static getAll(): RuleMetadata[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get all rules in a specific category
   */
  static getByCategory(category: string): RuleMetadata[] {
    return this.getAll().filter((rule) => rule.category === category);
  }

  /**
   * Check if a rule exists in the registry
   * Accepts string to allow validation of external rule IDs
   */
  static exists(ruleId: string): boolean {
    return this.rules.has(ruleId as RuleId);
  }

  /**
   * Clear all registered rules (useful for testing)
   */
  static clear(): void {
    this.rules.clear();
  }

  /**
   * Get count of registered rules
   */
  static count(): number {
    return this.rules.size;
  }

  /**
   * Get all rule IDs
   */
  static getAllIds(): RuleId[] {
    return Array.from(this.rules.keys());
  }
}
