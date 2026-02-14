/**
 * Configuration inheritance (extends) implementation
 *
 * This module implements config resolution with the extends field,
 * allowing configs to inherit from other configs (similar to ESLint).
 */

import { existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { ClaudeLintConfig, loadConfig, mergeConfig } from './types';
import { ConfigError } from './resolver';

/**
 * Built-in preset mappings
 *
 * Maps claudelint: prefixed names to their bundled JSON preset files.
 * These ship in the presets/ directory of the npm package.
 */
const BUILTIN_PRESETS: Record<string, string> = {
  'claudelint:recommended': join(__dirname, '../../../presets/recommended.json'),
  'claudelint:all': join(__dirname, '../../../presets/all.json'),
};

/**
 * Resolve extends path to absolute file path
 *
 * @param extendsValue - Value from extends field (relative path or package name)
 * @param fromDir - Directory containing the config file
 * @returns Absolute path to extended config
 * @throws ConfigError if config not found
 *
 * @example
 * // Relative path
 * resolveConfigPath('./base.json', '/path/to/dir')
 * // => '/path/to/base.json'
 *
 * @example
 * // Node modules package
 * resolveConfigPath('claudelint-config-standard', '/path')
 * // => '/path/node_modules/claudelint-config-standard/index.json'
 */
export function resolveConfigPath(extendsValue: string, fromDir: string): string {
  // Built-in presets (claudelint:recommended, claudelint:all)
  if (extendsValue.startsWith('claudelint:')) {
    const presetPath = BUILTIN_PRESETS[extendsValue];
    if (!presetPath) {
      throw new ConfigError(
        `Unknown built-in preset: ${extendsValue}\n` +
          `Available presets: ${Object.keys(BUILTIN_PRESETS).join(', ')}`
      );
    }
    return presetPath;
  }

  // Relative paths (starts with ./ or ../)
  if (extendsValue.startsWith('./') || extendsValue.startsWith('../')) {
    const resolved = resolve(fromDir, extendsValue);

    if (!existsSync(resolved)) {
      throw new ConfigError(
        `Extended config not found: ${extendsValue}\n` +
          `Resolved to: ${resolved}\n` +
          `Referenced from: ${fromDir}`
      );
    }

    return resolved;
  }

  // Node modules packages
  try {
    // Try to resolve as a module
    return require.resolve(extendsValue, { paths: [fromDir] });
  } catch {
    throw new ConfigError(
      `Extended config package not found: ${extendsValue}\n` +
        `Make sure the package is installed: npm install --save-dev ${extendsValue}\n` +
        `Referenced from: ${fromDir}`
    );
  }
}

/**
 * Load config with extends resolution
 *
 * Recursively loads and merges extended configs. Detects circular dependencies.
 *
 * @param configPath - Path to config file
 * @param visited - Set of visited paths (for circular detection)
 * @returns Fully resolved config with all extends merged
 * @throws ConfigError on circular dependency
 *
 * @example
 * ```typescript
 * const config = loadConfigWithExtends('/path/to/child.json');
 * // Returns merged config: base -> extended -> current
 * ```
 */
export function loadConfigWithExtends(
  configPath: string,
  visited: Set<string> = new Set()
): ClaudeLintConfig {
  // Normalize path for comparison
  const normalizedPath = resolve(configPath);

  // Detect circular dependencies
  if (visited.has(normalizedPath)) {
    const chain = Array.from(visited).concat(normalizedPath);
    throw new ConfigError(
      `Circular dependency detected in config extends:\n` +
        chain.map((p, i) => `  ${i + 1}. ${p}`).join('\n')
    );
  }

  visited.add(normalizedPath);

  // Load base config
  const config = loadConfig(configPath);

  // No extends - return as-is
  if (!config.extends) {
    return config;
  }

  // Normalize extends to array
  const extendsArray = Array.isArray(config.extends) ? config.extends : [config.extends];

  // Resolve and load all extended configs
  const fromDir = dirname(normalizedPath);
  const extendedConfigs = extendsArray.map((ext) => {
    const extPath = resolveConfigPath(ext, fromDir);
    // Pass a copy of visited set to allow siblings
    return loadConfigWithExtends(extPath, new Set(visited));
  });

  // Merge configs: ext[0] → ext[1] → ... → current
  // Extended configs are merged first (they are the base)
  // Current config is applied last (it overrides)

  // Start with first extended config
  let merged: ClaudeLintConfig = extendedConfigs[0] || {};

  // Apply remaining extended configs in order
  // mergeConfig(A, B) makes A win, so ext[i] should override previous merged
  for (let i = 1; i < extendedConfigs.length; i++) {
    merged = mergeConfig(extendedConfigs[i], merged);
  }

  // Apply current config (overrides extended configs)
  // Remove extends field from current config before merging
  const { extends: _, ...currentWithoutExtends } = config;
  merged = mergeConfig(currentWithoutExtends, merged);

  return merged;
}
