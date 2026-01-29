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

// Check test files
console.log('Checking tests for emojis...');
if (fs.existsSync('tests')) {
  walkDirectory('tests', false);
}

// Check scripts directory
console.log('Checking scripts for emojis...');
if (fs.existsSync('scripts')) {
  walkDirectory('scripts', false);
}

// Check examples directory
console.log('Checking examples for emojis...');
if (fs.existsSync('examples')) {
  walkDirectory('examples', false);
}

// Check bin directory
console.log('Checking bin for emojis...');
if (fs.existsSync('bin')) {
  walkDirectory('bin', false);
}

// Check .github directory (workflows, templates)
console.log('Checking .github for emojis...');
if (fs.existsSync('.github')) {
  walkDirectory('.github', true);
}

// Check documentation (strict mode - no emojis allowed)
console.log('Checking documentation (strict mode - no emojis allowed)...');
if (fs.existsSync('docs')) {
  walkDirectory('docs', true);
}

// Check root markdown files
const rootMarkdownFiles = ['README.md', 'CHANGELOG.md', 'CONTRIBUTING.md', 'LICENSE.md'];
for (const file of rootMarkdownFiles) {
  if (fs.existsSync(file)) {
    checkFile(file, true);
  }
}

if (foundEmojis) {
  console.error('\nEmojis found in files. Please remove them.');
  console.error('No emojis are allowed in source code or documentation.');
  process.exit(1);
} else {
  console.log('No emojis found.');
  process.exit(0);
}
