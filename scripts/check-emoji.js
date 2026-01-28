#!/usr/bin/env node

/**
 * Check for emojis in source files and documentation
 * Uses emoji-regex for proper Unicode emoji detection
 *
 * STRICT MODE: No emojis allowed anywhere
 */

const fs = require('fs');
const path = require('path');
const emojiRegex = require('emoji-regex');

const IGNORE_DIRS = ['node_modules', 'dist', 'coverage', '.git'];
const CODE_EXTENSIONS = ['.ts', '.js', '.tsx', '.jsx'];
const DOC_EXTENSIONS = ['.md'];

let foundEmojis = false;

function checkFile(filePath, isDoc = false) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const regex = emojiRegex();

  lines.forEach((line, index) => {
    const matches = line.match(regex);
    if (matches && matches.length > 0) {
      foundEmojis = true;
      console.error(`${filePath}:${index + 1}: Found emoji(s): ${matches.join(', ')}`);
    }
  });
}

function walkDirectory(dir, checkDocs = false) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.includes(entry.name)) {
        walkDirectory(fullPath, checkDocs);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);

      if (CODE_EXTENSIONS.includes(ext)) {
        checkFile(fullPath, false);
      } else if (checkDocs && DOC_EXTENSIONS.includes(ext)) {
        checkFile(fullPath, true);
      }
    }
  }
}

// Check source code
console.log('Checking source code for emojis...');
if (fs.existsSync('src')) {
  walkDirectory('src', false);
}

// Check documentation (strict mode - no emojis allowed)
console.log('Checking documentation (strict mode - no emojis allowed)...');
if (fs.existsSync('docs')) {
  walkDirectory('docs', true);
}
if (fs.existsSync('README.md')) {
  checkFile('README.md', true);
}

if (foundEmojis) {
  console.error('\nEmojis found in files. Please remove them.');
  console.error('No emojis are allowed in source code or documentation.');
  process.exit(1);
} else {
  console.log('No emojis found.');
  process.exit(0);
}
