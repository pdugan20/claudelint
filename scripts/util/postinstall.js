#!/usr/bin/env node

// Don't show postinstall message in CI environments
if (process.env.CI || process.env.CONTINUOUS_INTEGRATION) {
  process.exit(0);
}

const chalk = require('chalk').default;

console.log('');
console.log(chalk.green('✓') + ' claude-code-lint installed!');
console.log('');
console.log(chalk.bold('To enable interactive skills in Claude Code:'));
console.log('');
console.log('  Load the plugin with:');
console.log(chalk.cyan('    claude --plugin-dir ./node_modules/claude-code-lint'));
console.log('');
console.log('  Or see full options:');
console.log(chalk.cyan('    npx claudelint install-plugin'));
console.log('');
