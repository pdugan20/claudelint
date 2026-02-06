/**
 * Integration tests for auto-fix functionality
 *
 * Tests that rules produce correct autoFix callbacks
 * and that the Fixer class applies them correctly.
 */

import { Fixer } from '../../src/utils/rules/fixer';
import { AutoFix } from '../../src/validators/file-validator';

describe('Auto-fix Integration', () => {
  describe('skill-missing-shebang fix', () => {
    it('should prepend shebang to file without one', () => {
      const fix: AutoFix = {
        ruleId: 'skill-missing-shebang',
        description: 'Add #!/usr/bin/env bash shebang line',
        filePath: '/test/skills/deploy/deploy.sh',
        apply: (content) => `#!/usr/bin/env bash\n${content}`,
      };

      const original = 'echo "Hello"\nexit 0';
      const result = fix.apply(original);

      expect(result).toBe('#!/usr/bin/env bash\necho "Hello"\nexit 0');
      expect(result.startsWith('#!')).toBe(true);
    });

    it('should handle empty file', () => {
      const fix: AutoFix = {
        ruleId: 'skill-missing-shebang',
        description: 'Add #!/usr/bin/env bash shebang line',
        filePath: '/test/script.sh',
        apply: (content) => `#!/usr/bin/env bash\n${content}`,
      };

      expect(fix.apply('')).toBe('#!/usr/bin/env bash\n');
    });
  });

  describe('skill-reference-not-linked fix', () => {
    it('should convert backtick reference to markdown link', () => {
      const referencedPath = 'references/guide.md';
      const fullMatch = '`references/guide.md`';
      const fix: AutoFix = {
        ruleId: 'skill-reference-not-linked',
        description: `Convert \`${referencedPath}\` to markdown link`,
        filePath: '/test/skills/my-skill/SKILL.md',
        apply: (content) => content.replace(fullMatch, `[${referencedPath}](./${referencedPath})`),
      };

      const original = 'See `references/guide.md` for details.';
      const result = fix.apply(original);

      expect(result).toBe('See [references/guide.md](./references/guide.md) for details.');
    });

    it('should only replace exact match', () => {
      const fix: AutoFix = {
        ruleId: 'skill-reference-not-linked',
        description: 'Convert reference to link',
        filePath: '/test/SKILL.md',
        apply: (content) =>
          content.replace(
            '`examples/basic.sh`',
            '[examples/basic.sh](./examples/basic.sh)'
          ),
      };

      const original =
        'Run `examples/basic.sh` and see `examples/advanced.sh` for more.';
      const result = fix.apply(original);

      expect(result).toBe(
        'Run [examples/basic.sh](./examples/basic.sh) and see `examples/advanced.sh` for more.'
      );
    });
  });

  describe('skill-name-directory-mismatch fix', () => {
    it('should update frontmatter name to match directory', () => {
      const fix: AutoFix = {
        ruleId: 'skill-name-directory-mismatch',
        description: 'Update skill name to "deploy-app"',
        filePath: '/test/skills/deploy-app/SKILL.md',
        apply: (content) => content.replace('name: deploy', 'name: deploy-app'),
      };

      const original = `---
name: deploy
description: Deploys the app
---

# Deploy`;
      const result = fix.apply(original);

      expect(result).toContain('name: deploy-app');
      expect(result).not.toContain('name: deploy\n');
    });
  });

  describe('Fixer class with auto-fixes', () => {
    it('should apply multiple fixes to the same file', () => {
      const fixer = new Fixer({ dryRun: true });

      const fix1: AutoFix = {
        ruleId: 'skill-reference-not-linked',
        description: 'Fix ref 1',
        filePath: '/tmp/test-fix.md',
        apply: (content) =>
          content.replace('`references/a.md`', '[references/a.md](./references/a.md)'),
      };

      const fix2: AutoFix = {
        ruleId: 'skill-reference-not-linked',
        description: 'Fix ref 2',
        filePath: '/tmp/test-fix.md',
        apply: (content) =>
          content.replace('`references/b.md`', '[references/b.md](./references/b.md)'),
      };

      fixer.registerFix(fix1);
      fixer.registerFix(fix2);

      expect(fixer.getFixCount()).toBe(2);
      expect(fixer.getFileCount()).toBe(1);
    });

    it('should track fix counts from different rules', () => {
      const fixer = new Fixer({ dryRun: true });

      fixer.registerFix({
        ruleId: 'skill-missing-shebang',
        description: 'Add shebang',
        filePath: '/tmp/a.sh',
        apply: (content) => `#!/usr/bin/env bash\n${content}`,
      });

      fixer.registerFix({
        ruleId: 'skill-reference-not-linked',
        description: 'Fix ref',
        filePath: '/tmp/SKILL.md',
        apply: (content) => content.replace('`x`', '[x](./x)'),
      });

      expect(fixer.getFixCount()).toBe(2);
      expect(fixer.getFileCount()).toBe(2);
    });
  });
});
