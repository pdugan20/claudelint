#!/usr/bin/env bash
#
# Install claudelint package in test workspace
#
# Usage: install-in-workspace.sh <workspace-path> <package-tgz>

set -e

WORKSPACE=$1
PACKAGE_TGZ=$2

if [ -z "$WORKSPACE" ] || [ -z "$PACKAGE_TGZ" ]; then
  echo "ERROR: Missing required arguments"
  echo "Usage: $0 <workspace-path> <package-tgz>"
  exit 1
fi

if [ ! -d "$WORKSPACE" ]; then
  echo "ERROR: Workspace not found: $WORKSPACE"
  exit 1
fi

if [ ! -f "$PACKAGE_TGZ" ]; then
  echo "ERROR: Package not found: $PACKAGE_TGZ"
  exit 1
fi

cd "$WORKSPACE"

# Install dependencies (if package.json has any)
if [ -f "package.json" ]; then
  echo "Installing fixture dependencies..."
  npm install --silent
fi

# Install claudelint from .tgz
echo "Installing claudelint from package..."
npm install --save-dev "$PACKAGE_TGZ" --silent

# Verify installation
if ! npm list claude-code-lint > /dev/null 2>&1; then
  echo "ERROR: claudelint installation verification failed"
  exit 1
fi

# Create plugin.json
echo "Creating plugin.json..."
cat > plugin.json <<'EOF'
{
  "name": "claudelint",
  "version": "1.0.0",
  "plugins": ["claude-code-lint"]
}
EOF

echo "Installation complete!"
echo "  Workspace: $WORKSPACE"
echo "  Package: $(basename $PACKAGE_TGZ)"
