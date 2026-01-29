/**
 * Path utility functions for validation rules
 */

import { basename, dirname } from 'path';

/**
 * Gets the parent directory name from a file path
 *
 * Used by name-directory mismatch rules to extract the expected name from path.
 *
 * @param filePath - The file path (e.g., "/path/to/.claude/skills/my-skill/SKILL.md")
 * @returns The parent directory name (e.g., "my-skill")
 *
 * @example
 * getParentDirectoryName('/path/to/.claude/skills/my-skill/SKILL.md')
 * // Returns: 'my-skill'
 *
 * @example
 * getParentDirectoryName('/path/to/.claude/agents/code-reviewer/AGENT.md')
 * // Returns: 'code-reviewer'
 */
export function getParentDirectoryName(filePath: string): string {
  return basename(dirname(filePath));
}
