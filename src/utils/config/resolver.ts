/**
 * Configuration Resolver
 *
 * Resolves effective configuration for specific files by applying:
 * 1. Base rules from .claudelintrc.json
 * 2. File-specific overrides
 * 3. Default values from rule registry
 *
 * Inspired by ESLint's configuration cascade system.
 */

import { minimatch } from 'minimatch';
import { ClaudeLintConfig, RuleConfig } from './types';
import { RuleId } from '../../rules/rule-ids';
import { RuleRegistry } from '../rules/registry';
import { ResolvedRuleConfig } from '../rules/context';
import { DiagnosticCollector } from '../diagnostics';

/**
 * Error thrown when configuration is invalid
 * This is a fatal error that should exit with code 2
 */
export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

/**
 * Validates all rule options in a config file upfront (before any validation runs)
 * Throws ConfigError if any rule has invalid options
 *
 * This matches ESLint's behavior: validate config early, fail fast before running linters
 *
 * @param config - The loaded configuration from .claudelintrc.json
 * @throws ConfigError if any rule options fail schema validation
 *
 * @example
 * ```typescript
 * try {
 *   validateAllRuleOptions(config);
 * } catch (error) {
 *   if (error instanceof ConfigError) {
 *     console.error('Invalid config:', error.message);
 *     process.exit(2);
 *   }
 * }
 * ```
 */
export function validateAllRuleOptions(config: ClaudeLintConfig): void {
  // Validate base rules
  if (config.rules) {
    for (const [ruleId, ruleConfig] of Object.entries(config.rules)) {
      validateSingleRuleConfig(ruleId as RuleId, ruleConfig);
    }
  }

  // Validate override rules
  if (config.overrides) {
    for (const override of config.overrides) {
      if (override.rules) {
        for (const [ruleId, ruleConfig] of Object.entries(override.rules)) {
          validateSingleRuleConfig(ruleId as RuleId, ruleConfig);
        }
      }
    }
  }
}

/**
 * Validates a single rule configuration
 * @param ruleId - The rule ID
 * @param config - The rule configuration
 * @throws ConfigError if options fail schema validation
 */
