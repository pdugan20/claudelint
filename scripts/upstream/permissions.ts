import { rule as names } from '../../src/rules/settings/settings-invalid-permission';
import { rule as syntax } from '../../src/rules/settings/settings-permission-invalid-rule';
import { rule as empty } from '../../src/rules/settings/settings-permission-empty-pattern';
import { isObject } from '../../src/utils/type-guards';
import { PermissionList } from '../../src/utils/validators/settings';

export const MIN_PERMISSION_EXAMPLES = 15;
const PREFIX = 'permission-rule:';

/** Positive permission examples from configuration blocks and rule tables. */
export function extractPermissionRules(markdown: string): string[] {
  const facts = new Set<string>();
  const add = (list: PermissionList, value: string) =>
    facts.add(PREFIX + JSON.stringify([list, value]));
  for (const block of markdown.matchAll(/```json[^\n]*\n([\s\S]*?)```/g)) {
    const config: unknown = JSON.parse(block[1]);
    if (!isObject(config) || !('permissions' in config)) continue;
    if (!isObject(config.permissions)) throw new Error('Malformed permissions example container');
    for (const list of ['allow', 'deny', 'ask'] as const) {
      const rules = config.permissions[list];
      if (rules === undefined) continue;
      if (!Array.isArray(rules) || rules.some((rule) => typeof rule !== 'string')) {
        throw new Error(`Malformed permissions.${list} example`);
      }
      for (const rule of rules) add(list, rule as string);
    }
  }
  let table: PermissionList | null = null;
  let inFence = false;
  for (const line of markdown.split('\n')) {
    if (/^```/.test(line)) {
      inFence = !inFence;
      table = null;
      continue;
    }
    if (inFence) continue;
    if (!line.startsWith('|')) {
      table = null;
      continue;
    }
    if (/^\|\s*Rule\s*\|/.test(line)) {
      table = 'deny';
      continue;
    }
    if (/^\|\s*You write\s*\|/.test(line)) {
      table = 'allow';
      continue;
    }
    if (!table) continue;
    const match = line.match(/^\|\s*`([A-Za-z*][A-Za-z0-9_*]*(?:\(.*?\))?)`\s*\|/);
    if (match) add(table, match[1]);
  }
  return [...facts].sort();
}

/** Run the actual semantic rules against the documented examples in both file scopes. */
export async function checkPermissionExamples(facts: string[]): Promise<string[]> {
  if (facts.length < MIN_PERMISSION_EXAMPLES) {
    throw new Error(
      `Permission examples yielded ${facts.length}; expected >= ${MIN_PERMISSION_EXAMPLES}`
    );
  }
  const findings: string[] = [];
  for (const fact of facts) {
    if (!fact.startsWith(PREFIX)) throw new Error(`Unexpected permission fact: ${fact}`);
    const [list, value] = JSON.parse(fact.slice(PREFIX.length)) as [PermissionList, string];
    for (const filename of ['settings.json', 'settings.local.json']) {
      for (const rule of [names, syntax, empty]) {
        await rule.validate({
          filePath: `/project/.claude/${filename}`,
          fileContent: JSON.stringify({ permissions: { [list]: [value] } }),
          options: {},
          report: (issue) =>
            findings.push(`${filename}: ${rule.meta.id}: ${list} ${value}: ${issue.message}`),
        });
      }
    }
  }
  return findings;
}
