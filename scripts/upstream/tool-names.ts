/**
 * Which tool names does Claude Code actually document?
 *
 * The tool list was the one major schema surface in this repo with NO doc authority:
 * `tools-reference` was absent from the watchlist, so no baseline was snapshotted and no
 * gate could see it. It drifted 18 documented tools behind while every watched surface
 * stayed current, and each of those 18 was a live false positive -- a user writing
 * `Artifact` or `TodoWrite` in `permissions.allow` was told it was an invalid tool name.
 *
 * That is the same failure `settings.md` had before #143 (`governs: []`), so this mirrors
 * scripts/upstream/settings-keys.ts deliberately.
 *
 * Deriving the documented set is the difficulty, exactly as it was for settings. Two
 * tables on this page have a backticked first column and only ONE lists tools:
 *
 *   - `| Tool | Description | ... |`        <- the tool list
 *   - `| Rule format | Applies to | ... |`  <- permission-rule EXAMPLES (`Bash(npm run *)`,
 *                                              `Read(~/secrets/**)`, `Agent(Explore)`)
 *
 * A naive scrape of every backticked first cell would model `Bash(npm run *)` as a tool
 * name. So the extractor binds to the table whose header cell is `Tool`, and stops at the
 * next heading -- rather than trusting the backticks.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

/** The header cell that identifies the one table listing tool names. */
const TOOL_TABLE_HEADER = 'Tool';

/**
 * Modeled but not documented, on purpose. Anything here must carry a reason -- an
 * unexplained entry is indistinguishable from a hallucination, which is what this gate
 * exists to catch. Do not add an entry merely to make the build green.
 */
export const KNOWN_TOOL_EXTENSIONS: Record<string, string> = {
  Task: 'Renamed to `Agent` in v2.1.63 and dropped from the tools table. Retained so that settings written against an older Claude Code keep linting; the live CLI still exposes `Task`.',
  SlashCommand:
    'Retired upstream: folded into the `Skill` tool, and tools-reference.md now says reusable prompt workflows "run through the existing `Skill` tool rather than adding a new tool entry". Retained as a back-compat alias (as with `Task`) so that permission entries written when it was current do not error. Reported in #122.',
};

/**
 * Below this, assume the table parser broke rather than that upstream deleted its tools.
 * Never lower this to make a red build pass.
 */
export const MIN_DOCUMENTED_TOOLS = 35;

/** Tool names documented in the tools reference. */
export function documentedToolNames(markdown: string): string[] {
  const names = new Set<string>();
  let inToolTable = false;

  for (const line of markdown.split('\n')) {
    // A heading ends whatever table we were in.
    if (/^#{1,6}\s+/.test(line)) {
      inToolTable = false;
      continue;
    }

    const header = /^\|\s*([A-Za-z][A-Za-z ]*?)\s*\|/.exec(line);
    if (header && !line.includes('`')) {
      // Header rows carry no backticks; body rows do. This is what separates the tool
      // table from the permission-rule table sitting under a later heading.
      inToolTable = header[1].trim() === TOOL_TABLE_HEADER;
      continue;
    }

    if (!inToolTable) continue;

    // A tool name is a bare identifier. `Bash(npm run *)` is a permission RULE, not a
    // tool, and the paren guard keeps one out even if the table binding ever slips.
    const row = /^\|\s*`([A-Za-z][A-Za-z0-9_]*)`\s*\|/.exec(line);
    if (row) names.add(row[1]);
  }

  return [...names].sort();
}

export function assertMinDocumentedTools(count: number): void {
  if (count < MIN_DOCUMENTED_TOOLS) {
    throw new Error(
      `Tool-name guard tripped: only ${count} documented tools were parsed ` +
        `(floor: ${MIN_DOCUMENTED_TOOLS}). Upstream likely restyled the tool table. ` +
        `Fix the parser - do not lower MIN_DOCUMENTED_TOOLS to make this pass.`
    );
  }
}

export function loadToolsDoc(baselineDir: string): string {
  return readFileSync(join(baselineDir, 'tools-reference.md'), 'utf8');
}
