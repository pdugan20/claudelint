#!/bin/bash

# Setup git hooks for claudelint development

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"

echo "Setting up git hooks for claudelint..."

# Create pre-commit hook (fast checks only)
cat > "$HOOKS_DIR/pre-commit" << 'HOOK_EOF'
#!/bin/bash

echo "Running pre-commit checks..."

# Run lint-staged (ESLint + Prettier + Markdownlint on staged files only)
echo "1/4 Running lint-staged (linting and formatting staged files)..."
npx lint-staged
if [ $? -ne 0 ]; then
  echo "Lint-staged failed. Please fix the errors and try again."
  exit 1
fi

# Run emoji checker (fast, checks all files)
echo "2/4 Checking for emojis..."
npm run check:emojis
if [ $? -ne 0 ]; then
  echo "Emojis found in code. Please remove them before committing."
  exit 1
fi

# Run build (verify TypeScript compiles)
echo "3/4 Building project..."
npm run build
if [ $? -ne 0 ]; then
  echo "Build failed. Please fix TypeScript errors before committing."
  exit 1
fi

# Run markdownlint on all markdown (quick)
echo "4/4 Linting all markdown files..."
npm run lint:md
if [ $? -ne 0 ]; then
  echo "Markdownlint failed. Run 'npm run lint:md:fix' to auto-fix."
  exit 1
fi

echo "All pre-commit checks passed!"
exit 0
HOOK_EOF

chmod +x "$HOOKS_DIR/pre-commit"

# Create pre-push hook (expensive checks)
cat > "$HOOKS_DIR/pre-push" << 'HOOK_EOF'
#!/bin/bash

echo "Running pre-push checks..."

# Run full test suite
echo "1/2 Running full test suite..."
npm test
if [ $? -ne 0 ]; then
  echo "Tests failed. Please fix failing tests before pushing."
  exit 1
fi

# Run claudelint validation (dogfooding)
echo "2/2 Validating Claude Code configuration..."
npm run validate
if [ $? -ne 0 ]; then
  echo "claudelint validation failed. Please fix validation errors before pushing."
  exit 1
fi

echo "All pre-push checks passed!"
exit 0
HOOK_EOF

chmod +x "$HOOKS_DIR/pre-push"

# Create commit-msg hook (commitlint)
cat > "$HOOKS_DIR/commit-msg" << 'HOOK_EOF'
#!/bin/bash

# Run commitlint on the commit message
npx --no-install commitlint --edit "$1"
HOOK_EOF

chmod +x "$HOOKS_DIR/commit-msg"

echo ""
echo "Git hooks installed successfully!"
echo ""
echo "Pre-commit hook (fast checks before each commit):"
echo "  - lint-staged (ESLint + Prettier + Markdownlint on staged files)"
echo "  - Emoji checker"
echo "  - Build verification"
echo "  - Markdownlint (all files)"
echo ""
echo "Pre-push hook (thorough checks before pushing):"
echo "  - Full test suite"
echo "  - claudelint validation (dogfooding)"
echo ""
echo "Commit-msg hook:"
echo "  - Conventional commit format validation"
echo ""
echo "To skip hooks (not recommended): git commit --no-verify"
