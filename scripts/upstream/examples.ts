/**
 * Extract the config examples the official docs actually show users.
 *
 * The v1 conformance gate compares FIELD NAMES: it asks whether claudelint models every
 * documented field, and documents every modeled one. That is blind to two failure modes
 * the first drift audit walked straight into:
 *
 *   1. Type drift. `tools` exists in both the docs and the schema, so a name-level diff
 *      calls it conformant -- while the docs write `tools: Read, Glob, Grep` and the
 *      schema demands a YAML array. The docs' own canonical sub-agent example did not
 *      lint.
 *   2. Dead-schema drift. The schema and the enforced behavior disagree, so reading
 *      required-ness off a Zod declaration tells you nothing about what a user sees.
 *
 * This module closes both by taking the docs at their word: every config example upstream
 * prints is, by definition, valid config. Lint them. If claudelint errors on one, claudelint
 * is wrong -- not the docs.
 *
 * MIN_EXAMPLES guards against silent extractor failure, exactly as `minFacts` does in the
 * watchlist: if upstream restyles its fences and a naive parser finds nothing, this must be
 * a loud failure rather than a vacuous pass. A detector that quietly stops detecting is
 * worse than no detector.
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

export interface DocExample {
  /** Baseline page the example came from, e.g. `sub-agents.md`. */
  page: string;
  /** 1-based line of the example's first line, for a clickable failure message. */
  line: number;
  /** Synthetic path that tells claudelint which validator to apply. */
  filePath: string;
  /** The example source. Verbatim, unless it was lifted out of a shell command. */
  code: string;
}

/** What a fence is an example of: which validator to run, and the config to run it on. */
export interface Classified {
  filePath: string;
  code: string;
}

/**
 * Below this, assume the extractor broke rather than that upstream deleted its examples.
 * Deliberately well under the real yield, so a normal docs edit does not trip it. Raise
 * these when upstream genuinely grows; never lower one to make a red build pass.
 */
export const MIN_EXAMPLES: Record<string, number> = {
  'sub-agents.md': 5,
  'skills.md': 4,
  'mcp.md': 4,
  'settings.md': 8,
};

interface Fence {
  lang: string;
  code: string;
  line: number;
}

/**
 * The `name` an example declares in its own frontmatter, if any. Used to place the example
 * at the path claudelint's name/directory-agreement rules expect.
 */
export function frontmatterName(code: string): string | null {
  const match = /^name:[ \t]*["']?([A-Za-z0-9._-]+)["']?[ \t]*$/m.exec(code);
  return match ? match[1] : null;
}

/** Fenced blocks with a language tag. Nested fences inside prose are not a concern here. */
function fences(markdown: string): Fence[] {
  const out: Fence[] = [];
  const lines = markdown.split('\n');
  let i = 0;

  while (i < lines.length) {
    const open = /^```([a-z]*)\s*$/.exec(lines[i]);
    if (!open) {
      i++;
      continue;
    }
    const start = i + 1;
    let end = start;
    while (end < lines.length && !/^```\s*$/.test(lines[end])) end++;

    out.push({ lang: open[1], code: lines.slice(start, end).join('\n'), line: start + 1 });
    i = end + 1;
  }
  return out;
}

/**
 * Which config file is this block an example of, if any?
 *
 * Conservative on purpose. A block we cannot confidently classify is skipped, not guessed
 * at -- a misclassified block produces a phantom failure, which erodes trust in the gate
 * faster than a missed example does. MIN_EXAMPLES is what stops "conservative" from
 * degrading into "skips everything".
 */
/**
 * `claude mcp add-json <name> '<json>'` -- a server definition embedded in a shell command.
 *
 * This is not a nicety. It is the ONLY way upstream documents the `ws` transport, and `ws`
 * is precisely the literal claudelint got wrong (it models `websocket`, which appears
 * nowhere as a config value). A JSON-fences-only extractor cannot see the one example that
 * proves the bug -- so this gate would have gone green on the very drift it exists to catch.
 */
function mcpAddJson(fence: Fence): Classified | null {
  if (fence.lang !== 'bash' && fence.lang !== 'shell') return null;

  // `[\s\\]+` because upstream wraps the command with a shell line-continuation:
  //   claude mcp add-json events-server \
  //     '{"type":"ws",...}'
  // A plain `\s+` stops dead at the backslash and the example is silently skipped.
  const match = /mcp\s+add-json\s+(\S+)[\s\\]+'([\s\S]*?)'/.exec(fence.code);
  if (!match) return null;

  const [, name, json] = match;
  try {
    const server: unknown = JSON.parse(json);
    return { filePath: '.mcp.json', code: JSON.stringify({ mcpServers: { [name]: server } }) };
  } catch {
    return null;
  }
}

