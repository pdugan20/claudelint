/**
 * Rule Registry
 *
 * Central registry for all validation rules in claudelint.
 * Provides metadata about rules for documentation, config validation,
 * and future extensibility.
 */

import { RuleId } from '../rules/rule-ids';
import { RuleMetadata } from '../types/rule';

// Re-export for backwards compatibility
export type { RuleMetadata };

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
