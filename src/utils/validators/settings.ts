import { basename } from 'path';
import { safeParseJSON } from '../formats/json';
import { isObject } from '../type-guards';

/** Whether a rule is being run against either supported settings filename. */
export function isSettingsFile(filePath: string): boolean {
  return ['settings.json', 'settings.local.json'].includes(basename(filePath));
}

/** Read raw settings without assuming malformed JSON values have schema types. */
export function readSettings(filePath: string, content: string): Record<string, unknown> | null {
  if (!isSettingsFile(filePath)) return null;
  const settings = safeParseJSON(content);
  return isObject(settings) ? settings : null;
}

export type PermissionList = 'allow' | 'deny' | 'ask';

/** Iterate well-typed entries; the schema reports malformed containers and elements. */
export function permissionEntries(
  filePath: string,
  content: string
): Array<{ name: PermissionList; rule: string }> {
  const settings = readSettings(filePath, content);
  if (!settings || !isObject(settings.permissions)) return [];
  const entries: Array<{ name: PermissionList; rule: string }> = [];
  for (const name of ['allow', 'deny', 'ask'] as const) {
    const values = settings.permissions[name];
    if (!Array.isArray(values)) continue;
    for (const rule of values) {
      if (typeof rule === 'string') entries.push({ name, rule });
    }
  }
  return entries;
}

/** The first opening and final closing parenthesis delimit a literal specifier. */
export function parsePermissionRule(rule: string): { tool: string; pattern?: string } | null {
  if (!rule.trim()) return null;
  const opening = rule.indexOf('(');
  if (opening === -1) return rule.includes(')') ? null : { tool: rule.trim() };
  const tool = rule.slice(0, opening);
  if (!tool.trim() || tool.includes(')') || !rule.endsWith(')')) return null;
  return { tool: tool.trim(), pattern: rule.slice(opening + 1, -1) };
}