function validateSingleRuleConfig(
  ruleId: RuleId,
  config: RuleConfig | 'off' | 'warn' | 'error'
): void {
  // String format doesn't have options to validate
  if (typeof config === 'string') {
    return;
  }

  // Object format: validate options against schema
  const rule = RuleRegistry.get(ruleId);
  const options = config.options || {};

  if (rule?.schema) {
    try {
      rule.schema.parse(options);
    } catch (error) {
      throw new ConfigError(
        `Invalid options for rule '${ruleId}': ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

/**
 * Resolves configuration for files with caching
 *
 * @example
 * ```typescript
 * // Create resolver (optionally pass DiagnosticCollector for warnings)
 * const diagnostics = new DiagnosticCollector();
 * const resolver = new ConfigResolver(config, diagnostics);
 *
 * // Check if rule is enabled for a file
 * if (resolver.isRuleEnabled('size-error', 'CLAUDE.md')) {
 *   // Get options for the rule
 *   const options = resolver.getRuleOptions('size-error', 'CLAUDE.md');
 * }
 * ```
 */
export class ConfigResolver {
  private config: ClaudeLintConfig;
  private cache = new Map<string, Map<RuleId, ResolvedRuleConfig>>();

  /**
   * Create a new configuration resolver
   *
   * @param config - The loaded configuration from .claudelintrc.json
   * @param diagnostics - Optional diagnostic collector for warnings
   */
  constructor(
    config: ClaudeLintConfig,
    private diagnostics?: DiagnosticCollector
  ) {
    this.config = config;
  }

  /**
   * Resolve effective configuration for a specific file
   *
   * Applies configuration in priority order:
   * 1. Base rules (from config.rules)
   * 2. Override rules (from config.overrides matching the file)
   *
   * Results are cached for performance.
   *
   * @param filePath - Path to the file being validated
   * @returns Map of rule IDs to their resolved configuration
   *
   * @example
   * ```typescript
   * const resolved = resolver.resolveForFile('src/test.ts');
   * const sizeErrorConfig = resolved.get('size-error');
   * ```
   */
  resolveForFile(filePath: string): Map<RuleId, ResolvedRuleConfig> {
    // Check cache first
    if (this.cache.has(filePath)) {
      return this.cache.get(filePath)!;
    }

    const resolved = this.computeResolvedConfig(filePath);
    this.cache.set(filePath, resolved);
    return resolved;
  }

  /**
   * Compute resolved configuration for a file (no caching)
   *
   * @param filePath - Path to the file
   * @returns Resolved configuration map
   */
  private computeResolvedConfig(filePath: string): Map<RuleId, ResolvedRuleConfig> {
    const resolved = new Map<RuleId, ResolvedRuleConfig>();

    // Start with base rules
    const baseRules = this.config.rules || {};

    // Find matching overrides for this file
    const overrides = this.config.overrides || [];
    const matchingOverrides = overrides.filter((override) =>
      override.files.some((pattern) => minimatch(filePath, pattern))
    );

    // Merge rules in priority order: base → overrides (last override wins)
    const effectiveRules: Record<string, RuleConfig | 'off' | 'warn' | 'error'> = {
      ...baseRules,
    };

    for (const override of matchingOverrides) {
      Object.assign(effectiveRules, override.rules);
    }

    // Normalize each rule config
    for (const [ruleId, config] of Object.entries(effectiveRules)) {
      const normalized = this.normalizeRuleConfig(ruleId as RuleId, config);
      // Only add to resolved map if validation succeeded
      if (normalized !== null) {
        resolved.set(ruleId as RuleId, normalized);
      }
    }

    return resolved;
  }

  /**
   * Normalize rule configuration to standard format
   *
   * Handles both string format ("off"/"warn"/"error") and object format.
   * Validates options against rule schema if available.
   *
   * @param ruleId - The rule ID
   * @param config - The rule configuration (string or object)
   * @returns Normalized rule configuration, or null if options fail schema validation
   *
   * @example
   * ```typescript
   * // String format
   * normalizeRuleConfig('size-error', 'off')
   * // => { ruleId: 'size-error', severity: 'off', options: [] }
   *
   * // Object format
   * normalizeRuleConfig('size-error', {
   *   severity: 'error',
   *   options: { maxSize: 60000 }
   * })
   * // => { ruleId: 'size-error', severity: 'error', options: [{ maxSize: 60000 }] }
   * ```
   */
  private normalizeRuleConfig(
    ruleId: RuleId,
    config: RuleConfig | 'off' | 'warn' | 'error'
  ): ResolvedRuleConfig | null {
    // String format: "off" | "warn" | "error"
    if (typeof config === 'string') {
      return {
        ruleId,
        severity: config,
        options: [],
      };
    }

    // Object format: { severity, options }
    const rule = RuleRegistry.get(ruleId);
    const options = config.options || {};

    // Validate options against schema if available
    if (rule?.schema) {
      try {
        rule.schema.parse(options);
      } catch (error) {
        // Invalid options - return null to exclude rule from resolved config
        this.diagnostics?.warn(
          `Invalid options for rule '${ruleId}': ${error instanceof Error ? error.message : String(error)}. Rule will be disabled.`,
          'ConfigResolver',
          'CONFIG_INVALID_OPTIONS'
        );
        return null;
      }
    }

    return {
      ruleId,
      severity: config.severity,
      options: [options], // Wrap in array like ESLint
    };
  }

  /**
   * Check if a rule is enabled for a file
   *
   * A rule is enabled if:
   * 1. It's not configured (defaults to enabled)
   * 2. It's configured with severity "warn" or "error"
   *
   * A rule is disabled if configured with severity "off".
   *
   * @param ruleId - The rule ID to check
   * @param filePath - Path to the file
   * @returns true if rule is enabled, false if disabled
   *
   * @example
   * ```typescript
   * if (resolver.isRuleEnabled('size-error', 'CLAUDE.md')) {
   *   // Validate the rule
   * }
   * ```
   */
  isRuleEnabled(ruleId: RuleId, filePath: string): boolean {
    const config = this.resolveForFile(filePath).get(ruleId);

    if (!config) {
      // Not configured = use default from registry (enabled if rule exists)
      const rule = RuleRegistry.get(ruleId);
      return rule !== undefined;
    }

    return config.severity !== 'off';
  }

  /**
   * Get severity for a rule in a specific file
   *
   * Returns configured severity or default from registry if not configured.
   *
   * @param ruleId - The rule ID
   * @param filePath - Path to the file
   * @returns 'off', 'warn', or 'error'
   *
   * @example
   * ```typescript
   * const severity = resolver.getRuleSeverity('size-error', 'CLAUDE.md');
   * if (severity === 'error') {
   *   // Report as error
   * }
   * ```
   */
  getRuleSeverity(ruleId: RuleId, filePath: string): 'off' | 'warn' | 'error' {
    const config = this.resolveForFile(filePath).get(ruleId);

    if (!config) {
      // Use default severity from registry
      const rule = RuleRegistry.get(ruleId);
      return rule?.severity ?? 'error';
    }

    return config.severity;
  }

  /**
   * Get options for a rule in a specific file
   *
   * Returns configured options or defaults from registry if not configured.
   *
   * @param ruleId - The rule ID
   * @param filePath - Path to the file
   * @returns Array of options (ESLint convention) or empty array
   *
   * @example
   * ```typescript
   * const options = resolver.getRuleOptions('size-error', 'CLAUDE.md');
   * // options = [{ maxSize: 60000 }]
   * const maxSize = options[0]?.maxSize || 50000;
   * ```
   */
  getRuleOptions(ruleId: RuleId, filePath: string): unknown[] {
    const config = this.resolveForFile(filePath).get(ruleId);

    if (!config) {
      // Use default options from registry
      const rule = RuleRegistry.get(ruleId);
      return rule?.defaultOptions ? [rule.defaultOptions] : [];
    }

    return config.options;
  }

  /**
   * Clear the configuration cache
   *
   * Useful for testing or when configuration changes at runtime.
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   *
   * Useful for debugging and performance monitoring.
   *
   * @returns Object with cache statistics
   */
  getCacheStats(): { size: number; files: string[] } {
    return {
      size: this.cache.size,
      files: Array.from(this.cache.keys()),
    };
  }
}
