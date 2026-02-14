#!/usr/bin/env ts-node
/**
 * Message Content Validator
 *
 * Checks rule messages for anti-patterns that indicate content
 * that belongs in the `fix` field or `docs` fields instead:
 *
 * 1. Fix instructions: starts with "Add ", "Use ", "Create ", "Remove ", "Consider "
 * 2. Rationale: contains "so that", "to ensure", "which means", "to prevent"
 * 3. Examples: contains "e.g.,", "for example", "such as", "like:"
 * 4. Data dumps: contains lists of valid values (", " repeated 3+ times after a colon)
 */

import { readFile, readdir, stat } from 'fs/promises';
import { join, relative } from 'path';
import { log } from '../util/logger';

interface Violation {
  file: string;
  line: number;
  pattern: string;
  message: string;
}

const projectRoot = join(__dirname, '../..');

/** Anti-patterns to detect in messages */
const ANTI_PATTERNS: { name: string; test: (msg: string) => boolean }[] = [
  {
    name: 'Fix instruction (starts with imperative verb)',
    test: (msg) => /^(Add|Use|Create|Remove|Consider|Set|Change|Replace|Move|Update|Enable|Disable|Install|Configure|Ensure|Make)\s/.test(msg),
  },
  {
    name: 'Inline rationale',
    test: (msg) => /\b(so that|to ensure|which means|to prevent|because it|this allows|this ensures)\b/i.test(msg),
  },
  {
    name: 'Inline examples',
    test: (msg) => /\b(e\.g\.,|for example|such as|like:)\b/i.test(msg),
  },
  {
    name: 'Data dump (long list of valid values)',
    test: (msg) => {
      // Check for colon followed by a comma-separated list with 4+ items
      const listMatch = msg.match(/:\s*(.+)/);
      if (!listMatch) return false;
      const afterColon = listMatch[1];
      const commaCount = (afterColon.match(/,/g) || []).length;
      return commaCount >= 3 && afterColon.length > 40;
    },
  },
];

/**
 * Extract message strings from a rule source file.
 */
function extractMessages(content: string): { line: number; message: string }[] {
  const lines = content.split('\n');
  const results: { line: number; message: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip comments
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;

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

    // Match multi-line message
    const multiLineStart = line.match(/message:\s*$/);
    if (multiLineStart && i + 1 < lines.length) {
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
  }

  return results;
}

/**
 * Check a message against anti-patterns
 */
function checkMessage(msg: string): string | null {
  for (const pattern of ANTI_PATTERNS) {
    if (pattern.test(msg)) {
      return pattern.name;
    }
  }
  return null;
}

/**
 * Scan rule files for message content anti-patterns
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
          const patternName = checkMessage(msg.message);
          if (patternName) {
            violations.push({
              file: relPath,
              line: msg.line,
              pattern: patternName,
              message: msg.message.length > 70 ? msg.message.substring(0, 67) + '...' : msg.message,
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
      const patternName = checkMessage(msg.message);
      if (patternName) {
        violations.push({
          file: relPath,
          line: msg.line,
          pattern: patternName,
          message: msg.message.length > 70 ? msg.message.substring(0, 67) + '...' : msg.message,
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
  log.info('Checking message content for anti-patterns...');
  log.blank();

  const violations = await scanRuleFiles();

  if (violations.length > 0) {
    log.bracket.fail(`Found ${violations.length} message content violations:`);
    log.blank();

    // Group by pattern type
    const byPattern = new Map<string, Violation[]>();
    for (const v of violations) {
      if (!byPattern.has(v.pattern)) {
        byPattern.set(v.pattern, []);
      }
      byPattern.get(v.pattern)!.push(v);
    }

    for (const [pattern, items] of byPattern) {
      log.info(`  ${pattern} (${items.length}):`);
      for (const v of items) {
        log.info(`    ${v.file}:${v.line}`);
        log.dim(`      ${v.message}`);
      }
      log.blank();
    }

    log.info('Move fix instructions to the fix field and rationale to docs.rationale.');
    process.exit(1);
  } else {
    log.bracket.success('All messages follow content guidelines');
    process.exit(0);
  }
}

main().catch((error) => {
  log.error(`Error: ${error}`);
  process.exit(1);
});
