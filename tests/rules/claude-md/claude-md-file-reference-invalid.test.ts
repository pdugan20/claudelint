/**
 * Tests for claude-md-file-reference-invalid rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/claude-md/claude-md-file-reference-invalid';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const ruleTester = new ClaudeLintRuleTester();

describe('claude-md-file-reference-invalid', () => {
  const testDir = join(tmpdir(), 'claude-lint-test-file-refs');
  const srcDir = join(testDir, 'src');
  const scriptsDir = join(testDir, 'scripts');

  beforeEach(() => {
    mkdirSync(srcDir, { recursive: true });
    mkdirSync(scriptsDir, { recursive: true });
    writeFileSync(join(srcDir, 'index.ts'), 'export {};');
    writeFileSync(join(scriptsDir, 'build.sh'), '#!/bin/bash\necho build');
    writeFileSync(join(testDir, '.prettierrc.json'), '{}');
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('should pass when file references exist', async () => {
    const claudeFile = join(testDir, 'CLAUDE.md');

    await ruleTester.run('claude-md-file-reference-invalid', rule, {
      valid: [
        // Inline code reference to existing file
        {
          content: '# Project\n\nEdit `src/index.ts` for the entry point.\n',
          filePath: claudeFile,
        },
        // Bash code block with existing file
        {
          content: '# Project\n\n```bash\n./scripts/build.sh\n```\n',
          filePath: claudeFile,
        },
        // No file references
        {
          content: '# Project\n\nJust regular text.\n',
          filePath: claudeFile,
        },
        // URLs should be skipped
        {
          content: '# Project\n\nSee `https://example.com/docs/guide.md`.\n',
          filePath: claudeFile,
        },
        // Glob patterns should be skipped
        {
          content: '# Project\n\nMatch `src/**/*.ts` files.\n',
          filePath: claudeFile,
        },
        // Template variables should be skipped
        {
          content: '# Project\n\nUse `${CLAUDE_PLUGIN_ROOT}/scripts/init.sh`.\n',
          filePath: claudeFile,
        },
        // Non-bash code blocks should be skipped
        {
          content: '# Project\n\n```json\n{"path": "src/nonexistent.ts"}\n```\n',
          filePath: claudeFile,
        },
        // Tilde fence bash block with existing file
        {
          content: '# Project\n\n~~~bash\n./scripts/build.sh\n~~~\n',
          filePath: claudeFile,
        },
        // Tilde fence non-bash block should be skipped
        {
          content: '# Project\n\n~~~json\n{"path": "src/nonexistent.ts"}\n~~~\n',
          filePath: claudeFile,
        },
        // Version-like patterns should be skipped
        {
          content: '# Project\n\nVersion `0.2.0` released.\n',
          filePath: claudeFile,
        },
      ],
      invalid: [
        // Inline code reference to missing file
        {
          content: '# Project\n\nEdit `src/missing.ts` for changes.\n',
          filePath: claudeFile,
          errors: [{ message: 'File reference "src/missing.ts" does not exist' }],
        },
        // Bash code block with missing file
        {
          content: '# Project\n\n```bash\n./scripts/deploy.sh\n```\n',
          filePath: claudeFile,
          errors: [{ message: 'File reference "./scripts/deploy.sh" does not exist' }],
        },
        // Multiple missing references
        {
          content: '# Project\n\nSee `src/foo.ts` and `src/bar.ts`.\n',
          filePath: claudeFile,
          errors: [{ message: 'src/foo.ts' }, { message: 'src/bar.ts' }],
        },
        // Tilde fence bash block with missing file
        {
          content: '# Project\n\n~~~bash\n./scripts/deploy.sh\n~~~\n',
          filePath: claudeFile,
          errors: [{ message: 'File reference "./scripts/deploy.sh" does not exist' }],
        },
      ],
    });
  });
});
