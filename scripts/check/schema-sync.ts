#!/usr/bin/env ts-node

/**
 * Schema Sync Verification Script
 *
 * Fetches the official Claude Code settings schema from schemastore.org
 * and verifies our local Zod schema produces equivalent validation results.
 *
 * This prevents schema drift and ensures our validation matches Claude Code's
 * official settings format.
 *
 * Usage:
 *   npm run check:schema-sync
 *   ts-node scripts/check/schema-sync.ts
 */

import Ajv, { type JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';
import { SettingsSchema } from '../../src/validators/schemas';
import chalk from 'chalk';

const OFFICIAL_SCHEMA_URL =
  'https://json.schemastore.org/claude-code-settings.json';

interface TestCase {
  name: string;
  data: unknown;
  shouldBeValid: boolean;
}

const testCases: TestCase[] = [
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

async function fetchOfficialSchema(): Promise<JSONSchemaType<unknown>> {
  console.log(chalk.blue('Fetching official schema from schemastore.org...'));
  const response = await fetch(OFFICIAL_SCHEMA_URL);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch schema: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<JSONSchemaType<unknown>>;
}

function validateWithZod(data: unknown): boolean {
  try {
    SettingsSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}

function validateWithAjv(ajv: Ajv, data: unknown): boolean {
  return ajv.validate('settings', data) as boolean;
}

async function main() {
  console.log(chalk.bold('\nSchema Sync Verification\n'));
  console.log('Comparing local Zod schema with official JSON schema...\n');

  let officialSchema: JSONSchemaType<unknown>;
  try {
    officialSchema = await fetchOfficialSchema();
    console.log(chalk.green('✓ Official schema fetched successfully\n'));
  } catch (error) {
    console.error(
      chalk.red('✗ Failed to fetch official schema:'),
      (error as Error).message,
    );
    console.log(
      chalk.yellow(
        '\nNote: This check requires internet connectivity to verify against the official schema.',
      ),
    );
    process.exit(1);
  }

  const ajv = new Ajv({ strict: false, allErrors: true });
  addFormats(ajv);

  ajv.addSchema(officialSchema, 'settings');

  let allTestsPassed = true;
  let differencesFound = false;

  console.log(chalk.bold('Running validation tests...\n'));

  for (const testCase of testCases) {
    const zodResult = validateWithZod(testCase.data);
    const ajvResult = validateWithAjv(ajv, testCase.data);

    const zodMatch = zodResult === testCase.shouldBeValid;
    const ajvMatch = ajvResult === testCase.shouldBeValid;
    const resultsMatch = zodResult === ajvResult;

    if (!zodMatch || !ajvMatch) {
      allTestsPassed = false;
    }

    if (!resultsMatch) {
      differencesFound = true;
      console.log(chalk.red(`✗ ${testCase.name}`));
      console.log(chalk.gray(`  Expected: ${testCase.shouldBeValid}`));
      console.log(chalk.gray(`  Zod:      ${zodResult}`));
      console.log(chalk.gray(`  Official: ${ajvResult}`));
      console.log(chalk.gray(`  → Schemas diverge!\n`));
    } else if (!zodMatch) {
      console.log(chalk.yellow(`! ${testCase.name}`));
      console.log(chalk.gray(`  Expected: ${testCase.shouldBeValid}`));
      console.log(chalk.gray(`  Got:      ${zodResult}`));
      console.log(chalk.gray(`  → Test case may be wrong\n`));
    } else {
      console.log(chalk.green(`✓ ${testCase.name}`));
    }
  }

  console.log('\n' + chalk.bold('Results:\n'));

  if (differencesFound) {
    console.log(
      chalk.red(
        '✗ Schema drift detected! Our Zod schema differs from the official schema.',
      ),
    );
    console.log(
      chalk.yellow(
        '\nAction required: Update src/validators/schemas.ts to match official schema.',
      ),
    );
    console.log(
      chalk.gray(
        `Official schema: ${OFFICIAL_SCHEMA_URL}`,
      ),
    );
    process.exit(1);
  }

  if (!allTestsPassed) {
    console.log(
      chalk.yellow(
        '! Some test cases failed, but schemas are in sync.',
      ),
    );
    console.log(
      chalk.gray(
        'This may indicate test case issues rather than schema problems.',
      ),
    );
  } else {
    console.log(
      chalk.green(
        '✓ All tests passed! Local schema matches official schema.',
      ),
    );
  }

  console.log(
    chalk.gray(
      `\nVerified against: ${OFFICIAL_SCHEMA_URL}`,
    ),
  );
  console.log(chalk.gray(`Test cases: ${testCases.length}`));
  console.log('');
}

main().catch((error) => {
  console.error(chalk.red('Error:'), error);
  process.exit(1);
});
