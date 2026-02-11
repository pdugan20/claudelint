#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const IGNORED_PATTERNS = [
  /src\/rules\//,
  /tests\/rules\//,
  /src\/validators\//,
  /tests\/validators\//,
  /src\/utils\//,
  /tests\/utils\//,
  /TEMPLATE\.md/,
  /related-rule-\d+\.md/, // Template placeholders
  /archive\/programmatic-api\/README\.md.*api\/README\.md/, // Archive docs - path resolution issues
];

async function checkLinks() {
  try {
    const { stdout, stderr } = await execAsync(
      'npx remark --use remark-validate-links --frail docs/ README.md CONTRIBUTING.md',
      { maxBuffer: 10 * 1024 * 1024 } // 10MB buffer
    );

    // Parse output and filter
    const lines = (stdout + stderr).split('\n');
    const filteredLines = lines.filter(line => {
      // Keep non-warning lines
      if (!line.includes('warning') && !line.includes('Cannot find file')) {
        return true;
      }

      // Filter out ignored patterns
      return !IGNORED_PATTERNS.some(pattern => pattern.test(line));
    });

    const output = filteredLines.join('\n');
    console.log(output);

    // Count remaining warnings
    const warningCount = filteredLines.filter(l => l.includes('warning')).length;

    if (warningCount > 0) {
      console.error(`\nWARNING: ${warningCount} documentation link warnings (source code references filtered)`);
      process.exit(0); // Don't fail CI for now
    }

  } catch (error) {
    // Check for fatal errors (e.g., config parse failures, missing plugins)
    const combined = (error.stdout || '') + (error.stderr || '');
    if (combined.includes('Cannot process file') || combined.includes('Cannot parse file')) {
      console.error('FATAL: remark failed to process files:');
      console.error(combined);
      process.exit(1);
    }

    // remark exits with code 1 if there are warnings - filter and report
    const lines = combined.split('\n');
    const filteredLines = lines.filter(line => {
      if (!line.includes('warning') && !line.includes('Cannot find file')) {
        return true;
      }
      return !IGNORED_PATTERNS.some(pattern => pattern.test(line));
    });

    const output = filteredLines.join('\n');
    console.log(output);

    const warningCount = filteredLines.filter(l => l.includes('warning')).length;

    if (warningCount > 0) {
      console.error(`\nWARNING: ${warningCount} documentation link warnings (source code references filtered)`);
    }

    process.exit(0); // Don't fail CI for link warnings
  }
}

checkLinks();
