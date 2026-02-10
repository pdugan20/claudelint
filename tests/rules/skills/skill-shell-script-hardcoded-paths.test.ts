/**
 * Tests for skill-shell-script-hardcoded-paths rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-shell-script-hardcoded-paths';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-shell-script-hardcoded-paths', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-shell-script-hardcoded-paths', rule, {
      valid: [
        // Relative paths (safe)
        {
          content: '#!/bin/bash\nset -e\ncd ./src && npm test',
          filePath: '/test/skills/my-skill/run.sh',
        },
        // Environment variable paths (safe)
        {
          content: '#!/bin/bash\nset -e\ncd "$HOME/projects"',
          filePath: '/test/skills/my-skill/run.sh',
        },
        // /dev/null (safe)
        {
          content: '#!/bin/bash\nset -e\ncommand > /dev/null 2>&1',
          filePath: '/test/skills/my-skill/run.sh',
        },
        // /tmp (safe)
        {
          content: '#!/bin/bash\nset -e\ntmpfile=/tmp/output.txt',
          filePath: '/test/skills/my-skill/run.sh',
        },
        // Shebang with /usr/bin/env (safe)
        {
          content: '#!/usr/bin/env bash\nset -e\necho "hello"',
          filePath: '/test/skills/my-skill/run.sh',
        },
        // Shebang with /bin/bash (safe)
        {
          content: '#!/bin/bash\nset -e\necho "hello"',
          filePath: '/test/skills/my-skill/run.sh',
        },
        // Comment with hardcoded path (safe)
        {
          content: '#!/bin/bash\nset -e\n# Install to /Users/user/bin\necho "hello"',
          filePath: '/test/skills/my-skill/run.sh',
        },
        // Non-shell file (skipped)
        {
          content: '/Users/pat/Documents/project',
          filePath: '/test/skills/my-skill/SKILL.md',
        },
      ],

      invalid: [
        // /Users/ path
        {
          content: '#!/bin/bash\nset -e\ncd /Users/pat/Documents/project',
          filePath: '/test/skills/my-skill/run.sh',
          errors: [{ message: 'Hardcoded path' }],
        },
        // /home/ path
        {
          content: '#!/bin/bash\nset -e\nsource /home/deploy/.bashrc',
          filePath: '/test/skills/my-skill/run.sh',
          errors: [{ message: 'Hardcoded path' }],
        },
        // /opt/ path
        {
          content: '#!/bin/bash\nset -e\n/opt/homebrew/bin/node script.js',
          filePath: '/test/skills/my-skill/run.sh',
          errors: [{ message: 'Hardcoded path' }],
        },
        // /usr/local/ path
        {
          content: '#!/bin/bash\nset -e\n/usr/local/bin/python3 script.py',
          filePath: '/test/skills/my-skill/run.sh',
          errors: [{ message: 'Hardcoded path' }],
        },
        // /var/ path
        {
          content: '#!/bin/bash\nset -e\ncat /var/log/app.log',
          filePath: '/test/skills/my-skill/run.sh',
          errors: [{ message: 'Hardcoded path' }],
        },
      ],
    });
  });
});
