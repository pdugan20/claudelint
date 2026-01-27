# Plugin and Custom Rule Systems: Research Report

This document provides comprehensive research on how popular linting tools implement plugin and custom rule systems.

## Table of Contents

- [ESLint](#eslint)
- [markdownlint](#markdownlint)
- [SwiftLint](#swiftlint)
- [Prettier](#prettier)
- [Stylelint](#stylelint)
- [Comparison Summary](#comparison-summary)

## ESLint

### Architecture Overview

ESLint's plugin system is built around a modular architecture where the Linter class verifies code based on configuration options. The main `verify()` method parses source text using espree (or a configured parser) to retrieve an AST, then uses estraverse to traverse the AST, emitting events at each node that match the node type name.

### Plugin Discovery and Loading

#### Package Naming Conventions

- **Unscoped packages**: Must begin with `eslint-plugin-` (e.g., `eslint-plugin-example`)
- **Scoped packages**: Follow the format `@<scope>/eslint-plugin-<name>` (e.g., `@jquery/eslint-plugin`)

#### Loading Methods (Flat Config - Modern Approach)

Flat config files represent plugins as JavaScript objects, allowing direct imports:

````javascript
// eslint.config.js
import example from "eslint-plugin-example";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    plugins: {
      example,
    },
    rules: {
      "example/rule1": "warn",
    },
  },
]);
```text
#### Loading Multiple Plugins

```javascript
import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tailwind from "eslint-plugin-tailwindcss";
import reactPlugin from "eslint-plugin-react";
import eslintPluginImportX from "eslint-plugin-import-x";

export default defineConfig({
  files: ["**/*.js"],
  plugins: { js, tailwind },
  extends: [
    "js/recommended",
    "tailwind/flat/recommended",
    reactPlugin.configs.flat.recommended,
    eslintPluginImportX.flatConfigs.recommended,
  ]
});
```text
#### Loading Local Plugins

```javascript
import local from "./my-local-plugin.js";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    plugins: {
      local,
    },
    rules: {
      "local/rule1": "warn",
    },
  },
]);
```text
#### Runtime/Inline Plugins

For custom rules without publishing to npm:

```javascript
import myrule from "./custom-rules/myrule.js";

