/**
 * Workspace detection for monorepos
 *
 * Detects and parses workspace configurations for pnpm, npm, and Yarn.
 */

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { load as parseYaml } from 'js-yaml';
import { glob } from 'glob';
import { DiagnosticCollector } from '../diagnostics';

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
 * Find workspace root by walking up directory tree
 *
 * Starts from the given directory and walks up the directory tree
 * looking for workspace configuration files (pnpm-workspace.yaml or
 * package.json with workspaces field).
 *
 * @param startDir - Directory to start searching from (defaults to process.cwd())
 * @returns Absolute path to workspace root, or null if no workspace found
 *
 * @example
 * ```typescript
 * const root = await findWorkspaceRoot('/path/to/monorepo/packages/app-1');
 * // Returns: '/path/to/monorepo'
 * ```
 */
export async function findWorkspaceRoot(startDir: string = process.cwd()): Promise<string | null> {
  // Maintain async for API compatibility
  await Promise.resolve();

  let currentDir = startDir;
  const root = dirname(startDir).split('/')[0] + '/'; // File system root (e.g., '/')

  while (currentDir !== root && currentDir !== dirname(currentDir)) {
    // Check for pnpm workspace
    if (existsSync(join(currentDir, 'pnpm-workspace.yaml'))) {
      return currentDir;
    }

    // Check for npm/Yarn workspace
    const packageJsonPath = join(currentDir, 'package.json');
    if (existsSync(packageJsonPath)) {
      try {
        const content = readFileSync(packageJsonPath, 'utf-8');
        const pkg = JSON.parse(content) as {
          workspaces?: string[] | { packages?: string[] };
        };

        if (pkg.workspaces) {
          return currentDir;
        }
      } catch {
        // Ignore parse errors - invalid package.json doesn't mean no workspace
      }
    }

    // Move up one directory
    currentDir = dirname(currentDir);
  }

  // No workspace found
  return null;
}

/**
 * Detect workspace configuration from current directory
 *
 * Checks for pnpm-workspace.yaml and package.json workspaces.
 * Returns null if no workspace configuration is found.
 *
 * If autoDetectRoot is true, will walk up the directory tree to find
 * the workspace root automatically. Otherwise, only checks the given directory.
 *
 * @param cwd - Directory to search from (defaults to process.cwd())
 * @param autoDetectRoot - Whether to auto-detect workspace root (defaults to false)
 * @param diagnostics - Optional diagnostic collector for warnings
 * @returns WorkspaceInfo if workspace found, null otherwise
 *
 * @example
 * ```typescript
 * // Detect from specific directory
 * const workspace = await detectWorkspace('/path/to/monorepo');
 *
 * // Auto-detect root from nested directory
 * const workspace = await detectWorkspace('/path/to/monorepo/packages/app-1', true);
 * ```
 */
export async function detectWorkspace(
  cwd: string = process.cwd(),
  autoDetectRoot: boolean = false,
  diagnostics?: DiagnosticCollector
): Promise<WorkspaceInfo | null> {
  // Auto-detect workspace root if requested
  let searchDir = cwd;
  if (autoDetectRoot) {
    const root = await findWorkspaceRoot(cwd);
    if (!root) {
      return null;
    }
    searchDir = root;
  }

  // Try pnpm first
  const pnpmWorkspace = await detectPnpmWorkspace(searchDir, diagnostics);
  if (pnpmWorkspace) {
    return pnpmWorkspace;
  }

  // Try npm/Yarn workspaces
  const npmWorkspace = await detectNpmWorkspace(searchDir, diagnostics);
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
 * @param diagnostics - Optional diagnostic collector for warnings
 * @returns WorkspaceInfo if pnpm workspace found, null otherwise
 */
async function detectPnpmWorkspace(
  cwd: string,
  diagnostics?: DiagnosticCollector
): Promise<WorkspaceInfo | null> {
  const workspaceFile = join(cwd, 'pnpm-workspace.yaml');

  if (!existsSync(workspaceFile)) {
    return null;
  }

  try {
    // Parse YAML
    const content = readFileSync(workspaceFile, 'utf-8');
    const config = parseYaml(content) as { packages?: string[] };

    if (!config.packages || !Array.isArray(config.packages)) {
      diagnostics?.warn(
        'pnpm-workspace.yaml must have a "packages" array',
        'WorkspaceDetector',
        'WORKSPACE_INVALID_YAML'
      );
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
    diagnostics?.warn(
      `Failed to parse pnpm-workspace.yaml: ${error instanceof Error ? error.message : String(error)}`,
      'WorkspaceDetector',
      'WORKSPACE_PARSE_ERROR'
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
 * @param diagnostics - Optional diagnostic collector for warnings
 * @returns WorkspaceInfo if npm/Yarn workspace found, null otherwise
 */
async function detectNpmWorkspace(
  cwd: string,
  diagnostics?: DiagnosticCollector
): Promise<WorkspaceInfo | null> {
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
      diagnostics?.warn(
        'package.json workspaces must be an array or { packages: [...] }',
        'WorkspaceDetector',
        'WORKSPACE_INVALID_FORMAT'
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
    diagnostics?.warn(
      `Failed to parse package.json workspaces: ${error instanceof Error ? error.message : String(error)}`,
      'WorkspaceDetector',
      'WORKSPACE_PARSE_ERROR'
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
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs') as typeof import('fs');
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
