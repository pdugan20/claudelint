/**
 * Plugin system for loading third-party validators
 * Allows extending claudelint with custom validators
 */

import { existsSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { ValidatorRegistry } from './validator-factory';

/**
 * Plugin interface that third-party validators must implement
 */
export interface ValidatorPlugin {
  /** Plugin name (should match package name) */
  name: string;
  /** Plugin version (semver) */
  version: string;
  /** Registration function called when plugin is loaded */
  register: (registry: typeof ValidatorRegistry) => void;
}

/**
 * Options for plugin loader
 */
export interface PluginLoaderOptions {
  /** Additional directories to search for plugins */
  pluginDirs?: string[];
  /** Whether to search node_modules for plugins */
  searchNodeModules?: boolean;
  /** Pattern to match plugin package names */
  pluginPrefix?: string;
}

/**
 * Result of loading a plugin
 */
export interface PluginLoadResult {
  /** Plugin name */
  name: string;
  /** Whether loading succeeded */
  success: boolean;
  /** Error message if loading failed */
  error?: string;
}

/**
 * Loads and registers validator plugins
 */
export class PluginLoader {
  private options: Required<PluginLoaderOptions>;
  private loadedPlugins = new Set<string>();

  constructor(options: PluginLoaderOptions = {}) {
    this.options = {
      pluginDirs: options.pluginDirs || [],
      searchNodeModules: options.searchNodeModules ?? true,
      pluginPrefix: options.pluginPrefix || 'claudelint-plugin-',
    };
  }

  /**
   * Load all plugins from configured sources
   *
   * @param basePath - Base path to search from (typically project root)
   * @returns Array of load results
   */
  async loadPlugins(basePath: string): Promise<PluginLoadResult[]> {
    const results: PluginLoadResult[] = [];

    // Load from plugin directories
    for (const dir of this.options.pluginDirs) {
      const pluginDir = resolve(basePath, dir);
      if (existsSync(pluginDir)) {
        results.push(...(await this.loadFromDirectory(pluginDir)));
      }
    }

    // Load from node_modules
    if (this.options.searchNodeModules) {
      const nodeModulesDir = resolve(basePath, 'node_modules');
      if (existsSync(nodeModulesDir)) {
        results.push(...(await this.loadFromNodeModules(nodeModulesDir)));
      }
    }

    return results;
  }

  /**
   * Load a specific plugin by name or path
   *
   * @param pluginPath - Path to plugin or plugin name
   * @returns Load result
   */
  async loadPlugin(pluginPath: string): Promise<PluginLoadResult> {
    try {
      // Check if already loaded
      if (this.loadedPlugins.has(pluginPath)) {
        return {
          name: pluginPath,
          success: true,
        };
      }

      // Try to require the plugin
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pluginModule = require(pluginPath);
      const plugin: ValidatorPlugin = pluginModule.default || pluginModule;

      // Validate plugin interface
      if (!this.isValidPlugin(plugin)) {
        return {
          name: pluginPath,
          success: false,
          error: 'Plugin does not implement ValidatorPlugin interface',
        };
      }

      // Register the plugin
      plugin.register(ValidatorRegistry);
      this.loadedPlugins.add(pluginPath);

      return {
        name: plugin.name,
        success: true,
      };
    } catch (error) {
      return {
        name: pluginPath,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Load plugins from a directory
   *
   * @param directory - Directory to search
   * @returns Array of load results
   */
  private async loadFromDirectory(directory: string): Promise<PluginLoadResult[]> {
    const results: PluginLoadResult[] = [];

    try {
      const entries = readdirSync(directory);

      for (const entry of entries) {
        const fullPath = join(directory, entry);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          // Check if it's a plugin directory (has package.json or index.js)
          if (existsSync(join(fullPath, 'package.json')) || existsSync(join(fullPath, 'index.js'))) {
            results.push(await this.loadPlugin(fullPath));
          }
        } else if (entry.endsWith('.js') || entry.endsWith('.ts')) {
          // Load single plugin file
          results.push(await this.loadPlugin(fullPath));
        }
      }
    } catch (error) {
      // Directory not accessible, skip silently
    }

    return results;
  }

  /**
   * Load plugins from node_modules
   *
   * @param nodeModulesDir - node_modules directory path
   * @returns Array of load results
   */
  private async loadFromNodeModules(nodeModulesDir: string): Promise<PluginLoadResult[]> {
    const results: PluginLoadResult[] = [];

    try {
      const packages = readdirSync(nodeModulesDir);

      for (const pkg of packages) {
        // Skip scoped packages directory (process them separately)
        if (pkg.startsWith('@')) {
          const scopedDir = join(nodeModulesDir, pkg);
          const scopedPackages = readdirSync(scopedDir);

          for (const scopedPkg of scopedPackages) {
            const fullName = `${pkg}/${scopedPkg}`;
            if (this.isPluginPackage(scopedPkg)) {
              results.push(await this.loadPlugin(fullName));
            }
          }
        } else if (this.isPluginPackage(pkg)) {
          results.push(await this.loadPlugin(pkg));
        }
      }
    } catch (error) {
      // node_modules not accessible, skip silently
    }

    return results;
  }

  /**
   * Check if a package name matches the plugin pattern
   *
   * @param packageName - Package name to check
   * @returns True if package is a plugin
   */
  private isPluginPackage(packageName: string): boolean {
    return packageName.startsWith(this.options.pluginPrefix);
  }

  /**
   * Validate that an object implements the ValidatorPlugin interface
   *
   * @param plugin - Object to validate
   * @returns True if valid plugin
   */
  private isValidPlugin(plugin: unknown): plugin is ValidatorPlugin {
    if (!plugin || typeof plugin !== 'object') {
      return false;
    }

    const p = plugin as Record<string, unknown>;

    return (
      typeof p.name === 'string' &&
      typeof p.version === 'string' &&
      typeof p.register === 'function'
    );
  }

  /**
   * Get list of loaded plugin names
   *
   * @returns Array of loaded plugin names
   */
  getLoadedPlugins(): string[] {
    return Array.from(this.loadedPlugins);
  }

  /**
   * Clear loaded plugins list (mainly for testing)
   */
  clear(): void {
    this.loadedPlugins.clear();
  }
}
