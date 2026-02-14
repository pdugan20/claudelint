/**
 * Tests for skill-shell-script-no-error-handling rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-shell-script-no-error-handling';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-shell-script-no-error-handling', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-shell-script-no-error-handling', rule, {
      valid: [
        // set -e
        {
          content: '#!/bin/bash\nset -e\necho "hello"',
          filePath: '/test/skills/my-skill/run.sh',
        },
        // set -euo pipefail
        {
          content: '#!/bin/bash\nset -euo pipefail\necho "hello"',
          filePath: '/test/skills/my-skill/run.sh',
        },
        // set -o pipefail with set -e on separate line
        {
          content: '#!/bin/bash\nset -e\nset -o pipefail\necho "hello"',
          filePath: '/test/skills/my-skill/run.sh',
        },
        // trap ERR
        {
          content: '#!/bin/bash\ntrap "echo error" ERR\necho "hello"',
          filePath: '/test/skills/my-skill/run.sh',
        },
        // Non-shell file (skipped)
        {
          content: 'echo "no error handling"',
          filePath: '/test/skills/my-skill/SKILL.md',
        },
        // .bash extension
        {
          content: '#!/bin/bash\nset -e\necho "hello"',
          filePath: '/test/skills/my-skill/run.bash',
        },
      ],

      invalid: [
        // No error handling at all
        {
          content: '#!/bin/bash\necho "hello"\nexit 0',
          filePath: '/test/skills/my-skill/run.sh',
          errors: [{ message: 'Missing error handling in' }],
        },
        // Only has shebang, no error handling
        {
          content: '#!/usr/bin/env bash\nnpm test\nnpm build',
          filePath: '/test/skills/my-skill/run.sh',
          errors: [{ message: 'Missing error handling in' }],
        },
        // .bash extension without error handling
        {
          content: '#!/bin/bash\necho "no protection"',
          filePath: '/test/skills/my-skill/run.bash',
          errors: [{ message: 'Missing error handling in' }],
        },
      ],
    });
  });
});
