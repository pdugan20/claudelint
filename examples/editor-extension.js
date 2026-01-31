/**
 * ClaudeLint Editor Extension Integration Example
 *
 * This example demonstrates patterns for integrating ClaudeLint
 * into editor extensions for VS Code, Sublime Text, Atom, etc.
 *
 * Key concepts:
 * - Linting on document open/save
 * - Real-time diagnostics
 * - Quick fixes and code actions
 * - Performance optimization with caching
 */

const { ClaudeLint } = require('claudelint');

/**
 * Language Server Pattern
 * Suitable for LSP-based editor integrations
 */
class ClaudeLintLanguageServer {
  constructor() {
    // Create linter instance with caching for performance
    this.linter = new ClaudeLint({
      cache: true,
      cacheLocation: '.claudelint-cache',
      cwd: process.cwd(),
    });

    // Cache for quick lookups
    this.documentCache = new Map();
  }

  /**
   * Validate a document and return diagnostics
   * Called when document opens or changes
   */
  async validateDocument(uri, text) {
    console.log(`Validating document: ${uri}`);

    try {
      const results = await this.linter.lintText(text, {
        filePath: uri,
      });

      if (results.length === 0) {
        return [];
      }

      const result = results[0];

      // Convert lint messages to editor diagnostics
      const diagnostics = result.messages.map(msg => ({
        // Diagnostic range (convert to 0-based for editors)
        range: {
          start: {
            line: (msg.line || 1) - 1,
            character: (msg.column || 1) - 1,
          },
          end: {
            line: (msg.endLine || msg.line || 1) - 1,
            character: (msg.endColumn || msg.column || 1) - 1,
          },
        },

        // Severity (1=Error, 2=Warning, 3=Info, 4=Hint)
        severity: msg.severity === 'error' ? 1 : 2,

        // Message details
        message: msg.message,
        source: 'claudelint',
        code: msg.ruleId,

        // Additional metadata
        data: {
          explanation: msg.explanation,
          howToFix: msg.howToFix,
          hasFix: !!msg.fix,
          fix: msg.fix,
        },
      }));

      // Cache results
      this.documentCache.set(uri, {
        diagnostics,
        timestamp: Date.now(),
        result,
      });

      return diagnostics;
    } catch (error) {
      console.error(`Error validating ${uri}:`, error.message);
      return [];
    }
  }

  /**
   * Get code actions (quick fixes) for a diagnostic
   */
  getCodeActions(uri, diagnostic) {
    const cached = this.documentCache.get(uri);
    if (!cached) return [];

    const actions = [];

    // Auto-fix action
    if (diagnostic.data?.hasFix) {
      actions.push({
        title: `Fix: ${diagnostic.message}`,
        kind: 'quickfix',
        diagnostics: [diagnostic],
        edit: {
          changes: {
            [uri]: [{
              range: {
                start: { line: 0, character: diagnostic.data.fix.range[0] },
                end: { line: 0, character: diagnostic.data.fix.range[1] },
              },
              newText: diagnostic.data.fix.text,
            }],
          },
        },
      });
    }

    // Disable rule action
    if (diagnostic.code) {
      actions.push({
        title: `Disable ${diagnostic.code} for this line`,
        kind: 'quickfix',
        edit: {
          changes: {
            [uri]: [{
              range: {
                start: { line: diagnostic.range.start.line, character: 0 },
                end: { line: diagnostic.range.start.line, character: 0 },
              },
              newText: `<!-- claudelint-disable-next-line ${diagnostic.code} -->\n`,
            }],
          },
        },
      });
    }

    return actions;
  }

  /**
   * Clear diagnostics for a document
   */
  clearDocument(uri) {
    this.documentCache.delete(uri);
  }
}

/**
 * VS Code Extension Pattern
 */
class VSCodeExtension {
  constructor() {
    this.linter = new ClaudeLint({
      cwd: process.cwd(),
    });

    this.diagnosticCollection = new Map();
  }

  /**
   * Activate extension
   */
  activate(context) {
    console.log('ClaudeLint extension activated');

    // Register commands
    this.registerCommands(context);

    // Set up document listeners
    this.setupDocumentListeners(context);

    // Validate all open documents
    this.validateOpenDocuments();
  }

