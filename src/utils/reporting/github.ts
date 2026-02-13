/**
 * GitHub Actions Annotation Formatter
 *
 * Outputs validation results as GitHub Actions workflow commands
 * that produce inline annotations on PRs and the Actions summary tab.
 *
 * Format: ::severity file=PATH,line=N,col=N,title=RULE_ID::MESSAGE
 *
 * @see https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/workflow-commands-for-github-actions#setting-a-warning-message
 */

import {
  ValidationError,
  ValidationWarning,
  ValidationResult,
} from '../../validators/file-validator';

/**
 * Convert validation results to GitHub Actions annotation format
 *
 * @param results - Array of validator results with names
 * @returns One annotation command per line
 */
export function toGitHub(results: Array<{ validator: string; result: ValidationResult }>): string {
  const lines: string[] = [];

  for (const { result } of results) {
    for (const error of result.errors) {
      lines.push(formatAnnotation(error, 'error'));
    }

    for (const warning of result.warnings) {
      lines.push(formatAnnotation(warning, 'warning'));
    }
  }

  return lines.join('\n');
}

/**
 * Format a single issue as a GitHub Actions annotation command
 */
function formatAnnotation(
  issue: ValidationError | ValidationWarning,
  severity: 'error' | 'warning'
): string {
  const params: string[] = [];

  if (issue.file) {
    params.push(`file=${escapeProperty(normalizeFilePath(issue.file))}`);
  }

  if (issue.line) {
    params.push(`line=${issue.line}`);
  }

  const title = issue.ruleId || severity;
  params.push(`title=${escapeProperty(title)}`);

  const paramStr = params.length > 0 ? ` ${params.join(',')}` : '';
  const message = escapeData(issue.message);

  return `::${severity}${paramStr}::${message}`;
}

/**
 * Normalize file path to relative (from cwd)
 */
function normalizeFilePath(filePath: string): string {
  const cwd = process.cwd();
  if (filePath.startsWith(cwd)) {
    return filePath.slice(cwd.length + 1);
  }
  return filePath;
}

/**
 * Escape special characters in annotation property values
 * @see https://github.com/actions/toolkit/blob/main/packages/core/src/command.ts
 */
function escapeProperty(value: string): string {
  return value
    .replace(/%/g, '%25')
    .replace(/\r/g, '%0D')
    .replace(/\n/g, '%0A')
    .replace(/:/g, '%3A')
    .replace(/,/g, '%2C');
}

/**
 * Escape special characters in annotation message data
 * @see https://github.com/actions/toolkit/blob/main/packages/core/src/command.ts
 */
function escapeData(value: string): string {
  return value.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
}
