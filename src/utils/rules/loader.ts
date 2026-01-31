/**
 * Custom rule loader for loading user-defined rules
 * Enables extending claude-code-lint with custom validation rules
 */

import { existsSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { RuleRegistry } from './registry';
import type { Rule } from '../../types/rule';

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
  /** Directory containing custom rules (default: .claude-code-lint/rules) */
  customRulesPath?: string;
  /** Enable custom rules loading (default: true) */
  enableCustomRules?: boolean;
}

/**
 * Loads and registers custom rules from .claude-code-lint/rules/
 */
export class CustomRuleLoader {
  private options: Required<CustomRuleLoaderOptions>;
  private loadedRules = new Map<string, Rule>();

  constructor(options: CustomRuleLoaderOptions = {}) {
    this.options = {
      customRulesPath: options.customRulesPath || '.claude-code-lint/rules',
      enableCustomRules: options.enableCustomRules ?? true,
    };
  }

  /**
   * Load all custom rules from the configured directory
   *
   * @param basePath - Base path to search from (typically project root)
   * @returns Array of load results
   */
  async loadCustomRules(basePath: string): Promise<CustomRuleLoadResult[]> {
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
      results.push(await this.loadRule(file));
    }

    return results;
  }

  /**
   * Load a single custom rule file
   *
   * @param filePath - Path to rule file
   * @returns Load result
   */
  private async loadRule(filePath: string): Promise<CustomRuleLoadResult> {
    try {
      // Ensure this is treated as async (future-proofing)
      await Promise.resolve();

      // Import the rule file
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ruleModule = require(filePath) as { rule?: Rule };

      // Validate exports 'rule'
      if (!ruleModule.rule) {
        return {
          filePath,
          success: false,
          error: 'File must export a named "rule" object',
        };
      }

      const rule = ruleModule.rule;

      // Validate implements Rule interface
      if (!this.isValidRule(rule)) {
        return {
          filePath,
          success: false,
          error: 'Rule does not implement Rule interface (must have meta and validate)',
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    } catch (error) {
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
   * Validate that an object implements the Rule interface
   *
   * @param rule - Object to validate
   * @returns True if valid rule
   */
  private isValidRule(rule: unknown): rule is Rule {
    if (!rule || typeof rule !== 'object') {
      return false;
    }

    const r = rule as Record<string, unknown>;

    // Check for required meta object
    if (!r.meta || typeof r.meta !== 'object') {
      return false;
    }

    const meta = r.meta as Record<string, unknown>;

    // Check for required meta fields
    if (
      typeof meta.id !== 'string' ||
      typeof meta.name !== 'string' ||
      typeof meta.description !== 'string' ||
      typeof meta.category !== 'string' ||
      typeof meta.severity !== 'string'
    ) {
      return false;
    }

    // Check for required validate function
    if (typeof r.validate !== 'function') {
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
