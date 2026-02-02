#!/usr/bin/env node

// Don't show postinstall message in CI environments
if (process.env.CI || process.env.CONTINUOUS_INTEGRATION) {
  process.exit(0);
}

const chalk = require('chalk');
const path = require('path');

console.log('');
console.log(chalk.green('✓') + ' claude-code-lint installed!');
console.log('');
console.log(chalk.bold('To enable interactive skills in Claude Code:'));
console.log('');
console.log('  Run this in your Claude Code session:');
console.log(chalk.cyan('    /plugin install --source ./node_modules/claude-code-lint'));
console.log('');
console.log('  Or use the setup helper:');
console.log(chalk.cyan('    npx claudelint install-plugin'));
console.log('');
