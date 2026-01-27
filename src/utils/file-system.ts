import { glob } from 'glob';
import { readFile, stat } from 'fs/promises';
import { join, resolve } from 'path';

/**
 * Find files matching a glob pattern
 */
export async function findFiles(pattern: string, cwd: string = process.cwd()): Promise<string[]> {
  const files = await glob(pattern, {
    cwd,
    absolute: true,
    nodir: true,
    dot: true,
    ignore: ['node_modules/**', '.git/**', 'dist/**', 'coverage/**'],
  });

  return files;
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
 * Resolve path relative to base directory
 */
export function resolvePath(basePath: string, relativePath: string): string {
  return resolve(join(basePath, relativePath));
}

/**
 * Find CLAUDE.md files in standard locations
 */
export async function findClaudeMdFiles(basePath: string = process.cwd()): Promise<string[]> {
  const patterns = [
    'CLAUDE.md',
    '.claude/CLAUDE.md',
    '.claude/rules/**/*.md',
    'CLAUDE.local.md',
  ];

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
  const skillFiles = await findFiles('.claude/skills/*/SKILL.md', basePath);
  return skillFiles.map((file) => file.replace('/SKILL.md', ''));
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
  return findFiles('.claude-plugin/plugin.json', basePath);
}
