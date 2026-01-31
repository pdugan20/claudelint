/**
 * ClaudeLint Build Pipeline Integration Example
 *
 * This example demonstrates:
 * - Integrating ClaudeLint into build pipelines
 * - CI/CD usage patterns
 * - Proper exit codes
 * - Progress reporting
 * - Multiple output formats for different consumers
 */

const { ClaudeLint } = require('@pdugan20/claudelint');
const { writeFileSync } = require('fs');
const { join } = require('path');

/**
 * Simple build integration
 * Basic pattern for npm scripts or simple builds
 */
async function simpleBuildIntegration() {
  console.log('=== Simple Build Integration ===\n');

  const linter = new ClaudeLint({
    cwd: process.cwd(),
  });

  try {
    const results = await linter.lintFiles(['**/*.md', '!node_modules/**']);

    // Format and display results
    const formatter = await linter.loadFormatter('stylish');
    const output = formatter.format(results);

    if (output) {
      console.log(output);
    }

    // Exit with error code if problems found
    const hasErrors = results.some(r => r.errorCount > 0);

    if (hasErrors) {
      console.error('\nValidation failed: errors found');
      process.exit(1);
    }

    console.log('\nValidation passed!');
    process.exit(0);
  } catch (error) {
    console.error('Error during validation:', error.message);
    process.exit(1);
  }
}

/**
 * CI/CD integration with detailed reporting
 * Suitable for Jenkins, GitLab CI, GitHub Actions, etc.
 */
async function cicdIntegration() {
  console.log('=== CI/CD Integration ===\n');

  const linter = new ClaudeLint({
    cwd: process.cwd(),

    // Report progress for CI logs
    onStart: (fileCount) => {
      console.log(`Starting validation of ${fileCount} files`);
    },

    onProgress: (file, index, total) => {
      const percent = Math.round(((index + 1) / total) * 100);
      console.log(`[${percent}%] Validating ${file}`);
    },

    onComplete: (results) => {
      const errors = results.reduce((sum, r) => sum + r.errorCount, 0);
      const warnings = results.reduce((sum, r) => sum + r.warningCount, 0);
      console.log(`\nCompleted: ${errors} errors, ${warnings} warnings`);
    },
  });

  try {
    const results = await linter.lintFiles(['**/*.md', '!node_modules/**']);

    // Generate multiple report formats for CI artifacts

    // Human-readable output for CI logs
    console.log('\n--- Validation Results ---\n');
    const stylish = await linter.loadFormatter('stylish');
    console.log(stylish.format(results));

    // JSON output for programmatic processing
    const jsonFormatter = await linter.loadFormatter('json');
    const jsonOutput = jsonFormatter.format(results);
    writeFileSync('lint-report.json', jsonOutput);
    console.log('✓ JSON report saved to lint-report.json');

    // JUnit XML for test reporting integration
    const junitFormatter = await linter.loadFormatter('junit');
    const junitOutput = junitFormatter.format(results);
    writeFileSync('lint-report.xml', junitOutput);
    console.log('✓ JUnit report saved to lint-report.xml');

    // Check for errors
    const hasErrors = results.some(r => r.errorCount > 0);
    const hasWarnings = results.some(r => r.warningCount > 0);

    // Set environment variable for subsequent build steps
    if (process.env.CI) {
      if (hasErrors) {
        console.log('::set-output name=status::failed');
        console.log('::set-output name=has-errors::true');
      } else if (hasWarnings) {
        console.log('::set-output name=status::warning');
        console.log('::set-output name=has-errors::false');
      } else {
        console.log('::set-output name=status::passed');
        console.log('::set-output name=has-errors::false');
      }
    }

    // Exit with appropriate code
    if (hasErrors) {
      console.error('\n[ERROR] Build failed: validation errors found');
      process.exit(1);
    }

    if (hasWarnings) {
      console.warn('\n[WARNING] Build succeeded with warnings');
    } else {
      console.log('\n[SUCCESS] Build passed: no issues found');
    }

    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Build failed with error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

/**
 * Pre-commit hook integration
 * Validate only staged files
 */
async function preCommitIntegration() {
  console.log('=== Pre-commit Hook Integration ===\n');

  const { execSync } = require('child_process');

  // Get staged .md files
  let stagedFiles;
  try {
    stagedFiles = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf-8',
    })
      .split('\n')
      .filter(f => f.endsWith('.md') && f.length > 0);
  } catch (error) {
    console.error('Error getting staged files:', error.message);
    process.exit(1);
  }

  if (stagedFiles.length === 0) {
    console.log('No .md files staged for commit');
    process.exit(0);
  }

  console.log(`Validating ${stagedFiles.length} staged file(s):\n`);
  stagedFiles.forEach(f => console.log(`  - ${f}`));
  console.log('');

  const linter = new ClaudeLint({
    cwd: process.cwd(),
  });

  try {
    const results = await linter.lintFiles(stagedFiles, {
      errorOnUnmatchedPattern: false,
    });

    // Use compact formatter for pre-commit (easier to read)
    const formatter = await linter.loadFormatter('compact');
    const output = formatter.format(results);

    if (output) {
      console.log(output);
    }

    const hasErrors = results.some(r => r.errorCount > 0);

    if (hasErrors) {
      console.error('\n[ERROR] Commit blocked: fix validation errors first');
      console.error('   Run "npm run lint:fix" to auto-fix issues');
      process.exit(1);
    }

    console.log('[SUCCESS] Validation passed');
    process.exit(0);
  } catch (error) {
    console.error('Error during validation:', error.message);
    process.exit(1);
  }
}

