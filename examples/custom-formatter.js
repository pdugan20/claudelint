/**
 * ClaudeLint Custom Formatter Example
 *
 * This example demonstrates:
 * - Creating custom formatters
 * - Loading and using custom formatters
 * - Different formatter styles (summary, detailed, grouped)
 * - Exporting to various formats (markdown, CSV, HTML)
 */

const { ClaudeLint } = require('@pdugan20/claudelint');
const { writeFileSync } = require('fs');

// Custom formatter: Summary
const summaryFormatter = {
  format(results) {
    const totalErrors = results.reduce((sum, r) => sum + r.errorCount, 0);
    const totalWarnings = results.reduce((sum, r) => sum + r.warningCount, 0);
    const filesWithIssues = results.filter(r => r.errorCount + r.warningCount > 0).length;

    return `
======================
Validation Summary
======================
Files checked:      ${results.length}
Files with issues:  ${filesWithIssues}
Total errors:       ${totalErrors}
Total warnings:     ${totalWarnings}
Status:             ${totalErrors > 0 ? 'FAILED' : 'PASSED'}
    `.trim();
  }
};

// Custom formatter: Grouped by rule
const groupedByRuleFormatter = {
  format(results) {
    const byRule = new Map();

    for (const result of results) {
      for (const msg of result.messages) {
        const ruleId = msg.ruleId || 'unknown';
        if (!byRule.has(ruleId)) {
          byRule.set(ruleId, []);
        }
        byRule.get(ruleId).push({
          file: result.filePath,
          line: msg.line,
          message: msg.message,
          severity: msg.severity,
        });
      }
    }

    let output = 'Issues Grouped by Rule\n';
    output += '======================\n\n';

    if (byRule.size === 0) {
      return output + 'No issues found.\n';
    }

    for (const [ruleId, violations] of byRule) {
      output += `\n${ruleId} (${violations.length} violation${violations.length > 1 ? 's' : ''})\n`;
      output += '-'.repeat(ruleId.length + 20) + '\n';

      for (const v of violations) {
        const location = v.line ? `:${v.line}` : '';
        output += `  [${v.severity.toUpperCase()}] ${v.file}${location}\n`;
        output += `    ${v.message}\n`;
      }
    }

    return output;
  }
};

// Custom formatter: Markdown report
const markdownFormatter = {
  format(results) {
    let output = '# Lint Report\n\n';

    const totalErrors = results.reduce((sum, r) => sum + r.errorCount, 0);
    const totalWarnings = results.reduce((sum, r) => sum + r.warningCount, 0);

    output += '## Summary\n\n';
    output += `- Files checked: ${results.length}\n`;
    output += `- Total errors: ${totalErrors}\n`;
    output += `- Total warnings: ${totalWarnings}\n\n`;

    const filesWithIssues = results.filter(r => r.errorCount + r.warningCount > 0);

    if (filesWithIssues.length === 0) {
      output += 'No issues found.\n';
      return output;
    }

    output += '## Issues by File\n\n';

    for (const result of filesWithIssues) {
      output += `### ${result.filePath}\n\n`;
      output += `- Errors: ${result.errorCount}\n`;
      output += `- Warnings: ${result.warningCount}\n\n`;

      if (result.messages.length > 0) {
        output += '#### Details\n\n';

        for (const msg of result.messages) {
          const icon = msg.severity === 'error' ? '[ERROR]' : '[WARNING]';
          const location = msg.line ? ` (line ${msg.line})` : '';

          output += `${icon} **${msg.severity.toUpperCase()}**${location}: ${msg.message}\n`;

          if (msg.ruleId) {
            output += `  - Rule: \`${msg.ruleId}\`\n`;
          }

          if (msg.explanation) {
            output += `  - Why: ${msg.explanation}\n`;
          }

          output += '\n';
        }
      }
    }

    return output;
  }
};

// Custom formatter: CSV export
const csvFormatter = {
  format(results) {
    let csv = 'File,Line,Severity,Rule,Message\n';

    for (const result of results) {
      for (const msg of result.messages) {
        const row = [
          result.filePath,
          msg.line || '',
          msg.severity || '',
          msg.ruleId || '',
          `"${(msg.message || '').replace(/"/g, '""')}"`,
        ].join(',');

        csv += row + '\n';
      }
    }

    return csv || 'File,Line,Severity,Rule,Message\n';
  }
};

