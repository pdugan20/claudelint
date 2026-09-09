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

/**
 * Gets the style name Claude Code will use for an output style file.
 *
 * Output styles are flat files whose filename is the style name, so the name comes from the
 * filename. Files one level deeper (a directory-per-style layout) take the name from the
 * containing directory instead.
 *
 * @param filePath - Path to an output style markdown file
 * @returns The style name implied by the path
 *
 * @example
 * getOutputStyleName('/path/to/.claude/output-styles/concise.md')
 * // Returns: 'concise'
 *
 * @example
 * getOutputStyleName('/path/to/.claude/output-styles/concise/style.md')
 * // Returns: 'concise'
 */
export function getOutputStyleName(filePath: string): string {
  return isFlatOutputStyle(filePath) ? basename(filePath, '.md') : getParentDirectoryName(filePath);
}

/**
 * Reports whether an output style file uses the flat, documented layout.
 *
 * @param filePath - Path to an output style markdown file
 * @returns True when the file sits directly in an `output-styles` directory
 */
export function isFlatOutputStyle(filePath: string): boolean {
  return getParentDirectoryName(filePath) === 'output-styles';
}