/**
 * Watch mode integration
 * Continuously validate files as they change
 */
async function watchModeIntegration() {
  console.log('=== Watch Mode Integration ===\n');

  const chokidar = require('chokidar');

  const linter = new ClaudeLint({
    cwd: process.cwd(),
  });

  let validating = false;

  async function validateFile(filePath) {
    if (validating) return;

    validating = true;

    try {
      console.log(`\nValidating ${filePath}...`);

      const results = await linter.lintFiles([filePath], {
        errorOnUnmatchedPattern: false,
      });

      if (results.length === 0) {
        console.log('  File ignored or not found');
        return;
      }

      const result = results[0];

      if (result.errorCount + result.warningCount === 0) {
        console.log('  [OK] No issues');
      } else {
        console.log(`  ${result.errorCount} error(s), ${result.warningCount} warning(s)`);

        for (const msg of result.messages) {
          const severity = msg.severity === 'error' ? '[ERROR]' : '[WARN]';
          const location = msg.line ? `:${msg.line}` : '';
          console.log(`    ${severity} ${location} ${msg.message}`);
        }
      }
    } catch (error) {
      console.error('  Error:', error.message);
    } finally {
      validating = false;
    }
  }

  // Watch for changes
  const watcher = chokidar.watch('**/*.md', {
    ignored: /(^|[\/\\])(node_modules|dist|\.git)([\/\\]|$)/,
    persistent: true,
    ignoreInitial: true,
  });

  console.log('Watching for changes...\n');

  watcher
    .on('change', validateFile)
    .on('add', validateFile);

  // Keep process running
  process.on('SIGINT', () => {
    console.log('\nStopping watch mode...');
    watcher.close();
    process.exit(0);
  });
}

/**
 * Package.json scripts integration
 */
function showPackageJsonScripts() {
  console.log('=== Package.json Scripts ===\n');

  const scripts = {
    // Validate all files
    'validate': 'node examples/build-integration.js',

    // Validate with auto-fix
    'validate:fix': 'node -e "const {ClaudeLint}=require(\'.\');const l=new ClaudeLint({fix:true});l.lintFiles([\'**/*.md\',\'!node_modules/**\']).then(r=>ClaudeLint.outputFixes(r))"',

    // Pre-commit hook
    'precommit': 'node examples/build-integration.js --precommit',

    // CI/CD validation
    'validate:ci': 'node examples/build-integration.js --ci',

    // Watch mode
    'validate:watch': 'node examples/build-integration.js --watch',
  };

  console.log('Add these scripts to your package.json:\n');
  console.log(JSON.stringify({ scripts }, null, 2));
  console.log('\nUsage:');
  console.log('  npm run validate         # Validate all files');
  console.log('  npm run validate:fix     # Validate and auto-fix');
  console.log('  npm run precommit        # Validate staged files');
  console.log('  npm run validate:ci      # CI/CD validation');
  console.log('  npm run validate:watch   # Watch mode');
}

// Main entry point - detect which mode to run
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0];

  switch (mode) {
    case '--simple':
      await simpleBuildIntegration();
      break;

    case '--ci':
    case '--cicd':
      await cicdIntegration();
      break;

    case '--precommit':
    case '--pre-commit':
      await preCommitIntegration();
      break;

    case '--watch':
      await watchModeIntegration();
      break;

    case '--scripts':
      showPackageJsonScripts();
      break;

    default:
      console.log('ClaudeLint Build Integration Examples\n');
      console.log('Usage:');
      console.log('  node build-integration.js --simple       # Simple build integration');
      console.log('  node build-integration.js --ci           # CI/CD integration');
      console.log('  node build-integration.js --precommit    # Pre-commit hook');
      console.log('  node build-integration.js --watch        # Watch mode');
      console.log('  node build-integration.js --scripts      # Show package.json scripts');
      console.log('\nRunning simple mode by default...\n');
      await simpleBuildIntegration();
  }
}

// Run
main().catch((error) => {
  console.error('Fatal error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
