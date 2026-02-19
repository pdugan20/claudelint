#!/usr/bin/env ts-node
/**
 * Rule Anti-Pattern Scanner
 *
 * Checks rule source files for known anti-patterns that have caused
 * reliability bugs in the past. Prevents regressions by failing CI
 * when new rules introduce patterns we've explicitly moved away from.
 *
 * Anti-patterns detected:
 * 1. lastIndex usage (use matchAll() instead)
 * 2. Inline code block stripping regex (use stripCodeBlocks() utility)
 * 3. Naive frontmatter splitting on --- (use extractBodyContent() utility)
 * 4. Overly broad $ detection for env vars (use containsEnvVar() from patterns)
 * 5. Hand-rolled frontmatter regex (use extractFrontmatter() utility)
 * 6. exec() loops (use matchAll() instead)
 * 7. Inline env var placeholder regex (use containsEnvVar() from patterns)
 * 8. Inline escapeRegExp pattern (use escapeRegExp() from patterns)
 * 9. Inline semver regex (use isValidSemver() or SEMVER_RE from patterns)
 */

import { readFile, readdir, stat } from 'fs/promises';
import { join, relative } from 'path';
import { log } from '../util/logger';

interface Violation {
  file: string;
  line: number;
  pattern: string;
  snippet: string;
}

const projectRoot = join(__dirname, '../..');

/**
 * Allowlist for legitimate pattern uses.
 * Key: relative path from project root, Value: set of pattern names allowed.
 */
const ALLOWLIST: Record<string, Set<string>> = {
  // skill-body-long-code-block uses frontmatter regex to compute line offset,
  // not to parse frontmatter data. extractFrontmatter() returns parsed data,
  // not line count information.
  'src/rules/skills/skill-body-long-code-block.ts': new Set([
    'Hand-rolled frontmatter regex (use extractFrontmatter() from utils/formats/markdown)',
  ]),
};

/** Anti-patterns to detect in rule files */
const ANTI_PATTERNS: {
  name: string;
  test: (line: string, trimmed: string) => boolean;
}[] = [
  {
    name: 'lastIndex usage (use matchAll() instead of exec + lastIndex)',
    test: (_line, trimmed) =>
      /\.lastIndex\b/.test(trimmed) && !trimmed.startsWith('//') && !trimmed.startsWith('*'),
  },
  {
    name: 'Inline code block stripping (use stripCodeBlocks() from utils/formats/markdown)',
    test: (_line, trimmed) =>
      /\.replace\(\s*\/.*```/.test(trimmed) &&
      /\\s\\S/.test(trimmed) &&
      !trimmed.startsWith('//') &&
      !trimmed.startsWith('*'),
  },
  {
    name: 'Naive frontmatter split (use extractBodyContent() from utils/formats/markdown)',
    test: (_line, trimmed) =>
      /\.split\(\s*['"`]---['"`]\s*\)/.test(trimmed) &&
      !trimmed.startsWith('//') &&
      !trimmed.startsWith('*'),
  },
  {
    name: 'Overly broad $ env var check (use containsEnvVar() from utils/patterns)',
    test: (_line, trimmed) =>
      /\.includes\(\s*['"`]\$['"`]\s*\)/.test(trimmed) &&
      !trimmed.startsWith('//') &&
      !trimmed.startsWith('*'),
  },
  {
    name: 'Hand-rolled frontmatter regex (use extractFrontmatter() from utils/formats/markdown)',
    test: (_line, trimmed) =>
      /\.match\(\s*\/\^---/.test(trimmed) &&
      !trimmed.startsWith('//') &&
      !trimmed.startsWith('*') &&
      // Allow the utility itself and tests
      !/extractFrontmatter|extractBodyContent/.test(trimmed),
  },
  {
    name: 'exec() in while loop (use matchAll() instead)',
    test: (line, trimmed) =>
      // Detect: while ((match = regex.exec(...))) pattern
      (/while\s*\(.*\.exec\(/.test(trimmed) ||
        // Detect: assigned in a loop context (= regex.exec on same line as while)
        (/=\s*\w+\.exec\(/.test(trimmed) && /while/.test(trimmed))) &&
      !line.trimStart().startsWith('//') &&
      !line.trimStart().startsWith('*'),
  },
  {
    name: 'Inline env var placeholder regex (use containsEnvVar() from utils/patterns)',
    test: (_line, trimmed) =>
      // Detect the raw pattern: /\$\{[A-Z_]+\}|\$[A-Z_]+\b/
      /\\\$\\\{?\[A-Z_\]/.test(trimmed) &&
      /\.test\(/.test(trimmed) &&
      !trimmed.startsWith('//') &&
      !trimmed.startsWith('*') &&
      !/containsEnvVar|ENV_VAR_PLACEHOLDER_RE/.test(trimmed),
  },
  {
    name: 'Inline escapeRegExp pattern (use escapeRegExp() from utils/patterns)',
    test: (_line, trimmed) =>
      /\.replace\(\s*\/\[.*\?\^\$\{\}/.test(trimmed) &&
      /\\\\\$&/.test(trimmed) &&
      !trimmed.startsWith('//') &&
      !trimmed.startsWith('*'),
  },
  {
    name: 'Inline semver regex (use isValidSemver() or SEMVER_RE from utils/patterns)',
    test: (_line, trimmed) =>
      // Detect inline semver patterns: /^(0|[1-9]\d*)\.
      /\/\^\(0\|\[1-9\]/.test(trimmed) &&
      !trimmed.startsWith('//') &&
      !trimmed.startsWith('*') &&
      !/SEMVER_RE|isValidSemver/.test(trimmed),
  },
];

/**
 * Scan a single file for anti-patterns
 */
function scanFile(
  content: string,
  relPath: string
): Violation[] {
  const violations: Violation[] = [];
  const lines = content.split('\n');
  const allowed = ALLOWLIST[relPath];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    for (const pattern of ANTI_PATTERNS) {
      if (allowed?.has(pattern.name)) continue;
      if (pattern.test(line, trimmed)) {
        violations.push({
          file: relPath,
          line: i + 1,
          pattern: pattern.name,
          snippet:
            trimmed.length > 80 ? trimmed.substring(0, 77) + '...' : trimmed,
        });
      }
    }
  }

  return violations;
}

/**
 * Recursively scan rule files
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
      } else if (
        entry.endsWith('.ts') &&
        !entry.endsWith('.test.ts') &&
        entry !== 'index.ts' &&
        entry !== 'rule-ids.ts'
      ) {
        const content = await readFile(fullPath, 'utf-8');
        const relPath = relative(projectRoot, fullPath);
        violations.push(...scanFile(content, relPath));
      }
    }
  }

  await scanDir(rulesDir);
  return violations;
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  log.info('Checking rule files for anti-patterns...');
  log.blank();

  const violations = await scanRuleFiles();

  if (violations.length > 0) {
    log.bracket.fail(`Found ${violations.length} anti-pattern violations:`);
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
        log.dim(`      ${v.snippet}`);
      }
      log.blank();
    }

    log.info('Use shared utilities from src/utils/formats/markdown.ts instead.');
    process.exit(1);
  } else {
    log.bracket.success('No anti-patterns found in rule files');
    process.exit(0);
  }
}

main().catch((error) => {
  log.error(`Error: ${error}`);
  process.exit(1);
});
