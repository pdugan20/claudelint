/**
 * Upstream docs watchlist.
 *
 * Pages whose content claudelint models. The refresh script snapshots each one; the
 * conformance check asserts our Zod schemas match what they document.
 *
 * minFacts guards against silent extractor failure: if upstream reformats a table into
 * prose, a naive parser yields zero facts and conformance would pass vacuously. Fewer
 * than minFacts is a hard error, not an empty result.
 */

export type ExtractorId = 'hook-events' | 'field-tables' | 'json-keys' | 'frontmatter-keys';

export interface WatchEntry {
  /** Stable slug; also the baseline filename. */
  id: string;
  /** Raw markdown endpoint. Verified: code.claude.com serves .md for every docs page. */
  url: string;
  /** Which deterministic extractors to run over this page. */
  extractors: ExtractorId[];
  /** Zod schema names this page is authoritative for. */
  governs: string[];
  /** Minimum facts this page must yield. Below this is a detector malfunction. */
  minFacts: number;
}

const DOCS = 'https://code.claude.com/docs/en';

export const WATCHLIST: WatchEntry[] = [
  {
    id: 'hooks',
    url: `${DOCS}/hooks.md`,
    extractors: ['hook-events', 'field-tables'],
    governs: ['HooksConfigSchema'],
    minFacts: 25,
  },
  {
    id: 'plugins-reference',
    url: `${DOCS}/plugins-reference.md`,
    extractors: ['field-tables', 'json-keys', 'frontmatter-keys'],
    governs: ['PluginManifestSchema', 'LSPConfigSchema'],
    // Raised from 15 after confirming frontmatter-keys' real yield (110 facts as of
    // this refresh); still well below the true count for margin.
    minFacts: 60,
  },
  {
    id: 'plugin-dependencies',
    url: `${DOCS}/plugin-dependencies.md`,
    extractors: ['field-tables', 'json-keys'],
    governs: ['PluginManifestSchema'],
    minFacts: 3,
  },
  {
    id: 'plugin-marketplaces',
    url: `${DOCS}/plugin-marketplaces.md`,
    extractors: ['field-tables', 'json-keys'],
    governs: ['MarketplaceMetadataSchema'],
    minFacts: 5,
  },
  {
    id: 'skills',
    url: `${DOCS}/skills.md`,
    // Documents claudelint-governed frontmatter fields the same YAML-example-only way
    // memory.md does for `paths`; also covered by tables today, but frontmatter-keys
    // closes the blind spot if a future field is added example-only.
    extractors: ['field-tables', 'frontmatter-keys'],
    governs: ['SkillFrontmatterSchema'],
    // Raised from 8 after confirming frontmatter-keys' real yield (22 facts as of this
    // refresh); still well below the true count for margin.
    minFacts: 15,
  },
  {
    id: 'sub-agents',
    url: `${DOCS}/sub-agents.md`,
    // Same rationale as `skills` above: frontmatter-only documentation style exists
    // upstream (memory.md), so close the blind spot here too.
    extractors: ['field-tables', 'frontmatter-keys'],
    governs: ['AgentFrontmatterSchema'],
    // Raised from 4 after confirming frontmatter-keys' real yield (42 facts as of this
    // refresh); still well below the true count for margin.
    minFacts: 20,
  },
  {
    id: 'mcp',
    url: `${DOCS}/mcp.md`,
    extractors: ['field-tables', 'json-keys'],
    governs: ['MCPConfigSchema'],
    minFacts: 3,
  },
  {
    id: 'output-styles',
    url: `${DOCS}/output-styles.md`,
    extractors: ['field-tables'],
    governs: ['OutputStyleFrontmatterSchema'],
    minFacts: 2,
  },
  {
    id: 'settings',
    url: `${DOCS}/settings.md`,
    extractors: ['field-tables', 'json-keys'],
    governs: [],
    minFacts: 10,
  },
  {
    id: 'memory',
    url: `${DOCS}/memory.md`,
    // memory.md documents the `paths` field only via a YAML frontmatter example, never
    // as a `field:` table row, so field-tables alone legitimately finds nothing here.
    extractors: ['field-tables', 'frontmatter-keys'],
    governs: ['RulesFrontmatterSchema'],
    minFacts: 1,
  },
];
