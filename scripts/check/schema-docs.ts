#!/usr/bin/env ts-node
/**
 * Schema Documentation Consistency Check
 *
 * Validates that all individual schema pages in website/api/schemas/
 * follow the standard template:
 * 1. Has a <SchemaRef> component
 * 2. Has a ## Fields heading
 * 3. Has a ## Example heading
 * 4. All tables use the 4-column format: Field | Type | Required | Description
 *
 * Exits with error if any pages violate the template.
 */

import { readFile, readdir } from 'fs/promises';
import { join, relative } from 'path';
import { log } from '../util/logger';

interface Violation {
  file: string;
  issue: string;
}

const violations: Violation[] = [];
const projectRoot = join(__dirname, '../..');
const schemasDir = join(projectRoot, 'website', 'api', 'schemas');

/**
 * Check a single schema page for template compliance
 */
async function checkPage(filePath: string): Promise<void> {
  const content = await readFile(filePath, 'utf-8');
  const relativePath = relative(projectRoot, filePath);

  // 1. Must have <SchemaRef component
  if (!content.includes('<SchemaRef')) {
    violations.push({
      file: relativePath,
      issue: 'Missing <SchemaRef> component',
    });
  }

  // 2. Must have ## Fields heading
  if (!/^## Fields$/m.test(content)) {
    violations.push({
      file: relativePath,
      issue: 'Missing "## Fields" heading',
    });
  }

  // 3. Must have ## Example heading
  if (!/^## Example$/m.test(content)) {
    violations.push({
      file: relativePath,
      issue: 'Missing "## Example" heading',
    });
  }

  // 4. All tables must use 4-column format: Field | Type | Required | Description
  const expectedHeader = /^\|\s*Field\s*\|\s*Type\s*\|\s*Required\s*\|\s*Description\s*\|$/;
  const separatorPattern = /^\|[-\s|]+\|$/;
  const lines = content.split('\n');

  for (let i = 1; i < lines.length; i++) {
    // Find separator rows (e.g., |---|---|---|---|) which indicate a table
    if (separatorPattern.test(lines[i])) {
      const headerLine = lines[i - 1];
      // Verify the header row above the separator uses the expected format
      if (headerLine && headerLine.startsWith('|') && !expectedHeader.test(headerLine)) {
        violations.push({
          file: relativePath,
          issue: `Table at line ${i} does not use standard header "| Field | Type | Required | Description |"`,
        });
      }
    }
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  log.info('Checking schema documentation consistency...');
  log.blank();

  const entries = await readdir(schemasDir);
  const mdFiles = entries.filter((f) => f.endsWith('.md'));

  if (mdFiles.length === 0) {
    log.bracket.fail('No schema documentation pages found in website/api/schemas/');
    process.exit(1);
  }

  for (const file of mdFiles) {
    await checkPage(join(schemasDir, file));
  }

  if (violations.length > 0) {
    log.bracket.fail(`Found ${violations.length} schema documentation violations:`);
    log.blank();

    for (const violation of violations) {
      log.info(`  ${violation.file}`);
      log.info(`    ${violation.issue}`);
      log.blank();
    }

    log.info('All schema pages must follow the standard template.');
    log.info('Required: <SchemaRef>, ## Fields, ## Example, 4-column tables.');
    process.exit(1);
  } else {
    log.bracket.success(`All ${mdFiles.length} schema pages follow the standard template`);
    process.exit(0);
  }
}

main().catch((error) => {
  log.error(`Error: ${String(error)}`);
  process.exit(1);
});
