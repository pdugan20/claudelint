/**
 * Refreshes the committed upstream docs baseline.
 *
 * Network-bound: runs weekly via cron and on demand. The conformance check
 * (scripts/check/upstream.ts) reads the baseline this produces and is fully offline.
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { WATCHLIST } from '../../src/upstream/watchlist';
import { extract } from './extract';
import { log } from '../util/logger';

const BASELINE_DIR = join(__dirname, '../../docs-baseline');
const LLMS_TXT = 'https://code.claude.com/docs/llms.txt';

/** Strip volatile artifacts so diffs reflect real content change, not rendering noise. */
export function normalize(markdown: string): string {
  return markdown
    .replace(/^>.*Documentation Index[\s\S]*?(?=\n#)/, '')
    .replace(/```(\w+)\s+theme=\{null\}/g, '```$1')
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''))
    .join('\n')
    .trim();
}

/** Page slugs referenced by the docs index. A new slug here is itself a finding. */
export function parseIndex(llmsTxt: string): string[] {
  const slugs = new Set<string>();
  for (const match of llmsTxt.matchAll(/code\.claude\.com\/docs\/en\/([a-z0-9-]+)/g)) {
    slugs.add(match[1]);
  }
  return [...slugs].sort();
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Fetch failed: ${url} returned HTTP ${res.status}`);
  }
  return res.text();
}

async function main(): Promise<void> {
  mkdirSync(BASELINE_DIR, { recursive: true });

  const indexPath = join(BASELINE_DIR, '_index.json');
  const previous: string[] = existsSync(indexPath)
    ? (JSON.parse(readFileSync(indexPath, 'utf8')) as { pages: string[] }).pages
    : [];

  const pages = parseIndex(await fetchText(LLMS_TXT));

  const added = pages.filter((p) => !previous.includes(p));
  const removed = previous.filter((p) => !pages.includes(p));
  const watched = new Set(WATCHLIST.map((e) => e.id));

  for (const page of added) {
    const flag = watched.has(page) ? '' : ' (NOT WATCHED - consider adding to watchlist)';
    log.info(`[NEW PAGE] ${page}${flag}`);
  }
  for (const page of removed) {
    log.info(`[REMOVED PAGE] ${page}`);
  }

  writeFileSync(indexPath, `${JSON.stringify({ pages }, null, 2)}\n`);

  for (const entry of WATCHLIST) {
    const markdown = normalize(await fetchText(entry.url));
    writeFileSync(join(BASELINE_DIR, `${entry.id}.md`), `${markdown}\n`);
    log.info(`[OK] ${entry.id} (${markdown.length} bytes)`);
  }

  // Throws if any page yields fewer than its minFacts. See Task 7.
  const facts = extract(BASELINE_DIR);
  writeFileSync(join(BASELINE_DIR, 'facts.json'), `${JSON.stringify(facts, null, 2)}\n`);
  log.info(`[OK] facts.json (${Object.keys(facts).length} pages)`);
}

if (require.main === module) {
  main().catch((err: Error) => {
    log.bracket.error(err.message);
    process.exit(1);
  });
}
