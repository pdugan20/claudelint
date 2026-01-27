/**
 * Rule Registry
 *
 * Central registry for all validation rules in claudelint.
 * Provides metadata about rules for documentation, config validation,
 * and future extensibility.
 */

export interface RuleMetadata {
  /** Unique rule identifier (e.g., 'size-error', 'skill-missing-shebang') */
  id: string;

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
}

export class RuleRegistry {
  private static rules = new Map<string, RuleMetadata>();

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
   */
  static get(ruleId: string): RuleMetadata | undefined {
    return this.rules.get(ruleId);
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
   */
  static exists(ruleId: string): boolean {
    return this.rules.has(ruleId);
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
  static getAllIds(): string[] {
    return Array.from(this.rules.keys());
  }
}
