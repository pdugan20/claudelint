/**
 * Tests for skill-dangerous-command rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-dangerous-command';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-dangerous-command', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-dangerous-command', rule, {
      valid: [
        // Safe shell script
        {
          content: '#!/bin/bash\nrm -rf /tmp/safe-dir\necho "Done"',
          filePath: '/test/script.sh',
        },

        // Safe Python script
        {
          content: 'import os\nos.remove("file.txt")',
          filePath: '/test/script.py',
        },

        // Not a script file
        {
          content: 'Documentation about rm -rf /',
          filePath: '/test/README.md',
        },

        // Safe dd command
        {
          content: '#!/bin/bash\ndd if=/dev/zero of=test.img bs=1M count=10',
          filePath: '/test/script.sh',
        },
      ],

      invalid: [
        // Dangerous: rm -rf /
        {
          content: '#!/bin/bash\nrm -rf / --no-preserve-root',
          filePath: '/test/dangerous.sh',
          errors: [
            {
              message: 'Dangerous command detected',
            },
          ],
        },

        // Dangerous: fork bomb
        {
          content: '#!/bin/bash\n:(){ :|:& };:',
          filePath: '/test/forkbomb.sh',
          errors: [
            {
              message: 'Dangerous command detected',
            },
          ],
        },

        // Dangerous: dd to disk
        {
          content: '#!/bin/bash\ndd if=/dev/zero of=/dev/sda',
          filePath: '/test/wipe.sh',
          errors: [
            {
              message: 'Dangerous command detected',
            },
          ],
        },

        // Dangerous: mkfs (pattern requires lowercase letters only after dot)
        {
          content: '#!/bin/bash\nmkfs.ext /dev/sda',
          filePath: '/test/format.sh',
          errors: [
            {
              message: 'Dangerous command detected',
            },
          ],
        },

        // Dangerous: write to raw disk
        {
          content: '#!/bin/bash\necho "data" > /dev/sda',
          filePath: '/test/write.sh',
          errors: [
            {
              message: 'Dangerous command detected',
            },
          ],
        },
      ],
    });
  });
});
