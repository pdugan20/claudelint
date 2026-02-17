// Corresponds to: website/api/recipes.md — "Markdown Report Formatter"
import type { Formatter, LintResult } from 'claude-code-lint';

const markdownFormatter: Formatter = {
  format(results: LintResult[]): string {
    let output = '# Lint Report\n\n';

    const filesWithIssues = results.filter(
      r => r.errorCount + r.warningCount > 0
    );

    if (filesWithIssues.length === 0) {
      return output + 'No issues found.\n';
    }

    output += `Found issues in ${filesWithIssues.length} file(s):\n\n`;

    for (const result of filesWithIssues) {
      output += `## ${result.filePath}\n\n`;
      output += `- Errors: ${result.errorCount}\n`;
      output += `- Warnings: ${result.warningCount}\n\n`;

      for (const msg of result.messages) {
        const icon = msg.severity === 'error' ? '[ERROR]' : '[WARNING]';
        output += `${icon} **Line ${msg.line}**: ${msg.message}`;
        if (msg.ruleId) output += ` (\`${msg.ruleId}\`)`;
        output += '\n';
      }

      output += '\n';
    }

    return output;
  }
};

export default markdownFormatter;
