#!/usr/bin/env ts-node
/**
 * Schema Docs Coverage Check
 *
 * Catches the failure mode that landed us in v0.5.0 docs hell: a
 * `feat(schemas):` PR added 7 hook events, 1 hook type, 2 agent fields,
 * and 3 skill fields to the Zod schemas — but updated zero docs pages.
 * We only noticed weeks later when an agent grepped the website.
 *
 * For each schema in SCHEMA_REGISTRY, this check confirms every
 * top-level Zod field appears as a `\`field\`` row in the matching
 * page under website/api/schemas/. For the central reference page,
 * it also confirms every value in the enum constants (hook events,
 * hook types, agent permission modes, agent colors, agent effort
 * levels) appears in the corresponding table.
 *
 * The check does NOT verify the descriptions are accurate — only that
 * each field/value is documented. Prose stays hand-written.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';
import { SCHEMA_REGISTRY } from '../../src/schemas/registry';
import { AgentFrontmatterSchema } from '../../src/schemas/agent-frontmatter.schema';
import { HookEvents, HookTypes } from '../../src/schemas/constants';
import { log } from '../util/logger';

const projectRoot = join(__dirname, '../..');
const perSchemaDir = join(projectRoot, 'website', 'api', 'schemas');
const centralDocPath = join(projectRoot, 'website', 'api', 'schemas.md');

interface Violation {
  file: string;
  missing: string[];
  context: string;
}

const violations: Violation[] = [];

/**
 * Map a registry entry's schema name to its docs page filename.
 */
const SCHEMA_TO_DOC: Record<string, string> = {
  SettingsSchema: 'settings.md',
  PluginManifestSchema: 'plugin.md',
  SkillFrontmatterSchema: 'skills.md',
  HooksConfigSchema: 'hooks.md',
  MCPConfigSchema: 'mcp.md',
  LSPConfigSchema: 'lsp.md',
  AgentFrontmatterSchema: 'agents.md',
  OutputStyleFrontmatterSchema: 'output-styles.md',
  RulesFrontmatterSchema: 'rules.md',
  MarketplaceMetadataSchema: 'marketplace.md',
};

/**
 * Extract top-level field names from a Zod object schema. Walks through
 * any wrappers (optional, nullable) at the root level to find the object.
 */
function topLevelFields(schema: z.ZodTypeAny): string[] {
  let inner: unknown = schema;
  // Unwrap optional/nullable/default at the root if present.
  while (
    inner &&
    typeof inner === 'object' &&
    'def' in inner &&
    inner.def &&
    typeof inner.def === 'object' &&
    'innerType' in inner.def
  ) {
    inner = (inner.def as { innerType: unknown }).innerType;
  }
  if (
    inner &&
    typeof inner === 'object' &&
    'shape' in inner &&
    inner.shape &&
    typeof inner.shape === 'object'
  ) {
    return Object.keys(inner.shape as Record<string, unknown>);
  }
  return [];
}

/**
 * Extract enum values from a Zod enum schema (unwrapping optional first).
 */
function enumValues(schema: z.ZodTypeAny): string[] {
  let inner: unknown = schema;
  while (
    inner &&
    typeof inner === 'object' &&
    'def' in inner &&
    inner.def &&
    typeof inner.def === 'object' &&
    'innerType' in inner.def
  ) {
    inner = (inner.def as { innerType: unknown }).innerType;
  }
  if (inner && typeof inner === 'object' && 'options' in inner) {
    const options = (inner as { options: unknown }).options;
    if (Array.isArray(options)) {
      return options as string[];
    }
  }
  return [];
}

/**
 * Find tokens of the form `name` in a markdown file. Used both for
 * field names in tables and for enum values listed in valid-values
 * tables.
 */
function backtickedTokens(markdown: string): Set<string> {
  const matches = markdown.matchAll(/`([^`\n]+)`/g);
  return new Set(Array.from(matches, (m) => m[1]));
}

/**
 * Per-schema check: every top-level Zod field must appear as `field` in
 * the matching docs page.
 */
function checkPerSchemaPages(): void {
  for (const entry of SCHEMA_REGISTRY) {
    const docFilename = SCHEMA_TO_DOC[entry.name];
    if (!docFilename) {
      // Schema is in registry but not mapped — flag so it's not silently ignored.
      violations.push({
        file: 'src/schemas/registry.ts',
        missing: [entry.name],
        context: 'No docs page mapping in scripts/check/schema-docs-coverage.ts',
      });
      continue;
    }
    const docPath = join(perSchemaDir, docFilename);
    if (!existsSync(docPath)) {
      violations.push({
        file: `website/api/schemas/${docFilename}`,
        missing: [],
        context: `Doc page does not exist for ${entry.name}`,
      });
      continue;
    }
    const markdown = readFileSync(docPath, 'utf-8');
    const documented = backtickedTokens(markdown);
    const fields = topLevelFields(entry.zodSchema);
    const missing = fields.filter((f) => !documented.has(f));
    if (missing.length > 0) {
      violations.push({
        file: `website/api/schemas/${docFilename}`,
        missing,
        context: `Zod fields in ${entry.name} not documented`,
      });
    }
  }
}

/**
 * Central reference page check: every enum value in the listed
 * constants must appear as `value` in schemas.md.
 */
function checkCentralReference(): void {
  const markdown = readFileSync(centralDocPath, 'utf-8');
  const documented = backtickedTokens(markdown);

  type EnumCheck = { label: string; values: string[] };
  const checks: EnumCheck[] = [
    { label: 'Hook Events', values: enumValues(HookEvents) },
    { label: 'Hook Types', values: enumValues(HookTypes) },
    {
      label: 'Permission Modes (agent.permissionMode)',
      values: enumValues(
        (AgentFrontmatterSchema as unknown as { shape: Record<string, z.ZodTypeAny> }).shape
          .permissionMode
      ),
    },
    {
      label: 'Agent Colors (agent.color)',
      values: enumValues(
        (AgentFrontmatterSchema as unknown as { shape: Record<string, z.ZodTypeAny> }).shape.color
      ),
    },
    {
      label: 'Effort Levels (agent.effort)',
      values: enumValues(
        (AgentFrontmatterSchema as unknown as { shape: Record<string, z.ZodTypeAny> }).shape.effort
      ),
    },
  ];

  for (const { label, values } of checks) {
    if (values.length === 0) {
      violations.push({
        file: 'scripts/check/schema-docs-coverage.ts',
        missing: [],
        context: `Could not extract enum values for ${label} — schema introspection broke`,
      });
      continue;
    }
    const missing = values.filter((v) => !documented.has(v));
    if (missing.length > 0) {
      violations.push({
        file: 'website/api/schemas.md',
        missing,
        context: `${label} values not documented`,
      });
    }
  }
}

function main(): void {
  log.section('Schema docs coverage check');
  log.dim(`Comparing ${SCHEMA_REGISTRY.length} Zod schemas against website docs`);
  log.blank();

  checkPerSchemaPages();
  checkCentralReference();

  if (violations.length === 0) {
    log.success('All Zod schema fields and enum values are documented');
    return;
  }

  log.error(`Found ${violations.length} coverage gap(s):`);
  log.blank();
  for (const v of violations) {
    log.bold(v.file);
    log.dim(`  ${v.context}`);
    if (v.missing.length > 0) {
      for (const m of v.missing) {
        log.error(`    missing: \`${m}\``);
      }
    }
    log.blank();
  }
  log.error('Add the missing entries to the corresponding doc page, then re-run.');
  process.exit(1);
}

main();
