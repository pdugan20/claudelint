/**
 * Workspace detection for monorepos
 *
 * Detects and parses workspace configurations for pnpm, npm, and Yarn.
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { load as parseYaml } from 'js-yaml';
import { glob } from 'glob';

/**
 * Information about detected workspace
 */
export interface WorkspaceInfo {
  /** Absolute path to workspace root */
  root: string;

  /** Absolute paths to all workspace packages */
  packages: string[];

  /** Package manager type */
  packageManager: 'pnpm' | 'npm' | 'yarn' | 'none';
}

/**
 * Detect workspace configuration from current directory
 *
 * Checks for pnpm-workspace.yaml and package.json workspaces.
 * Returns null if no workspace configuration is found.
 *
 * @param cwd - Directory to search from (defaults to process.cwd())
 * @returns WorkspaceInfo if workspace found, null otherwise
 *
 * @example
 * ```typescript
 * const workspace = await detectWorkspace('/path/to/monorepo');
 * if (workspace) {
 *   console.log(`Found ${workspace.packages.length} packages`);
 * }
 * ```
 */
export async function detectWorkspace(cwd: string = process.cwd()): Promise<WorkspaceInfo | null> {
  // Try pnpm first
  const pnpmWorkspace = await detectPnpmWorkspace(cwd);
  if (pnpmWorkspace) {
    return pnpmWorkspace;
  }

  // Try npm/Yarn workspaces
  const npmWorkspace = await detectNpmWorkspace(cwd);
  if (npmWorkspace) {
    return npmWorkspace;
  }

  // No workspace found
  return null;
}

/**
 * Detect pnpm workspace
 *
 * Checks for pnpm-workspace.yaml and parses the packages field.
 *
 * @param cwd - Directory to check
 * @returns WorkspaceInfo if pnpm workspace found, null otherwise
 */
async function detectPnpmWorkspace(cwd: string): Promise<WorkspaceInfo | null> {
  const workspaceFile = join(cwd, 'pnpm-workspace.yaml');

  if (!existsSync(workspaceFile)) {
    return null;
  }

  try {
    // Parse YAML
    const content = readFileSync(workspaceFile, 'utf-8');
    const config = parseYaml(content) as { packages?: string[] };

    if (!config.packages || !Array.isArray(config.packages)) {
      console.warn('Warning: pnpm-workspace.yaml must have a "packages" array');
      return null;
    }

    // Expand glob patterns to package directories
    const packages = await expandWorkspaceGlobs(config.packages, cwd);

    return {
      root: cwd,
      packages,
      packageManager: 'pnpm',
    };
  } catch (error) {
    // Log warning but don't fail - malformed config should be non-fatal
    console.warn(
      `Warning: Failed to parse pnpm-workspace.yaml: ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  }
}

/**
 * Detect npm or Yarn workspace
 *
 * Checks for workspaces field in package.json.
 * Supports both npm array format and Yarn object format.
 *
 * @param cwd - Directory to check
 * @returns WorkspaceInfo if npm/Yarn workspace found, null otherwise
 */
async function detectNpmWorkspace(cwd: string): Promise<WorkspaceInfo | null> {
  const packageJsonPath = join(cwd, 'package.json');

  if (!existsSync(packageJsonPath)) {
    return null;
  }

  try {
    // Parse package.json
    const content = readFileSync(packageJsonPath, 'utf-8');
    const pkg = JSON.parse(content) as {
      workspaces?: string[] | { packages?: string[] };
    };

    if (!pkg.workspaces) {
      return null;
    }

    // Handle both array and object formats
    // Array format (npm): "workspaces": ["packages/*"]
    // Object format (Yarn): "workspaces": { "packages": [...] }
    let workspacePatterns: string[];
    if (Array.isArray(pkg.workspaces)) {
      workspacePatterns = pkg.workspaces;
    } else if (pkg.workspaces.packages && Array.isArray(pkg.workspaces.packages)) {
      workspacePatterns = pkg.workspaces.packages;
    } else {
      console.warn(
        'Warning: package.json workspaces must be an array or { packages: [...] }'
      );
      return null;
    }

    // Expand glob patterns
    const packages = await expandWorkspaceGlobs(workspacePatterns, cwd);

    // Detect which package manager
    const packageManager = detectPackageManager(cwd);

    return {
      root: cwd,
      packages,
      packageManager,
    };
  } catch (error) {
    // Log warning but don't fail
    console.warn(
      `Warning: Failed to parse package.json workspaces: ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  }
}

/**
 * Expand workspace glob patterns to actual package directories
 *
 * Uses glob library to expand patterns like "packages/*" and "apps/*".
 * Filters for directories only and deduplicates results.
 *
 * @param patterns - Glob patterns from workspace config
 * @param root - Workspace root directory
 * @returns Array of absolute paths to package directories
 *
 * @example
 * ```typescript
 * const packages = await expandWorkspaceGlobs(['packages/*', 'apps/*'], '/root');
 * // Returns: ['/root/packages/app-1', '/root/packages/app-2', '/root/apps/web']
 * ```
 */
async function expandWorkspaceGlobs(patterns: string[], root: string): Promise<string[]> {
  const allPackages: string[] = [];

  for (const pattern of patterns) {
    // Skip negation patterns - they're handled by glob automatically
    const matches = await glob(pattern, {
      cwd: root,
      absolute: true,
      ignore: ['**/node_modules/**', '**/.git/**'], // Always ignore these
    });

    // Filter for directories only (packages are always directories)
    // glob doesn't have onlyDirectories option, so we check manually
    const dirs = matches.filter((match) => {
      try {
        const fs = require('fs');
        return fs.statSync(match).isDirectory();
      } catch {
        return false;
      }
    });

    allPackages.push(...dirs);
  }

  // Remove duplicates and sort for consistent ordering
  const uniquePackages = [...new Set(allPackages)];
  return uniquePackages.sort();
}

/**
 * Detect package manager from lock files
 *
 * Checks for pnpm-lock.yaml, yarn.lock, or defaults to npm.
 *
 * @param cwd - Directory to check
 * @returns Package manager type
 *
 * @example
 * ```typescript
 * const pm = detectPackageManager('/path/to/monorepo');
 * // Returns: 'pnpm' | 'yarn' | 'npm'
 * ```
 */
function detectPackageManager(cwd: string): 'pnpm' | 'yarn' | 'npm' {
  // Check for pnpm-lock.yaml
  if (existsSync(join(cwd, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }

  // Check for yarn.lock
  if (existsSync(join(cwd, 'yarn.lock'))) {
    return 'yarn';
  }

  // Default to npm
  return 'npm';
}