export default [
  {
    files: ["**/*.js"],
    plugins: {
      custom: {
        rules: {
          myrule
        }
      }
    },
    rules: {
      "custom/myrule": "error"
    }
  }
];
```text
### Plugin Structure

ESLint plugins are JavaScript objects exporting these properties:

- **`meta`**: Plugin identification and metadata
- **`configs`**: Named configuration bundles
- **`rules`**: Custom rule definitions
- **`processors`**: Text processing utilities

#### Plugin Metadata (Recommended)

```javascript
export default {
  meta: {
    name: "eslint-plugin-example",
    version: "1.0.0",
    namespace: "example"
  },
  rules: {
    // rule definitions
  },
  configs: {
    // config definitions
  }
};
```text
The `meta.namespace` determines how users reference the plugin (typically the text after `eslint-plugin-`).

### Rule API/Interface

#### Rule Object Structure

```javascript
export default {
  meta: {
    type: "problem",  // or "suggestion", "layout"
    docs: {
      description: "Disallow use of foo",
      url: "https://example.com/rules/no-foo"
    },
    fixable: "code",  // or "whitespace", or omit
    hasSuggestions: true,
    schema: [
      {
        type: "object",
        properties: {
          exceptRange: {
            type: "boolean"
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      avoidName: "Avoid using variables named '{{ name }}'"
    }
  },

  create(context) {
    return {
      Identifier(node) {
        if (node.name === "foo") {
          context.report({
            node: node,
            messageId: "avoidName",
            data: {
              name: node.name
            }
          });
        }
      }
    };
  }
};
```text
#### Context Object API

The `create()` function receives a `context` argument with:

**Properties:**

- `id`: The rule identifier
- `filename`: Associated source filename
- `options`: Array of configured rule options
- `sourceCode`: Object for accessing source code details
- `settings`: Shared configuration settings
- `languageOptions`: Parser configuration details

**Methods:**

- `report(descriptor)`: Reports violations

#### Reporting Violations

```javascript
context.report({
  node: node,
  messageId: "avoidName",
  data: { name: "foo" },
  fix(fixer) {
    return fixer.replaceText(node, "bar");
  },
  suggest: [
    {
      messageId: "useBar",
      fix(fixer) {
        return fixer.replaceText(node, "bar");
      }
    }
  ]
});
```text
**Violation descriptor properties:**

- `messageId`: References entry in `meta.messages` object
- `message`: Alternative direct message string
- `data`: Object providing placeholder values
- `fix(fixer)`: Function applying automatic corrections
- `suggest`: Array of manual fix suggestions

#### Fixer API

```javascript
fixer.insertTextAfter(node, " // comment")
fixer.insertTextBefore(node, "/* comment */ ")
fixer.remove(node)
fixer.replaceText(node, "replacement")
fixer.removeRange([start, end])
fixer.replaceTextRange([start, end], "replacement")
```text
### package.json Structure

```json
{
  "name": "eslint-plugin-example",
  "version": "1.0.0",
  "description": "ESLint plugin for example rules",
  "main": "index.js",
  "type": "module",
  "keywords": [
    "eslint",
    "eslintplugin",
    "eslint-plugin"
  ],
  "peerDependencies": {
    "eslint": ">=8.0.0"
  },
  "devDependencies": {
    "eslint": "^8.0.0"
  }
}
```text
Key points:

- Use `peerDependencies` with `>=` syntax for minimum ESLint version
- Include ESLint in `devDependencies` for testing
- Use keywords for npm discoverability

## markdownlint

### Architecture Overview

markdownlint uses a parser-based architecture where custom rules can operate with different parsers: micromark (modern, preferred), markdown-it (legacy), or none (direct text operation).

### Plugin Discovery and Loading

#### Package Naming Conventions

- Use npm keyword: `markdownlint-rule`
- Common naming pattern: `markdownlint-rule-{name}` (e.g., `markdownlint-rule-titlecase`)
- Can also use scoped packages: `@scope/markdownlint-rule`

#### Discovery Methods

1. **NPM keyword search**: Search npm for packages tagged with `markdownlint-rule`
2. **Container image**: `davidanson/markdownlint-cli2-rules` includes latest custom rules
3. **Direct import**: Import from npm package or local file

#### Loading Custom Rules

```javascript
const markdownlint = require("markdownlint");
const customRules = require("markdownlint-rule-titlecase");

const options = {
  files: ["*.md"],
  customRules: [customRules]
};

markdownlint(options, function callback(err, result) {
  if (!err && !result.toString()) {
    console.log("All good!");
  }
});
```text
#### Configuration File

```json
{
  "customRules": [
    "markdownlint-rule-titlecase",
    "./local-rules/my-rule.js"
  ],
  "config": {
    "MD001": true,
    "titlecase": {
      "style": "Chicago"
    }
  }
}
```text
### Rule API/Interface

#### Rule Object Structure

```javascript
module.exports = {
  names: ["custom-rule-name", "CR001"],
  description: "Rule description",
  information: new URL("https://example.com/rules/custom-rule"),
  tags: ["headings", "spaces"],
  parser: "micromark",  // or "markdownit", "none"
  asynchronous: false,  // true if returns Promise

  function: function rule(params, onError) {
    // Rule implementation
  }
};
```text
#### Required Properties

- **`names`**: Array of strings identifying the rule
- **`description`**: String describing the rule's purpose
- **`tags`**: Array of strings grouping related rules
- **`parser`**: String specifying parser type
- **`function`**: Implementation function

#### Optional Properties

- **`information`**: Absolute URL to documentation
- **`asynchronous`**: Boolean for Promise-returning rules

#### Function Signature

```javascript
function(params, onError) {
  // params.name - input file/string identifier
  // params.lines - array of line strings
  // params.frontMatterLines - front matter lines
  // params.config - rule configuration
  // params.version - markdownlint version
  // params.parsers.micromark.tokens - micromark tokens
  // params.parsers.markdownit.tokens - markdown-it tokens
}
```text
#### Reporting Violations

```javascript
onError({
  lineNumber: 5,                    // Required: 1-based line number
  detail: "Expected title case",    // Optional: explanation
  context: "### this is wrong",     // Optional: surrounding text
  information: new URL("..."),      // Optional: override rule info
  range: [1, 10],                   // Optional: [column, length]
  fixInfo: {                        // Optional: auto-fix info
    lineNumber: 5,
    editColumn: 1,
    deleteCount: 10,
    insertText: "### This Is Right"
  }
});
```text
#### Parser-Specific Implementation

**Micromark (Modern):**

```javascript
module.exports = {
  names: ["custom-blockquote"],
  description: "Disallow blockquotes",
  tags: ["blocks"],
  parser: "micromark",

  function: (params, onError) => {
    params.parsers.micromark.tokens
      .filter(t => t.type === "blockQuote")
      .forEach(bq => {
        onError({
          lineNumber: bq.startLine,
          detail: `Blockquote spans ${bq.endLine - bq.startLine + 1} lines`,
          context: params.lines[bq.startLine - 1]
        });
      });
  }
};
```text
**Markdown-it (Legacy):**

```javascript
module.exports = {
  names: ["custom-heading"],
  description: "Check heading format",
  tags: ["headings"],
  parser: "markdownit",

  function: (params, onError) => {
    params.parsers.markdownit.tokens
      .filter(t => t.type === "heading_open")
      .forEach(heading => {
        const [startLine, endLine] = heading.map;
        onError({
          lineNumber: startLine + 1,
          detail: "Heading issue"
        });
      });
  }
};
```text
**None (Direct Text):**

```javascript
module.exports = {
  names: ["no-tabs"],
  description: "Disallow tabs",
  tags: ["whitespace"],
  parser: "none",

  function: (params, onError) => {
    params.lines.forEach((line, index) => {
      if (line.includes("\t")) {
        onError({
          lineNumber: index + 1,
          detail: "Tabs not allowed"
        });
      }
    });
  }
};
```text
#### Asynchronous Rules

```javascript
module.exports = {
  names: ["async-rule"],
  description: "Async rule example",
  tags: ["test"],
  parser: "micromark",
  asynchronous: true,

  function: async (params, onError) => {
    const data = await fetch("https://api.example.com/data");
    // Process data and report errors
  }
};
```text
### Helper Functions

The `markdownlint-rule-helpers` package provides utility functions:

```javascript
const helpers = require("markdownlint-rule-helpers");

// Available helpers:
// - addError
// - addErrorContext
// - addErrorDetailIf
// - forEachHeading
// - forEachLine
// - getLineMetadata
// - includesSorted
// - isBlankLine
// etc.
```text
### package.json Structure

```json
{
  "name": "markdownlint-rule-example",
  "version": "1.0.0",
  "description": "Example markdownlint custom rule",
  "main": "index.js",
  "keywords": [
    "markdownlint",
    "markdownlint-rule"
  ],
  "peerDependencies": {
    "markdownlint": ">=0.25.0"
  },
  "devDependencies": {
    "markdownlint": "^0.32.0"
  },
  "dependencies": {
    "markdownlint-rule-helpers": "^0.17.0"
  }
}
```text
## SwiftLint

### Architecture Overview

SwiftLint supports two types of custom rules:

1. **Regex-based rules**: Defined in YAML configuration files (simpler, no compilation needed)
2. **Swift-based rules**: Leverage SwiftSyntax for AST access (more powerful, requires Bazel build)

### Plugin Discovery and Loading

SwiftLint automatically loads configuration from:

- `.swiftlint.yml` in project root
- Per-package `.swiftlint.yml` files for Swift packages
- Can specify custom config path via CLI

No npm-style plugin discovery - all custom rules are configuration-based or require compiling into SwiftLint.

### Configuration File

```yaml
# .swiftlint.yml
disabled_rules:
  - trailing_whitespace

opt_in_rules:
  - empty_count
  - missing_docs

included:
  - Source

excluded:
  - Carthage
  - Pods

custom_rules:
  rule_name:
    name: "Rule Name"
    regex: "pattern"
    match_kinds:
      - comment
      - identifier
    message: "Violation message"
    severity: warning
```text
### Custom Rule Structure (Regex-Based)

#### Complete Rule Syntax

```yaml
custom_rules:
  no_magic_numbers:
    name: "No Magic Numbers"
    regex: '(return |case |\w\(|: |\?\? |\, |== |<=? |>=? |\+= |\-= |\/= |\*= |%= |\w\.\w+ = )\(*-?\d{2,}'
    match_kinds:
      - argument
      - attribute.builtin
      - attribute.id
      - buildconfig.id
      - buildconfig.keyword
      - comment
      - comment.mark
      - comment.url
      - doccomment
      - doccomment.field
      - identifier
      - keyword
      - number
      - objectliteral
      - parameter
      - placeholder
      - string
      - string_interpolation_anchor
      - typeidentifier
    message: "Numbers smell; define a constant instead."
    severity: warning
    included: ".*\\.swift"
    excluded: ".*Test\\.swift"
```text
#### Available Properties

- **`name`** (optional): Human-readable rule name
- **`regex`** (required): Regular expression pattern
- **`match_kinds`** (optional): Array of syntax kinds to match against
- **`message`** (required): Violation message
- **`severity`** (optional): `warning` (default) or `error`
- **`included`** (optional): Regex pattern for files to include
- **`excluded`** (optional): Regex pattern for files to exclude
- **`capture_group`** (optional): Regex capture group number to highlight (default: 0)

#### Severity Levels

```yaml
custom_rules:
  warning_example:
    regex: "pattern"
    message: "This is a warning"
    severity: warning

  error_example:
    regex: "pattern"
    message: "This is an error"
    severity: error
```text
### Real-World Examples

#### Auto-Generated Code Detection

```yaml
custom_rules:
  auto_generated_leftovers:
    name: "Auto-generated Leftovers"
    regex: 'func [^\n]*\{\n(\s*super\.[^\n]*\n(\s*\/\/[^\n]*\n)*|(\s*\/\/[^\n]*\n)+)\s*\}'
    message: "Delete auto-generated functions that you don't use"
    severity: warning
```text
#### Hardcoded String Detection

```yaml
custom_rules:
  hardcoded_strings:
    name: "Hardcoded Strings"
    regex: '(?<!NSLocalized)String\s*\(\s*"[^"]+"'
    message: "Use NSLocalizedString for user-facing text"
    severity: warning
    excluded: ".*Tests?\\.swift"
```text
#### Import Restrictions (Architectural Rules)

```yaml
custom_rules:
  no_foundation_in_swiftui:
    name: "No Foundation in SwiftUI"
    regex: "import Foundation"
    message: "SwiftUI views should not import Foundation directly"
    severity: error
    included: ".*Views/.*\\.swift"
```text
#### Comment Quality

```yaml
custom_rules:
  todo_requires_ticket:
    name: "TODO Requires Ticket"
    regex: "TODO(?!.*JIRA-\\d+)"
    match_kinds:
      - comment
    message: "TODO comments must reference a JIRA ticket"
    severity: warning
```text
### Swift-Based Custom Rules

For more complex rules requiring AST analysis, you can create Swift-based rules:

```swift
import SwiftLintCore
import SwiftSyntax

struct MyCustomRule: SwiftSyntaxRule, ConfigurationProviderRule {
    var configuration = SeverityConfiguration<Self>(.warning)

    static let description = RuleDescription(
        identifier: "my_custom_rule",
        name: "My Custom Rule",
        description: "Description of what the rule does",
        kind: .lint,
        nonTriggeringExamples: [
            Example("let x = 1")
        ],
        triggeringExamples: [
            Example("let ↓foo = 1")
        ]
    )

    func makeVisitor(file: SwiftLintFile) -> ViolationsSyntaxVisitor<ConfigurationType> {
        Visitor(configuration: configuration)
    }
}

private extension MyCustomRule {
    final class Visitor: ViolationsSyntaxVisitor<ConfigurationType> {
        override func visitPost(_ node: VariableDeclSyntax) {
            // Rule logic here
            if node.bindings.contains(where: { $0.pattern.description.contains("foo") }) {
                violations.append(node.positionAfterSkippingLeadingTrivia)
            }
        }
    }
}
```text
However, Swift-based rules require building SwiftLint from source with Bazel, which is more complex than regex-based rules.

### Execution Modes

```yaml
# Use SwiftSyntax for better performance (default)
custom_rules:
  my_rule:
    regex: "pattern"
    message: "Message"

# Force SourceKit mode for specific rule
custom_rules:
  my_rule:
    regex: "pattern"
    message: "Message"
    execution_mode: sourcekit

# Set default execution mode globally
default_execution_mode: sourcekit
```text
### Per-Package Configuration

For multi-package projects:

```text
MyProject/
├── .swiftlint.yml          # Root config
├── Sources/
│   ├── App/
│   │   └── .swiftlint.yml  # App-specific rules
│   └── Core/
│       └── .swiftlint.yml  # Core-specific rules
```text
Each package can have custom rules that only apply to that package.

## Prettier

### Architecture Overview

Prettier's plugin architecture is built around parsers and printers:

- **Parsers**: Convert code strings to Abstract Syntax Trees (ASTs)
- **Printers**: Convert ASTs to Prettier's Doc format for formatting

All of Prettier's language implementations are expressed using the plugin API.

### Plugin Discovery and Loading

#### Package Naming Conventions

- **Official plugins**: `@prettier/plugin-{language}` (e.g., `@prettier/plugin-php`)
- **Community plugins**: `prettier-plugin-{language}` (e.g., `prettier-plugin-rust`)

#### Loading Methods

**CLI:**

```bash
prettier --plugin=prettier-plugin-foo --write .
```text
**API:**

```javascript
import prettier from "prettier";

const formatted = await prettier.format(code, {
  parser: "foo",
  plugins: ["prettier-plugin-foo"]
});
```text
**Configuration File (.prettierrc.json):**

```json
{
  "plugins": ["prettier-plugin-foo", "./local-plugin.js"],
  "overrides": [
    {
      "files": "*.foo",
      "options": {
        "parser": "foo"
      }
    }
  ]
}
```text
Strings are resolved using Node's `import()`, supporting:

- NPM package names
- Relative file paths
- Absolute file paths

### Plugin Structure

```javascript
export default {
  languages: [
    {
      name: "Foo",
      parsers: ["foo"],
      extensions: [".foo"],
      filenames: ["Foofile"],
      vscodeLanguageIds: ["foo"]
    }
  ],

  parsers: {
    foo: {
      parse(text, options) {
        // Return AST
      },
      astFormat: "foo-ast",
      locStart(node) { return node.start; },
      locEnd(node) { return node.end; }
    }
  },

  printers: {
    "foo-ast": {
      print(path, options, print) {
        // Return Doc
      }
    }
  },

  options: {
    fooOption: {
      type: "boolean",
      default: false,
      description: "Enable foo feature"
    }
  },

  defaultOptions: {
    tabWidth: 2
  }
};
```text
### Language Definition

```javascript
languages: [
  {
    name: "JavaScript",              // Required: Human-readable name
    parsers: ["babel", "espree"],    // Required: Parser names
    extensions: [".js", ".jsx"],     // File extensions
    filenames: [],                   // Specific filenames
    vscodeLanguageIds: ["javascript"], // VS Code integration
    interpreters: ["node"],          // Script interpreters
    linguistLanguageId: 183,        // GitHub Linguist ID
    aceMode: "javascript",          // Ace Editor mode
    codemirrorMode: "javascript",   // CodeMirror mode
    codemirrorMimeType: "text/javascript",
    tmScope: "source.js"            // TextMate scope
  }
]
```text
### Parser API

```javascript
parsers: {
  "my-parser": {
    // Required: Parse source code to AST
    parse(text, options) {
      // Can be sync or async
      return {
        type: "Program",
        body: []
      };
    },

    // Required: AST format identifier
    astFormat: "my-ast",

    // Required: Get node start position
    locStart(node) {
      return node.start;
    },

    // Required: Get node end position
    locEnd(node) {
      return node.end;
    },

    // Optional: Check for @prettier or @format pragma
    hasPragma(text) {
      return /^\s*\/\*\*?\s*@(prettier|format)\s*\*\//.test(text);
    },

    // Optional: Preprocess text before parsing
    preprocess(text, options) {
      return text.replace(/\r\n/g, '\n');
    }
  }
}
```text
### Printer API

```javascript
printers: {
  "my-ast": {
    // Required: Convert AST node to Doc
    print(path, options, print) {
      const node = path.node;

      switch (node.type) {
        case "Program":
          return [
            path.map(print, "body"),
            hardline
          ];
        case "Identifier":
          return node.name;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }
    },

    // Optional: Embed other languages
    embed(path, options) {
      const node = path.node;

      if (node.type === "TemplateLiteral" && node.tag === "css") {
        return async (textToDoc) => {
          const formatted = await textToDoc(node.value, {
            parser: "css"
          });
          return ["`", formatted, "`"];
        };
      }
    },

    // Optional: Preprocess AST before printing
    preprocess(ast, options) {
      return ast;
    },

    // Optional: Insert @format pragma
    insertPragma(text) {
      return `/** @format */\n${text}`;
    },

    // Optional: Optimize AST traversal
    getVisitorKeys(node, nonTraversableKeys) {
      return Object.keys(node).filter(
        key => !nonTraversableKeys.has(key)
      );
    }
  }
}
```text
### Doc Builders

Prettier provides builder functions for creating Doc objects:

```javascript
import {
  concat,
  join,
  line,
  softline,
  hardline,
  literalline,
  group,
  indent,
  align,
  dedent,
  ifBreak,
  breakParent
} from "prettier/doc";

// Example usage in print function
print(path, options, print) {
  return group([
    "function(",
    indent([
      softline,
      join([",", line], path.map(print, "params"))
    ]),
    softline,
    ")"
  ]);
}
```text
### Comment Handling

```javascript
printers: {
  "my-ast": {
    // Determine if comment can attach to node
    canAttachComment(node) {
      return node.type !== "Comment";
    },

    // Print individual comment
    printComment(commentPath, options) {
      const comment = commentPath.node;
      return comment.value;
    },

    // Custom comment attachment logic
    handleComments: {
      ownLine(comment, text, options) {
        // Handle comments on their own line
      },
      endOfLine(comment, text, options) {
        // Handle end-of-line comments
      },
      remaining(comment, text, options) {
        // Handle remaining comments
      }
    }
  }
}
```text
### Options API

```javascript
options: {
  myOption: {
    type: "boolean",           // or "int", "string", "choice", "path"
    category: "Format",
    default: false,
    description: "Enable my feature",
    since: "1.0.0",

    // For choice type:
    choices: [
      { value: "a", description: "Option A" },
      { value: "b", description: "Option B" }
    ]
  },

  anotherOption: {
    type: "int",
    category: "Global",
    default: 2,
    range: { start: 0, end: 8, step: 2 }
  }
}
```text
### package.json Structure

```json
{
  "name": "prettier-plugin-foo",
  "version": "1.0.0",
  "description": "Prettier plugin for Foo language",
  "type": "module",
  "main": "index.js",
  "exports": {
    ".": "./index.js"
  },
  "keywords": [
    "prettier",
    "prettier-plugin",
    "foo",
    "formatter"
  ],
  "peerDependencies": {
    "prettier": ">=3.0.0"
  },
  "peerDependenciesMeta": {
    "prettier": {
      "optional": false
    }
  },
  "devDependencies": {
    "prettier": "^3.0.0"
  }
}
```text
### Complete Example: Simple Plugin

```javascript
// prettier-plugin-uppercase.js
export default {
  languages: [
    {
      name: "Uppercase",
      parsers: ["uppercase"],
      extensions: [".upper"]
    }
  ],

  parsers: {
    uppercase: {
      parse(text) {
        return { type: "root", value: text };
      },
      astFormat: "uppercase-ast",
      locStart: () => 0,
      locEnd: node => node.value.length
    }
  },

  printers: {
    "uppercase-ast": {
      print(path) {
        return path.node.value.toUpperCase();
      }
    }
  }
};
```text
## Stylelint

### Architecture Overview

Stylelint plugins extend functionality by providing custom rules built on PostCSS. Rules walk the PostCSS AST to find and report violations.

### Plugin Discovery and Loading

#### Package Naming Conventions

- Plugin packages should use the `stylelint-plugin` keyword in package.json
- Common naming: `stylelint-{feature}` or scoped `@scope/stylelint-{feature}`
- Rule names must be namespaced: `namespace/rule-name`

#### Loading Methods

**Configuration File (.stylelintrc.json):**

```json
{
  "plugins": [
    "stylelint-order",
    "./local-plugins/my-plugin.js"
  ],
  "rules": {
    "order/properties-alphabetical-order": true,
    "my-namespace/my-rule": [true, { "severity": "warning" }]
  }
}
```text
**JavaScript Configuration:**

```javascript
export default {
  plugins: [
    "stylelint-order",
    "./local-plugin.js"
  ],
  rules: {
    "order/properties-order": ["height", "width"]
  }
};
```text
### Plugin Structure

```javascript
import stylelint from "stylelint";

const { createPlugin, utils } = stylelint;
const { ruleMessages, validateOptions, report } = utils;

const ruleName = "my-namespace/my-rule";
const messages = ruleMessages(ruleName, {
  expected: (unfixed, fixed) => `Expected "${unfixed}" to be "${fixed}"`
});

const meta = {
  url: "https://github.com/example/stylelint-plugin/blob/main/docs/my-rule.md"
};

const ruleFunction = (primary, secondary, context) => {
  return (root, result) => {
    const validOptions = validateOptions(result, ruleName, {
      actual: primary,
      possible: [true, false]
    });

    if (!validOptions) return;

    root.walkRules((ruleNode) => {
      // Rule logic here
      if (shouldReport(ruleNode)) {
        report({
          message: messages.expected("foo", "bar"),
          node: ruleNode,
          result,
          ruleName
        });
      }
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
```text
### Rule API/Interface

#### Rule Function Signature

```javascript
const ruleFunction = (primaryOption, secondaryOptions, context) => {
  // primaryOption: Main configuration value (boolean, string, array, etc.)
  // secondaryOptions: Object with additional options
  // context: Object with { fix: boolean, newline: string }

  return (root, result) => {
    // root: PostCSS Root AST
    // result: PostCSS LazyResult

    // Validate options
    const validOptions = validateOptions(result, ruleName, {
      actual: primaryOption,
      possible: [true, false]
    });

    if (!validOptions) return;

    // Walk AST and report violations
  };
};
```text
#### Validating Options

```javascript
validateOptions(result, ruleName, {
  actual: primary,
  possible: [true, false]
}, {
  actual: secondary,
  possible: {
    severity: ["warning", "error"],
    ignore: ["custom-properties", "keyframes"]
  },
  optional: true
});
```text
#### Reporting Violations

```javascript
report({
  message: messages.expected("foo"),
  messageArgs: ["foo", "bar"],
  node: ruleNode,              // PostCSS node
  index: 5,                    // Optional: Character index
  endIndex: 10,                // Optional: End character index
  word: "foo",                 // Optional: Word that caused violation
  line: 3,                     // Optional: Override line number
  result,
  ruleName
});
```text
### PostCSS AST Walkers

```javascript
// Walk all nodes
root.walk((node) => {
  // node.type: root, atrule, rule, decl, comment
});

// Walk specific node types
root.walkRules((rule) => {
  // rule.selector, rule.nodes
});

root.walkDecls((decl) => {
  // decl.prop, decl.value
});

root.walkAtRules((atRule) => {
  // atRule.name, atRule.params
});

root.walkComments((comment) => {
  // comment.text
});
```text
### Advanced Features

#### Auto-fixing

```javascript
const ruleFunction = (primary, secondary, context) => {
  return (root, result) => {
    // ... validation ...

    root.walkDecls((decl) => {
      if (needsFix(decl) && context.fix) {
        decl.value = fixValue(decl.value);
      } else if (needsFix(decl)) {
        report({ /* ... */ });
      }
    });
  };
};
```text
#### Async Rules

```javascript
const ruleFunction = (primary) => {
  return async (root, result) => {
    const data = await fetchSomeData();

    root.walkRules((rule) => {
      if (violatesRule(rule, data)) {
        report({ /* ... */ });
      }
    });
  };
};
```text
#### Plugin Packs (Multiple Rules)

```javascript
import rule1 from "./rules/rule1.js";
import rule2 from "./rules/rule2.js";

export default [
  rule1,
  rule2
];
```text
#### Primary Option Arrays

```javascript
const ruleFunction = (primary) => {
  return (root, result) => {
    // primary is an array
    validateOptions(result, ruleName, {
      actual: primary,
      possible: [isString]
    });
  };
};

ruleFunction.primaryOptionArray = true;
```text
#### Checking Against Other Rules

```javascript
import { utils } from "stylelint";

const ruleFunction = (primary) => {
  return async (root, result) => {
    await utils.checkAgainstRule(
      {
        ruleName: "color-hex-length",
        ruleSettings: "short",
        root
      },
      (warning) => {
        // Process warnings from color-hex-length rule
      }
    );
  };
};
```text
### Complete Example

```javascript
import stylelint from "stylelint";
import { isRegExp, isString } from "./utils.js";

const { createPlugin, utils } = stylelint;
const { ruleMessages, validateOptions, report } = utils;

const ruleName = "foo-org/no-vendor-prefixes";
const messages = ruleMessages(ruleName, {
  rejected: (prefix) => `Unexpected vendor prefix "${prefix}"`
});

const meta = {
  url: "https://github.com/foo-org/stylelint-plugin/blob/main/docs/no-vendor-prefixes.md"
};

const ruleFunction = (primary, secondary = {}) => {
  return (root, result) => {
    const validOptions = validateOptions(
      result,
      ruleName,
      {
        actual: primary,
        possible: [true]
      },
      {
        actual: secondary,
        possible: {
          ignoreProperties: [isString, isRegExp]
        },
        optional: true
      }
    );

    if (!validOptions) return;

    const ignoreProperties = secondary.ignoreProperties || [];

    root.walkDecls((decl) => {
      const prop = decl.prop;

      // Check if property should be ignored
      if (ignoreProperties.some(pattern => {
        if (isRegExp(pattern)) return pattern.test(prop);
        return pattern === prop;
      })) {
        return;
      }

      // Check for vendor prefixes
      const vendorPrefixes = ["-webkit-", "-moz-", "-ms-", "-o-"];
      const prefix = vendorPrefixes.find(p => prop.startsWith(p));

      if (prefix) {
        report({
          message: messages.rejected(prefix),
          node: decl,
          word: prefix,
          result,
          ruleName
        });
      }
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
```text
### package.json Structure

```json
{
  "name": "stylelint-my-plugin",
  "version": "1.0.0",
  "description": "Custom Stylelint plugin",
  "main": "index.js",
  "type": "module",
  "keywords": [
    "stylelint",
    "stylelint-plugin",
    "css",
    "lint"
  ],
  "peerDependencies": {
    "stylelint": "^16.0.0"
  },
  "devDependencies": {
    "stylelint": "^16.0.0"
  },
  "engines": {
    "node": "^18.12 || >=20.9"
  }
}
```text
Key points:

- Use `stylelint-plugin` keyword
- Declare Stylelint version in `peerDependencies`
- Include compatible Node.js versions in `engines`

## Comparison Summary

### Discovery Mechanisms

| Tool | Discovery Method | Naming Convention | Keywords |
|------|-----------------|-------------------|----------|
| ESLint | npm import, local file | `eslint-plugin-*` or `@scope/eslint-plugin-*` | `eslint`, `eslintplugin`, `eslint-plugin` |
| markdownlint | npm keyword, direct import | `markdownlint-rule-*` | `markdownlint-rule` |
| SwiftLint | Configuration file only | N/A (config-based) | N/A |
| Prettier | npm import, local file | `prettier-plugin-*` or `@prettier/plugin-*` | `prettier`, `prettier-plugin` |
| Stylelint | npm import, local file | `stylelint-*` or `stylelint-plugin-*` | `stylelint`, `stylelint-plugin` |

### Registration Approach

| Tool | Registration Method |
|------|-------------------|
| ESLint | Import and add to `plugins` object in config |
| markdownlint | Add to `customRules` array in options/config |
| SwiftLint | Define in `custom_rules` section of YAML |
| Prettier | Add to `plugins` array in config or CLI |
| Stylelint | Add to `plugins` array in config |

### Rule Implementation Complexity

| Tool | Complexity | AST Access | Auto-fix Support |
|------|-----------|------------|------------------|
| ESLint | Medium | Full (via visitors) | Yes (fixer API) |
| markdownlint | Low-Medium | Parser-dependent | Yes (fixInfo) |
| SwiftLint | Low (regex) / High (Swift) | Limited (regex) / Full (Swift) | No |
| Prettier | High | Full (parser + printer) | Yes (by design) |
| Stylelint | Medium | Full (PostCSS) | Yes (context.fix) |

### Package Structure Requirements

All tools share common package.json requirements:

- Declare linter as peer dependency
- Use appropriate keywords for discovery
- Follow naming conventions
- Include metadata (description, repository, etc.)

### Configuration Syntax

**ESLint (Flat Config):**

```javascript
export default [
  {
    plugins: { example },
    rules: {
      "example/rule": "error"
    }
  }
];
```text
**markdownlint:**

```json
{
  "customRules": ["markdownlint-rule-*"],
  "config": {
    "custom-rule": true
  }
}
```text
**SwiftLint:**

```yaml
custom_rules:
  rule_name:
    regex: "pattern"
    message: "Message"
```text
**Prettier:**

```json
{
  "plugins": ["prettier-plugin-*"]
}
```text
**Stylelint:**

```json
{
  "plugins": ["stylelint-*"],
  "rules": {
    "namespace/rule": true
  }
}
```text
### Key Architectural Patterns

1. **ESLint**: Event-driven AST traversal with visitor pattern
2. **markdownlint**: Parser-based with three modes (micromark, markdown-it, none)
3. **SwiftLint**: Dual approach (regex for simplicity, Swift for power)
4. **Prettier**: Parser + Printer architecture with Doc builders
5. **Stylelint**: PostCSS walker pattern with utility functions

### Best Practices Across All Tools

1. **Namespace rules** to avoid conflicts
2. **Use peer dependencies** for the main linter
3. **Provide clear error messages** with context
4. **Include documentation URLs** in rule metadata
5. **Support auto-fixing** where possible
6. **Validate options** before processing
7. **Use appropriate keywords** for npm discovery
8. **Follow naming conventions** for package names

## Sources

- [ESLint Custom Rule Tutorial](https://eslint.org/docs/latest/extend/custom-rule-tutorial)
- [ESLint Custom Rules](https://eslint.org/docs/latest/extend/custom-rules)
- [ESLint Create Plugins](https://eslint.org/docs/latest/extend/plugins)
- [ESLint Architecture](https://eslint.org/docs/latest/contribute/architecture/)
- [ESLint Configuration Migration Guide](https://eslint.org/docs/latest/use/configure/migration-guide)
- [ESLint Plugin Migration to Flat Config](https://eslint.org/docs/latest/extend/plugin-migration-flat-config)
- [ESLint Configuration Files](https://eslint.org/docs/latest/use/configure/configuration-files)
- [markdownlint Custom Rules](https://github.com/DavidAnson/markdownlint/blob/main/doc/CustomRules.md)
- [markdownlint GitHub Repository](https://github.com/DavidAnson/markdownlint)
- [markdownlint-rule-helpers](https://www.npmjs.com/package/markdownlint-rule-helpers)
- [SwiftLint GitHub Repository](https://github.com/realm/SwiftLint)
- [SwiftLint custom_rules Reference](https://realm.github.io/SwiftLint/custom_rules.html)
- [Useful Custom Rules for SwiftLint](https://ootips.org/yonat/useful-custom-rules-for-swiftlint/)
- [Custom SwiftLint Rules (Medium)](https://verbalraj.medium.com/custom-swiftlint-rules-ios-33c0dc780a26)
- [Prettier Plugins](https://prettier.io/docs/plugins)
- [How to Write a Prettier Plugin](https://medium.com/@fvictorio/how-to-write-a-plugin-for-prettier-a0d98c845e70)
- [Stylelint Writing Plugins](https://stylelint.io/developer-guide/plugins/)
- [Stylelint Configuring](https://stylelint.io/user-guide/configure/)
- [Stylelint Awesome List](https://github.com/stylelint/awesome-stylelint)
````