  /**
   * Register VS Code commands
   */
  registerCommands(context) {
    const commands = {
      // Validate current file
      'claudelint.validateFile': () => this.validateActiveDocument(),

      // Validate workspace
      'claudelint.validateWorkspace': () => this.validateWorkspace(),

      // Fix all auto-fixable issues
      'claudelint.fixAll': () => this.fixAllIssues(),

      // Clear diagnostics
      'claudelint.clearDiagnostics': () => this.clearAllDiagnostics(),
    };

    for (const [command, handler] of Object.entries(commands)) {
      context.subscriptions.push(
        { dispose: () => console.log(`Unregistered ${command}`) }
      );
    }
  }

  /**
   * Set up document event listeners
   */
  setupDocumentListeners(context) {
    // Validate on document open
    console.log('Setting up onDidOpenTextDocument listener');

    // Validate on document save
    console.log('Setting up onDidSaveTextDocument listener');

    // Optionally validate on document change (with debouncing)
    let changeTimeout;
    console.log('Setting up onDidChangeTextDocument listener with debounce');
  }

  /**
   * Validate the active document
   */
  async validateActiveDocument() {
    console.log('Validating active document...');

    const document = { uri: 'example.md', text: '# Test\n\nContent' };

    try {
      const results = await this.linter.lintText(document.text, {
        filePath: document.uri,
      });

      if (results.length === 0) return;

      const diagnostics = results[0].messages.map(msg => ({
        range: {
          start: { line: (msg.line || 1) - 1, character: 0 },
          end: { line: (msg.line || 1) - 1, character: 100 },
        },
        severity: msg.severity === 'error' ? 'Error' : 'Warning',
        message: msg.message,
        source: 'claudelint',
        code: msg.ruleId,
      }));

      this.diagnosticCollection.set(document.uri, diagnostics);
      console.log(`Found ${diagnostics.length} issue(s)`);
    } catch (error) {
      console.error('Validation error:', error.message);
    }
  }

  /**
   * Validate all open documents
   */
  async validateOpenDocuments() {
    console.log('Validating all open documents...');
    // In real VS Code extension, iterate over workspace.textDocuments
  }

  /**
   * Validate entire workspace
   */
  async validateWorkspace() {
    console.log('Validating workspace...');

    try {
      const results = await this.linter.lintFiles([
        '**/*.md',
        '!node_modules/**',
      ]);

      // Update diagnostics for each file
      for (const result of results) {
        const diagnostics = result.messages.map(msg => ({
          range: {
            start: { line: (msg.line || 1) - 1, character: 0 },
            end: { line: (msg.line || 1) - 1, character: 100 },
          },
          severity: msg.severity === 'error' ? 'Error' : 'Warning',
          message: msg.message,
          source: 'claudelint',
        }));

        this.diagnosticCollection.set(result.filePath, diagnostics);
      }

      console.log(`Validated ${results.length} file(s)`);
    } catch (error) {
      console.error('Workspace validation error:', error.message);
    }
  }

  /**
   * Fix all auto-fixable issues in active document
   */
  async fixAllIssues() {
    console.log('Fixing all issues...');

    const document = { uri: 'example.md', text: '# Test\n\nContent' };

    const linterWithFix = new ClaudeLint({ fix: true });

    try {
      const results = await linterWithFix.lintText(document.text, {
        filePath: document.uri,
      });

      if (results.length === 0) return;

      const result = results[0];

      if (result.output && result.output !== result.source) {
        console.log('Applying fixes...');
        // In real extension: editor.edit(editBuilder => { ... })
        console.log(`Fixed content:\n${result.output}`);

        // Re-validate after fix
        await this.validateActiveDocument();
      } else {
        console.log('No auto-fixes available');
      }
    } catch (error) {
      console.error('Fix error:', error.message);
    }
  }

  /**
   * Clear all diagnostics
   */
  clearAllDiagnostics() {
    this.diagnosticCollection.clear();
    console.log('Cleared all diagnostics');
  }
}

/**
 * Sublime Text Plugin Pattern
 */
class SublimeTextPlugin {
  constructor() {
    this.linter = new ClaudeLint({
      cwd: process.cwd(),
    });
  }

