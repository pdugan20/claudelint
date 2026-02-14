import { glob } from 'glob';
import { readFile, stat } from 'fs/promises';
import { join, resolve } from 'path';
import { filterIgnored } from '../config/ignore';

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
  const patterns = ['**/CLAUDE.md', '.claude/rules/**/*.md', '**/CLAUDE.local.md'];

  const allFiles: string[] = [];

  for (const pattern of patterns) {
    const files = await findFiles(pattern, basePath);
    allFiles.push(...files);
  }

  return [...new Set(allFiles)]; // Remove duplicates
}

/**
 * Find skill directories
 */
export async function findSkillDirectories(basePath: string = process.cwd()): Promise<string[]> {
  const patterns = [
    '**/.claude/skills/*/SKILL.md', // Standard + nested monorepo packages
    'skills/*/SKILL.md', // Plugin/root-level skills
    '*/SKILL.md', // Direct --path to skills directory
  ];

  const allFiles: string[] = [];
  for (const pattern of patterns) {
    const files = await findFiles(pattern, basePath);
    allFiles.push(...files);
  }

  const uniqueFiles = [...new Set(allFiles)];
  return uniqueFiles.map((file) => file.replace('/SKILL.md', ''));
}

/**
 * Find agent directories
 */
export async function findAgentDirectories(basePath: string = process.cwd()): Promise<string[]> {
  const patterns = [
    '.claude/agents/*/AGENT.md', // Standard project location
    'agents/*/AGENT.md', // Plugin/root-level agents
    '*/AGENT.md', // Direct --path to agents directory
  ];

  const allFiles: string[] = [];
  for (const pattern of patterns) {
    const files = await findFiles(pattern, basePath);
    allFiles.push(...files);
  }

  const uniqueFiles = [...new Set(allFiles)];
  return uniqueFiles.map((file) => file.replace('/AGENT.md', ''));
}

/**
 * Find output style files
 * Returns paths to .md files in output-styles directories
 */
export async function findOutputStyleFiles(basePath: string = process.cwd()): Promise<string[]> {
  const patterns = [
    '.claude/output-styles/*/*.md', // Standard project location
    'output-styles/*/*.md', // Plugin/root-level output styles
  ];

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
  return findFiles('.claude/lsp.json', basePath);
}

/**
 * Find settings.json files
 */
export async function findSettingsFiles(basePath: string = process.cwd()): Promise<string[]> {
  const patterns = ['.claude/settings.json', '.claude/settings.local.json'];

  const allFiles: string[] = [];

  for (const pattern of patterns) {
    const files = await findFiles(pattern, basePath);
    allFiles.push(...files);
  }

  return allFiles;
}

/**
 * Find hooks.json files
 */
export async function findHooksFiles(basePath: string = process.cwd()): Promise<string[]> {
  return findFiles('.claude/hooks/hooks.json', basePath);
}

/**
 * Find MCP configuration files
 */
export async function findMcpFiles(basePath: string = process.cwd()): Promise<string[]> {
  return findFiles('.mcp.json', basePath);
}

/**
 * Find plugin manifest files
 */
export async function findPluginManifests(basePath: string = process.cwd()): Promise<string[]> {
  // Check for plugin.json at repository root (preferred)
  const rootPlugin = await findFiles('plugin.json', basePath);

  // Also check legacy location for backwards compatibility
  const legacyPlugin = await findFiles('.claude-plugin/plugin.json', basePath);

  return [...rootPlugin, ...legacyPlugin];
}
