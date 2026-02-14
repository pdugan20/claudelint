#!/usr/bin/env ts-node
/**
 * Message Length Validator
 *
 * Scans all rule files for `context.report({ message:` patterns and
 * schema refinement messages, then checks that the static portion of
 * each message template does not exceed 100 characters.
 *
 * Template interpolations (${...}) are counted as a fixed placeholder
 * length (10 chars) to approximate typical runtime values.
 */

import { readFile, readdir, stat } from 'fs/promises';
import { join, relative } from 'path';
import { log } from '../util/logger';

interface Violation {
  file: string;
  line: number;
  length: number;
  message: string;
}

const MAX_LENGTH = 100;
const INTERPOLATION_ESTIMATE = 10;
const projectRoot = join(__dirname, '../..');

/**
 * Estimate the rendered length of a message template.
 * Replaces ${...} expressions with a fixed-width placeholder.
 */
function estimateLength(template: string): number {
  const collapsed = template.replace(/\$\{[^}]+\}/g, 'x'.repeat(INTERPOLATION_ESTIMATE));
  return collapsed.length;
}

/**
 * Extract message strings from a rule source file.
 * Handles both single-line and multi-line message declarations.
 */
function extractMessages(
  content: string
): { line: number; message: string }[] {
  const lines = content.split('\n');
  const results: { line: number; message: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match: message: 'string' or message: "string" or message: `template`
    const singleLineMatch = line.match(/message:\s*(['"`])(.+?)\1/);
    if (singleLineMatch) {
      results.push({ line: i + 1, message: singleLineMatch[2] });
      continue;
    }

    // Match: message: `template with ${interpolation}`
    const templateMatch = line.match(/message:\s*`([^`]+)`/);
    if (templateMatch) {
      results.push({ line: i + 1, message: templateMatch[1] });
      continue;
    }

    // Match multi-line message starting with backtick
    const multiLineStart = line.match(/message:\s*$/);
    if (multiLineStart && i + 1 < lines.length) {
      // Next line(s) contain the message
      const nextLine = lines[i + 1].trim();
      const quotedMatch = nextLine.match(/^(['"`])(.+?)\1/);
      if (quotedMatch) {
        results.push({ line: i + 2, message: quotedMatch[2] });
      }
      const templateStart = nextLine.match(/^`([^`]+)`/);
      if (templateStart) {
        results.push({ line: i + 2, message: templateStart[1] });
      }
    }

    // Match concatenated strings: message: 'part1' + 'part2'
    const concatMatch = line.match(/message:\s*['"`](.+)$/);
    if (concatMatch && !singleLineMatch && !templateMatch) {
      // Collect continuation lines
      let fullMessage = concatMatch[1];
      let j = i + 1;
      while (j < lines.length) {
        const contLine = lines[j].trim();
        const contMatch = contLine.match(/['"`](.+?)['"`]/);
        if (contMatch) {
          fullMessage += contMatch[1];
        }
        if (!contLine.endsWith('+')) break;
        j++;
      }
      // Remove trailing quote
      fullMessage = fullMessage.replace(/['"`]\s*[+,]?\s*$/, '');
      if (fullMessage.length > 0) {
        results.push({ line: i + 1, message: fullMessage });
      }
    }
  }

  return results;
}

/**
 * Scan rule files for messages
 */
async function scanRuleFiles(): Promise<Violation[]> {
  const violations: Violation[] = [];
  const rulesDir = join(projectRoot, 'src', 'rules');

  async function scanDir(dir: string): Promise<void> {
    const entries = await readdir(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        await scanDir(fullPath);
      } else if (entry.endsWith('.ts') && !entry.endsWith('.test.ts') && entry !== 'index.ts' && entry !== 'rule-ids.ts') {
        const content = await readFile(fullPath, 'utf-8');
        const messages = extractMessages(content);
        const relPath = relative(projectRoot, fullPath);

        for (const msg of messages) {
          const estimated = estimateLength(msg.message);
          if (estimated > MAX_LENGTH) {
            violations.push({
              file: relPath,
              line: msg.line,
              length: estimated,
              message: msg.message.length > 60 ? msg.message.substring(0, 57) + '...' : msg.message,
            });
          }
        }
      }
    }
  }

  await scanDir(rulesDir);

  // Also check schema refinements
  const refinementsPath = join(projectRoot, 'src', 'schemas', 'refinements.ts');
  try {
    const content = await readFile(refinementsPath, 'utf-8');
    const messages = extractMessages(content);
    const relPath = relative(projectRoot, refinementsPath);

    for (const msg of messages) {
      const estimated = estimateLength(msg.message);
      if (estimated > MAX_LENGTH) {
        violations.push({
          file: relPath,
          line: msg.line,
          length: estimated,
          message: msg.message.length > 60 ? msg.message.substring(0, 57) + '...' : msg.message,
        });
      }
    }
  } catch {
    // refinements.ts not found, skip
  }

  return violations;
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  log.info('Checking message lengths...');
  log.blank();

  const violations = await scanRuleFiles();

  if (violations.length > 0) {
    log.bracket.fail(`Found ${violations.length} messages exceeding ${MAX_LENGTH} characters:`);
    log.blank();

    for (const v of violations) {
      log.info(`  ${v.file}:${v.line}`);
      log.info(`    Length: ${v.length} (max ${MAX_LENGTH})`);
      log.info(`    Message: ${v.message}`);
      log.blank();
    }

    log.info('Shorten messages and move details to the fix or docs fields.');
    process.exit(1);
  } else {
    log.bracket.success(`All messages are within ${MAX_LENGTH} character limit`);
    process.exit(0);
  }
}

main().catch((error) => {
  log.error(`Error: ${error}`);
  process.exit(1);
});
