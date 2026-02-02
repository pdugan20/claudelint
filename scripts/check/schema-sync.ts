#!/usr/bin/env ts-node

/**
 * Schema Sync Verification Script
 *
 * Verifies that all claudelint schemas stay synchronized with official
 * Claude Code specifications. Prevents schema drift and ensures our
 * validation matches Claude Code's official formats.
 *
 * Verification Methods:
 * 1. JSON Schema comparison (SettingsSchema)
 * 2. Documentation scraping (PluginManifestSchema, SkillFrontmatterSchema)
 * 3. Manual verification guidance (MCP, LSP, Agent, OutputStyle)
 *
 * Usage:
 *   npm run check:schema-sync
 *   ts-node scripts/check/schema-sync.ts
 */

import Ajv, { type JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';
import {
  SettingsSchema,
  PluginManifestSchema,
  HooksConfigSchema,
  MCPConfigSchema,
} from '../../src/validators/schemas';
import {
  SkillFrontmatterSchema,
  AgentFrontmatterSchema,
  OutputStyleFrontmatterSchema,
  ClaudeMdFrontmatterSchema,
} from '../../src/schemas';
import { LSPConfigSchema } from '../../src/schemas/lsp-config.schema';
import chalk from 'chalk';

// Schema registry with official sources
interface SchemaInfo {
  name: string;
  schema: unknown;
  officialSource: string;
  verificationType: 'json-schema' | 'documentation' | 'manual';
  priority: 'high' | 'medium' | 'low';
  status: 'synced' | 'needs-verification' | 'out-of-sync';
}

const SCHEMA_REGISTRY: SchemaInfo[] = [
  {
    name: 'SettingsSchema',
    schema: SettingsSchema,
    officialSource: 'https://json.schemastore.org/claude-code-settings.json',
    verificationType: 'json-schema',
    priority: 'low',
    status: 'synced',
  },
  {
    name: 'PluginManifestSchema',
    schema: PluginManifestSchema,
    officialSource:
      'https://code.claude.com/docs/en/plugins-reference#complete-schema',
    verificationType: 'documentation',
    priority: 'high',
    status: 'synced',
  },
  {
    name: 'SkillFrontmatterSchema',
    schema: SkillFrontmatterSchema,
    officialSource: 'https://code.claude.com/docs/en/skills',
    verificationType: 'documentation',
    priority: 'low',
    status: 'synced',
  },
  {
    name: 'HooksConfigSchema',
    schema: HooksConfigSchema,
    officialSource: 'Derived from SettingsSchema',
    verificationType: 'manual',
    priority: 'medium',
    status: 'synced',
  },
  {
    name: 'MCPConfigSchema',
    schema: MCPConfigSchema,
    officialSource: 'https://modelcontextprotocol.io/',
    verificationType: 'manual',
    priority: 'high',
    status: 'needs-verification',
  },
  {
    name: 'LSPConfigSchema',
    schema: LSPConfigSchema,
    officialSource: 'https://microsoft.github.io/language-server-protocol/',
    verificationType: 'manual',
    priority: 'high',
    status: 'needs-verification',
  },
  {
    name: 'AgentFrontmatterSchema',
    schema: AgentFrontmatterSchema,
    officialSource: 'https://code.claude.com/docs/en/sub-agents',
    verificationType: 'manual',
    priority: 'high',
    status: 'needs-verification',
  },
  {
    name: 'OutputStyleFrontmatterSchema',
    schema: OutputStyleFrontmatterSchema,
    officialSource:
      'https://code.claude.com/docs/en/plugins-reference#output-styles',
    verificationType: 'manual',
    priority: 'medium',
    status: 'needs-verification',
  },
  {
    name: 'ClaudeMdFrontmatterSchema',
    schema: ClaudeMdFrontmatterSchema,
    officialSource: 'Claude Code documentation (CLAUDE.md format)',
    verificationType: 'manual',
    priority: 'medium',
    status: 'needs-verification',
  },
];

// Test cases for SettingsSchema
interface TestCase {
  name: string;
  data: unknown;
  shouldBeValid: boolean;
}

const settingsTestCases: TestCase[] = [
  {
    name: 'Valid permissions with allow/deny/ask',
    data: {
      permissions: {
        allow: ['Bash(npm run *)', 'Read', 'Write'],
        deny: ['Bash(rm -rf *)', 'WebFetch'],
        ask: ['Edit'],
      },
    },
    shouldBeValid: true,
  },
  {
    name: 'Valid permissions with defaultMode',
    data: {
      permissions: {
        allow: ['Bash', 'Read'],
        defaultMode: 'plan',
      },
    },
    shouldBeValid: true,
  },
  {
    name: 'Valid permissions with additionalDirectories',
    data: {
      permissions: {
        allow: ['Read', 'Write'],
        additionalDirectories: ['/tmp', '/var/log'],
      },
    },
    shouldBeValid: true,
  },
  {
    name: 'Valid settings with env and hooks',
    data: {
      permissions: {
        allow: ['Bash'],
      },
      env: {
        API_KEY: '${SECRET_KEY}',
      },
      hooks: {
        PreToolUse: [
          {
            hooks: [
              {
                type: 'command',
                command: 'echo test',
              },
            ],
          },
        ],
      },
    },
    shouldBeValid: true,
  },
  {
    name: 'Invalid permissions (wrong type)',
    data: {
      permissions: 'not-an-object',
    },
    shouldBeValid: false,
  },
  {
    name: 'Invalid permissions.allow (not array)',
    data: {
      permissions: {
        allow: 'Bash',
      },
    },
    shouldBeValid: false,
  },
  {
    name: 'Invalid defaultMode value',
    data: {
      permissions: {
        defaultMode: 'invalid-mode',
      },
    },
    shouldBeValid: false,
  },
  {
    name: 'Empty settings (should be valid)',
    data: {},
    shouldBeValid: true,
  },
];

async function fetchOfficialSchema(url: string): Promise<JSONSchemaType<unknown>> {
  console.log(chalk.gray(`  Fetching from ${url}...`));
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch schema: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<JSONSchemaType<unknown>>;
}

function validateWithZod(schema: unknown, data: unknown): boolean {
  try {
    (schema as { parse: (data: unknown) => unknown }).parse(data);
    return true;
  } catch {
    return false;
  }
}

function validateWithAjv(ajv: Ajv, schemaName: string, data: unknown): boolean {
  return ajv.validate(schemaName, data) as boolean;
}

async function verifySettingsSchema(): Promise<boolean> {
  console.log(chalk.bold('\n1. SettingsSchema (JSON Schema verification)'));
  console.log(chalk.gray('   Source: https://json.schemastore.org/claude-code-settings.json'));
  console.log(chalk.gray('   Status: SYNCED\n'));

  let officialSchema: JSONSchemaType<unknown>;
  try {
    officialSchema = await fetchOfficialSchema(
      'https://json.schemastore.org/claude-code-settings.json',
    );
    console.log(chalk.green('   ✓ Official schema fetched\n'));
  } catch (error) {
    console.error(
      chalk.red('   ✗ Failed to fetch official schema:'),
      (error as Error).message,
    );
    return false;
  }

  const ajv = new Ajv({ strict: false, allErrors: true });
  addFormats(ajv);
  ajv.addSchema(officialSchema, 'settings');

  let differencesFound = false;

  for (const testCase of settingsTestCases) {
    const zodResult = validateWithZod(SettingsSchema, testCase.data);
    const ajvResult = validateWithAjv(ajv, 'settings', testCase.data);
    const resultsMatch = zodResult === ajvResult;

    if (!resultsMatch) {
      differencesFound = true;
      console.log(chalk.red(`   ✗ ${testCase.name}`));
      console.log(chalk.gray(`     Expected: ${testCase.shouldBeValid}`));
      console.log(chalk.gray(`     Zod:      ${zodResult}`));
      console.log(chalk.gray(`     Official: ${ajvResult}`));
      console.log(chalk.gray(`     → Schemas diverge!\n`));
    }
  }

  if (differencesFound) {
    console.log(chalk.red('   ✗ Schema drift detected!\n'));
    return false;
  }

  console.log(chalk.green(`   ✓ All ${settingsTestCases.length} test cases passed\n`));
  return true;
}

function verifyPluginManifestSchema(): boolean {
  console.log(chalk.bold('\n2. PluginManifestSchema (Documentation verification)'));
  console.log(chalk.gray('   Source: https://code.claude.com/docs/en/plugins-reference#complete-schema'));
  console.log(chalk.gray('   Status: SYNCED (fixed in Phase 1)\n'));

  // Test cases based on official spec
  const testCases = [
    {
      name: 'Valid minimal plugin',
      data: { name: 'my-plugin' },
      shouldBeValid: true,
    },
    {
      name: 'Valid plugin with metadata',
      data: {
        name: 'my-plugin',
        version: '1.0.0',
        description: 'A test plugin',
        author: 'John Doe',
      },
      shouldBeValid: true,
    },
    {
      name: 'Valid plugin with component paths',
      data: {
        name: 'my-plugin',
        skills: '.claude/skills',
        commands: ['.claude/commands'],
      },
      shouldBeValid: true,
    },
    {
      name: 'Invalid - missing required name',
      data: { version: '1.0.0' },
      shouldBeValid: false,
    },
    {
      name: 'Invalid - name not a string',
      data: { name: 123 },
      shouldBeValid: false,
    },
  ];

  let allPassed = true;
  for (const testCase of testCases) {
    const result = validateWithZod(PluginManifestSchema, testCase.data);
    if (result !== testCase.shouldBeValid) {
      allPassed = false;
      console.log(chalk.red(`   ✗ ${testCase.name}`));
      console.log(chalk.gray(`     Expected: ${testCase.shouldBeValid}, Got: ${result}`));
    }
  }

  if (!allPassed) {
    console.log(chalk.red('   ✗ Schema validation failed\n'));
    return false;
  }

  console.log(chalk.green(`   ✓ All ${testCases.length} test cases passed\n`));
  return true;
}

function verifySkillFrontmatterSchema(): boolean {
  console.log(chalk.bold('\n3. SkillFrontmatterSchema (Documentation verification)'));
  console.log(chalk.gray('   Source: https://code.claude.com/docs/en/skills'));
  console.log(chalk.gray('   Status: SYNCED\n'));

  // Test cases based on official docs
  const testCases = [
    {
      name: 'Valid minimal skill',
      data: {
        name: 'my-skill',
        description: 'This skill does something useful',
      },
      shouldBeValid: true,
    },
    {
      name: 'Valid skill with version',
      data: {
        name: 'test-skill',
        description: 'A test skill for validation',
        version: '1.0.0',
      },
      shouldBeValid: true,
    },
    {
      name: 'Valid skill with model and context',
      data: {
        name: 'complex-skill',
        description: 'A complex skill with multiple options',
        model: 'sonnet',
        context: 'fork',
        agent: 'my-agent',
      },
      shouldBeValid: true,
    },
    {
      name: 'Invalid - missing required name',
      data: { description: 'Missing name' },
      shouldBeValid: false,
    },
    {
      name: 'Invalid - name with uppercase',
      data: {
        name: 'MySkill',
        description: 'This skill has uppercase name',
      },
      shouldBeValid: false,
    },
    {
      name: 'Invalid - context fork without agent',
      data: {
        name: 'broken-skill',
        description: 'This skill has context fork but no agent',
        context: 'fork',
      },
      shouldBeValid: false,
    },
  ];

  let allPassed = true;
  for (const testCase of testCases) {
    try {
      const schema =
        testCase.name === 'Invalid - context fork without agent'
          ? require('../../src/schemas/skill-frontmatter.schema')
              .SkillFrontmatterWithRefinements
          : SkillFrontmatterSchema;

      const result = validateWithZod(schema, testCase.data);
      if (result !== testCase.shouldBeValid) {
        allPassed = false;
        console.log(chalk.red(`   ✗ ${testCase.name}`));
        console.log(chalk.gray(`     Expected: ${testCase.shouldBeValid}, Got: ${result}`));
      }
    } catch {
      if (testCase.shouldBeValid) {
        allPassed = false;
        console.log(chalk.red(`   ✗ ${testCase.name}`));
        console.log(chalk.gray(`     Expected: valid, Got: invalid`));
      }
    }
  }

  if (!allPassed) {
    console.log(chalk.red('   ✗ Schema validation failed\n'));
    return false;
  }

  console.log(chalk.green(`   ✓ All ${testCases.length} test cases passed\n`));
  return true;
}

function printManualVerificationGuidance(): void {
  console.log(chalk.bold('\n4. Schemas Requiring Manual Verification'));
  console.log(chalk.gray('   These schemas need manual review against official documentation:\n'));

  const manualSchemas = SCHEMA_REGISTRY.filter((s) => s.verificationType === 'manual');

  for (const schema of manualSchemas) {
    const statusIcon = schema.status === 'synced' ? '[OK]' : '[WARN]';
    const statusColor = schema.status === 'synced' ? chalk.green : chalk.yellow;
    const priorityBadge = chalk.gray(`[${schema.priority.toUpperCase()}]`);

    console.log(statusColor(`   ${statusIcon} ${schema.name}`) + ` ${priorityBadge}`);
    console.log(chalk.gray(`     Source: ${schema.officialSource}`));
    console.log(chalk.gray(`     Status: ${schema.status.toUpperCase()}\n`));
  }

  console.log(chalk.yellow('   Manual verification checklist:'));
  console.log(chalk.gray('   1. Read official documentation for schema'));
  console.log(chalk.gray('   2. Compare field names, types, required/optional status'));
  console.log(chalk.gray('   3. Check for missing or extra fields in our schema'));
  console.log(chalk.gray('   4. Update schema if differences found'));
  console.log(chalk.gray('   5. Document any intentional deviations in comments\n'));
}

function printSchemaInventory(): void {
  console.log(chalk.bold('\nSchema Inventory Summary'));
  console.log(chalk.gray('Total schemas: ' + SCHEMA_REGISTRY.length + '\n'));

  const byStatus = {
    synced: SCHEMA_REGISTRY.filter((s) => s.status === 'synced').length,
    'needs-verification': SCHEMA_REGISTRY.filter((s) => s.status === 'needs-verification')
      .length,
    'out-of-sync': SCHEMA_REGISTRY.filter((s) => s.status === 'out-of-sync').length,
  };

  console.log(chalk.green(`[OK] Synced: ${byStatus.synced}`));
  console.log(chalk.yellow(`[WARN] Needs verification: ${byStatus['needs-verification']}`));
  console.log(chalk.red(`[ERROR] Out of sync: ${byStatus['out-of-sync']}`));
  console.log('');

  const byPriority = {
    high: SCHEMA_REGISTRY.filter((s) => s.priority === 'high').length,
    medium: SCHEMA_REGISTRY.filter((s) => s.priority === 'medium').length,
    low: SCHEMA_REGISTRY.filter((s) => s.priority === 'low').length,
  };

  console.log(chalk.gray(`Priority breakdown:`));
  console.log(chalk.gray(`  High: ${byPriority.high}`));
  console.log(chalk.gray(`  Medium: ${byPriority.medium}`));
  console.log(chalk.gray(`  Low: ${byPriority.low}`));
  console.log('');
}

async function main() {
  console.log(chalk.bold('\n=== Schema Sync Verification ===\n'));
  console.log('Verifying claudelint schemas against official Claude Code specifications...\n');

  printSchemaInventory();

  const results = {
    settingsSchema: await verifySettingsSchema(),
    pluginManifestSchema: verifyPluginManifestSchema(),
    skillFrontmatterSchema: verifySkillFrontmatterSchema(),
  };

  printManualVerificationGuidance();

  console.log(chalk.bold('\n=== Verification Results ===\n'));

  const allAutomatedPassed = Object.values(results).every((r) => r);

  if (allAutomatedPassed) {
    console.log(chalk.green('✓ All automated verifications passed!\n'));
    console.log(chalk.gray('Next steps:'));
    console.log(chalk.gray('1. Manually verify schemas marked for manual verification'));
    console.log(chalk.gray('2. Run this check regularly (pre-commit hook recommended)'));
    console.log(chalk.gray('3. Update schemas when Claude Code releases new versions\n'));
    process.exit(0);
  } else {
    console.log(chalk.red('✗ Some automated verifications failed!\n'));
    console.log(chalk.yellow('Action required:'));
    console.log(chalk.gray('1. Review failed schemas above'));
    console.log(chalk.gray('2. Update src/validators/schemas.ts or src/schemas/ to match official specs'));
    console.log(chalk.gray('3. Re-run this check until all verifications pass\n'));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(chalk.red('Error:'), error);
  process.exit(1);
});
