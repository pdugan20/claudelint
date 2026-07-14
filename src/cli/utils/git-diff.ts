/**
 * Git diff utilities for VCS-aware file selection
 *
 * Used by --changed and --since to scope validation to the files that actually moved.
 *
 * Two details matter to callers and are handled here rather than at every call site:
 *
 * 1. Paths are returned ABSOLUTE. `git diff --name-only` prints paths relative to the git
 *    ROOT, while validators discover files relative to the process cwd. Left unreconciled,
 *    the two path spaces never intersect and scoping silently degrades to "match nothing"
 *    the moment claudelint is run from a subdirectory.
 *
 * 2. DELETED paths are excluded (`--diff-filter=d`). A deletion is a change, so git lists
 *    it, but handing a deleted path to a validator would make it report on a file the
 *    change intentionally removed.
 */

import { execSync } from 'child_process';
import { resolve } from 'path';

/** Absolute path of the git root, or null when not in a git repository. */
function gitRoot(): string | null {
  try {
    return execSync('git rev-parse --show-toplevel', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return null;
  }
}

/** Split git output into absolute paths, dropping blanks. */
function toAbsolutePaths(output: string, root: string): string[] {
  return output
    .split('\n')
    .map((f) => f.trim())
    .filter(Boolean)
    .map((f) => resolve(root, f));
}

/**
 * Get files with uncommitted changes (staged + unstaged + untracked)
 *
 * @returns Absolute paths of changed files, or null if not in a git repo
 */
export function getChangedFiles(): string[] | null {
  const root = gitRoot();
  if (root === null) return null;

  try {
    // --diff-filter=d drops deletions. Untracked files are additions by definition.
    const tracked = execSync('git diff --name-only --diff-filter=d HEAD', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const untracked = execSync('git ls-files --others --exclude-standard', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    return [...new Set([...toAbsolutePaths(tracked, root), ...toAbsolutePaths(untracked, root)])];
  } catch {
    return null;
  }
}

/**
 * Get files changed since a git ref (branch, tag, or commit)
 *
 * Uses `ref...HEAD` (three dots) so the diff is taken against the merge base, which is what
 * "changed in this branch" means for a PR -- not "differs from the tip of main".
 *
 * @param ref - Git ref to diff against (e.g., 'main', 'v1.0.0', 'HEAD~5')
 * @returns Absolute paths of changed files, or null if not in a git repo
 */
export function getFilesSince(ref: string): string[] | null {
  const root = gitRoot();
  if (root === null) return null;

  try {
    const output = execSync(`git diff --name-only --diff-filter=d ${ref}...HEAD`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return toAbsolutePaths(output, root);
  } catch {
    return null;
  }
}
