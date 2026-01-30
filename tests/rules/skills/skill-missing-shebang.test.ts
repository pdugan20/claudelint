/**
 * Tests for skill-missing-shebang rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-missing-shebang';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-missing-shebang', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-missing-shebang', rule, {
      valid: [
        // Has shebang
        {
          content: '#!/bin/bash\necho "Hello World"',
          filePath: '/test/script.sh',
        },

        // Has env shebang
        {
          content: '#!/usr/bin/env bash\necho "Hello World"',
          filePath: '/test/script.sh',
        },

        // Not a shell script
        {
          content: 'import os\nprint("Hello")',
          filePath: '/test/script.py',
        },

        // Markdown file
        {
          content: '# README\n\nSome content',
          filePath: '/test/README.md',
        },
      ],

      invalid: [
        // Missing shebang
        {
          content: 'echo "Hello World"\nls -la',
          filePath: '/test/script.sh',
          errors: [
            {
              message: 'lacks shebang line',
            },
          ],
        },

        // Empty file
        {
          content: '',
          filePath: '/test/empty.sh',
          errors: [
            {
              message: 'lacks shebang line',
            },
          ],
        },

        // Starts with comment instead of shebang
        {
          content: '# This is a comment\necho "Hello"',
          filePath: '/test/script.sh',
          errors: [
            {
              message: 'lacks shebang line',
            },
          ],
        },
      ],
    });
  });
});
