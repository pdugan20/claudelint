/**
 * Tests for skill-path-traversal rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-path-traversal';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-path-traversal', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-path-traversal', rule, {
      valid: [
        // Shell script without path traversal
        {
          content: '#!/bin/bash\ncp file.txt ./target/',
          filePath: '/test/script.sh',
        },

        // Python script without path traversal
        {
          content: 'import os\nprint("Hello")',
          filePath: '/test/script.py',
        },

        // Not a script file
        {
          content: 'Some markdown with ../ in text',
          filePath: '/test/README.md',
        },

        // Relative path without traversal
        {
          content: '#!/bin/bash\ncd ./subdir\nls',
          filePath: '/test/script.sh',
        },
      ],

      invalid: [
        // Shell script with ../ path traversal
        {
          content: '#!/bin/bash\ncd ../parent\nrm file.txt',
          filePath: '/test/script.sh',
          errors: [
            {
              message: 'Path traversal in',
            },
          ],
        },

        // Python script with ../ path traversal
        {
          content: 'import os\nos.remove("../../../etc/passwd")',
          filePath: '/test/script.py',
          errors: [
            {
              message: 'Path traversal in',
            },
          ],
        },

        // Windows-style path traversal
        {
          content: '#!/bin/bash\ncat ..\\..\\config.txt',
          filePath: '/test/script.sh',
          errors: [
            {
              message: 'Path traversal in',
            },
          ],
        },

        // JavaScript with path traversal
        {
          content: 'const fs = require("fs");\nfs.readFile("../../secrets.json")',
          filePath: '/test/script.js',
          errors: [
            {
              message: 'Path traversal in',
            },
          ],
        },

        // TypeScript with path traversal
        {
          content: 'import * as fs from "fs";\nconst data = fs.readFileSync("../config.ts")',
          filePath: '/test/script.ts',
          errors: [
            {
              message: 'Path traversal in',
            },
          ],
        },
      ],
    });
  });
});
