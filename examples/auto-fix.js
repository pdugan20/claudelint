/**
 * ClaudeLint Auto-Fix Example
 *
 * This example demonstrates:
 * - Enabling automatic fixing of violations
 * - Using fix predicate functions for selective fixing
 * - Previewing fixes before applying
 * - Writing fixes to disk
 */

const { ClaudeLint } = require('@pdugan20/claudelint');

async function basicAutoFix() {
  console.log('=== Basic Auto-Fix Example ===\n');

  // Create linter with auto-fix enabled
  const linter = new ClaudeLint({
    fix: true,  // Enable automatic fixing for all fixable violations
    cwd: process.cwd(),
  });

  console.log('Linting with auto-fix enabled...\n');

  const results = await linter.lintFiles([
    '**/*.md',
    '!node_modules/**',
  ]);

  // Count fixes
  let filesWithFixes = 0;
  let totalFixes = 0;

  for (const result of results) {
    const fixCount = result.fixableErrorCount + result.fixableWarningCount;

    if (result.output && result.output !== result.source) {
      filesWithFixes++;
      totalFixes += fixCount;

      console.log(`${result.filePath}:`);
      console.log(`  Applied ${fixCount} fix(es)`);
    }
  }

  console.log(`\nTotal fixes applied: ${totalFixes} in ${filesWithFixes} file(s)`);

  // Write fixes to disk
  if (filesWithFixes > 0) {
    console.log('\nWriting fixes to disk...');
    await ClaudeLint.outputFixes(results);
    console.log('Fixes written successfully!');
  }
}

async function selectiveAutoFix() {
  console.log('\n=== Selective Auto-Fix Example ===\n');

  // Use a predicate function to selectively fix only certain rules
  const linter = new ClaudeLint({
    fix: (message) => {
      // Only fix formatting/style issues, not structural problems
      const formattingRules = [
        'skill-missing-shebang',
        'claude-md-size-warning',
      ];

      return message.ruleId && formattingRules.includes(message.ruleId);
    },
    cwd: process.cwd(),
  });

  console.log('Linting with selective auto-fix...');
  console.log('Only fixing: formatting and style issues\n');

  const results = await linter.lintFiles([
    'skills/**/*.md',
    '!node_modules/**',
  ]);

  let fixedCount = 0;
  let skippedCount = 0;

  for (const result of results) {
    for (const message of result.messages) {
      if (message.fix) {
        if (linter.options.fix(message)) {
          fixedCount++;
        } else {
          skippedCount++;
          console.log(`Skipped fix for: ${message.ruleId} in ${result.filePath}`);
        }
      }
    }
  }

  console.log(`\nFixed: ${fixedCount} violations`);
  console.log(`Skipped: ${skippedCount} violations`);
}

async function previewFixes() {
  console.log('\n=== Preview Fixes Example ===\n');

  const linter = new ClaudeLint({
    fix: true,
    cwd: process.cwd(),
  });

  console.log('Generating fixes (preview mode)...\n');

  const results = await linter.lintFiles([
    'CLAUDE.md',
  ]);

  // Get fixed content without writing to disk
  const fixedContent = ClaudeLint.getFixedContent(results);

  if (fixedContent.size === 0) {
    console.log('No fixes available');
    return;
  }

  console.log('Preview of fixes:\n');

  for (const [filePath, content] of fixedContent) {
    console.log(`File: ${filePath}`);
    console.log(`Fixed content length: ${content.length} characters`);
    console.log('\n--- Fixed Content Preview ---');
    console.log(content.substring(0, 200) + '...');
    console.log('\n--- End Preview ---\n');
  }

  // Ask user before applying (in real scenario)
  console.log('To apply these fixes, use ClaudeLint.outputFixes(results)');
}

async function beforeAfterComparison() {
  console.log('\n=== Before/After Comparison ===\n');

  const linter = new ClaudeLint({
    fix: true,
    cwd: process.cwd(),
  });

  const results = await linter.lintFiles([
    'skills/test-skill/SKILL.md',
  ]);

  for (const result of results) {
    if (!result.output || result.output === result.source) {
      console.log(`${result.filePath}: No fixes needed`);
      continue;
    }

    console.log(`\n${result.filePath}:`);
    console.log(`\nBefore (${result.source.length} chars):`);
    console.log(result.source.substring(0, 150) + '...');

    console.log(`\nAfter (${result.output.length} chars):`);
    console.log(result.output.substring(0, 150) + '...');

    console.log(`\nChanges: ${result.fixableErrorCount + result.fixableWarningCount} fix(es) applied`);
  }
}

// Run all examples
async function main() {
  console.log('ClaudeLint Auto-Fix Examples\n');

  try {
    // Run basic auto-fix
    await basicAutoFix();

    // Run selective auto-fix
    await selectiveAutoFix();

    // Preview fixes before applying
    await previewFixes();

    // Show before/after comparison
    await beforeAfterComparison();

    console.log('\n✓ All auto-fix examples completed');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the example
main();