  /**
   * Lint function called by Sublime Linter
   */
  async lint(code, filePath) {
    try {
      const results = await this.linter.lintText(code, { filePath });

      if (results.length === 0) return [];

      // Convert to Sublime Linter format
      return results[0].messages.map(msg => ({
        line: msg.line || 1,
        col: msg.column || 1,
        message: msg.message,
        type: msg.severity === 'error' ? 'error' : 'warning',
        code: msg.ruleId,
      }));
    } catch (error) {
      console.error('Linting error:', error.message);
      return [];
    }
  }
}

/**
 * Performance optimization: Debounced validation
 */
class DebouncedValidator {
  constructor(delay = 500) {
    this.linter = new ClaudeLint({
      cache: true,
      cwd: process.cwd(),
    });

    this.delay = delay;
    this.timeouts = new Map();
  }

  /**
   * Validate with debouncing
   */
  validateDebounced(uri, text, callback) {
    // Clear existing timeout
    if (this.timeouts.has(uri)) {
      clearTimeout(this.timeouts.get(uri));
    }

    // Set new timeout
    const timeout = setTimeout(async () => {
      try {
        const results = await this.linter.lintText(text, { filePath: uri });

        if (results.length > 0) {
          callback(null, results[0]);
        }
      } catch (error) {
        callback(error);
      } finally {
        this.timeouts.delete(uri);
      }
    }, this.delay);

    this.timeouts.set(uri, timeout);
  }

  /**
   * Cancel pending validation
   */
  cancel(uri) {
    if (this.timeouts.has(uri)) {
      clearTimeout(this.timeouts.get(uri));
      this.timeouts.delete(uri);
    }
  }
}

// Example usage demonstrations
async function demonstratePatterns() {
  console.log('=== ClaudeLint Editor Extension Patterns ===\n');

  // Language Server Pattern
  console.log('1. Language Server Pattern\n');
  const lsp = new ClaudeLintLanguageServer();
  const diagnostics = await lsp.validateDocument(
    'file:///test/CLAUDE.md',
    '# CLAUDE.md\n\nTest content'
  );
  console.log(`   Found ${diagnostics.length} diagnostic(s)`);

  if (diagnostics.length > 0) {
    const actions = lsp.getCodeActions('file:///test/CLAUDE.md', diagnostics[0]);
    console.log(`   Available code actions: ${actions.length}`);
  }

  // VS Code Extension Pattern
  console.log('\n2. VS Code Extension Pattern\n');
  const vscode = new VSCodeExtension();
  vscode.activate({ subscriptions: [] });
  await vscode.validateActiveDocument();

  // Sublime Text Pattern
  console.log('\n3. Sublime Text Plugin Pattern\n');
  const sublime = new SublimeTextPlugin();
  const sublimeResults = await sublime.lint('# Test\n\nContent', 'test.md');
  console.log(`   Sublime Linter results: ${sublimeResults.length} issue(s)`);

  // Debounced Validation
  console.log('\n4. Debounced Validation Pattern\n');
  const debounced = new DebouncedValidator(300);
  console.log('   Validating with 300ms debounce...');

  debounced.validateDebounced(
    'file:///test.md',
    '# Test',
    (error, result) => {
      if (error) {
        console.error('   Error:', error.message);
      } else {
        console.log('   Validation complete');
      }
    }
  );

  // Wait for debounced validation
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('\n✓ All patterns demonstrated');
}

// Configuration example for editor extensions
function showEditorConfig() {
  console.log('\n=== Editor Extension Configuration ===\n');

  const config = {
    // VS Code settings.json
    vscode: {
      'claudelint.enable': true,
      'claudelint.run': 'onSave',  // or 'onType'
      'claudelint.autoFix': true,
      'claudelint.configFile': '.claudelintrc.json',
    },

    // Sublime Text settings
    sublime: {
      'linters': {
        'claudelint': {
          'executable': 'claudelint',
          'args': ['--format', 'json'],
          'selector': 'text.html.markdown',
        },
      },
    },
  };

  console.log('VS Code settings.json:');
  console.log(JSON.stringify(config.vscode, null, 2));

  console.log('\nSublime Text settings:');
  console.log(JSON.stringify(config.sublime, null, 2));
}

// Main entry point
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--config')) {
    showEditorConfig();
  } else {
    await demonstratePatterns();
    showEditorConfig();
  }
}

// Run the example
main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
