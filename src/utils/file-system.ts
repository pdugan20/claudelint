import { glob } from 'glob';
import { readFile, stat } from 'fs/promises';
import { join, resolve } from 'path';
import { loadIgnorePatterns } from './ignore';

/**
 * Find files matching a glob pattern
 */
export async function findFiles(pattern: string, cwd: string = process.cwd()): Promise<string[]> {
  // Load ignore patterns from .claudelintignore
  const customIgnores = loadIgnorePatterns(cwd);

  // Combine with default ignores
  const defaultIgnores = ['node_modules/**', '.git/**', 'dist/**', 'coverage/**'];
  const allIgnores = [...defaultIgnores, ...customIgnores];

  const files = await glob(pattern, {
    cwd,
    absolute: true,
    nodir: true,
    dot: true,
    ignore: allIgnores,
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
  const patterns = ['CLAUDE.md', '.claude/CLAUDE.md', '.claude/rules/**/*.md', 'CLAUDE.local.md'];

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
 * Find agent directories
 */
export async function findAgentDirectories(basePath: string = process.cwd()): Promise<string[]> {
  const agentFiles = await findFiles('.claude/agents/*/AGENT.md', basePath);
  return agentFiles.map((file) => file.replace('/AGENT.md', ''));
}

/**
 * Find output style directories
 */
export async function findOutputStyleDirectories(
  basePath: string = process.cwd()
): Promise<string[]> {
  const outputStyleFiles = await findFiles('.claude/output_styles/*/OUTPUT_STYLE.md', basePath);
  return outputStyleFiles.map((file) => file.replace('/OUTPUT_STYLE.md', ''));
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
