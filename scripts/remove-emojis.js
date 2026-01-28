#!/usr/bin/env node

/**
 * Remove all emojis from markdown files
 */

const fs = require('fs');
const path = require('path');
const emojiRegex = require('emoji-regex');

const IGNORE_DIRS = ['node_modules', 'dist', 'coverage', '.git'];
const DOC_EXTENSIONS = ['.md'];

let filesModified = 0;

function removeEmojisFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const regex = emojiRegex();
  let modified = false;

  const newLines = lines.map((line) => {
    // Remove emojis from this line
    const newLine = line.replace(regex, '');
    if (newLine !== line) {
      modified = true;
    }
    return newLine;
  });

  if (modified) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf-8');
    filesModified++;
    console.log(`Cleaned: ${filePath}`);
  }
}

function walkDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.includes(entry.name)) {
        walkDirectory(fullPath);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (DOC_EXTENSIONS.includes(ext)) {
        removeEmojisFromFile(fullPath);
      }
    }
  }
}

console.log('Removing emojis from documentation files...\n');

if (fs.existsSync('docs')) {
  walkDirectory('docs');
}
if (fs.existsSync('README.md')) {
  removeEmojisFromFile('README.md');
}

console.log(`\n${filesModified} files modified.`);
