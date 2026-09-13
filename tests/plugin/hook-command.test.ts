import { execFileSync } from 'child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

describe('SessionStart hook command', () => {
  it.each(['plain-plugin', 'plugin with spaces', 'Türkçe eklenti'])(
    'passes the complete script path for %s',
    (directory) => {
      const root = mkdtempSync(join(tmpdir(), 'claudelint-hook-'));
      try {
        const pluginRoot = join(root, directory);
        const scripts = join(pluginRoot, '.claude-plugin', 'scripts');
        mkdirSync(scripts, { recursive: true });
        // Test command wiring without running the dependency check or accessing npm.
        writeFileSync(
          join(scripts, 'check-dependency.js'),
          'process.stdout.write("hook-started");'
        );
        const config = JSON.parse(readFileSync(join(__dirname, '../../hooks/hooks.json'), 'utf8'));
        const command = config.hooks.SessionStart[0].hooks[0].command;
        const shell =
          process.platform === 'win32'
            ? process.env.CLAUDE_CODE_GIT_BASH_PATH || 'C:/Program Files/Git/bin/bash.exe'
            : '/bin/sh';
        const output = execFileSync(shell, ['-c', command], {
          encoding: 'utf8',
          timeout: 10000,
          env: { ...process.env, CLAUDE_PLUGIN_ROOT: pluginRoot.replace(/\\/g, '/') },
        });
        expect(output).toBe('hook-started');
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    }
  );
});
