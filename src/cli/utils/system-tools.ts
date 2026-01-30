/**
 * System Tools Utility
 *
 * Detects and provides information about optional system binaries.
 * Handles graceful degradation when tools are not installed.
 */

import { execSync } from 'child_process';

/**
 * Check if ShellCheck is available on the system
 *
 * @returns True if shellcheck command is found in PATH
 */
export function isShellCheckAvailable(): boolean {
  try {
    execSync('which shellcheck', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get platform-specific installation instructions for ShellCheck
 *
 * @returns Install command or URL for the current platform
 */
export function getShellCheckInstallMessage(): string {
  const platform = process.platform;
  if (platform === 'darwin') {
    return 'Install: brew install shellcheck';
  } else if (platform === 'linux') {
    return 'Install: apt install shellcheck (or snap install shellcheck)';
  } else if (platform === 'win32') {
    return 'Install: scoop install shellcheck (or download from GitHub)';
  }
  return 'Install: https://github.com/koalaman/shellcheck#installing';
}

/**
 * Get the version of ShellCheck if installed
 *
 * @returns Version string or null if not installed
 */
export function getShellCheckVersion(): string | null {
  if (!isShellCheckAvailable()) {
    return null;
  }
  try {
    const output = execSync('shellcheck --version', { encoding: 'utf-8' });
    const match = output.match(/version: ([0-9.]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
