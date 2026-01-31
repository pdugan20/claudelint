#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

const OLD_NAME = 'claude-code-lint';
const NEW_NAME = 'claude-code-lint';

interface MigrationResult {
  file: string;
  occurrences: number;
  changed: boolean;
}

/**
 * Migrate package name from scoped to unscoped
 */
async function migratePackageName(
  dryRun: boolean = false
): Promise<MigrationResult[]> {
  const rootDir = process.cwd();
  const results: MigrationResult[] = [];

  // File patterns to search
  const patterns = [
    'package.json',
    'plugin.json',
    '.claude-plugin/**/*.json',
    'src/**/*.ts',
    'examples/**/*.{js,json,md}',
    'docs/**/*.md',
    'README.md',
    'CHANGELOG.md',
  ];

  // Files to exclude
  const exclude = [
    '**/node_modules/**',
    '**/dist/**',
    '**/.git/**',
    '**/package-lock.json',
  ];

  console.log(`\n${'='.repeat(60)}`);
  console.log(
    dryRun
      ? 'DRY RUN - No files will be modified'
      : 'LIVE RUN - Files will be modified'
  );
  console.log(`${'='.repeat(60)}\n`);
  console.log(`Migrating: ${OLD_NAME} → ${NEW_NAME}\n`);

  for (const pattern of patterns) {
    const files = await glob(pattern, {
      cwd: rootDir,
      ignore: exclude,
      absolute: true,
    });

    for (const filePath of files) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const occurrences = (content.match(new RegExp(OLD_NAME.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || [])
          .length;

        if (occurrences > 0) {
          const newContent = content.replaceAll(OLD_NAME, NEW_NAME);

          results.push({
            file: path.relative(rootDir, filePath),
            occurrences,
            changed: !dryRun,
          });

          if (!dryRun) {
            fs.writeFileSync(filePath, newContent, 'utf-8');
            console.log(
              `✓ ${path.relative(rootDir, filePath)} (${occurrences} occurrence${occurrences > 1 ? 's' : ''})`
            );
          } else {
            console.log(
              `  ${path.relative(rootDir, filePath)} (${occurrences} occurrence${occurrences > 1 ? 's' : ''})`
            );
          }
        }
      } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
      }
    }
  }

  // Summary
  const totalFiles = results.length;
  const totalOccurrences = results.reduce(
    (sum, r) => sum + r.occurrences,
    0
  );

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Files affected: ${totalFiles}`);
  console.log(`Total occurrences: ${totalOccurrences}`);
  console.log(`${'='.repeat(60)}\n`);

  if (dryRun) {
    console.log('Run without --dry-run to apply changes');
  } else {
    console.log('✓ Migration complete');
    console.log('\nNext steps:');
    console.log('1. Review changes: git diff');
    console.log('2. Test build: npm run build');
    console.log('3. Test installation: npm pack && npm install -g claude-code-lint-*.tgz');
    console.log('4. Commit: git add . && git commit -m "chore: migrate to unscoped package name"');
  }

  return results;
}

// CLI
const dryRun = process.argv.includes('--dry-run');
migratePackageName(dryRun).catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
