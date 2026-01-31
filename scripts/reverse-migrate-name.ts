#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

const OLD_NAME = 'claude-code-lint';
const NEW_NAME = 'claudelint';

interface MigrationResult {
  file: string;
  occurrences: number;
  changed: boolean;
}

/**
 * Patterns that should NOT be changed (keep as claude-code-lint)
 */
const KEEP_PATTERNS = [
  // npm install commands
  /npm install.*claude-code-lint/g,
  /npm i.*claude-code-lint/g,
  /npx claude-code-lint/g,
  // package manager imports
  /require\(['"]claude-code-lint['"]\)/g,
  /from ['"]claude-code-lint['"]/g,
  /import.*['"]claude-code-lint['"]/g,
  // package.json name field (we'll handle this specially)
];

/**
 * Check if a line should keep "claude-code-lint" unchanged
 */
function shouldKeepUnchanged(line: string): boolean {
  return KEEP_PATTERNS.some(pattern => pattern.test(line));
}

/**
 * Smart replacement that preserves npm-specific references
 */
function smartReplace(content: string, filePath: string): string {
  const lines = content.split('\n');
  const newLines = lines.map((line) => {
    // Special handling for package.json name field
    if (filePath.endsWith('package.json') && line.includes('"name":')) {
      return line; // Keep package.json name unchanged
    }

    // Keep npm/import references unchanged
    if (shouldKeepUnchanged(line)) {
      return line;
    }

    // Replace all other occurrences
    return line.replaceAll(OLD_NAME, NEW_NAME);
  });

  return newLines.join('\n');
}

/**
 * Count occurrences that will actually be changed
 */
function countChanges(content: string, filePath: string): number {
  const lines = content.split('\n');
  let count = 0;

  lines.forEach((line) => {
    if (filePath.endsWith('package.json') && line.includes('"name":')) {
      return; // Skip package.json name field
    }
    if (shouldKeepUnchanged(line)) {
      return; // Skip protected patterns
    }
    const matches = line.match(new RegExp(OLD_NAME, 'g'));
    if (matches) {
      count += matches.length;
    }
  });

  return count;
}

/**
 * Reverse migration: claude-code-lint → claudelint (except npm refs)
 */
async function reverseMigrate(dryRun: boolean = false): Promise<MigrationResult[]> {
  const rootDir = process.cwd();
  const results: MigrationResult[] = [];

  // File patterns to search
  const patterns = [
    'package.json',
    'plugin.json',
    '.claude-plugin/**/*.json',
    '.claude/**/*.{json,md}',
    'src/**/*.ts',
    'tests/**/*.ts',
    'examples/**/*.{js,json,md}',
    'docs/**/*.md',
    'README.md',
    'CHANGELOG.md',
    'CONTRIBUTING.md',
    'scripts/**/*.{ts,js}',
  ];

  // Files to exclude
  const exclude = [
    '**/node_modules/**',
    '**/dist/**',
    '**/.git/**',
    '**/package-lock.json',
    'scripts/reverse-migrate-name.ts', // Don't modify this script
  ];

  console.log(`\n${'='.repeat(60)}`);
  console.log(dryRun ? 'DRY RUN - No files will be modified' : 'LIVE RUN - Files will be modified');
  console.log(`${'='.repeat(60)}\n`);
  console.log(`Migrating: ${OLD_NAME} → ${NEW_NAME}`);
  console.log(`Preserving: npm package name, install commands, import statements\n`);

  for (const pattern of patterns) {
    const files = await glob(pattern, {
      cwd: rootDir,
      ignore: exclude,
      absolute: true,
    });

    for (const filePath of files) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const occurrences = countChanges(content, filePath);

        if (occurrences > 0) {
          const newContent = smartReplace(content, filePath);

          results.push({
            file: path.relative(rootDir, filePath),
            occurrences,
            changed: !dryRun,
          });

          if (!dryRun) {
            fs.writeFileSync(filePath, newContent, 'utf-8');
            console.log(`✓ ${path.relative(rootDir, filePath)} (${occurrences} occurrence${occurrences > 1 ? 's' : ''})`);
          } else {
            console.log(`  ${path.relative(rootDir, filePath)} (${occurrences} occurrence${occurrences > 1 ? 's' : ''})`);
          }
        }
      } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
      }
    }
  }

  // Summary
  const totalFiles = results.length;
  const totalOccurrences = results.reduce((sum, r) => sum + r.occurrences, 0);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Files affected: ${totalFiles}`);
  console.log(`Total occurrences to change: ${totalOccurrences}`);
  console.log(`${'='.repeat(60)}\n`);

  if (dryRun) {
    console.log('Run without --dry-run to apply changes');
  } else {
    console.log('✓ Migration complete');
    console.log('\nNext steps:');
    console.log('1. Review changes: git diff');
    console.log('2. Test build: npm run build');
    console.log('3. Run tests: npm test');
    console.log('4. Commit: git add . && git commit -m "chore: revert project name to claudelint (keep npm package as claude-code-lint)"');
  }

  return results;
}

// CLI
const dryRun = process.argv.includes('--dry-run');
reverseMigrate(dryRun).catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
