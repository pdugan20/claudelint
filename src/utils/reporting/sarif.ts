/**
 * SARIF (Static Analysis Results Interchange Format) Formatter
 *
 * Outputs validation results in SARIF v2.1.0 format for:
 * - GitHub Code Scanning (inline PR annotations)
 * - VS Code SARIF Viewer
 * - Other SARIF-compatible tools
 *
 * @see https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html
 */

import {
  ValidationError,
  ValidationWarning,
  ValidationResult,
} from '../../validators/file-validator';

/**
 * SARIF severity levels
 */
type SarifLevel = 'error' | 'warning' | 'note' | 'none';

/**
 * Minimal SARIF types for output generation
 */
interface SarifResult {
  ruleId: string;
  level: SarifLevel;
  message: { text: string };
  locations?: Array<{
    physicalLocation: {
      artifactLocation: { uri: string };
      region?: { startLine: number };
    };
  }>;
}

interface SarifRule {
  id: string;
  shortDescription?: { text: string };
  helpUri?: string;
  defaultConfiguration?: { level: SarifLevel };
}

interface SarifRun {
  tool: {
    driver: {
      name: string;
      version: string;
      informationUri: string;
      rules: SarifRule[];
    };
  };
  results: SarifResult[];
}

interface SarifLog {
  $schema: string;
  version: string;
  runs: SarifRun[];
}

/**
 * Convert validation results to SARIF format
 *
 * @param results - Array of validator results with names
 * @param version - claudelint version string
 * @returns SARIF JSON string
 */
export function toSarif(
  results: Array<{ validator: string; result: ValidationResult }>,
  version: string = '0.0.0'
): string {
  const ruleMap = new Map<string, SarifRule>();
  const sarifResults: SarifResult[] = [];

  for (const { result } of results) {
    // Process errors
    for (const error of result.errors) {
      const ruleId = error.ruleId || 'unknown';
      ensureRule(ruleMap, ruleId, 'error');
      sarifResults.push(issueToResult(error, 'error'));
    }

    // Process warnings
    for (const warning of result.warnings) {
      const ruleId = warning.ruleId || 'unknown';
      ensureRule(ruleMap, ruleId, 'warning');
      sarifResults.push(issueToResult(warning, 'warning'));
    }
  }

  const sarif: SarifLog = {
    $schema:
      'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/main/sarif-2.1/schema/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'claudelint',
            version,
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

/**
 * Ensure a rule exists in the rule map
 */
function ensureRule(ruleMap: Map<string, SarifRule>, ruleId: string, level: SarifLevel): void {
  if (!ruleMap.has(ruleId)) {
    ruleMap.set(ruleId, {
      id: ruleId,
      defaultConfiguration: { level },
    });
  }
}

/**
 * Convert a validation error or warning to a SARIF result
 */
function issueToResult(issue: ValidationError | ValidationWarning, level: SarifLevel): SarifResult {
  const result: SarifResult = {
    ruleId: issue.ruleId || 'unknown',
    level,
    message: { text: issue.message },
  };

  if (issue.file) {
    result.locations = [
      {
        physicalLocation: {
          artifactLocation: { uri: normalizeUri(issue.file) },
          ...(issue.line ? { region: { startLine: issue.line } } : {}),
        },
      },
    ];
  }

  return result;
}

/**
 * Normalize file path to a relative URI for SARIF
 */
function normalizeUri(filePath: string): string {
  // Convert absolute paths to relative (from cwd)
  const cwd = process.cwd();
  if (filePath.startsWith(cwd)) {
    return filePath.slice(cwd.length + 1);
  }
  return filePath;
}
