/**
 * Tests for claude-md-npm-script-not-found rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/claude-md/claude-md-npm-script-not-found';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const ruleTester = new ClaudeLintRuleTester();

describe('claude-md-npm-script-not-found', () => {
  const testDir = join(tmpdir(), 'claude-lint-test-npm-scripts');

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true });
    // Create a package.json with known scripts
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify({
        scripts: {
          build: 'tsc',
          test: 'jest',
          lint: 'eslint src',
          'lint:fix': 'eslint src --fix',
          'release:dry': 'release-it --dry-run',
        },
      })
    );
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('handles flags, command boundaries, and commands targeting other packages', async () => {
    await ruleTester.run('claude-md-npm-script-not-found', rule, {
      valid: [
        'npm run --silent build', 'npm --silent run build', 'pnpm run --silent build',
        'npm run --loglevel error build', 'npm run --loglevel=error build',
        'npm run "build"', 'npm run -- build', 'npm run build -- --other-flag',
        'pnpm run --filter web other-package-script', 'pnpm --filter web run other-package-script',
        'npm run other-package-script --workspace web', 'npm --prefix web run other-package-script',
        'npm run --if-present optional', 'npm run --unknown value build',
        'notnpm run nonexistent', '# npm run nonexistent', 'pnpm run "/build:.*/"',
      ].map(content => ({ content, filePath: join(testDir, 'CLAUDE.md') })),
      invalid: ['npm run --silent typo', 'pnpm run --loglevel error typo', 'npm run build && npm run typo'].map(content => ({
        content, filePath: join(testDir, 'CLAUDE.md'), errors: [{ message: 'npm script "typo"' }],
      })),
    });
  });

  it('should pass when all npm scripts exist', async () => {
    const claudeFile = join(testDir, 'CLAUDE.md');

    await ruleTester.run('claude-md-npm-script-not-found', rule, {
      valid: [
        {
          content: '# Project\n\nRun `npm run build` to compile.\n',
          filePath: claudeFile,
        },
        {
          content: '# Project\n\nRun `npm run test` and `npm run lint`.\n',
          filePath: claudeFile,
        },
        // Colon-separated script names
        {
          content: '# Project\n\nRun `npm run lint:fix` for auto-fix.\n',
          filePath: claudeFile,
        },
        // Scripts inside code blocks
        {
          content: '# Project\n\n```bash\nnpm run build\nnpm run test\n```\n',
          filePath: claudeFile,
        },
        // No npm run references at all
        {
          content: '# Project\n\nJust some content.\n',
          filePath: claudeFile,
        },
      ],
      invalid: [
        // Non-existent script
        {
          content: '# Project\n\nRun `npm run deploy` to deploy.\n',
          filePath: claudeFile,
          errors: [{ message: 'npm script "deploy" is referenced but does not exist in package.json' }],
        },
        // Mix of valid and invalid
        {
          content: '# Project\n\nRun `npm run build` then `npm run publish`.\n',
          filePath: claudeFile,
          errors: [{ message: 'npm script "publish"' }],
        },
        // Multiple invalid
        {
          content: '# Project\n\nnpm run foo\nnpm run bar\n',
          filePath: claudeFile,
          errors: [{ message: 'npm script "foo"' }, { message: 'npm script "bar"' }],
        },
      ],
    });
  });

  it('should skip when no package.json exists', async () => {
    const isolatedDir = join(tmpdir(), 'claude-lint-test-no-pkg');
    mkdirSync(isolatedDir, { recursive: true });

    try {
      const claudeFile = join(isolatedDir, 'CLAUDE.md');

      await ruleTester.run('claude-md-npm-script-not-found', rule, {
        valid: [
          // Should not error even with bad refs when no package.json
          {
            content: '# Project\n\nnpm run nonexistent\n',
            filePath: claudeFile,
          },
        ],
        invalid: [],
      });
    } finally {
      rmSync(isolatedDir, { recursive: true, force: true });
    }
  });
});
