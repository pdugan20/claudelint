/**
 * Deterministic fact extraction from the docs baseline.
 *
 * No LLM, no judgment. If upstream changes format such that a parser stops finding
 * things, assertMinFacts turns that into a loud failure rather than a silent pass.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { WATCHLIST, WatchEntry, ExtractorId } from '../../src/upstream/watchlist';

export type Facts = Record<string, string[]>;

/** Backtick-quoted identifier in the first cell of a markdown table row. */
const TABLE_ROW = /^\|\s*`([A-Za-z][A-Za-z0-9_-]*)`\s*\|/gm;

export function extractHookEvents(markdown: string): string[] {
  const events = new Set<string>();
  for (const match of markdown.matchAll(TABLE_ROW)) {
    // Hook events are PascalCase; field tables in the same page are not.
    if (/^[A-Z][A-Za-z]+$/.test(match[1])) {
      events.add(`hook-event:${match[1]}`);
    }
  }
  return [...events].sort();
}

export function extractFieldTables(markdown: string): string[] {
  const fields = new Set<string>();
  for (const match of markdown.matchAll(TABLE_ROW)) {
    fields.add(`field:${match[1]}`);
  }
  return [...fields].sort();
}

export function extractJsonKeys(markdown: string): string[] {
  const keys = new Set<string>();
  for (const block of markdown.matchAll(/```json[^\n]*\n([\s\S]*?)```/g)) {
    for (const key of block[1].matchAll(/^\s{2}"([A-Za-z$][A-Za-z0-9_-]*)":/gm)) {
      keys.add(`json-key:${key[1]}`);
    }
  }
  return [...keys].sort();
}

/**
 * Top-level keys of YAML frontmatter shown inside fenced code examples (` --- ... --- `).
 * Some pages (e.g. memory.md's `paths` field) document their one field only via a
 * frontmatter example, never as a `field:` table row - field-tables legitimately finds
 * nothing there, so this extractor covers that documentation style instead.
 */
export function extractFrontmatterKeys(markdown: string): string[] {
  const keys = new Set<string>();
  for (const block of markdown.matchAll(/```[^\n]*\n([\s\S]*?)```/g)) {
    const frontmatter = block[1].match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatter) continue;
    for (const key of frontmatter[1].matchAll(/^([A-Za-z][A-Za-z0-9_-]*):/gm)) {
      keys.add(`frontmatter-key:${key[1]}`);
    }
  }
  return [...keys].sort();
}

/**
 * A page that suddenly yields almost nothing means the parser broke, not that upstream
 * deleted its content. Fail loudly: a detector that quietly stops detecting is worse
 * than no detector.
 */
export function assertMinFacts(id: string, facts: string[], minFacts: number): void {
  if (facts.length < minFacts) {
    throw new Error(
      `Extractor guard tripped: ${id} yielded ${facts.length} facts, expected >= ${minFacts}. ` +
        `Upstream likely changed format. Fix the extractor - do not lower minFacts to make this pass.`
    );
  }
}

/**
 * A lookup table, not a ternary chain: TypeScript enforces that every ExtractorId has
 * an entry here, so adding a 5th extractor without wiring it up is a compile error
 * instead of a silent fall-through to the wrong extractor.
 */
const EXTRACTORS: Record<ExtractorId, (markdown: string) => string[]> = {
  'hook-events': extractHookEvents,
  'field-tables': extractFieldTables,
  'json-keys': extractJsonKeys,
  'frontmatter-keys': extractFrontmatterKeys,
};

function extractPage(markdown: string, entry: WatchEntry): string[] {
  const facts = new Set<string>();
  for (const extractor of entry.extractors) {
    EXTRACTORS[extractor](markdown).forEach((f) => facts.add(f));
  }
  return [...facts].sort();
}

export function extract(baselineDir: string): Facts {
  const facts: Facts = {};
  for (const entry of WATCHLIST) {
    const markdown = readFileSync(join(baselineDir, `${entry.id}.md`), 'utf8');
    const pageFacts = extractPage(markdown, entry);
    assertMinFacts(entry.id, pageFacts, entry.minFacts);
    facts[entry.id] = pageFacts;
  }
  return facts;
}
