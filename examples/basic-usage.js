/**
 * Basic ClaudeLint Programmatic API Usage
 *
 * This example demonstrates:
 * - Creating a ClaudeLint instance
 * - Linting files with glob patterns
 * - Formatting and displaying results
 * - Checking for errors and warnings
 */

const { ClaudeLint } = require('claudelint');

async function main() {
  console.log('ClaudeLint Basic Usage Example\n');

  // Create a new linter instance with default options
  const linter = new ClaudeLint({
    cwd: process.cwd(),
  });

  console.log('Linting files...\n');

  // Lint all Markdown files in the project
  // Exclude node_modules and other common directories
  const results = await linter.lintFiles([
    '**/*.md',
    '!node_modules/**',
    '!dist/**',
  ]);

  console.log(`Linted ${results.length} files\n`);

  // Display results for each file
  for (const result of results) {
    const totalIssues = result.errorCount + result.warningCount;

    if (totalIssues === 0) {
      console.log(`✓ ${result.filePath} - No issues`);
    } else {
      console.log(`\n${result.filePath}:`);
      console.log(`  Errors: ${result.errorCount}`);
      console.log(`  Warnings: ${result.warningCount}`);

      // Display individual messages
      for (const message of result.messages) {
        const severity = message.severity === 'error' ? 'ERROR' : 'WARN';
        const location = message.line ? `:${message.line}` : '';

        console.log(`    [${severity}]${location} ${message.message}`);

        if (message.ruleId) {
          console.log(`      Rule: ${message.ruleId}`);
        }
      }
    }
  }

  // Use the built-in stylish formatter for better output
  console.log('\n--- Formatted Output ---\n');

  const formatter = await linter.loadFormatter('stylish');
  const output = formatter.format(results);
  console.log(output);

  // Calculate summary statistics
  const totalErrors = results.reduce((sum, r) => sum + r.errorCount, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warningCount, 0);
  const filesWithIssues = results.filter(r => r.errorCount + r.warningCount > 0).length;

  console.log('\n--- Summary ---\n');
  console.log(`Files checked: ${results.length}`);
  console.log(`Files with issues: ${filesWithIssues}`);
  console.log(`Total errors: ${totalErrors}`);
  console.log(`Total warnings: ${totalWarnings}`);

  // Exit with error code if errors found (useful for CI/CD)
  if (totalErrors > 0) {
    console.log('\nValidation failed with errors');
    process.exit(1);
  }

  console.log('\nValidation passed!');
}

// Run the example
main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
