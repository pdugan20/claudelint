// Corresponds to: website/api/recipes.md — "Group-by-Rule Formatter"
import type { Formatter, LintResult } from 'claude-code-lint';

interface Violation {
  file: string;
  line: number;
  message: string;
  severity: string;
}

const byRuleFormatter: Formatter = {
  format(results: LintResult[]): string {
    const byRule = new Map<string, Violation[]>();

    for (const result of results) {
      for (const msg of result.messages) {
        const ruleId = msg.ruleId || 'unknown';
        if (!byRule.has(ruleId)) byRule.set(ruleId, []);
        byRule.get(ruleId)!.push({
          file: result.filePath,
          line: msg.line ?? 0,
          message: msg.message,
          severity: msg.severity,
        });
      }
    }

    let output = '';
    for (const [ruleId, violations] of byRule) {
      output += `${ruleId} (${violations.length} violations)\n`;
      for (const v of violations) {
        output += `  [${v.severity}] ${v.file}:${v.line} - ${v.message}\n`;
      }
      output += '\n';
    }

    return output;
  }
};

export default byRuleFormatter;