export function classify(page: string, fence: Fence): Classified | null {
  const embedded = mcpAddJson(fence);
  if (embedded) return embedded;

  const code = fence.code.trim();
  if (!code) return null;

  // Frontmatter documents: the page determines the component type.
  //
  // The file is named after the example's own `name`, not a fixed stub. claudelint has
  // rules asserting a skill's name matches its directory and an agent's matches its
  // filename -- writing every example to `example/` would trip those on 14 examples and
  // bury the findings that matter under noise the harness itself manufactured.
  if ((fence.lang === 'yaml' || fence.lang === 'markdown') && code.startsWith('---')) {
    const name = frontmatterName(code) ?? 'example';

    if (page === 'skills.md') return { filePath: `.claude/skills/${name}/SKILL.md`, code };
    if (page === 'sub-agents.md') return { filePath: `.claude/agents/${name}.md`, code };
    if (page === 'output-styles.md') return { filePath: `.claude/output-styles/${name}.md`, code };
    return null;
  }

  if (fence.lang !== 'json') return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(code);
  } catch {
    // Abridged snippets ("...") and JSONC (`// comment`) are not lintable documents. Skip.
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;

  const keys = Object.keys(parsed as Record<string, unknown>);

  // The PAGE is the authority on what a block is an example of. An earlier cut gated
  // settings blocks on an allowlist of "recognized" top-level keys -- which meant
  // *inferring* which keys are settings, the same guess-from-prose mistake that put
  // `websocket` in the transport enum. It classified 1 of settings.md's 26 JSON blocks;
  // the MIN_EXAMPLES floor caught it. Let the page decide, and dispatch page-first: a
  // plugin manifest may legally carry an `mcpServers` STRING path, so a key-first check
  // would misread it as a `.mcp.json` and report a phantom type error.
  switch (page) {
    case 'plugins-reference.md':
    case 'plugin-dependencies.md':
      return keys.includes('name') ? { filePath: '.claude-plugin/plugin.json', code } : null;

    case 'plugin-marketplaces.md':
      return keys.includes('plugins') || keys.includes('owner')
        ? { filePath: '.claude-plugin/marketplace.json', code }
        : null;

    case 'settings.md':
      return { filePath: '.claude/settings.json', code };

    // hooks.md documents both settings-with-hooks AND the hook INPUT/OUTPUT payload
    // schemas (session_id, tool_name, ...), which are not config at all.
    case 'hooks.md':
      return keys.includes('hooks') ? { filePath: '.claude/settings.json', code } : null;

    // mcp.md is the most mixed page upstream. It shows `.mcp.json` alongside `~/.claude.json`
    // (keyed by `projects`, which claudelint does not model), settings snippets, and raw MCP
    // PROTOCOL payloads (a tool definition: name/description/_meta). Only the exact
    // `{ "mcpServers": ... }` shape is a .mcp.json.
    case 'mcp.md':
      if (keys.length === 1 && keys[0] === 'mcpServers') return { filePath: '.mcp.json', code };
      if (keys.includes('permissions')) return { filePath: '.claude/settings.json', code };
      return null;

    default:
      return null;
  }
}

export function assertMinExamples(page: string, count: number): void {
  const min = MIN_EXAMPLES[page];
  if (min === undefined) return;

  if (count < min) {
    throw new Error(
      `Example extractor guard tripped: ${page} yielded ${count} examples, expected >= ${min}. ` +
        `Upstream likely restyled its code fences. Fix the extractor - do not lower MIN_EXAMPLES ` +
        `to make this pass.`
    );
  }
}

export function extractExamples(baselineDir: string): DocExample[] {
  const pages = readdirSync(baselineDir).filter((f) => f.endsWith('.md'));
  if (pages.length === 0) {
    throw new Error('No baseline. Run: npm run upstream:refresh');
  }

  const examples: DocExample[] = [];

  for (const page of pages) {
    const markdown = readFileSync(join(baselineDir, page), 'utf8');
    const found: DocExample[] = [];

    for (const fence of fences(markdown)) {
      const classified = classify(page, fence);
      if (classified) {
        found.push({ page, line: fence.line, ...classified });
      }
    }

    assertMinExamples(page, found.length);
    examples.push(...found);
  }

  return examples;
}
