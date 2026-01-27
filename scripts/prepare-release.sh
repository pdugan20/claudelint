#!/bin/bash

# Prepare a new release

set -e

if [ -z "$1" ]; then
  echo "Usage: ./scripts/prepare-release.sh <version>"
  echo "Example: ./scripts/prepare-release.sh 1.0.0"
  exit 1
fi

VERSION=$1
CURRENT_DATE=$(date +%Y-%m-%d)

echo "Preparing release v$VERSION..."

# Update version in package.json
echo "1/6 Updating version in package.json..."
npm version "$VERSION" --no-git-tag-version

# Update CHANGELOG.md
echo "2/6 Updating CHANGELOG.md..."
sed -i.bak "s/## \[Unreleased\]/## [Unreleased]\n\n## [$VERSION] - $CURRENT_DATE/" CHANGELOG.md
rm CHANGELOG.md.bak

# Update comparison links in CHANGELOG.md
echo "3/6 Updating version links in CHANGELOG.md..."
sed -i.bak "s|\[Unreleased\]:.*|[Unreleased]: https://github.com/pdugan20/claudelint/compare/v$VERSION...HEAD\n[$VERSION]: https://github.com/pdugan20/claudelint/releases/tag/v$VERSION|" CHANGELOG.md
rm CHANGELOG.md.bak

# Build
echo "4/6 Building..."
npm run build

# Run tests
echo "5/6 Running tests..."
npm test

# Run validation
echo "6/6 Running validation..."
npm run validate

echo ""
echo "✅ Release v$VERSION prepared successfully!"
echo ""
echo "Next steps:"
echo "  1. Review changes: git diff"
echo "  2. Commit: git add -A && git commit -m 'chore: release v$VERSION'"
echo "  3. Tag: git tag v$VERSION"
echo "  4. Push: git push && git push --tags"
echo ""
echo "The GitHub Actions workflow will automatically publish to npm."
