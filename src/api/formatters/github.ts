/**
 * GitHub Actions annotation formatter
 *
 * Outputs lint results as GitHub Actions workflow commands
 * for inline PR annotations and the Actions summary tab.
 *
 * @packageDocumentation
 */

import { LintResult, LintMessage, Formatter } from '../types';

/**
 * GitHub Actions annotation formatter
 *
 * Produces one `::error` or `::warning` command per lint issue
 */
export class GitHubFormatter implements Formatter {
  /** Format lint results as GitHub Actions annotation commands */
  format(results: LintResult[]): string {
    const lines: string[] = [];

    for (const result of results) {
      for (const message of result.messages) {
        lines.push(formatAnnotation(result.filePath, message));
      }
    }

    return lines.join('\n');
  }
}

/**
 * Format a single lint message as a GitHub Actions annotation
 */
function formatAnnotation(filePath: string, message: LintMessage): string {
  const severity = message.severity === 'error' ? 'error' : 'warning';
  const params: string[] = [];

  params.push(`file=${escapeProperty(filePath)}`);

  if (message.line) {
    params.push(`line=${message.line}`);
  }

  if (message.column) {
    params.push(`col=${message.column}`);
  }

  const title = message.ruleId || severity;
  params.push(`title=${escapeProperty(title)}`);

  const paramStr = params.length > 0 ? ` ${params.join(',')}` : '';
  const text = escapeData(message.message);

  return `::${severity}${paramStr}::${text}`;
}

/**
 * Escape special characters in annotation property values
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
 */
function escapeData(value: string): string {
  return value.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
}
