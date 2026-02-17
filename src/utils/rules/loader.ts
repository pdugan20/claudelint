/**
 * Custom rule loader for loading user-defined rules
 * Enables extending claudelint with custom validation rules
 */

import { existsSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { createJiti } from 'jiti';
import { RuleRegistry } from './registry';
import type { Rule, RuleCategory, RuleSeverity } from '../../types/rule';
import { isRule } from '../../types/rule';

const jiti = createJiti(__filename);

/** Valid severity values */
const VALID_SEVERITIES: ReadonlySet<string> = new Set<RuleSeverity>(['off', 'warn', 'error']);

/** Valid category values */
const VALID_CATEGORIES: ReadonlySet<string> = new Set<RuleCategory>([
  'CLAUDE.md',
  'Skills',
  'Settings',
  'Hooks',
  'MCP',
  'Plugin',
  'Commands',
  'Agents',
  'OutputStyles',
  'LSP',
]);

/**
 * Validate that a rule's meta values are correct enum members.
 * Returns an array of error strings (empty if valid).
 */
function validateRuleValues(rule: Rule): string[] {
  const errors: string[] = [];

  if (!VALID_SEVERITIES.has(rule.meta.severity)) {
    errors.push(
      `Invalid severity '${rule.meta.severity}'. Must be one of: ${[...VALID_SEVERITIES].join(', ')}`
    );
  }

  if (!VALID_CATEGORIES.has(rule.meta.category)) {
    errors.push(
      `Invalid category '${rule.meta.category}'. Must be one of: ${[...VALID_CATEGORIES].join(', ')}`
    );
  }

  if (!rule.meta.id || !/^[a-z][a-z0-9-]*$/.test(rule.meta.id)) {
    errors.push(`Invalid rule ID '${rule.meta.id}'. Must be non-empty, lowercase, and kebab-case`);
  }

  return errors;
}

/**
 * Result of loading a custom rule
 */
export interface CustomRuleLoadResult {
  filePath: string;
  rule?: Rule;
  success: boolean;
  error?: string;
}

/**
 * Options for custom rule loader
 */
export interface CustomRuleLoaderOptions {
  /** Directory containing custom rules (default: .claudelint/rules) */
  customRulesPath?: string;
  /** Enable custom rules loading (default: true) */
  enableCustomRules?: boolean;
}

/**
 * Loads and registers custom rules from .claudelint/rules/
 */
export class CustomRuleLoader {
  private options: Required<CustomRuleLoaderOptions>;
  private loadedRules = new Map<string, Rule>();

  constructor(options: CustomRuleLoaderOptions = {}) {
    this.options = {
      customRulesPath: options.customRulesPath || '.claudelint/rules',
      enableCustomRules: options.enableCustomRules ?? true,
    };
  }

  /**
   * Load all custom rules from the configured directory
   *
   * @param basePath - Base path to search from (typically project root)
   * @returns Array of load results
   */
  loadCustomRules(basePath: string): Promise<CustomRuleLoadResult[]> {
    // Delegate to sync implementation (jiti loads are synchronous)
    return Promise.resolve(this.loadCustomRulesSync(basePath));
  }

  /**
   * Synchronously load all custom rules from the configured directory.
   *
   * Since jiti (the TypeScript loader) is synchronous, this is safe to call
   * from synchronous contexts like config validation.
   *
   * @param basePath - Base path to search from (typically project root)
   * @returns Array of load results
   */
  loadCustomRulesSync(basePath: string): CustomRuleLoadResult[] {
    const results: CustomRuleLoadResult[] = [];

    if (!this.options.enableCustomRules) {
      return results;
    }

    const rulesDir = resolve(basePath, this.options.customRulesPath);

    if (!existsSync(rulesDir)) {
      return results;
    }

    // Find all rule files (recursive)
    const ruleFiles = this.findRuleFiles(rulesDir);

    for (const file of ruleFiles) {
      results.push(this.loadRuleSync(file));
    }

    return results;
  }

  /**
   * Load a single custom rule file
   *
   * Uses jiti which is synchronous, so this is safe for both sync and async callers.
   *
   * @param filePath - Path to rule file
   * @returns Load result
   */
  private loadRuleSync(filePath: string): CustomRuleLoadResult {
    try {
      // Import the rule file (jiti handles both .js and .ts transparently)
      const ruleModule = jiti(filePath) as { rule?: Rule; default?: { rule?: Rule } };

      // Handle both CJS and ESM exports
      const rule = ruleModule.rule ?? ruleModule.default?.rule;

      // Validate exports 'rule'
      if (!rule) {
        return {
          filePath,
          success: false,
          error: 'File must export a named "rule" object',
        };
      }

      // Validate implements Rule interface (reuses shared isRule() type guard)
      if (!isRule(rule)) {
        return {
          filePath,
          success: false,
          error:
            'Rule does not implement Rule interface (must have meta with id, name, description, category, severity, fixable, since, and a validate function)',
        };
      }

      // Validate enum values (severity, category, id format)
      const valueErrors = validateRuleValues(rule);
      if (valueErrors.length > 0) {
        return {
          filePath,
          success: false,
          error: valueErrors.join('. '),
        };
      }

      // Check for ID conflicts with built-in rules
      if (RuleRegistry.exists(rule.meta.id)) {
        return {
          filePath,
          success: false,
          error: `Rule ID "${rule.meta.id}" conflicts with existing rule`,
        };
      }

      // Check for ID conflicts with other custom rules
      if (this.loadedRules.has(rule.meta.id)) {
        return {
          filePath,
          success: false,
          error: `Rule ID "${rule.meta.id}" conflicts with another custom rule`,
        };
      }

      // Register rule (with type assertion since custom rule IDs aren't in the RuleId union)
      this.loadedRules.set(rule.meta.id, rule);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      RuleRegistry.register(rule as any);

      return {
        filePath,
        rule,
        success: true,
      };
    } catch (error) {
      return {
        filePath,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Find all rule files in directory (recursive)
   *
   * @param directory - Directory to search
   * @returns Array of rule file paths
   */
  private findRuleFiles(directory: string): string[] {
    const files: string[] = [];

    try {
      const entries = readdirSync(directory, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(directory, entry.name);

        if (entry.isDirectory()) {
          // Recurse into subdirectories
          files.push(...this.findRuleFiles(fullPath));
        } else if (entry.isFile()) {
          // Include .ts and .js files, exclude .d.ts, .test.ts, .spec.ts
          if (this.isRuleFile(entry.name)) {
            files.push(fullPath);
          }
        }
      }
    } catch {
      // Directory not accessible, skip silently
    }

    return files;
  }

  /**
   * Check if a filename should be loaded as a rule
   *
   * @param filename - Filename to check
   * @returns True if file should be loaded
   */
  private isRuleFile(filename: string): boolean {
    // Include .ts and .js files
    if (!filename.endsWith('.ts') && !filename.endsWith('.js')) {
      return false;
    }

    // Exclude declaration files
    if (filename.endsWith('.d.ts')) {
      return false;
    }

    // Exclude test files
    if (filename.endsWith('.test.ts') || filename.endsWith('.spec.ts')) {
      return false;
    }

    if (filename.endsWith('.test.js') || filename.endsWith('.spec.js')) {
      return false;
    }

    return true;
  }

  /**
   * Get list of loaded custom rules
   *
   * @returns Array of loaded rules
   */
  getLoadedRules(): Rule[] {
    return Array.from(this.loadedRules.values());
  }

  /**
   * Clear loaded rules (mainly for testing)
   */
  clear(): void {
    this.loadedRules.clear();
  }
}
