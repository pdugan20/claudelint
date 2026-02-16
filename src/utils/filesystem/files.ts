import { glob } from 'glob';
import { readFile, stat } from 'fs/promises';
import { join, resolve } from 'path';
import { filterIgnored } from '../config/ignore';
import {
  CLAUDE_MD_PATTERNS,
  SKILL_PATTERNS,
  AGENT_PATTERNS,
  OUTPUT_STYLE_PATTERNS,
  SETTINGS_PATTERNS,
  HOOKS_PATTERNS,
  LSP_PATTERNS,
  PLUGIN_PATTERNS,
  FORMATTABLE_MARKDOWN,
  FORMATTABLE_JSON,
  FORMATTABLE_YAML,
  FORMATTABLE_SHELL,
} from './patterns';

/**
 * Find files matching a glob pattern
 */
export async function findFiles(pattern: string, cwd: string = process.cwd()): Promise<string[]> {
  // Glob with only perf defaults (skip obvious large dirs).
  // Full .gitignore-style filtering (including .claudelintignore) is
  // handled by node-ignore in the post-filter step below.
  const files = await glob(pattern, {
    cwd,
    absolute: true,
    nodir: true,
    dot: true,
    ignore: ['node_modules/**', '.git/**'],
  });

  // Post-filter through node-ignore for full .gitignore spec compliance
  return filterIgnored(files, cwd);
}

/**
 * Read file contents as string
 */
export async function readFileContent(filePath: string): Promise<string> {
  return readFile(filePath, 'utf-8');
}

/**
 * Get file size in bytes
 */
export async function getFileSize(filePath: string): Promise<number> {
  const stats = await stat(filePath);
  return stats.size;
}

/**
 * Check if file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a directory exists
 */
export async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Resolve path relative to base directory
 */
export function resolvePath(basePath: string, relativePath: string): string {
  return resolve(join(basePath, relativePath));
}

/**
 * Find CLAUDE.md files in standard locations
 */
export async function findClaudeMdFiles(basePath: string = process.cwd()): Promise<string[]> {
  const allFiles: string[] = [];

  for (const pattern of CLAUDE_MD_PATTERNS) {
    const files = await findFiles(pattern, basePath);
    allFiles.push(...files);
  }

  return [...new Set(allFiles)]; // Remove duplicates
}

/**
 * Find skill directories
 */
export async function findSkillDirectories(basePath: string = process.cwd()): Promise<string[]> {
  const allFiles: string[] = [];
  for (const pattern of SKILL_PATTERNS) {
    const files = await findFiles(pattern, basePath);
    allFiles.push(...files);
  }

  const uniqueFiles = [...new Set(allFiles)];
  return uniqueFiles.map((file) => file.replace('/SKILL.md', ''));
}

/**
 * Find agent files (flat .md files in agents/ directories)
 */
export async function findAgentFiles(basePath: string = process.cwd()): Promise<string[]> {
  const allFiles: string[] = [];
  for (const pattern of AGENT_PATTERNS) {
    const files = await findFiles(pattern, basePath);
    allFiles.push(...files);
  }

  return [...new Set(allFiles)];
}

/**
 * Find output style files
 * Returns paths to .md files in output-styles directories
 */
export async function findOutputStyleFiles(basePath: string = process.cwd()): Promise<string[]> {
  const patterns: string[] = [...OUTPUT_STYLE_PATTERNS];

  // When --path points directly at an output-styles directory, match one level deep
  if (basePath.endsWith('output-styles') || basePath.endsWith('output-styles/')) {
    patterns.push('*/*.md');
  }

  const allFiles: string[] = [];
  for (const pattern of patterns) {
    const files = await findFiles(pattern, basePath);
    allFiles.push(...files);
  }

  return [...new Set(allFiles)];
}

/**
 * Find LSP configuration files
 */
export async function findLspFiles(basePath: string = process.cwd()): Promise<string[]> {
  const allFiles: string[] = [];
  for (const pattern of LSP_PATTERNS) {
    const files = await findFiles(pattern, basePath);
    allFiles.push(...files);
  }
  return allFiles;
}

/**
 * Find settings.json files
 */
export async function findSettingsFiles(basePath: string = process.cwd()): Promise<string[]> {
  const allFiles: string[] = [];

  for (const pattern of SETTINGS_PATTERNS) {
    const files = await findFiles(pattern, basePath);
    allFiles.push(...files);
  }

  return allFiles;
}

/**
 * Find hooks.json files
 */
export async function findHooksFiles(basePath: string = process.cwd()): Promise<string[]> {
  const allFiles: string[] = [];
  for (const pattern of HOOKS_PATTERNS) {
    const files = await findFiles(pattern, basePath);
    allFiles.push(...files);
  }
  return allFiles;
}

/**
 * Find MCP configuration files
 */
export async function findMcpFiles(basePath: string = process.cwd()): Promise<string[]> {
  const allFiles: string[] = [];
  for (const pattern of ['**/.mcp.json'] as const) {
    const files = await findFiles(pattern, basePath);
    allFiles.push(...files);
  }
  return allFiles;
}

/**
 * Find plugin manifest files
 */
export async function findPluginManifests(basePath: string = process.cwd()): Promise<string[]> {
  const allFiles: string[] = [];
  for (const pattern of PLUGIN_PATTERNS) {
    const files = await findFiles(pattern, basePath);
    allFiles.push(...files);
  }
  return allFiles;
}

/**
 * Find all formattable files, categorized by type.
 * Used by the format command to discover which files to process.
 */
export async function findAllFormattableFiles(
  basePath: string = process.cwd()
): Promise<{ markdown: string[]; json: string[]; yaml: string[]; shell: string[] }> {
  const resolve = async (patterns: readonly string[]) => {
    const all: string[] = [];
    for (const pattern of patterns) {
      const files = await findFiles(pattern, basePath);
      all.push(...files);
    }
    return [...new Set(all)];
  };

  const [markdown, json, yaml, shell] = await Promise.all([
    resolve(FORMATTABLE_MARKDOWN),
    resolve(FORMATTABLE_JSON),
    resolve(FORMATTABLE_YAML),
    resolve(FORMATTABLE_SHELL),
  ]);

  return { markdown, json, yaml, shell };
}
