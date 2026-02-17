/**
 * SARIF (Static Analysis Results Interchange Format) formatter
 *
 * Outputs lint results in SARIF v2.1.0 format for integration with
 * GitHub Code Scanning, VS Code SARIF Viewer, and other SARIF tools.
 *
 * @packageDocumentation
 * @see https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html
 */

import { LintResult, LintMessage, Formatter } from '../types';

interface SarifRule {
  id: string;
  shortDescription?: { text: string };
  defaultConfiguration?: { level: 'error' | 'warning' | 'note' | 'none' };
}

interface SarifResult {
  ruleId: string;
  level: 'error' | 'warning' | 'note' | 'none';
  message: { text: string };
  locations?: Array<{
    physicalLocation: {
      artifactLocation: { uri: string };
      region?: { startLine: number; startColumn?: number };
    };
  }>;
}

/**
 * SARIF v2.1.0 formatter for the programmatic API
 */
export class SarifFormatter implements Formatter {
  /** Format lint results as SARIF v2.1.0 JSON */
  format(results: LintResult[]): string {
    const ruleMap = new Map<string, SarifRule>();
    const sarifResults: SarifResult[] = [];

    for (const result of results) {
      for (const message of result.messages) {
        const ruleId = message.ruleId || 'unknown';
        if (!ruleMap.has(ruleId)) {
          ruleMap.set(ruleId, {
            id: ruleId,
            defaultConfiguration: {
              level: message.severity === 'error' ? 'error' : 'warning',
            },
          });
        }
        sarifResults.push(messageToResult(result.filePath, message));
      }
    }

    const sarif = {
      $schema:
        'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/main/sarif-2.1/schema/sarif-schema-2.1.0.json',
      version: '2.1.0',
      runs: [
        {
          tool: {
            driver: {
              name: 'claudelint',
              informationUri: 'https://www.npmjs.com/package/claude-code-lint',
              rules: Array.from(ruleMap.values()),
            },
          },
          results: sarifResults,
        },
      ],
    };

    return JSON.stringify(sarif, null, 2);
  }
}

function messageToResult(filePath: string, message: LintMessage): SarifResult {
  const result: SarifResult = {
    ruleId: message.ruleId || 'unknown',
    level: message.severity === 'error' ? 'error' : 'warning',
    message: { text: message.message },
  };

  const cwd = process.cwd();
  const uri = filePath.startsWith(cwd) ? filePath.slice(cwd.length + 1) : filePath;

  const region: { startLine: number; startColumn?: number } | undefined = message.line
    ? { startLine: message.line, ...(message.column ? { startColumn: message.column } : {}) }
    : undefined;

  result.locations = [
    {
      physicalLocation: {
        artifactLocation: { uri },
        ...(region ? { region } : {}),
      },
    },
  ];

  return result;
}
