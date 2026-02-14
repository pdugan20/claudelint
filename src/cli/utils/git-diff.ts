/**
 * Git diff utilities for VCS-aware file selection
 *
 * Used by --changed and --since flags to filter validation
 * to only files that have been modified.
 */

import { execSync } from 'child_process';

/**
 * Get list of files with uncommitted changes (staged + unstaged + untracked)
 *
 * @returns Array of file paths relative to the git root, or null if not in a git repo
 */
export function getChangedFiles(): string[] | null {
  try {
    // Get modified/staged/untracked files
    const output = execSync(
      'git diff --name-only HEAD 2>/dev/null && git ls-files --others --exclude-standard 2>/dev/null',
      {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      }
    );
    return output
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);
  } catch {
    return null;
  }
}

/**
 * Get list of files changed since a git ref (branch, tag, or commit)
 *
 * @param ref - Git ref to diff against (e.g., 'main', 'v1.0.0', 'HEAD~5')
 * @returns Array of file paths relative to the git root, or null if not in a git repo
 */
export function getFilesSince(ref: string): string[] | null {
  try {
    const output = execSync(`git diff --name-only ${ref}...HEAD`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return output
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);
  } catch {
    return null;
  }
}
