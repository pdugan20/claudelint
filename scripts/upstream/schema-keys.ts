/** Scoped documentation tables and JSON Schema paths used by conformance checks. */
import { z } from 'zod';

export interface TableBinding {
  heading: string;
  parent?: string;
  prefix?: string;
  min: number;
}

/** Headings inside code examples never change a table's scope. */
export function tableKeys(markdown: string, bindings: TableBinding[]): string[] {
  const found = bindings.map(() => new Set<string>());
  let heading = '';
  const ancestors: string[] = [];
  let fieldTable = false;
  let fence: string | undefined;
  for (const line of markdown.split('\n')) {
    const delimiter = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
    if (delimiter) {
      fieldTable = false;
      if (!fence) fence = delimiter;
      else if (delimiter[0] === fence[0] && delimiter.length >= fence.length) fence = undefined;
      continue;
    }
    if (fence) continue;
    const title = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (title) {
      heading = title[2];
      ancestors.length = title[1].length - 1;
      ancestors.push(heading);
    }
    if (!line.startsWith('|')) fieldTable = false;
    if (/^\|\s*[A-Za-z][^|]*\|/.test(line))
      fieldTable = /^\|\s*(Field|Key|Frontmatter)\s*\|/i.test(line);
    if (!fieldTable) continue;
    const key = /^\|\s*(?:\[)?`([$A-Za-z][A-Za-z0-9_.$-]*)`(?:\]\([^)]*\))?\s*\|/.exec(line)?.[1];
    if (!key) continue;
    bindings.forEach((binding, i) => {
      if (
        heading === binding.heading &&
        (!binding.parent || ancestors.slice(0, -1).includes(binding.parent))
      )
        found[i].add((binding.prefix ?? '') + key);
    });
  }
  bindings.forEach((binding, i) => {
    if (found[i].size < binding.min) {
      throw new Error(
        `Schema-key guard: ${binding.heading} yielded ${found[i].size} fields (floor ${binding.min}); fix extraction, never lower the guard.`
      );
    }
  });
  return [...new Set(found.flatMap((keys) => [...keys]))].sort();
}

type JsonSchema = { [key: string]: unknown };

/** Explicit properties only. A loose record does not count as modeling its unknown keys. */
export function schemaPaths(schema: z.ZodType): Set<string> {
  const root = z.toJSONSchema(schema, { unrepresentable: 'any' }) as JsonSchema;
  const paths = new Set<string>();
  function visit(node: unknown, prefix: string, stack: Set<unknown>): void {
    if (!node || typeof node !== 'object' || stack.has(node)) return;
    const current = node as JsonSchema;
    const next = new Set(stack).add(node);
    if (typeof current.$ref === 'string' && current.$ref.startsWith('#/')) {
      let ref: unknown = root;
      for (const segment of current.$ref.slice(2).split('/')) {
        ref = (ref as JsonSchema)?.[segment.replace(/~1/g, '/').replace(/~0/g, '~')];
      }
      visit(ref, prefix, next);
    }
    for (const [key, value] of Object.entries((current.properties ?? {}) as JsonSchema)) {
      paths.add(prefix + key);
      visit(value, prefix + key + '.', next);
    }
    for (const union of ['anyOf', 'oneOf', 'allOf']) {
      for (const alternative of (current[union] ?? []) as unknown[])
        visit(alternative, prefix, next);
    }
    visit(current.items, prefix + '*.', next);
    visit(current.additionalProperties, prefix + '*.', next);
  }
  visit(root, '', new Set());
  return paths;
}

export function keyDifferences(
  documented: Iterable<string>,
  modeled: Iterable<string>,
  extensions: Record<string, string> = {}
): { missing: string[]; undocumented: string[] } {
  const docs = new Set(documented);
  const code = new Set(modeled);
  return {
    missing: [...docs].filter((key) => !code.has(key)).sort(),
    undocumented: [...code].filter((key) => !docs.has(key) && !extensions[key]).sort(),
  };
}
