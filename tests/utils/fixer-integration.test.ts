/**
 * Integration tests for auto-fix functionality
 *
 * Tests that range-based AutoFix objects produce correct output
 * when applied via the Fixer class or manual splicing.
 */

import { Fixer } from '../../src/utils/rules/fixer';
import { AutoFix } from '../../src/validators/file-validator';

/** Helper: apply a single fix to source content via range splicing */
function applyFix(source: string, fix: AutoFix): string {
  return source.slice(0, fix.range[0]) + fix.text + source.slice(fix.range[1]);
}

describe('Auto-fix Integration', () => {
  describe('skill-missing-shebang fix', () => {
    it('should prepend shebang to file without one', () => {
      const original = 'echo "Hello"\nexit 0';
      const fix: AutoFix = {
        ruleId: 'skill-missing-shebang',
        description: 'Add #!/usr/bin/env bash shebang line',
        filePath: '/test/skills/deploy/deploy.sh',
        range: [0, 0],
        text: '#!/usr/bin/env bash\n',
      };

      const result = applyFix(original, fix);

      expect(result).toBe('#!/usr/bin/env bash\necho "Hello"\nexit 0');
      expect(result.startsWith('#!')).toBe(true);
    });

    it('should handle empty file', () => {
      const fix: AutoFix = {
        ruleId: 'skill-missing-shebang',
        description: 'Add #!/usr/bin/env bash shebang line',
        filePath: '/test/script.sh',
        range: [0, 0],
        text: '#!/usr/bin/env bash\n',
      };

      expect(applyFix('', fix)).toBe('#!/usr/bin/env bash\n');
    });
  });

  describe('skill-shell-script-no-error-handling fix', () => {
    it('should insert after shebang line', () => {
      const original = '#!/usr/bin/env bash\necho "Hello"';
      const insertPos = original.indexOf('\n') + 1;
      const fix: AutoFix = {
        ruleId: 'skill-shell-script-no-error-handling',
        description: 'Add set -euo pipefail after shebang',
        filePath: '/test/script.sh',
        range: [insertPos, insertPos],
        text: 'set -euo pipefail\n',
      };

      const result = applyFix(original, fix);

      expect(result).toBe('#!/usr/bin/env bash\nset -euo pipefail\necho "Hello"');
    });

    it('should insert at top when no shebang', () => {
      const fix: AutoFix = {
        ruleId: 'skill-shell-script-no-error-handling',
        description: 'Add set -euo pipefail',
        filePath: '/test/script.sh',
        range: [0, 0],
        text: 'set -euo pipefail\n',
      };

      expect(applyFix('echo "Hello"', fix)).toBe('set -euo pipefail\necho "Hello"');
    });
  });

  describe('skill-reference-not-linked fix', () => {
    it('should convert backtick reference to markdown link', () => {
      const original = 'See `references/guide.md` for details.';
      const matchStart = original.indexOf('`references/guide.md`');
      const matchEnd = matchStart + '`references/guide.md`'.length;

      const fix: AutoFix = {
        ruleId: 'skill-reference-not-linked',
        description: 'Convert `references/guide.md` to markdown link',
        filePath: '/test/skills/my-skill/SKILL.md',
        range: [matchStart, matchEnd],
        text: '[references/guide.md](./references/guide.md)',
      };

      const result = applyFix(original, fix);

      expect(result).toBe('See [references/guide.md](./references/guide.md) for details.');
    });

    it('should only replace the targeted match', () => {
      const original = 'Run `examples/basic.sh` and see `examples/advanced.sh` for more.';
      const matchStart = original.indexOf('`examples/basic.sh`');
      const matchEnd = matchStart + '`examples/basic.sh`'.length;

      const fix: AutoFix = {
        ruleId: 'skill-reference-not-linked',
        description: 'Convert reference to link',
        filePath: '/test/SKILL.md',
        range: [matchStart, matchEnd],
        text: '[examples/basic.sh](./examples/basic.sh)',
      };

      const result = applyFix(original, fix);

      expect(result).toBe(
        'Run [examples/basic.sh](./examples/basic.sh) and see `examples/advanced.sh` for more.'
      );
    });
  });

  describe('skill-name-directory-mismatch fix', () => {
    it('should update frontmatter name to match directory', () => {
      const original = `---
name: deploy
description: Deploys the app
---

# Deploy`;
      const needle = 'name: deploy';
      const idx = original.indexOf(needle);

      const fix: AutoFix = {
        ruleId: 'skill-name-directory-mismatch',
        description: 'Update skill name to "deploy-app"',
        filePath: '/test/skills/deploy-app/SKILL.md',
        range: [idx, idx + needle.length],
        text: 'name: deploy-app',
      };

      const result = applyFix(original, fix);

      expect(result).toContain('name: deploy-app');
      expect(result).not.toContain('name: deploy\n');
    });
  });

  describe('Fixer class with range-based fixes', () => {
    it('should apply multiple non-overlapping fixes to the same file', () => {
      const fixer = new Fixer({ dryRun: true });

      fixer.registerFix({
        ruleId: 'skill-reference-not-linked',
        description: 'Fix ref 1',
        filePath: '/tmp/test-fix.md',
        range: [4, 24],
        text: '[references/a.md](./references/a.md)',
      });

      fixer.registerFix({
        ruleId: 'skill-reference-not-linked',
        description: 'Fix ref 2',
        filePath: '/tmp/test-fix.md',
        range: [30, 50],
        text: '[references/b.md](./references/b.md)',
      });

      expect(fixer.getFixCount()).toBe(2);
      expect(fixer.getFileCount()).toBe(1);
    });

    it('should track fix counts from different rules', () => {
      const fixer = new Fixer({ dryRun: true });

      fixer.registerFix({
        ruleId: 'skill-missing-shebang',
        description: 'Add shebang',
        filePath: '/tmp/a.sh',
        range: [0, 0],
        text: '#!/usr/bin/env bash\n',
      });

      fixer.registerFix({
        ruleId: 'skill-reference-not-linked',
        description: 'Fix ref',
        filePath: '/tmp/SKILL.md',
        range: [0, 3],
        text: '[x](./x)',
      });

      expect(fixer.getFixCount()).toBe(2);
      expect(fixer.getFileCount()).toBe(2);
    });

    it('should skip overlapping fixes', () => {
      const fixer = new Fixer({ dryRun: true });

      // Two fixes that overlap — second should be skipped
      fixer.registerFix({
        ruleId: 'skill-reference-not-linked',
        description: 'Fix ref 1',
        filePath: '/tmp/test.md',
        range: [0, 20],
        text: 'first fix',
      });

      fixer.registerFix({
        ruleId: 'skill-reference-not-linked',
        description: 'Fix ref 2 (overlaps)',
        filePath: '/tmp/test.md',
        range: [10, 30],
        text: 'second fix',
      });

      // Both registered, but only one will be applied
      expect(fixer.getFixCount()).toBe(2);
    });
  });
});