// Custom formatter: HTML report
const htmlFormatter = {
  format(results) {
    const totalErrors = results.reduce((sum, r) => sum + r.errorCount, 0);
    const totalWarnings = results.reduce((sum, r) => sum + r.warningCount, 0);

    let html = `
<!DOCTYPE html>
<html>
<head>
  <title>ClaudeLint Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 20px;
      background: #f5f5f5;
    }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; }
    h1 { color: #333; border-bottom: 3px solid #007acc; padding-bottom: 10px; }
    .summary {
      background: #e8f4f8;
      padding: 20px;
      border-radius: 5px;
      margin: 20px 0;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
    }
    .summary-item { text-align: center; }
    .summary-value { font-size: 32px; font-weight: bold; }
    .summary-label { color: #666; font-size: 14px; }
    .error-value { color: #d32f2f; }
    .warning-value { color: #f57c00; }
    .file { margin: 20px 0; border-left: 4px solid #ccc; padding-left: 15px; }
    .file-name { font-size: 18px; font-weight: bold; color: #007acc; }
    .message {
      margin: 10px 0;
      padding: 10px;
      background: #f9f9f9;
      border-radius: 3px;
    }
    .error { border-left: 3px solid #d32f2f; }
    .warning { border-left: 3px solid #f57c00; }
    .severity { font-weight: bold; text-transform: uppercase; }
    .severity.error { color: #d32f2f; }
    .severity.warning { color: #f57c00; }
    .rule-id { color: #666; font-size: 12px; font-family: monospace; }
  </style>
</head>
<body>
  <div class="container">
    <h1>ClaudeLint Report</h1>
    <div class="summary">
      <div class="summary-item">
        <div class="summary-value">${results.length}</div>
        <div class="summary-label">Files Checked</div>
      </div>
      <div class="summary-item">
        <div class="summary-value error-value">${totalErrors}</div>
        <div class="summary-label">Errors</div>
      </div>
      <div class="summary-item">
        <div class="summary-value warning-value">${totalWarnings}</div>
        <div class="summary-label">Warnings</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${totalErrors === 0 ? '✓' : '✗'}</div>
        <div class="summary-label">Status</div>
      </div>
    </div>
`;

    const filesWithIssues = results.filter(r => r.messages.length > 0);

    if (filesWithIssues.length === 0) {
      html += '    <p style="text-align:center; color:#4caf50; font-size:18px;">No issues found!</p>\n';
    } else {
      for (const result of filesWithIssues) {
        html += `    <div class="file">\n`;
        html += `      <div class="file-name">${result.filePath}</div>\n`;
        html += `      <div style="margin-top:10px; color:#666;">${result.errorCount} error(s), ${result.warningCount} warning(s)</div>\n`;

        for (const msg of result.messages) {
          const cssClass = msg.severity;
          const location = msg.line ? ` (line ${msg.line})` : '';

          html += `      <div class="message ${cssClass}">\n`;
          html += `        <span class="severity ${cssClass}">${msg.severity}</span>${location}: ${msg.message}\n`;

          if (msg.ruleId) {
            html += `        <div class="rule-id">${msg.ruleId}</div>\n`;
          }

          html += `      </div>\n`;
        }

        html += `    </div>\n`;
      }
    }

    html += `
  </div>
</body>
</html>
`;

    return html;
  }
};

async function main() {
  console.log('ClaudeLint Custom Formatter Examples\n');

  const linter = new ClaudeLint({
    cwd: process.cwd(),
  });

  console.log('Linting files...\n');

  const results = await linter.lintFiles([
    '**/*.md',
    '!node_modules/**',
    '!dist/**',
  ]);

  console.log('=== Built-in Stylish Formatter ===\n');

  const stylish = await linter.loadFormatter('stylish');
  console.log(stylish.format(results));

  console.log('\n=== Custom Summary Formatter ===\n');
  console.log(summaryFormatter.format(results));

  console.log('\n=== Custom Grouped by Rule Formatter ===\n');
  console.log(groupedByRuleFormatter.format(results));

  // Export to files
  console.log('\n=== Exporting Reports ===\n');

  console.log('Generating markdown report...');
  const markdown = markdownFormatter.format(results);
  writeFileSync('lint-report.md', markdown);
  console.log('  ✓ Saved to lint-report.md');

  console.log('Generating CSV export...');
  const csv = csvFormatter.format(results);
  writeFileSync('lint-report.csv', csv);
  console.log('  ✓ Saved to lint-report.csv');

  console.log('Generating HTML report...');
  const html = htmlFormatter.format(results);
  writeFileSync('lint-report.html', html);
  console.log('  ✓ Saved to lint-report.html');

  console.log('\n✓ All formatter examples completed');
  console.log('\nGenerated files:');
  console.log('  - lint-report.md   (Markdown)');
  console.log('  - lint-report.csv  (CSV)');
  console.log('  - lint-report.html (HTML)');
}

// Run the example
main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
